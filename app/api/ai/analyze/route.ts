import { z } from "zod";

import { AI_MODELS } from "@/lib/ai/config";
import { aiErrorResponse, generateStructured } from "@/lib/ai/gemini";
import {
  MAX_IMAGE_PAYLOAD_CHARS,
  SUPPORTED_IMAGE_TYPES,
  photoAnalysisSchema,
  type PhotoAnalysisResult,
} from "@/lib/ai/schemas";
import { petAge } from "@/lib/format";
import {
  getPetById,
  getUserBilling,
  incrementScreeningUsage,
  saveAnalysis,
} from "@/lib/queries";
import { getCurrentUser } from "@/lib/session";

export const maxDuration = 60;

/** Thumbnails larger than this are not stored with the screening record. */
const MAX_THUMB_CHARS = 400_000;

const requestSchema = z.object({
  petId: z.string({ error: "A pet is required" }).uuid("Invalid pet id"),
  image: z
    .string({ error: "Please choose a photo to analyze." })
    .min(1, "Please choose a photo to analyze.")
    .max(MAX_IMAGE_PAYLOAD_CHARS, "That image is too large. Please use a smaller photo."),
  thumbnail: z.string().max(MAX_THUMB_CHARS).optional(),
  focus: z.string().trim().max(300, "Keep your note under 300 characters").optional(),
});

const SYSTEM_PROMPT = [
  "You are a veterinary triage assistant reviewing a single photo of a pet.",
  "Report only health observations that are actually visible: skin, eyes, ears, coat, teeth, wounds, body condition, posture.",
  "Never invent findings that cannot be seen. If the animal looks healthy, say so, keep riskScore low, and return few or no findings.",
  "If the photo does not show an animal, or is too blurry, dark, or obstructed to assess, set assessable to false and explain why in imageIssue.",
  "You are an assistant, not a diagnosis: be cautious, note uncertainty, and recommend a licensed veterinarian for anything concerning.",
  "Calibrate riskScore and urgency strictly to what is visible. Reserve 'urgent' for visible emergencies (heavy bleeding, deep wounds, severe swelling, eye injuries).",
].join(" ");

function parseImageDataUrl(
  dataUrl: string,
): { mimeType: string; data: string } | null {
  const match = /^data:([a-z0-9.+/-]+);base64,([A-Za-z0-9+/=]+)$/i.exec(dataUrl);
  if (!match) return null;
  const mimeType = match[1].toLowerCase();
  if (!(SUPPORTED_IMAGE_TYPES as readonly string[]).includes(mimeType)) return null;
  return { mimeType, data: match[2] };
}

/** Prefer the small client thumbnail; fall back to the image if it's small. */
function pickThumbnail(thumbnail: string | undefined, image: string): string | null {
  if (thumbnail && parseImageDataUrl(thumbnail)) return thumbnail;
  return image.length < MAX_THUMB_CHARS ? image : null;
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "Please sign in again." }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsedBody = requestSchema.safeParse(json);
  if (!parsedBody.success) {
    return Response.json(
      { error: parsedBody.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 },
    );
  }
  const body = parsedBody.data;

  const image = parseImageDataUrl(body.image);
  if (!image) {
    return Response.json(
      { error: "Unsupported image. Please upload a JPEG, PNG, WebP, or HEIC photo.", code: "unsupported_format" },
      { status: 415 },
    );
  }

  const pet = await getPetById(body.petId);
  if (!pet) return Response.json({ error: "Pet not found." }, { status: 404 });

  const isOwner = pet.ownerId === user.id;
  const isClinician = user.role === "vet" || user.role === "admin";
  if (!isOwner && !isClinician) {
    return Response.json({ error: "You don't have access to this pet." }, { status: 403 });
  }

  // Free plan: enforce the monthly AI screening limit for pet owners.
  const billing = isClinician ? null : await getUserBilling(user.id);
  if (billing && !billing.unlimited && billing.screeningsLeft <= 0) {
    return Response.json(
      {
        error: `You've used all ${billing.screeningsLimit} free screenings this month. Upgrade to Guardian for unlimited AI screening.`,
        code: "limit_reached",
      },
      { status: 402 },
    );
  }

  const context =
    `Pet: ${pet.name}, species ${pet.species}, breed ${pet.breed ?? "unknown"}, ` +
    `age ${petAge(pet.birthDate)}, known allergies: ${pet.allergies ?? "none"}.` +
    (body.focus ? ` The owner is concerned about: "${body.focus}".` : "") +
    " Analyze the attached photo.";

  let analysis;
  try {
    analysis = await generateStructured({
      model: AI_MODELS.vision,
      system: SYSTEM_PROMPT,
      schema: photoAnalysisSchema,
      parts: [{ text: context }, { inlineData: image }],
    });
  } catch (err) {
    return aiErrorResponse(err, "analyze");
  }

  // Don't save, count, or display results for photos the model couldn't assess.
  if (!analysis.assessable) {
    return Response.json(
      {
        error:
          analysis.imageIssue.trim() ||
          "We couldn't assess this photo. Try a clear, well-lit photo of your pet.",
        code: "unassessable",
      },
      { status: 422 },
    );
  }

  const result: PhotoAnalysisResult = {
    confidence: analysis.confidence,
    summary: analysis.summary.trim(),
    riskScore: Math.round(analysis.riskScore),
    urgency: analysis.urgency,
    findings: analysis.findings,
    recommendations: analysis.recommendations.filter((r) => r.trim()),
  };

  try {
    await saveAnalysis({
      petId: pet.id,
      thumbUrl: pickThumbnail(body.thumbnail, body.image),
      riskScore: result.riskScore,
      urgency: result.urgency,
      findings: result.findings,
      summary: result.summary,
      recommendations: result.recommendations,
    });

    // Count usage only for limited (free) plans, after a successful screening.
    if (billing && !billing.unlimited) {
      await incrementScreeningUsage(user.id);
    }
  } catch (err) {
    console.error("[ai:analyze] failed to save screening", err);
    return Response.json(
      { error: "The screening finished but couldn't be saved. Please try again." },
      { status: 500 },
    );
  }

  return Response.json(result);
}
