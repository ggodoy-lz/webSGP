"use client";

import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";

const mockNews = [
  {
    id: 1,
    category: "Streaming",
    titleEs: "SGP distribuye récord histórico de regalías en el primer trimestre 2026",
    titleEn: "SGP distributes historic record royalties in Q1 2026",
    excerptEs: "La entidad reportó el mayor volumen de distribución en su historia, impulsado por el crecimiento en plataformas digitales.",
    excerptEn: "The entity reported the highest distribution volume in its history, driven by growth on digital platforms.",
    date: "12 Mar 2026",
    slug: "sgp-record-regalias-2026",
    color: "#f0552f",
  },
  {
    id: 2,
    category: "SGP",
    titleEs: "Paraguay celebra los primeros Propya Awards de la industria fonográfica",
    titleEn: "Paraguay celebrates the first Propya Awards of the phonographic industry",
    date: "5 Feb 2026",
    slug: "primera-edicion-propya-awards",
    color: "#4666a6",
  },
  {
    id: 3,
    category: "Legal",
    titleEs: "Nuevas tarifas de licencias para plataformas digitales entran en vigencia",
    titleEn: "New licence rates for digital platforms come into effect",
    date: "20 Ene 2026",
    slug: "nuevas-tarifas-plataformas-digitales",
    color: "#f2b33d",
  },
  {
    id: 4,
    category: "Industria",
    titleEs: "IFPI reporta crecimiento del 10% en ingresos de música grabada globalmente",
    titleEn: "IFPI reports 10% growth in recorded music revenue globally",
    date: "8 Ene 2026",
    slug: "ifpi-informe-anual-2025",
    color: "#f0552f",
  },
];

export default function NewsPreview() {
  const t = useTranslations("newsPreview");
  const locale = useLocale();

  return (
    <section className="bg-[#f2e2c4] py-20 lg:py-28">
      <div className="max-w-screen-xl mx-auto px-6 lg:px-10">

        {/* Section header — newspaper masthead style */}
        <div className="border-t-4 border-[#212226] pt-4 mb-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <h2 className="font-display font-black text-[#212226] text-5xl lg:text-6xl leading-none">
              {t("title")}
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#212226]/40">
                {t("subtitle")}
              </span>
              <Link
                href={`/${locale}/noticias`}
                className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f0552f] hover:underline"
              >
                {t("cta")} →
              </Link>
            </div>
          </div>
        </div>

        {/* Newspaper grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-0 lg:divide-x lg:divide-[#212226]/10">

          {/* Lead story */}
          <motion.article
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="lg:col-span-6 lg:pr-10"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: mockNews[0].color }} />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#212226]/50">
                {mockNews[0].category}
              </span>
              <span className="text-[10px] text-[#212226]/30">{mockNews[0].date}</span>
            </div>
            <Link href={`/${locale}/noticias/${mockNews[0].slug}`} className="group block">
              <h3
                className="font-display font-black text-[#212226] text-3xl lg:text-4xl leading-tight mb-4 group-hover:text-[#f0552f] transition-colors"
              >
                {locale === "es" ? mockNews[0].titleEs : mockNews[0].titleEn}
              </h3>
              <p className="text-sm text-[#212226]/60 leading-relaxed mb-5">
                {locale === "es" ? mockNews[0].excerptEs : mockNews[0].excerptEn}
              </p>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#f0552f]">
                {t("readMore")} →
              </span>
            </Link>
          </motion.article>

          {/* Side stories */}
          <div className="lg:col-span-6 lg:pl-10 flex flex-col divide-y divide-[#212226]/10">
            {mockNews.slice(1).map((article, i) => (
              <motion.article
                key={article.id}
                initial={{ opacity: 0, x: 10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="py-6 first:pt-0 last:pb-0"
              >
                <div className="flex items-start gap-4">
                  {/* Color bar */}
                  <div className="w-0.5 h-full self-stretch" style={{ backgroundColor: article.color }} />
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#212226]/40">
                        {article.category}
                      </span>
                      <span className="text-[10px] text-[#212226]/30">{article.date}</span>
                    </div>
                    <Link href={`/${locale}/noticias/${article.slug}`} className="group block">
                      <h3 className="font-display font-black text-[#212226] text-xl leading-tight group-hover:text-[#f0552f] transition-colors mb-1">
                        {locale === "es" ? article.titleEs : article.titleEn}
                      </h3>
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#212226]/30 group-hover:text-[#f0552f] transition-colors">
                        {t("readMore")} →
                      </span>
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
