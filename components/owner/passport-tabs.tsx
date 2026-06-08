"use client";

import Link from "next/link";
import {
  CalendarClock,
  FileText,
  Pill,
  Sparkles,
  Syringe,
} from "lucide-react";

import { AnalysisView } from "@/components/ai/analysis-view";
import { PhotoAnalyzer } from "@/components/ai/photo-analyzer";
import {
  AddMedicationDialog,
  AddVaccinationDialog,
} from "@/components/owner/passport-dialogs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { formatDate } from "@/lib/format";
import type {
  AiAnalysis,
  Medication,
  MedicalRecord,
  Pet,
  Vaccination,
} from "@/lib/types";

export function PassportTabs({
  pet,
  vaccinations,
  medications,
  records,
  analyses,
  screeningsUnlimited = true,
  screeningsLeft = Infinity,
}: {
  pet: Pet;
  vaccinations: Vaccination[];
  medications: Medication[];
  records: MedicalRecord[];
  analyses: AiAnalysis[];
  screeningsUnlimited?: boolean;
  screeningsLeft?: number;
}) {
  return (
    <Tabs defaultValue="overview">
      <TabsList className="flex-wrap">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="vaccinations">Vaccinations</TabsTrigger>
        <TabsTrigger value="medications">Medications</TabsTrigger>
        <TabsTrigger value="records">Records</TabsTrigger>
        <TabsTrigger value="ai">AI Health</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 text-sm">
              <Fact label="Species" value={pet.species} />
              <Fact label="Breed" value={pet.breed} />
              <Fact label="Sex" value={pet.sex} />
              <Fact label="Birth date" value={formatDate(pet.birthDate)} />
              <Fact
                label="Weight"
                value={pet.weightKg ? `${pet.weightKg} kg` : null}
              />
              <Fact label="Allergies" value={pet.allergies} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {pet.notes || "No notes yet."}
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="vaccinations">
        <SectionHeader
          icon={<Syringe className="size-4" />}
          title="Vaccinations"
          action={<AddVaccinationDialog petId={pet.id} />}
        />
        {vaccinations.length === 0 ? (
          <EmptyState text="No vaccinations recorded yet." />
        ) : (
          <div className="grid gap-2">
            {vaccinations.map((v) => (
              <Card key={v.id}>
                <CardContent className="flex items-center justify-between py-1">
                  <div>
                    <p className="font-medium">{v.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {v.administeredDate
                        ? `Given ${formatDate(v.administeredDate)}`
                        : "Not yet given"}
                      {v.dueDate ? ` · Next ${formatDate(v.dueDate)}` : ""}
                    </p>
                  </div>
                  <Badge
                    variant={v.status === "completed" ? "success" : "warning"}
                  >
                    {v.status === "completed" ? "Up to date" : "Due"}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="medications">
        <SectionHeader
          icon={<Pill className="size-4" />}
          title="Medications"
          action={<AddMedicationDialog petId={pet.id} />}
        />
        {medications.length === 0 ? (
          <EmptyState text="No medications recorded yet." />
        ) : (
          <div className="grid gap-2">
            {medications.map((m) => (
              <Card key={m.id}>
                <CardContent className="flex items-center justify-between py-1">
                  <div>
                    <p className="font-medium">{m.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {[m.dosage, m.frequency].filter(Boolean).join(" · ") ||
                        "No schedule set"}
                    </p>
                  </div>
                  {m.reminderTime && (
                    <Badge variant="secondary">
                      <CalendarClock className="mr-1 size-3" />
                      {m.reminderTime}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="records">
        <SectionHeader
          icon={<FileText className="size-4" />}
          title="Medical records"
        />
        {records.length === 0 ? (
          <EmptyState text="No clinical visits recorded yet." />
        ) : (
          <div className="grid gap-2">
            {records.map((r) => (
              <Card key={r.id}>
                <CardContent className="py-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium capitalize">{r.type}</p>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(r.visitDate)}
                    </span>
                  </div>
                  {r.diagnosis && (
                    <p className="mt-1 text-sm">{r.diagnosis}</p>
                  )}
                  {r.notes && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {r.notes}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="ai">
        <div className="grid gap-4 lg:grid-cols-2">
          <PhotoAnalyzer
            petId={pet.id}
            unlimited={screeningsUnlimited}
            screeningsLeft={screeningsLeft}
          />
          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="size-4 text-primary" />
                  Ask the AI assistant
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-3 text-sm text-muted-foreground">
                  Chat about {pet.name}&apos;s symptoms and care, grounded in
                  their records.
                </p>
                <Button asChild>
                  <Link href={`/app/pets/${pet.id}/assistant`}>
                    Open assistant
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {analyses.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Past screenings</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  {analyses.slice(0, 3).map((a) => (
                    <div
                      key={a.id}
                      className="rounded-xl border bg-muted/30 p-4"
                    >
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
        </div>
      </TabsContent>
    </Tabs>
  );
}

function Fact({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="capitalize">{value || "—"}</p>
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        {icon}
        {title}
      </h2>
      {action}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <Card>
      <CardContent className="py-8 text-center text-sm text-muted-foreground">
        {text}
      </CardContent>
    </Card>
  );
}
