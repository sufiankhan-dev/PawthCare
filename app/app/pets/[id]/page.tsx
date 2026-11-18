import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, Stethoscope } from "lucide-react";

import { BackLink } from "@/components/back-link";
import { PassportTabs } from "@/components/owner/passport-tabs";
import { PetHeader } from "@/components/pet-header";
import { Button } from "@/components/ui/button";
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
      <BackLink href="/app/pets">All pets</BackLink>
      <PetHeader pet={pet} />

      {needsAttention && (
        <div className="mb-8 flex flex-col gap-4 rounded-2xl bg-amber-500/[0.08] p-4 sm:flex-row sm:items-center sm:p-5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400">
            <AlertTriangle className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-medium">{pet.name} may need a vet visit</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              A recent AI screening flagged something to watch. Book a checkup or
              find a clinic nearby.
            </p>
          </div>
          <Button asChild variant="outline" className="w-full sm:w-auto">
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
