"use client";

import { useMobilePerfLayout } from "@/lib/use-mobile-perf-layout";
import { motion, useReducedMotion } from "framer-motion";

export function CoreIdeaSection() {
  const reduceMotion = useReducedMotion();
  const mobilePerf = useMobilePerfLayout();

  return (
    <section
      id="core-idea"
      className="relative scroll-mt-24 overflow-hidden border-y border-slate-200/60 bg-white py-24 sm:scroll-mt-20 sm:py-32 md:py-40"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.12),transparent_55%),radial-gradient(ellipse_60%_40%_at_100%_50%,rgba(139,92,246,0.08),transparent_50%),radial-gradient(ellipse_50%_40%_at_0%_80%,rgba(59,130,246,0.06),transparent_45%)]"
        aria-hidden
      />
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-40 max-md:opacity-25"
        aria-hidden
        animate={
          reduceMotion || mobilePerf
            ? undefined
            : {
                backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
              }
        }
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        style={{
          backgroundSize: "200% 200%",
          backgroundImage:
            "linear-gradient(115deg, transparent 0%, rgba(99,102,241,0.06) 25%, transparent 50%, rgba(168,85,247,0.05) 75%, transparent 100%)",
        }}
      />

      <div className="relative mx-auto max-w-4xl px-6 text-center sm:px-8 lg:px-10">
        <motion.p
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-12%" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600/90"
        >
          Core idea
        </motion.p>
        <motion.h2
          initial={reduceMotion ? false : { opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-12%" }}
          transition={{ duration: 0.62, delay: reduceMotion ? 0 : 0.06, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 text-balance text-[clamp(2rem,5vw,3.25rem)] font-semibold leading-[1.08] tracking-tight text-slate-900 md:text-[clamp(2.25rem,4.5vw,3.5rem)]"
        >
          You don&apos;t need more traffic.
          <br className="hidden sm:block" />
          <span className="sm:ml-1">You need conversations.</span>
        </motion.h2>
      </div>
    </section>
  );
}
