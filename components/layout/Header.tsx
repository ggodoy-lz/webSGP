"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { key: "licencias", href: "/licencias" },
  { key: "regalias", href: "/regalias" },
  { key: "isrc", href: "/isrc" },
  { key: "sobreNosotros", href: "/sobre-nosotros" },
  { key: "noticias", href: "/noticias" },
  { key: "galardones", href: "/galardones" },
  { key: "contacto", href: "/contacto" },
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
    ? "bg-[#f2e2c4]/95 backdrop-blur-sm shadow-[0_1px_0_0_rgba(33,34,38,0.12)]"
    : isHome
    ? "bg-transparent"
    : "bg-[#f2e2c4]";

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${bg}`}>
      <div className="max-w-screen-xl mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between h-16 lg:h-20">

          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-baseline gap-2 group">
            <span className="font-display text-[2.5rem] font-black leading-none text-[#212226] group-hover:text-[#f0552f] transition-colors tracking-tighter">
              SGP
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {navLinks.map(({ key, href: path }) => (
              <Link
                key={key}
                href={href(path)}
                className={`relative px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] transition-colors ${
                  isActive(path) ? "text-[#f0552f]" : "text-[#212226]/60 hover:text-[#212226]"
                }`}
              >
                {t(key)}
                {isActive(path) && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute bottom-0 left-3 right-3 h-[2px] bg-[#f0552f]"
                  />
                )}
              </Link>
            ))}
            <div className="w-px h-4 bg-[#212226]/20 mx-2" />
            <Link
              href={altPath}
              className="text-[11px] font-black uppercase tracking-[0.12em] text-[#212226]/40 hover:text-[#f0552f] transition-colors"
            >
              {t("language")}
            </Link>
          </nav>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden p-2 text-[#212226]"
            aria-label="Menú"
          >
            {open ? <XMarkIcon className="w-5 h-5" /> : <Bars3Icon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="lg:hidden bg-[#f2e2c4] border-t border-[#212226]/10"
          >
            <nav className="max-w-screen-xl mx-auto px-6 py-4 flex flex-col gap-1">
              {navLinks.map(({ key, href: path }) => (
                <Link
                  key={key}
                  href={href(path)}
                  onClick={() => setOpen(false)}
                  className={`py-2.5 text-sm font-bold uppercase tracking-wider border-b border-[#212226]/10 ${
                    isActive(path) ? "text-[#f0552f]" : "text-[#212226]/70"
                  }`}
                >
                  {t(key)}
                </Link>
              ))}
              <Link href={altPath} onClick={() => setOpen(false)} className="py-2.5 text-sm font-black text-[#f0552f] uppercase tracking-wider">
                {t("language")}
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
