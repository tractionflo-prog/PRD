"use client";

import { motion, useReducedMotion } from "framer-motion";

const items = [
  { title: "You’ve launched something", line: "A product, a beta, or a clear wedge you believe in." },
  { title: "You’re looking for first users", line: "Not vanity traffic — people who might actually care." },
  { title: "You want signal before scaling", line: "Calm next steps instead of guessing in the dark." },
] as const;

export function FounderFitSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative border-t border-slate-200/70 bg-white py-24 sm:py-28 md:py-32">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#ffffff_0%,#fafbff_50%,#ffffff_100%)]" aria-hidden />

      <div className="relative mx-auto max-w-6xl px-6 sm:px-8 lg:px-10">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-12%" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600/90">Founder fit</p>
          <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Built for founders still validating
          </h2>
        </motion.div>

        <div className="mt-14 grid gap-5 sm:mt-16 sm:grid-cols-3 sm:gap-6">
          {items.map((item, i) => (
            <motion.div
              key={item.title}
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-8%" }}
              transition={{
                duration: 0.52,
                delay: reduceMotion ? 0 : 0.08 * i,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="rounded-2xl bg-white/80 p-6 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.12),0_0_0_1px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/50 backdrop-blur-sm sm:p-7"
            >
              <p className="text-[11px] font-semibold tabular-nums text-slate-400">0{i + 1}</p>
              <h3 className="mt-3 text-lg font-semibold tracking-tight text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.line}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
