import { convertToModelMessages, streamText, type UIMessage } from "ai";

import { AI_MODELS } from "@/lib/ai";
import { petAge } from "@/lib/format";
import { getPetsByOwner } from "@/lib/queries";
import { getCurrentUser } from "@/lib/session";

export const maxDuration = 30;

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { messages } = (await req.json()) as { messages: UIMessage[] };

  let petContext = "";
  if (user.role === "owner") {
    try {
      const pets = await getPetsByOwner(user.id);
      if (pets.length) {
        petContext =
          "The user's pets: " +
          pets
            .map(
              (p) =>
                `${p.name} (${p.species}${p.breed ? `, ${p.breed}` : ""}, age ${petAge(p.birthDate)})`,
            )
            .join("; ") +
          ".";
      }
    } catch {
      // context is best-effort; ignore failures
    }
  }

  const system =
    "You are PawthCare's AI assistant, embedded in the PawthCare digital pet-health platform. " +
    "Help the user with three things: (1) questions about PawthCare and how to use it — the digital pet passport, " +
    "AI photo screening, vaccination & medication reminders, appointments, and clinic tools; (2) general pet care and " +
    "wellness for dogs and cats; and (3) understanding common pet diseases, their symptoms, and when to see a vet. " +
    "Be warm, clear, and concise. You are a helpful assistant, not a substitute for a veterinarian: never give definitive " +
    "diagnoses or specific medication doses, and clearly recommend an in-person vet visit for anything urgent or serious. " +
    "If asked about topics unrelated to pets or PawthCare, gently steer the conversation back.\n\n" +
    `User: ${user.name || "there"} (role: ${user.role}).` +
    (petContext ? `\n${petContext}` : "");

  const result = streamText({
    model: AI_MODELS.chat,
    system,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
