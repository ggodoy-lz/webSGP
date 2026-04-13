import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import TarifarioCalculator from "@/components/ui/TarifarioCalculator";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("tarifarioPage");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function TarifarioPage() {
  const t = await getTranslations("tarifarioPage");

  return (
    <>
      <PageHero
        title={t("hero.title")}
        subtitle={t("hero.subtitle")}
        tag="SGP"
        variant="orange"
      />

      <section className="bg-[#feffff] border-b border-[#212226]/10">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-10 py-10">
          <p className="text-sm text-[#212226]/60 leading-relaxed max-w-3xl">
            {t("intro")}
          </p>
        </div>
      </section>

      <section className="bg-[#f2e2c4] py-16 lg:py-20">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-10">
          <div className="max-w-5xl mx-auto">
            <div className="px-8 lg:px-12 pb-6">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f0552f] mb-1">
                Calculadora
              </p>
              <h2 className="font-display font-black text-[#212226] text-2xl lg:text-3xl">
                {t("calculatorHeading")}
              </h2>
            </div>
            <TarifarioCalculator showOuterHeader={false} />
          </div>
        </div>
      </section>
    </>
  );
}
