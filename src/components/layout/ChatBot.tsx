"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { X, Send, Bot, ChevronDown, Sparkles } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

// Extract product slug links from assistant messages
function parseMessageContent(content: string) {
  // Detect bold product names like **Kitchen King Masala**
  const parts = content.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      const name = part.slice(2, -2);
      return (
        <strong key={i} className="text-[#8B1A1A]">
          {name}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

const WELCOME_MESSAGE: Message = {
  role: "assistant",
  content:
    "Namaste! 🙏 I'm Vraja, your spice guide. Tell me what you're cooking today and I'll find the perfect masala for you!",
};

export default function ChatBot() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Hide on admin pages
  if (pathname.startsWith("/admin")) return null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, messages]);

  // Show unread dot after 5s if chat hasn't been opened yet
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen) setHasUnread(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMessage: Message = { role: "user", content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply ?? "Sorry, something went wrong. Please try again!",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Oops! I couldn't connect. Please check your internet and try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Quick suggestion chips
  const suggestions = [
    "I'm making a curry",
    "Fasting day recipes",
    "Biryani help",
    "South Indian food",
  ];

  return (
    <>
      {/* ── Floating Button ─────────────────────────────────────── */}
      <button
        onClick={() => { setIsOpen(true); setHasUnread(false); }}
        aria-label="Open spice assistant"
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3.5 rounded-full shadow-2xl transition-all duration-300 ${
          isOpen ? "opacity-0 pointer-events-none scale-75" : "opacity-100 scale-100"
        }`}
        style={{
          background: "linear-gradient(135deg, #8B1A1A 0%, #E8721C 100%)",
          boxShadow: "0 8px 32px rgba(139,26,26,0.45)",
        }}
      >
        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-full animate-ping opacity-20 bg-[#E8721C]" />
        <Bot className="w-5 h-5 text-white flex-shrink-0" />
        <span className="text-white font-semibold text-sm whitespace-nowrap hidden sm:block">
          Spice Assistant
        </span>
        {hasUnread && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white" />
        )}
      </button>

      {/* ── Chat Window ─────────────────────────────────────────── */}
      <div
        className={`fixed bottom-6 right-6 z-50 flex flex-col rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 origin-bottom-right ${
          isOpen
            ? "opacity-100 scale-100"
            : "opacity-0 scale-90 pointer-events-none"
        }`}
        style={{
          width: "min(380px, calc(100vw - 24px))",
          height: "min(580px, calc(100vh - 100px))",
          border: "1px solid rgba(212,160,23,0.3)",
          boxShadow: "0 24px 64px rgba(44,24,16,0.25)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3.5 flex-shrink-0"
          style={{
            background: "linear-gradient(135deg, #8B1A1A 0%, #C85A0A 100%)",
          }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-none">Vraja</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <p className="text-white/80 text-[11px]">Spice Assistant</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setMessages([WELCOME_MESSAGE])}
              className="w-7 h-7 flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/20 transition-all text-xs font-bold"
              title="Clear chat"
            >
              ↺
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/20 transition-all"
              aria-label="Close chat"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div
          className="flex-1 overflow-y-auto px-3 py-4 space-y-3"
          style={{ background: "#FDF7EE" }}
        >
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-end gap-2 ${
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {msg.role === "assistant" && (
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mb-0.5"
                  style={{ background: "linear-gradient(135deg, #8B1A1A, #E8721C)" }}
                >
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
              )}
              <div
                className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "rounded-br-sm text-white"
                    : "rounded-bl-sm text-[#2C1810]"
                }`}
                style={
                  msg.role === "user"
                    ? { background: "linear-gradient(135deg, #8B1A1A, #C85A0A)" }
                    : {
                        background: "#FFFFFF",
                        border: "1px solid #EDE0C4",
                        boxShadow: "0 2px 8px rgba(44,24,16,0.07)",
                      }
                }
              >
                <p className="whitespace-pre-wrap">{parseMessageContent(msg.content)}</p>
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-end gap-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #8B1A1A, #E8721C)" }}
              >
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <div
                className="px-4 py-3 rounded-2xl rounded-bl-sm"
                style={{ background: "#FFFFFF", border: "1px solid #EDE0C4" }}
              >
                <div className="flex gap-1 items-center h-4">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-2 h-2 rounded-full bg-[#8B1A1A] opacity-60 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestions (only when chat is fresh) */}
        {messages.length <= 1 && (
          <div
            className="px-3 pb-2 flex gap-2 overflow-x-auto flex-shrink-0 scrollbar-hide"
            style={{ background: "#FDF7EE" }}
          >
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setInput(s);
                  setTimeout(() => inputRef.current?.focus(), 50);
                }}
                className="whitespace-nowrap text-xs font-medium px-3 py-1.5 rounded-full border transition-all flex-shrink-0 hover:scale-105 active:scale-95"
                style={{
                  border: "1.5px solid #D4A01766",
                  color: "#8B4513",
                  background: "#FFF8EE",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div
          className="flex items-center gap-2 px-3 py-3 flex-shrink-0"
          style={{
            borderTop: "1px solid #EDE0C4",
            background: "#FAF3E4",
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me what to cook…"
            disabled={isLoading}
            className="flex-1 bg-white text-[#2C1810] text-sm rounded-xl px-3.5 py-2.5 outline-none placeholder:text-[#C4A88A] disabled:opacity-50"
            style={{ border: "1.5px solid #EDE0C4" }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
            style={{
              background: "linear-gradient(135deg, #8B1A1A, #E8721C)",
              boxShadow: "0 4px 12px rgba(139,26,26,0.3)",
            }}
            aria-label="Send message"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Footer */}
        <div
          className="text-center text-[10px] py-1.5 flex-shrink-0"
          style={{ background: "#FAF3E4", color: "#C4A88A" }}
        >
          Powered by Vraja AI · All products are{" "}
          <Link href="/shop" className="underline hover:text-[#8B4513]" onClick={() => setIsOpen(false)}>
            NONG certified
          </Link>
        </div>
      </div>
    </>
  );
}
