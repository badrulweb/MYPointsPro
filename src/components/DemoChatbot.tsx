import {
  ArrowUpRight,
  Loader2,
  MessageSquare,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Link } from '../lib/router';

interface SuggestedLink {
  label: string;
  path: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggestedLinks?: SuggestedLink[];
  sanitizedTerms?: string[];
}

const STARTER_PROMPTS = [
  'Explain 0% APR balance transfer math',
  'How to keep credit utilization under 9%?',
  'Transferable points vs. 1.25¢ portal?',
  '2% flat cashback vs. category cards',
];

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    'Welcome to the MyPointsPro Guide Assistant. Ask any question about 0% APR financing, credit utilization, cashback break-evens, or cents-per-point travel math—all answered strictly without named bank bias.',
};

function renderFormattedReply(text: string) {
  const blocks = text.split(/\n{2,}/).filter((b) => b.trim().length > 0);
  return blocks.map((block, blockIdx) => {
    const lines = block.split('\n').filter((l) => l.trim().length > 0);
    const isList = lines.length > 1 && lines.every((l) => /^[-•*]\s+/.test(l.trim()));

    if (isList) {
      return (
        <ul key={blockIdx} className="space-y-1.5 pl-4 list-disc">
          {lines.map((line, lineIdx) => (
            <li key={lineIdx}>{line.replace(/^[-•*]\s+/, '').replace(/\*\*/g, '')}</li>
          ))}
        </ul>
      );
    }

    return (
      <p key={blockIdx} className="whitespace-pre-line">
        {block.replace(/\*\*/g, '')}
      </p>
    );
  });
}

export function DemoChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (messages.length > 1 || loading) {
        listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
      const timer = setTimeout(() => inputRef.current?.focus(), 120);
      return () => clearTimeout(timer);
    }
  }, [isOpen, messages, loading]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const sendMessage = async (rawText: string) => {
    const trimmed = rawText.trim();
    if (!trimmed || loading) return;

    const userTurn: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
    };

    const nextHistory = [...messages, userTurn];
    setMessages(nextHistory);
    setInput('');
    setError(null);
    setLoading(true);

    try {
      const apiMessages = nextHistory
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Unable to reach the MyPointsPro assistant.');
      }

      const assistantTurn: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        suggestedLinks: Array.isArray(data.suggestedLinks) ? data.suggestedLinks : [],
        sanitizedTerms: Array.isArray(data.sanitizedTerms) ? data.sanitizedTerms : [],
      };

      setMessages((prev) => [...prev, assistantTurn]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleReset = () => {
    setMessages([WELCOME_MESSAGE]);
    setError(null);
    setInput('');
  };

  const showStarters = messages.length === 1 && !loading;

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open MyPointsPro Guide Assistant"
          className="inline-flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#0B192C] text-white border border-[#C49645]/45 shadow-xl hover:bg-[#132844] transition-all cursor-pointer"
        >
          <MessageSquare className="w-4 h-4 text-[#E5C17B]" />
          <span className="text-sm font-semibold tracking-tight">Ask Guide</span>
        </button>
      ) : (
        <section
          aria-label="MyPointsPro Guide Assistant"
          className="w-[calc(100vw-2rem)] sm:w-[400px] h-[min(78vh,600px)] flex flex-col bg-white border border-[#E4E7EC] rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-[#0B192C] text-white px-4 py-3.5 border-b border-white/10 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#C49645]/20 border border-[#C49645]/40 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-[#E5C17B]" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-white truncate">
                  MyPointsPro Assistant
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={handleReset}
                title="Reset conversation"
                aria-label="Reset conversation"
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close assistant"
                aria-label="Close assistant"
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Conversation Viewport */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F7F8FA]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed space-y-2 ${
                    msg.role === 'user'
                      ? 'bg-[#0B192C] text-white rounded-br-sm'
                      : 'bg-white border border-[#E4E7EC] text-[#0F172A] rounded-bl-sm shadow-2xs'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <p>{msg.content}</p>
                  ) : (
                    renderFormattedReply(msg.content)
                  )}
                </div>

                {msg.role === 'assistant' &&
                  msg.suggestedLinks &&
                  msg.suggestedLinks.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5 max-w-[92%]">
                      {msg.suggestedLinks.map((link) => (
                        <Link
                          key={link.path + link.label}
                          to={link.path}
                          onClick={() => {
                            if (window.innerWidth < 640) {
                              setIsOpen(false);
                            }
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#0B192C] bg-white border border-[#E4E7EC] hover:border-[#0B192C] hover:bg-[#0B192C] hover:text-white transition-colors"
                        >
                          <span>{link.label}</span>
                          <ArrowUpRight className="w-3 h-3 shrink-0" />
                        </Link>
                      ))}
                    </div>
                  )}

                {msg.role === 'assistant' &&
                  msg.sanitizedTerms &&
                  msg.sanitizedTerms.length > 0 && (
                    <div className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-[#475569]">
                      <ShieldCheck className="w-3 h-3 text-[#108A65]" />
                      <span>Issuer-neutral compliance filter active</span>
                    </div>
                  )}
              </div>
            ))}

            {showStarters && (
              <div className="pt-1 space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#475569]">
                  Sample Questions
                </p>
                <div className="grid grid-cols-1 gap-1.5">
                  {STARTER_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => sendMessage(prompt)}
                      className="text-left px-3 py-2 rounded-xl bg-white border border-[#E4E7EC] hover:border-[#C49645] text-xs font-medium text-[#0B192C] transition-colors cursor-pointer"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {loading && (
              <div className="flex items-start">
                <div className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-2xl rounded-bl-sm bg-white border border-[#E4E7EC] text-xs font-medium text-[#475569]">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#108A65]" />
                  <span>Reviewing math &amp; editorial guides...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="px-3 py-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                {error}
              </div>
            )}

            <div ref={listEndRef} />
          </div>

          {/* Input Composer */}
          <form
            onSubmit={handleSubmit}
            className="p-3 bg-white border-t border-[#E4E7EC] shrink-0 space-y-1.5"
          >
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about APR, utilization, points..."
                disabled={loading}
                maxLength={600}
                className="flex-1 min-w-0 px-3 py-2 text-sm bg-[#F7F8FA] border border-[#E4E7EC] rounded-lg text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:border-[#0B192C] disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                aria-label="Send message"
                className="inline-flex items-center justify-center px-3.5 py-2 rounded-lg bg-[#108A65] hover:bg-[#0D7354] text-white transition-colors disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] text-[#64748B] text-center">
              Educational modeling only · No named banks or issuers
            </p>
          </form>
        </section>
      )}
    </div>
  );
}
