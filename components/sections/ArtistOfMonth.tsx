"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

export default function ArtistOfMonth() {
  const t = useTranslations("artistOfMonth");

  return (
    <section className="bg-[#212226] py-20 lg:py-24 relative overflow-hidden">
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        aria-hidden
      >
        <span
          className="font-display font-black text-[18vw] leading-none"
          style={{ WebkitTextStroke: "1px rgba(255,255,255,0.03)", color: "transparent" }}
        >
          ARTISTA
        </span>
      </div>

      <div className="relative z-10 max-w-screen-xl mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f0552f] mb-4">
              — {t("tag")}
            </p>
            <div className="w-10 h-[3px] bg-[#f0552f] mb-6" />
            <h2 className="font-display font-black text-white text-4xl lg:text-5xl leading-none mb-6">
              {t("title")}
            </h2>
            <p className="text-white/50 text-sm leading-relaxed mb-8 max-w-md">
              {t("description")}
            </p>
            <a
              href="https://www.sgp.com.py/artista-del-mes/77/el-culto-casero-artista-del-mes"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 bg-[#f0552f] hover:bg-[#d1401e] text-white text-xs font-black uppercase tracking-widest px-7 py-4 transition-colors"
            >
              {t("cta")}
              <ArrowTopRightOnSquareIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </motion.div>

          {/* Right — featured artist card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="bg-white/5 border border-white/10 p-8 lg:p-10"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 rounded-full bg-[#f0552f] animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{t("current")}</span>
            </div>
            <div className="font-display font-black text-white text-3xl lg:text-4xl mb-3">
              El Culto Casero
            </div>
            <p className="text-white/40 text-sm mb-6">{t("featured")}</p>
            <div className="flex gap-4">
              {[
                { label: "Streams", value: "2.5M+" },
                { label: "Obras", value: "47" },
              ].map((stat) => (
                <div key={stat.label} className="bg-white/5 px-5 py-3">
                  <div className="font-display font-black text-[#f0552f] text-xl">{stat.value}</div>
                  <div className="text-[10px] text-white/30 uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
