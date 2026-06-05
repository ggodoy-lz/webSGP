"use client";

import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";

export default function AwardsPreview() {
  const t = useTranslations("awardsPreview");
  const locale = useLocale();

  const panels = [
    {
      title: t("propya"),
      label: "Premios",
      body: "Los premios de la industria fonografica paraguaya.",
      href: "https://www.propyawards.com",
      external: true,
      bg: "#fe3fb6",
      accent: "#ffffff",
    },
    {
      title: t("streaming"),
      label: "Galardones SGP",
      body: "Reconocimientos por hitos de reproduccion y alcance de fonogramas.",
      href: `/${locale}/galardones`,
      external: false,
      bg: "#4666a6",
      accent: "#f2b33d",
    },
  ];

  return (
    <section className="bg-[#212226] py-20 lg:py-24">
      <div className="max-w-screen-xl mx-auto px-6 lg:px-10">
        <div className="mb-12">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f2b33d] mb-4">
            {t("subtitle")}
          </p>
          <h2 className="font-display font-black text-white text-4xl lg:text-6xl leading-none">
            {t("title")}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {panels.map((panel, i) => {
            const content = (
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group relative min-h-[360px] overflow-hidden p-8 lg:p-10"
                style={{ backgroundColor: panel.bg }}
              >
                <div className="absolute -right-12 -bottom-12 h-48 w-48 rounded-full border border-white/20" />
                <div className="relative z-10 flex min-h-[280px] flex-col justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/65 mb-6">
                      {panel.label}
                    </p>
                    <h3 className="font-display font-black text-white text-4xl lg:text-5xl leading-none mb-5">
                      {panel.title}
                    </h3>
                    <p className="text-sm text-white/70 leading-relaxed max-w-sm">
                      {panel.body}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-3 text-xs font-black uppercase tracking-widest text-white">
                    {t("cta")}
                    <span
                      className="h-px w-8 transition-all group-hover:w-12"
                      style={{ backgroundColor: panel.accent }}
                    />
                  </span>
                </div>
              </motion.div>
            );

            return panel.external ? (
              <a key={panel.title} href={panel.href} target="_blank" rel="noopener noreferrer">
                {content}
              </a>
            ) : (
              <Link key={panel.title} href={panel.href}>
                {content}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
