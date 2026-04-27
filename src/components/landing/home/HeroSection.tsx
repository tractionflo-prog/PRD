import Image from "next/image";
import { PrimaryButton } from "@/components/landing/PrimaryButton";
import { Section } from "@/components/landing/Section";
import { FadeUp } from "@/components/landing/FadeUp";
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

function FloatingCardGlow() {
  return (
    <div
      className="pointer-events-none absolute -inset-10 -z-10 rounded-[2.25rem] bg-[radial-gradient(ellipse_88%_72%_at_50%_52%,rgba(124,92,255,0.42),rgba(99,102,241,0.14),transparent_72%)] opacity-100 blur-2xl"
      aria-hidden
    />
  );
}

export function HeroSection() {
  return (
    <Section
      id="overview"
      className="relative overflow-x-clip overflow-y-visible bg-[linear-gradient(180deg,#ffffff_0%,#f6f4ff_42%,#eef0fb_100%)] scroll-mt-[calc(5.5rem+env(safe-area-inset-top,0px))] pb-[clamp(4rem,10vw,8rem)] pt-[calc(env(safe-area-inset-top,0px)+5.75rem)] sm:pb-[clamp(5.5rem,11vw,8rem)] sm:pt-[calc(env(safe-area-inset-top,0px)+7rem)]"
    >
      <div className="pointer-events-none absolute inset-0 hero-premium-grid opacity-[0.65]" aria-hidden />
      <div className="pointer-events-none absolute -left-28 top-6 h-[22rem] w-[22rem] rounded-full bg-violet-300/18 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -right-28 top-0 h-[26rem] w-[26rem] rounded-full bg-indigo-300/16 blur-3xl" aria-hidden />
      <div
        className="pointer-events-none absolute left-1/2 top-1/3 h-64 w-[min(90%,36rem)] -translate-x-1/2 rounded-full bg-purple-200/14 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto grid min-w-0 max-w-6xl items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.02fr)] lg:items-start lg:gap-x-8 lg:gap-y-6">
        <div className="min-w-0 max-w-xl lg:max-w-[36rem] lg:pt-2">
          <FadeUp preset="hero">
            <h1 className="text-balance text-[clamp(1.75rem,5.5vw+0.65rem,4.85rem)] font-semibold leading-[1.05] tracking-[-0.038em] text-slate-900 sm:leading-[1.02]">
              No one is seeing your product.
            </h1>
          </FadeUp>
          <FadeUp preset="hero" delay={0.08}>
            <div className="mt-6 max-w-lg space-y-3 text-pretty text-[18px] leading-[1.55] text-slate-600 sm:text-[19px]">
              <p className="font-medium text-slate-800">Not because it&apos;s bad.</p>
              <p>Because you&apos;re not in the conversations.</p>
              <p className="pt-1 font-semibold text-slate-900">We put you there — with people already asking.</p>
            </div>
          </FadeUp>
          <FadeUp preset="hero" delay={0.14}>
            <div className="mt-9 flex w-full min-w-0 max-w-md flex-col items-stretch gap-3 sm:max-w-none sm:flex-row sm:items-center sm:justify-start">
              <a href="#join" className="block w-full min-w-0 sm:w-auto">
                <PrimaryButton className="h-12 w-full min-w-0 px-7 text-[15px] sm:w-auto sm:min-w-[12.5rem]">
                  Join early access
                </PrimaryButton>
              </a>
              <a
                href="#process"
                className="inline-flex h-11 items-center justify-center rounded-full px-4 text-[15px] font-medium text-indigo-700 transition-colors duration-200 hover:text-indigo-600"
              >
                See how it works
              </a>
            </div>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-slate-600">
              <span className="font-semibold text-slate-900">10 people are already waiting.</span>{" "}
              <span>You just haven&apos;t reached them yet.</span>
            </p>
            <p className="mt-4 text-[12px] font-medium tracking-wide text-slate-400">
              No spam · No auto-send · You stay in control
            </p>
          </FadeUp>
        </div>

        <FadeUp
          className="hero-visual relative mx-auto w-full min-w-0 max-w-md max-md:mx-auto max-md:mt-2 md:max-w-none lg:-mt-6 lg:origin-top lg:scale-[1.06] xl:scale-[1.1]"
          delay={0.06}
        >
          <div
            className="pointer-events-none absolute left-1/2 top-[42%] h-[min(130%,32rem)] w-[min(118%,30rem)] max-md:left-1/2 max-md:w-[min(100%,22rem)] -translate-x-1/2 -translate-y-1/2 rounded-[3rem] bg-[radial-gradient(ellipse_74%_60%_at_50%_48%,rgba(124,92,255,0.38),rgba(99,102,241,0.12),transparent_68%)] blur-3xl max-md:opacity-90"
            aria-hidden
          />

          <div className="home-float-wrap-a relative z-10 w-full min-w-0 max-md:mx-auto md:w-[58%]">
            <FloatingCardGlow />
            <article className="hero-floating-card relative rounded-[1.25rem] border border-white/85 bg-white/86 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.08),0_0_0_1px_rgba(255,255,255,0.92)_inset] backdrop-blur-xl backdrop-saturate-150 ring-1 ring-slate-200/25 sm:rounded-2xl sm:p-5">
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
                <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200/70 bg-white/80 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-indigo-800 ring-1 ring-indigo-100/90">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400/50 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-indigo-500" />
                  </span>
                  Live
                </span>
              </div>
              <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">10 people ready to reach</p>
              <div className="mt-3 space-y-2">
                {leadRows.map(({ name, meta, time, src, badge }) => (
                  <div
                    key={name}
                    className="flex flex-wrap items-center gap-x-2 gap-y-2 rounded-xl border border-slate-100/90 bg-slate-50/60 px-3 py-2.5 backdrop-blur-sm"
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
          </div>

          <div className="home-float-wrap-b relative z-20 mt-4 w-full min-w-0 max-md:mx-auto md:-mt-[42%] md:ml-[26%] md:mt-0 md:w-[54%]">
            <FloatingCardGlow />
            <article className="hero-floating-card relative rounded-[1.25rem] border border-white/85 bg-white/86 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.08),0_0_0_1px_rgba(255,255,255,0.92)_inset] backdrop-blur-xl backdrop-saturate-150 ring-1 ring-slate-200/25 sm:rounded-2xl sm:p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Message ready</p>
              <p className="mt-2 text-[11px] font-medium text-slate-500">To: Marcus (r/landlords)</p>
              <p className="mt-2.5 rounded-xl border border-indigo-100/80 bg-indigo-50/50 px-3 py-3 text-[12px] leading-relaxed text-slate-800 backdrop-blur-sm sm:px-3.5 sm:text-[13px]">
                Hey Marcus — saw your post about tenant tracking. Built something for this. Happy to share if useful.
                <span className="typing-caret-blink ml-0.5 inline-block h-[0.95em] w-px translate-y-[2px] bg-indigo-500 align-middle" aria-hidden />
              </p>
              <div className="mt-2 flex items-center justify-between gap-2">
                <p className="text-[10px] font-medium tabular-nums text-slate-400">Edited 2s ago</p>
                <span className="rounded-full bg-slate-100/90 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-slate-500 ring-1 ring-slate-200/80">
                  Draft
                </span>
              </div>
              <button
                type="button"
                className="mt-3 inline-flex h-9 w-full items-center justify-center rounded-full bg-[#7C5CFF] text-[12px] font-semibold text-white shadow-[0_10px_28px_-12px_rgba(124,92,255,0.5)] transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] sm:w-auto sm:px-5"
              >
                Copy message
              </button>
            </article>
          </div>

          <div className="home-float-wrap-c relative z-30 mt-4 w-full min-w-0 max-md:mx-auto md:-mt-[38%] md:ml-[58%] md:mt-0 md:w-[42%]">
            <FloatingCardGlow />
            <article className="hero-floating-card relative rounded-[1.25rem] border border-white/85 bg-white/86 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.08),0_0_0_1px_rgba(255,255,255,0.92)_inset] backdrop-blur-xl backdrop-saturate-150 ring-1 ring-slate-200/25 sm:rounded-2xl sm:p-5">
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
                    <p className="min-w-0 flex-1 text-[11px] font-medium leading-snug text-slate-800 [overflow-wrap:anywhere]">
                      {name} — {line} — {time}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </FadeUp>
      </div>
    </Section>
  );
}
