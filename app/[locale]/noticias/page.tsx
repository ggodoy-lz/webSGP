import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/ui/PageHero";
import { colorCategoria, formatearFecha, soloPublicadas } from "@/lib/news-data";
import { leerNoticias } from "@/lib/news-store";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("noticias");
  return { title: t("hero.title") };
}

export default async function NoticiasPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations("noticias");
  const articles = soloPublicadas(await leerNoticias());

  const [destacada, ...resto] = articles;

  return (
    <>
      <PageHero title={t("hero.title")} subtitle={t("hero.subtitle")} tag="SGP" variant="dark" />

      <section className="bg-[#feffff] py-20">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-10">
          {!destacada && (
            <p className="text-sm text-[#212226]/50 py-16 text-center">{t("vacio")}</p>
          )}

          {/* Destacada */}
          {destacada && (() => {
            const a = destacada;
            const title = locale === "es" ? a.titleEs : a.titleEn;
            const excerpt = locale === "es" ? a.excerptEs : a.excerptEn;
            const color = colorCategoria(a.category);
            return (
              <Link href={`/${locale}/noticias/${a.slug}`} className="group block mb-12">
                <div className="bg-[#f2e2c4] p-10 lg:p-14 border-l-4 hover:border-l-8 transition-all duration-300" style={{borderColor:color}}>
                  <div className="flex items-center gap-2 mb-5">
                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 text-white" style={{backgroundColor:color}}>{a.category}</span>
                    <span className="text-[10px] text-[#212226]/40">{formatearFecha(a.fecha, locale)}</span>
                  </div>
                  <h2 className="font-display font-black text-[#212226] text-3xl lg:text-4xl leading-tight mb-4 group-hover:text-[#f0552f] transition-colors">
                    {title}
                  </h2>
                  {excerpt && <p className="text-sm text-[#212226]/55 leading-relaxed max-w-2xl mb-5">{excerpt}</p>}
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#f0552f]">
                    {t("readMore")} →
                  </span>
                </div>
              </Link>
            );
          })()}

          {/* Listado */}
          {resto.length > 0 && (
            <div className="border-t border-[#212226]/10">
              {resto.map((a) => {
                const title = locale === "es" ? a.titleEs : a.titleEn;
                const color = colorCategoria(a.category);
                return (
                  <Link key={a.id} href={`/${locale}/noticias/${a.slug}`} className="group flex flex-col md:flex-row md:items-start gap-4 py-7 border-b border-[#212226]/10 hover:pl-3 transition-all duration-200">
                    <div className="flex items-center gap-2 shrink-0 md:w-48">
                      <div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor:color}} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#212226]/40">{a.category}</span>
                      <span className="text-[10px] text-[#212226]/30">{formatearFecha(a.fecha, locale)}</span>
                    </div>
                    <div>
                      <h3 className="font-display font-black text-[#212226] text-xl leading-tight group-hover:text-[#f0552f] transition-colors">
                        {title}
                      </h3>
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#212226]/30 group-hover:text-[#f0552f] transition-colors mt-1 block">
                        {t("readMore")} →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
