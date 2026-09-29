"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  model?: string;
  provider?: string;
}

const SUGGESTED_PROMPTS = [
  "Jelaskan perbedaan Stack dan Queue",
  "Bagaimana cara kerja algoritma Dijkstra?",
  "Contoh query SQL JOIN dan penjelasannya",
  "Tips menghadapi ujian struktur data",
  "Review kode Python saya",
  "Apa itu RESTful API?",
];

function formatMarkdown(text: string) {
  // Basic markdown rendering - bold, code blocks, inline code, lists
  let html = text
    // Code blocks
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_match, lang, code) => {
      return `<pre class="code-block"><code class="language-${lang}">${code
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")}</code></pre>`;
    })
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    // Italic
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // Headers
    .replace(/^### (.+)$/gm, '<h4 class="text-white font-semibold mt-3 mb-1">$1</h4>')
    .replace(/^## (.+)$/gm, '<h3 class="text-white font-bold text-lg mt-4 mb-2">$1</h3>')
    // Unordered list items
    .replace(/^[\-\*] (.+)$/gm, '<li class="ml-4 list-disc text-slate-300">$1</li>')
    // Ordered list items
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal text-slate-300">$1</li>')
    // Line breaks
    .replace(/\n\n/g, "<br/><br/>")
    .replace(/\n/g, "<br/>");

  return html;
}

export default function AIAssistantPage() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearToast, setClearToast] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Storage key spesifik per user agar tidak bercampur
  const storageKey = session?.user?.email
    ? `studyflow_ai_history_${session.user.email}`
    : "studyflow_ai_history_default";

  // 1. Muat riwayat chat dari localStorage saat halaman dibuka
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setMessages(
            parsed.map((m: any) => ({
              ...m,
              timestamp: new Date(m.timestamp),
            }))
          );
        }
      }
    } catch (e) {
      console.error("Gagal memuat riwayat chat:", e);
    } finally {
      setIsLoaded(true);
    }
  }, [storageKey]);

  // 2. Simpan setiap perubahan pesan ke localStorage secara otomatis
  useEffect(() => {
    if (!isLoaded) return;
    try {
      if (messages.length === 0) {
        localStorage.removeItem(storageKey);
      } else {
        localStorage.setItem(storageKey, JSON.stringify(messages));
      }
    } catch (e) {
      console.error("Gagal menyimpan riwayat chat:", e);
    }
  }, [messages, isLoaded, storageKey]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || loading) return;

    setInput("");
    setError("");

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      // Send last 10 messages as history for context
      const history = messages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageText, history }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal mendapatkan respons");
        return;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
        model: data.model,
        provider: data.provider,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setError("Koneksi gagal. Periksa internet kamu.");
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const confirmClearChat = () => {
    setMessages([]);
    setError("");
    setShowClearConfirm(false);
    try {
      localStorage.removeItem(storageKey);
      setClearToast(true);
      setTimeout(() => setClearToast(false), 3000);
    } catch (e) {
      console.error("Gagal menghapus riwayat chat:", e);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-10.5rem)] md:h-[calc(100vh-4rem)] animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-4 flex-shrink-0">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-md">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-white truncate">AI Assistant</h1>
            <p className="text-slate-400 text-xs sm:text-sm truncate">
              Multi-Model AI Study Assistant
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs sm:text-sm flex items-center gap-1.5 flex-shrink-0 transition-all active:scale-95"
            title="Hapus riwayat chat"
          >
            <svg
              className="w-3.5 h-3.5 sm:w-4 sm:h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>Hapus Riwayat</span>
          </button>
        )}
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto rounded-2xl glass-card p-4 space-y-4 mb-4">
        {messages.length === 0 ? (
          /* Welcome state */
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500/20 to-purple-500/20 flex items-center justify-center mb-6 animate-pulse-glow">
              <svg
                className="w-10 h-10 text-brand-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              Hai! Saya StudyFlow AI 👋
            </h2>
            <p className="text-slate-400 max-w-md mb-8">
              Saya bisa membantu kamu memahami materi kuliah, menjelaskan konsep
              pemrograman, review kode, dan banyak lagi!
            </p>

            {/* Suggested prompts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg w-full">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="text-left p-3 rounded-xl bg-white/[0.03] border border-white/5 
                    hover:border-brand-500/30 hover:bg-brand-500/5 transition-all text-sm text-slate-300
                    hover:text-white group"
                >
                  <span className="text-brand-400 group-hover:text-brand-300 mr-2">
                    →
                  </span>
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Messages */
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 animate-fade-in ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center flex-shrink-0 mt-1">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                )}

                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-brand-500 text-white rounded-br-md"
                      : "bg-white/[0.05] border border-white/10 text-slate-200 rounded-bl-md"
                  }`}
                >
                  {msg.role === "user" ? (
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <div
                      className="text-sm ai-response leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: formatMarkdown(msg.content),
                      }}
                    />
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    {msg.model && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-brand-300 font-mono">
                        {msg.model.split("/").pop()}
                      </span>
                    )}
                    <p
                      className={`text-xs ${
                        msg.role === "user"
                          ? "text-brand-200"
                          : "text-slate-500"
                      }`}
                    >
                      {msg.timestamp.toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-purple-400 flex items-center justify-center flex-shrink-0 mt-1 text-white text-xs font-bold">
                    U
                  </div>
                )}
              </div>
            ))}

            {/* Loading indicator */}
            {loading && (
              <div className="flex gap-3 animate-fade-in">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center flex-shrink-0 mt-1">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="bg-white/[0.05] border border-white/10 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="p-3 mb-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm animate-fade-in flex items-center gap-2 flex-shrink-0">
          <svg
            className="w-4 h-4 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {error}
        </div>
      )}

      {/* Input area */}
      <div className="flex-shrink-0 glass-card p-3">
        <div className="flex items-end gap-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tanya apa saja tentang materi kuliah..."
            className="flex-1 bg-transparent border-none outline-none text-white placeholder-slate-500 text-sm resize-none max-h-32 py-2 px-1"
            rows={1}
            disabled={loading}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = Math.min(target.scrollHeight, 128) + "px";
            }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className={`p-2.5 rounded-xl transition-all flex-shrink-0 ${
              input.trim() && !loading
                ? "bg-brand-500 hover:bg-brand-600 text-white shadow-lg shadow-brand-500/25"
                : "bg-white/5 text-slate-600 cursor-not-allowed"
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <p className="text-xs text-slate-600 mt-2 px-1">
          Tekan Enter untuk kirim, Shift+Enter untuk baris baru
        </p>
      </div>

      {/* Confirmation Modal to Clear History */}
      {showClearConfirm && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowClearConfirm(false)}
        >
          <div
            className="glass-card max-w-sm w-full p-6 text-center animate-slide-up border border-white/20 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-red-500/15 text-red-400 flex items-center justify-center mx-auto mb-4 border border-red-500/20">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Hapus Riwayat Chat?</h3>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Semua percakapan kamu dengan AI akan dihapus dari perangkat ini dan tidak dapat dikembalikan.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="btn-secondary flex-1 justify-center py-2.5 text-sm"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmClearChat}
                className="flex-1 justify-center py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium text-sm transition-all shadow-lg shadow-red-500/25 flex items-center gap-1.5"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification when History Cleared */}
      {clearToast && (
        <div className="fixed bottom-20 md:bottom-8 right-4 left-4 sm:left-auto sm:right-8 z-50 p-4 rounded-xl bg-surface-800/95 border border-emerald-500/30 text-emerald-300 text-sm shadow-2xl flex items-center gap-3 backdrop-blur-xl animate-slide-up">
          <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <span>Riwayat chat berhasil dibersihkan ✨</span>
        </div>
      )}
    </div>
  );
}
