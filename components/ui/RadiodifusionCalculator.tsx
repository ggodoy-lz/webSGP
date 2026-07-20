"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRightIcon,
  ArrowLeftIcon,
  CheckIcon,
  RadioIcon,
  TvIcon,
  SignalIcon,
  MapPinIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";
import {
  RADIO_CATEGORIAS,
  MEDIO_USA_ZONA,
  type RadioMedio,
  type RadioCategoria,
  type Zona,
} from "@/lib/radiodifusion-config";
import {
  calcularRadiodifusion,
  type RadiodifusionResult,
} from "@/lib/radiodifusion-engine";
import ResultadoTarifa from "@/components/ui/ResultadoTarifa";
import PanelResumen from "@/components/ui/PanelResumen";
import IndicadorPasos from "@/components/ui/IndicadorPasos";
import { useStepScroll } from "@/lib/use-step-scroll";

const fmt = (n: number) =>
  new Intl.NumberFormat("es-PY", {
    style: "currency",
    currency: "PYG",
    minimumFractionDigits: 0,
  }).format(n);

const MEDIO_ICONS: Record<RadioMedio, React.ElementType> = {
  radio: RadioIcon,
  tv_abierta: TvIcon,
  tv_cable: SignalIcon,
};

type PasoId = "medio" | "zona" | "categoria" | "ingresos" | "resultado";

export default function RadiodifusionCalculator({
  showOuterHeader = true,
}: {
  showOuterHeader?: boolean;
}) {
  const t = useTranslations("radiodifusion");

  const [medio, setMedio] = useState<RadioMedio | null>(null);
  const [zona, setZona] = useState<Zona | null>(null);
  const [categoria, setCategoria] = useState<RadioCategoria | null>(null);
  const [ingresos, setIngresos] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const [resultado, setResultado] = useState<RadiodifusionResult | null>(null);

  // TV abierta y cable/OTT no diferencian zona → se salta ese paso.
  const usaZona = medio ? MEDIO_USA_ZONA[medio] : true;
  const pasos: PasoId[] = usaZona
    ? ["medio", "zona", "categoria", "ingresos", "resultado"]
    : ["medio", "categoria", "ingresos", "resultado"];
  const paso = pasos[stepIdx];
  const totalPasos = pasos.length - 1; // sin contar resultado

  const stepLabels = pasos
    .filter((p) => p !== "resultado")
    .map((p) => t(`steps.${p}`));

  const contenedorRef = useStepScroll(stepIdx);

  // Lo que falta para avanzar, para mostrarlo junto al botón.
  const faltantes: string[] = (() => {
    if (paso === "medio" && !medio) return [t("steps.medio")];
    if (paso === "zona" && !zona) return [t("steps.zona")];
    if (paso === "categoria" && !categoria) return [t("steps.categoria")];
    return []; // en "ingresos", 0 es válido → aplica el mínimo
  })();
  const canNext = paso !== "resultado" && faltantes.length === 0;

  const handleNext = () => {
    if (paso === "ingresos" && medio && categoria) {
      setResultado(
        calcularRadiodifusion({
          medio,
          zona: usaZona ? (zona ?? "capital") : "capital",
          categoria,
          ingresos,
          // El 10% de pronto pago no se aplica acá: solo se menciona en el
          // resultado y se aplicará al confirmar el pago en la pasarela.
          prontoPago: false,
        }),
      );
    }
    setStepIdx((i) => Math.min(i + 1, pasos.length - 1));
  };

  const handleBack = () => setStepIdx((i) => Math.max(i - 1, 0));

  const handleReset = () => {
    setMedio(null);
    setZona(null);
    setCategoria(null);
    setIngresos(0);
    setResultado(null);
    setStepIdx(0);
  };

  const motionProps = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -12 },
    transition: { duration: 0.22 },
  };

  const summaryRows = [
    {
      label: t("summary.medio"),
      value: medio ? t(`medios.${medio}`) : t("summary.pending"),
    },
    ...(usaZona
      ? [
          {
            label: t("summary.zona"),
            value: zona ? t(`zona.${zona}`) : t("summary.pending"),
          },
        ]
      : []),
    {
      label: t("summary.categoria"),
      value: categoria ? t(`categorias.${categoria}`) : t("summary.pending"),
    },
    {
      label: t("summary.ingresos"),
      value:
        paso === "resultado" || paso === "ingresos"
          ? ingresos > 0
            ? fmt(ingresos)
            : t("summary.sinIngresos")
          : t("summary.pending"),
    },
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
        className={`grid grid-cols-1 ${paso !== "resultado" ? "lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_320px]" : ""}`}
      >
        {/* ── Main ──────────────────────────────────── */}
        <section className="px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
          {paso !== "resultado" && (
            <IndicadorPasos
              labels={stepLabels}
              actual={stepIdx}
              onIr={setStepIdx}
              volverA={t("volverA")}
            />
          )}

          <AnimatePresence mode="wait">
            {/* ── Medio ─────────────────────────────── */}
            {paso === "medio" && (
              <motion.div key="medio" {...motionProps} className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#212226]/35 mb-4">
                  01 — {t("steps.medio")}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(Object.keys(MEDIO_ICONS) as RadioMedio[]).map((m) => {
                    const Icon = MEDIO_ICONS[m];
                    const selected = medio === m;
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => {
                          setMedio(m);
                          if (!MEDIO_USA_ZONA[m]) setZona(null);
                        }}
                        className={`group flex flex-col items-start gap-3 rounded-2xl border p-5 text-left transition-all ${
                          selected
                            ? "border-[#f0552f] bg-[#f0552f]/5 shadow-[0_0_0_1px_#f0552f]"
                            : "border-[#212226]/8 bg-[#faf9f7] hover:border-[#f0552f]/35 hover:bg-white"
                        }`}
                      >
                        <span
                          className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
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
                            {t(`medios.${m}`)}
                          </span>
                          <span className="mt-1 block text-xs leading-relaxed text-[#212226]/45">
                            {t(`medios.${m}Desc`)}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ── Zona (solo radio) ─────────────────── */}
            {paso === "zona" && (
              <motion.div key="zona" {...motionProps} className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#212226]/35 mb-4">
                  02 — {t("steps.zona")}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(["capital", "interior"] as Zona[]).map((z) => {
                    const selected = zona === z;
                    const Icon = z === "capital" ? MapPinIcon : GlobeAltIcon;
                    return (
                      <button
                        key={z}
                        type="button"
                        onClick={() => setZona(z)}
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
                            {t(`zona.${z}`)}
                          </span>
                          <span className="mt-1 block text-xs leading-relaxed text-[#212226]/45">
                            {t(`zona.${z}Desc`)}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ── Categoría musical ─────────────────── */}
            {paso === "categoria" && (
              <motion.div key="categoria" {...motionProps} className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#212226]/35 mb-1">
                  {String(pasos.indexOf("categoria") + 1).padStart(2, "0")} —{" "}
                  {t("steps.categoria")}
                </p>
                <p className="text-sm text-[#212226]/50 mb-4">
                  {t("categorias.titulo")}
                </p>
                <div className="space-y-2.5">
                  {RADIO_CATEGORIAS.map((c) => {
                    const selected = categoria === c;
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCategoria(c)}
                        className={`flex w-full items-center justify-between gap-4 rounded-xl border px-5 py-4 text-left transition-all ${
                          selected
                            ? "border-[#f0552f] bg-[#f0552f]/5 shadow-[0_0_0_1px_#f0552f]"
                            : "border-[#212226]/8 bg-[#faf9f7] hover:border-[#f0552f]/35 hover:bg-white"
                        }`}
                      >
                        <span>
                          <span
                            className={`block text-sm font-black ${selected ? "text-[#f0552f]" : "text-[#212226]"}`}
                          >
                            {t(`categorias.${c}`)}
                          </span>
                          <span className="mt-0.5 block text-xs text-[#212226]/45">
                            {t(`categorias.${c}Desc`)}
                          </span>
                        </span>
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                            selected
                              ? "border-[#f0552f] bg-[#f0552f]"
                              : "border-[#212226]/15"
                          }`}
                        >
                          {selected && <CheckIcon className="h-3 w-3 text-white" />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ── Ingresos ──────────────────────────── */}
            {paso === "ingresos" && (
              <motion.div key="ingresos" {...motionProps} className="space-y-6">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#212226]/35">
                  {String(pasos.indexOf("ingresos") + 1).padStart(2, "0")} —{" "}
                  {t("steps.ingresos")}
                </p>
                <div className="max-w-md">
                  <MoneyInput
                    label={t("fields.ingresos")}
                    value={ingresos}
                    onChange={setIngresos}
                    placeholder="0"
                    help={t("fields.ingresosHelp")}
                  />
                </div>
              </motion.div>
            )}

            {/* ── Resultado ─────────────────────────── */}
            {paso === "resultado" && resultado && (
              <motion.div key="resultado" {...motionProps}>
                <ResultadoTarifa
                  monto={resultado.total}
                  etiqueta={t("tarifaMensual")}
                  subtitulo={medio ? t(`medios.${medio}`) : undefined}
                  // La primera fila del resumen es el medio: ya va como subtítulo.
                  datos={summaryRows.slice(1)}
                  calculo={
                    resultado.aplicaMinimo
                      ? [
                          {
                            label: t("aplicaMinimo"),
                            value: fmt(resultado.minimo),
                            destacado: true,
                          },
                        ]
                      : undefined
                  }
                  avisos={[
                    {
                      tono: "beneficio",
                      titulo: t("prontoPagoTitle"),
                      texto: t("notaProntoPago"),
                    },
                    ...(medio === "radio"
                      ? ([
                          { tono: "neutro" as const, texto: t("notaSimulcasting") },
                        ])
                      : []),
                  ]}
                  disclaimer={t("disclaimer")}
                  onReset={handleReset}
                  resetLabel={t("nuevaConsulta")}
                  labelCalculo={t("desglose")}
                  labelDatos={t("datosDeclarados")}
                    labelImprimir={t("imprimir")}
                    labelCompartir={t("compartir")}
                    labelCopiado={t("copiado")}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navegación */}
          {paso !== "resultado" && (
            <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-[#212226]/8 pt-6">
              {stepIdx > 0 ? (
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
                  {stepIdx === totalPasos - 1 ? t("calcular") : t("siguiente")}
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </section>

        {/* ── Resumen ───────────────────────────────── */}
        {paso !== "resultado" && (
          <PanelResumen
            titulo={t("summary.title")}
            monto={null}
            vacio={t("summary.empty")}
            filas={summaryRows}
            disclaimer={t("disclaimer")}
          />
        )}
      </div>
    </div>
  );
}

// ── Sub-componentes ──────────────────────────────────────────────────────────

function MoneyInput({
  label,
  value,
  onChange,
  placeholder,
  help,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  placeholder: string;
  help?: string;
}) {
  const display = value > 0 ? new Intl.NumberFormat("es-PY").format(value) : "";
  return (
    <div>
      <label className="block text-[10px] font-black uppercase tracking-wider text-[#212226]/45 mb-2">
        {label}
      </label>
      <div className="flex h-12 items-center rounded-xl border border-[#212226]/10 bg-[#faf9f7] overflow-hidden focus-within:border-[#f0552f] transition-colors">
        <span className="pl-4 text-sm font-bold text-[#212226]/40">Gs.</span>
        <input
          inputMode="numeric"
          value={display}
          onChange={(e) =>
            onChange(Number(e.target.value.replace(/\D/g, "")) || 0)
          }
          placeholder={placeholder}
          className="flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-[#212226]/22"
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
