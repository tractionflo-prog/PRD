import { FadeUp } from "./FadeUp";
import { Section } from "./Section";

const leads = [
  {
    line: "Marcus — “Any tools for managing tenants without spreadsheets?”",
    meta: "Seen 1h ago",
  },
  {
    line: "Rina — “Looking for a lightweight CRM that doesn’t add overhead”",
    meta: "Seen 3h ago",
  },
  {
    line: "Alex — “Need something simple for ops workflows”",
    meta: "Seen yesterday",
  },
  {
    line: "Jared — “Too many options — hard to choose a tool”",
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
    "border-[#e2e8f0] bg-[#faf5ff] ring-1 ring-[#635bff]/12 shadow-[0_8px_24px_-12px_rgba(99,91,255,0.12)]";
  const dim =
    variant === "dim" && "border-[#e2e8f0] bg-white opacity-[0.72]";

  return (
    <div
      className={`rounded-xl border px-4 py-3 transition-[background-color,border-color,box-shadow,opacity,transform] duration-300 ease-out sm:px-4 sm:py-3.5 ${active || dim} ${className}`}
    >
      <p className="break-words text-[13px] font-medium leading-snug text-[#0f172a] sm:text-[14px]">
        {line}
      </p>
      <p className="mt-1 text-[11px] font-medium leading-snug text-[#64748b] sm:text-xs">
        {meta}
      </p>
    </div>
  );
}

export function ProblemSection() {
  const above = leads.slice(0, 2);
  const below = leads.slice(2, 4);

  return (
    <Section className="bg-[#f8fafc] py-20 sm:py-24 md:py-28 lg:py-32">
      <div className="grid items-center gap-16 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-24">
        <div>
          <FadeUp>
            <h2 className="mt-4 max-w-[22ch] text-balance text-[2.3rem] font-semibold leading-[1.06] tracking-tight text-[#0f172a] sm:text-[2.9rem] lg:text-[3.35rem]">
              Good products often go unnoticed
            </h2>
            <div className="mt-7 max-w-[31rem] space-y-4 text-[17px] leading-relaxed text-[#64748b] sm:text-[1.08rem]">
              <p className="text-pretty font-normal">
                <span className="block">Not because they lack value —</span>
                <span className="mt-1 block">but because distribution comes too late.</span>
              </p>
              <p className="text-pretty font-normal">
                <span className="block">Sometimes people are already asking.</span>
                <span className="mt-1 block">Sometimes they are not visible yet.</span>
              </p>
              <p className="text-pretty font-medium text-[#0f172a]">
                Either way, founders need a way to start the right conversations.
              </p>
            </div>
            <p className="mt-10 max-w-[31rem] text-[17px] font-medium leading-relaxed text-[#0f172a] sm:text-[1.08rem]">
              Tractionflo surfaces demand signals when they exist — and points you to people likely
              facing the problem when threads are quiet.
            </p>
          </FadeUp>
        </div>

        <FadeUp delay={0.09}>
          <div>
            <p className="mb-4 text-[15px] font-medium leading-snug text-[#64748b] sm:text-[16px]">
              People are already asking:
            </p>
            <div className="scale-[1.02] overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.1)]">
              <div className="grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                <div className="border-b border-[#e2e8f0] bg-[#fafafa] px-7 py-8 sm:px-8 sm:py-9 lg:border-b-0 lg:border-r lg:border-[#e2e8f0]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#64748b]">
                    Your product
                  </p>
                  <p className="mt-3 max-w-[18rem] text-[16px] font-semibold leading-snug text-[#0f172a] sm:text-[17px]">
                    Something you believed in — sitting in silence.
                  </p>
                </div>

                <div className="relative bg-white px-5 pb-7 pt-6 sm:px-6 sm:pb-8 sm:pt-7">
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
                    <div className="h-px w-full bg-[#e2e8f0]" aria-hidden />
                    <div className="relative -mt-[13px] flex justify-center sm:-mt-3">
                      <div className="max-w-[min(100%,22rem)] bg-white px-4 text-center">
                        <p className="text-[16px] font-semibold tracking-tight text-[#0f172a] sm:text-[1.05rem]">
                          Timing quietly slips
                        </p>
                        <p className="mt-1 text-[13px] leading-snug text-[#64748b]">
                          Few replies. Thin context. Hard to steer.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="old-leads mt-3 space-y-2.5 opacity-[0.38] blur-[1.5px] grayscale sm:mt-3">
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
            <p className="mt-5 max-w-[28rem] text-pretty text-[15px] font-medium leading-relaxed text-[#64748b] sm:text-[16px]">
              You pick who to reply to and send every message yourself.
            </p>
          </div>
        </FadeUp>
      </div>
    </Section>
  );
}
