import { z } from "zod";

// Shared between the server (validation) and the client (types).

export const URGENCY_LEVELS = ["routine", "monitor", "soon", "urgent"] as const;
export type Urgency = (typeof URGENCY_LEVELS)[number];

export const SEVERITY_LEVELS = ["low", "moderate", "high"] as const;
export const CONFIDENCE_LEVELS = ["low", "medium", "high"] as const;
export type Confidence = (typeof CONFIDENCE_LEVELS)[number];

/** Image formats Gemini accepts for inline image input. */
export const SUPPORTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
] as const;

/** Raw upload size limit enforced in the browser before resizing. */
export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;

/** Encoded (base64) payload limit enforced on the server. */
export const MAX_IMAGE_PAYLOAD_CHARS = 8 * 1024 * 1024;

/** Structured output requested from Gemini for a photo screening. */
export const photoAnalysisSchema = z.object({
  assessable: z
    .boolean()
    .describe(
      "true only if the photo clearly shows an animal (or a close-up of part of one) with enough detail to make health observations. false if no animal is visible, or the image is too blurry, dark, or obstructed.",
    ),
  imageIssue: z
    .string()
    .describe(
      "When assessable is false, a short user-facing reason (e.g. 'No animal is visible in this photo.'). Empty string otherwise.",
    ),
  confidence: z
    .enum(CONFIDENCE_LEVELS)
    .describe(
      "How confident the observations are given image quality, angle, and lighting.",
    ),
  summary: z
    .string()
    .describe("A short, plain-language summary of what the photo shows."),
  riskScore: z
    .number()
    .int()
    .min(0)
    .max(100)
    .describe(
      "Overall visible health-risk score from 0 (no visible concerns) to 100 (severe, visible problem).",
    ),
  urgency: z.enum(URGENCY_LEVELS),
  findings: z
    .array(
      z.object({
        label: z.string().describe("Short name of the observation."),
        severity: z.enum(SEVERITY_LEVELS),
        detail: z
          .string()
          .describe("What is visible in the photo that supports this."),
      }),
    )
    .max(8)
    .describe(
      "Specific observations actually visible in the photo. Use an empty list rather than guessing.",
    ),
  recommendations: z
    .array(z.string())
    .max(6)
    .describe("Practical next steps for the owner."),
});

export type PhotoAnalysis = z.infer<typeof photoAnalysisSchema>;

/** Shape returned to the browser after a successful screening. */
export type PhotoAnalysisResult = Omit<PhotoAnalysis, "assessable" | "imageIssue">;
