import Image from "next/image";
import { FadeUp } from "./FadeUp";
import { ScrollCta } from "./ScrollCta";

const OVERLAY =
  "linear-gradient(to right, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.6) 30%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.1) 100%)";

export function Hero() {
  return (
    <section
      id="overview"
      className="relative isolate flex min-h-screen w-full min-w-0 flex-col overflow-hidden bg-[#0A0A0A] scroll-mt-24 supports-[min-height:100svh]:min-h-[100svh] sm:scroll-mt-20"
    >
      {/* Full-bleed background: relative box required for next/image fill on mobile WebKit */}
      <div
        className="pointer-events-none absolute inset-0 z-0 min-h-full w-full"
        aria-hidden
      >
        <div className="relative flex h-full min-h-screen w-full min-w-0 items-center justify-center bg-[#0A0A0A] supports-[min-height:100svh]:min-h-[100svh]">
          <Image
            src="/hero.png"
            alt=""
            fill
            priority
            sizes="100vw"
            quality={85}
            className="object-contain object-center md:object-cover md:object-[center_22%] lg:object-center"
            decoding="async"
          />
        </div>
        <div
          className="absolute inset-0 z-[1] min-h-full w-full"
          style={{ background: OVERLAY }}
        />
      </div>

      <div className="relative z-10 mx-auto flex w-full min-w-0 max-w-[1200px] flex-1 flex-col justify-start px-5 pb-[max(5rem,env(safe-area-inset-bottom,0px))] pt-[calc(3.5rem+env(safe-area-inset-top,0px)+1rem)] sm:px-8 sm:pb-24 md:justify-center md:px-10 md:pb-28 md:pt-[calc(3.5rem+env(safe-area-inset-top,0px)+1.25rem)] lg:pb-32 lg:pt-24">
        <div className="max-w-[600px] min-w-0 text-left">
          <FadeUp>
            <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-white/80 sm:text-[13px]">
              Early access for founders who got 0 signups
            </p>
            <h1 className="mt-5 text-balance text-[1.85rem] font-semibold leading-[1.1] tracking-tight text-white sm:mt-6 sm:text-[2.5rem] sm:leading-[1.08] lg:text-[3rem] lg:leading-[1.06]">
              <span className="block">You didn&apos;t fail.</span>
              <span className="mt-1 block sm:mt-0">No one saw your product.</span>
            </h1>
          </FadeUp>

          <FadeUp delay={0.05} className="mt-6 sm:mt-7">
            <p className="text-pretty text-[1.125rem] font-medium leading-snug text-white/95 sm:text-xl">
              Get your first real users — without cold outreach.
            </p>
          </FadeUp>

          <FadeUp
            delay={0.08}
            className="mt-5 space-y-3 text-[15px] leading-relaxed text-white/75 sm:text-[17px]"
          >
            <p className="text-pretty">
              We surface real people already looking for tools like yours.
            </p>
            <p className="text-pretty">
              You just approve the message. We handle the rest.
            </p>
          </FadeUp>

          <FadeUp delay={0.11} className="mt-9 flex flex-col gap-3 sm:mt-10">
            <div className="w-full max-w-full rounded-full shadow-[0_4px_16px_rgba(37,99,235,0.45)] transition-shadow duration-200 hover:shadow-[0_6px_22px_rgba(29,78,216,0.5)] sm:w-fit">
              <ScrollCta
                href="/#join"
                className="h-12 w-full max-w-full min-w-0 rounded-full !shadow-none px-6 text-[15px] font-semibold transition hover:bg-[#1D4ED8] sm:min-w-[12rem] sm:px-8"
              >
                Get my first users
              </ScrollCta>
            </div>
            <p className="text-[14px] text-white/70 sm:text-[15px]">
              Free • No spam • For founders
            </p>
            <p className="max-w-[28rem] text-[13px] font-medium leading-snug text-white/60 sm:text-sm">
              Early access — we&apos;re rolling this out to a small group of
              founders
            </p>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
