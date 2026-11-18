import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Bell,
  Camera,
  Check,
  ChevronDown,
  HeartPulse,
  MessageCircleHeart,
  PawPrint,
  ScanLine,
  Sparkles,
  Stethoscope,
} from "lucide-react";

import { Hero } from "@/components/landing/hero";
import { Reveal } from "@/components/landing/reveal";
import { LogoMark } from "@/components/logo";
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
        <section id="features" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6 sm:py-24">
          <Reveal className="mb-12 max-w-2xl">
            <p className="text-sm font-medium text-primary">
              One platform
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Everything your pet&apos;s health needs, connected
            </h2>
          </Reveal>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.08}>
                <div className="h-full rounded-2xl bg-card p-6 shadow-soft ring-1 ring-foreground/[0.05]">
                  <span className="mb-4 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
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
        <section id="how" className="scroll-mt-20 bg-muted/60">
          <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
            <Reveal className="mb-12 max-w-2xl">
              <p className="text-sm font-medium text-primary">
                How it works
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                From a photo to a plan in three steps
              </h2>
            </Reveal>

            <div className="grid gap-4 md:grid-cols-3">
              {STEPS.map((s, i) => (
                <Reveal key={s.title} delay={i * 0.1}>
                  <div className="relative h-full rounded-2xl bg-card p-7 shadow-soft">
                    <span className="absolute right-6 top-6 text-sm font-medium tabular-nums text-muted-foreground">
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
        <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <Reveal>
              <p className="text-sm font-medium text-primary">
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
              <div className="rounded-3xl bg-card p-6 shadow-soft-lg ring-1 ring-foreground/[0.05]">
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
                  <span className="rounded-full bg-amber-500/12 px-2.5 py-1 text-xs font-medium text-amber-700">
                    Monitor
                  </span>
                </div>

                <div className="mt-5 rounded-2xl bg-muted/70 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Risk score</span>
                    <span className="font-semibold">34 / 100</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-background">
                    <div className="h-full w-[34%] rounded-full bg-amber-500" />
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
                      className="flex items-start gap-2.5 rounded-xl bg-muted/50 px-3.5 py-2.5 text-sm"
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

        {/* Pricing */}
        <section id="pricing" className="scroll-mt-20 bg-muted/60">
          <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
            <Reveal className="mx-auto mb-12 max-w-2xl text-center">
              <p className="text-sm font-medium text-primary">
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
                      "relative flex h-full flex-col rounded-3xl bg-card p-7 " +
                      (plan.highlight
                        ? "shadow-soft-lg ring-2 ring-primary/40"
                        : "shadow-soft ring-1 ring-foreground/[0.05]")
                    }
                  >
                    {plan.highlight && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
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
        <section className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
          <Reveal className="mb-10 text-center">
            <p className="text-sm font-medium text-primary">
              FAQ
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Questions, answered
            </h2>
          </Reveal>
          <div className="flex flex-col gap-3">
            {FAQS.map((f, i) => (
              <Reveal key={f.q} delay={i * 0.06}>
                <details className="group rounded-2xl bg-card shadow-soft ring-1 ring-foreground/[0.05]">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-2xl p-5 font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:p-6 [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="-mt-1 px-5 pb-5 text-sm leading-relaxed text-muted-foreground sm:px-6 sm:pb-6">
                    {f.a}
                  </p>
                </details>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="mx-auto w-full max-w-6xl px-4 pb-24">
          <Reveal>
            <div className="rounded-3xl bg-primary px-6 py-14 text-center text-primary-foreground sm:px-12 sm:py-16">
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
                    className="border-white/30 bg-transparent text-white shadow-none hover:bg-white/10 hover:text-white"
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
    <footer className="border-t border-border/60 bg-background">

      <div className="mx-auto w-full max-w-6xl px-4 pt-14 sm:px-6">
        <div className="grid grid-cols-2 gap-10 pb-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2">
              <LogoMark className="size-8" />
              <span className="text-lg font-semibold tracking-tight">PawthCare</span>
            </div>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              One living health record for every pet — AI screening, a smart
              assistant, and tools clinics actually want to use.
            </p>
          </div>

          {/* Link columns */}
          {FOOTER_LINKS.map((col) => (
            <div key={col.heading}>
              <p className="text-sm font-medium text-foreground">
                {col.heading}
              </p>
              <ul className="mt-4 flex flex-col gap-3 text-sm">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-border/60 py-6 text-sm text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} PawthCare. All rights reserved.</span>
        </div>
      </div>

    </footer>
  );
}
