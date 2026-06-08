import { convertToModelMessages, streamText, type UIMessage } from "ai";

import { AI_MODELS } from "@/lib/ai";
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

export const maxDuration = 30;

function textOf(message: UIMessage): string {
  return message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join(" ")
    .trim();
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { messages, petId } = (await req.json()) as {
    messages: UIMessage[];
    petId: string;
  };

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
    "You are PawPulse, an AI pet-health assistant. Use the pet's records below to give specific, practical guidance. " +
    "Be warm and concise. You are an assistant, not a substitute for a veterinarian: flag anything that needs an in-person vet visit, " +
    "and never give definitive diagnoses or prescribe medication doses.\n\n" +
    `PET RECORD:\n${context}`;

  const lastUser = messages[messages.length - 1];
  if (lastUser?.role === "user") {
    const content = textOf(lastUser);
    if (content) {
      await saveChatMessage({ petId, role: "user", content });
    }
  }

  const result = streamText({
    model: AI_MODELS.chat,
    system,
    messages: await convertToModelMessages(messages),
    onFinish: async ({ text }) => {
      if (text.trim()) {
        await saveChatMessage({ petId, role: "assistant", content: text });
      }
    },
  });

  return result.toUIMessageStreamResponse();
}
