import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Bell,
  CalendarCheck,
  Camera,
  Check,
  HeartPulse,
  MessageCircleHeart,
  PawPrint,
  ScanLine,
  ShieldCheck,
  Sparkles,
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

const STEPS = [
  {
    icon: <Camera className="size-5" />,
    step: "01",
    title: "Capture",
    body: "Snap a photo of your pet or a concern — skin, eyes, gait, anything that looks off.",
  },
  {
    icon: <Activity className="size-5" />,
    step: "02",
    title: "Analyze",
    body: "Our AI returns a risk score, findings, and an urgency level in seconds — grounded in your pet's records.",
  },
  {
    icon: <Bell className="size-5" />,
    step: "03",
    title: "Act",
    body: "Get clear next steps, book a vet visit, and keep everything logged in one living health passport.",
  },
];

const PLANS = [
  {
    name: "Companion",
    price: "$0",
    cadence: "forever",
    tagline: "For one curious pet parent.",
    cta: "Start free",
    href: "/signup",
    highlight: false,
    features: [
      "1 pet profile",
      "Digital pet passport",
      "3 AI photo screenings / month",
      "Vaccination & med reminders",
    ],
  },
  {
    name: "Guardian",
    price: "$9",
    cadence: "/ month",
    tagline: "For households that want peace of mind.",
    cta: "Go Guardian",
    href: "/signup",
    highlight: true,
    features: [
      "Unlimited pets",
      "Unlimited AI photo screening",
      "AI health assistant with full history",
      "Priority reminders & weight trends",
      "Shareable records for any vet",
    ],
  },
  {
    name: "Clinic",
    price: "$49",
    cadence: "/ month",
    tagline: "For veterinary teams and practices.",
    cta: "Talk to us",
    href: "/signup",
    highlight: false,
    features: [
      "Patient EMR & scheduling",
      "AI-flagged cases for your team",
      "Invoicing & billing overview",
      "Multiple staff seats",
      "Owner collaboration tools",
    ],
  },
];

const FAQS = [
  {
    q: "Is the AI a replacement for my vet?",
    a: "No. PawthCare gives fast, structured guidance and surfaces concerns early — but it is decision support, not a veterinary diagnosis. Always confirm with a licensed vet.",
  },
  {
    q: "What animals are supported?",
    a: "Dogs and cats today, with more species on the way. The passport, reminders, and assistant work for any profile you create.",
  },
  {
    q: "Can my clinic and I share the same record?",
    a: "Yes — that's the point. Owners and clinics work from one living health record, so history, screenings, and visits stay in sync.",
  },
  {
    q: "Is my pet's data private?",
    a: "Your records are yours. We use them only to power your reminders, assistant, and screenings — never sold.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1">
        <Hero />

        {/* Features */}
        <section id="features" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-20">
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

        {/* How it works */}
        <section id="how" className="scroll-mt-20 border-y bg-secondary/30">
          <div className="mx-auto w-full max-w-6xl px-4 py-20">
            <Reveal className="mb-12 max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">
                How it works
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                From a photo to a plan in three steps
              </h2>
            </Reveal>

            <div className="grid gap-4 md:grid-cols-3">
              {STEPS.map((s, i) => (
                <Reveal key={s.title} delay={i * 0.1}>
                  <div className="relative h-full rounded-2xl border bg-card p-7">
                    <span className="absolute right-6 top-6 text-4xl font-semibold text-primary/15">
                      {s.step}
                    </span>
                    <span className="mb-5 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      {s.icon}
                    </span>
                    <h3 className="text-lg font-semibold">{s.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* AI showcase */}
        <section className="mx-auto w-full max-w-6xl px-4 py-20">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <Reveal>
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">
                AI, grounded in your pet
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                Screenings that read like a vet&apos;s note
              </h2>
              <p className="mt-4 text-pretty text-muted-foreground">
                Every analysis comes back structured — a risk score, the findings
                that matter, and a clear urgency level. The assistant uses the same
                history your vet sees, so advice is specific to your pet, not generic.
              </p>
              <ul className="mt-6 flex flex-col gap-3 text-sm">
                {[
                  "Risk score & urgency at a glance",
                  "Plain-language findings and next steps",
                  "Context from vaccinations, meds, and visits",
                ].map((p) => (
                  <li key={p} className="flex items-center gap-2.5">
                    <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Check className="size-3" />
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
              <Button asChild className="mt-8">
                <Link href="/signup">
                  Try a screening
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="rounded-3xl border bg-card p-6 shadow-xl shadow-primary/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <ScanLine className="size-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold">Skin screening</p>
                      <p className="text-xs text-muted-foreground">Bella · Golden Retriever</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-medium text-amber-600">
                    Monitor
                  </span>
                </div>

                <div className="mt-5 rounded-2xl bg-secondary/50 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Risk score</span>
                    <span className="font-semibold">34 / 100</span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-border">
                    <div className="h-full w-[34%] rounded-full bg-gradient-to-r from-primary to-amber-400" />
                  </div>
                </div>

                <div className="mt-4 space-y-2.5">
                  {[
                    "Mild localized redness on left flank",
                    "No signs of broken skin or discharge",
                    "Recommend monitoring for 48h",
                  ].map((line) => (
                    <div
                      key={line}
                      className="flex items-start gap-2.5 rounded-xl border bg-background px-3 py-2.5 text-sm"
                    >
                      <Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />
                      <span>{line}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Dual audience */}
        <section className="mx-auto w-full max-w-6xl px-4 pb-20">
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

        {/* Pricing */}
        <section id="pricing" className="scroll-mt-20 border-y bg-secondary/30">
          <div className="mx-auto w-full max-w-6xl px-4 py-20">
            <Reveal className="mx-auto mb-12 max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">
                Pricing
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                Simple plans for every kind of pet family
              </h2>
              <p className="mt-3 text-muted-foreground">
                Start free, upgrade when you&apos;re ready. No card required to begin.
              </p>
            </Reveal>

            <div className="grid items-stretch gap-5 lg:grid-cols-3">
              {PLANS.map((plan, i) => (
                <Reveal key={plan.name} delay={i * 0.08}>
                  <div
                    className={
                      "relative flex h-full flex-col rounded-3xl border p-7 transition-all " +
                      (plan.highlight
                        ? "border-primary/40 bg-card shadow-xl shadow-primary/10 lg:-translate-y-2"
                        : "bg-card hover:border-primary/30")
                    }
                  >
                    {plan.highlight && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground shadow-lg shadow-primary/25">
                        Most popular
                      </span>
                    )}
                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {plan.tagline}
                    </p>
                    <div className="mt-5 flex items-baseline gap-1">
                      <span className="text-4xl font-semibold tracking-tight">
                        {plan.price}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {plan.cadence}
                      </span>
                    </div>
                    <ul className="mt-6 flex flex-1 flex-col gap-3 text-sm">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5">
                          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Check className="size-3" />
                          </span>
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Button
                      asChild
                      variant={plan.highlight ? "default" : "outline"}
                      className="mt-7 w-full"
                    >
                      <Link href={plan.href}>{plan.cta}</Link>
                    </Button>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto w-full max-w-3xl px-4 py-20">
          <Reveal className="mb-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              FAQ
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Questions, answered
            </h2>
          </Reveal>
          <div className="flex flex-col gap-3">
            {FAQS.map((f, i) => (
              <Reveal key={f.q} delay={i * 0.06}>
                <div className="rounded-2xl border bg-card p-6">
                  <h3 className="font-semibold">{f.q}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="mx-auto w-full max-w-6xl px-4 pb-24">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl border border-transparent bg-gradient-to-br from-primary to-[#0c8f7e] px-6 py-16 text-center text-primary-foreground sm:px-12">
              <div className="pointer-events-none absolute inset-0 [background-image:radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_55%)]" />
              <div className="relative">
                <h2 className="mx-auto max-w-2xl text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                  Give your pet a health twin today
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
                  Join PawthCare and turn scattered records into one intelligent,
                  living health profile.
                </p>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  <Button asChild size="lg" variant="secondary">
                    <Link href="/signup">
                      <PawPrint className="size-4" />
                      Start free
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                  >
                    <Link href="/login">Sign in</Link>
                  </Button>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

const FOOTER_LINKS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "How it works", href: "#how" },
      { label: "Pricing", href: "#pricing" },
      { label: "AI assistant", href: "/signup" },
    ],
  },
  {
    heading: "For",
    links: [
      { label: "Pet owners", href: "/signup" },
      { label: "Clinics", href: "/signup" },
      { label: "Sign in", href: "/login" },
      { label: "Get started", href: "/signup" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
];

function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t bg-[#07120f] text-white">
      {/* glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(45,212,191,0.12),transparent_60%)]" />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pt-16">
        <div className="grid gap-10 pb-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <PawPrint className="size-4" />
              </span>
              <span className="text-lg font-semibold tracking-tight">PawthCare</span>
            </div>
            <p className="mt-4 max-w-xs text-sm text-white/60">
              One living health record for every pet — AI screening, a smart
              assistant, and tools clinics actually want to use.
            </p>
            <Button asChild className="mt-6 shadow-lg shadow-primary/20">
              <Link href="/signup">
                <PawPrint className="size-4" />
                Start free
              </Link>
            </Button>
          </div>

          {/* Link columns */}
          {FOOTER_LINKS.map((col) => (
            <div key={col.heading}>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/40">
                {col.heading}
              </p>
              <ul className="mt-4 flex flex-col gap-3 text-sm">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-white/65 transition-colors hover:text-white"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 py-6 text-sm text-white/55 sm:flex-row">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary" />
            AI guidance, not a veterinary diagnosis.
          </div>
          <span>© {new Date().getFullYear()} PawthCare. All rights reserved.</span>
        </div>
      </div>

      {/* Watermark */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0 flex select-none justify-center overflow-hidden"
      >
        <span className="whitespace-nowrap bg-gradient-to-b from-white/[0.08] to-transparent bg-clip-text font-semibold leading-[0.78] tracking-tight text-transparent [font-size:15vw]">
          PAWTHCARE
        </span>
      </div>
    </footer>
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
