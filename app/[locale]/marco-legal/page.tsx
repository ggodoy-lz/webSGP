import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import { APARTADOS_MARCO_LEGAL, DOCUMENTOS_MARCO_LEGAL } from "@/lib/legal/marco-legal";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("paginasLegales.marcoLegal");
  return { title: t("titulo"), description: t("subtitulo") };
}

/** Misma estructura que el Marco Legal del sitio actual: texto y documentos en PDF. */
export default async function MarcoLegalPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations("paginasLegales");

  return (
    <>
      <PageHero title={t("marcoLegal.titulo")} subtitle={t("marcoLegal.subtitulo")} variant="dark" tag="SGP" />

      <section className="bg-[#feffff] py-16 lg:py-20">
        <div className="max-w-3xl mx-auto px-6 lg:px-10">
          {locale === "en" && (
            <p className="text-sm text-[#212226]/70 bg-[#f2e2c4] border-l-4 border-[#f0552f] px-4 py-3 mb-10">
              {t("soloEspanol")}
            </p>
          )}

          <div lang="es">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f0552f] mb-4">Marco Jurídico</p>
            <div className="w-10 h-[3px] bg-[#f0552f] mb-10" />

            {APARTADOS_MARCO_LEGAL.map((apartado) => (
              <div key={apartado.titulo} className="mb-10">
                <h2 className="font-display font-black text-[#212226] text-xl lg:text-2xl mb-3">{apartado.titulo}</h2>
                <p className="text-[#212226]/70 leading-relaxed">{apartado.texto}</p>
              </div>
            ))}

            <h2 className="font-display font-black text-[#212226] text-xl lg:text-2xl mt-14 mb-4">
              {t("marcoLegal.documentos")}
            </h2>
            <ul className="border-t border-[#212226]/10">
              {DOCUMENTOS_MARCO_LEGAL.map((doc) => (
                <li key={doc.archivo}>
                  <a
                    href={`/docs/marco-legal/${doc.archivo}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between gap-4 py-4 border-b border-[#212226]/10 hover:pl-2 transition-all"
                  >
                    <span>
                      <span className="block font-bold text-[#212226] group-hover:text-[#f0552f] transition-colors">
                        {doc.nombre}
                      </span>
                      {doc.detalle && (
                        <span className="block text-xs text-[#212226]/45 mt-0.5">{doc.detalle}</span>
                      )}
                    </span>
                    {/* El peso importa: el Estatuto es un escaneo de más de 10 MB. */}
                    <span className="shrink-0 text-[10px] font-black uppercase tracking-wider text-[#212226]/40">
                      PDF · {doc.peso}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
