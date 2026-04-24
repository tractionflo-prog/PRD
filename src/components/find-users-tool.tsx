"use client";

import { FadeUp } from "@/components/landing/FadeUp";
import { PrimaryButton } from "@/components/landing/PrimaryButton";
import { ScrollCta } from "@/components/landing/ScrollCta";
import { Section } from "@/components/landing/Section";
import { gaEvent } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import { getFallbackLeads } from "@/lib/find-users-fallback";
import type { FindUsersResponse } from "@/lib/find-users-types";
import { useState } from "react";

const PLACEHOLDER =
  "I built a tool for landlords to manage tenants...";

export function FindUsersTool() {
  const [product, setProduct] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<FindUsersResponse | null>(null);
  const [copied, setCopied] = useState<number | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = product.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setError(null);
    setData(null);
    setCopied(null);

    try {
      const res = await fetch("/api/find-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product: trimmed }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        setError(
          typeof body.error === "string"
            ? body.error
            : "Something went wrong. Showing a preview instead.",
        );
        setData(getFallbackLeads(trimmed));
        gaEvent("find_users_fallback", { reason: "http_error" });
        return;
      }

      const json = (await res.json()) as FindUsersResponse;
      const leads = Array.isArray(json.leads)
        ? json.leads
            .filter(
              (l) =>
                l &&
                typeof l.title === "string" &&
                typeof l.url === "string" &&
                typeof l.reply === "string" &&
                typeof l.why === "string" &&
                typeof l.snippet === "string",
            )
            .slice(0, 3)
        : [];
      setData(
        leads.length >= 1 ? { leads } : getFallbackLeads(trimmed),
      );
      gaEvent("find_users_success", { method: "api" });
    } catch {
      setError("Network issue — here’s a preview you can still use.");
      setData(getFallbackLeads(trimmed));
      gaEvent("find_users_fallback", { reason: "network" });
    } finally {
      setLoading(false);
    }
  }

  async function copyReply(text: string, index: number) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(index);
      window.setTimeout(() => setCopied((c) => (c === index ? null : c)), 2000);
    } catch {
      setCopied(null);
    }
  }

  const leads = data?.leads ?? [];

  return (
    <Section
      id="find-users"
      className="scroll-mt-24 border-t border-[#E8EDF5] bg-[#F4F7FB] py-14 sm:scroll-mt-20 sm:py-16 md:py-20"
    >
      <div className="mx-auto max-w-[640px]">
        <h2 className="text-balance text-[1.45rem] font-semibold leading-tight tracking-tight text-[#0A0A0A] sm:text-[1.65rem]">
          Find people already looking for what you built
        </h2>
        <p className="mt-3 max-w-[40rem] text-pretty text-[15px] leading-relaxed text-[#475569] sm:text-[16px]">
          Describe what you built. We&apos;ll show you real people already
          asking for it.
        </p>

        <form
          onSubmit={onSubmit}
          className="mt-8 space-y-4"
          aria-busy={loading}
        >
          <label htmlFor="find-users-product" className="sr-only">
            What you built
          </label>
          <textarea
            id="find-users-product"
            name="product"
            rows={3}
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            placeholder={PLACEHOLDER}
            disabled={loading}
            className="w-full resize-none rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3.5 text-[15px] leading-relaxed text-[#0F172A] shadow-[0_1px_0_rgba(15,23,42,0.04)] outline-none transition-[border-color,box-shadow] placeholder:text-[#94A3B8] focus:border-[#93C5FD] focus:ring-2 focus:ring-[#2563EB]/15 disabled:opacity-60"
          />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <PrimaryButton
              type="submit"
              disabled={loading || !product.trim()}
              className="h-12 w-full shrink-0 px-8 sm:w-auto sm:min-w-[11rem]"
            >
              {loading ? "Finding…" : "Find leads"}
            </PrimaryButton>
            <p className="text-center text-[13px] leading-snug text-[#64748B] sm:text-left sm:text-[14px]">
              No cold outreach. Just real demand.
            </p>
          </div>
        </form>

        {loading ? (
          <p
            className="mt-10 text-[15px] font-medium text-[#334155]"
            role="status"
            aria-live="polite"
          >
            Finding people already asking for this...
          </p>
        ) : null}

        {error && data ? (
          <p
            className="mt-6 rounded-xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-[14px] text-amber-950"
            role="status"
          >
            {error}
          </p>
        ) : null}

        {data && !loading && leads.length >= 1 && leads.length <= 3 ? (
          <FadeUp className="mt-12 space-y-8 sm:mt-14">
            <ul className="space-y-4">
              {leads.map((lead, i) => (
                <li key={`${lead.url}-${i}`}>
                  <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-[0_10px_30px_-22px_rgba(15,23,42,0.12)] sm:p-6">
                    <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#64748B]">
                      {lead.source}
                    </p>
                    <p className="mt-2 text-[16px] font-semibold leading-snug tracking-tight text-[#0F172A]">
                      {lead.title}
                    </p>
                    <p className="mt-2 text-[14px] leading-relaxed text-[#475569]">
                      {lead.snippet}
                    </p>
                    <div className="mt-4 rounded-xl bg-[#F8FAFC] px-4 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">
                        Why this is a good lead
                      </p>
                      <p className="mt-1.5 text-[14px] leading-relaxed text-[#334155]">
                        {lead.why}
                      </p>
                    </div>
                    <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
                      <a
                        href={lead.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-10 items-center justify-center rounded-full border border-[#BFDBFE] bg-[#EFF6FF] px-5 text-[14px] font-semibold text-[#1D4ED8] transition-colors duration-200 can-hover:hover:bg-[#DBEAFE]"
                      >
                        Open post
                      </a>
                      <button
                        type="button"
                        onClick={() => copyReply(lead.reply, i)}
                        className={cn(
                          "inline-flex h-10 items-center justify-center rounded-full border px-5 text-[14px] font-semibold transition-colors duration-200",
                          copied === i
                            ? "border-[#86EFAC] bg-[#DCFCE7] text-[#15803D]"
                            : "border-[#E2E8F0] bg-white text-[#0F172A] can-hover:hover:border-[#BFDBFE] can-hover:hover:bg-[#F8FAFC]",
                        )}
                      >
                        {copied === i ? "Copied" : "Copy reply"}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-5 py-8 sm:px-8 sm:py-10">
              <p className="text-center text-[13px] font-semibold tracking-wide text-[#64748B]">
                More leads available…
              </p>
              <div
                className="pointer-events-none mx-auto mt-6 max-w-md space-y-2 opacity-[0.22] blur-[5px]"
                aria-hidden
              >
                <div className="h-3 rounded-full bg-[#CBD5E1]" />
                <div className="h-3 w-[88%] rounded-full bg-[#CBD5E1]" />
                <div className="h-3 w-4/5 rounded-full bg-[#CBD5E1]" />
                <div className="mt-4 h-16 rounded-xl bg-[#E2E8F0]" />
              </div>
              <div className="relative z-[1] mx-auto mt-8 max-w-[26rem] text-center">
                <h3 className="text-[1.05rem] font-semibold leading-snug tracking-tight text-[#0A0A0A] sm:text-[1.15rem]">
                  Want more leads like this?
                </h3>
                <p className="mt-3 text-[15px] leading-relaxed text-[#475569]">
                  We&apos;ll keep finding people already asking for your product.
                </p>
                <div className="mt-6 flex justify-center">
                  <ScrollCta
                    href="/#join"
                    className="h-12 px-8 text-[15px] shadow-[0_10px_28px_-14px_rgba(37,99,235,0.55)]"
                  >
                    Get early access
                  </ScrollCta>
                </div>
              </div>
            </div>
          </FadeUp>
        ) : null}
      </div>
    </Section>
  );
}
