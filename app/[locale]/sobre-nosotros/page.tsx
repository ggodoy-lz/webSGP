import { getTranslations } from "next-intl/server";
import { useTranslations, useLocale } from "next-intl";
import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import Button from "@/components/ui/Button";
import Portals from "@/components/sections/Portals";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("sobreNosotros");
  return { title: t("hero.title"), description: t("hero.subtitle") };
}

const depts = [
  { key: "repertorio", whatsapp: "595982725536" },
  { key: "comercial", whatsapp: "595981968005" },
  { key: "isrc", whatsapp: "595982725536" },
  { key: "admin", whatsapp: "595982725536" },
] as const;
const deptColors = ["#f0552f","#4666a6","#f2b33d","#f0552f"];

export default function SobreNosotrosPage() {
  const t = useTranslations("sobreNosotros");
  const locale = useLocale();

  return (
    <>
      <PageHero title={t("hero.title")} subtitle={t("hero.subtitle")} tag="SGP" variant="cream" />

      {/* Misión */}
      <section className="bg-[#feffff] py-20">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-7">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f0552f] mb-4">Misión</p>
              <div className="w-10 h-[3px] bg-[#f0552f] mb-6" />
              <h2 className="font-display font-black text-[#212226] text-3xl lg:text-4xl mb-6">{t("mision.title")}</h2>
              <p className="text-[#212226]/65 leading-relaxed">{t("mision.description")}</p>
            </div>
            <div className="lg:col-span-4 lg:col-start-9">
              <div className="bg-[#f2e2c4] p-8">
                <h3 className="font-display font-black text-[#212226] text-xl mb-3">{t("ifpiWipo.title")}</h3>
                <p className="text-sm text-[#212226]/60 leading-relaxed mb-6">{t("ifpiWipo.description")}</p>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { n: "IFPI", c: "#f0552f", href: "https://www.ifpi.org/" },
                  ].map(({ n, c, href }) => (
                    <a
                      key={n}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center py-5 hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: c }}
                    >
                      <span className="font-display font-black text-white text-2xl">{n}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Portals />

      {/* Marco Legal */}
      <section className="bg-[#212226] py-20">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f0552f] mb-4">Marco Legal</p>
              <div className="w-10 h-[3px] bg-[#f0552f] mb-6" />
              <h2 className="font-display font-black text-white text-3xl lg:text-4xl mb-4">{t("marcoLegal.title")}</h2>
              <p className="text-white/50 text-sm leading-relaxed">{t("marcoLegal.description")}</p>
            </div>
            <div className="border-t border-white/10">
              {(["ley","decreto","convenios"] as const).map((item,i) => (
                <div key={item} className="flex items-center gap-4 py-5 border-b border-white/10 group hover:pl-3 transition-all">
                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{backgroundColor:deptColors[i]}} />
                  <span className="text-white/60 group-hover:text-white transition-colors text-sm">{t(`marcoLegal.${item}`)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Equipo */}
      <section className="bg-[#f2e2c4] py-20">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {depts.map((dept, i) => (
              <a
                key={dept.key}
                href={`https://wa.me/${dept.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#feffff] p-8 border-l-4 hover:-translate-y-1 transition-transform group"
                style={{borderColor:deptColors[i]}}
              >
                <span className="font-display font-black text-[#212226] text-lg leading-tight group-hover:text-[#f0552f] transition-colors">
                  {t(`equipo.departamentos.${dept.key}`)}
                </span>
                <span className="block mt-4 text-[10px] font-black uppercase tracking-[0.18em] text-[#212226]/35 group-hover:text-[#4666a6]">
                  WhatsApp
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#feffff] py-12 border-t border-[#212226]/10">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="font-display font-black text-[#212226] text-2xl">¿Querés conocer más sobre SGP?</p>
          <Button href={`/${locale}/contacto`} variant="primary">Contactanos →</Button>
        </div>
      </section>
    </>
  );
}
