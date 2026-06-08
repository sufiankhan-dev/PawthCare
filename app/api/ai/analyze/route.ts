import { generateObject } from "ai";
import { z } from "zod";

import { AI_MODELS, URGENCY_LEVELS } from "@/lib/ai";
import {
  getPetById,
  getUserBilling,
  incrementScreeningUsage,
  saveAnalysis,
} from "@/lib/queries";
import { petAge } from "@/lib/format";
import { getCurrentUser } from "@/lib/session";

export const maxDuration = 60;

const analysisSchema = z.object({
  summary: z
    .string()
    .describe("A short, plain-language summary of what the photo shows."),
  riskScore: z
    .number()
    .min(0)
    .max(100)
    .describe("Overall health-risk score from 0 (healthy) to 100 (severe)."),
  urgency: z.enum(URGENCY_LEVELS),
  findings: z
    .array(
      z.object({
        label: z.string(),
        severity: z.enum(["low", "moderate", "high"]),
        detail: z.string(),
      }),
    )
    .describe("Specific observations visible in the photo."),
  recommendations: z.array(z.string()),
});

function parseDataUrl(dataUrl: string): { mediaType: string; data: string } {
  const match = /^data:([^;]+);base64,(.*)$/.exec(dataUrl);
  if (!match) return { mediaType: "image/jpeg", data: dataUrl };
  return { mediaType: match[1], data: dataUrl };
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const body = (await req.json()) as {
    petId?: string;
    image?: string;
    focus?: string;
  };
  if (!body.petId || !body.image) {
    return Response.json({ error: "petId and image are required" }, { status: 400 });
  }

  const pet = await getPetById(body.petId);
  if (!pet) return Response.json({ error: "Pet not found" }, { status: 404 });

  const isOwner = pet.ownerId === user.id;
  const isClinician = user.role === "vet" || user.role === "admin";
  if (!isOwner && !isClinician) {
    return new Response("Forbidden", { status: 403 });
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

  const { mediaType, data } = parseDataUrl(body.image);

  try {
    const { object } = await generateObject({
      model: AI_MODELS.vision,
      schema: analysisSchema,
      messages: [
        {
          role: "system",
          content:
            "You are a veterinary triage assistant. Analyze the pet photo and report visible health observations (skin, eyes, ears, coat, body condition, posture). " +
            "You are an assistant, not a diagnosis: be cautious, note uncertainty, and recommend a licensed veterinarian for anything concerning. " +
            "Calibrate riskScore and urgency to what is actually visible.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text:
                `Pet: ${pet.name}, species ${pet.species}, breed ${pet.breed ?? "unknown"}, ` +
                `age ${petAge(pet.birthDate)}, known allergies: ${pet.allergies ?? "none"}. ` +
                (body.focus ? `Owner is concerned about: ${body.focus}. ` : "") +
                "Analyze the attached photo.",
            },
            { type: "file", mediaType, data },
          ],
        },
      ],
    });

    const thumbUrl = body.image.length < 400_000 ? body.image : null;

    await saveAnalysis({
      petId: pet.id,
      thumbUrl,
      riskScore: Math.round(object.riskScore),
      urgency: object.urgency,
      findings: object.findings,
      summary: object.summary,
      recommendations: object.recommendations,
    });

    // Count usage only for limited (free) plans, after a successful screening.
    if (billing && !billing.unlimited) {
      await incrementScreeningUsage(user.id);
    }

    return Response.json(object);
  } catch (err) {
    console.error("AI analyze error", err);
    return Response.json(
      { error: "Analysis failed. Check AI_GATEWAY_API_KEY and try again." },
      { status: 500 },
    );
  }
}
