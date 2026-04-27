"use client";

import { cn } from "@/lib/cn";
import Link from "next/link";
import type { ReactNode } from "react";

type ScrollCtaProps = {
  children: ReactNode;
  href?: string;
  className?: string;
  variant?: "primary" | "subtle" | "ghostDark";
  "aria-label"?: string;
};

export function ScrollCta({
  children,
  href = "/#join",
  className,
  variant = "primary",
  "aria-label": ariaLabel,
}: ScrollCtaProps) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      onClick={(e) => {
        const id = href.includes("#")
          ? href.split("#").pop() ?? ""
          : href.replace(/^#/, "");
        if (!id) return;
        const el = document.getElementById(id);
        if (el && window.location.pathname === "/") {
          e.preventDefault();
          el.scrollIntoView({
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
            block: "start",
            inline: "nearest",
          });
        }
      }}
      className={cn(
        "inline-flex h-11 items-center justify-center rounded-full px-6 text-[15px] font-medium tracking-tight focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:h-12",
        variant === "primary"
          ? "bg-indigo-600 text-white font-medium shadow-lg shadow-indigo-600/20 transition-[transform,box-shadow,background-color] duration-200 ease-out can-hover:hover:-translate-y-0.5 can-hover:hover:bg-indigo-500 can-hover:hover:shadow-lg can-hover:hover:shadow-indigo-600/25 focus-visible:outline-indigo-500/40"
          : variant === "ghostDark"
            ? "border border-white/22 bg-white/[0.07] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-sm transition-[border-color,background-color,transform] duration-200 ease-out can-hover:hover:border-white/35 can-hover:hover:bg-white/[0.11] can-hover:hover:-translate-y-0.5 focus-visible:outline-white/40"
            : "border border-[#E5E7EB] bg-white text-[#0A0A0A] transition-[border-color,background-color] duration-200 ease-out can-hover:hover:border-[#c4b5fd] can-hover:hover:bg-[#f5f3ff] focus-visible:outline-[#635bff]/30",
        className,
      )}
    >
      {children}
    </Link>
  );
}
