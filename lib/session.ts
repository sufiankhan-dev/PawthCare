import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getOrCreateDefaultClinic, setUserClinic } from "@/lib/queries";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: string;
  clinicId: string | null;
};

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await getSession();
  if (!session) return null;
  const u = session.user as unknown as Record<string, unknown>;
  return {
    id: String(u.id),
    name: String(u.name ?? ""),
    email: String(u.email ?? ""),
    image: (u.image as string | null) ?? null,
    role: (u.role as string) ?? "owner",
    clinicId: (u.clinicId as string | null) ?? null,
  };
}

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireOwner(): Promise<CurrentUser> {
  const user = await requireUser();
  if (user.role !== "owner" && user.role !== "admin") redirect("/clinic");
  return user;
}

export async function requireClinic(): Promise<CurrentUser> {
  const user = await requireUser();
  if (user.role !== "vet" && user.role !== "admin") redirect("/app");
  // Ensure every vet is attached to a clinic for the demo.
  if (!user.clinicId) {
    const clinic = await getOrCreateDefaultClinic();
    await setUserClinic(user.id, clinic.id);
    user.clinicId = clinic.id;
  }
  return user;
}
