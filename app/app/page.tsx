import Link from "next/link";
import {
  Calendar,
  PawPrint,
  ScanLine,
  Syringe,
} from "lucide-react";

import { AddPetDialog } from "@/components/owner/add-pet-dialog";
import { PageHeader } from "@/components/page-header";
import { PetCard } from "@/components/pet-card";
import { StatCard } from "@/components/stat-card";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDateTime } from "@/lib/format";
import {
  getAppointmentsByOwner,
  getOwnerStats,
  getPetsByOwner,
} from "@/lib/queries";
import { requireOwner } from "@/lib/session";

export default async function OwnerDashboard() {
  const user = await requireOwner();
  const [stats, pets, appointments] = await Promise.all([
    getOwnerStats(user.id),
    getPetsByOwner(user.id),
    getAppointmentsByOwner(user.id),
  ]);

  const upcoming = appointments
    .filter((a) => new Date(a.scheduledAt) >= new Date())
    .slice(0, 5);

  return (
    <>
      <PageHeader
        title={`Hi, ${user.name.split(" ")[0] || "there"}`}
        description="Your pets' digital health, all in one place."
        action={<AddPetDialog />}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Pets"
          value={stats.pets}
          icon={<PawPrint className="size-5" />}
        />
        <StatCard
          label="Vaccinations due"
          value={stats.dueVaccinations}
          icon={<Syringe className="size-5" />}
          accent={stats.dueVaccinations > 0 ? "warning" : "default"}
        />
        <StatCard
          label="Upcoming visits"
          value={stats.upcomingAppointments}
          icon={<Calendar className="size-5" />}
        />
        <StatCard
          label="AI scans"
          value={stats.analyses}
          icon={<ScanLine className="size-5" />}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">My pets</h2>
            <Link
              href="/app/pets"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              View all
            </Link>
          </div>
          {pets.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
                <PawPrint className="size-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No pets yet. Add your first companion to get started.
                </p>
                <AddPetDialog />
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {pets.map((pet) => (
                <PetCard
                  key={pet.id}
                  pet={pet}
                  href={`/app/pets/${pet.id}`}
                />
              ))}
            </div>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming appointments</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No upcoming appointments.
              </p>
            ) : (
              upcoming.map((a) => (
                <div
                  key={a.id}
                  className="flex items-start gap-3 border-b pb-3 last:border-0 last:pb-0"
                >
                  <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Calendar className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {a.petName} · {a.reason || "Visit"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(a.scheduledAt)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
