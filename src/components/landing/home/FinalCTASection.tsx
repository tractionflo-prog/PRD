import Image from "next/image";
import { Section } from "@/components/landing/Section";
import { WaitlistForm } from "@/components/landing/WaitlistForm";
import { FadeUp } from "@/components/landing/FadeUp";
import { portrait } from "@/lib/landing-portraits";

const faces = [portrait("women", 33), portrait("men", 45), portrait("women", 62), portrait("men", 12)] as const;

export function FinalCTASection() {
  return (
    <Section
      id="join"
      className="relative overflow-hidden scroll-mt-[calc(5.5rem+env(safe-area-inset-top,0px))] bg-[linear-gradient(180deg,#fafafa_0%,#f6f4ff_32%,#ffffff_100%)] py-20 sm:py-28 md:py-36"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[min(68%,26rem)] bg-[radial-gradient(ellipse_75%_55%_at_50%_0%,rgba(124,92,255,0.12),transparent_60%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 h-64 w-[min(100%,40rem)] -translate-x-1/2 bg-[radial-gradient(ellipse_at_50%_100%,rgba(15,23,42,0.04),transparent_70%)]"
        aria-hidden
      />

      <FadeUp className="relative mx-auto max-w-2xl px-1 text-center sm:px-0">
        <div className="mx-auto flex justify-center -space-x-2.5">
          {faces.map((src, i) => (
            <Image
              key={i}
              src={src}
              alt=""
              width={44}
              height={44}
              className="relative h-11 w-11 rounded-full border-[3px] border-white object-cover shadow-[0_4px_14px_rgba(0,0,0,0.08)] first:z-20"
              sizes="(max-width: 640px) 12vw, 44px"
            />
          ))}
        </div>

        <h2 className="mt-8 text-balance text-[clamp(1.55rem,4vw+0.5rem,2.35rem)] font-semibold leading-[1.12] tracking-[-0.035em] text-slate-900">
          Your next 10 conversations are already out there.
        </h2>

        <p className="mx-auto mt-5 max-w-md text-[16px] leading-relaxed text-slate-600 sm:mt-6 sm:text-[17px] md:text-[18px]">
          Tell us what you built. We&apos;ll help you find where people are already asking.
        </p>

        <div className="final-cta-form-wrap group relative mx-auto mt-10 max-w-lg">
          <div
            className="pointer-events-none absolute -inset-4 rounded-[1.4rem] bg-[radial-gradient(ellipse_at_50%_50%,rgba(124,92,255,0.2),transparent_65%)] opacity-70 blur-2xl transition-opacity duration-500 ease-out group-focus-within:opacity-90 [@media(hover:hover)]:group-hover:opacity-85"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-b from-white/55 to-transparent opacity-90"
            aria-hidden
          />
          <div className="relative rounded-2xl border border-slate-200/70 bg-white/85 p-1 shadow-[0_28px_56px_-32px_rgba(15,23,42,0.12),0_0_0_1px_rgba(255,255,255,0.92)_inset] ring-1 ring-slate-900/[0.03] backdrop-blur-xl transition-[box-shadow,border-color,background-color] duration-300 ease-out group-focus-within:border-slate-300/85 group-focus-within:bg-white/92 group-focus-within:shadow-[0_32px_64px_-30px_rgba(15,23,42,0.1),0_0_0_1px_rgba(255,255,255,0.95)_inset] [@media(hover:hover)]:group-hover:border-slate-300/75"
          >
            <div className="rounded-[0.9rem] bg-white/60 p-4 sm:p-5">
              <WaitlistForm
                source="final_cta"
                submitLabel="Join early access"
                prominentFocus
                submitButtonClassName="!h-[3.25rem] w-full !min-w-0 !px-5 !text-[15px] sm:!h-14 sm:!min-w-[12.5rem] sm:!w-auto sm:!px-10 sm:!text-[16px]"
              />
            </div>
          </div>
        </div>

        <p className="mt-7 text-[13px] font-medium leading-relaxed tracking-wide text-slate-500">
          Free to start · No spam · You approve every message
        </p>
      </FadeUp>
    </Section>
  );
}
