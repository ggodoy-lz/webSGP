import { getTranslations } from "next-intl/server";
import { useTranslations, useLocale } from "next-intl";
import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import Button from "@/components/ui/Button";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("regalias");
  return { title: t("hero.title"), description: t("hero.subtitle") };
}

const steps = ["registro","monitoreo","recaudacion","pago"] as const;
const colors = ["#f0552f","#4666a6","#f2b33d","#f0552f"];

export default function RegaliasPage() {
  const t = useTranslations("regalias");
  const locale = useLocale();

  return (
    <>
      <PageHero title={t("hero.title")} subtitle={t("hero.subtitle")} variant="orange" tag="Productores" />

      {/* Steps */}
      <section className="bg-[#feffff] py-20 lg:py-24">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-10">
          <h2 className="font-display font-black text-[#212226] text-3xl lg:text-4xl mb-12">
            {t("howItWorks.title")}
          </h2>
          <div className="border-t border-[#212226]/10">
            {steps.map((step, i) => (
              <div key={step} className="group flex flex-col md:flex-row md:items-start gap-6 py-10 border-b border-[#212226]/10 hover:pl-3 transition-all duration-200">
                <div className="w-10 h-10 flex items-center justify-center font-display font-black text-white text-sm shrink-0"
                  style={{ backgroundColor: colors[i] }}>
                  {String(i+1).padStart(2,"0")}
                </div>
                <div>
                  <h3 className="font-display font-black text-[#212226] text-xl mb-2">
                    {t(`howItWorks.steps.${step}.title`)}
                  </h3>
                  <p className="text-sm text-[#212226]/55 leading-relaxed max-w-xl">
                    {t(`howItWorks.steps.${step}.description`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Convenios — IFPI/WIPO clickeables */}
      <section className="bg-[#f2e2c4] py-20">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f0552f] mb-4">Acuerdos internacionales</p>
              <div className="w-10 h-[3px] bg-[#f0552f] mb-6" />
              <h2 className="font-display font-black text-[#212226] text-3xl lg:text-4xl mb-4">
                {t("convenios.title")}
              </h2>
              <p className="text-[#212226]/60 leading-relaxed text-sm">{t("convenios.subtitle")}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { n: "IFPI", c: "#f0552f", href: "https://www.ifpi.org/" },
                { n: "WIPO", c: "#4666a6", href: "https://www.wipo.int/portal/es/index.html" },
              ].map(({ n, c, href }) => (
                <a
                  key={n}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center py-16 hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: c }}
                >
                  <span className="font-display font-black text-white text-5xl">{n}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#212226] py-20">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div>
            <div className="w-8 h-[3px] bg-[#f0552f] mb-6" />
            <h2 className="font-display font-black text-white text-3xl lg:text-4xl">{t("cta.title")}</h2>
            <p className="text-white/40 mt-3 max-w-md text-sm">{t("cta.subtitle")}</p>
          </div>
          <Button href={`/${locale}/contacto`} variant="secondary" size="lg" className="shrink-0">{t("cta.button")}</Button>
        </div>
      </section>
    </>
  );
}
