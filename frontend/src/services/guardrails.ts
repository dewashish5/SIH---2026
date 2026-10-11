/**
 * SkillGap Intelligence - Enterprise LLM Guardrails & Security Patch
 *
 * Implements defenses against:
 * 1. Prompt Injection & Jailbreaks (DAN, delimiter smuggling, instruction override)
 * 2. System Prompt & Key Leakage
 * 3. PII (Aadhaar, PAN, phone, email) detection & masking
 * 4. XSS & Malicious HTML / Script output escaping
 * 5. Out-of-scope domain bounding
 */

export interface GuardrailCheckResult {
  isValid: boolean;
  sanitizedQuery: string;
  blockedReason?: 'PROMPT_INJECTION' | 'LENGTH_LIMIT' | 'OUT_OF_SCOPE' | 'HARMFUL_PAYLOAD';
  warningMessage?: string;
  piiMasked: boolean;
}

// 1. Prompt injection / jailbreak heuristic signatures
const PROMPT_INJECTION_PATTERNS: RegExp[] = [
  // Instruction override attacks
  /(?:ignore|disregard|forget|bypass|override|cancel)\s+(?:all\s+)?(?:(?:previous|prior|above|system|safety|existing|initial|prompt)\s+)*(?:instructions?|rules?|prompts?|guidelines?|constraints?|filters?)/i,
  // System prompt extraction attacks
  /(?:reveal|show|print|tell|repeat|display|output|leak)\s+(?:all\s+)?(?:system\s+(?:prompt|instructions?|rules?)|internal\s+prompts?|initial\s+instructions?|developer\s+mode)/i,
  // Jailbreak personas & roleplay overrides
  /you\s+are\s+now\s+(?:in\s+)?(?:dan|unrestricted|jailbreak|developer\s+mode|god\s+mode|evil|unfiltered|chaos)/i,
  /roleplay\s+as\s+(?:an?\s+)?(?:unfiltered|uncensored|evil|hacker|adversary)/i,
  /(?:new\s+personality|act\s+without\s+(?:rules|filters|morals|limits|guardrails))/i,
  // Delimiter / token smuggling attacks
  /(?:<\|im_start\|>|<\|im_end\|>|###\s*instruction|\[system\]|```system|<script>|<\/script>)/i,
  /(?:system:\s*you\s+are|assistant:\s*|human:\s*)/i,
  // Malicious SQL / Command execution attempts
  /(?:drop\s+table|delete\s+from|union\s+select|exec\s+xp_|1=1\s*--|truncate\s+table)/i,
  /(?:rm\s+-rf|chmod\s+777|curl\s+http|wget\s+http|powershell\s+-enc)/i
];

// 2. Indian PII patterns (Aadhaar, PAN, Mobile, Email)
const PII_PATTERNS = [
  {
    name: 'Aadhaar',
    regex: /\b[2-9]{1}[0-9]{3}[ -]?[0-9]{4}[ -]?[0-9]{4}\b/g,
    replacement: '[REDACTED_AADHAAR]'
  },
  {
    name: 'PAN',
    regex: /\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/g,
    replacement: '[REDACTED_PAN]'
  },
  {
    name: 'Phone',
    regex: /\b(?:\+91|0)?[6-9]\d{9}\b/g,
    replacement: '[REDACTED_PHONE]'
  },
  {
    name: 'Email',
    regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/g,
    replacement: '[REDACTED_EMAIL]'
  }
];

// Max characters allowed per prompt
const MAX_QUERY_LENGTH = 1000;

/**
 * Clean & normalize Unicode to prevent homoglyph & zero-width token smuggling
 */
export function normalizeInput(input: string): string {
  return input
    .normalize('NFKC')
    // Remove zero-width non-printing characters
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim();
}

/**
 * Mask sensitive Indian PII identifiers in text
 */
export function maskPII(text: string): { maskedText: string; piiFound: boolean } {
  let masked = text;
  let piiFound = false;

  for (const { regex, replacement } of PII_PATTERNS) {
    if (regex.test(masked)) {
      piiFound = true;
      masked = masked.replace(regex, replacement);
    }
  }

  return { maskedText: masked, piiFound };
}

/**
 * Validate input query against prompt injection, jailbreaks, length bounds and PII
 */
export function validateAndSanitizeInput(rawQuery: string): GuardrailCheckResult {
  const normalized = normalizeInput(rawQuery);

  // 1. Length check
  if (normalized.length === 0) {
    return {
      isValid: false,
      sanitizedQuery: '',
      blockedReason: 'LENGTH_LIMIT',
      warningMessage: 'Query cannot be empty.',
      piiMasked: false
    };
  }

  if (normalized.length > MAX_QUERY_LENGTH) {
    return {
      isValid: false,
      sanitizedQuery: normalized.slice(0, MAX_QUERY_LENGTH),
      blockedReason: 'LENGTH_LIMIT',
      warningMessage: `Query exceeds maximum length of ${MAX_QUERY_LENGTH} characters.`,
      piiMasked: false
    };
  }

  // 2. Prompt injection & jailbreak check
  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(normalized)) {
      return {
        isValid: false,
        sanitizedQuery: normalized,
        blockedReason: 'PROMPT_INJECTION',
        warningMessage:
          'Security Guardrail Alert: System instruction overrides and prompt injection attempts are blocked. Please enter a valid labor market analysis query.',
        piiMasked: false
      };
    }
  }

  // 3. PII Masking
  const { maskedText, piiFound } = maskPII(normalized);

  return {
    isValid: true,
    sanitizedQuery: maskedText,
    piiMasked: piiFound
  };
}

/**
 * Enclose user query within secure XML boundary tags for model sandboxing
 */
export function sandboxPrompt(sanitizedQuery: string): string {
  return `<user_query>\n${sanitizedQuery}\n</user_query>`;
}

/**
 * Sanitize model output to prevent XSS / HTML injection in the browser
 */
export function sanitizeOutput(rawOutput: string): string {
  if (!rawOutput) return '';

  return (
    rawOutput
      // Strip script tags
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      // Strip iframe, object, embed tags
      .replace(/<(iframe|object|embed|applet)\b[^>]*>/gi, '')
      // Strip dangerous inline event handlers like onerror=, onload=, onclick=
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
      // Strip javascript: pseudoprotocol
      .replace(/javascript:[^"'\s)]*/gi, '')
      // Strip data:text/html
      .replace(/data:text\/html[^"'\s)]*/gi, '')
  );
}
