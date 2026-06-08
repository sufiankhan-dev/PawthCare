import { PawPrint } from "lucide-react";

import { AddPetDialog } from "@/components/owner/add-pet-dialog";
import { PageHeader } from "@/components/page-header";
import { PetCard } from "@/components/pet-card";
import { Card, CardContent } from "@/components/ui/card";
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
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <PawPrint className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No pets yet.</p>
            <AddPetDialog />
          </CardContent>
        </Card>
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
