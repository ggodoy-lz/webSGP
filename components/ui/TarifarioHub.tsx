"use client";

import { useTranslations } from "next-intl";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRightIcon,
  ArrowLeftIcon,
  RadioIcon,
  BuildingStorefrontIcon,
  GlobeAltIcon,
  TicketIcon,
} from "@heroicons/react/24/outline";
import TarifarioCalculator from "@/components/ui/TarifarioCalculator";
import RadiodifusionCalculator from "@/components/ui/RadiodifusionCalculator";
import InternetCalculator from "@/components/ui/InternetCalculator";
import EventosCalculator from "@/components/ui/EventosCalculator";
import type { CotizacionUSD } from "@/lib/bcp-cotizacion";

type Licencia = "radiodifusion" | "locales" | "internet" | "eventos";

const LICENCIAS: {
  id: Licencia;
  icon: React.ElementType;
  disponible: boolean;
}[] = [
  { id: "radiodifusion", icon: RadioIcon, disponible: true },
  { id: "locales", icon: BuildingStorefrontIcon, disponible: true },
  { id: "internet", icon: GlobeAltIcon, disponible: true },
  { id: "eventos", icon: TicketIcon, disponible: true },
];

export default function TarifarioHub({
  cotizacion,
}: {
  cotizacion: CotizacionUSD;
}) {
  const t = useTranslations("tarifarioHub");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const param = searchParams.get("licencia");
  const licencia: Licencia | null =
    param === "radiodifusion" ||
    param === "locales" ||
    param === "internet" ||
    param === "eventos"
      ? param
      : null;

  const seleccionar = (id: Licencia) => {
    router.replace(`${pathname}?licencia=${id}`, { scroll: false });
  };

  const volver = () => {
    router.replace(pathname, { scroll: false });
  };

  return (
    <AnimatePresence mode="wait">
      {licencia === null ? (
        /* ── Pantalla de inicio: elegir tipo de licencia ── */
        <motion.div
          key="hub"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.22 }}
          className="overflow-hidden border border-[#212226]/10 bg-[#feffff] shadow-[0_28px_90px_rgba(33,34,38,0.12)]"
        >
          <div className="border-b border-[#212226]/10 px-6 py-5 lg:px-10">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f0552f] mb-2">
              {t("tag")}
            </p>
            <h3 className="font-display font-black text-[#212226] text-3xl lg:text-4xl leading-none">
              {t("title")}
            </h3>
            <p className="text-sm text-[#212226]/50 mt-2 leading-relaxed">
              {t("subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
            {LICENCIAS.map((lic, i) => {
              const Icon = lic.icon;
              return (
                <button
                  key={lic.id}
                  type="button"
                  disabled={!lic.disponible}
                  onClick={() =>
                    lic.disponible && seleccionar(lic.id as Licencia)
                  }
                  className={`group relative flex flex-col items-start gap-4 rounded-2xl border p-6 lg:p-7 text-left transition-all ${
                    lic.disponible
                      ? "border-[#212226]/8 bg-[#faf9f7] hover:border-[#f0552f]/45 hover:bg-white hover:shadow-[0_12px_40px_rgba(33,34,38,0.08)] cursor-pointer"
                      : "border-[#212226]/6 bg-[#faf9f7]/60 cursor-not-allowed"
                  }`}
                >
                  {!lic.disponible && (
                    <span className="absolute right-5 top-5 rounded-full bg-[#212226]/8 px-3 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-[#212226]/40">
                      {t("proximamente")}
                    </span>
                  )}
                  <div className="flex items-center gap-4">
                    <span
                      className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${
                        lic.disponible
                          ? "bg-[#212226]/8 text-[#212226]/45 group-hover:bg-[#f0552f] group-hover:text-white"
                          : "bg-[#212226]/6 text-[#212226]/25"
                      }`}
                    >
                      <Icon className="h-6 w-6" />
                    </span>
                    <span
                      className={`font-display font-black text-sm ${lic.disponible ? "text-[#f0552f]" : "text-[#212226]/25"}`}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4
                      className={`font-display font-black text-xl mb-2 ${
                        lic.disponible ? "text-[#212226]" : "text-[#212226]/35"
                      }`}
                    >
                      {t(`tipos.${lic.id}.title`)}
                    </h4>
                    <p
                      className={`text-xs leading-relaxed ${
                        lic.disponible ? "text-[#212226]/50" : "text-[#212226]/28"
                      }`}
                    >
                      {t(`tipos.${lic.id}.desc`)}
                    </p>
                  </div>
                  {lic.disponible && (
                    <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#212226]/35 group-hover:text-[#f0552f] transition-colors">
                      {t("calcular")}
                      <ArrowRightIcon className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>
      ) : (
        /* ── Calculadora seleccionada ── */
        <motion.div
          key={licencia}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.22 }}
        >
          <button
            type="button"
            onClick={volver}
            className="mb-4 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-[#212226]/50 hover:text-[#f0552f] transition-colors"
          >
            <ArrowLeftIcon className="h-3.5 w-3.5" />
            {t("cambiar")}
          </button>

          {licencia === "locales" && <TarifarioCalculator />}
          {licencia === "radiodifusion" && <RadiodifusionCalculator />}
          {licencia === "internet" && (
            <InternetCalculator cotizacion={cotizacion} />
          )}
          {licencia === "eventos" && <EventosCalculator />}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
