import { FadeUp } from "@/components/landing/FadeUp";
import { Section } from "@/components/landing/Section";

const inboxRows = [
  { name: "Marcus", status: "replied" },
  { name: "Rina", status: "seen" },
  { name: "Alex", status: "pending" },
] as const;

function statusTone(status: (typeof inboxRows)[number]["status"]) {
  if (status === "replied") return "bg-emerald-100 text-emerald-700";
  if (status === "seen") return "bg-slate-100 text-slate-600";
  return "bg-amber-100 text-amber-700";
}

export function LiveDemoSection() {
  return (
    <Section className="bg-white py-14 sm:py-20 md:py-24">
      <FadeUp className="mx-auto min-w-0 max-w-6xl rounded-[1.25rem] bg-white p-3 shadow-[0_10px_30px_rgba(0,0,0,0.08),0_18px_50px_-35px_rgba(15,23,42,0.12)] ring-1 ring-slate-200/70 sm:p-5">
        <div className="grid min-w-0 gap-3 sm:grid-cols-[0.34fr_0.66fr]">
          <aside className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200/70">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-700/90">Live replies coming in</p>
            <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Inbox</p>
            <div className="mt-2.5 space-y-2">
              {inboxRows.map((row) => (
                <div key={row.name} className="flex items-center justify-between rounded-xl bg-white px-2.5 py-2 ring-1 ring-slate-200/70">
                  <p className="text-[13px] font-medium text-slate-900">{row.name}</p>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${statusTone(row.status)}`}>
                    {row.status}
                  </span>
                </div>
              ))}
            </div>
          </aside>

          <div className="grid gap-3 sm:grid-cols-[1fr_0.95fr]">
            <article className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200/70">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Leads</p>
              <div className="mt-2.5 space-y-2">
                {["Landlord founder", "SaaS PMM", "Ops lead"].map((lead) => (
                  <div key={lead} className="rounded-xl bg-white px-2.5 py-2 text-[12px] font-medium text-slate-800 ring-1 ring-slate-200/70">
                    {lead}
                  </div>
                ))}
              </div>
            </article>
            <article className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200/70">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Message drafts</p>
              <p className="mt-2.5 rounded-xl bg-white px-2.5 py-2 text-[12px] leading-relaxed text-slate-700 ring-1 ring-slate-200/70">
                Saw your thread — built something that helps here. Happy to share if this is useful for you.
              </p>
              <p className="mt-2 rounded-xl bg-white px-2.5 py-2 text-[12px] leading-relaxed text-slate-700 ring-1 ring-slate-200/70">
                Can walk through the workflow if it fits what you&apos;re doing.
              </p>
            </article>
          </div>
        </div>
      </FadeUp>
    </Section>
  );
}
