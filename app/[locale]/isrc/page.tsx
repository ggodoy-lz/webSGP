import { getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import ISRCForm from "@/components/ui/ISRCForm";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("isrc");
  return { title: t("hero.title"), description: t("hero.subtitle") };
}

const benefits = ["identificacion","regalias","proteccion","streaming"] as const;
const colors = ["#f0552f","#4666a6","#f2b33d","#f0552f"];

export default function ISRCPage() {
  const t = useTranslations("isrc");

  return (
    <>
      <PageHero title={t("hero.title")} subtitle={t("hero.subtitle")} variant="blue" tag="ISRC" />

      <section className="bg-[#feffff] py-20 lg:py-24">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Info */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f0552f] mb-4">Identificación</p>
              <div className="w-10 h-[3px] bg-[#f0552f] mb-6" />
              <h2 className="font-display font-black text-[#212226] text-4xl mb-5">{t("whatIs.title")}</h2>
              <p className="text-[#212226]/60 leading-relaxed text-sm mb-10">{t("whatIs.description")}</p>

              <h3 className="font-display font-black text-[#212226] text-2xl mb-5">{t("whyNeed.title")}</h3>
              <div className="space-y-0 border-t border-[#212226]/10">
                {benefits.map((b, i) => (
                  <div key={b} className="flex items-center gap-4 py-4 border-b border-[#212226]/10">
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{backgroundColor:colors[i]}} />
                    <span className="text-sm text-[#212226]/65 leading-relaxed">{t(`whyNeed.items.${b}`)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Code + Form */}
            <div className="space-y-6">
              {/* ISRC visual code */}
              <div className="bg-[#212226] p-10">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-4">Formato del código ISRC</p>
                <p className="font-display font-black text-white text-4xl lg:text-5xl tracking-widest mb-8">
                  PY-SGP-26-00001
                </p>
                <div className="grid grid-cols-4 gap-4 border-t border-white/10 pt-6">
                  {[["PY","País"],["SGP","Registrante"],["26","Año"],["00001","Designación"]].map(([c,l]) => (
                    <div key={c}>
                      <div className="font-display font-black text-[#f0552f] text-sm mb-1">{c}</div>
                      <div className="text-[10px] text-white/30 uppercase tracking-wider">{l}</div>
                    </div>
                  ))}
                </div>
              </div>

              <ISRCForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
