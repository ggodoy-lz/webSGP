"use client";

import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { colorCategoria, formatearFecha, type NewsArticle } from "@/lib/news-data";

/**
 * Carrusel de noticias del home. Recibe las notas ya filtradas desde el Server
 * Component para que muestre exactamente lo que SGP publicó en el panel.
 */
export default function NewsPreview({ articles }: { articles: NewsArticle[] }) {
  const t = useTranslations("newsPreview");
  const locale = useLocale();

  // Sin notas publicadas la sección quedaría como un carrusel vacío.
  if (articles.length === 0) return null;

  return (
    <section className="bg-[#f2e2c4] py-20 lg:py-28">
      <div className="max-w-screen-xl mx-auto px-6 lg:px-10">
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

        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
          {articles.map((article, i) => (
            <motion.article
              key={article.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="min-w-[280px] sm:min-w-[360px] lg:min-w-[420px] snap-start"
            >
              <Link
                href={`/${locale}/noticias/${article.slug}`}
                className="group relative block min-h-[360px] p-7 overflow-hidden bg-[#212226] text-white"
              >
                <div
                  className="absolute inset-0 opacity-85 transition-opacity group-hover:opacity-100"
                  style={{ background: `linear-gradient(135deg, ${colorCategoria(article.category)}, #212226 78%)` }}
                />
                <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full border border-white/20" />
                <div className="relative z-10 flex min-h-[306px] flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-4 mb-8">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/75">
                        {article.category}
                      </span>
                      <span className="text-[10px] text-white/45">{formatearFecha(article.fecha, locale)}</span>
                    </div>
                    <h3 className="font-display font-black text-3xl leading-tight mb-4">
                      {locale === "es" ? article.titleEs : article.titleEn}
                    </h3>
                    {(locale === "es" ? article.excerptEs : article.excerptEn) && (
                      <p className="text-sm text-white/70 leading-relaxed">
                        {locale === "es" ? article.excerptEs : article.excerptEn}
                      </p>
                    )}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white group-hover:text-[#f2b33d] transition-colors">
                    {t("readMore")} →
                  </span>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
