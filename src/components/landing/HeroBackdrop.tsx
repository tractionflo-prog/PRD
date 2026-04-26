"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

export function HeroBackdrop() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="relative flex h-full min-h-screen w-full min-w-0 items-center justify-center bg-[#0A0A0A] supports-[min-height:100svh]:min-h-[100svh]"
      initial={reduceMotion ? false : { opacity: 0, scale: 1.03 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: reduceMotion ? 0 : 1.05,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <Image
        src="/hero-mobile.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        quality={72}
        className="object-cover object-[right_center] md:hidden"
        decoding="async"
      />
      <Image
        src="/hero-desktop.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        quality={78}
        className="hidden object-cover object-[right_center] md:block lg:object-[center_22%]"
        decoding="async"
      />
    </motion.div>
  );
}
