"use client";

import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";

export default function TwoCards() {
  const t = useTranslations("twoCards");
  const locale = useLocale();

  return (
    <section className="grid grid-cols-1 md:grid-cols-2">
      {/* Panel 1 — Naranja sólido */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="group relative bg-[#f0552f] overflow-hidden"
      >
        <Link href={`/${locale}/regalias`} className="block p-10 lg:p-16 min-h-[480px] flex flex-col justify-between">
          {/* Ghost number */}
          <div className="text-outline text-[#feffff]/10 font-display font-black text-[12rem] leading-none select-none absolute -top-4 -right-4 pointer-events-none">
            01
          </div>

          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-8">01</p>
            <h2 className="font-display font-black text-white text-5xl lg:text-6xl xl:text-7xl leading-none mb-6">
              {t("pago.title")}
            </h2>
            <p className="text-sm text-white/70 leading-relaxed max-w-xs">
              {t("pago.description")}
            </p>
          </div>

          <div className="flex items-center gap-4 mt-10">
            <span className="text-xs font-black uppercase tracking-widest text-white border-b-2 border-white pb-0.5 group-hover:border-[#212226] group-hover:text-[#212226] transition-colors">
              {t("pago.cta")}
            </span>
            <motion.span
              className="text-white text-lg group-hover:translate-x-2 transition-transform inline-block"
            >
              →
            </motion.span>
          </div>
        </Link>
      </motion.div>

      {/* Panel 2 — Oscuro */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="group relative bg-[#212226] overflow-hidden"
      >
        <Link href={`/${locale}/licencias`} className="block p-10 lg:p-16 min-h-[480px] flex flex-col justify-between">
          {/* Ghost number */}
          <div className="text-outline text-white/5 font-display font-black text-[12rem] leading-none select-none absolute -top-4 -right-4 pointer-events-none">
            02
          </div>

          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-8">02</p>
            <h2 className="font-display font-black text-white text-5xl lg:text-6xl xl:text-7xl leading-none mb-6">
              {t("licencia.title")}
            </h2>
            <p className="text-sm text-white/50 leading-relaxed max-w-xs">
              {t("licencia.description")}
            </p>
          </div>

          <div className="flex items-center gap-4 mt-10">
            <span className="text-xs font-black uppercase tracking-widest text-white/70 border-b-2 border-white/30 pb-0.5 group-hover:text-[#f0552f] group-hover:border-[#f0552f] transition-colors">
              {t("licencia.cta")}
            </span>
            <span className="text-white/50 text-lg group-hover:translate-x-2 group-hover:text-[#f0552f] transition-all inline-block">
              →
            </span>
          </div>
        </Link>
      </motion.div>
    </section>
  );
}
