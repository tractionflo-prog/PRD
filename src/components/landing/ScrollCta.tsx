"use client";

import { cn } from "@/lib/cn";
import Link from "next/link";
import type { ReactNode } from "react";

type ScrollCtaProps = {
  children: ReactNode;
  href?: string;
  className?: string;
  variant?: "primary" | "subtle";
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
            behavior: "smooth",
            block: "start",
            inline: "nearest",
          });
        }
      }}
      className={cn(
        "inline-flex h-12 items-center justify-center rounded-full px-8 text-[15px] font-semibold tracking-tight focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
        variant === "primary"
          ? "bg-[#2563EB] text-white shadow-[0_8px_24px_-12px_rgba(37,99,235,0.65)] transition-[transform,box-shadow,background-color] duration-200 ease-out can-hover:hover:-translate-y-0.5 can-hover:hover:bg-[#1D4ED8] can-hover:hover:shadow-[0_14px_30px_-14px_rgba(29,78,216,0.62)] focus-visible:outline-[#2563EB]/35"
          : "border border-[#E5E7EB] bg-white text-[#0A0A0A] transition-[border-color,background-color] duration-200 ease-out can-hover:hover:border-[#BFDBFE] can-hover:hover:bg-[#EFF6FF] focus-visible:outline-[#BFDBFE]",
        className,
      )}
    >
      {children}
    </Link>
  );
}
