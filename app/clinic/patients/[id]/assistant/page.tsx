import { notFound } from "next/navigation";
import type { UIMessage } from "ai";

import { BackLink } from "@/components/back-link";
import { AssistantChat } from "@/components/ai/assistant-chat";
import { getChatMessages, getPetById } from "@/lib/queries";
import { requireClinic } from "@/lib/session";

export default async function ClinicAssistantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireClinic();
  const pet = await getPetById(id);
  if (!pet) notFound();

  const history = await getChatMessages(pet.id);
  const initialMessages: UIMessage[] = history.map((m) => ({
    id: m.id,
    role: m.role === "assistant" ? "assistant" : "user",
    parts: [{ type: "text", text: m.content }],
  }));

  return (
    <>
      <BackLink href={`/clinic/patients/${pet.id}`}>Back to {pet.name}</BackLink>
      <AssistantChat
        petId={pet.id}
        petName={pet.name}
        initialMessages={initialMessages}
      />
    </>
  );
}
