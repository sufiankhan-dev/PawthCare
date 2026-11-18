import Link from "next/link";
import {
  ArrowLeft,
  HeartPulse,
  MessageCircleHeart,
  ScanLine,
} from "lucide-react";

import { LogoMark } from "@/components/logo";

const HIGHLIGHTS = [
  {
    icon: <ScanLine className="size-4" />,
    title: "AI photo screening",
    body: "Structured health reads from a single photo.",
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
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      {/* Brand panel */}
      <aside className="hidden flex-col justify-between bg-muted/70 p-10 lg:flex xl:p-14">
        <Link href="/" className="flex w-fit items-center gap-2.5">
          <LogoMark className="size-9 rounded-xl" />
          <span className="text-xl font-semibold tracking-tight">PawthCare</span>
        </Link>

        <div>
          <h2 className="max-w-md text-4xl font-semibold leading-[1.12] tracking-tight">
            Calm, clear care for <span className="text-primary">every pet</span>
          </h2>
          <ul className="mt-10 flex max-w-sm flex-col gap-3">
            {HIGHLIGHTS.map((h) => (
              <li
                key={h.title}
                className="flex items-start gap-3.5 rounded-2xl bg-card p-4 shadow-soft"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  {h.icon}
                </span>
                <div>
                  <p className="text-sm font-medium">{h.title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{h.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} PawthCare
        </p>
      </aside>

      {/* Form panel */}
      <main className="flex flex-col bg-background">
        <div className="flex items-center justify-between px-4 py-5 sm:px-6">
          <Link
            href="/"
            className="-ml-2 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back home
          </Link>
          <Link href="/" className="flex items-center gap-2 lg:hidden">
            <LogoMark className="size-8" />
            <span className="font-semibold tracking-tight">PawthCare</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-4 pb-12 sm:px-6 sm:pb-16">
          {children}
        </div>
      </main>
    </div>
  );
}
