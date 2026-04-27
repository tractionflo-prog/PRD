"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Section } from "./Section";

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
            Everything ready. You just send.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-slate-600 lg:mx-0">
            Leads, messages, and context — laid out so the next step feels obvious.
          </p>
        </motion.div>
      </div>

      <div className="relative mx-auto mt-14 max-w-4xl sm:mt-16">
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[min(72%,22rem)] w-[min(96%,36rem)] -translate-x-1/2 -translate-y-1/2 rounded-[2rem] bg-gradient-to-r from-indigo-400/25 via-violet-400/20 to-blue-400/25 opacity-80 blur-2xl max-md:opacity-60 md:blur-3xl"
          aria-hidden
        />

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-100/80 p-2 shadow-[0_20px_48px_-32px_rgba(15,23,42,0.14),0_0_0_1px_rgba(255,255,255,0.8)_inset] ring-1 ring-slate-200/60 max-md:shadow-[0_14px_36px_-24px_rgba(15,23,42,0.12),0_0_0_1px_rgba(255,255,255,0.75)_inset] md:shadow-[0_32px_80px_-40px_rgba(15,23,42,0.2),0_0_0_1px_rgba(255,255,255,0.8)_inset]"
        >
          <div className="flex items-center gap-2 rounded-xl bg-white/90 px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3">
            <div className="flex gap-1.5 pl-0.5" aria-hidden>
              <span className="h-2.5 w-2.5 rounded-full bg-red-400/90 sm:h-3 sm:w-3" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400/90 sm:h-3 sm:w-3" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/90 sm:h-3 sm:w-3" />
            </div>
            <div className="min-w-0 flex-1 truncate rounded-md bg-slate-100/90 px-3 py-1.5 text-center text-[11px] font-medium text-slate-500 ring-1 ring-slate-200/60 sm:text-xs">
              app.tractionflo.com
            </div>
          </div>
          <div className="mt-2 overflow-hidden rounded-xl bg-white px-4 pb-2 pt-4 shadow-inner ring-1 ring-slate-200/50">
            <div className="space-y-3">
              <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Lead</p>
                <p className="mt-1.5 text-sm font-medium text-slate-800">“Need a lightweight CRM for follow-ups”</p>
              </div>
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-indigo-700">Draft</p>
                <p className="mt-1.5 line-clamp-2 text-sm text-slate-700">
                  “Saw your post and thought this might help — we built a simple follow-up workflow without another bulky tool.”
                </p>
              </div>
              <div className="relative h-20 overflow-hidden rounded-xl border border-slate-200/80 bg-white p-3">
                <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white via-white/90 to-transparent" aria-hidden />
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Replies</p>
                <p className="mt-1 text-sm text-emerald-700">2 new responses today</p>
                <p className="text-sm text-slate-500">+4 pending follow-ups</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.p
          initial={reduceMotion ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: reduceMotion ? 0 : 0.12 }}
          className="mt-8 text-center text-sm font-medium tracking-wide text-slate-500 sm:text-[15px] lg:text-left"
        >
          Nothing sends automatically — you stay in control.
        </motion.p>
      </div>
    </Section>
  );
}
