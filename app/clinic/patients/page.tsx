import { Users } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { PetCard } from "@/components/pet-card";
import { getPatientsByClinic } from "@/lib/queries";
import { requireClinic } from "@/lib/session";

export default async function PatientsPage() {
  const user = await requireClinic();
  const patients = await getPatientsByClinic(user.clinicId!);

  return (
    <>
      <PageHeader
        title="Patients"
        description="All pets registered with your clinic."
      />
      {patients.length === 0 ? (
        <EmptyState
          icon={<Users />}
          title="No patients yet"
          description="Pets added by owners will appear here."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {patients.map((p) => (
            <PetCard key={p.id} pet={p} href={`/clinic/patients/${p.id}`} />
          ))}
        </div>
      )}
    </>
  );
}
