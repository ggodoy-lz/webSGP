import type { Metadata } from "next";
import { SITIO } from "@/lib/sitio";
import { Antonio, Montserrat } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import "../globals.css";

const antonio = Antonio({
  subsets: ["latin"],
  variable: "--font-antonio",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

const TITULO = "SGP — Sociedad de Gestión de Productores Fonográficos del Paraguay";
const DESCRIPCION =
  "SGP gestiona los derechos de los productores fonográficos del Paraguay. Licencias, regalías e ISRC.";

export const metadata: Metadata = {
  // Sin metadataBase, las URL de las imágenes para compartir quedan relativas
  // y las redes no las resuelven.
  metadataBase: new URL(SITIO),
  title: { default: TITULO, template: "%s | SGP Paraguay" },
  description: DESCRIPCION,
  openGraph: {
    type: "website",
    siteName: "SGP Paraguay",
    title: TITULO,
    description: DESCRIPCION,
    locale: "es_PY",
    alternateLocale: "en_US",
  },
  twitter: { card: "summary_large_image", title: TITULO, description: DESCRIPCION },
  alternates: {
    languages: { es: "/es", en: "/en" },
  },
};

type Props = { children: React.ReactNode; params: Promise<{ locale: string }> };

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as "es" | "en")) notFound();
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${antonio.variable} ${montserrat.variable}`}>
      <body className="min-h-screen flex flex-col antialiased">
        <NextIntlClientProvider messages={messages}>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <WhatsAppButton />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
