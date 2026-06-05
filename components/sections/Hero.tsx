"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

const BAR_COUNT = 180;

function generateWave(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const base = Math.sin(i * 0.3) * 0.4 + Math.sin(i * 0.7) * 0.3 + Math.sin(i * 1.1) * 0.3;
    return Math.abs(base) * 0.7 + 0.15;
  });
}

export default function Hero() {
  const t = useTranslations("hero");
  const locale = useLocale();
  const ref = useRef<HTMLElement>(null);
  const bars = generateWave(BAR_COUNT);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative min-h-screen bg-[#f2e2c4] overflow-hidden flex flex-col"
    >
      {/* Animated sound wave background — exact V1 structure */}
      <div className="absolute inset-0 flex items-center justify-center opacity-35 -translate-y-20">
        <div className="flex items-center gap-[3px] w-full px-8">
          {bars.map((height, i) => (
            <motion.div
              key={i}
              className="flex-1 bg-[#f0552f] rounded-full"
              style={{ minWidth: 2 }}
              animate={{
                scaleY: [height, height * 1.6, height * 0.8, height * 1.3, height],
              }}
              transition={{
                duration: 2.5 + (i % 7) * 0.3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.03,
              }}
              initial={{ height: "60px", transformOrigin: "center" }}
            />
          ))}
        </div>
      </div>

      <motion.div
        className="relative z-20 flex-1 flex flex-col items-center justify-center text-center px-6 lg:px-10 py-28"
        style={{ y, opacity }}
      >
        {/* Label */}
        <motion.div
          className="flex items-center gap-3 mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="h-px w-10 bg-[#f0552f]" />
          <Link
            href={`/${locale}/isrc`}
            className="text-[10px] font-black uppercase tracking-[0.25em] text-[#212226]/50 hover:text-[#f0552f] transition-colors"
          >
            Agencia ISRC
          </Link>
          <div className="h-px w-10 bg-[#f0552f]" />
        </motion.div>

        {/* SGP text */}
        <motion.h1
          className="font-display font-black text-[#212226] leading-none tracking-tighter mb-6"
          style={{ fontSize: "clamp(7rem, 20vw, 18rem)" }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          SGP
        </motion.h1>

        {/* Tagline */}
        <motion.p
          className="text-2xl lg:text-3xl font-display font-black text-[#212226] leading-snug max-w-lg mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.65 }}
        >
          {t("tagline")}
        </motion.p>

        {/* Subtitle */}
        <motion.p
          className="text-sm text-[#212226]/55 leading-relaxed max-w-md mb-10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.75 }}
        >
          {t("subtitle")}
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="flex flex-wrap gap-3 justify-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.85 }}
        >
          <Link
            href={`/${locale}/regalias`}
            className="group inline-flex items-center gap-3 bg-[#212226] hover:bg-[#f0552f] text-white text-xs font-black uppercase tracking-[0.15em] px-7 py-4 transition-colors duration-300"
          >
            {t("ctaPago")}
            <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href={`/${locale}/licencias`}
            className="group inline-flex items-center gap-3 border border-[#212226]/30 hover:border-[#f0552f] text-[#212226] hover:text-[#f0552f] text-xs font-black uppercase tracking-[0.15em] px-7 py-4 transition-colors duration-300"
          >
            {t("ctaLicencia")}
            <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 text-[#212226]/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3 }}
      >
        <span className="text-[10px] uppercase tracking-widest">{t("scroll")}</span>
        <motion.div
          className="w-px h-10 bg-[#212226]/20 origin-top"
          animate={{ scaleY: [1, 0.4, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>
    </section>
  );
}
