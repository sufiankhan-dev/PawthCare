"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PawPrint, Stethoscope } from "lucide-react";

import { signUp } from "@/lib/auth-client";
import { GoogleButton } from "@/components/auth/google-button";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Role = "owner" | "vet";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("owner");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await signUp.email({
      name,
      email,
      password,
      // additionalField configured in better-auth
      role,
    } as Parameters<typeof signUp.email>[0]);
    setLoading(false);
    if (error) {
      setError(error.message ?? "Unable to create account.");
      return;
    }
    router.push(role === "vet" ? "/clinic" : "/app");
    router.refresh();
  }

  return (
    <Card className="w-full max-w-md rounded-2xl border-border/60 shadow-xl shadow-black/[0.04]">
      <CardHeader>
        <CardTitle className="text-2xl tracking-tight">Create your account</CardTitle>
        <CardDescription>
          Start building your pet&apos;s digital health twin.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <GoogleButton callbackURL="/app" label="Sign up with Google" />
        <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          or
          <span className="h-px flex-1 bg-border" />
        </div>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-2">
            <RoleButton
              active={role === "owner"}
              onClick={() => setRole("owner")}
              icon={<PawPrint className="size-4" />}
              label="Pet owner"
            />
            <RoleButton
              active={role === "vet"}
              onClick={() => setRole("vet")}
              icon={<Stethoscope className="size-4" />}
              label="Veterinarian"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-foreground underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

function RoleButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1.5 rounded-lg border p-3 text-sm font-medium transition-colors",
        active
          ? "border-primary bg-primary/5 text-foreground"
          : "border-input text-muted-foreground hover:bg-accent",
      )}
    >
      {icon}
      {label}
    </button>
  );
}
