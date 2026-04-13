"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

export default function TarifarioPageLink() {
  const locale = useLocale();
  const t = useTranslations("licencias.tarifarioBanner");

  return (
    <Link
      href={`/${locale}/tarifario`}
      className="inline-flex items-center gap-3 bg-[#212226] hover:bg-[#f0552f] text-white text-xs font-black uppercase tracking-[0.15em] px-7 py-4 transition-colors duration-300"
    >
      {t("cta")}
      <ArrowRightIcon className="w-4 h-4" />
    </Link>
  );
}
