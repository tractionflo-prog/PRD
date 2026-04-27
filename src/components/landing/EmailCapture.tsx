"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Section } from "./Section";
import { WaitlistForm } from "./WaitlistForm";

export function EmailCapture() {
  const reduceMotion = useReducedMotion();

  return (
    <Section
      id="join"
      className="relative scroll-mt-24 overflow-hidden border-t border-slate-200/60 bg-[#f4f6fb] py-24 sm:scroll-mt-20 sm:py-28 md:py-32"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(99,102,241,0.14),transparent_55%),radial-gradient(circle_at_100%_100%,rgba(168,85,247,0.08),transparent_42%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-24 bottom-0 h-56 w-56 rounded-full bg-indigo-300/18 blur-2xl max-md:opacity-80 md:h-72 md:w-72 md:blur-3xl md:opacity-100"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 top-12 h-52 w-52 rounded-full bg-violet-300/14 blur-2xl max-md:opacity-75 md:h-64 md:w-64 md:blur-3xl md:opacity-100"
        aria-hidden
      />

      <div className="relative mx-auto max-w-xl px-1 sm:px-0">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-12%" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600/90">Early access</p>
          <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Start your first 10-minute distribution day
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-slate-600 sm:text-base">
            Show up. Execute. Learn faster.
          </p>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-8%" }}
          transition={{ duration: 0.58, delay: reduceMotion ? 0 : 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="relative mt-10"
        >
          <div
            className="pointer-events-none absolute -inset-3 rounded-[1.75rem] bg-gradient-to-br from-white/80 via-indigo-100/30 to-violet-100/25 opacity-90 blur-lg max-md:opacity-70 max-md:blur-md md:blur-xl"
            aria-hidden
          />
          <div className="relative overflow-hidden rounded-2xl bg-white/90 p-6 shadow-[0_16px_40px_-24px_rgba(15,23,42,0.14),0_0_0_1px_rgba(255,255,255,0.9)_inset] ring-1 ring-slate-200/60 backdrop-blur-md sm:p-8 md:bg-white/85 md:shadow-[0_24px_60px_-32px_rgba(15,23,42,0.18),0_0_0_1px_rgba(255,255,255,0.9)_inset] md:backdrop-blur-xl">
            <WaitlistForm source="final_cta" />
            <p className="mt-4 text-center text-xs font-medium text-slate-500">No spam. Early invites only.</p>
          </div>
        </motion.div>
      </div>
    </Section>
  );
}
