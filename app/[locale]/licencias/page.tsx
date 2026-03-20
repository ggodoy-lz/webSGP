import { getTranslations } from "next-intl/server";
import { useTranslations, useLocale } from "next-intl";
import type { Metadata } from "next";
import { CheckIcon, ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import PageHero from "@/components/ui/PageHero";
import LicenseCalculator from "@/components/ui/LicenseCalculator";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("licencias");
  return { title: t("hero.title"), description: t("hero.subtitle") };
}

const licTypes = ["radio","comercio","digital","eventos"] as const;

export default function LicenciasPage() {
  const t = useTranslations("licencias");
  const locale = useLocale();

  return (
    <>
      <PageHero title={t("hero.title")} subtitle={t("hero.subtitle")} tag="SGP" variant="cream" />

      {/* License types — lista editorial */}
      <section className="bg-[#feffff] py-20 lg:py-24">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-10">
          <h2 className="font-display font-black text-[#212226] text-4xl lg:text-5xl mb-12">
            {t("types.title")}
          </h2>
          <div className="border-t border-[#212226]/10">
            {licTypes.map((key, i) => (
              <div key={key} className="group flex flex-col md:flex-row md:items-start gap-4 py-8 border-b border-[#212226]/10 hover:pl-3 transition-all duration-200">
                <span className="font-display font-black text-[#f0552f] text-sm w-8 shrink-0">
                  {String(i+1).padStart(2,"0")}
                </span>
                <div>
                  <h3 className="font-display font-black text-[#212226] text-2xl mb-2">
                    {t(`types.${key}.title`)}
                  </h3>
                  <p className="text-sm text-[#212226]/55 leading-relaxed max-w-xl">
                    {t(`types.${key}.description`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Calculator */}
      <section className="bg-[#f2e2c4] py-20">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-10">
          <div className="max-w-4xl">
            <LicenseCalculator />
          </div>
        </div>
      </section>

      {/* Pagopar */}
      <section className="bg-[#212226] py-20">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f0552f] mb-4">Pagos en línea</p>
              <div className="w-10 h-[3px] bg-[#f0552f] mb-6" />
              <h2 className="font-display font-black text-white text-4xl lg:text-5xl mb-5">
                {t("pagopar.title")}
              </h2>
              <p className="text-white/50 text-sm leading-relaxed mb-8">{t("pagopar.subtitle")}</p>
              <div className="space-y-3 mb-8">
                {[t("pagopar.descuento"), t("pagopar.recurrente")].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckIcon className="w-4 h-4 text-[#f0552f] shrink-0" />
                    <span className="text-sm text-white/60">{item}</span>
                  </div>
                ))}
              </div>
              <a href="https://www.pagopar.com" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-[#f2e2c4] hover:bg-[#f0552f] text-[#212226] hover:text-white font-black uppercase text-xs tracking-widest px-8 py-4 transition-colors">
                {t("pagopar.cta")} <ArrowTopRightOnSquareIcon className="w-4 h-4" />
              </a>
            </div>
            <div className="border border-white/10 p-12 text-center">
              <p className="font-display font-black text-[#f2e2c4] text-5xl mb-3">PAGOPAR</p>
              <p className="text-white/20 text-xs uppercase tracking-widest mb-6">Pagos seguros en Paraguay</p>
              <div className="flex flex-wrap justify-center gap-2">
                {["Visa","Mastercard","Tigo Money","Personal"].map(m => (
                  <span key={m} className="text-xs text-white/30 border border-white/10 px-3 py-1.5 hover:text-[#f2e2c4] hover:border-[#f2e2c4]/30 transition-all cursor-default">{m}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
