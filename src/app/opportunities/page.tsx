import type { Metadata } from "next";
import Link from "next/link";
import { ActionBar } from "@/components/opportunities/ActionBar";
import { FeedCards } from "@/components/opportunities/FeedCards";
import type { OpportunityItem } from "@/lib/opportunities/feed-types";
import { getPublicOpportunitiesFeed } from "@/lib/opportunities/feed-service";

export const metadata: Metadata = {
  title: "Live SaaS Opportunities Feed",
  description:
    "Real conversations where people are actively asking for tools and product recommendations.",
};

export const dynamic = "force-dynamic";

type ThemeRow = {
  name: string;
  count: number;
  quote: string;
  confidence: "Strong" | "Emerging";
};

function formatRelativeTime(iso: string): string {
  const ts = Date.parse(iso);
  if (!Number.isFinite(ts)) return "recently";
  const diffSec = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (diffSec < 60) return "just now";
  const min = Math.floor(diffSec / 60);
  if (min < 60) return `${min}m ago`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function getProblemThemes(items: OpportunityItem[]): ThemeRow[] {
  const defs = [
    {
      name: "CRM / lead tracking",
      keywords: ["crm", "lead", "pipeline", "spreadsheet", "follow-up", "follow up"],
    },
    {
      name: "Invoicing / payments",
      keywords: ["invoice", "invoicing", "payment", "billing", "stripe", "recurring"],
    },
    {
      name: "Client management",
      keywords: ["client", "onboarding", "freelancer", "agency"],
    },
    {
      name: "Productivity / workflow",
      keywords: ["workflow", "automate", "automation", "manual", "process"],
    },
    {
      name: "SaaS growth / distribution",
      keywords: ["users", "growth", "distribution", "launch", "marketing", "outreach"],
    },
    {
      name: "AI tools",
      keywords: ["ai", "gpt", "chatbot", "agent"],
    },
  ] as const;

  const buckets = new Map<string, OpportunityItem[]>();
  for (const d of defs) buckets.set(d.name, []);
  buckets.set("Other", []);

  for (const item of items) {
    const hay = item.postText.toLowerCase();
    const def = defs.find((d) => d.keywords.some((k) => hay.includes(k)));
    const key = def ? def.name : "Other";
    buckets.get(key)?.push(item);
  }

  return Array.from(buckets.entries())
    .filter(([, rows]) => rows.length > 0)
    .map(([name, rows]) => ({
      name,
      count: rows.length,
      quote: rows[0]?.postText.slice(0, 130).trim() ?? "",
      confidence: (rows.length >= 3 ? "Strong" : "Emerging") as ThemeRow["confidence"],
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
}

export default async function OpportunitiesPage() {
  const feed = await getPublicOpportunitiesFeed();
  const showEmpty = feed.items.length === 0;
  const featured = feed.items.slice(0, Math.min(3, feed.items.length));
  const remaining = feed.items.slice(featured.length);
  const best = feed.items[0] ?? null;
  const themes = getProblemThemes(feed.items);
  const lastUpdated = formatRelativeTime(feed.updatedAt);

  return (
    <main className="relative min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_42%,#f6f7fb_100%)] pb-24 pt-[calc(env(safe-area-inset-top,0px)+6rem)] sm:pb-28 sm:pt-[calc(env(safe-area-inset-top,0px)+6.5rem)]">
      <section className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <h1 className="text-balance text-[clamp(2rem,4.4vw,3.35rem)] font-semibold leading-[1.06] tracking-[-0.035em] text-slate-900">
            Here&apos;s what people are asking for today
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-[17px] leading-relaxed text-slate-600 sm:text-[18px]">
            Real conversations from Reddit, X, and communities — refreshed daily.
          </p>
          <p className="mt-4 text-[13px] font-medium tracking-wide text-slate-500">No spam. No automation. You stay in control.</p>
          <div className="mx-auto mt-6 grid max-w-4xl gap-2 text-left sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Today</p>
              <p className="mt-1 text-[16px] font-semibold tracking-tight text-slate-900">{feed.items.length} conversations found</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Themes</p>
              <p className="mt-1 text-[16px] font-semibold tracking-tight text-slate-900">{themes.length} problems detected</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Cadence</p>
              <p className="mt-1 text-[16px] font-semibold tracking-tight text-slate-900">Updated daily</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Last updated</p>
              <p className="mt-1 text-[16px] font-semibold tracking-tight text-slate-900">{lastUpdated}</p>
            </div>
          </div>
        </div>

        <div className="mt-12 sm:mt-14">
          {showEmpty ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-8">
              <h2 className="text-[clamp(1.2rem,2.4vw,1.65rem)] font-semibold tracking-tight text-slate-900">
                No strong conversations found in today&apos;s scan.
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-[15px] leading-relaxed text-slate-600">
                We only show quality, real conversations. Check back after the next daily refresh or get a personal feed
                for your product.
              </p>
              <Link
                href="/#join"
                className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-[#635bff] px-6 text-[14px] font-semibold text-white shadow-[0_16px_34px_-16px_rgba(99,91,255,0.55)] transition-colors hover:bg-[#5851ea]"
              >
                Get my personal feed
              </Link>
              {process.env.NODE_ENV !== "production" && feed.debugEmptyReason ? (
                <p className="mt-2 text-[12px] text-slate-500">Debug: {feed.debugEmptyReason}</p>
              ) : null}
            </div>
          ) : (
            <>
              {themes.length > 0 ? (
                <section className="mb-9 rounded-[1.35rem] border border-slate-200/85 bg-white p-5 shadow-[0_22px_48px_-34px_rgba(15,23,42,0.18)] sm:p-7">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-violet-700">Today&apos;s demand snapshot</p>
                  <h2 className="mt-2 text-balance text-[clamp(1.3rem,2.4vw,1.85rem)] font-semibold leading-[1.15] tracking-tight text-slate-900">
                    The clearest problems people are talking about right now.
                  </h2>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {themes.map((theme) => (
                      <article key={theme.name} className="rounded-xl border border-slate-200 bg-slate-50/55 p-4">
                        <p className="text-[15px] font-semibold tracking-tight text-slate-900">{theme.name}</p>
                        <p className="mt-1 text-[13px] font-medium text-slate-600">{theme.count} conversations</p>
                        <p className="mt-2 text-[13px] leading-relaxed text-slate-700">“{theme.quote}”</p>
                        <span
                          className={`mt-3 inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                            theme.confidence === "Strong"
                              ? "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200/70"
                              : "bg-amber-50 text-amber-900 ring-1 ring-amber-200/70"
                          }`}
                        >
                          {theme.confidence} signal
                        </span>
                      </article>
                    ))}
                  </div>
                </section>
              ) : null}

              <section className="relative overflow-hidden rounded-[1.35rem] border border-slate-200/85 bg-white p-5 shadow-[0_22px_48px_-34px_rgba(15,23,42,0.18)] sm:p-7">
                <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-violet-200/35 blur-3xl" aria-hidden />
                <p className="relative text-[11px] font-semibold uppercase tracking-[0.22em] text-violet-700">Start here</p>
                <h2 className="relative mt-2 text-balance text-[clamp(1.3rem,2.4vw,1.85rem)] font-semibold leading-[1.15] tracking-tight text-slate-900">
                  These are the best conversations to join first.
                </h2>
                <div className="relative mt-6">
                  <FeedCards items={featured} featured />
                </div>
              </section>

              {remaining.length > 0 ? (
                <section className="mt-9 rounded-[1.35rem] border border-slate-200/85 bg-white p-5 shadow-[0_20px_44px_-36px_rgba(15,23,42,0.16)] sm:p-7">
                  <h2 className="text-[22px] font-semibold tracking-tight text-slate-900">More conversations to join</h2>
                  <p className="mt-2.5 text-[14px] leading-relaxed text-slate-600">Curated opportunities with clear next actions.</p>
                  <div className="mt-6">
                    <FeedCards items={remaining} />
                  </div>
                </section>
              ) : null}

              {best ? <ActionBar best={best} /> : null}
            </>
          )}
        </div>

        <div className="mt-16 rounded-[1.35rem] border border-slate-200 bg-white p-6 text-center shadow-[0_20px_48px_-34px_rgba(15,23,42,0.16)] sm:p-9">
          <p className="text-balance text-[clamp(1.25rem,2.7vw,1.9rem)] font-semibold leading-[1.2] tracking-tight text-slate-900">
            Want this for your product?
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-[15px] leading-relaxed text-slate-600">
            We&apos;ll find the conversations, signals, and people most relevant to what you&apos;re building.
          </p>
          <Link
            href="/#join"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-[#635bff] px-6 text-[14px] font-semibold text-white shadow-[0_16px_34px_-16px_rgba(99,91,255,0.55)] transition-colors hover:bg-[#5851ea]"
          >
            Get my personal feed
          </Link>
        </div>
      </section>
    </main>
  );
}
