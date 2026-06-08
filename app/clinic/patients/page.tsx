import Link from "next/link";
import { Users } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { petAge, speciesEmoji } from "@/lib/format";
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
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <Users className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No patients yet. Pets added by owners will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {patients.map((p) => (
            <Link
              key={p.id}
              href={`/clinic/patients/${p.id}`}
              className="group block"
            >
              <Card className="transition-shadow group-hover:shadow-md">
                <CardContent className="flex items-center gap-4 py-1">
                  <span className="flex size-12 items-center justify-center rounded-full bg-muted text-2xl">
                    {speciesEmoji(p.species)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{p.name}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {p.breed || p.species} · {petAge(p.birthDate)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
