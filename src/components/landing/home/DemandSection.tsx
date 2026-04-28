"use client";

import Image from "next/image";
import { Fragment, useMemo } from "react";
import { Section } from "@/components/landing/Section";
import { FadeUp } from "@/components/landing/FadeUp";
import { portrait } from "@/lib/landing-portraits";

type FeedPlatform = "reddit" | "x";

type FeedPost = {
  id: string;
  platform: FeedPlatform;
  /** e.g. u_marcus_ops or @ninabuilds */
  handle: string;
  displayName?: string;
  subreddit?: string;
  time: string;
  body: string;
  keywords: readonly string[];
  avatar: string;
  badge: "opportunity" | "live";
};

const feedPosts: readonly FeedPost[] = [
  {
    id: "1",
    platform: "reddit",
    handle: "u_marcus_ops",
    displayName: "Marcus",
    subreddit: "r/landlords",
    time: "1h ago",
    body: "Any tools for managing tenants?",
    keywords: ["tenants", "tools"],
    avatar: portrait("men", 32),
    badge: "opportunity",
  },
  {
    id: "2",
    platform: "reddit",
    handle: "u_rina_saas",
    displayName: "Rina",
    subreddit: "r/SaaS",
    time: "3h ago",
    body: "Looking for lightweight CRM",
    keywords: ["lightweight", "CRM"],
    avatar: portrait("women", 44),
    badge: "opportunity",
  },
  {
    id: "3",
    platform: "x",
    handle: "@ninabuilds",
    displayName: "Nina",
    time: "12m ago",
    body: "Anyone using a dead-simple CRM for outbound?",
    keywords: ["CRM", "outbound", "dead-simple"],
    avatar: portrait("women", 36),
    badge: "live",
  },
  {
    id: "4",
    platform: "reddit",
    handle: "u_logs_weekly",
    subreddit: "r/buildinpublic",
    time: "4h ago",
    body: "How do you stay consistent posting when building solo?",
    keywords: ["consistent", "solo"],
    avatar: portrait("men", 58),
    badge: "live",
  },
  {
    id: "5",
    platform: "x",
    handle: "@devon_ops",
    displayName: "Devon",
    time: "2h ago",
    body: "We outgrew spreadsheets for follow-ups. What did you switch to first?",
    keywords: ["spreadsheets", "follow-ups"],
    avatar: portrait("men", 22),
    badge: "live",
  },
] as const;

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function HighlightedBody({ text, keywords }: { text: string; keywords: readonly string[] }) {
  const nodes = useMemo(() => {
    if (keywords.length === 0) return text;
    const pattern = new RegExp(`(${keywords.map(escapeRegExp).join("|")})`, "gi");
    const parts = text.split(pattern);
    const lower = new Set(keywords.map((k) => k.toLowerCase()));
    return parts.map((part, i) => {
      if (lower.has(part.toLowerCase())) {
        return (
          <mark
            key={`${part}-${i}`}
            className="rounded-sm bg-amber-100/95 px-0.5 font-medium text-amber-950/90 ring-1 ring-amber-200/50"
          >
            {part}
          </mark>
        );
      }
      return <Fragment key={`t-${i}`}>{part}</Fragment>;
    });
  }, [text, keywords]);

  return <>{nodes}</>;
}

function PlatformMark({ platform }: { platform: FeedPlatform }) {
  if (platform === "reddit") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50/95 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-orange-800 ring-1 ring-orange-200/60">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400/50 opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-orange-500" />
        </span>
        Reddit
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100/95 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-800 ring-1 ring-slate-200/80">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-slate-400/45 opacity-75" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-slate-700" />
      </span>
      X
    </span>
  );
}

function metaLine(post: FeedPost) {
  const parts = [post.handle, post.displayName, post.time].filter(Boolean);
  return parts.join(" · ");
}

function FeedCard({ post }: { post: FeedPost }) {
  return (
    <article className="group relative flex gap-3.5 overflow-hidden rounded-2xl bg-white/85 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.06)] ring-1 ring-slate-200/35 backdrop-blur-md transition-[transform,box-shadow] duration-200 [@media(hover:hover)]:hover:-translate-y-1 [@media(hover:hover)]:hover:shadow-[0_20px_44px_-28px_rgba(99,102,241,0.2)]">
      <div className="relative shrink-0 pt-0.5">
        <Image
          src={post.avatar}
          alt=""
          width={44}
          height={44}
          className="h-11 w-11 rounded-full object-cover shadow-[0_4px_14px_rgba(0,0,0,0.08)] ring-2 ring-white"
          sizes="44px"
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 gap-y-1.5">
          <PlatformMark platform={post.platform} />
          <span className="min-w-0 text-[12px] font-medium tracking-tight text-slate-600">
            <span className="font-semibold text-slate-900">{metaLine(post)}</span>
            {post.subreddit ? (
              <>
                <span className="text-slate-300"> · </span>
                <span className="font-semibold text-orange-800/90">{post.subreddit}</span>
              </>
            ) : null}
          </span>
        </div>
        <p className="mt-2.5 text-[14px] leading-relaxed text-slate-800">
          <span className="text-slate-300">&ldquo;</span>
          <HighlightedBody text={post.body} keywords={post.keywords} />
          <span className="text-slate-300">&rdquo;</span>
        </p>
        <div className="mt-3">
          {post.badge === "opportunity" ? (
            <span className="inline-flex rounded-full border border-slate-200/80 bg-gradient-to-r from-slate-50 to-slate-100/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-800 shadow-sm ring-1 ring-slate-100/60">
              This is your opportunity
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/70 bg-emerald-50/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-900 ring-1 ring-emerald-100/70">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/55 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              Live
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

export function DemandSection() {
  const loop = useMemo(() => [...feedPosts, ...feedPosts], []);

  return (
    <Section id="demand" className="bg-[linear-gradient(180deg,#ffffff_0%,#fafbff_45%,#f4f6fb_100%)] py-16 sm:py-20 md:py-28">
      <FadeUp className="mx-auto max-w-6xl">
        <div className="rounded-[1.75rem] bg-[linear-gradient(180deg,#f8f9ff_0%,#ffffff_52%,#f7f8fc_100%)] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.05)] ring-1 ring-slate-200/55 sm:p-10">
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200/70 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/50 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Live demand feed
            </div>
            <h2 className="mt-5 text-balance text-[clamp(1.65rem,3.5vw,2.25rem)] font-semibold tracking-[-0.03em] text-slate-900">
              These are happening right now.
            </h2>
            <p className="mt-3 text-[16px] leading-relaxed text-slate-600">Demand looks like real conversations — not dashboards.</p>
          </div>

          <div className="demand-feed-mask relative mx-auto mt-10 max-h-[min(520px,62vh)] max-w-xl overflow-hidden sm:max-h-[min(560px,65vh)]">
            <div className="demand-feed-track flex flex-col gap-3.5 will-change-transform">
              {loop.map((post, index) => (
                <FeedCard key={`${post.id}-${index}`} post={post} />
              ))}
            </div>
          </div>
        </div>
      </FadeUp>
    </Section>
  );
}
