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
      <p className="text-[13px] font-medium leading-snug text-[#0A0A0A] sm:text-[14px]">
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
      className="border-b border-[#ECECEC] bg-[#F4F7FB] py-16 sm:py-20 md:py-24"
    >
      <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16">
        <div>
          <FadeUp>
            <p className="text-[12px] font-semibold tracking-[0.14em] text-[#2563EB]">
              THE REAL PROBLEM
            </p>
            <h2 className="mt-4 max-w-[22ch] text-balance text-[1.875rem] font-semibold leading-[1.1] tracking-tight text-[#0A0A0A] sm:text-[2.25rem] lg:text-[2.5rem]">
              <span className="block">You didn&apos;t fail.</span>
              <span className="mt-1 block text-[#0F172A]">
                Your product was never seen.
              </span>
            </h2>
            <div className="mt-6 max-w-[32rem] space-y-4 text-[17px] leading-relaxed text-[#374151] sm:text-lg">
              <p className="text-pretty font-normal">
                No users → no feedback → no chance to improve.
              </p>
              <p className="text-pretty font-normal">
                Most founders quit before anyone actually sees what they built.
              </p>
            </div>
            <p className="mt-8 text-lg font-semibold tracking-tight text-[#2563EB] sm:text-xl">
              We change that.
            </p>
          </FadeUp>
        </div>

        <FadeUp delay={0.06}>
          <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_4px_24px_-8px_rgba(15,23,42,0.12)]">
            <div className="grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              <div className="border-b border-[#ECECEC] bg-[#F8FAFC] px-6 py-7 sm:px-7 sm:py-8 lg:border-b-0 lg:border-r lg:border-[#ECECEC]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#64748B]">
                  Your product
                </p>
                <p className="mt-3 max-w-[18rem] text-[16px] font-semibold leading-snug text-[#0A0A0A] sm:text-[17px]">
                  Something you believed in — sitting in silence.
                </p>
              </div>

              <div className="relative bg-[#FAFBFC] px-4 pb-6 pt-5 sm:px-6 sm:pb-7 sm:pt-6">
                <div className="space-y-2.5">
                  <LeadRow
                    line={above[0].line}
                    meta={above[0].meta}
                    variant="active"
                    className="-translate-x-px"
                  />
                  <LeadRow
                    line={above[1].line}
                    meta={above[1].meta}
                    variant="dim"
                    className="translate-x-0.5"
                  />
                </div>

                <div className="relative z-10 mt-5 sm:mt-5">
                  <div className="h-0.5 w-full bg-[#0F172A]" aria-hidden />
                  <div className="relative -mt-[15px] flex justify-center sm:-mt-4">
                    <div className="max-w-[min(100%,22rem)] bg-[#FAFBFC] px-4 text-center">
                      <p className="text-[15px] font-semibold tracking-tight text-[#0A0A0A] sm:text-base">
                        Momentum dies here
                      </p>
                      <p className="mt-1 text-[13px] leading-snug text-[#64748B]">
                        No replies. No feedback. No signal.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 space-y-2.5 blur-[6px] opacity-[0.28] grayscale sm:mt-3">
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
