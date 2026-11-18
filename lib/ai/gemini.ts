import "server-only";

import { ApiError, FinishReason, GoogleGenAI, type Content, type Part } from "@google/genai";
import { z } from "zod";

import { AI_REQUEST_TIMEOUT_MS } from "./config";

export type AiErrorCode =
  | "not_configured"
  | "invalid_request"
  | "auth_failed"
  | "rate_limited"
  | "blocked"
  | "unavailable"
  | "invalid_response"
  | "unknown";

/** A provider-agnostic error with a message that is safe to show users. */
export class AiServiceError extends Error {
  constructor(
    public readonly code: AiErrorCode,
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "AiServiceError";
  }
}

let client: GoogleGenAI | null = null;

/** Lazily creates the Gemini client. Throws a 503 error if no key is set. */
export function getGemini(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new AiServiceError(
      "not_configured",
      "AI features aren't configured yet. Add GEMINI_API_KEY to the server environment.",
      503,
    );
  }
  client ??= new GoogleGenAI({
    apiKey,
    httpOptions: { timeout: AI_REQUEST_TIMEOUT_MS },
  });
  return client;
}

/** Maps any thrown value to an AiServiceError with a user-safe message. */
export function toAiServiceError(err: unknown): AiServiceError {
  if (err instanceof AiServiceError) return err;

  if (err instanceof ApiError) {
    const { status } = err;
    if (status === 400) {
      return new AiServiceError(
        "invalid_request",
        "The AI service couldn't process this request. Try a different photo or message.",
        400,
      );
    }
    if (status === 401 || status === 403) {
      return new AiServiceError(
        "auth_failed",
        "The AI service rejected the server's credentials. Check GEMINI_API_KEY.",
        502,
      );
    }
    if (status === 404) {
      return new AiServiceError(
        "not_configured",
        "The configured Gemini model isn't available. Check GEMINI_VISION_MODEL / GEMINI_CHAT_MODEL.",
        502,
      );
    }
    if (status === 429) {
      return new AiServiceError(
        "rate_limited",
        "The AI service is busy right now. Please wait a moment and try again.",
        429,
      );
    }
    if (status >= 500) {
      return new AiServiceError(
        "unavailable",
        "The AI service is temporarily unavailable. Please try again shortly.",
        503,
      );
    }
  }

  if (err instanceof Error && /abort|timeout|timed out/i.test(err.message)) {
    return new AiServiceError(
      "unavailable",
      "The AI service took too long to respond. Please try again.",
      504,
    );
  }

  return new AiServiceError(
    "unknown",
    "Something went wrong while contacting the AI service.",
    500,
  );
}

/** Returns a JSON error response for an AI failure (logging the cause). */
export function aiErrorResponse(err: unknown, context: string): Response {
  const aiErr = toAiServiceError(err);
  console.error(`[ai:${context}]`, aiErr.code, err);
  return Response.json(
    { error: aiErr.message, code: aiErr.code },
    { status: aiErr.status },
  );
}

function toResponseJsonSchema(schema: z.ZodType): unknown {
  // Gemini accepts standard JSON Schema; drop the meta key it doesn't need.
  const json = z.toJSONSchema(schema) as Record<string, unknown>;
  delete json.$schema;
  return json;
}

/**
 * Runs a single multimodal request and returns output validated against
 * `schema`. Never returns unvalidated model output.
 */
export async function generateStructured<S extends z.ZodType>({
  model,
  system,
  parts,
  schema,
  temperature = 0.2,
}: {
  model: string;
  system: string;
  parts: Part[];
  schema: S;
  temperature?: number;
}): Promise<z.infer<S>> {
  const response = await getGemini().models.generateContent({
    model,
    contents: [{ role: "user", parts }],
    config: {
      systemInstruction: system,
      temperature,
      responseMimeType: "application/json",
      responseJsonSchema: toResponseJsonSchema(schema),
    },
  });

  if (response.promptFeedback?.blockReason) {
    throw new AiServiceError(
      "blocked",
      "This request was blocked by the AI safety filters. Try a different photo.",
      422,
    );
  }

  const finishReason = response.candidates?.[0]?.finishReason;
  if (
    finishReason === FinishReason.SAFETY ||
    finishReason === FinishReason.PROHIBITED_CONTENT ||
    finishReason === FinishReason.IMAGE_SAFETY
  ) {
    throw new AiServiceError(
      "blocked",
      "The AI declined to analyze this content. Try a different photo.",
      422,
    );
  }

  const text = response.text;
  if (!text) {
    throw new AiServiceError(
      "invalid_response",
      "The AI returned an empty response. Please try again.",
      502,
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new AiServiceError(
      "invalid_response",
      "The AI returned a malformed response. Please try again.",
      502,
    );
  }

  const result = schema.safeParse(parsed);
  if (!result.success) {
    console.error("[ai] schema validation failed", result.error.issues);
    throw new AiServiceError(
      "invalid_response",
      "The AI returned an incomplete response. Please try again.",
      502,
    );
  }
  return result.data;
}

/** Streams plain-text chat output, yielding text deltas as they arrive. */
export async function* streamChatText({
  model,
  system,
  contents,
  abortSignal,
}: {
  model: string;
  system: string;
  contents: Content[];
  abortSignal?: AbortSignal;
}): AsyncGenerator<string> {
  const stream = await getGemini().models.generateContentStream({
    model,
    contents,
    config: { systemInstruction: system, temperature: 0.6, abortSignal },
  });

  for await (const chunk of stream) {
    if (chunk.promptFeedback?.blockReason) {
      throw new AiServiceError(
        "blocked",
        "That message was blocked by the AI safety filters.",
        422,
      );
    }
    const text = chunk.text;
    if (text) yield text;
  }
}
