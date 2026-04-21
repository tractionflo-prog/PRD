"use client";

import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

type ScrollCtaProps = {
  children: ReactNode;
  href?: string;
  className?: string;
  variant?: "primary" | "subtle";
};

export function ScrollCta({
  children,
  href = "#join",
  className,
  variant = "primary",
}: ScrollCtaProps) {
  return (
    <a
      href={href}
      onClick={(e) => {
        const id = href.replace("#", "");
        const el = document.getElementById(id);
        if (el) {
          e.preventDefault();
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }}
      className={cn(
        "inline-flex h-11 items-center justify-center rounded-full px-7 text-[15px] font-medium tracking-tight transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
        variant === "primary"
          ? "bg-[#2563EB] text-white shadow-sm hover:bg-[#1D4ED8] focus-visible:outline-[#2563EB]/35"
          : "border border-[#E5E7EB] bg-white text-[#0A0A0A] hover:border-[#BFDBFE] hover:bg-[#EFF6FF] focus-visible:outline-[#BFDBFE]",
        className,
      )}
    >
      {children}
    </a>
  );
}
