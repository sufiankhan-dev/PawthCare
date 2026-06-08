import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { PassportTabs } from "@/components/owner/passport-tabs";
import { petAge, speciesEmoji } from "@/lib/format";
import {
  getAnalyses,
  getMedicalRecords,
  getMedications,
  getPetForOwner,
  getVaccinations,
} from "@/lib/queries";
import { requireOwner } from "@/lib/session";

export default async function PetPassportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireOwner();
  const pet = await getPetForOwner(id, user.id);
  if (!pet) notFound();

  const [vaccinations, medications, records, analyses] = await Promise.all([
    getVaccinations(pet.id),
    getMedications(pet.id),
    getMedicalRecords(pet.id),
    getAnalyses(pet.id),
  ]);

  return (
    <>
      <Link
        href="/app/pets"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        All pets
      </Link>

      <div className="mb-6 flex items-center gap-4">
        <span className="flex size-16 items-center justify-center rounded-2xl bg-muted text-3xl">
          {speciesEmoji(pet.species)}
        </span>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{pet.name}</h1>
          <p className="text-sm text-muted-foreground">
            {pet.breed || pet.species} · {petAge(pet.birthDate)}
            {pet.weightKg ? ` · ${pet.weightKg} kg` : ""}
          </p>
        </div>
      </div>

      <PassportTabs
        pet={pet}
        vaccinations={vaccinations}
        medications={medications}
        records={records}
        analyses={analyses}
      />
    </>
  );
}
