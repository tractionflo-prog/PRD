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
    "border-[#BFDBFE] bg-[#EFF6FF] ring-1 ring-[#2563EB]/12";
  const dim =
    variant === "dim" &&
    "border-[#E8E8E8] bg-white opacity-[0.68]";

  return (
    <div
      className={`rounded-lg border px-3 py-2 sm:px-3.5 sm:py-2.5 ${active || dim} ${className}`}
    >
      <p className="text-[11.5px] font-medium leading-snug text-[#0A0A0A] sm:text-[13px]">
        {line}
      </p>
      <p className="mt-0.5 text-[10px] leading-snug text-[#9CA3AF] sm:text-[11px]">
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
      className="border-b border-[#ECECEC] py-20 sm:py-24 md:py-28 lg:py-32"
    >
      <FadeUp>
        <h2 className="max-w-[44rem] text-balance text-[1.7rem] font-bold leading-[1.12] tracking-tight text-[#0A0A0A] sm:text-[2rem] lg:text-[2.05rem]">
          You didn’t fail. You just stopped too early.
        </h2>
        <p className="mt-3 max-w-[36rem] text-[16px] font-medium leading-snug text-[#6B7280] sm:text-[17px]">
          Before anyone actually saw it.
        </p>
      </FadeUp>

      <FadeUp delay={0.05}>
        <div className="mt-11 rotate-[0.12deg] overflow-hidden rounded-xl border border-[#DCDCDC] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:mt-12">
          <div className="grid lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.32fr)]">
            <div className="border-b border-[#ECECEC] bg-[#FAFAFA] px-5 py-6 sm:px-6 sm:py-7 lg:border-b-0 lg:border-r lg:border-[#ECECEC]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9CA3AF]">
                Your product
              </p>
              <p className="mt-2 max-w-[16rem] pl-0.5 text-[15px] font-medium leading-snug text-[#0A0A0A] sm:text-[16px]">
                Something you believed in.
              </p>
            </div>

            <div className="relative bg-[#FAFAFA] px-3.5 pb-4 pt-3.5 sm:px-5 sm:pb-5 sm:pt-4">
              <div className="space-y-1.5 sm:space-y-2">
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

              <div className="relative z-10 mt-3.5 sm:mt-3">
                <div className="h-[2px] w-full bg-[#0A0A0A]" aria-hidden />
                <div className="relative -mt-[13px] flex justify-center sm:-mt-[14px]">
                  <div className="max-w-[min(100%,20rem)] bg-[#FAFAFA] px-3 text-center">
                    <p className="text-[13px] font-semibold tracking-tight text-[#0A0A0A] sm:text-[14px]">
                      You stopped here
                    </p>
                    <p className="mt-0.5 text-[11px] leading-snug text-[#737373]">
                      No replies. No feedback. No signal.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-2.5 space-y-1.5 blur-[8px] opacity-[0.22] grayscale sm:mt-2 sm:space-y-2">
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

        <p className="mt-4 max-w-[48rem] text-[1.05rem] font-semibold leading-snug text-[#0A0A0A] sm:mt-5 sm:text-[1.125rem] lg:text-xl">
          The idea never got a{" "}
          <span className="text-[#2563EB]">real shot</span>.
        </p>
      </FadeUp>
    </Section>
  );
}
