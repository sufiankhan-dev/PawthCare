import { Calendar } from "lucide-react";

import { ScheduleAppointmentDialog } from "@/components/clinic/schedule-appointment-dialog";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateTime } from "@/lib/format";
import {
  getAppointmentsByClinic,
  getPatientsByClinic,
} from "@/lib/queries";
import { requireClinic } from "@/lib/session";

export default async function ClinicAppointmentsPage() {
  const user = await requireClinic();
  const clinicId = user.clinicId!;
  const [patients, appointments] = await Promise.all([
    getPatientsByClinic(clinicId),
    getAppointmentsByClinic(clinicId),
  ]);

  return (
    <>
      <PageHeader
        title="Appointments"
        description="Your clinic's schedule."
        action={<ScheduleAppointmentDialog patients={patients} />}
      />
      {appointments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center text-sm text-muted-foreground">
            <Calendar className="size-6" />
            No appointments scheduled.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-1">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>When</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.petName}</TableCell>
                    <TableCell>{a.reason || "—"}</TableCell>
                    <TableCell>{formatDateTime(a.scheduledAt)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{a.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </>
  );
}
