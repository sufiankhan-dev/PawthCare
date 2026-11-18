"use client";

import Link from "next/link";
import {
  CalendarClock,
  FileText,
  MessageCircleHeart,
  Pill,
  ScanLine,
  Syringe,
} from "lucide-react";

import { PhotoAnalyzer } from "@/components/ai/photo-analyzer";
import { ScreeningHistory } from "@/components/ai/screening-history";
import { EmptyState } from "@/components/empty-state";
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
    <Tabs defaultValue="overview" className="gap-6">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="ai">AI Health</TabsTrigger>
        <TabsTrigger value="vaccinations">Vaccinations</TabsTrigger>
        <TabsTrigger value="medications">Medications</TabsTrigger>
        <TabsTrigger value="records">Records</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-x-4 gap-y-5 text-sm">
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
            <CardContent className="text-sm leading-relaxed text-muted-foreground">
              {pet.notes || "No notes yet."}
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="ai">
        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          <PhotoAnalyzer
            petId={pet.id}
            petName={pet.name}
            unlimited={screeningsUnlimited}
            screeningsLeft={screeningsLeft}
          />
          <div className="flex flex-col gap-4">
            <Card>
              <CardContent className="flex items-start gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <MessageCircleHeart className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">Ask the AI assistant</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Chat about {pet.name}&apos;s symptoms and care, grounded in
                    their records.
                  </p>
                  <Button asChild variant="outline" size="sm" className="mt-3">
                    <Link href={`/app/pets/${pet.id}/assistant`}>
                      Open assistant
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Past screenings</CardTitle>
              </CardHeader>
              <CardContent>
                {analyses.length > 0 ? (
                  <ScreeningHistory analyses={analyses} />
                ) : (
                  <EmptyState
                    icon={<ScanLine />}
                    title="No screenings yet"
                    description="Results from photo screenings will appear here."
                    className="py-8"
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="vaccinations">
        <SectionHeader
          icon={<Syringe className="size-4" />}
          title="Vaccinations"
          action={<AddVaccinationDialog petId={pet.id} />}
        />
        {vaccinations.length === 0 ? (
          <EmptyState icon={<Syringe />} title="No vaccinations recorded yet" />
        ) : (
          <ListCard>
            {vaccinations.map((v) => (
              <ListRow
                key={v.id}
                title={v.name}
                subtitle={
                  (v.administeredDate
                    ? `Given ${formatDate(v.administeredDate)}`
                    : "Not yet given") +
                  (v.dueDate ? ` · Next ${formatDate(v.dueDate)}` : "")
                }
                trailing={
                  <Badge variant={v.status === "completed" ? "success" : "warning"}>
                    {v.status === "completed" ? "Up to date" : "Due"}
                  </Badge>
                }
              />
            ))}
          </ListCard>
        )}
      </TabsContent>

      <TabsContent value="medications">
        <SectionHeader
          icon={<Pill className="size-4" />}
          title="Medications"
          action={<AddMedicationDialog petId={pet.id} />}
        />
        {medications.length === 0 ? (
          <EmptyState icon={<Pill />} title="No medications recorded yet" />
        ) : (
          <ListCard>
            {medications.map((m) => (
              <ListRow
                key={m.id}
                title={m.name}
                subtitle={
                  [m.dosage, m.frequency].filter(Boolean).join(" · ") ||
                  "No schedule set"
                }
                trailing={
                  m.reminderTime ? (
                    <Badge variant="secondary">
                      <CalendarClock className="size-3" />
                      {m.reminderTime}
                    </Badge>
                  ) : null
                }
              />
            ))}
          </ListCard>
        )}
      </TabsContent>

      <TabsContent value="records">
        <SectionHeader
          icon={<FileText className="size-4" />}
          title="Medical records"
        />
        {records.length === 0 ? (
          <EmptyState icon={<FileText />} title="No clinical visits recorded yet" />
        ) : (
          <ListCard>
            {records.map((r) => (
              <div key={r.id} className="px-5 py-4">
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
          </ListCard>
        )}
      </TabsContent>
    </Tabs>
  );
}

function Fact({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 truncate font-medium capitalize">{value || "—"}</p>
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
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        <span className="text-muted-foreground">{icon}</span>
        {title}
      </h2>
      {action}
    </div>
  );
}

/** One soft card holding a divided list, instead of a card per row. */
function ListCard({ children }: { children: React.ReactNode }) {
  return (
    <Card className="gap-0 py-0">
      <div className="divide-y divide-border/60">{children}</div>
    </Card>
  );
}

function ListRow({
  title,
  subtitle,
  trailing,
}: {
  title: string;
  subtitle: string;
  trailing?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4">
      <div className="min-w-0">
        <p className="truncate font-medium">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
      </div>
      {trailing}
    </div>
  );
}
