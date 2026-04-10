"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { key: "licencias", href: "/licencias", color: "#4666a6" },
  { key: "regalias", href: "/regalias", color: "#f0552f" },
  { key: "isrc", href: "/isrc", color: "#f2b33d" },
  { key: "sobreNosotros", href: "/sobre-nosotros", color: "#f0552f" },
  { key: "noticias", href: "/noticias", color: "#4666a6" },
  { key: "galardones", href: "/galardones", color: "#f2b33d" },
  { key: "contacto", href: "/contacto", color: "#f0552f" },
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
            <span className="hidden sm:block text-[10px] font-bold uppercase tracking-[0.15em] text-white/30 leading-tight max-w-[120px]">
              Productores<br />Fonográficos PY
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map(({ key, href: path, color }) => (
              <Link
                key={key}
                href={href(path)}
                className="relative px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors duration-200 group/link"
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
            ))}
            <Link
              href={altPath}
              className="ml-3 text-xs font-black bg-[#f0552f] hover:bg-[#d1401e] text-white px-3 py-1.5 transition-colors uppercase tracking-wider"
            >
              {t("language")}
            </Link>
          </nav>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden p-2 text-white"
            aria-label="Menú"
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
              {navLinks.map(({ key, href: path, color }) => (
                <Link
                  key={key}
                  href={href(path)}
                  onClick={() => setOpen(false)}
                  className="py-3 text-sm font-bold uppercase tracking-wider border-b border-white/10 transition-colors"
                  style={{ color: isActive(path) ? color : "rgba(255,255,255,0.8)" }}
                >
                  {t(key)}
                </Link>
              ))}
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
