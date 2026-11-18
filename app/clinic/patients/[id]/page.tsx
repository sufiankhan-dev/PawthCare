import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText, Sparkles } from "lucide-react";

import { ScreeningHistory } from "@/components/ai/screening-history";
import { BackLink } from "@/components/back-link";
import { AddVisitDialog } from "@/components/clinic/add-visit-dialog";
import { EmptyState } from "@/components/empty-state";
import { PetHeader } from "@/components/pet-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import {
  getAnalyses,
  getMedicalRecords,
  getMedications,
  getPetById,
  getVaccinations,
} from "@/lib/queries";
import { requireClinic } from "@/lib/session";

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireClinic();
  const pet = await getPetById(id);
  if (!pet) notFound();

  const [records, vaccinations, medications, analyses] = await Promise.all([
    getMedicalRecords(pet.id),
    getVaccinations(pet.id),
    getMedications(pet.id),
    getAnalyses(pet.id),
  ]);

  return (
    <>
      <BackLink href="/clinic/patients">All patients</BackLink>
      <PetHeader
        pet={pet}
        meta={
          pet.allergies ? (
            <Badge variant="warning" className="mt-1.5">
              Allergies: {pet.allergies}
            </Badge>
          ) : null
        }
        action={
          <>
            <Button asChild variant="outline">
              <Link href={`/clinic/patients/${pet.id}/assistant`}>
                <Sparkles className="size-4" />
                AI assistant
              </Link>
            </Button>
            <AddVisitDialog petId={pet.id} />
          </>
        }
      />

      <div className="grid items-start gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Medical records</CardTitle>
            </CardHeader>
            <CardContent>
              {records.length === 0 ? (
                <EmptyState icon={<FileText />} title="No visits recorded" className="py-8" />
              ) : (
                <div className="divide-y divide-border/60">
                  {records.map((r) => (
                    <div key={r.id} className="py-3.5 first:pt-0 last:pb-0">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium capitalize">{r.type}</p>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {formatDate(r.visitDate)}
                        </span>
                      </div>
                      {r.diagnosis && <p className="mt-1 text-sm">{r.diagnosis}</p>}
                      {r.notes && (
                        <p className="mt-1 text-sm text-muted-foreground">{r.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {analyses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>AI screenings</CardTitle>
              </CardHeader>
              <CardContent>
                <ScreeningHistory analyses={analyses} limit={6} />
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Vaccinations</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {vaccinations.length === 0 ? (
                <p className="text-sm text-muted-foreground">None recorded.</p>
              ) : (
                vaccinations.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="min-w-0 truncate">{v.name}</span>
                    <Badge
                      variant={v.status === "completed" ? "success" : "warning"}
                    >
                      {v.status === "completed" ? "Done" : "Due"}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Medications</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {medications.length === 0 ? (
                <p className="text-sm text-muted-foreground">None active.</p>
              ) : (
                medications.map((m) => (
                  <div key={m.id} className="text-sm">
                    <p className="font-medium">{m.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {[m.dosage, m.frequency].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
