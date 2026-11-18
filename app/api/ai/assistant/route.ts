import type { UIMessage } from "ai";
import { z } from "zod";

import { chatMessagesSchema, streamChatResponse, toGeminiContents } from "@/lib/ai/chat";
import { AI_MODELS } from "@/lib/ai/config";
import { aiErrorResponse } from "@/lib/ai/gemini";
import { petAge } from "@/lib/format";
import {
  getAnalyses,
  getMedications,
  getMedicalRecords,
  getPetById,
  getVaccinations,
  saveChatMessage,
} from "@/lib/queries";
import { getCurrentUser } from "@/lib/session";

export const maxDuration = 60;

const requestSchema = z.object({
  messages: chatMessagesSchema,
  petId: z.string().uuid(),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return new Response("Please sign in again.", { status: 401 });

  const parsed = requestSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return new Response("Invalid request.", { status: 400 });
  const { petId } = parsed.data;

  const converted = toGeminiContents(parsed.data.messages as UIMessage[]);
  if ("error" in converted) return new Response(converted.error, { status: 400 });

  const pet = await getPetById(petId);
  if (!pet) return new Response("Pet not found", { status: 404 });

  const isOwner = pet.ownerId === user.id;
  const isClinician = user.role === "vet" || user.role === "admin";
  if (!isOwner && !isClinician) return new Response("Forbidden", { status: 403 });

  const [vaccinations, medications, records, analyses] = await Promise.all([
    getVaccinations(petId),
    getMedications(petId),
    getMedicalRecords(petId),
    getAnalyses(petId),
  ]);

  const context = [
    `Pet: ${pet.name} (${pet.species}${pet.breed ? `, ${pet.breed}` : ""}), age ${petAge(pet.birthDate)}, sex ${pet.sex ?? "unknown"}.`,
    pet.weightKg ? `Weight: ${pet.weightKg} kg.` : "",
    pet.allergies ? `Allergies: ${pet.allergies}.` : "Allergies: none recorded.",
    vaccinations.length
      ? `Vaccinations: ${vaccinations
          .map((v) => `${v.name} (${v.status})`)
          .join(", ")}.`
      : "No vaccinations recorded.",
    medications.length
      ? `Medications: ${medications
          .map((m) => `${m.name} ${m.dosage ?? ""} ${m.frequency ?? ""}`.trim())
          .join(", ")}.`
      : "No current medications.",
    records.length
      ? `Recent visits: ${records
          .slice(0, 3)
          .map((r) => `${r.type}${r.diagnosis ? ` - ${r.diagnosis}` : ""}`)
          .join("; ")}.`
      : "No clinical visits recorded.",
    analyses.length
      ? `Recent AI screenings: ${analyses
          .slice(0, 3)
          .map((a) => `${a.summary} (risk ${a.riskScore}/100)`)
          .join("; ")}.`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  const system =
    "You are PawthCare, an AI pet-health assistant. Use the pet's records below to give specific, practical guidance. " +
    "Be warm and concise; prefer short paragraphs or brief lists. You are an assistant, not a substitute for a veterinarian: flag anything that needs an in-person vet visit, " +
    "and never give definitive diagnoses or prescribe medication doses.\n\n" +
    `PET RECORD:\n${context}`;

  try {
    const response = streamChatResponse({
      model: AI_MODELS.chat,
      system,
      contents: converted.contents,
      abortSignal: req.signal,
      onFinish: (text) =>
        saveChatMessage({ petId, role: "assistant", content: text }),
    });
    // Persist the user's turn only once we know the AI is reachable.
    await saveChatMessage({ petId, role: "user", content: converted.lastUserText });
    return response;
  } catch (err) {
    return aiErrorResponse(err, "assistant");
  }
}
