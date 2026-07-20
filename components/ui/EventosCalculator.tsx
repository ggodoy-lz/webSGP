"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRightIcon,
  ArrowLeftIcon,
  ArrowPathIcon,
  CheckIcon,
  MusicalNoteIcon,
  CakeIcon,
  SparklesIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  TicketIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";
import {
  EVENTO_GRUPOS,
  eventosPorGrupo,
  getEvento,
  type EventoGrupo,
  type Zona,
  type UsoCircoTeatro,
} from "@/lib/eventos-config";
import { calcularEventos, type EventosResultado } from "@/lib/eventos-engine";

const fmt = (n: number) =>
  new Intl.NumberFormat("es-PY", {
    style: "currency",
    currency: "PYG",
    minimumFractionDigits: 0,
  }).format(n);

const fmtNum = (n: number) => new Intl.NumberFormat("es-PY").format(n);

const GRUPO_ICONS: Record<EventoGrupo, React.ElementType> = {
  bailes: MusicalNoteIcon,
  familiares: CakeIcon,
  espectaculos: SparklesIcon,
  empresariales: BriefcaseIcon,
  estudiantiles: AcademicCapIcon,
  academias: AcademicCapIcon,
  circos: TicketIcon,
};

const TELEFONOS = "0976 899997 · 0981 334 806 · 0972 803 099";

/** Qué campos pide cada modo de cálculo. */
function camposDe(tipoId: string) {
  const ev = getEvento(tipoId);
  const c = ev?.calculo;
  const none = {
    zona: false,
    personas: false,
    baile: false,
    ingresos: false,
    cortesias: false,
    circo: false,
  };
  if (!c) return none;
  switch (c.modo) {
    case "porcentual":
      return {
        ...none,
        // La zona solo importa si el mínimo sale de la tabla empresarial.
        zona: c.minCon.tipo === "tablaEmp" || c.sin.tipo === "tablaEmp",
        personas: true,
        ingresos: true,
      };
    case "tablaFija":
      return { ...none, zona: true, personas: true };
    case "empresarial":
      return { ...none, zona: true, personas: true, baile: true };
    case "estudiantil":
      return { ...none, zona: true, personas: true, baile: true, ingresos: true };
    case "academia":
      return {
        ...none,
        zona: true,
        personas: true,
        baile: true,
        ingresos: true,
        cortesias: true,
      };
    case "deportivo":
      return { ...none, personas: true, ingresos: true };
    case "circoTeatro":
      return { ...none, circo: true };
    default:
      return none;
  }
}

const USOS_CIRCO: UsoCircoTeatro["id"][] = ["antes", "durante_corto", "durante_largo"];
const USOS_TEATRO: UsoCircoTeatro["id"][] = [
  "antes",
  "durante_corto",
  "durante_largo",
  "musical",
];

export default function EventosCalculator({
  showOuterHeader = true,
}: {
  showOuterHeader?: boolean;
}) {
  const t = useTranslations("eventos");

  const [paso, setPaso] = useState<1 | 2 | 3>(1);
  const [grupo, setGrupo] = useState<EventoGrupo | null>(null);
  const [tipo, setTipo] = useState<string>("");
  const [otroTipo, setOtroTipo] = useState("");
  const [zona, setZona] = useState<Zona>("capital");
  const [personas, setPersonas] = useState(0);
  const [conBaile, setConBaile] = useState(false);
  const [conIngresos, setConIngresos] = useState(false);
  const [precioEntrada, setPrecioEntrada] = useState(0);
  const [incluyeConsumo, setIncluyeConsumo] = useState(false);
  const [cortesias, setCortesias] = useState(0);
  const [aforo, setAforo] = useState(0);
  const [funciones, setFunciones] = useState(1);
  const [usos, setUsos] = useState<UsoCircoTeatro["id"][]>([]);
  const [resultado, setResultado] = useState<EventosResultado | null>(null);

  const campos = tipo ? camposDe(tipo) : camposDe("");
  const evento = tipo ? getEvento(tipo) : undefined;
  const esCirco =
    evento?.calculo.modo === "circoTeatro" &&
    evento.calculo.establecimiento === "circo";
  const usosDisponibles = esCirco ? USOS_CIRCO : USOS_TEATRO;
  const derivaDirecto = evento?.calculo.modo === "derivaEjecutivo";
  const esMensual =
    evento?.calculo.modo === "porcentual" && evento.calculo.mensual === true;

  const stepLabels = [t("steps.tipo"), t("steps.datos")];

  const canNext = (() => {
    if (paso === 1) return !!tipo;
    if (paso === 2) {
      if (derivaDirecto) return true;
      if (campos.circo) return aforo > 0 && usos.length > 0;
      if (campos.personas && personas <= 0) return false;
      if (campos.ingresos && conIngresos && precioEntrada <= 0) return false;
      return true;
    }
    return false;
  })();

  const handleNext = () => {
    if (paso === 2 && tipo) {
      setResultado(
        calcularEventos({
          tipo,
          zona,
          personas,
          conIngresos,
          precioEntrada,
          conBaile,
          cortesias,
          aforo,
          funciones,
          usos,
        }),
      );
    }
    setPaso((p) => Math.min(p + 1, 3) as 1 | 2 | 3);
  };

  const handleReset = () => {
    setPaso(1);
    setGrupo(null);
    setTipo("");
    setOtroTipo("");
    setZona("capital");
    setPersonas(0);
    setConBaile(false);
    setConIngresos(false);
    setPrecioEntrada(0);
    setIncluyeConsumo(false);
    setCortesias(0);
    setAforo(0);
    setFunciones(1);
    setUsos([]);
    setResultado(null);
  };

  const motionProps = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -12 },
    transition: { duration: 0.22 },
  };

  const summaryRows = [
    {
      label: t("summary.tipo"),
      value: tipo
        ? otroTipo.trim()
          ? `${t(`tipos.${tipo}`)} — ${otroTipo.trim()}`
          : t(`tipos.${tipo}`)
        : t("summary.pending"),
    },
    ...(campos.zona
      ? [{ label: t("summary.zona"), value: paso >= 2 ? t(`zona.${zona}`) : t("summary.pending") }]
      : []),
    ...(campos.personas
      ? [
          {
            label: esMensual ? t("summary.personasMes") : t("summary.personas"),
            value: personas > 0 ? fmtNum(personas) : t("summary.pending"),
          },
        ]
      : []),
    ...(campos.baile
      ? [{ label: t("summary.baile"), value: paso >= 2 ? (conBaile ? t("si") : t("no")) : t("summary.pending") }]
      : []),
    ...(campos.ingresos
      ? [
          {
            label: t("summary.ingresos"),
            value:
              paso >= 2
                ? conIngresos && precioEntrada > 0
                  ? fmt(precioEntrada * personas)
                  : t("summary.sinIngresos")
                : t("summary.pending"),
          },
        ]
      : []),
    ...(campos.cortesias && cortesias > 0
      ? [{ label: t("summary.cortesias"), value: fmtNum(cortesias) }]
      : []),
    ...(campos.circo
      ? [
          { label: t("summary.aforo"), value: aforo > 0 ? fmtNum(aforo) : t("summary.pending") },
          { label: t("summary.funciones"), value: fmtNum(funciones) },
        ]
      : []),
  ];

  return (
    <div className="overflow-hidden border border-[#212226]/10 bg-[#feffff] shadow-[0_28px_90px_rgba(33,34,38,0.12)]">
      {showOuterHeader && (
        <div className="border-b border-[#212226]/10 px-6 py-5 lg:px-10">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f0552f] mb-2">
            {t("tag")}
          </p>
          <h3 className="font-display font-black text-[#212226] text-3xl lg:text-4xl leading-none">
            {t("title")}
          </h3>
          <p className="text-sm text-[#212226]/50 mt-2 leading-relaxed">{t("subtitle")}</p>
        </div>
      )}

      <div
        className={`grid grid-cols-1 ${paso < 3 ? "lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_320px]" : ""}`}
      >
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
                          active ? "text-[#212226]" : done ? "text-[#212226]/50" : "text-[#212226]/25"
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
            {/* ── Paso 1: tipo de evento ── */}
            {paso === 1 && (
              <motion.div key="s1" {...motionProps} className="space-y-7">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#212226]/35 mb-4">
                    01 — {t("steps.categoria")}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {EVENTO_GRUPOS.map((g) => {
                      const Icon = GRUPO_ICONS[g];
                      const selected = grupo === g;
                      return (
                        <button
                          key={g}
                          type="button"
                          onClick={() => {
                            setGrupo(g);
                            setTipo("");
                          }}
                          className={`group flex items-start gap-3 rounded-2xl border p-4 text-left transition-all ${
                            selected
                              ? "border-[#f0552f] bg-[#f0552f]/5 shadow-[0_0_0_1px_#f0552f]"
                              : "border-[#212226]/8 bg-[#faf9f7] hover:border-[#f0552f]/35 hover:bg-white"
                          }`}
                        >
                          <span
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors ${
                              selected
                                ? "bg-[#f0552f] text-white"
                                : "bg-[#212226]/8 text-[#212226]/40 group-hover:bg-[#f0552f]/10 group-hover:text-[#f0552f]"
                            }`}
                          >
                            <Icon className="h-4.5 w-4.5" />
                          </span>
                          <span>
                            <span
                              className={`block text-sm font-black ${selected ? "text-[#f0552f]" : "text-[#212226]"}`}
                            >
                              {t(`grupos.${g}`)}
                            </span>
                            <span className="mt-0.5 block text-[11px] leading-relaxed text-[#212226]/45">
                              {t(`grupos.${g}Desc`)}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {grupo && (
                  <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#212226]/35">
                      02 — {t("steps.tipo")}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {eventosPorGrupo(grupo).map((ev) => {
                        const selected = tipo === ev.id;
                        return (
                          <button
                            key={ev.id}
                            type="button"
                            onClick={() => setTipo(ev.id)}
                            className={`rounded-xl border px-4 py-2.5 text-sm font-bold transition-all ${
                              selected
                                ? "border-[#f0552f] bg-[#f0552f] text-white shadow-sm"
                                : "border-[#212226]/8 bg-[#faf9f7] text-[#212226]/65 hover:border-[#f0552f]/35 hover:bg-white hover:text-[#212226]"
                            }`}
                          >
                            {t(`tipos.${ev.id}`)}
                          </button>
                        );
                      })}
                    </div>
                    {tipo && (
                      <div className="max-w-md pt-1">
                        <label className="block text-[10px] font-black uppercase tracking-wider text-[#212226]/45 mb-2">
                          {t("fields.otroTipo")}
                          <span className="ml-1.5 font-normal normal-case tracking-normal text-[11px] text-[#212226]/28">
                            ({t("opcional")})
                          </span>
                        </label>
                        <input
                          value={otroTipo}
                          onChange={(e) => setOtroTipo(e.target.value)}
                          placeholder={t("fields.otroTipoPlaceholder")}
                          className="h-12 w-full rounded-xl border border-[#212226]/10 bg-[#faf9f7] px-4 text-sm outline-none transition-colors placeholder:text-[#212226]/22 focus:border-[#f0552f]"
                        />
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* ── Paso 2: datos ── */}
            {paso === 2 && (
              <motion.div key="s2" {...motionProps} className="space-y-6">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#212226]/35">
                  03 — {t("steps.datos")}
                </p>

                {derivaDirecto ? (
                  <AvisoEjecutivo texto={t("avisos.concierto")} t={t} />
                ) : (
                  <>
                    {campos.zona && (
                      <Selector
                        label={t("fields.zona")}
                        opciones={[
                          { id: "capital", label: t("zona.capital"), desc: t("zona.capitalDesc") },
                          { id: "interior", label: t("zona.interior"), desc: t("zona.interiorDesc") },
                        ]}
                        valor={zona}
                        onChange={(v) => setZona(v as Zona)}
                      />
                    )}

                    {campos.baile && (
                      <Selector
                        label={t("fields.baile")}
                        opciones={[
                          { id: "no", label: t("fields.sinBaile"), desc: t("fields.sinBaileDesc") },
                          { id: "si", label: t("fields.conBaile"), desc: t("fields.conBaileDesc") },
                        ]}
                        valor={conBaile ? "si" : "no"}
                        onChange={(v) => setConBaile(v === "si")}
                      />
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl">
                      {campos.personas && (
                        <NumInput
                          label={esMensual ? t("fields.personasMes") : t("fields.personas")}
                          value={personas}
                          onChange={setPersonas}
                          help={esMensual ? t("fields.personasMesHelp") : undefined}
                        />
                      )}
                      {campos.circo && (
                        <>
                          <NumInput label={t("fields.aforo")} value={aforo} onChange={setAforo} />
                          <NumInput
                            label={t("fields.funciones")}
                            value={funciones}
                            onChange={setFunciones}
                            help={t("fields.funcionesHelp")}
                          />
                        </>
                      )}
                    </div>

                    {campos.circo && (
                      <div className="space-y-3 max-w-2xl">
                        <p className="text-[10px] font-black uppercase tracking-wider text-[#212226]/45">
                          {t("fields.usos")}
                        </p>
                        <p className="text-xs text-[#212226]/45 -mt-1">{t("fields.usosHelp")}</p>
                        <div className="space-y-2.5">
                          {usosDisponibles.map((u) => {
                            const selected = usos.includes(u);
                            // No se pueden combinar los dos usos "durante".
                            const bloqueado =
                              (u === "durante_corto" && usos.includes("durante_largo")) ||
                              (u === "durante_largo" && usos.includes("durante_corto"));
                            return (
                              <button
                                key={u}
                                type="button"
                                disabled={bloqueado}
                                onClick={() =>
                                  setUsos((prev) =>
                                    prev.includes(u) ? prev.filter((x) => x !== u) : [...prev, u],
                                  )
                                }
                                className={`flex w-full items-start gap-4 rounded-xl border px-5 py-4 text-left transition-all ${
                                  selected
                                    ? "border-[#f0552f] bg-[#f0552f]/5 shadow-[0_0_0_1px_#f0552f]"
                                    : bloqueado
                                      ? "border-[#212226]/6 bg-[#faf9f7]/60 cursor-not-allowed opacity-50"
                                      : "border-[#212226]/8 bg-[#faf9f7] hover:border-[#f0552f]/35 hover:bg-white"
                                }`}
                              >
                                <span
                                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all ${
                                    selected ? "border-[#f0552f] bg-[#f0552f]" : "border-[#212226]/15"
                                  }`}
                                >
                                  {selected && <CheckIcon className="h-3 w-3 text-white" />}
                                </span>
                                <span>
                                  <span
                                    className={`block text-sm font-black ${selected ? "text-[#f0552f]" : "text-[#212226]"}`}
                                  >
                                    {t(`usos.${u}`)}
                                  </span>
                                  <span className="mt-0.5 block text-xs leading-relaxed text-[#212226]/45">
                                    {t(`usos.${u}Desc`)}
                                  </span>
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {campos.ingresos && (
                      <>
                        <Selector
                          label={t("fields.cobranEntrada")}
                          opciones={[
                            { id: "no", label: t("no"), desc: t("fields.sinEntradaDesc") },
                            { id: "si", label: t("si"), desc: t("fields.conEntradaDesc") },
                          ]}
                          valor={conIngresos ? "si" : "no"}
                          onChange={(v) => setConIngresos(v === "si")}
                        />
                        {conIngresos && (
                          <div className="max-w-md space-y-4">
                            <NumInput
                              label={t("fields.precioEntrada")}
                              value={precioEntrada}
                              onChange={setPrecioEntrada}
                              prefix="Gs."
                            />
                            {personas > 0 && precioEntrada > 0 && (
                              <p className="text-xs text-[#212226]/45">
                                {t("fields.ingresoTotal")}:{" "}
                                <strong className="text-[#212226]/70">
                                  {fmt(precioEntrada * personas)}
                                </strong>
                              </p>
                            )}
                            <button
                              type="button"
                              onClick={() => setIncluyeConsumo(!incluyeConsumo)}
                              className={`flex w-full items-start gap-4 rounded-xl border px-5 py-4 text-left transition-all ${
                                incluyeConsumo
                                  ? "border-[#f0552f] bg-[#f0552f]/5 shadow-[0_0_0_1px_#f0552f]"
                                  : "border-[#212226]/8 bg-[#faf9f7] hover:border-[#f0552f]/35 hover:bg-white"
                              }`}
                            >
                              <span
                                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all ${
                                  incluyeConsumo ? "border-[#f0552f] bg-[#f0552f]" : "border-[#212226]/15"
                                }`}
                              >
                                {incluyeConsumo && <CheckIcon className="h-3 w-3 text-white" />}
                              </span>
                              <span className="text-sm font-bold text-[#212226]">
                                {t("fields.incluyeConsumo")}
                              </span>
                            </button>
                            {incluyeConsumo && <AvisoEjecutivo texto={t("avisos.consumo")} t={t} />}
                          </div>
                        )}
                      </>
                    )}

                    {campos.cortesias && (
                      <div className="max-w-md">
                        <NumInput
                          label={t("fields.cortesias")}
                          value={cortesias}
                          onChange={setCortesias}
                          help={t("fields.cortesiasHelp")}
                        />
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            )}

            {/* ── Paso 3: resultado ── */}
            {paso === 3 && resultado && (
              <motion.div key="s3" {...motionProps}>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#212226]/35 mb-6">
                  {t("resultado")}
                </p>

                {resultado.estado === "ejecutivo" ? (
                  <div className="max-w-lg mb-8">
                    <AvisoEjecutivo texto={t(`avisos.${resultado.motivo}`)} t={t} destacado />
                  </div>
                ) : (
                  <div className="flex flex-col lg:flex-row lg:items-start lg:gap-12 mb-8">
                    <div className="shrink-0 mb-6 lg:mb-0">
                      <p className="font-display font-black text-[#f0552f] text-5xl lg:text-6xl leading-none">
                        {fmt(resultado.total)}
                      </p>
                      <p className="text-sm font-semibold text-[#212226]/50 mt-2 mb-4">
                        {esMensual ? t("tarifaMensualTemporada") : t("tarifaEstimada")}
                      </p>
                      <p className="text-xs text-[#212226]/32 max-w-xs leading-relaxed">
                        {t("disclaimer")}
                      </p>
                    </div>

                    <div className="flex-1 rounded-2xl border border-[#212226]/8 overflow-hidden">
                      {resultado.detalle.length > 1 && (
                        <>
                          <div className="px-5 py-2.5 border-b border-[#212226]/8 bg-[#212226]/4">
                            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#212226]/35">
                              {t("desglose")}
                            </p>
                          </div>
                          {resultado.detalle.map((d) => (
                            <div
                              key={d.clave}
                              className="flex items-center justify-between gap-6 px-5 py-3 border-b border-[#212226]/6 bg-[#faf9f7]"
                            >
                              <span className="text-sm text-[#212226]/55">
                                {t(`componentes.${d.clave}`)}
                              </span>
                              <span className="text-sm font-black text-[#212226]/75">
                                {d.clave === "funciones" ? `× ${fmtNum(d.valor)}` : fmt(d.valor)}
                              </span>
                            </div>
                          ))}
                        </>
                      )}
                      {summaryRows.map((row, i, arr) => (
                        <div
                          key={row.label}
                          className={`flex items-center justify-between gap-6 px-5 py-3.5 ${i < arr.length - 1 ? "border-b border-[#212226]/6" : ""}`}
                        >
                          <span className="text-[10px] font-black uppercase tracking-[0.14em] text-[#212226]/35 shrink-0">
                            {row.label}
                          </span>
                          <span className="text-sm font-bold text-[#212226]/75 text-right">
                            {row.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Beneficio pronto pago — solo se informa */}
                {resultado.estado === "ok" && (
                  <div className="border-l-[3px] border-[#f2b33d] rounded-r-2xl bg-[#f2b33d]/8 px-5 py-4 max-w-lg mb-4">
                    <p className="text-[11px] font-black uppercase tracking-wider text-[#b57f14] mb-1.5">
                      {t("prontoPagoTitle")}
                    </p>
                    <p className="text-xs text-[#212226]/52 leading-relaxed">
                      {t("prontoPagoDesc")}
                    </p>
                  </div>
                )}

                {/* Descuentos adicionales con verificación de SGP */}
                <div className="border-l-[3px] border-[#f0552f] rounded-r-2xl bg-[#f0552f]/5 px-5 py-4 max-w-lg mb-6">
                  <p className="text-[11px] font-black uppercase tracking-wider text-[#f0552f] mb-1.5">
                    {t("descuentosTitle")}
                  </p>
                  <p className="text-xs text-[#212226]/52 leading-relaxed mb-2">
                    {t("descuentosDesc")}
                  </p>
                  <p className="text-xs font-bold text-[#212226]/70">{TELEFONOS}</p>
                </div>

                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#212226] hover:bg-[#f0552f] text-white text-xs font-black uppercase tracking-[0.14em] px-6 py-3.5 transition-all"
                >
                  <ArrowPathIcon className="w-3.5 h-3.5" />
                  {t("nuevaConsulta")}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navegación */}
          {paso < 3 && (
            <div className="mt-10 flex items-center justify-between border-t border-[#212226]/8 pt-6">
              {paso > 1 ? (
                <button
                  type="button"
                  onClick={() => setPaso((p) => Math.max(p - 1, 1) as 1 | 2 | 3)}
                  className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-[#212226]/45 hover:text-[#f0552f] transition-colors"
                >
                  <ArrowLeftIcon className="h-3.5 w-3.5" />
                  {t("atras")}
                </button>
              ) : (
                <span />
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
          )}
        </section>

        {/* Sidebar */}
        {paso < 3 && (
          <aside className="border-t border-[#212226]/10 bg-white px-6 py-8 lg:border-l lg:border-t-0 lg:px-8 lg:py-10 lg:self-stretch shadow-[-1px_0_0_0_rgba(33,34,38,0.07)]">
            <div className="space-y-5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#212226]/35 mb-3">
                  {t("summary.title")}
                </p>
                <p className="font-display font-black text-[#f0552f] text-4xl lg:text-5xl leading-none">
                  —
                </p>
                <p className="text-xs text-[#212226]/40 mt-2 leading-relaxed">{t("summary.empty")}</p>
              </div>

              <div className="divide-y divide-[#212226]/6 border-y border-[#212226]/6">
                {summaryRows.map((row) => (
                  <div key={row.label} className="py-3 flex items-start justify-between gap-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.13em] text-[#212226]/35 shrink-0">
                      {row.label}
                    </span>
                    <span className="text-xs font-bold text-[#212226]/70 text-right leading-relaxed">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>

              <p className="text-xs text-[#212226]/40 leading-relaxed">{t("disclaimer")}</p>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

// ── Sub-componentes ──────────────────────────────────────────────────────────

function AvisoEjecutivo({
  texto,
  t,
  destacado = false,
}: {
  texto: string;
  t: (k: string) => string;
  destacado?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border-l-[3px] border-[#f0552f] bg-[#f0552f]/5 px-5 py-4 ${destacado ? "py-6" : ""}`}
    >
      <div className="flex items-start gap-3">
        <PhoneIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#f0552f]" />
        <div>
          <p className="text-[11px] font-black uppercase tracking-wider text-[#f0552f] mb-1.5">
            {t("avisos.titulo")}
          </p>
          <p className="text-xs text-[#212226]/55 leading-relaxed mb-2">{texto}</p>
          <p className="text-xs font-bold text-[#212226]/70">{TELEFONOS}</p>
        </div>
      </div>
    </div>
  );
}

function Selector({
  label,
  opciones,
  valor,
  onChange,
}: {
  label: string;
  opciones: { id: string; label: string; desc?: string }[];
  valor: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2.5 max-w-2xl">
      <p className="text-[10px] font-black uppercase tracking-wider text-[#212226]/45">{label}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {opciones.map((o) => {
          const selected = valor === o.id;
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => onChange(o.id)}
              className={`rounded-xl border px-5 py-4 text-left transition-all ${
                selected
                  ? "border-[#f0552f] bg-[#f0552f]/5 shadow-[0_0_0_1px_#f0552f]"
                  : "border-[#212226]/8 bg-[#faf9f7] hover:border-[#f0552f]/35 hover:bg-white"
              }`}
            >
              <span
                className={`block text-sm font-black ${selected ? "text-[#f0552f]" : "text-[#212226]"}`}
              >
                {o.label}
              </span>
              {o.desc && (
                <span className="mt-0.5 block text-xs leading-relaxed text-[#212226]/45">
                  {o.desc}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function NumInput({
  label,
  value,
  onChange,
  prefix,
  help,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  help?: string;
}) {
  const display = value > 0 ? new Intl.NumberFormat("es-PY").format(value) : "";
  return (
    <div>
      <label className="block text-[10px] font-black uppercase tracking-wider text-[#212226]/45 mb-2">
        {label}
      </label>
      <div className="flex h-12 items-center rounded-xl border border-[#212226]/10 bg-[#faf9f7] overflow-hidden transition-colors focus-within:border-[#f0552f]">
        {prefix && <span className="pl-4 text-sm font-bold text-[#212226]/40">{prefix}</span>}
        <input
          inputMode="numeric"
          value={display}
          onChange={(e) => onChange(Number(e.target.value.replace(/\D/g, "")) || 0)}
          placeholder="0"
          className={`flex-1 bg-transparent text-sm outline-none placeholder:text-[#212226]/22 ${prefix ? "px-3" : "px-4"}`}
        />
      </div>
      {help && <p className="mt-2 text-[11px] leading-relaxed text-[#212226]/35">{help}</p>}
    </div>
  );
}
