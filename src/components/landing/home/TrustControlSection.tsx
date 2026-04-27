import { Section } from "@/components/landing/Section";
import { FadeUp } from "@/components/landing/FadeUp";

export function TrustControlSection() {
  return (
    <Section className="bg-white py-2 pb-10">
      <FadeUp className="mx-auto max-w-6xl rounded-3xl bg-[#f8f9ff] p-5 ring-1 ring-slate-200/70">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Everything ready. You just send.</h2>
        <p className="mt-3 text-[14px] leading-relaxed text-slate-600 sm:text-[15px]">
          Tractionflo never auto-sends. You approve, edit, copy, and send from your own account.
        </p>
      </FadeUp>
    </Section>
  );
}
