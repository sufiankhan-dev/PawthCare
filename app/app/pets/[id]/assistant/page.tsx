import { notFound } from "next/navigation";
import type { UIMessage } from "ai";

import { BackLink } from "@/components/back-link";
import { AssistantChat } from "@/components/ai/assistant-chat";
import { getChatMessages, getPetForOwner } from "@/lib/queries";
import { requireOwner } from "@/lib/session";

export default async function AssistantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireOwner();
  const pet = await getPetForOwner(id, user.id);
  if (!pet) notFound();

  const history = await getChatMessages(pet.id);
  const initialMessages: UIMessage[] = history.map((m) => ({
    id: m.id,
    role: m.role === "assistant" ? "assistant" : "user",
    parts: [{ type: "text", text: m.content }],
  }));

  return (
    <>
      <BackLink href={`/app/pets/${pet.id}`}>Back to {pet.name}</BackLink>
      <AssistantChat
        petId={pet.id}
        petName={pet.name}
        initialMessages={initialMessages}
      />
    </>
  );
}
