import { PawPrint } from "lucide-react";

import { AddPetDialog } from "@/components/owner/add-pet-dialog";
import { PageHeader } from "@/components/page-header";
import { PetCard } from "@/components/pet-card";
import { EmptyState } from "@/components/empty-state";
import { getPetsByOwner } from "@/lib/queries";
import { requireOwner } from "@/lib/session";

export default async function PetsPage() {
  const user = await requireOwner();
  const pets = await getPetsByOwner(user.id);

  return (
    <>
      <PageHeader
        title="My pets"
        description="Every companion's lifelong health record."
        action={<AddPetDialog />}
      />
      {pets.length === 0 ? (
        <EmptyState
          icon={<PawPrint />}
          title="No pets yet"
          description="Add your first companion to start their health record."
          action={<AddPetDialog />}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {pets.map((pet) => (
            <PetCard key={pet.id} pet={pet} href={`/app/pets/${pet.id}`} />
          ))}
        </div>
      )}
    </>
  );
}
