import Link from "next/link";
import {
  CalendarCheck,
  HeartPulse,
  MessageCircleHeart,
  PawPrint,
  ScanLine,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";

import { Hero } from "@/components/landing/hero";
import { Reveal } from "@/components/landing/reveal";
import { Button } from "@/components/ui/button";

const FEATURES = [
  {
    icon: <ScanLine className="size-5" />,
    title: "AI photo screening",
    body: "Upload a photo and get an instant, structured health read — risk score, findings, and what to do next.",
  },
  {
    icon: <MessageCircleHeart className="size-5" />,
    title: "AI health assistant",
    body: "Chat about symptoms and care, grounded in your pet's real records, vaccinations, and history.",
  },
  {
    icon: <HeartPulse className="size-5" />,
    title: "Digital pet passport",
    body: "Vaccinations, medications, weight, and visits — one lifelong record that travels with your pet.",
  },
  {
    icon: <Stethoscope className="size-5" />,
    title: "Clinic EMR & billing",
    body: "Veterinary teams get patient records, scheduling, AI-flagged cases, and invoicing in one place.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1">
        <Hero />

        {/* Features */}
        <section className="mx-auto w-full max-w-6xl px-4 py-20">
          <Reveal className="mb-12 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              One platform
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Everything your pet&apos;s health needs, connected
            </h2>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.08}>
                <div className="group h-full rounded-2xl border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
                  <span className="mb-4 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    {f.icon}
                  </span>
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Dual audience */}
        <section className="mx-auto w-full max-w-6xl px-4 pb-24">
          <div className="grid gap-4 md:grid-cols-2">
            <Reveal>
              <AudienceCard
                icon={<PawPrint className="size-5" />}
                eyebrow="For pet owners"
                title="Peace of mind, between vet visits"
                points={[
                  "Instant AI screening from a photo",
                  "Smart reminders for vaccines & meds",
                  "An assistant that knows your pet's history",
                ]}
                href="/signup"
                cta="Create owner account"
              />
            </Reveal>
            <Reveal delay={0.1}>
              <AudienceCard
                icon={<Stethoscope className="size-5" />}
                eyebrow="For clinics"
                title="Modern records, fewer no-shows"
                points={[
                  "Unified patient EMR & scheduling",
                  "AI-flagged cases surfaced to your team",
                  "Simple invoicing and billing overview",
                ]}
                href="/signup"
                cta="Create clinic account"
                accent
              />
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary" />
            AI guidance, not a veterinary diagnosis.
          </div>
          <span>© {new Date().getFullYear()} PawthCare</span>
        </div>
      </footer>
    </div>
  );
}

function AudienceCard({
  icon,
  eyebrow,
  title,
  points,
  href,
  cta,
  accent,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  points: string[];
  href: string;
  cta: string;
  accent?: boolean;
}) {
  return (
    <div
      className={
        "flex h-full flex-col overflow-hidden rounded-3xl border p-8 " +
        (accent
          ? "border-transparent bg-gradient-to-br from-primary to-[#0c8f7e] text-primary-foreground"
          : "bg-card")
      }
    >
      <span
        className={
          "mb-4 flex size-11 items-center justify-center rounded-xl " +
          (accent ? "bg-white/15" : "bg-primary/10 text-primary")
        }
      >
        {icon}
      </span>
      <p
        className={
          "text-xs font-medium uppercase tracking-widest " +
          (accent ? "text-primary-foreground/80" : "text-muted-foreground")
        }
      >
        {eyebrow}
      </p>
      <h3 className="mt-1 text-2xl font-semibold tracking-tight">{title}</h3>
      <ul className="mt-5 flex flex-1 flex-col gap-2.5 text-sm">
        {points.map((p) => (
          <li key={p} className="flex items-center gap-2">
            <CalendarCheck
              className={"size-4 shrink-0 " + (accent ? "" : "text-primary")}
            />
            {p}
          </li>
        ))}
      </ul>
      <Button
        asChild
        variant={accent ? "secondary" : "default"}
        className="mt-7 w-fit"
      >
        <Link href={href}>{cta}</Link>
      </Button>
    </div>
  );
}
