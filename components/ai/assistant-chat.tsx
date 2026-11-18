"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { MessageCircleHeart, Sparkles } from "lucide-react";

import {
  ChatComposer,
  ChatMessages,
  ChatSuggestions,
} from "@/components/ai/chat-ui";

const SUGGESTIONS = [
  "Why might my pet be scratching so much?",
  "Is my pet's weight healthy?",
  "What vaccinations are coming up?",
  "Any signs I should watch for?",
];

export function AssistantChat({
  petId,
  petName,
  initialMessages,
}: {
  petId: string;
  petName: string;
  initialMessages: UIMessage[];
}) {
  const { messages, sendMessage, status, error, regenerate, stop } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/ai/assistant",
      body: { petId },
    }),
    messages: initialMessages,
  });

  const send = (text: string) => void sendMessage({ text });

  return (
    <div className="flex h-[calc(100dvh-13rem)] min-h-[420px] flex-col overflow-hidden rounded-2xl bg-card shadow-soft ring-1 ring-foreground/[0.05] md:h-[calc(100dvh-14rem)]">
      <div className="flex items-center gap-3 border-b border-border/60 px-4 py-3.5 sm:px-5">
        <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Sparkles className="size-4" />
        </span>
        <div className="min-w-0 leading-tight">
          <p className="truncate text-sm font-semibold">
            {petName}&apos;s AI assistant
          </p>
          <p className="truncate text-xs text-muted-foreground">
            Grounded in {petName}&apos;s health records · not a diagnosis
          </p>
        </div>
      </div>

      <ChatMessages
        messages={messages}
        status={status}
        error={error}
        onRetry={() => void regenerate()}
        className="sm:px-6"
        empty={
          <div className="flex h-full flex-col items-center justify-center gap-4 py-8 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MessageCircleHeart className="size-5" />
            </span>
            <p className="max-w-xs text-sm text-muted-foreground">
              Ask anything about {petName}&apos;s health, behavior, or care.
            </p>
            <ChatSuggestions suggestions={SUGGESTIONS} onPick={send} />
          </div>
        }
      />

      <ChatComposer
        onSend={send}
        onStop={() => void stop()}
        status={status}
        placeholder={`Ask about ${petName}…`}
      />
    </div>
  );
}
