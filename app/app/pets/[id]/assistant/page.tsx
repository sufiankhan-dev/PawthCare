import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { UIMessage } from "ai";

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
      <Link
        href={`/app/pets/${pet.id}`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to {pet.name}
      </Link>
      <AssistantChat
        petId={pet.id}
        petName={pet.name}
        initialMessages={initialMessages}
      />
    </>
  );
}
