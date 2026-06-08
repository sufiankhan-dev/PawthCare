import { openai } from "@ai-sdk/openai";

// Uses the OpenAI provider directly (reads OPENAI_API_KEY from the env).
export const AI_MODELS = {
  vision: openai("gpt-4o"),
  chat: openai("gpt-4o-mini"),
} as const;

export const URGENCY_LEVELS = ["routine", "monitor", "soon", "urgent"] as const;
export type Urgency = (typeof URGENCY_LEVELS)[number];
