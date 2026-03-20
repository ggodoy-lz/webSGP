"use client";

import { useRef } from "react";
import { motion, useAnimationFrame, useMotionValue } from "framer-motion";
import { useTranslations } from "next-intl";

const partners = [
  "IFPI", "WIPO", "Universal Music Group", "Sony Music Entertainment",
  "Warner Music Group", "Spotify", "Apple Music", "YouTube Music",
  "Amazon Music", "Deezer", "TIDAL",
];

const wrap = (min: number, max: number, v: number) => {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
};

function Marquee({ speed = 50 }: { speed?: number }) {
  const x = useMotionValue(0);
  const ITEM_W = 220;
  const TOTAL = ITEM_W * partners.length;

  useAnimationFrame((_, delta) => {
    const next = wrap(-TOTAL, 0, x.get() - (delta / 1000) * speed);
    x.set(next);
  });

  return (
    <div className="overflow-hidden border-t border-b border-[#212226]/10">
      <motion.div className="flex py-5" style={{ x }}>
        {[...partners, ...partners].map((name, i) => (
          <div
            key={i}
            className="flex-shrink-0 flex items-center justify-center border-r border-[#212226]/10"
            style={{ width: ITEM_W }}
          >
            <span className="font-display font-black text-sm uppercase tracking-widest text-[#212226]/30 hover:text-[#212226] transition-colors cursor-default px-4 text-center">
              {name}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export default function Partners() {
  const t = useTranslations("partners");

  return (
    <section className="bg-[#f2e2c4] py-16">
      <div className="max-w-screen-xl mx-auto px-6 lg:px-10 mb-10">
        <div className="flex items-center gap-5">
          <h2 className="font-display font-black text-3xl text-[#212226] shrink-0">
            {t("title")}
          </h2>
          <div className="flex-1 h-px bg-[#212226]/12" />
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#212226]/40 text-right max-w-[120px] shrink-0">
            {t("subtitle")}
          </p>
        </div>
      </div>
      <Marquee />
    </section>
  );
}
