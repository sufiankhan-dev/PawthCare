"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, PawPrint, Sparkles } from "lucide-react";

import { Spotlight } from "@/components/ui/spotlight-new";
import { Button } from "@/components/ui/button";

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#07120f] text-white">
      {/* teal spotlight beams */}
      <Spotlight
        gradientFirst="radial-gradient(68.54% 68.72% at 55.02% 31.46%, hsla(170, 90%, 65%, 0.14) 0, hsla(170, 85%, 45%, 0.05) 50%, hsla(170, 85%, 40%, 0) 80%)"
        gradientSecond="radial-gradient(50% 50% at 50% 50%, hsla(165, 90%, 60%, 0.1) 0, hsla(165, 85%, 45%, 0.04) 80%, transparent 100%)"
        gradientThird="radial-gradient(50% 50% at 50% 50%, hsla(150, 90%, 60%, 0.07) 0, hsla(150, 85%, 45%, 0.03) 80%, transparent 100%)"
      />

      {/* subtle grid + glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(45,212,191,0.12),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />

      {/* nav */}
      <header className="relative z-10">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <PawPrint className="size-4" />
            </span>
            <span className="text-lg font-semibold tracking-tight">PawthCare</span>
          </div>
          <nav className="flex items-center gap-2">
            <Button
              asChild
              variant="ghost"
              className="text-white/80 hover:bg-white/10 hover:text-white"
            >
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild className="shadow-lg shadow-primary/20">
              <Link href="/signup">Get started</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* hero content */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center px-4 pb-28 pt-20 text-center sm:pt-28"
      >
        <motion.span
          variants={item}
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur"
        >
          <Sparkles className="size-3.5 text-primary" />
          The digital health ecosystem for pets
        </motion.span>

        <motion.h1
          variants={item}
          className="mt-6 text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl"
        >
          A health twin for{" "}
          <span className="italic text-primary">every pet</span>,
          <br className="hidden sm:block" /> powered by AI
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-6 max-w-2xl text-pretty text-lg text-white/70"
        >
          PawthCare connects pet owners and veterinary clinics around one living
          health record — with AI photo screening and an assistant that actually
          knows your pet.
        </motion.p>

        <motion.div
          variants={item}
          className="mt-9 flex flex-wrap items-center justify-center gap-3"
        >
          <Button asChild size="lg" className="group shadow-xl shadow-primary/25">
            <Link href="/signup">
              <PawPrint className="size-4" />
              Start free
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
          >
            <Link href="/login">Sign in</Link>
          </Button>
        </motion.div>

      </motion.div>
    </section>
  );
}
