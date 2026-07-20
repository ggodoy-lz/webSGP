"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRightIcon,
  ArrowLeftIcon,
  CheckIcon,
  SignalIcon,
  WifiIcon,
  GlobeAltIcon,
  BuildingStorefrontIcon,
} from "@heroicons/react/24/outline";
import {
  INTERNET_SERVICIOS,
  type InternetServicio,
} from "@/lib/internet-config";
import { calcularInternet, type InternetResult } from "@/lib/internet-engine";
import ResultadoTarifa from "@/components/ui/ResultadoTarifa";
import PanelResumen from "@/components/ui/PanelResumen";
import { useStepScroll } from "@/lib/use-step-scroll";
import type { CotizacionUSD } from "@/lib/bcp-cotizacion";

const fmt = (n: number) =>
  new Intl.NumberFormat("es-PY", {
    style: "currency",
    currency: "PYG",
    minimumFractionDigits: 0,
  }).format(n);

const fmtNum = (n: number) => new Intl.NumberFormat("es-PY").format(n);

// Cotización BCP exacta, con los decimales tal cual los publica el banco.
const fmtTC = (n: number) =>
  new Intl.NumberFormat("es-PY", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);

const SERVICIO_ICONS: Record<InternetServicio, React.ElementType> = {
  simulcasting: SignalIcon,
  webcasting: WifiIcon,
  ambientacion: GlobeAltIcon,
  musicalizacion: BuildingStorefrontIcon,
};

// Campos que usa cada servicio en el paso de datos.
const CAMPOS: Record<
  InternetServicio,
  ("visitas" | "ingresos" | "fonogramas" | "usuarios" | "bocas")[]
> = {
  simulcasting: ["visitas", "ingresos"],
  webcasting: ["visitas", "ingresos", "fonogramas", "usuarios"],
  ambientacion: ["visitas"],
  musicalizacion: ["ingresos", "bocas"],
};

type Paso = 1 | 2 | 3;

export default function InternetCalculator({
  cotizacion,
  showOuterHeader = true,
}: {
  cotizacion: CotizacionUSD;
  showOuterHeader?: boolean;
}) {
  const t = useTranslations("internetLic");

  const [paso, setPaso] = useState<Paso>(1);
  const [servicio, setServicio] = useState<InternetServicio | null>(null);
  const [visitas, setVisitas] = useState(0);
  const [ingresos, setIngresos] = useState(0);
  const [fonogramas, setFonogramas] = useState(0);
  const [usuarios, setUsuarios] = useState(0);
  const [bocas, setBocas] = useState(0);
  const [resultado, setResultado] = useState<InternetResult | null>(null);

  const campos = servicio ? CAMPOS[servicio] : [];

  const stepLabels = [t("steps.servicio"), t("steps.datos")];

  const contenedorRef = useStepScroll(paso);

  // Todos los campos del paso 2 aceptan 0 (aplican los mínimos), así que lo
  // único que puede faltar es elegir el servicio.
  const faltantes: string[] =
    paso === 1 && !servicio ? [t("steps.servicio")] : [];
  const canNext = paso < 3 && faltantes.length === 0;

  const handleNext = () => {
    if (paso === 2 && servicio) {
      setResultado(
        calcularInternet({
          servicio,
          tipoCambio: cotizacion.usd,
          visitas,
          ingresos,
          fonogramas,
          usuarios,
          bocas,
        }),
      );
    }
    setPaso((p) => Math.min(p + 1, 3) as Paso);
  };

  const handleBack = () => setPaso((p) => Math.max(p - 1, 1) as Paso);

  const handleReset = () => {
    setServicio(null);
    setVisitas(0);
    setIngresos(0);
    setFonogramas(0);
    setUsuarios(0);
    setBocas(0);
    setResultado(null);
    setPaso(1);
  };

  const motionProps = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -12 },
    transition: { duration: 0.22 },
  };

  const ingresosLabel =
    servicio === "simulcasting"
      ? t("fields.ingresosSimulcasting")
      : t("fields.ingresos");

  const summaryRows = [
    {
      label: t("summary.servicio"),
      value: servicio ? t(`servicios.${servicio}`) : t("summary.pending"),
    },
    ...(campos.includes("visitas")
      ? [
          {
            label: t("summary.visitas"),
            value: paso >= 2 && visitas > 0 ? fmtNum(visitas) : t("summary.pending"),
          },
        ]
      : []),
    ...(campos.includes("ingresos")
      ? [
          {
            label: t("summary.ingresos"),
            value:
              paso >= 2
                ? ingresos > 0
                  ? fmt(ingresos)
                  : t("summary.sinIngresos")
                : t("summary.pending"),
          },
        ]
      : []),
    ...(campos.includes("fonogramas")
      ? [
          {
            label: t("summary.fonogramas"),
            value: paso >= 2 && fonogramas > 0 ? fmtNum(fonogramas) : t("summary.pending"),
          },
        ]
      : []),
    ...(campos.includes("usuarios")
      ? [
          {
            label: t("summary.usuarios"),
            value: paso >= 2 && usuarios > 0 ? fmtNum(usuarios) : t("summary.pending"),
          },
        ]
      : []),
    ...(campos.includes("bocas")
      ? [
          {
            label: t("summary.bocas"),
            value: paso >= 2 && bocas > 0 ? fmtNum(bocas) : t("summary.pending"),
          },
        ]
      : []),
  ];

  return (
    <div
      ref={contenedorRef}
      className="overflow-hidden border border-[#212226]/10 bg-[#feffff] shadow-[0_28px_90px_rgba(33,34,38,0.12)]"
    >
      {showOuterHeader && (
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
      )}

      <div
        className={`grid grid-cols-1 ${paso < 3 ? "lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_320px]" : ""}`}
      >
        {/* ── Main ──────────────────────────────────── */}
        <section className="px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
          {/* Step indicator */}
          {paso < 3 && (
            <div className="flex items-center mb-8">
              {stepLabels.map((label, idx) => {
                const active = paso === idx + 1;
                const done = paso > idx + 1;
                return (
                  <div key={label} className="flex items-center flex-1 last:flex-none">
                    <div className="flex items-center gap-2 shrink-0">
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-black transition-all ${
                          active
                            ? "bg-[#f0552f] text-white shadow-[0_0_0_3px_rgba(240,85,47,0.15)]"
                            : done
                              ? "bg-[#212226] text-white"
                              : "bg-[#212226]/10 text-[#212226]/30"
                        }`}
                      >
                        {done ? <CheckIcon className="h-3.5 w-3.5" /> : idx + 1}
                      </div>
                      <span
                        className={`hidden sm:block text-[11px] font-bold transition-colors ${
                          active
                            ? "text-[#212226]"
                            : done
                              ? "text-[#212226]/50"
                              : "text-[#212226]/25"
                        }`}
                      >
                        {label}
                      </span>
                    </div>
                    {idx < stepLabels.length - 1 && (
                      <div
                        className={`flex-1 mx-3 h-px transition-colors ${
                          paso > idx + 1 ? "bg-[#212226]/30" : "bg-[#212226]/8"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* ── Servicio ──────────────────────────── */}
            {paso === 1 && (
              <motion.div key="s1" {...motionProps} className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#212226]/35 mb-4">
                  01 — {t("steps.servicio")}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {INTERNET_SERVICIOS.map((s) => {
                    const Icon = SERVICIO_ICONS[s];
                    const selected = servicio === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setServicio(s)}
                        className={`group flex items-start gap-4 rounded-2xl border p-5 text-left transition-all ${
                          selected
                            ? "border-[#f0552f] bg-[#f0552f]/5 shadow-[0_0_0_1px_#f0552f]"
                            : "border-[#212226]/8 bg-[#faf9f7] hover:border-[#f0552f]/35 hover:bg-white"
                        }`}
                      >
                        <span
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                            selected
                              ? "bg-[#f0552f] text-white"
                              : "bg-[#212226]/8 text-[#212226]/40 group-hover:bg-[#f0552f]/10 group-hover:text-[#f0552f]"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </span>
                        <span>
                          <span
                            className={`block text-sm font-black ${selected ? "text-[#f0552f]" : "text-[#212226]"}`}
                          >
                            {t(`servicios.${s}`)}
                          </span>
                          <span className="mt-1 block text-xs leading-relaxed text-[#212226]/45">
                            {t(`servicios.${s}Desc`)}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
                {servicio === "simulcasting" && (
                  <div className="border-l-[3px] border-[#f0552f] rounded-r-2xl bg-[#f0552f]/5 px-5 py-4 max-w-lg">
                    <p className="text-xs text-[#212226]/52 leading-relaxed">
                      {t("notaSimulcasting")}
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── Datos ─────────────────────────────── */}
            {paso === 2 && servicio && (
              <motion.div key="s2" {...motionProps} className="space-y-5">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#212226]/35 mb-4">
                  02 — {t("steps.datos")}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl">
                  {campos.includes("visitas") && (
                    <NumInput
                      label={t("fields.visitas")}
                      value={visitas}
                      onChange={setVisitas}
                      placeholder="0"
                      help={t("fields.visitasHelp")}
                    />
                  )}
                  {campos.includes("ingresos") && (
                    <NumInput
                      label={ingresosLabel}
                      value={ingresos}
                      onChange={setIngresos}
                      placeholder="0"
                      prefix="Gs."
                      help={t("fields.ingresosHelp")}
                    />
                  )}
                  {campos.includes("fonogramas") && (
                    <NumInput
                      label={t("fields.fonogramas")}
                      value={fonogramas}
                      onChange={setFonogramas}
                      placeholder="0"
                    />
                  )}
                  {campos.includes("usuarios") && (
                    <NumInput
                      label={t("fields.usuarios")}
                      value={usuarios}
                      onChange={setUsuarios}
                      placeholder="0"
                    />
                  )}
                  {campos.includes("bocas") && (
                    <NumInput
                      label={t("fields.bocas")}
                      value={bocas}
                      onChange={setBocas}
                      placeholder="0"
                      help={t("fields.bocasHelp")}
                    />
                  )}
                </div>
              </motion.div>
            )}

            {/* ── Resultado ─────────────────────────── */}
            {paso === 3 && resultado && (
              <motion.div key="s3" {...motionProps}>
                <ResultadoTarifa
                  monto={resultado.total}
                  etiqueta={t("tarifaMensual")}
                  subtitulo={servicio ? t(`servicios.${servicio}`) : undefined}
                  // La primera fila del resumen es el servicio: ya va como subtítulo.
                  datos={summaryRows.slice(1)}
                  calculo={
                    resultado.componentes.length > 1
                      ? resultado.componentes.map((c) => ({
                          label: t(`componentes.${c.clave}`),
                          value: fmt(c.valor),
                          destacado: resultado.gana === c.clave,
                        }))
                      : undefined
                  }
                  avisos={
                    resultado.minimoUSD !== null
                      ? [
                          {
                            tono: "neutro",
                            titulo: `${t("cotizacion")}: Gs. ${fmtTC(cotizacion.usd)} / USD`,
                            texto: t("cotizacionNota"),
                          },
                        ]
                      : []
                  }
                  disclaimer={t("disclaimer")}
                  onReset={handleReset}
                  resetLabel={t("nuevaConsulta")}
                  labelCalculo={t("seAplicaMayor")}
                  labelDatos={t("datosDeclarados")}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navegación */}
          {paso < 3 && (
            <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-[#212226]/8 pt-6">
              {paso > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-[#212226]/45 hover:text-[#f0552f] transition-colors"
                >
                  <ArrowLeftIcon className="h-3.5 w-3.5" />
                  {t("atras")}
                </button>
              ) : (
                <span />
              )}
              <div className="flex items-center gap-4">
                {faltantes.length > 0 && (
                  <p className="text-right text-xs text-[#212226]/45">
                    {t("completa")}{" "}
                    <span className="font-bold text-[#212226]/60">
                      {faltantes.join(" · ")}
                    </span>
                  </p>
                )}
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!canNext}
                  className="inline-flex h-11 min-w-[156px] items-center justify-center gap-2.5 rounded-xl bg-[#212226] px-6 text-xs font-black uppercase tracking-[0.14em] text-white transition-all hover:bg-[#f0552f] disabled:bg-[#212226]/18 disabled:cursor-not-allowed"
                >
                  {paso === 2 ? t("calcular") : t("siguiente")}
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </section>

        {/* ── Resumen ───────────────────────────────── */}
        {paso < 3 && (
          <PanelResumen
            titulo={t("summary.title")}
            monto={null}
            vacio={t("summary.empty")}
            filas={summaryRows}
            disclaimer={t("disclaimer")}
          >
            <p className="text-[11px] leading-relaxed text-[#212226]/35">
              {t("cotizacion")}: Gs. {fmtTC(cotizacion.usd)} / USD
            </p>
          </PanelResumen>
        )}
      </div>
    </div>
  );
}

// ── Sub-componentes ──────────────────────────────────────────────────────────

function NumInput({
  label,
  value,
  onChange,
  placeholder,
  prefix,
  help,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  placeholder: string;
  prefix?: string;
  help?: string;
}) {
  const display = value > 0 ? new Intl.NumberFormat("es-PY").format(value) : "";
  return (
    <div>
      <label className="block text-[10px] font-black uppercase tracking-wider text-[#212226]/45 mb-2">
        {label}
      </label>
      <div className="flex h-12 items-center rounded-xl border border-[#212226]/10 bg-[#faf9f7] overflow-hidden focus-within:border-[#f0552f] transition-colors">
        {prefix && (
          <span className="pl-4 text-sm font-bold text-[#212226]/40">{prefix}</span>
        )}
        <input
          inputMode="numeric"
          value={display}
          onChange={(e) =>
            onChange(Number(e.target.value.replace(/\D/g, "")) || 0)
          }
          placeholder={placeholder}
          className={`flex-1 bg-transparent text-sm outline-none placeholder:text-[#212226]/22 ${prefix ? "px-3" : "px-4"}`}
        />
      </div>
      {help && (
        <p className="text-[11px] text-[#212226]/35 mt-2 leading-relaxed">
          {help}
        </p>
      )}
    </div>
  );
}
