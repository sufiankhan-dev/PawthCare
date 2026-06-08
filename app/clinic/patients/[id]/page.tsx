import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";

import { AnalysisView } from "@/components/ai/analysis-view";
import { AddVisitDialog } from "@/components/clinic/add-visit-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, petAge, speciesEmoji } from "@/lib/format";
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
      <Link
        href="/clinic/patients"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        All patients
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="flex size-16 items-center justify-center rounded-2xl bg-muted text-3xl">
            {speciesEmoji(pet.species)}
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{pet.name}</h1>
            <p className="text-sm text-muted-foreground">
              {pet.breed || pet.species} · {petAge(pet.birthDate)}
              {pet.weightKg ? ` · ${pet.weightKg} kg` : ""}
            </p>
            {pet.allergies && (
              <Badge variant="warning" className="mt-1">
                Allergies: {pet.allergies}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/clinic/patients/${pet.id}/assistant`}>
              <Sparkles className="size-4" />
              AI assistant
            </Link>
          </Button>
          <AddVisitDialog petId={pet.id} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Medical records (EMR)</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {records.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No visits recorded.
                </p>
              ) : (
                records.map((r) => (
                  <div
                    key={r.id}
                    className="rounded-lg border p-3 last:mb-0"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium capitalize">{r.type}</p>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(r.visitDate)}
                      </span>
                    </div>
                    {r.diagnosis && <p className="mt-1 text-sm">{r.diagnosis}</p>}
                    {r.notes && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {r.notes}
                      </p>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {analyses.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>AI screenings</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {analyses.slice(0, 4).map((a) => (
                  <div key={a.id} className="rounded-xl border bg-muted/30 p-4">
                    <p className="mb-2 text-xs text-muted-foreground">
                      {formatDate(a.createdAt)}
                    </p>
                    <AnalysisView
                      summary={a.summary}
                      riskScore={a.riskScore}
                      urgency={a.urgency}
                      findings={a.findings}
                      recommendations={a.recommendations}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Vaccinations</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {vaccinations.length === 0 ? (
                <p className="text-sm text-muted-foreground">None recorded.</p>
              ) : (
                vaccinations.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>{v.name}</span>
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
            <CardContent className="flex flex-col gap-2">
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
