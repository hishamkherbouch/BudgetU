"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, X, Send, Loader2 } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
  actionTaken?: { type: string; ok: boolean; message: string } | null;
};

const STARTERS = [
  "I spent $20 on food today",
  "What's my savings rate?",
  "Add $50 to my emergency fund",
];

export default function Chatbot() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;

    const userMessage: Message = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const conversationHistory = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          conversationHistory,
        }),
      });

      const data = await res.json();

      if (data.ok) {
        const botMessage: Message = {
          role: "assistant",
          content: data.data.reply,
          actionTaken: data.data.actionTaken,
        };
        setMessages((prev) => [...prev, botMessage]);

        // If an action was taken, refresh the dashboard data
        if (data.data.actionTaken?.ok) {
          router.refresh();
        }
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.error || "Sorry, something went wrong. Try again.",
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Could not reach the server. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  return (
    <>
      {/* Floating robot icon */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-budgetu-accent hover:bg-budgetu-accent-hover text-white flex items-center justify-center shadow-lg z-50 transition-colors"
          aria-label="Open AI assistant"
        >
          <Bot className="w-6 h-6 sm:w-7 sm:h-7" />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 w-full sm:w-[400px] h-[100dvh] sm:h-[520px] bg-white sm:rounded-xl shadow-2xl border border-border flex flex-col z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-budgetu-accent sm:rounded-t-xl">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-white" />
              <span className="font-semibold text-white text-sm">
                BudgetU Assistant
              </span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-colors"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.length === 0 && (
              <div className="text-center py-6">
                <Bot className="w-10 h-10 text-budgetu-accent mx-auto mb-3" />
                <p className="text-sm font-medium text-budgetu-heading mb-1">
                  Hi! I&apos;m your BudgetU assistant.
                </p>
                <p className="text-xs text-budgetu-muted mb-4">
                  Ask me anything about your finances, or tell me to add expenses, update your income, and more.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {STARTERS.map((s) => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      className="text-xs px-3 py-1.5 rounded-full border border-budgetu-accent/30 text-budgetu-accent hover:bg-budgetu-accent/10 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-budgetu-accent text-white"
                      : "bg-[#f3f4f6] text-budgetu-heading"
                  }`}
                >
                  {msg.content}
                  {msg.actionTaken && (
                    <div
                      className={`mt-1.5 pt-1.5 border-t text-xs ${
                        msg.actionTaken.ok
                          ? "border-budgetu-positive/30 text-budgetu-positive"
                          : "border-destructive/30 text-destructive"
                      }`}
                    >
                      {msg.actionTaken.ok ? "Done" : "Failed"}:{" "}
                      {msg.actionTaken.message}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-[#f3f4f6] rounded-xl px-3 py-2">
                  <Loader2 className="w-4 h-4 animate-spin text-budgetu-accent" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 px-4 py-3 border-t border-border"
          >
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              disabled={loading}
              className="flex-1 text-sm"
            />
            <Button
              type="submit"
              size="sm"
              disabled={loading || !input.trim()}
              className="bg-budgetu-accent hover:bg-budgetu-accent-hover text-white shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
