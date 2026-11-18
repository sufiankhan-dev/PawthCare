/**
 * Central AI configuration. Swap models here (or via env) without touching
 * any route or component code.
 *
 * Model IDs: https://ai.google.dev/gemini-api/docs/models
 */
export const AI_MODELS = {
  /** Multimodal model used for photo screening (image + text -> JSON). */
  vision: process.env.GEMINI_VISION_MODEL || "gemini-3.8-flash",
  /** Fast model used for the streaming chat assistants. */
  chat: process.env.GEMINI_CHAT_MODEL || "gemini-3.5-flash-lite",
} as const;

/** Upper bound for a single Gemini request, kept below route maxDuration. */
export const AI_REQUEST_TIMEOUT_MS = 50_000;

/** How many prior chat turns are sent to the model as context. */
export const CHAT_HISTORY_LIMIT = 30;

/** Max characters accepted for a single chat message. */
export const CHAT_MESSAGE_MAX_CHARS = 4_000;
