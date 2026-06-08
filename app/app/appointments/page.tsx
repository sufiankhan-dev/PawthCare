import { Calendar } from "lucide-react";

import { BookAppointmentDialog } from "@/components/owner/book-appointment-dialog";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateTime } from "@/lib/format";
import {
  getAppointmentsByOwner,
  getPetsByOwner,
  getVetListings,
} from "@/lib/queries";
import { requireOwner } from "@/lib/session";

export default async function AppointmentsPage() {
  const user = await requireOwner();
  const [pets, appointments, vets] = await Promise.all([
    getPetsByOwner(user.id),
    getAppointmentsByOwner(user.id),
    getVetListings(),
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
        action={<BookAppointmentDialog pets={pets} vets={vets} />}
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
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            {emptyText}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-2">
          {items.map((a) => (
            <Card key={a.id}>
              <CardContent className="flex items-center gap-4 py-1">
                <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Calendar className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">
                    {a.petName} · {a.reason || "Visit"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(a.scheduledAt)}
                    {a.vetName ? ` · with ${a.vetName}` : ""}
                  </p>
                </div>
                <Badge variant={muted ? "secondary" : "outline"}>
                  {a.status}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
