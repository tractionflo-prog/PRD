"use client";

import { motion, useReducedMotion } from "framer-motion";

export function PositioningSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-slate-950 py-24 text-white sm:py-28 md:py-32">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(99,102,241,0.2),transparent_55%),radial-gradient(circle_at_100%_100%,rgba(59,130,246,0.12),transparent_40%)]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-3xl px-6 text-center sm:px-8 lg:px-10">
        <motion.h2
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-12%" }}
          transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
          className="text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-4xl md:text-[2.75rem] md:leading-[1.1]"
        >
          This is not another automation tool.
        </motion.h2>
        <motion.p
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-12%" }}
          transition={{ duration: 0.55, delay: reduceMotion ? 0 : 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-8 max-w-2xl text-pretty text-lg leading-relaxed text-white/75 sm:text-xl"
        >
          No mass outreach. No AI sending messages for you. Just real conversations — started the
          right way.
        </motion.p>
      </div>
    </section>
  );
}
