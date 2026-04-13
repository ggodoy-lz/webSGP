"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";

export default function Footer() {
  const t = useTranslations("footer");
  const locale = useLocale();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#212226] text-white">
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
                { href: "https://www.instagram.com/sgp.py", label: "Instagram", icon: (
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                )},
                { href: "https://www.facebook.com/share/1CVyzhvZ4H/", label: "Facebook", icon: (
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                )},
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/30 hover:text-[#f0552f] transition-colors"
                  aria-label={s.label}
                >
                  {s.icon}
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
                  { label: t("links.tarifario"), href: `/${locale}/tarifario` },
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
                <li><a href="mailto:sgp@sgp.com.py" className="hover:text-white transition-colors">sgp@sgp.com.py</a></li>
                <li><a href="tel:+595982725536" className="hover:text-white transition-colors">+595 982 725 536</a></li>
                <li className="text-white/30 text-xs leading-relaxed">Edificio SkyPark, Torre 2, Piso 18, Juan XXIII 2581, Asunción</li>
              </ul>
              <div className="flex gap-2 mt-6">
                {[
                  { name: "IFPI", href: "https://www.ifpi.org/" },
                  { name: "WIPO", href: "https://www.wipo.int/portal/es/index.html" },
                ].map((org) => (
                  <a
                    key={org.name}
                    href={org.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-black text-white/30 border border-white/10 px-2 py-1 hover:text-[#f0552f] hover:border-[#f0552f] transition-colors"
                  >
                    {org.name}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Legal / CTA */}
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
            <Link
              href={`/${locale}/contacto`}
              className="inline-block text-xs font-black uppercase tracking-widest bg-[#f0552f] hover:bg-[#d1401e] text-white px-5 py-3 transition-colors"
            >
              {t("cta") || "Contacto"}
            </Link>
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
