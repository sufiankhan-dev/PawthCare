"use client";

import { useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { MessageCircleHeart, Sparkles, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import {
  ChatComposer,
  ChatMessages,
  ChatSuggestions,
} from "@/components/ai/chat-ui";

const SUGGESTIONS = [
  "What can PawthCare do for my pet?",
  "How does AI photo screening work?",
  "My dog keeps scratching — what could it be?",
  "What vaccines do kittens need?",
];

const EASE = [0.22, 1, 0.36, 1] as const;

export function AssistantWidget({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
}) {
  const { messages, sendMessage, status, error, regenerate, stop } = useChat({
    transport: new DefaultChatTransport({ api: "/api/ai/chat" }),
  });

  const send = (text: string) => void sendMessage({ text });

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onOpenChange(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="PawthCare assistant"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.18, ease: EASE }}
            className="fixed inset-x-3 bottom-[5.5rem] top-auto z-50 flex h-[min(600px,calc(100dvh-7rem))] flex-col overflow-hidden rounded-2xl bg-card shadow-soft-lg ring-1 ring-foreground/[0.06] sm:inset-x-auto sm:right-6 sm:w-[400px]"
          >
            <div className="flex items-center justify-between gap-2 border-b border-border/60 px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Sparkles className="size-4" />
                </span>
                <div className="leading-tight">
                  <p className="text-sm font-semibold">PawthCare Assistant</p>
                  <p className="text-xs text-muted-foreground">
                    Pets, care &amp; app help
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Close assistant"
              >
                <X className="size-4" />
              </button>
            </div>

            <ChatMessages
              messages={messages}
              status={status}
              error={error}
              onRetry={() => void regenerate()}
              empty={
                <div className="flex h-full flex-col items-center justify-center gap-4 py-6 text-center">
                  <span className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <MessageCircleHeart className="size-5" />
                  </span>
                  <p className="max-w-[16rem] text-sm text-muted-foreground">
                    Hi! Ask me anything about PawthCare, your pets, or pet health.
                  </p>
                  <ChatSuggestions suggestions={SUGGESTIONS} onPick={send} />
                </div>
              }
            />

            <ChatComposer
              onSend={send}
              onStop={() => void stop()}
              status={status}
              placeholder="Ask anything…"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        className="fixed bottom-5 right-5 z-50 flex size-13 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-soft-lg transition-transform hover:scale-[1.04] active:scale-95 sm:bottom-6 sm:right-6"
        aria-label={open ? "Close AI assistant" : "Open AI assistant"}
        aria-expanded={open}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={open ? "close" : "open"}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.12 }}
          >
            {open ? <X className="size-5" /> : <Sparkles className="size-5" />}
          </motion.span>
        </AnimatePresence>
      </button>
    </>
  );
}
