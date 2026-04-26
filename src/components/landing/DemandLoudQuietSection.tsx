"use client";

import { motion, useReducedMotion } from "framer-motion";

const loud = [
  {
    name: "Marcus",
    line: "Any tools for managing tenants without spreadsheets?",
    meta: "r/landlords · 1h ago",
  },
  {
    name: "Rina",
    line: "Looking for a lightweight CRM that doesn’t add overhead",
    meta: "r/SaaS · 3h ago",
  },
] as const;

const quiet = [
  {
    name: "Alex",
    line: "Need something simple for ops workflows",
    meta: "Likely fit · ops",
  },
  {
    name: "Jared",
    line: "Too many options — hard to choose a tool",
    meta: "Likely fit · evaluation",
  },
] as const;

type DemandCard = {
  readonly name: string;
  readonly line: string;
  readonly meta: string;
};

function FloatCard({
  item,
  tone,
  delay,
}: {
  item: DemandCard;
  tone: "loud" | "quiet";
  delay: number;
}) {
  const reduceMotion = useReducedMotion();
  const loudTone =
    tone === "loud"
      ? "bg-white/90 shadow-[0_20px_50px_-24px_rgba(99,102,241,0.25),0_0_0_1px_rgba(99,102,241,0.08)] ring-1 ring-indigo-500/10"
      : "bg-white/85 shadow-[0_18px_44px_-22px_rgba(15,23,42,0.12),0_0_0_1px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/60";

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8%" }}
      transition={{ duration: 0.55, delay: reduceMotion ? 0 : delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={reduceMotion ? undefined : { y: -4 }}
      className={`rounded-2xl px-4 py-3.5 backdrop-blur-md sm:px-5 sm:py-4 ${loudTone}`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-600/90">{item.name}</p>
      <p className="mt-1.5 text-sm font-medium leading-snug text-slate-900 sm:text-[15px]">
        &ldquo;{item.line}&rdquo;
      </p>
      <p className="mt-2 text-xs font-medium text-slate-500">{item.meta}</p>
    </motion.div>
  );
}

export function DemandLoudQuietSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="demand"
      className="relative scroll-mt-24 overflow-hidden bg-[#f6f7fb] py-24 sm:scroll-mt-20 sm:py-32 md:py-36"
    >
      <div
        className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-slate-200/80 to-transparent md:block"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-0 top-0 h-[420px] w-[min(100%,28rem)] bg-gradient-to-br from-indigo-200/30 via-transparent to-transparent blur-2xl md:h-[520px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 right-0 h-[380px] w-[min(100%,24rem)] bg-gradient-to-tl from-violet-200/25 via-transparent to-transparent blur-2xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-6 sm:px-8 lg:px-10">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-12%" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Demand</p>
          <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Loud threads and quiet signal — in one view.
          </h2>
        </motion.div>

        <div className="mt-16 grid gap-12 md:mt-20 md:grid-cols-2 md:gap-10 lg:gap-16">
          <div className="relative md:pr-6">
            <motion.p
              initial={reduceMotion ? false : { opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mb-6 text-sm font-semibold text-slate-900 md:mb-8"
            >
              When demand is <span className="text-indigo-600">loud</span>
            </motion.p>
            <div className="space-y-4">
              {loud.map((item, i) => (
                <FloatCard key={item.name} item={item} tone="loud" delay={0.08 * i} />
              ))}
            </div>
          </div>

          <div className="relative md:pl-6">
            <motion.p
              initial={reduceMotion ? false : { opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mb-6 text-sm font-semibold text-slate-900 md:mb-8"
            >
              When demand is <span className="text-slate-600">quiet</span>
            </motion.p>
            <div className="space-y-4">
              {quiet.map((item, i) => (
                <FloatCard key={item.name} item={item} tone="quiet" delay={0.08 * i + 0.12} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
