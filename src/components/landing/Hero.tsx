import { FadeUp } from "./FadeUp";
import { HeroDemandPreview } from "./HeroDemandPreview";

export function Hero() {
  return (
    <section
      id="overview"
      className="relative isolate min-h-[92svh] w-full min-w-0 scroll-mt-32 overflow-x-clip overflow-hidden bg-[#fafafa] pb-20 pt-[calc(env(safe-area-inset-top,0px)+4.25rem)] sm:scroll-mt-24 sm:pb-28 sm:pt-[calc(env(safe-area-inset-top,0px)+4.5rem)] md:pt-24"
    >
      {/* Layered backdrop */}
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#ffffff_0%,#fafbff_42%,#f4f7fc_100%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-[20%] top-0 h-[min(28rem,70vw)] w-[min(28rem,70vw)] rounded-full bg-indigo-400/18 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-[15%] top-[10%] h-[min(24rem,65vw)] w-[min(26rem,68vw)] rounded-full bg-violet-400/14 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-[min(100%,36rem)] -translate-x-1/2 rounded-full bg-sky-300/10 blur-3xl"
        aria-hidden
      />
      <div className="hero-premium-grid pointer-events-none absolute inset-0" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22 opacity=%220.04%22/%3E%3C/svg%3E')] opacity-[0.35] mix-blend-multiply"
        aria-hidden
      />

      <div className="hero-gradient-animated absolute inset-0 min-h-full opacity-50" aria-hidden />
      <div className="hero-ribbons" aria-hidden>
        <div className="hero-ribbon hero-ribbon-1" />
        <div className="hero-ribbon hero-ribbon-2" />
        <div className="hero-ribbon hero-ribbon-3" />
      </div>

      {/* Floating preview cards (decorative) */}
      <div
        className="hero-float-preview pointer-events-none absolute left-[4%] top-[22%] z-0 hidden max-w-[200px] rounded-xl border border-white/70 bg-white/75 px-3 py-2.5 shadow-[0_18px_40px_-22px_rgba(15,23,42,0.18)] backdrop-blur-md lg:left-[6%] lg:block xl:max-w-[220px]"
        aria-hidden
      >
        <p className="text-[10px] font-semibold uppercase tracking-wide text-indigo-600/90">Thread</p>
        <p className="mt-1 text-[11px] leading-snug text-slate-600">
          &ldquo;Anyone else drowning in follow-ups after demos?&rdquo;
        </p>
      </div>
      <div
        className="hero-float-preview-alt pointer-events-none absolute right-[3%] top-[38%] z-0 hidden max-w-[190px] rounded-xl border border-white/70 bg-white/70 px-3 py-2.5 shadow-[0_16px_36px_-20px_rgba(99,102,241,0.25)] backdrop-blur-md lg:right-[5%] lg:block"
        aria-hidden
      >
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Suggested</p>
        <p className="mt-1 text-[11px] font-medium leading-snug text-slate-800">Open with context, not a pitch.</p>
      </div>

      <div className="relative z-[1] mx-auto flex min-h-[min(72vh,52rem)] w-full max-w-5xl flex-col justify-center px-6 sm:px-10 lg:px-12">
        <div className="mx-auto w-full max-w-3xl text-center md:max-w-[44rem] md:text-left">
          <FadeUp preset="hero">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-600 sm:text-xs">
              Signal before scale
            </p>
          </FadeUp>

          <FadeUp preset="hero" delay={0.06} className="mt-5 sm:mt-6">
            <h1 className="text-balance text-[clamp(2.75rem,6vw,4.5rem)] font-semibold leading-[1.05] tracking-tight text-slate-900">
              Stop launching into silence.
            </h1>
          </FadeUp>

          <FadeUp preset="hero" delay={0.1} className="mt-5 max-w-2xl sm:mt-6">
            <p className="text-pretty text-lg leading-relaxed text-slate-600 sm:text-xl">
              Find people already talking about your problem — or start the right conversation when no
              one is.
            </p>
          </FadeUp>

          <FadeUp preset="hero" delay={0.14} className="mt-8 w-full sm:mt-10">
            <HeroDemandPreview />
          </FadeUp>

          <FadeUp preset="hero" delay={0.18} className="mt-6">
            <p className="text-center text-sm font-medium text-slate-500 md:text-left">
              No spam · No auto-send · You stay in control
            </p>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
