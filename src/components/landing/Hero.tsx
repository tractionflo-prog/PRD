import { FadeUp } from "./FadeUp";
import { HeroDemandPreview } from "./HeroDemandPreview";

export function Hero() {
  return (
    <section
      id="overview"
      className="relative isolate w-full min-w-0 scroll-mt-32 overflow-x-clip overflow-hidden bg-white pb-12 pt-[calc(env(safe-area-inset-top,0px)+4.25rem)] max-md:pb-14 sm:scroll-mt-24 sm:pb-24 sm:pt-[calc(env(safe-area-inset-top,0px)+4.5rem)] md:pb-28 md:pt-24"
    >
      <div className="hero-gradient-animated absolute inset-0 min-h-full" aria-hidden />
      <div className="hero-ribbons" aria-hidden>
        <div className="hero-ribbon hero-ribbon-1" />
        <div className="hero-ribbon hero-ribbon-2" />
        <div className="hero-ribbon hero-ribbon-3" />
      </div>

      <div className="relative z-[1] mx-auto w-full min-w-0 max-w-[1200px] px-5 py-8 sm:px-8 sm:py-16 md:py-20 lg:px-10">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center md:max-w-[44rem] md:items-start md:text-left">
          <FadeUp preset="hero">
            <p className="inline-flex items-center gap-2 rounded-full border border-[#e2e8f0] bg-white/90 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#64748b] shadow-[0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-sm sm:text-[12px] md:self-start">
              Demand → conversations
            </p>
          </FadeUp>

          <FadeUp preset="hero" delay={0.05} className="mt-4 sm:mt-7 md:mt-6">
            <h1 className="text-balance text-[1.85rem] font-bold leading-[1.06] tracking-tight text-[#0f172a] max-md:max-w-[20ch] sm:text-[2.5rem] sm:leading-[1.06] md:max-w-none md:text-[2.85rem] md:leading-[1.04]">
              <span className="md:hidden">Launch where people already care</span>
              <span className="hidden md:inline">Stop launching into silence</span>
            </h1>
          </FadeUp>

          <FadeUp preset="hero" delay={0.1} className="mt-3 max-w-2xl sm:mt-6 md:mt-5">
            <p className="text-pretty text-[14px] leading-snug text-[#64748b] max-md:max-w-[28ch] sm:text-[17px] sm:leading-relaxed md:mx-0 md:max-w-[38rem]">
              <span className="md:hidden">
                Spot real demand in conversations—or start sharper ones when it&apos;s quiet.
              </span>
              <span className="hidden md:inline">
                Find people already talking about the problem you solve — or start the right
                conversations when demand isn&apos;t visible.
              </span>
            </p>
          </FadeUp>

          <FadeUp preset="hero" delay={0.14} className="mt-4 hidden sm:mt-7 md:mt-6 md:block">
            <p className="text-[13px] font-medium text-[#64748b] sm:text-[14px]">
              Describe the problem, not just the product.
            </p>
          </FadeUp>

          <FadeUp preset="hero" delay={0.18} className="mt-5 w-full max-w-2xl sm:mt-10 md:mt-8 md:self-start">
            <HeroDemandPreview />
          </FadeUp>

          <FadeUp preset="hero" delay={0.22} className="mt-4 hidden max-w-2xl md:mt-5 md:block">
            <p className="text-center text-[12px] font-medium leading-relaxed text-[#94a3b8] sm:text-[13px] md:text-left">
              No spam • Nothing sends automatically • You stay in control
            </p>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
