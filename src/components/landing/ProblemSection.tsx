import { FadeUp } from "./FadeUp";
import { Section } from "./Section";

const leads = [
  {
    line: "Marcus — Looking for a tool to manage tenants…",
    meta: "Seen 1h ago",
  },
  {
    line: "Rina — Posted in r/SaaS about CRM overload",
    meta: "Seen 3h ago",
  },
  {
    line: "Alex — DM’d about beta access",
    meta: "Seen yesterday",
  },
  {
    line: "Jared — Asked about pricing",
    meta: "Seen yesterday",
  },
];

function LeadRow({
  line,
  meta,
  variant,
  className = "",
}: {
  line: string;
  meta: string;
  variant: "active" | "dim";
  className?: string;
}) {
  const active =
    variant === "active" &&
    "border-[#BFDBFE] bg-[#EFF6FF] ring-1 ring-[#2563EB]/20";
  const dim =
    variant === "dim" &&
    "border-[#E5E7EB] bg-white opacity-[0.72]";

  return (
    <div
      className={`rounded-xl border px-4 py-3 sm:px-4 sm:py-3.5 ${active || dim} ${className}`}
    >
      <p className="break-words text-[13px] font-medium leading-snug text-[#0A0A0A] sm:text-[14px]">
        {line}
      </p>
      <p className="mt-1 text-[11px] font-medium leading-snug text-[#6B7280] sm:text-xs">
        {meta}
      </p>
    </div>
  );
}

export function ProblemSection() {
  const above = leads.slice(0, 2);
  const below = leads.slice(2, 4);

  return (
    <Section
      tone="muted"
      className="bg-[#F4F7FB] py-[100px]"
    >
      <div className="grid items-center gap-16 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-24">
        <div>
          <FadeUp>
            <p className="text-[12px] font-semibold tracking-[0.14em] text-[#2563EB]">
              THE REAL PROBLEM
            </p>
            <h2 className="mt-4 max-w-[20ch] text-balance text-[2.3rem] font-semibold leading-[1.06] tracking-tight text-[#020617] sm:text-[2.9rem] lg:text-[3.35rem]">
              <span className="block">You didn&apos;t fail.</span>
              <span className="mt-1 block text-[#0F172A]">
                Your product was never seen.
              </span>
            </h2>
            <div className="mt-7 max-w-[31rem] space-y-4 text-[17px] leading-relaxed text-[#334155]/75 sm:text-[1.08rem]">
              <p className="text-pretty font-normal">
                No users → no feedback → no chance to improve.
              </p>
              <p className="text-pretty font-normal">
                Most founders quit before anyone actually sees what they built.
              </p>
            </div>
            <p className="mt-11 text-[1.2rem] font-semibold tracking-tight text-[#1D4ED8] sm:text-[1.3rem]">
              We change that.
            </p>
          </FadeUp>
        </div>

        <FadeUp delay={0.06}>
          <div className="scale-[1.04] overflow-hidden rounded-2xl border border-[#DCE6F3] bg-[#F8FAFD] shadow-[0_30px_80px_rgba(0,0,0,0.08),0_10px_30px_rgba(0,0,0,0.04)] ring-1 ring-[#1D4ED8]/6">
            <div className="grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              <div className="border-b border-[#E4EAF2] bg-[#F1F5FB] px-7 py-8 sm:px-8 sm:py-9 lg:border-b-0 lg:border-r lg:border-[#E4EAF2]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#64748B]">
                  Your product
                </p>
                <p className="mt-3 max-w-[18rem] text-[16px] font-semibold leading-snug text-[#0F172A] sm:text-[17px]">
                  Something you believed in — sitting in silence.
                </p>
              </div>

              <div className="relative bg-[#F7FAFE] px-5 pb-7 pt-6 sm:px-6 sm:pb-8 sm:pt-7">
                <div className="space-y-2.5">
                  <LeadRow
                    line={above[0].line}
                    meta={above[0].meta}
                    variant="active"
                    className="-translate-x-px shadow-[0_12px_28px_-18px_rgba(37,99,235,0.55)]"
                  />
                  <LeadRow
                    line={above[1].line}
                    meta={above[1].meta}
                    variant="dim"
                    className="translate-x-0.5"
                  />
                </div>

                <div className="relative z-10 mt-5 sm:mt-5">
                  <div className="h-0.5 w-full bg-[#0F172A]/30" aria-hidden />
                  <div className="relative -mt-[15px] flex justify-center sm:-mt-4">
                    <div className="max-w-[min(100%,22rem)] bg-[#FAFBFC] px-4 text-center">
                      <p className="text-[16px] font-semibold tracking-tight text-[#0A0A0A] sm:text-[1.05rem]">
                        Momentum dies here
                      </p>
                      <p className="mt-1 text-[13px] leading-snug text-[#64748B]">
                        No replies. No feedback. No signal.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="old-leads mt-3 space-y-2.5 opacity-[0.35] blur-[2px] grayscale sm:mt-3">
                  <LeadRow
                    line={below[0].line}
                    meta={below[0].meta}
                    variant="dim"
                    className="-translate-x-0.5"
                  />
                  <LeadRow
                    line={below[1].line}
                    meta={below[1].meta}
                    variant="dim"
                    className="translate-x-px"
                  />
                </div>
              </div>
            </div>
          </div>
        </FadeUp>
      </div>
    </Section>
  );
}
