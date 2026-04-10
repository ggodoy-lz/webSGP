"use client";

import { motion, useAnimationFrame, useMotionValue } from "framer-motion";
import { useTranslations } from "next-intl";

const partners = [
  { name: "IFPI", color: "#f0552f" },
  { name: "WIPO", color: "#4666a6" },
  { name: "Universal Music Group", color: "#f2b33d" },
  { name: "Sony Music Entertainment", color: "#f0552f" },
  { name: "Warner Music Group", color: "#4666a6" },
  { name: "Spotify", color: "#f2b33d" },
  { name: "Apple Music", color: "#f0552f" },
  { name: "YouTube Music", color: "#4666a6" },
  { name: "Amazon Music", color: "#f2b33d" },
  { name: "Deezer", color: "#f0552f" },
  { name: "TIDAL", color: "#4666a6" },
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
        {[...partners, ...partners].map((p, i) => (
          <div
            key={i}
            className="flex-shrink-0 flex items-center justify-center border-r border-[#212226]/10 group/item"
            style={{ width: ITEM_W }}
          >
            <span
              className="font-display font-black text-sm uppercase tracking-widest text-[#212226]/30 transition-colors cursor-default px-4 text-center"
              style={{ ["--hover-color" as string]: p.color }}
              onMouseEnter={(e) => { (e.target as HTMLElement).style.color = p.color; }}
              onMouseLeave={(e) => { (e.target as HTMLElement).style.color = ""; }}
            >
              {p.name}
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
