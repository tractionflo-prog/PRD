"use client";

import { motion, useReducedMotion } from "framer-motion";
import { FadeUp } from "./FadeUp";
import { ProductDemo } from "./ProductDemo";
import { Section } from "./Section";

export function ProductPreview() {
  const reduceMotion = useReducedMotion();

  return (
    <Section
      id="preview"
      className="bg-white py-20 sm:py-24 md:py-28 lg:py-32"
    >
      <FadeUp>
        <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#2563EB]">
          Inside the product
        </p>
        <h2 className="mt-3 max-w-[42rem] text-balance text-[2rem] font-semibold leading-[1.1] tracking-tight text-[#0A0A0A] sm:text-[2.4rem] lg:text-[2.75rem]">
          See who&apos;s asking. Decide how to respond. Start conversations.
        </h2>
        <p className="mt-5 max-w-[39rem] text-pretty text-[17px] leading-relaxed text-[#475569] sm:text-[1.08rem]">
          <span className="block">No complex systems.</span>
          <span className="mt-1 block">No outbound campaigns.</span>
        </p>
      </FadeUp>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-12% 0px" }}
        transition={{
          duration: reduceMotion ? 0 : 0.58,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="mt-12 overflow-hidden rounded-2xl border border-[#E2E8F0]/70 bg-[#F8FAFC] shadow-[0_14px_34px_-18px_rgba(15,23,42,0.3),0_44px_80px_-40px_rgba(15,23,42,0.38)] ring-1 ring-[#2563EB]/6 sm:mt-14 lg:rounded-[1.3rem]"
      >
        <ProductDemo />
      </motion.div>

      <FadeUp delay={0.1} className="mt-6 text-center">
        <p className="text-[14px] font-medium tracking-wide text-[#64748B] sm:text-[15px]">
          A simple loop: see → respond → learn
        </p>
      </FadeUp>
    </Section>
  );
}
