import { AppShell } from "@/components/app-shell";
import { requireClinic } from "@/lib/session";

export default async function ClinicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireClinic();
  return (
    <AppShell
      portal="clinic"
      user={{ name: user.name, email: user.email, role: user.role }}
    >
      {children}
    </AppShell>
  );
}
