"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";

export default function Footer() {
  const t = useTranslations("footer");
  const locale = useLocale();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#212226] text-white">
      {/* Cream top strip */}
      <div className="h-2 bg-[#f2e2c4]" />

      <div className="max-w-screen-xl mx-auto px-6 lg:px-10 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Brand block */}
          <div className="lg:col-span-4">
            <Link href={`/${locale}`}>
              <span className="font-display block text-[5rem] font-black leading-none text-white hover:text-[#f0552f] transition-colors -ml-1 mb-2">
                SGP
              </span>
            </Link>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-white/30 mb-5">
              Sociedad de Gestión de<br />Productores Fonográficos del Paraguay
            </p>
            <p className="text-sm text-white/40 leading-relaxed max-w-xs">
              {t("description")}
            </p>
            {/* Social */}
            <div className="flex gap-4 mt-6">
              {[
                { href: "https://www.instagram.com/sgp.py", label: "IG" },
                { href: "https://www.facebook.com/share/1CVyzhvZ4H/", label: "FB" },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-black uppercase tracking-widest text-white/30 hover:text-[#f0552f] transition-colors border-b border-white/10 hover:border-[#f0552f] pb-0.5"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* Nav */}
          <div className="lg:col-span-4 lg:col-start-6 grid grid-cols-2 gap-8">
            <div>
              <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f0552f] mb-4">
                {t("links.title")}
              </h5>
              <ul className="space-y-2.5">
                {[
                  { label: t("links.licencias"), href: `/${locale}/licencias` },
                  { label: t("links.regalias"), href: `/${locale}/regalias` },
                  { label: t("links.isrc"), href: `/${locale}/isrc` },
                  { label: t("links.sobreNosotros"), href: `/${locale}/sobre-nosotros` },
                  { label: t("links.noticias"), href: `/${locale}/noticias` },
                  { label: t("links.contacto"), href: `/${locale}/contacto` },
                ].map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-sm text-white/40 hover:text-white transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f0552f] mb-4">
                {t("contact.title")}
              </h5>
              <ul className="space-y-2.5 text-sm text-white/40">
                <li><a href="mailto:info@sgp.com.py" className="hover:text-white transition-colors">{t("contact.email")}</a></li>
                <li><a href="tel:+595981968005" className="hover:text-white transition-colors">{t("contact.phone")}</a></li>
                <li>{t("contact.address")}</li>
              </ul>
              <div className="flex gap-2 mt-6">
                {["IFPI", "WIPO"].map((org) => (
                  <span key={org} className="text-[11px] font-black text-white/30 border border-white/10 px-2 py-1">
                    {org}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Newsletter / CTA */}
          <div className="lg:col-span-3 lg:col-start-10">
            <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f0552f] mb-4">
              {t("legal.title")}
            </h5>
            <ul className="space-y-2.5 mb-8">
              {[t("legal.marcoLegal"), t("legal.privacidad"), t("legal.terminos")].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-white/40 hover:text-white transition-colors">{item}</a>
                </li>
              ))}
            </ul>
            <a
              href={`/${locale}/contacto`}
              className="inline-block text-xs font-black uppercase tracking-widest bg-[#f0552f] hover:bg-[#d1401e] text-white px-5 py-3 transition-colors"
            >
              {t("cta") || "Contacto"}
            </a>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/20">{t("copy", { year })}</p>
          <div className="flex gap-3 items-center">
            <div className="w-2 h-2 rounded-full bg-[#f0552f]" />
            <div className="w-2 h-2 rounded-full bg-[#4666a6]" />
            <div className="w-2 h-2 rounded-full bg-[#f2b33d]" />
          </div>
        </div>
      </div>
    </footer>
  );
}
