import Link from "next/link";
import {
  ArrowLeft,
  HeartPulse,
  MessageCircleHeart,
  PawPrint,
  ScanLine,
} from "lucide-react";

const HIGHLIGHTS = [
  {
    icon: <ScanLine className="size-4" />,
    title: "AI photo screening",
    body: "Instant, structured health reads from a single photo.",
  },
  {
    icon: <MessageCircleHeart className="size-4" />,
    title: "AI health assistant",
    body: "Answers grounded in your pet's real records.",
  },
  {
    icon: <HeartPulse className="size-4" />,
    title: "Lifelong pet passport",
    body: "Vaccines, meds, and visits in one living record.",
  },
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <aside className="relative hidden overflow-hidden bg-[#07120f] text-white lg:flex lg:flex-col lg:justify-between">
        {/* grid + glow */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(45,212,191,0.14),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black_25%,transparent_75%)]" />

        <div className="relative z-10 p-10">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <PawPrint className="size-5" />
            </span>
            <span className="text-xl font-semibold tracking-tight">PawthCare</span>
          </Link>
        </div>

        <div className="relative z-10 px-10">
          <h2 className="max-w-md text-balance text-4xl font-semibold leading-[1.1] tracking-tight">
            A health twin for{" "}
            <span className="italic text-primary">every pet</span>, powered by AI
          </h2>
          <ul className="mt-10 flex flex-col gap-5">
            {HIGHLIGHTS.map((h) => (
              <li key={h.title} className="flex items-start gap-3">
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/5 text-primary ring-1 ring-white/10">
                  {h.icon}
                </span>
                <div>
                  <p className="font-medium">{h.title}</p>
                  <p className="text-sm text-white/55">{h.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 p-10 text-sm text-white/40">
          © {new Date().getFullYear()} PawthCare
        </div>
      </aside>

      {/* Form panel */}
      <main className="relative flex flex-col bg-gradient-to-b from-muted/40 to-background">
        <div className="flex items-center justify-between px-6 py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back home
          </Link>
          {/* compact logo for mobile */}
          <Link href="/" className="flex items-center gap-2 lg:hidden">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <PawPrint className="size-4" />
            </span>
            <span className="font-semibold tracking-tight">PawthCare</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 pb-16">
          {children}
        </div>
      </main>
    </div>
  );
}
