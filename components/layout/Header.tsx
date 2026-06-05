"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  {
    key: "licencias",
    href: "/licencias",
    color: "#4666a6",
    children: [{ labelEs: "Tarifario", labelEn: "Rates", href: "/tarifario", external: false }],
  },
  {
    key: "regalias",
    href: "/regalias",
    color: "#f0552f",
    children: [{ labelEs: "Portal", labelEn: "Portal", href: "/regalias", external: false }],
  },
  {
    key: "isrc",
    href: "/isrc",
    color: "#f2b33d",
    children: [{ labelEs: "Portal", labelEn: "Portal", href: "/isrc", external: false }],
  },
  {
    key: "sobreNosotros",
    href: "/sobre-nosotros",
    color: "#f0552f",
    children: [
      { labelEs: "Nuestros Servicios", labelEn: "Our Services", href: "/sobre-nosotros#servicios", external: false },
      { labelEs: "Contacto", labelEn: "Contact", href: "/contacto", external: false },
    ],
  },
  {
    key: "galardones",
    href: "/galardones",
    color: "#f2b33d",
    children: [
      { labelEs: "Propya Awards", labelEn: "Propya Awards", href: "https://www.propyawards.com", external: true },
      { labelEs: "Galardones", labelEn: "Awards", href: "/galardones", external: false },
    ],
  },
  { key: "noticias", href: "/noticias", color: "#4666a6", children: [] },
] as const;

export default function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const href = (path: string) => `/${locale}${path}`;
  const altLocale = locale === "es" ? "en" : "es";
  const altPath = pathname.replace(`/${locale}`, `/${altLocale}`);
  const isActive = (path: string) => pathname.startsWith(`/${locale}${path}`);
  const isHome = pathname === `/${locale}` || pathname === `/${locale}/`;

  const bg = scrolled
    ? "bg-[#212226]/95 backdrop-blur-sm shadow-xl"
    : isHome
    ? "bg-[#212226]/90 backdrop-blur-sm"
    : "bg-[#212226]";

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${bg}`}>
      {/* Color service bar */}
      <div className="h-1 bg-[#f0552f]" />

      <div className="max-w-screen-xl mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-3 group">
            <span className="font-display text-4xl font-black leading-none text-white group-hover:text-[#f0552f] transition-colors tracking-tighter">
              SGP
            </span>
            <span className="hidden sm:block text-[10px] font-bold uppercase tracking-[0.15em] text-white/30 leading-tight max-w-[150px]">
              Productores<br />Fonográficos del Paraguay
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((item) => {
              const { key, href: path, color, children } = item;
              return (
              <div
                key={key}
                className="relative flex items-center group/link"
              >
                <Link
                  href={href(path)}
                  className={`relative block px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors duration-200 ${
                    key === "isrc" || key === "sobreNosotros" ? "whitespace-nowrap" : ""
                  }`}
                  style={{
                    color: isActive(path) ? color : undefined,
                  }}
                >
                  <span className={isActive(path) ? "" : "text-white/70 group-hover/link:text-white transition-colors"}>
                    {t(key)}
                  </span>
                  {isActive(path) && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 rounded"
                      style={{ backgroundColor: `${color}15` }}
                    />
                  )}
                  <motion.span
                    className="absolute bottom-0 left-3 right-3 h-[2px] origin-left scale-x-0 group-hover/link:scale-x-100 transition-transform duration-200"
                    style={{ backgroundColor: color }}
                  />
                </Link>
                {children.length > 0 && (
                  <div className="pointer-events-none invisible absolute left-0 top-full z-50 min-w-[190px] pt-2 opacity-0 transition-opacity duration-150 group-hover/link:pointer-events-auto group-hover/link:visible group-hover/link:opacity-100 group-focus-within/link:pointer-events-auto group-focus-within/link:visible group-focus-within/link:opacity-100">
                    <div className="rounded-sm border-t bg-[#212226] shadow-xl ring-1 ring-white/10" style={{ borderColor: color }}>
                      {children.map((child) => {
                        const label = locale === "es" ? child.labelEs : child.labelEn;
                        const className = "block whitespace-nowrap border-b border-white/10 px-4 py-3 text-[11px] font-black uppercase tracking-[0.12em] text-white/70 transition-colors last:border-b-0 hover:bg-white/5 hover:text-white";
                        return child.external ? (
                          <a key={child.href} href={child.href} target="_blank" rel="noopener noreferrer" className={className}>
                            {label}
                          </a>
                        ) : (
                          <Link key={child.href} href={href(child.href)} className={className}>
                            {label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              );
            })}
            <a
              href="https://www.ifpi.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 inline-flex h-8 items-center justify-center border border-white/15 px-3 opacity-60 transition-all hover:border-[#f2b33d] hover:opacity-100"
              aria-label="IFPI"
            >
              <img
                src="https://www.ifpi.org/wp-content/themes/ifpi/assets/img/logo.svg"
                alt="IFPI"
                className="h-4 w-auto brightness-0 invert"
              />
            </a>
            <Link
              href={altPath}
              className="ml-2 inline-flex h-8 items-center bg-[#f0552f] hover:bg-[#d1401e] text-white px-3 text-xs font-black uppercase tracking-wider transition-colors"
            >
              {t("language")}
            </Link>
          </nav>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden p-2 text-white"
            aria-label="MenÃº"
          >
            {open ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-[#212226] border-t border-white/10 overflow-hidden"
          >
            <nav className="max-w-screen-xl mx-auto px-6 py-4 flex flex-col gap-1">
              {navLinks.map(({ key, href: path, color, children }) => (
                <div key={key} className="border-b border-white/10 py-2">
                  <Link
                    href={href(path)}
                    onClick={() => setOpen(false)}
                    className="block py-2 text-sm font-bold uppercase tracking-wider transition-colors"
                    style={{ color: isActive(path) ? color : "rgba(255,255,255,0.8)" }}
                  >
                    {t(key)}
                  </Link>
                  {children.map((child) => {
                    const label = locale === "es" ? child.labelEs : child.labelEn;
                    const className = "flex items-center gap-2 py-1.5 pl-4 text-xs font-bold text-white/45 hover:text-white transition-colors";
                    const marker = <span className="h-1 w-1 rounded-full" style={{ backgroundColor: color }} />;
                    return child.external ? (
                      <a key={child.href} href={child.href} target="_blank" rel="noopener noreferrer" className={className}>
                        {marker}
                        <span>{label}</span>
                      </a>
                    ) : (
                      <Link key={child.href} href={href(child.href)} onClick={() => setOpen(false)} className={className}>
                        {marker}
                        <span>{label}</span>
                      </Link>
                    );
                  })}
                </div>
              ))}
              <a
                href="https://www.ifpi.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex py-3 opacity-70"
                aria-label="IFPI"
              >
                <img
                  src="https://www.ifpi.org/wp-content/themes/ifpi/assets/img/logo.svg"
                  alt="IFPI"
                  className="h-5 w-auto brightness-0 invert"
                />
              </a>
              <Link href={altPath} onClick={() => setOpen(false)} className="py-3 mt-2 text-sm font-black text-[#f0552f] uppercase tracking-wider">
                {t("language")}
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
