"use client";

import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";

const levels = [
  { icon: "🥇", label: "Oro", req: "100K+", color: "#212226" },
  { icon: "🥈", label: "Platino", req: "500K+", color: "#212226" },
  { icon: "💎", label: "Diamante", req: "1M+", color: "#f0552f" },
];

export default function AwardsPreview() {
  const t = useTranslations("awardsPreview");
  const locale = useLocale();

  return (
    <section className="bg-[#f2b33d] relative overflow-hidden">
      {/* Ghost "AWARDS" text */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
        aria-hidden
      >
        <span
          className="font-display font-black text-[25vw] leading-none text-outline"
          style={{ WebkitTextStroke: "1px rgba(33,34,38,0.07)", color: "transparent" }}
        >
          AWARDS
        </span>
      </div>

      <div className="relative z-10 max-w-screen-xl mx-auto px-6 lg:px-10 py-20 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* Left */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#212226]/50 mb-4">
              — {t("subtitle")}
            </p>
            <h2 className="font-display font-black text-[#212226] text-5xl lg:text-6xl xl:text-8xl leading-none mb-8">
              {t("title")}
            </h2>
            <p className="text-sm text-[#212226]/60 leading-relaxed mb-10 max-w-sm">
              {t("subtitle")}
            </p>
            <Link
              href={`/${locale}/galardones`}
              className="group inline-flex items-center gap-4 bg-[#212226] text-white text-xs font-black uppercase tracking-widest px-7 py-4 hover:bg-[#f0552f] transition-colors"
            >
              {t("cta")}
              <span className="w-4 h-px bg-current group-hover:w-6 transition-all" />
            </Link>
          </motion.div>

          {/* Right */}
          <div className="space-y-4">
            {/* Streaming levels */}
            <div className="grid grid-cols-3 gap-2">
              {levels.map((l, i) => (
                <motion.div
                  key={l.label}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-[#e0a02c] p-6 text-center"
                >
                  <div className="text-4xl mb-2">{l.icon}</div>
                  <div className="font-display font-black text-[#212226] text-lg leading-none">{l.label}</div>
                  <div className="text-[10px] text-[#212226]/50 mt-1 uppercase tracking-wider">{l.req} streams</div>
                </motion.div>
              ))}
            </div>

            {/* Propya panel */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-[#212226] p-8 flex items-center justify-between"
            >
              <div>
                <div className="font-display font-black text-white text-2xl mb-1">
                  {t("propya")}
                </div>
                <div className="text-[10px] text-white/30 uppercase tracking-wider">
                  Premios de la industria fonográfica PY
                </div>
              </div>
              <span className="text-5xl">🏆</span>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
