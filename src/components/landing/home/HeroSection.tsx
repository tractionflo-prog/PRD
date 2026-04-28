"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { PrimaryButton } from "@/components/landing/PrimaryButton";
import { Section } from "@/components/landing/Section";
import { portrait } from "@/lib/landing-portraits";

const leadRows = [
  { name: "Marcus", meta: "r/landlords", time: "1h ago", src: portrait("men", 32), badge: "Likely fit" as const },
  { name: "Rina", meta: "r/SaaS", time: "3h ago", src: portrait("women", 44), badge: "Likely fit" as const },
  { name: "Alex", meta: "X", time: "12m ago", src: portrait("men", 67), badge: "Active now" as const },
] as const;

const replyPreview = [
  { name: "Marcus", line: "Interested", time: "12m ago", src: portrait("men", 32) },
  { name: "Rina", line: "Sounds good", time: "1h ago", src: portrait("women", 44) },
  { name: "Alex", line: "Let\u2019s talk", time: "3h ago", src: portrait("men", 67) },
] as const;

function badgeClass(badge: (typeof leadRows)[number]["badge"]) {
  if (badge === "Active now") {
    return "border-emerald-200/80 bg-emerald-50/90 text-emerald-900 ring-emerald-100/80";
  }
  return "border-violet-200/80 bg-violet-50/90 text-violet-950 ring-violet-100/80";
}

const easeOut = [0.22, 1, 0.36, 1] as const;

const cardShell =
  "hero-floating-card relative rounded-[1.35rem] border border-white/90 bg-white/[0.78] p-4 shadow-[0_24px_48px_-28px_rgba(15,23,42,0.14),0_0_0_1px_rgba(255,255,255,0.95)_inset] backdrop-blur-xl backdrop-saturate-150 ring-1 ring-slate-200/30 sm:rounded-[1.65rem] sm:p-5";

function FloatingCardGlow() {
  return (
    <div
      className="pointer-events-none absolute -inset-8 -z-10 rounded-[2rem] bg-[radial-gradient(ellipse_88%_72%_at_50%_52%,rgba(124,92,255,0.35),rgba(99,102,241,0.1),transparent_72%)] opacity-90 blur-2xl"
      aria-hidden
    />
  );
}

function fadeBlock(delay: number, reduceMotion: boolean | null) {
  if (reduceMotion) {
    return {
      initial: { opacity: 1, y: 0 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0 },
    } as const;
  }
  return {
    initial: { opacity: 0, y: 22 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.65, delay, ease: easeOut },
  } as const;
}

function cardBlock(delay: number, reduceMotion: boolean | null) {
  if (reduceMotion) {
    return {
      initial: { opacity: 1, y: 0 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0 },
    } as const;
  }
  return {
    initial: { opacity: 0, y: 26 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.68, delay, ease: easeOut },
  } as const;
}

export function HeroSection() {
  const reduceMotion = useReducedMotion();

  return (
    <Section
      id="overview"
      className="relative min-h-[min(88svh,900px)] overflow-x-clip overflow-y-visible scroll-mt-[calc(5.5rem+env(safe-area-inset-top,0px))] bg-[linear-gradient(180deg,#ffffff_0%,#faf9ff_38%,#f1effa_100%)] pb-[clamp(3.5rem,8vw,6rem)] pt-[calc(env(safe-area-inset-top,0px)+5.5rem)] sm:min-h-[min(86svh,880px)] sm:pt-[calc(env(safe-area-inset-top,0px)+6.5rem)]"
    >
      <div className="pointer-events-none absolute inset-0 hero-premium-grid opacity-[0.55]" aria-hidden />
      <div className="pointer-events-none absolute -left-32 top-0 h-[28rem] w-[28rem] rounded-full bg-violet-300/14 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -right-24 top-[10%] h-[26rem] w-[26rem] rounded-full bg-indigo-300/12 blur-3xl" aria-hidden />
      <div
        className="pointer-events-none absolute left-1/2 top-[20%] h-72 w-[min(90%,40rem)] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(124,92,255,0.12),transparent_68%)] blur-2xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 h-64 w-[min(100%,48rem)] -translate-x-1/2 bg-[radial-gradient(ellipse_80%_80%_at_50%_100%,rgba(248,250,252,0.9),transparent_65%)]"
        aria-hidden
      />

      <div className="relative mx-auto grid min-h-0 min-w-0 max-w-6xl items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.02fr)] lg:gap-x-12 lg:gap-y-8">
        <div className="mx-auto min-w-0 max-w-[620px] lg:mx-0">
          <motion.p {...fadeBlock(0, reduceMotion)} className="text-[12px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            Stop launching into silence.
          </motion.p>

          <motion.h1
            {...fadeBlock(0.06, reduceMotion)}
            className="mt-5 text-balance text-[clamp(2.75rem,5vw+0.85rem,4.5rem)] font-semibold leading-[1.02] tracking-[-0.04em] text-slate-900"
          >
            People are already asking.
            <span className="mt-1 block text-slate-800">We show you where.</span>
          </motion.h1>

          <motion.p
            {...fadeBlock(0.12, reduceMotion)}
            className="mt-6 text-pretty text-[17px] leading-[1.55] text-slate-600 sm:text-[18px]"
          >
            Find real people already talking about the problem you solve — then start the conversation with a human message
            ready to send.
          </motion.p>

          <motion.p
            {...fadeBlock(0.16, reduceMotion)}
            className="mt-5 text-[14px] font-semibold tracking-wide text-slate-800 sm:text-[15px]"
          >
            Leads found · Messages written · Replies tracked
          </motion.p>

          <motion.div
            {...fadeBlock(0.2, reduceMotion)}
            className="mt-9 flex w-full min-w-0 flex-col items-stretch gap-3 sm:flex-row sm:items-center"
          >
            <a href="#join" className="block w-full min-w-0 sm:w-auto">
              <PrimaryButton className="h-[3.25rem] w-full min-w-0 px-7 text-[15px] sm:h-12 sm:w-auto sm:min-w-[14rem]">
                Get your first 10 conversations →
              </PrimaryButton>
            </a>
            <a
              href="#process"
              className="inline-flex h-[3.25rem] items-center justify-center rounded-full px-5 text-[15px] font-medium text-slate-600 transition-colors duration-200 hover:text-slate-900 sm:h-12"
            >
              See how it works
            </a>
          </motion.div>

          <motion.p {...fadeBlock(0.26, reduceMotion)} className="mt-6 text-[15px] leading-relaxed text-slate-600">
            <span className="font-semibold text-violet-600">3</span> replies today ·{" "}
            <span className="font-semibold text-violet-600">2</span> conversations started ·{" "}
            <span className="font-semibold text-violet-600">1</span> call booked
          </motion.p>

          <motion.p {...fadeBlock(0.3, reduceMotion)} className="mt-5 text-[12px] font-medium tracking-wide text-slate-400">
            No spam · No auto-send · You stay in control
          </motion.p>
        </div>

        <div className="relative mx-auto w-full min-w-0 max-w-[28rem] lg:max-w-none">
          <div
            className="pointer-events-none absolute left-1/2 top-[45%] h-[min(120%,26rem)] w-[min(110%,24rem)] -translate-x-1/2 -translate-y-1/2 rounded-[3rem] bg-[radial-gradient(ellipse_72%_58%_at_50%_50%,rgba(124,92,255,0.28),rgba(99,102,241,0.08),transparent_70%)] blur-3xl"
            aria-hidden
          />

          <div className="hero-float-stack relative flex flex-col gap-5 lg:block lg:min-h-[32rem]">
            <motion.div
              {...cardBlock(0.14, reduceMotion)}
              className="home-float-wrap-a relative z-10 w-full lg:absolute lg:left-0 lg:top-0 lg:w-[58%]"
            >
              <FloatingCardGlow />
              <article className={cardShell}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center -space-x-2.5">
                    {leadRows.map(({ name, src }, idx) => (
                      <Image
                        key={name}
                        src={src}
                        alt=""
                        width={32}
                        height={32}
                        priority={idx === 0}
                        className="relative h-8 w-8 rounded-full border-2 border-white object-cover shadow-[0_2px_10px_rgba(0,0,0,0.1)] first:z-30"
                        sizes="(max-width: 768px) 10vw, 32px"
                      />
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/85 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-600 ring-1 ring-slate-200/60">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/55 opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    </span>
                    Live
                  </span>
                </div>
                <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">10 people ready to reach</p>
                <div className="mt-3 space-y-2">
                  {leadRows.map(({ name, meta, time, src, badge }) => (
                    <div
                      key={name}
                      className="flex flex-wrap items-center gap-x-2 gap-y-2 rounded-xl border border-slate-100/95 bg-slate-50/50 px-3 py-2.5 backdrop-blur-sm"
                    >
                      <Image
                        src={src}
                        alt=""
                        width={30}
                        height={30}
                        className="h-[30px] w-[30px] shrink-0 rounded-full object-cover shadow-[0_2px_10px_rgba(0,0,0,0.08)] ring-2 ring-white"
                        sizes="(max-width: 768px) 10vw, 30px"
                      />
                      <p className="min-w-0 flex-1 text-[12px] font-semibold leading-snug tracking-tight text-slate-900 [overflow-wrap:anywhere] sm:text-[13px]">
                        {name} — {meta} — {time}
                      </p>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-wide ring-1 ${badgeClass(badge)}`}
                      >
                        {badge}
                      </span>
                    </div>
                  ))}
                </div>
              </article>
            </motion.div>

            <motion.div
              {...cardBlock(0.24, reduceMotion)}
              className="home-float-wrap-b relative z-20 w-full lg:absolute lg:left-[22%] lg:top-[38%] lg:w-[56%]"
            >
              <FloatingCardGlow />
              <article className={cardShell}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Message ready</p>
                <p className="mt-2 text-[12px] font-medium text-slate-600">To: Marcus</p>
                <p className="mt-2.5 rounded-xl border border-violet-100/90 bg-violet-50/40 px-3 py-3 text-[12px] leading-relaxed text-slate-800 backdrop-blur-sm sm:px-3.5 sm:text-[13px]">
                  &ldquo;Hey Marcus — saw your post about tenant tracking. Built something for this. Happy to share if
                  useful.&rdquo;
                </p>
                <button
                  type="button"
                  className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-full bg-[#635bff] text-[12px] font-semibold text-white shadow-[0_12px_28px_-14px_rgba(99,91,255,0.45)] transition-transform duration-200 can-hover:hover:-translate-y-0.5 active:scale-[0.99] sm:w-auto sm:px-6"
                >
                  Copy message
                </button>
              </article>
            </motion.div>

            <motion.div
              {...cardBlock(0.34, reduceMotion)}
              className="home-float-wrap-c relative z-30 w-full lg:absolute lg:left-[48%] lg:top-[8%] lg:w-[46%]"
            >
              <FloatingCardGlow />
              <article className={cardShell}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Replies today</p>
                <div className="mt-3 space-y-2.5">
                  {replyPreview.map(({ name, line, time, src }) => (
                    <div key={name} className="flex items-center gap-2">
                      <Image
                        src={src}
                        alt=""
                        width={26}
                        height={26}
                        className="h-[26px] w-[26px] shrink-0 rounded-full object-cover ring-2 ring-white shadow-sm"
                        sizes="26px"
                      />
                      <p className="min-w-0 flex-1 text-[11px] font-medium leading-snug text-slate-800 [overflow-wrap:anywhere] sm:text-[12px]">
                        {name} — {line} — {time}
                      </p>
                    </div>
                  ))}
                </div>
              </article>
            </motion.div>
          </div>
        </div>
      </div>
    </Section>
  );
}
