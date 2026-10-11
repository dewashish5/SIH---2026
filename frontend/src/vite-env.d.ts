/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GATEWAY_URL?: string;
  readonly VITE_API_URL?: string;
  readonly GEMINI_API_KEY?: string;
  readonly VITE_GEMINI_API_KEY?: string;
  readonly GROQ_API_KEY?: string;
  readonly VITE_GROQ_API_KEY?: string;
  readonly WMSA_GEMINI_MODEL?: string;
  readonly WMSA_GROQ_MODEL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
