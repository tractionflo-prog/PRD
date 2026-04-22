"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef, type ReactNode } from "react";

const presets = {
  section: {
    initialY: 20,
    duration: 0.58,
  },
  hero: {
    initialY: 22,
    duration: 0.72,
  },
} as const;

type FadeUpProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Larger, slower entrance for hero vs. in-page sections */
  preset?: keyof typeof presets;
};

export function FadeUp({
  children,
  className,
  delay = 0,
  preset = "section",
}: FadeUpProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-12% 0px" });
  const reduceMotion = useReducedMotion();
  const { initialY, duration } = presets[preset];

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: initialY }}
      animate={isInView ? { opacity: 1, y: 0 } : undefined}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
