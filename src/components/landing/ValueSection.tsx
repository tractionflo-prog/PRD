"use client";

import { motion, useReducedMotion } from "framer-motion";
import { IconCheck, IconDoc, IconUsers } from "./icons";
import { Section } from "./Section";

const cards = [
  {
    n: "01",
    title: "Tell us what you built",
    text: "Describe your product, website, or the problem you solve.",
    icon: IconDoc,
  },
  {
    n: "02",
    title: "We find demand signals",
    text: "We surface real conversations when people are already asking — and likely fits when demand is quiet.",
    icon: IconUsers,
  },
  {
    n: "03",
    title: "You start the conversation",
    text: "We draft thoughtful starters. You approve, edit, and send manually.",
    icon: IconCheck,
  },
] as const;

export function ValueSection() {
  const reduceMotion = useReducedMotion();

  return (
    <Section
      id="process"
      className="scroll-mt-24 border-t border-slate-200/50 bg-[#fafbff] py-24 sm:scroll-mt-20 sm:py-28 md:py-36"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_40%_at_50%_0%,rgba(99,102,241,0.06),transparent_65%)]"
        aria-hidden
      />

      <div className="relative">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-12%" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600/90">How it works</p>
          <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl md:text-[2.65rem] md:leading-[1.1]">
            From what you built to a thread you can open.
          </h2>
        </motion.div>

        <div className="mt-14 grid gap-5 sm:mt-16 sm:grid-cols-3 sm:gap-6 lg:gap-8">
          {cards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.n}
                initial={reduceMotion ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{
                  duration: 0.55,
                  delay: reduceMotion ? 0 : 0.1 * i,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={reduceMotion ? undefined : { y: -6 }}
                className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white/95 p-7 shadow-[0_14px_36px_-24px_rgba(15,23,42,0.1),0_0_0_1px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/40 backdrop-blur-none sm:p-8 md:bg-white/90 md:shadow-[0_20px_50px_-32px_rgba(15,23,42,0.14),0_0_0_1px_rgba(15,23,42,0.04)] md:backdrop-blur-md"
              >
                <div
                  className="pointer-events-none absolute -right-8 -top-8 max-md:hidden h-32 w-32 rounded-full bg-gradient-to-br from-indigo-400/15 to-violet-400/10 blur-2xl transition-opacity duration-500 group-hover:opacity-100 sm:h-40 sm:w-40"
                  aria-hidden
                />
                <div className="relative flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 text-indigo-600 ring-1 ring-indigo-500/15">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-semibold tabular-nums tracking-widest text-slate-400">
                    {card.n}
                  </span>
                </div>
                <h3 className="relative mt-8 text-lg font-semibold leading-snug tracking-tight text-slate-900">
                  {card.title}
                </h3>
                <p className="relative mt-3 flex-1 text-[15px] leading-relaxed text-slate-600">{card.text}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
