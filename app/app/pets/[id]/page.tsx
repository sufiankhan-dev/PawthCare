import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, ArrowLeft, Stethoscope } from "lucide-react";

import { PassportTabs } from "@/components/owner/passport-tabs";
import { Button } from "@/components/ui/button";
import { petAge, speciesEmoji } from "@/lib/format";
import {
  getAnalyses,
  getMedicalRecords,
  getMedications,
  getPetForOwner,
  getUserBilling,
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

  const [vaccinations, medications, records, analyses, billing] =
    await Promise.all([
      getVaccinations(pet.id),
      getMedications(pet.id),
      getMedicalRecords(pet.id),
      getAnalyses(pet.id),
      getUserBilling(user.id),
    ]);

  const latest = analyses[0];
  const needsAttention =
    !!latest &&
    (latest.urgency === "soon" ||
      latest.urgency === "urgent" ||
      latest.riskScore >= 50);

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

      {needsAttention && (
        <div className="mb-6 flex flex-wrap items-center gap-4 rounded-xl border border-amber-300/70 bg-amber-50 p-4 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600">
            <AlertTriangle className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-medium">{pet.name} may need a vet visit</p>
            <p className="text-sm text-amber-800/80 dark:text-amber-200/70">
              A recent AI screening flagged something to watch. Book a checkup or
              find a clinic nearby.
            </p>
          </div>
          <Button asChild className="bg-amber-600 hover:bg-amber-700">
            <Link href="/app/vets">
              <Stethoscope className="size-4" />
              Find a vet
            </Link>
          </Button>
        </div>
      )}

      <PassportTabs
        pet={pet}
        vaccinations={vaccinations}
        medications={medications}
        records={records}
        analyses={analyses}
        screeningsUnlimited={billing.unlimited}
        screeningsLeft={
          Number.isFinite(billing.screeningsLeft) ? billing.screeningsLeft : 0
        }
      />
    </>
  );
}
