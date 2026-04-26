"use client";

import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "framer-motion";
import { Section } from "./Section";

const ProductDemo = dynamic(() =>
  import("./ProductDemo").then((m) => ({ default: m.ProductDemo })),
  {
    ssr: true,
    loading: () => (
      <div
        className="min-h-[260px] rounded-lg bg-slate-50/90 sm:min-h-[300px]"
        aria-hidden
      />
    ),
  },
);

export function ProductPreview() {
  const reduceMotion = useReducedMotion();

  return (
    <Section id="preview" className="relative overflow-x-clip bg-white py-24 sm:py-28 md:py-36">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_100%,rgba(99,102,241,0.08),transparent_55%)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-5xl text-center lg:mx-0 lg:max-w-none lg:text-left">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-12%" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600/90">Product</p>
          <h2 className="mx-auto mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl lg:mx-0 md:text-[2.65rem] md:leading-[1.08]">
            See who to talk to — and what to say
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-slate-600 lg:mx-0">
            Your inbox, drafts, and context — laid out so the next message feels obvious, not forced.
          </p>
        </motion.div>
      </div>

      <div className="relative mx-auto mt-14 max-w-6xl sm:mt-16">
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[min(70%,28rem)] w-[min(92%,56rem)] -translate-x-1/2 -translate-y-1/2 rounded-[2.5rem] bg-gradient-to-r from-indigo-400/25 via-violet-400/20 to-blue-400/25 opacity-90 blur-2xl max-md:h-[min(50%,18rem)] max-md:w-[min(96%,24rem)] max-md:opacity-60 md:blur-3xl"
          aria-hidden
        />

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-xl border border-slate-200/80 bg-slate-100/80 p-1.5 shadow-[0_20px_48px_-32px_rgba(15,23,42,0.14),0_0_0_1px_rgba(255,255,255,0.8)_inset] ring-1 ring-slate-200/60 max-md:shadow-[0_14px_36px_-24px_rgba(15,23,42,0.12),0_0_0_1px_rgba(255,255,255,0.75)_inset] sm:rounded-2xl sm:p-2 md:shadow-[0_32px_80px_-40px_rgba(15,23,42,0.2),0_0_0_1px_rgba(255,255,255,0.8)_inset]"
        >
          <div className="flex items-center gap-2 rounded-lg bg-white/90 px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3">
            <div className="flex gap-1.5 pl-0.5" aria-hidden>
              <span className="h-2.5 w-2.5 rounded-full bg-red-400/90 sm:h-3 sm:w-3" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400/90 sm:h-3 sm:w-3" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/90 sm:h-3 sm:w-3" />
            </div>
            <div className="min-w-0 flex-1 truncate rounded-md bg-slate-100/90 px-3 py-1.5 text-center text-[11px] font-medium text-slate-500 ring-1 ring-slate-200/60 sm:text-xs">
              app.tractionflo.com
            </div>
          </div>
          <div className="mt-1.5 overflow-hidden rounded-lg bg-white shadow-inner ring-1 ring-slate-200/50 sm:mt-2 sm:rounded-xl">
            <ProductDemo />
          </div>
        </motion.div>

        <motion.p
          initial={reduceMotion ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: reduceMotion ? 0 : 0.12 }}
          className="mt-8 text-center text-sm font-medium tracking-wide text-slate-500 sm:text-[15px] lg:text-left"
        >
          Draft your message → edit → copy → send from your own account.
        </motion.p>
      </div>
    </Section>
  );
}
