import Link from "next/link";
import {
  AlertTriangle,
  Calendar,
  Receipt,
  ScanLine,
  Users,
} from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDateTime, URGENCY_META } from "@/lib/format";
import {
  getAppointmentsByClinic,
  getClinicById,
  getClinicStats,
  getEarlyDetections,
} from "@/lib/queries";
import { requireClinic } from "@/lib/session";

export default async function ClinicDashboard() {
  const user = await requireClinic();
  const clinicId = user.clinicId!;
  const [clinic, stats, appointments, alerts] = await Promise.all([
    getClinicById(clinicId),
    getClinicStats(clinicId),
    getAppointmentsByClinic(clinicId),
    getEarlyDetections(clinicId),
  ]);

  const upcoming = appointments
    .filter((a) => new Date(a.scheduledAt) >= new Date())
    .slice(0, 6);

  return (
    <>
      <PageHeader
        title={clinic?.name ?? "Clinic dashboard"}
        description="Practice overview and AI-flagged cases."
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label="Patients"
          value={stats.patients}
          icon={<Users className="size-5" />}
        />
        <StatCard
          label="Upcoming visits"
          value={stats.upcomingAppointments}
          icon={<Calendar className="size-5" />}
        />
        <StatCard
          label="AI early detections"
          value={stats.earlyDetections}
          icon={<ScanLine className="size-5" />}
          accent={stats.earlyDetections > 0 ? "warning" : "default"}
        />
        <StatCard
          label="Unpaid"
          value={`$${stats.unpaidTotal.toFixed(0)}`}
          icon={<Receipt className="size-5" />}
        />
      </div>

      <div className="mt-10 grid items-start gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-amber-500" />
              AI early detections
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {alerts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No flagged cases right now.
              </p>
            ) : (
              alerts.map((a) => {
                const meta = URGENCY_META[a.urgency] ?? URGENCY_META.routine;
                return (
                  <Link
                    key={a.id}
                    href={`/clinic/patients/${a.petId}`}
                    className="flex items-start justify-between gap-3 border-b border-border/60 pb-3 last:border-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {a.petName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {a.summary}
                      </p>
                    </div>
                    <Badge variant={meta.badge}>{meta.label}</Badge>
                  </Link>
                );
              })
            )}
          </CardContent>
        </Card>

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
                  className="flex items-center gap-3 border-b border-border/60 pb-3 last:border-0 last:pb-0"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Calendar className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
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
