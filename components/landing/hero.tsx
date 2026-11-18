"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Menu, PawPrint, ShieldCheck, X } from "lucide-react";

import { LogoMark } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "#features", label: "Features" },
  { href: "#how", label: "How it works" },
  { href: "#pricing", label: "Pricing" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: 0.05 + i * 0.08, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export function Hero() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-transparent bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <LogoMark className="size-8" />
            <span className="text-[1.05rem] font-semibold tracking-tight">PawthCare</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Get started</Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>

        <div
          className={cn(
            "overflow-hidden border-b border-border/60 bg-background transition-[max-height] duration-200 md:hidden",
            menuOpen ? "max-h-72" : "max-h-0 border-transparent",
          )}
        >
          <nav className="flex flex-col gap-1 px-4 pb-4 pt-1">
            {[...NAV, { href: "/login", label: "Sign in" }].map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <section className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 pb-20 pt-16 text-center sm:px-6 sm:pb-28 sm:pt-24">
        <motion.span
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="inline-flex items-center gap-2 rounded-full bg-accent px-3.5 py-1.5 text-xs font-medium text-accent-foreground"
        >
          <ShieldCheck className="size-3.5" />
          The connected health record for pets
        </motion.span>

        <motion.h1
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-6 text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl md:text-6xl"
        >
          Calm, clear care for <span className="text-primary">every pet</span>
        </motion.h1>

        <motion.p
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-5 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg"
        >
          PawthCare connects pet owners and veterinary clinics around one living
          health record — with AI photo screening and an assistant that knows
          your pet&apos;s history.
        </motion.p>

        <motion.div
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-9 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row"
        >
          <Button asChild size="lg" className="group w-full sm:w-auto">
            <Link href="/signup">
              <PawPrint className="size-4" />
              Start free
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
            <Link href="#how">See how it works</Link>
          </Button>
        </motion.div>
      </section>
    </>
  );
}
