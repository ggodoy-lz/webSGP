import { getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import type { Metadata } from "next";
import { CheckIcon, ArrowTopRightOnSquareIcon, DocumentTextIcon, CalculatorIcon } from "@heroicons/react/24/outline";
import PageHero from "@/components/ui/PageHero";
import TarifarioPageLink from "@/components/ui/TarifarioPageLink";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("licencias");
  return { title: t("hero.title"), description: t("hero.subtitle") };
}

const licTypes = ["radio","comercio","digital","eventos"] as const;
const licColors = ["#f0552f","#4666a6","#f2b33d","#f0552f"];

export default function LicenciasPage() {
  const t = useTranslations("licencias");

  return (
    <>
      <PageHero title={t("hero.title")} subtitle={t("hero.subtitle")} tag="SGP" variant="blue" />

      {/* Service bar — inspired by v2 */}
      <div className="bg-[#212226]">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-10 flex flex-wrap gap-0 divide-x divide-white/10">
          {licTypes.map((key, i) => (
            <div key={key} className="flex-1 min-w-[140px] py-4 px-5 text-center border-b-2" style={{ borderColor: licColors[i] }}>
              <span className="text-xs font-black uppercase tracking-wider text-white/70">
                {t(`types.${key}.title`)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* License types */}
      <section className="bg-[#feffff] py-20 lg:py-24">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-10">
          <h2 className="font-display font-black text-[#212226] text-3xl lg:text-4xl mb-12">
            {t("types.title")}
          </h2>
          <div className="border-t border-[#212226]/10">
            {licTypes.map((key, i) => (
              <div key={key} className="group flex flex-col md:flex-row md:items-start gap-4 py-8 border-b border-[#212226]/10 hover:pl-3 transition-all duration-200">
                <span className="font-display font-black text-sm w-8 shrink-0" style={{ color: licColors[i] }}>
                  {String(i+1).padStart(2,"0")}
                </span>
                <div>
                  <h3 className="font-display font-black text-[#212226] text-xl mb-2">
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

      {/* Tarifario — enlace a página dedicada */}
      <section className="bg-[#f2e2c4] py-16 lg:py-20">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-10">
          <div className="max-w-4xl mx-auto bg-[#feffff] border-t-4 border-[#212226] shadow-sm">
            <div className="p-8 lg:p-10 flex flex-col md:flex-row md:items-center gap-8">
              <div className="shrink-0 w-16 h-16 rounded-full bg-[#f0552f]/10 flex items-center justify-center">
                <CalculatorIcon className="w-8 h-8 text-[#f0552f]" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f0552f] mb-2">
                  {t("tarifarioBanner.tag")}
                </p>
                <h2 className="font-display font-black text-[#212226] text-2xl lg:text-3xl mb-3">
                  {t("tarifarioBanner.title")}
                </h2>
                <p className="text-sm text-[#212226]/55 leading-relaxed mb-6">
                  {t("tarifarioBanner.description")}
                </p>
                <TarifarioPageLink />
              </div>
            </div>
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
              <h2 className="font-display font-black text-white text-3xl lg:text-4xl mb-5">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                <div className="border border-white/10 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35 mb-2">Licencia mensual</p>
                  <p className="font-display font-black text-[#f2e2c4] text-2xl">Gs. $$</p>
                </div>
                <div className="border border-[#f2b33d]/40 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#f2b33d] mb-2">Licencia anual</p>
                  <p className="font-display font-black text-[#f2e2c4] text-2xl">Gs. $$$</p>
                  <p className="text-xs text-white/45 mt-1">Incluye 2 meses gratis</p>
                </div>
              </div>
              <a href="https://www.pagopar.com" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-[#f2e2c4] hover:bg-[#f0552f] text-[#212226] hover:text-white font-black uppercase text-xs tracking-widest px-8 py-4 transition-colors">
                {t("pagopar.cta")} <ArrowTopRightOnSquareIcon className="w-4 h-4" />
              </a>
            </div>
            <div className="border border-white/10 p-12 text-center">
              <p className="font-display font-black text-[#f2e2c4] text-5xl mb-3">PAGOPAR</p>
              <p className="text-white/20 text-xs uppercase tracking-widest mb-6">Pagos seguros en Paraguay</p>
              <div className="mb-8 bg-white/5 p-5 text-left">
                <p className="font-display font-black text-white text-xl mb-3">Comprobante de licencia</p>
                <p className="text-sm text-white/50 leading-relaxed mb-4">
                  El comprobante descargable incluye los datos declarados del formulario, el plan seleccionado y los Terminos & Condiciones como declaracion jurada.
                </p>
                <a
                  href={"data:text/plain;charset=utf-8," + encodeURIComponent("Certificado de licencia SGP\n\nDatos del solicitante: completar desde el formulario de pago.\nPlan: mensual o anual.\n\nTerminos & Condiciones: el solicitante declara bajo fe de juramento que los datos ingresados son correctos y que utilizara la licencia conforme a las condiciones de SGP.")}
                  download="certificado-licencia-sgp.txt"
                  className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#f2b33d] hover:text-white transition-colors"
                >
                  Descargar modelo <DocumentTextIcon className="w-4 h-4" />
                </a>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {["Visa","Mastercard","Tigo Money","Personal"].map(m => (
                  <span key={m} className="text-xs text-white/30 border border-white/10 px-3 py-1.5 hover:text-[#f2e2c4] hover:border-[#f2e2c4]/30 transition-all cursor-default">{m}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reglamento de Tarifas Generales */}
      <section className="bg-[#f2e2c4] py-16">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-[#feffff] p-8 border-l-4 border-[#f0552f]">
            <div className="flex items-center gap-4">
              <DocumentTextIcon className="w-8 h-8 text-[#f0552f] shrink-0" />
              <div>
                <h3 className="font-display font-black text-[#212226] text-xl">Reglamento de Tarifas Generales</h3>
                <p className="text-sm text-[#212226]/50">Documento oficial actualizado — Julio 2023</p>
              </div>
            </div>
            <a
              href="https://www.sgp.com.py/uploads/files/docs/SGP-REGLAMENTO_DE_TARIFAS_GENERALES_Act_%204Julio2023.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#212226] hover:bg-[#f0552f] text-white text-xs font-black uppercase tracking-widest px-6 py-3 transition-colors shrink-0"
            >
              Descargar PDF <ArrowTopRightOnSquareIcon className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
