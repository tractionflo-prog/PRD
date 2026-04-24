import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

type SectionProps = {
  id?: string;
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  tone?: "default" | "muted";
};

export function Section({
  id,
  children,
  className,
  innerClassName,
  tone = "default",
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "relative px-5 sm:px-8 lg:px-10",
        tone === "muted" && "bg-[#f8fafc]",
        className,
      )}
    >
      <div
        className={cn(
          "mx-auto w-full min-w-0 max-w-[1200px]",
          innerClassName,
        )}
      >
        {children}
      </div>
    </section>
  );
}
