"use client";

import { motion, useReducedMotion } from "framer-motion";
import { FadeUp } from "./FadeUp";
import { ProductDemo } from "./ProductDemo";
import { Section } from "./Section";

export function ProductPreview() {
  const reduceMotion = useReducedMotion();

  return (
    <Section id="preview" className="bg-[#f8fafc] py-20 sm:py-24 md:py-28 lg:py-32">
      <FadeUp>
        <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#635bff]">
          Inside the product
        </p>
        <h2 className="mt-3 max-w-[42rem] text-balance text-[2rem] font-semibold leading-[1.1] tracking-tight text-[#0f172a] sm:text-[2.4rem] lg:text-[2.75rem]">
          See who&apos;s asking — or who to reach
        </h2>
        <p className="mt-5 max-w-[39rem] text-pretty text-[17px] leading-relaxed text-[#64748b] sm:text-[1.08rem]">
          Move from silence to conversation without guessing in the dark. Demand signals when
          they&apos;re visible; people likely facing the problem when they&apos;re not.
        </p>
      </FadeUp>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-12% 0px" }}
        transition={{
          duration: reduceMotion ? 0 : 0.58,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="mt-12 overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.1)] sm:mt-14"
      >
        <ProductDemo />
      </motion.div>

      <FadeUp delay={0.1} className="mt-6 text-center md:text-left">
        <p className="text-[14px] font-medium tracking-wide text-[#64748b] sm:text-[15px]">
          See demand signals → shape a message draft → you send, manually
        </p>
      </FadeUp>
    </Section>
  );
}
