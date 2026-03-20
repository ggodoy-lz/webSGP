import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { getArticleBySlug, articles } from "@/lib/news-data";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const a = getArticleBySlug(slug);
  if (!a) return {};
  return { title: locale === "es" ? a.titleEs : a.titleEn };
}

const catColors: Record<string, string> = { Streaming:"#4666a6", SGP:"#f0552f", Legal:"#f2b33d", Industria:"#f0552f" };

export default async function ArticlePage({ params }: Props) {
  const { locale, slug } = await params;
  const t = await getTranslations("noticias");
  const a = getArticleBySlug(slug);
  if (!a) notFound();

  const title = locale === "es" ? a.titleEs : a.titleEn;
  const content = locale === "es" ? a.contentEs : a.contentEn;
  const date = locale === "es" ? a.date : a.dateEn;
  const color = catColors[a.category] ?? "#f0552f";

  return (
    <div className="min-h-screen bg-[#feffff]">
      {/* Top accent */}
      <div className="h-1 fixed top-0 z-50 w-full" style={{backgroundColor: color}} />

      <div className="max-w-3xl mx-auto px-6 pt-28 pb-20">
        <Link
          href={`/${locale}/noticias`}
          className="group inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#212226]/40 hover:text-[#f0552f] transition-colors mb-12"
        >
          <ArrowLeftIcon className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
          {t("backToNews")}
        </Link>

        {/* Category + date */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 text-white" style={{backgroundColor:color}}>
            {a.category}
          </span>
          <span className="text-[10px] text-[#212226]/40">{date}</span>
        </div>

        {/* Title */}
        <h1 className="font-display font-black text-[#212226] leading-tight mb-8" style={{fontSize:"clamp(2.5rem,6vw,5rem)"}}>
          {title}
        </h1>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-10 h-[3px]" style={{backgroundColor:color}} />
          <div className="flex-1 h-px bg-[#212226]/10" />
        </div>

        {/* Content */}
        {content.split("\n\n").map((p, i) => (
          <p key={i} className="text-[#212226]/70 leading-relaxed mb-6 text-base">{p}</p>
        ))}

        <div className="border-t border-[#212226]/10 mt-12 pt-8">
          <Link
            href={`/${locale}/noticias`}
            className="group inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#212226]/40 hover:text-[#f0552f] transition-colors"
          >
            <ArrowLeftIcon className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
            {t("backToNews")}
          </Link>
        </div>
      </div>
    </div>
  );
}
