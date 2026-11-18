import "server-only";

import type { Content } from "@google/genai";
import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateId,
  type UIMessage,
} from "ai";
import { z } from "zod";

import { CHAT_HISTORY_LIMIT, CHAT_MESSAGE_MAX_CHARS } from "./config";
import { getGemini, streamChatText, toAiServiceError } from "./gemini";

const uiMessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant", "system"]),
  parts: z.array(z.looseObject({ type: z.string() })),
});

/** Validates the `messages` array sent by `useChat`. */
export const chatMessagesSchema = z.array(uiMessageSchema).min(1).max(200);

/** Extracts the plain text of a UI message. */
export function messageText(message: Pick<UIMessage, "parts">): string {
  return message.parts
    .map((p) => (p.type === "text" ? (p as { text: string }).text : ""))
    .join("")
    .trim();
}

/**
 * Converts `useChat` UI messages into Gemini `contents`, keeping only recent
 * user/assistant text turns. Returns an `error` if the latest user message is
 * empty or too long.
 */
export function toGeminiContents(
  messages: UIMessage[],
): { contents: Content[]; lastUserText: string } | { error: string } {
  const turns = messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({ role: m.role, text: messageText(m) }))
    .filter((t) => t.text.length > 0)
    .slice(-CHAT_HISTORY_LIMIT);

  const last = turns[turns.length - 1];
  if (!last || last.role !== "user") {
    return { error: "Send a message to get a reply." };
  }
  if (last.text.length > CHAT_MESSAGE_MAX_CHARS) {
    return {
      error: `Messages are limited to ${CHAT_MESSAGE_MAX_CHARS.toLocaleString()} characters.`,
    };
  }

  // Gemini expects the conversation to start with a user turn.
  while (turns.length && turns[0].role !== "user") turns.shift();

  return {
    lastUserText: last.text,
    contents: turns.map((t) => ({
      role: t.role === "assistant" ? "model" : "user",
      parts: [{ text: t.text }],
    })),
  };
}

/**
 * Streams a Gemini chat completion to the browser using the UI message stream
 * protocol that `useChat` understands.
 */
export function streamChatResponse({
  model,
  system,
  contents,
  abortSignal,
  onFinish,
}: {
  model: string;
  system: string;
  contents: Content[];
  abortSignal?: AbortSignal;
  onFinish?: (text: string) => Promise<void> | void;
}): Response {
  // Fail fast (with a proper status code) if the AI isn't configured.
  getGemini();

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      const id = generateId();
      let full = "";
      writer.write({ type: "text-start", id });
      for await (const delta of streamChatText({
        model,
        system,
        contents,
        abortSignal,
      })) {
        full += delta;
        writer.write({ type: "text-delta", id, delta });
      }
      writer.write({ type: "text-end", id });

      if (full.trim() && onFinish) {
        try {
          await onFinish(full);
        } catch (err) {
          console.error("[ai:chat] onFinish failed", err);
        }
      }
    },
    onError: (err) => {
      const aiErr = toAiServiceError(err);
      console.error("[ai:chat]", aiErr.code, err);
      return aiErr.message;
    },
  });

  return createUIMessageStreamResponse({ stream });
}
