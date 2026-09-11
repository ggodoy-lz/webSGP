import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";

export default async function NoEncontrado() {
  const locale = await getLocale();
  const t = await getTranslations("noEncontrado");

  return (
    <div className="min-h-[60vh] bg-[#feffff] flex items-center">
      <div className="max-w-screen-xl mx-auto px-6 lg:px-10 py-20">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f0552f] mb-4">404</p>
        <div className="w-10 h-[3px] bg-[#f0552f] mb-6" />
        <h1 className="font-display font-black text-[#212226] text-4xl lg:text-5xl mb-4">
          {t("titulo")}
        </h1>
        <p className="text-sm text-[#212226]/55 leading-relaxed max-w-md mb-8">{t("texto")}</p>
        <Link
          href={`/${locale}`}
          className="inline-block bg-[#212226] hover:bg-[#f0552f] text-white text-xs font-black uppercase tracking-[0.2em] px-8 py-4 transition-colors duration-300"
        >
          {t("volver")}
        </Link>
      </div>
    </div>
  );
}
