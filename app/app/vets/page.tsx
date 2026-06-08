import { VetDirectory } from "@/components/owner/vet-directory";
import { PageHeader } from "@/components/page-header";
import { getVetListings } from "@/lib/queries";
import { requireOwner } from "@/lib/session";

export default async function FindVetPage() {
  await requireOwner();
  const vets = await getVetListings();

  return (
    <>
      <PageHeader
        title="Find a vet"
        description="Trusted partner vets for checkups, illness, and emergencies."
      />

      <VetDirectory vets={vets} />
    </>
  );
}
