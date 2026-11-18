import { Calendar, Sparkles } from "lucide-react";

import { BookAppointmentDialog } from "@/components/owner/book-appointment-dialog";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDateTime } from "@/lib/format";
import {
  getAppointmentsByOwner,
  getLatestAnalysesByOwner,
  getPetsByOwner,
  getVetListings,
} from "@/lib/queries";
import { requireOwner } from "@/lib/session";

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ vetId?: string }>;
}) {
  const user = await requireOwner();
  const { vetId } = await searchParams;
  const [pets, appointments, vets, analyses] = await Promise.all([
    getPetsByOwner(user.id),
    getAppointmentsByOwner(user.id),
    getVetListings(),
    getLatestAnalysesByOwner(user.id),
  ]);

  const now = new Date();
  const upcoming = appointments.filter((a) => new Date(a.scheduledAt) >= now);
  const past = appointments
    .filter((a) => new Date(a.scheduledAt) < now)
    .reverse();

  return (
    <>
      <PageHeader
        title="Appointments"
        description="Schedule and track your vet visits."
        action={
          <BookAppointmentDialog
            pets={pets}
            vets={vets}
            analyses={analyses}
            initialVetId={vetId}
          />
        }
      />

      <Section title="Upcoming" items={upcoming} emptyText="No upcoming appointments." />
      <div className="h-6" />
      <Section title="Past" items={past} emptyText="No past appointments." muted />
    </>
  );
}

function Section({
  title,
  items,
  emptyText,
  muted,
}: {
  title: string;
  items: Awaited<ReturnType<typeof getAppointmentsByOwner>>;
  emptyText: string;
  muted?: boolean;
}) {
  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold">{title}</h2>
      {items.length === 0 ? (
        <EmptyState icon={<Calendar />} title={emptyText} />
      ) : (
        <Card className="gap-0 py-0">
          <div className="divide-y divide-border/60">
          {items.map((a) => (
              <div key={a.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Calendar className="size-4" />
                </span>
                <div className="min-w-0 flex-1 basis-48">
                  <p className="truncate font-medium">
                    {a.petName} · {a.reason || "Visit"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(a.scheduledAt)}
                    {a.vetName ? ` · with ${a.vetName}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5 pl-14 sm:pl-0">
                  {a.sharedAnalysisId ? (
                    <Badge variant="secondary">
                      <Sparkles className="size-3" />
                      Screening shared
                    </Badge>
                  ) : null}
                  <Badge variant={muted ? "secondary" : "outline"} className="capitalize">
                    {a.status}
                  </Badge>
                </div>
              </div>
          ))}
          </div>
        </Card>
      )}
    </div>
  );
}
