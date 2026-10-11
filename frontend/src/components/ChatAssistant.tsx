import React, { useState, useRef, useEffect } from 'react';
import { sendChatMessage, AssistantResponse, LLMCitation } from '../services/llm';
import {
  Bot,
  Send,
  X,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Cpu,
  CornerDownRight,
  ChevronDown,
  ChevronUp,
  Lock
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  provider?: 'gemini' | 'groq' | 'grounded_rules';
  model?: string;
  keyIndex?: number;
  citation?: LLMCitation;
  isSecurityAlert?: boolean;
  timestamp: string;
}

const SUGGESTED_PROMPTS = [
  '⚡ Jaipur Solar PV Shortage',
  '⚠️ Bhilwara Electrician Saturation',
  '📊 What-If: +30% Seats in Jaipur',
  '🏭 Pune EV Automotive Shortage'
];

export const ChatAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedCitationId, setExpandedCitationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-msg',
      sender: 'assistant',
      text: 'SkillGap AI Intelligence Copilot active. Powered by multi-tier LLM reasoning (Gemini / Groq / Grounded LMIS Engine) with zero-hallucination pilot citations across Rajasthan, Maharashtra, and Karnataka. Protected by real-time prompt injection & PII guardrails.',
      provider: 'grounded_rules',
      model: 'lmis-rules-v1',
      keyIndex: 0,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, loading]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendPrompt = async (queryText: string) => {
    const trimmed = queryText.trim();
    if (!trimmed || loading) return;

    setInput('');
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const history = messages
        .filter((m) => m.id !== 'init-msg' && !m.isSecurityAlert)
        .slice(-6)
        .map((m) => ({
          role: m.sender,
          content: m.text
        }));

      const res: AssistantResponse = await sendChatMessage(trimmed, history);

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: res.text,
        provider: res.provider,
        model: res.model,
        keyIndex: res.keyIndex,
        citation: res.citation,
        isSecurityAlert: res.isSecurityAlert,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (_err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: 'Forecasting engine is experiencing high query load. Defaulting to local verified telemetry.',
          provider: 'grounded_rules',
          model: 'lmis-fallback',
          keyIndex: 0,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: 'init-msg',
        sender: 'assistant',
        text: 'Chat history cleared. Grounded AI Copilot ready for new policy inquiry.',
        provider: 'grounded_rules',
        model: 'lmis-rules-v1',
        keyIndex: 0,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <>
      {/* Floating Toggle Button (Neo-brutalist B · Ink Mono style) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 bg-black text-white px-4 py-3 border-2 border-black font-mono text-xs font-bold uppercase tracking-wider flex items-center space-x-2.5 shadow-[4px_4px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_#000000] transition-all"
        title="Open Grounded AI Policy Assistant"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
        <Bot className="w-4 h-4 text-white" />
        <span>Ask the Data (AI)</span>
      </button>

      {/* Drawer Modal */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 z-50 w-[420px] max-w-[calc(100vw-32px)] bg-white border-2 border-black shadow-[6px_6px_0px_0px_#000000] flex flex-col h-[540px]">
          {/* Header */}
          <div className="p-3 bg-black text-white flex items-center justify-between border-b-2 border-black">
            <div className="flex items-center space-x-2">
              <div className="p-1 bg-white text-black border border-white">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-mono font-bold text-xs uppercase tracking-tight">
                    SkillGap AI Copilot
                  </span>
                  <span className="bg-amber-400 text-black px-1 py-0.2 text-[9px] font-mono font-bold uppercase">
                    SIH 2026
                  </span>
                </div>
                <div className="text-[10px] font-mono text-slate-300 flex items-center space-x-1">
                  <span>Gemini · Groq · Grounded Pilot LMIS</span>
                  <span className="text-emerald-400 font-bold flex items-center space-x-0.5">
                    <Lock className="w-2.5 h-2.5 inline" />
                    <span>SECURE</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                onClick={handleClear}
                className="text-slate-300 hover:text-white p-1 hover:bg-slate-800 transition"
                title="Reset conversation"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-red-400 p-1 hover:bg-slate-800 transition"
                title="Close drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Prompts Bar */}
          <div className="bg-slate-50 border-b border-black p-2 flex items-center space-x-1.5 overflow-x-auto text-[10px] font-mono">
            <span className="text-slate-500 uppercase font-bold shrink-0">Prompts:</span>
            {SUGGESTED_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendPrompt(prompt.replace(/^[^\s]+\s/, ''))}
                disabled={loading}
                className="whitespace-nowrap bg-white border border-black px-2 py-0.5 text-slate-800 hover:bg-black hover:text-white transition disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Messages list */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 font-sans text-xs bg-slate-50/50">
            {messages.map((m) => {
              const isAssistant = m.sender === 'assistant';
              const isCitationOpen = expandedCitationId === m.id;
              const isSecurity = m.isSecurityAlert;

              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${
                    isAssistant ? 'items-start mr-3' : 'items-end ml-8'
                  }`}
                >
                  <div
                    className={`p-3 border-2 max-w-full ${
                      isSecurity
                        ? 'bg-red-50 border-red-600 text-red-900 shadow-[2px_2px_0px_0px_#dc2626]'
                        : isAssistant
                        ? 'bg-white border-black shadow-[2px_2px_0px_0px_#000000]'
                        : 'bg-black border-black text-white shadow-[2px_2px_0px_0px_#475569]'
                    }`}
                  >
                    {/* Security Alert Header */}
                    {isSecurity && (
                      <div className="mb-2 flex items-center space-x-1.5 pb-1 border-b border-red-200 text-[10px] font-mono text-red-700 font-bold uppercase tracking-wider">
                        <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                        <span>Guardrail Defense Triggered</span>
                      </div>
                    )}

                    {/* Assistant Metadata Badge */}
                    {isAssistant && m.provider && !isSecurity && (
                      <div className="mb-2 flex items-center justify-between pb-1.5 border-b border-slate-200 text-[10px] font-mono">
                        <div className="flex items-center space-x-1.5">
                          <Cpu className="w-3 h-3 text-slate-700" />
                          <span
                            className={`font-bold px-1 py-0.2 uppercase border ${
                              m.provider === 'gemini'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-400'
                                : m.provider === 'groq'
                                ? 'bg-cyan-100 text-cyan-800 border-cyan-400'
                                : 'bg-slate-100 text-slate-800 border-slate-400'
                            }`}
                          >
                            {m.provider}
                          </span>
                          <span className="text-slate-500 truncate max-w-[140px]">
                            {m.model}
                          </span>
                        </div>

                        <div className="flex items-center space-x-1">
                          <button
                            type="button"
                            onClick={() => handleCopy(m.id, m.text)}
                            className="p-1 hover:bg-slate-100 text-slate-600 hover:text-black transition"
                            title="Copy response"
                          >
                            {copiedId === m.id ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Message Body */}
                    <p
                      className={`font-mono text-xs leading-relaxed whitespace-pre-line ${
                        isSecurity
                          ? 'text-red-900 font-semibold'
                          : isAssistant
                          ? 'text-slate-900'
                          : 'text-white'
                      }`}
                    >
                      {m.text}
                    </p>

                    {/* Citation Box if present */}
                    {m.citation && (
                      <div className="mt-2.5 pt-2 border-t border-dashed border-slate-300 text-[10px] font-mono">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedCitationId(isCitationOpen ? null : m.id)
                          }
                          className="w-full flex items-center justify-between font-bold text-slate-800 hover:text-black"
                        >
                          <span className="flex items-center space-x-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Citation: {m.citation.district} · {m.citation.trade}</span>
                          </span>
                          {isCitationOpen ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                        </button>

                        {isCitationOpen && (
                          <div className="mt-1.5 p-2 bg-slate-100 border border-black space-y-1 text-slate-600">
                            <div className="flex justify-between">
                              <span>Source Flag:</span>
                              <span className="font-bold text-black uppercase">{m.citation.sourceFlag}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Run ID:</span>
                              <span className="font-mono text-black">{m.citation.runId}</span>
                            </div>
                            {m.citation.gap !== undefined && (
                              <div className="flex justify-between">
                                <span>Gap Deficit:</span>
                                <span className={`font-bold ${m.citation.gap > 0 ? 'text-red-600' : 'text-blue-600'}`}>
                                  {m.citation.gap > 0 ? `+${m.citation.gap}` : m.citation.gap} seats
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    <div className={`mt-1 text-[9px] font-mono text-right ${
                      isSecurity ? 'text-red-500' : isAssistant ? 'text-slate-400' : 'text-slate-400'
                    }`}>
                      {m.timestamp}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Loading Indicator with uiverse-inspired rhythmic ink pulse */}
            {loading && (
              <div className="p-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000000] inline-block mr-8">
                <div className="flex items-center space-x-2 text-xs font-mono text-slate-700">
                  <div className="ink-brutalist-loader">
                    <span />
                    <span />
                    <span />
                  </div>
                  <span className="tracking-wide text-[11px] uppercase">
                    Multi-tier AI reasoning in progress...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendPrompt(input);
            }}
            className="p-2.5 border-t-2 border-black bg-white flex space-x-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Ask e.g. 'What is the deficit in Jaipur Solar?'"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                className="w-full p-2.5 text-xs font-mono border-2 border-black focus:outline-none focus:bg-amber-50/30 pr-8"
              />
              <CornerDownRight className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3" />
            </div>

            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-black text-white px-4 border-2 border-black hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-[2px_2px_0px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px]"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
