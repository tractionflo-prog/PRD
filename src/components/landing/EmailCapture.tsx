"use client";

import { useState } from "react";
import { FadeUp } from "./FadeUp";
import { PrimaryButton } from "./PrimaryButton";
import { Section } from "./Section";
import { SurfaceCard } from "./SurfaceCard";

export function EmailCapture() {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const email = String(fd.get("email") ?? "").trim();
    const building = String(fd.get("building") ?? "").trim();

    if (!email) {
      setStatus("error");
      setMessage("Add your email so we can reach you.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/early-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, building: building || undefined }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "Something went wrong. Try again.");
        return;
      }

      setStatus("success");
      setMessage("You’re on the list. We’ll be in touch.");
      form.reset();
    } catch {
      setStatus("error");
      setMessage("Network error. Check your connection and try again.");
    }
  }

  return (
    <Section
      id="join"
      className="scroll-mt-14 bg-[#FAFAFA] pb-24 pt-12 sm:pb-28 md:pb-32"
    >
      <FadeUp>
        <SurfaceCard className="relative mx-auto max-w-lg overflow-hidden border-[#E8E8E8] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_24px_48px_-28px_rgba(15,23,42,0.1)]">
          <div className="absolute left-0 top-0 h-full w-1 bg-[#2563EB]" aria-hidden />
          <div className="p-8 sm:p-10 sm:pl-11">
            <h2 className="text-2xl font-semibold tracking-tight text-[#0A0A0A] sm:text-[1.75rem]">
              Get early access
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-[#6B7280]">
              We’ll notify you when it’s ready and send an early invite.
            </p>

            {status === "success" ? (
              <p className="mt-8 rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3 text-[15px] font-medium text-[#16A34A]">
                {message}
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-[15px] font-medium text-[#0A0A0A]"
                  >
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="you@company.com"
                    className="mt-2 h-12 w-full rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] px-4 text-[15px] text-[#0A0A0A] placeholder:text-[#9CA3AF] outline-none transition-colors focus:border-[#93C5FD] focus:bg-white focus:ring-2 focus:ring-[#2563EB]/15"
                  />
                </div>
                <div>
                  <label
                    htmlFor="building"
                    className="block text-[15px] font-medium text-[#0A0A0A]"
                  >
                    Optional: What are you building?
                  </label>
                  <textarea
                    id="building"
                    name="building"
                    rows={3}
                    placeholder="A sentence is enough."
                    className="mt-2 w-full resize-none rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] px-4 py-3 text-[15px] text-[#0A0A0A] placeholder:text-[#9CA3AF] outline-none transition-colors focus:border-[#93C5FD] focus:bg-white focus:ring-2 focus:ring-[#2563EB]/15"
                  />
                </div>

                {status === "error" && message && (
                  <p className="text-[15px] text-red-600">{message}</p>
                )}

                <PrimaryButton
                  type="submit"
                  className="h-12 w-full text-[15px]"
                  disabled={status === "loading"}
                >
                  {status === "loading" ? "Joining…" : "Join early access"}
                </PrimaryButton>
              </form>
            )}
          </div>
        </SurfaceCard>
      </FadeUp>
    </Section>
  );
}
