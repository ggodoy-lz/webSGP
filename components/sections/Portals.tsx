"use client";

import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";

const portals = [
  { key: "regalias" as const, href: "/regalias", color: "#f0552f", num: "01" },
  { key: "licencias" as const, href: "/licencias", color: "#4666a6", num: "02" },
  { key: "isrc" as const, href: "/isrc", color: "#f2b33d", num: "03" },
  { key: "repertorio" as const, href: "/contacto", color: "#f0552f", num: "04" },
];

export default function Portals() {
  const t = useTranslations("portals");
  const locale = useLocale();

  return (
    <section className="bg-[#feffff] py-20 lg:py-28">
      <div className="max-w-screen-xl mx-auto px-6 lg:px-10">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-4">
          <h2 className="font-display font-black text-[#212226] text-5xl lg:text-6xl xl:text-7xl leading-none">
            {t("title")}
          </h2>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#212226]/40 max-w-xs lg:text-right">
            {t("subtitle")}
          </p>
        </div>

        {/* List */}
        <div className="border-t border-[#212226]/10">
          {portals.map(({ key, href, color, num }, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Link
                href={`/${locale}${href}`}
                className="group flex items-center justify-between py-7 border-b border-[#212226]/10 hover:pl-3 transition-all duration-300"
              >
                <div className="flex items-center gap-6 lg:gap-10">
                  {/* Number */}
                  <span
                    className="font-display font-black text-sm w-8 shrink-0"
                    style={{ color }}
                  >
                    {num}
                  </span>

                  {/* Title */}
                  <h3 className="font-display font-black text-2xl lg:text-3xl text-[#212226] group-hover:text-[#f0552f] transition-colors">
                    {t(`items.${key}.title`)}
                  </h3>
                </div>

                <div className="flex items-center gap-6">
                  <p className="hidden md:block text-sm text-[#212226]/40 max-w-xs text-right">
                    {t(`items.${key}.description`)}
                  </p>
                  <span
                    className="font-black text-lg opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 transition-all"
                    style={{ color }}
                  >
                    →
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
