import { cn } from "@/lib/cn";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type PrimaryButtonProps = {
  children: ReactNode;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function PrimaryButton({
  children,
  className,
  type = "button",
  ...props
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-12 items-center justify-center rounded-full bg-[#2563EB] px-8 text-[15px] font-semibold tracking-tight text-white shadow-[0_10px_24px_-12px_rgba(37,99,235,0.6)] transition-[transform,box-shadow,background-color] duration-200 ease-out can-hover:hover:-translate-y-0.5 can-hover:hover:bg-[#1D4ED8] can-hover:hover:shadow-[0_14px_30px_-14px_rgba(29,78,216,0.6)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]/35 disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
