import { Receipt } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/format";
import { getClinicStats, getInvoicesByClinic } from "@/lib/queries";
import { requireClinic } from "@/lib/session";

export default async function BillingPage() {
  const user = await requireClinic();
  const clinicId = user.clinicId!;
  const [invoices, stats] = await Promise.all([
    getInvoicesByClinic(clinicId),
    getClinicStats(clinicId),
  ]);

  const total = invoices.reduce((sum, i) => sum + Number(i.amount), 0);
  const paid = invoices
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + Number(i.amount), 0);

  return (
    <>
      <PageHeader title="Billing" description="Invoices and payments." />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Billed total"
          value={`$${total.toFixed(0)}`}
          icon={<Receipt className="size-5" />}
        />
        <StatCard
          label="Collected"
          value={`$${paid.toFixed(0)}`}
          icon={<Receipt className="size-5" />}
        />
        <StatCard
          label="Outstanding"
          value={`$${stats.unpaidTotal.toFixed(0)}`}
          icon={<Receipt className="size-5" />}
          accent={stats.unpaidTotal > 0 ? "warning" : "default"}
        />
      </div>

      <div className="mt-6">
        {invoices.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              No invoices yet.
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-1">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((i) => (
                    <TableRow key={i.id}>
                      <TableCell className="font-medium">
                        {i.petName ?? "—"}
                      </TableCell>
                      <TableCell>{formatDate(i.createdAt)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {i.items.map((it) => it.label).join(", ") || "—"}
                      </TableCell>
                      <TableCell>${Number(i.amount).toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={i.status === "paid" ? "success" : "warning"}
                        >
                          {i.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
