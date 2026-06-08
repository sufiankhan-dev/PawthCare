import { AppShell } from "@/components/app-shell";
import { requireOwner } from "@/lib/session";

export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireOwner();
  return (
    <AppShell
      portal="owner"
      user={{ name: user.name, email: user.email, role: user.role }}
    >
      {children}
    </AppShell>
  );
}
