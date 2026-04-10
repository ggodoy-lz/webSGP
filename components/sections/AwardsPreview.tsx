"use client";

import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";

function DiscoOro({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="30" fill="#f2b33d" stroke="#d4982a" strokeWidth="2"/>
      <circle cx="32" cy="32" r="12" fill="#d4982a"/>
      <circle cx="32" cy="32" r="4" fill="#f2b33d"/>
      <circle cx="32" cy="32" r="28" fill="none" stroke="#d4982a" strokeWidth="0.5" opacity="0.5"/>
      <circle cx="32" cy="32" r="22" fill="none" stroke="#d4982a" strokeWidth="0.5" opacity="0.3"/>
    </svg>
  );
}

function DiscoPlatino({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="30" fill="#d5cfc6" stroke="#b5ad9f" strokeWidth="2"/>
      <circle cx="32" cy="32" r="12" fill="#b5ad9f"/>
      <circle cx="32" cy="32" r="4" fill="#d5cfc6"/>
      <circle cx="32" cy="32" r="28" fill="none" stroke="#b5ad9f" strokeWidth="0.5" opacity="0.5"/>
      <circle cx="32" cy="32" r="22" fill="none" stroke="#b5ad9f" strokeWidth="0.5" opacity="0.3"/>
    </svg>
  );
}

function DiscoDiamante({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="30" fill="#4666a6" stroke="#374f82" strokeWidth="2"/>
      <circle cx="32" cy="32" r="12" fill="#374f82"/>
      <circle cx="32" cy="32" r="4" fill="#4666a6"/>
      <circle cx="32" cy="32" r="28" fill="none" stroke="#374f82" strokeWidth="0.5" opacity="0.5"/>
      <circle cx="32" cy="32" r="22" fill="none" stroke="#374f82" strokeWidth="0.5" opacity="0.3"/>
      <path d="M32 8 L38 20 L32 16 L26 20 Z" fill="#8ba3d0" opacity="0.6"/>
    </svg>
  );
}

const levels = [
  { Icon: DiscoOro, label: "Oro", req: "100K+", color: "#f2b33d" },
  { Icon: DiscoPlatino, label: "Platino", req: "500K+", color: "#d5cfc6" },
  { Icon: DiscoDiamante, label: "Diamante", req: "1M+", color: "#4666a6" },
];

export default function AwardsPreview() {
  const t = useTranslations("awardsPreview");
  const locale = useLocale();

  return (
    <section className="bg-[#f2b33d] relative overflow-hidden">
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
        aria-hidden
      >
        <span
          className="font-display font-black text-[20vw] leading-none text-outline"
          style={{ WebkitTextStroke: "1px rgba(33,34,38,0.07)", color: "transparent" }}
        >
          AWARDS
        </span>
      </div>

      <div className="relative z-10 max-w-screen-xl mx-auto px-6 lg:px-10 py-20 lg:py-24">
        {/* Title visible above cards */}
        <div className="mb-12">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#212226]/50 mb-4">
            — {t("subtitle")}
          </p>
          <h2 className="font-display font-black text-[#212226] text-4xl lg:text-5xl xl:text-6xl leading-none">
            {t("title")}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left — description + CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
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

          {/* Right — cards */}
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {levels.map((l, i) => (
                <motion.div
                  key={l.label}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-[#e0a02c] p-5 text-center"
                >
                  <div className="flex justify-center mb-3">
                    <l.Icon className="w-12 h-12" />
                  </div>
                  <div className="font-display font-black text-[#212226] text-base leading-none">{l.label}</div>
                  <div className="text-[10px] text-[#212226]/50 mt-1 uppercase tracking-wider">{l.req} streams</div>
                </motion.div>
              ))}
            </div>

            {/* Propya panel — fucsia */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <a
                href="https://www.propyawards.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-[#fe3fb6] hover:bg-[#e535a0] p-7 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-display font-black text-white text-2xl mb-1">
                      {t("propya")}
                    </div>
                    <div className="text-[10px] text-white/60 uppercase tracking-wider">
                      Premios de la industria fonográfica PY
                    </div>
                  </div>
                  <svg className="w-10 h-10 text-white/80 group-hover:text-white transition-colors" viewBox="0 0 64 64" fill="none">
                    <path d="M32 6L38 22H50L40 32L44 48L32 38L20 48L24 32L14 22H26Z" fill="currentColor"/>
                    <path d="M32 52V56M24 54L22 58M40 54L42 58" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
              </a>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
