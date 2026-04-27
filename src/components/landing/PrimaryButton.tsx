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
        "inline-flex h-12 items-center justify-center rounded-full bg-[#635bff] px-8 text-[15px] font-semibold tracking-tight text-white shadow-[0_10px_24px_-12px_rgba(99,91,255,0.45)] transition-[transform,box-shadow,background-color,filter] duration-200 ease-out can-hover:hover:-translate-y-0.5 can-hover:hover:bg-[#5851ea] can-hover:hover:shadow-[0_14px_32px_-12px_rgba(124,92,255,0.42),0_0_28px_-8px_rgba(124,92,255,0.28)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#635bff]/35 disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
