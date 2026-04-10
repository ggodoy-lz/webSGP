"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

const topArtists = [
  { pos: 1, name: "El Culto Casero", streams: "2.5M", color: "#f0552f" },
  { pos: 2, name: "Beto Ayala", streams: "1.8M", color: "#4666a6" },
  { pos: 3, name: "Mara Flores", streams: "1.2M", color: "#f2b33d" },
  { pos: 4, name: "Grupo Cañaveral", streams: "980K", color: "#f0552f" },
  { pos: 5, name: "Pedro Giménez", streams: "750K", color: "#4666a6" },
];

export default function RankingSGP() {
  const t = useTranslations("rankingSGP");

  return (
    <section className="bg-[#f0552f] py-20 lg:py-24 relative overflow-hidden">
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        aria-hidden
      >
        <span
          className="font-display font-black text-[20vw] leading-none"
          style={{ WebkitTextStroke: "1px rgba(255,255,255,0.08)", color: "transparent" }}
        >
          TOP
        </span>
      </div>

      <div className="relative z-10 max-w-screen-xl mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          {/* Left */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-4">
              — {t("tag")}
            </p>
            <div className="w-10 h-[3px] bg-white mb-6" />
            <h2 className="font-display font-black text-white text-4xl lg:text-5xl leading-none mb-6">
              {t("title")}
            </h2>
            <p className="text-white/70 text-sm leading-relaxed mb-8 max-w-md">
              {t("description")}
            </p>
            <a
              href="https://www.sgp.com.py/top"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 bg-[#212226] hover:bg-white hover:text-[#212226] text-white text-xs font-black uppercase tracking-widest px-7 py-4 transition-colors"
            >
              {t("cta")}
              <ArrowTopRightOnSquareIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </motion.div>

          {/* Right — top 5 list */}
          <div>
            {topArtists.map((artist, i) => (
              <motion.div
                key={artist.pos}
                initial={{ opacity: 0, x: 10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center gap-5 py-5 border-b border-white/15 group hover:pl-2 transition-all"
              >
                <span className="font-display font-black text-white/20 text-3xl w-10 shrink-0">
                  {String(artist.pos).padStart(2, "0")}
                </span>
                <div className="w-1 h-8 shrink-0" style={{ backgroundColor: artist.color }} />
                <div className="flex-1">
                  <div className="font-display font-black text-white text-xl group-hover:text-[#212226] transition-colors">
                    {artist.name}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display font-black text-white/80 text-lg">{artist.streams}</div>
                  <div className="text-[10px] text-white/40 uppercase tracking-wider">streams</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
