"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRightIcon,
  ArrowLeftIcon,
  ArrowPathIcon,
  CheckIcon,
  PlusIcon,
  MinusIcon,
  SpeakerWaveIcon,
  ComputerDesktopIcon,
  BuildingStorefrontIcon,
  BuildingOffice2Icon,
  MusicalNoteIcon,
  HomeModernIcon,
  ScissorsIcon,
  AcademicCapIcon,
  HeartIcon,
  BriefcaseIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";
import {
  GRUPOS,
  DIAS_SEMANA,
  GIMNASIO_TIPOS_SECUNDARIO,
  type GrupoId,
  type DiaSemana,
  type Turno,
  type MedioDeUso,
  type CategoriaHotel,
} from "@/lib/tarifario-config";
import { getGimnasioSubtipo } from "@/lib/tarifario-config";
import type { TarifarioInput } from "@/lib/tarifario-engine";

const TURNOS: Turno[] = ["manana", "mediodia", "tarde", "noche"];

const GRUPO_ICONS: Record<GrupoId, React.ElementType> = {
  gastronomia: BuildingStorefrontIcon,
  comercial: BuildingOffice2Icon,
  entretenimiento: MusicalNoteIcon,
  hoteles: HomeModernIcon,
  estetica: ScissorsIcon,
  academias: AcademicCapIcon,
  gimnasios: HeartIcon,
  oficinas: BriefcaseIcon,
  motel: HomeIcon,
};

const fmt = (n: number) =>
  new Intl.NumberFormat("es-PY", {
    style: "currency",
    currency: "PYG",
    minimumFractionDigits: 0,
  }).format(n);

const compactNumber = (n: number) =>
  n > 0 ? new Intl.NumberFormat("es-PY").format(n) : "";

type Step = 1 | 2 | 3 | 4 | 5;

export default function TarifarioCalculator({
  showOuterHeader = true,
}: {
  showOuterHeader?: boolean;
}) {
  const t = useTranslations("tarifario");

  const [step, setStep] = useState<Step>(1);
  const [grupo, setGrupo] = useState<GrupoId | null>(null);
  const [tipoLocal, setTipoLocal] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("");
  const [medio, setMedio] = useState<MedioDeUso>("parlante");
  const [dias, setDias] = useState<DiaSemana[]>([]);
  const [turnos, setTurnos] = useState<Turno[]>([]);

  const [mesas, setMesas] = useState(0);
  const [butacas, setButacas] = useState(0);
  const [metrosCuadrados, setMetrosCuadrados] = useState(0);
  const [habitaciones, setHabitaciones] = useState(0);
  const [categoriaHotel, setCategoriaHotel] = useState<CategoriaHotel>(3);
  const [estaciones, setEstaciones] = useState(0);
  const [alumnos, setAlumnos] = useState(0);
  const [maquinas, setMaquinas] = useState(0);
  const [sesionesPorDia, setSesionesPorDia] = useState(0);
  const [sillasEspera, setSillasEspera] = useState(0);
  const [camas, setCamas] = useState(0);
  const [ubicacion, setUbicacion] = useState<"capital" | "interior">("capital");

  const [resultado, setResultado] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [gimnasioServicios, setGimnasioServicios] = useState<{ tipo: string; tarifa: number }[]>([]);

  const grupoConfig = grupo ? GRUPOS.find((g) => g.id === grupo) : null;
  const gimnasioTotal =
    gimnasioServicios.reduce((acc, s) => acc + s.tarifa, 0) +
    (grupo === "gimnasios" ? (resultado ?? 0) : 0);
  const tarifaVisible = grupo === "gimnasios" ? gimnasioTotal : (resultado ?? 0);
  const tieneTarifaVisible = resultado !== null || gimnasioServicios.length > 0;

  const tiposDisponibles =
    grupo === "gimnasios" && grupoConfig && gimnasioServicios.length === 0
      ? grupoConfig.tipos.filter((tp) => GIMNASIO_TIPOS_SECUNDARIO.includes(tp))
      : (grupoConfig?.tipos ?? []);
  const tiposFiltrados = tiposDisponibles.filter((tp) =>
    tp.toLowerCase().includes(tipoFiltro.trim().toLowerCase()),
  );
  const agregandoServicioGimnasio =
    step === 1 && grupo === "gimnasios" && gimnasioServicios.length > 0;

  const hotelEstrellasImplicitas: Record<string, CategoriaHotel> = {
    "Hotel 1 Estrella": 1,
    "Hotel 2 Estrellas": 2,
    "Hotel 3 Estrellas": 3,
    "Hotel 4 Estrellas": 4,
    "Hotel 5 Estrellas": 5,
  };
  const categoriaImplicita = hotelEstrellasImplicitas[tipoLocal] ?? null;
  const subtipoGimnasio =
    grupo === "gimnasios" && tipoLocal ? getGimnasioSubtipo(tipoLocal) : null;

  const needsHorario = grupo !== "academias" && grupo !== "hoteles";
  const needsMedio = (() => {
    if (!grupo) return true;
    if (grupo === "academias" || grupo === "hoteles" || grupo === "entretenimiento") return false;
    if (grupo === "gimnasios") return getGimnasioSubtipo(tipoLocal) === "secundario";
    return true;
  })();

  const totalSteps = (() => {
    if (grupo === "academias" || grupo === "hoteles") return 2;
    if (!needsMedio) return 3;
    return 4;
  })();

  const toggleDia = (d: DiaSemana) =>
    setDias((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d],
    );

  const toggleTurno = (tr: Turno) =>
    setTurnos((prev) =>
      prev.includes(tr) ? prev.filter((x) => x !== tr) : [...prev, tr],
    );

  const buildInput = useCallback((): TarifarioInput => ({
    grupo: grupo!,
    tipoLocal,
    medio,
    mesas, butacas,
    metrosCuadrados,
    habitaciones, categoriaHotel: categoriaImplicita ?? categoriaHotel,
    estaciones,
    alumnos, ubicacion,
    maquinas, sesionesPorDia,
    sillasEspera,
    camas,
    dias, turnos,
  }), [grupo, tipoLocal, medio, mesas, butacas, metrosCuadrados, habitaciones,
    categoriaImplicita, categoriaHotel, estaciones, alumnos, ubicacion,
    maquinas, sesionesPorDia, sillasEspera, camas, dias, turnos]);

  const handleCalcular = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tarifario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildInput()),
      });
      const data = await res.json();
      setResultado(data.tarifa ?? 0);
      setStep(5);
    } catch {
      setResultado(0);
      setStep(5);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep(1); setGrupo(null); setTipoLocal(""); setTipoFiltro("");
    setMedio("parlante"); setDias([]); setTurnos([]);
    setMesas(0); setButacas(0); setMetrosCuadrados(0);
    setHabitaciones(0); setCategoriaHotel(3); setEstaciones(0);
    setAlumnos(0); setUbicacion("capital");
    setMaquinas(0); setSesionesPorDia(0);
    setSillasEspera(0); setCamas(0);
    setResultado(null); setGimnasioServicios([]);
  };

  const canNext = (() => {
    if (step === 1) return !!grupo && !!tipoLocal;
    if (step === 2) {
      if (grupo === "gastronomia") return mesas > 0 || butacas > 0;
      if (grupo === "comercial" || grupo === "entretenimiento") return metrosCuadrados > 0;
      if (grupo === "hoteles") return habitaciones > 0;
      if (grupo === "estetica") return estaciones > 0;
      if (grupo === "academias") return alumnos > 0;
      if (grupo === "gimnasios") {
        const sub = getGimnasioSubtipo(tipoLocal);
        if (sub === "indispensable") return metrosCuadrados > 0 && sesionesPorDia > 0;
        if (sub === "necesario") return maquinas > 0 && sesionesPorDia > 0;
        return maquinas > 0;
      }
      if (grupo === "oficinas") return sillasEspera > 0;
      if (grupo === "motel") return camas > 0;
      return false;
    }
    if (step === 3) {
      if (!needsHorario) return true;
      if (grupo === "gastronomia") return dias.length > 0 && turnos.length > 0;
      return dias.length > 0;
    }
    if (step === 4) return true;
    return false;
  })();

  const handleNext = () => {
    if (step === 1) setStep(2);
    else if (step === 2) {
      if (grupo === "academias" || grupo === "hoteles") handleCalcular();
      else setStep(3);
    } else if (step === 3) {
      if (!needsMedio) handleCalcular();
      else setStep(4);
    } else if (step === 4) handleCalcular();
  };

  const handleBack = () => {
    if (step === 3) setStep(2);
    else if (step === 4) setStep(3);
    else if (step === 2) setStep(1);
  };

  const datosLocal = (() => {
    if (grupo === "gastronomia") {
      return [
        mesas > 0 ? `${compactNumber(mesas)} ${t("fields.mesas").toLowerCase()}` : "",
        butacas > 0 ? `${compactNumber(butacas)} ${t("fields.butacas").toLowerCase()}` : "",
      ].filter(Boolean).join(" / ");
    }
    if (grupo === "comercial" || grupo === "entretenimiento")
      return metrosCuadrados > 0 ? `${compactNumber(metrosCuadrados)} m²` : "";
    if (grupo === "hoteles")
      return habitaciones > 0 ? `${compactNumber(habitaciones)} ${t("fields.habitaciones").toLowerCase()}` : "";
    if (grupo === "estetica")
      return estaciones > 0 ? `${compactNumber(estaciones)} ${t("fields.estaciones").toLowerCase()}` : "";
    if (grupo === "academias")
      return alumnos > 0 ? `${compactNumber(alumnos)} ${t("fields.alumnos").toLowerCase()}` : "";
    if (grupo === "gimnasios") {
      const base =
        subtipoGimnasio === "indispensable"
          ? metrosCuadrados > 0 ? `${compactNumber(metrosCuadrados)} m²` : ""
          : maquinas > 0 ? `${compactNumber(maquinas)} ${t("fields.maquinas").toLowerCase()}` : "";
      const ses = sesionesPorDia > 0 ? `${compactNumber(sesionesPorDia)} ${t("fields.sesiones").toLowerCase()}` : "";
      return [base, ses].filter(Boolean).join(" / ");
    }
    if (grupo === "oficinas")
      return sillasEspera > 0 ? `${compactNumber(sillasEspera)} ${t("fields.sillasEspera").toLowerCase()}` : "";
    if (grupo === "motel")
      return camas > 0 ? `${compactNumber(camas)} ${t("fields.camas").toLowerCase()}` : "";
    return "";
  })();

  const avisoContextual = (() => {
    if (grupo === "gastronomia" && turnos.includes("noche")) return t("summary.noticeGastronomiaNoche");
    if (grupo === "oficinas") return t("summary.noticeOficinas");
    if ((grupo === "comercial" || grupo === "entretenimiento") && dias.length === 7) return t("summary.notice30Dias");
    if (grupo === "gimnasios") return t("gimnasio.agregarAviso");
    return "";
  })();

  const motionProps = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -12 },
    transition: { duration: 0.22 },
  };

  const stepLabels = [t("step1"), t("step2"), t("step3"), t("step4")].slice(0, totalSteps);

  return (
    <div className="overflow-hidden border border-[#212226]/10 bg-[#feffff] shadow-[0_28px_90px_rgba(33,34,38,0.12)]">
      {showOuterHeader && (
        <div className="border-b border-[#212226]/10 px-6 py-5 lg:px-10">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f0552f] mb-2">
            Calculadora
          </p>
          <h3 className="font-display font-black text-[#212226] text-3xl lg:text-4xl leading-none">
            {t("title")}
          </h3>
          <p className="text-sm text-[#212226]/50 mt-2 leading-relaxed">{t("subtitle")}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_320px]">
        {/* ── Main content ───────────────────────────── */}
        <section className="px-5 py-6 sm:px-8 lg:px-10 lg:py-8">

          {/* Step indicator */}
          {step < 5 && (
            <div className="flex items-center mb-8">
              {stepLabels.map((label, idx) => {
                const s = idx + 1;
                const active = step === s;
                const done = step > s;
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
                        {done ? <CheckIcon className="h-3.5 w-3.5" /> : s}
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
                          step > idx + 1 ? "bg-[#212226]/30" : "bg-[#212226]/8"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <AnimatePresence mode="wait">

            {/* ── STEP 1: Rubro + Tipo inline ─────────── */}
            {step === 1 && (
              <motion.div key="s1" {...motionProps} className="space-y-7">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#212226]/35 mb-4">
                    {agregandoServicioGimnasio
                      ? t("gimnasio.nuevoServicio")
                      : "01 — " + t("summary.rubro")}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {GRUPOS.map((g) => {
                      const Icon = GRUPO_ICONS[g.id];
                      const selected = grupo === g.id;
                      const disabled = agregandoServicioGimnasio && g.id !== "gimnasios";
                      return (
                        <button
                          key={g.id}
                          type="button"
                          disabled={disabled}
                          onClick={() => {
                            setGrupo(g.id);
                            setTipoLocal("");
                            setTipoFiltro("");
                          }}
                          className={`group flex items-start gap-3 rounded-2xl border p-4 text-left transition-all disabled:opacity-25 disabled:cursor-not-allowed ${
                            selected
                              ? "border-[#f0552f] bg-[#f0552f]/6 shadow-[0_2px_12px_rgba(240,85,47,0.12)]"
                              : "border-[#212226]/8 bg-[#faf9f7] hover:border-[#f0552f]/30 hover:bg-white hover:shadow-sm"
                          }`}
                        >
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all ${
                              selected
                                ? "bg-[#f0552f] text-white"
                                : "bg-[#212226]/8 text-[#212226]/40 group-hover:bg-[#f0552f]/10 group-hover:text-[#f0552f]"
                            }`}
                          >
                            <Icon className="h-4.5 w-4.5 h-[18px] w-[18px]" />
                          </div>
                          <div className="min-w-0">
                            <span
                              className={`block text-[13px] font-black leading-tight ${
                                selected ? "text-[#f0552f]" : "text-[#212226]/72"
                              }`}
                            >
                              {t(`grupos.${g.id}`)}
                            </span>
                            <span
                              className={`mt-1 block text-[11px] leading-snug ${
                                selected ? "text-[#f0552f]/55" : "text-[#212226]/32"
                              }`}
                            >
                              {t(`gruposDesc.${g.id}`)}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Tipo de local (aparece tras seleccionar rubro) */}
                <AnimatePresence>
                  {grupo && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.18 }}
                    >
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#212226]/35 mb-3">
                        {t("fields.tipoLocal")}
                      </p>

                      {tiposDisponibles.length > 8 && (
                        <input
                          type="search"
                          value={tipoFiltro}
                          onChange={(e) => setTipoFiltro(e.target.value)}
                          placeholder={t("fields.buscarTipo")}
                          className="mb-3 h-10 w-full max-w-xs rounded-xl border border-[#212226]/10 bg-[#faf9f7] px-4 text-sm outline-none placeholder:text-[#212226]/28 focus:border-[#f0552f] transition-colors"
                          autoFocus
                        />
                      )}

                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-h-52 overflow-y-auto pr-0.5">
                        {tiposFiltrados.map((tp) => {
                          const selected = tipoLocal === tp;
                          return (
                            <button
                              key={tp}
                              type="button"
                              onClick={() => setTipoLocal(tp)}
                              className={`rounded-xl border px-3 py-2.5 text-left text-sm font-semibold transition-all ${
                                selected
                                  ? "border-[#f0552f] bg-[#f0552f] text-white shadow-sm"
                                  : "border-[#212226]/8 bg-white text-[#212226]/62 hover:border-[#f0552f]/35 hover:text-[#212226]"
                              }`}
                            >
                              {tp}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* ── STEP 2: Datos del local ──────────────── */}
            {step === 2 && (
              <motion.div key="s2" {...motionProps}>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#212226]/35 mb-6">
                  02 — {t("step2")}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-lg">
                  {grupo === "gastronomia" && (
                    <>
                      <NumberStepper
                        label={t("fields.mesas")}
                        placeholder={t("fields.mesasPlaceholder")}
                        value={mesas}
                        onChange={setMesas}
                      />
                      <NumberStepper
                        label={t("fields.butacas")}
                        placeholder={t("fields.butacasPlaceholder")}
                        value={butacas}
                        onChange={setButacas}
                        optional
                      />
                    </>
                  )}

                  {(grupo === "comercial" || grupo === "entretenimiento") && (
                    <NumberStepper
                      label={t("fields.metrosCuadrados")}
                      placeholder={t("fields.metrosCuadradosPlaceholder")}
                      value={metrosCuadrados}
                      onChange={setMetrosCuadrados}
                    />
                  )}

                  {grupo === "hoteles" && (
                    <>
                      <NumberStepper
                        label={t("fields.habitaciones")}
                        placeholder={t("fields.habitacionesPlaceholder")}
                        value={habitaciones}
                        onChange={setHabitaciones}
                      />
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-[#212226]/45 mb-2">
                          {t("fields.categoriaHotel")}
                        </label>
                        <div className="flex h-12 items-center rounded-xl border border-[#212226]/10 bg-[#faf9f7] px-4 text-sm text-[#212226]/55">
                          {categoriaImplicita
                            ? t(`hotel.estrellas${categoriaImplicita}`)
                            : t("hotel.sinCategoria")}
                        </div>
                      </div>
                    </>
                  )}

                  {grupo === "estetica" && (
                    <NumberStepper
                      label={t("fields.estaciones")}
                      placeholder={t("fields.estacionesPlaceholder")}
                      value={estaciones}
                      onChange={setEstaciones}
                    />
                  )}

                  {grupo === "academias" && (
                    <>
                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-black uppercase tracking-wider text-[#212226]/45 mb-3">
                          {t("academia.ubicacion")}
                        </label>
                        <div className="flex gap-3">
                          {(["capital", "interior"] as const).map((u) => (
                            <button
                              key={u}
                              type="button"
                              onClick={() => setUbicacion(u)}
                              className={`flex-1 rounded-xl border py-3 px-4 text-sm font-bold transition-all ${
                                ubicacion === u
                                  ? "border-[#f0552f] bg-[#f0552f]/7 text-[#f0552f]"
                                  : "border-[#212226]/10 text-[#212226]/55 hover:border-[#212226]/22"
                              }`}
                            >
                              {t(`academia.${u}`)}
                            </button>
                          ))}
                        </div>
                      </div>
                      <NumberStepper
                        label={t("fields.alumnos")}
                        placeholder={t("fields.alumnosPlaceholder")}
                        value={alumnos}
                        onChange={setAlumnos}
                      />
                    </>
                  )}

                  {grupo === "gimnasios" && (
                    <>
                      {getGimnasioSubtipo(tipoLocal) === "indispensable" ? (
                        <NumberStepper
                          label={t("fields.metrosCuadrados")}
                          placeholder={t("fields.metrosCuadradosPlaceholder")}
                          value={metrosCuadrados}
                          onChange={setMetrosCuadrados}
                        />
                      ) : (
                        <NumberStepper
                          label={t("fields.maquinas")}
                          placeholder={t("fields.maquinasPlaceholder")}
                          value={maquinas}
                          onChange={setMaquinas}
                        />
                      )}
                      {getGimnasioSubtipo(tipoLocal) !== "secundario" && (
                        <NumberStepper
                          label={t("fields.sesiones")}
                          placeholder={t("fields.sesionesPlaceholder")}
                          value={sesionesPorDia}
                          onChange={setSesionesPorDia}
                        />
                      )}
                    </>
                  )}

                  {grupo === "oficinas" && (
                    <NumberStepper
                      label={t("fields.sillasEspera")}
                      placeholder={t("fields.sillasEsperaPlaceholder")}
                      value={sillasEspera}
                      onChange={setSillasEspera}
                    />
                  )}

                  {grupo === "motel" && (
                    <NumberStepper
                      label={t("fields.camas")}
                      placeholder={t("fields.camasPlaceholder")}
                      value={camas}
                      onChange={setCamas}
                    />
                  )}
                </div>
              </motion.div>
            )}

            {/* ── STEP 3: Días y horarios ──────────────── */}
            {step === 3 && (
              <motion.div key="s3" {...motionProps} className="space-y-8">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#212226]/35">
                  03 — {t("step3")}
                </p>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.16em] text-[#212226]/45 mb-3">
                    {t("dias.label")}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {DIAS_SEMANA.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => toggleDia(d)}
                        className={`min-w-[52px] rounded-xl border px-4 py-2.5 text-sm font-bold transition-all ${
                          dias.includes(d)
                            ? "border-[#f0552f] bg-[#f0552f] text-white shadow-sm"
                            : "border-[#212226]/10 text-[#212226]/50 hover:border-[#f0552f]/30 hover:text-[#212226]"
                        }`}
                      >
                        {t(`dias.${d}`)}
                      </button>
                    ))}
                  </div>
                </div>

                {grupo === "gastronomia" && (
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.16em] text-[#212226]/45 mb-3">
                      {t("turnos.label")}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {TURNOS.map((tr) => (
                        <button
                          key={tr}
                          type="button"
                          onClick={() => toggleTurno(tr)}
                          className={`rounded-xl border px-5 py-2.5 text-sm font-bold transition-all ${
                            turnos.includes(tr)
                              ? "border-[#4666a6] bg-[#4666a6] text-white shadow-sm"
                              : "border-[#212226]/10 text-[#212226]/50 hover:border-[#4666a6]/35 hover:text-[#212226]"
                          }`}
                        >
                          {t(`turnos.${tr}`)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── STEP 4: Medio de uso ─────────────────── */}
            {step === 4 && (
              <motion.div key="s4" {...motionProps}>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#212226]/35 mb-6">
                  04 — {t("step4")}
                </p>

                <label className="block text-[10px] font-black uppercase tracking-[0.16em] text-[#212226]/45 mb-4">
                  {t("medio.label")}
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md">
                  {(["parlante", "televisor"] as const).map((m) => {
                    const Icon = m === "parlante" ? SpeakerWaveIcon : ComputerDesktopIcon;
                    const selected = medio === m;
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMedio(m)}
                        className={`group flex items-center gap-4 rounded-2xl border p-5 text-left transition-all ${
                          selected
                            ? "border-[#f0552f] bg-[#f0552f]/6 shadow-[0_2px_12px_rgba(240,85,47,0.1)]"
                            : "border-[#212226]/10 hover:border-[#f0552f]/30 hover:bg-white"
                        }`}
                      >
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all ${
                            selected
                              ? "bg-[#f0552f] text-white"
                              : "bg-[#212226]/8 text-[#212226]/40 group-hover:bg-[#f0552f]/10 group-hover:text-[#f0552f]"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <span
                            className={`block text-sm font-black ${
                              selected ? "text-[#f0552f]" : "text-[#212226]/70"
                            }`}
                          >
                            {t(`medio.${m}`)}
                          </span>
                          <span className="block text-[11px] text-[#212226]/38 mt-0.5">
                            {m === "parlante" ? "Coef. 0.15" : "Coef. 0.12"}
                          </span>
                        </div>
                        {selected && (
                          <CheckIcon className="h-4 w-4 text-[#f0552f] shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ── STEP 5: Resultado ────────────────────── */}
            {step === 5 && (
              <motion.div key="s5" {...motionProps}>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#212226]/35 mb-6">
                  {t("resultado")}
                </p>

                {/* Desglose gimnasio */}
                {grupo === "gimnasios" && resultado !== null && (
                  <div className="max-w-sm mb-6 rounded-2xl border border-[#212226]/8 overflow-hidden">
                    {gimnasioServicios.map((s, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center px-4 py-3 border-b border-[#212226]/6 text-sm"
                      >
                        <span className="text-[#212226]/55">{s.tipo}</span>
                        <span className="font-black text-[#212226]/75">{fmt(s.tarifa)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center px-4 py-3 border-b border-[#212226]/6 text-sm">
                      <span className="text-[#212226]/55">
                        {tipoLocal || t("gimnasio.servicioActual")}
                      </span>
                      <span className="font-black text-[#212226]/75">{fmt(resultado)}</span>
                    </div>
                    {gimnasioServicios.length > 0 && (
                      <div className="flex justify-between items-center px-4 py-3.5 bg-[#f0552f]/5 text-sm font-black">
                        <span className="text-[#212226]/60">{t("gimnasio.totalFinal")}</span>
                        <span className="text-[#f0552f] text-base">{fmt(gimnasioTotal)}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Tarifa principal */}
                <div className="mb-1">
                  <p className="font-display font-black text-[#f0552f] text-5xl lg:text-6xl leading-none">
                    {fmt(grupo === "gimnasios" ? gimnasioTotal : (resultado ?? 0))}
                  </p>
                </div>
                <p className="text-sm font-semibold text-[#212226]/50 mb-1">
                  {t("tarifaMensual")}
                </p>
                <p className="text-xs text-[#212226]/32 max-w-md leading-relaxed mb-8">
                  {t("disclaimer")}
                </p>

                {/* Aviso baile */}
                {grupo === "gastronomia" && turnos.includes("noche") && (
                  <div className="border-l-[3px] border-[#f0552f] rounded-r-2xl bg-[#f0552f]/5 px-5 py-4 max-w-sm mb-6">
                    <p className="text-[11px] font-black uppercase tracking-wider text-[#f0552f] mb-1.5">
                      {t("gastronomia.baileTitle")}
                    </p>
                    <p className="text-xs text-[#212226]/52 leading-relaxed mb-3">
                      {t("gastronomia.baileDesc")}
                    </p>
                    <button
                      onClick={() => {
                        handleReset();
                        setTimeout(() => {
                          setGrupo("entretenimiento");
                          setTipoLocal("Bar con Baile");
                          setStep(2);
                        }, 50);
                      }}
                      className="text-xs font-black text-[#f0552f] hover:underline uppercase tracking-wider"
                    >
                      {t("gastronomia.baileBtn")} →
                    </button>
                  </div>
                )}

                {/* Acciones */}
                <div className="flex flex-wrap gap-3">
                  {grupo === "gimnasios" && (
                    <button
                      onClick={() => {
                        setGimnasioServicios((prev) => [
                          ...prev,
                          { tipo: tipoLocal, tarifa: resultado ?? 0 },
                        ]);
                        setGrupo("gimnasios");
                        setTipoLocal("");
                        setTipoFiltro("");
                        setMaquinas(0);
                        setSesionesPorDia(0);
                        setMetrosCuadrados(0);
                        setDias([]);
                        setMedio("parlante");
                        setResultado(null);
                        setStep(1);
                      }}
                      className="inline-flex items-center gap-2 rounded-xl border border-[#f0552f] text-[#f0552f] hover:bg-[#f0552f] hover:text-white text-xs font-black uppercase tracking-[0.14em] px-6 py-3.5 transition-all"
                    >
                      <PlusIcon className="w-3.5 h-3.5" />
                      {t("gimnasio.agregarServicio")}
                    </button>
                  )}
                  <button
                    onClick={handleReset}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#212226] hover:bg-[#f0552f] text-white text-xs font-black uppercase tracking-[0.14em] px-6 py-3.5 transition-all"
                  >
                    <ArrowPathIcon className="w-3.5 h-3.5" />
                    {t("reiniciar")}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Navegación ──────────────────────────────── */}
          {step < 5 && (
            <div className="mt-7 flex items-center justify-between border-t border-[#212226]/8 pt-5">
              {step > 1 ? (
                <button
                  onClick={handleBack}
                  className="inline-flex items-center gap-2 text-sm font-bold text-[#212226]/40 hover:text-[#212226] transition-colors"
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                  {t("anterior")}
                </button>
              ) : (
                <div />
              )}

              <button
                onClick={handleNext}
                disabled={!canNext || loading}
                className="inline-flex h-11 min-w-[156px] items-center justify-center gap-2.5 rounded-xl bg-[#212226] px-6 text-xs font-black uppercase tracking-[0.14em] text-white transition-all hover:bg-[#f0552f] disabled:bg-[#212226]/18 disabled:cursor-not-allowed"
              >
                {loading ? (
                  "Calculando..."
                ) : step === totalSteps ? (
                  t("calcular")
                ) : (
                  <>
                    {t("siguiente")}
                    <ArrowRightIcon className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          )}
        </section>

        {/* ── Sidebar resumen ─────────────────────────── */}
        <aside className="border-t border-[#212226]/10 bg-[#212226] px-6 py-8 text-white lg:border-l lg:border-t-0 lg:px-8 lg:py-10 lg:self-stretch">
          <div className="space-y-5">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-3">
                {t("summary.title")}
              </p>
              <p className="font-display font-black text-[#f0552f] text-4xl lg:text-5xl leading-none">
                {tieneTarifaVisible ? fmt(tarifaVisible) : "—"}
              </p>
              <p className="text-xs text-white/38 mt-2 leading-relaxed">
                {tieneTarifaVisible ? t("tarifaMensual") : t("summary.empty")}
              </p>
            </div>

            <div className="divide-y divide-white/8 border-y border-white/8">
              <SummaryRow
                label={t("summary.rubro")}
                value={grupo ? t(`grupos.${grupo}`) : t("summary.pending")}
              />
              <SummaryRow
                label={t("summary.tipo")}
                value={tipoLocal || t("summary.pending")}
              />
              <SummaryRow
                label={t("summary.datos")}
                value={datosLocal || t("summary.pending")}
              />
              {grupo && needsHorario && (
                <SummaryRow
                  label={t("summary.horario")}
                  value={
                    dias.length > 0
                      ? `${dias.length} ${t("summary.diasSeleccionados")}`
                      : t("summary.pending")
                  }
                />
              )}
              {grupo && needsMedio && (
                <SummaryRow
                  label={t("summary.medio")}
                  value={t(`medio.${medio}`)}
                />
              )}
            </div>

            {grupo === "gimnasios" && gimnasioServicios.length > 0 && (
              <div className="rounded-xl border border-white/10 overflow-hidden">
                <div className="px-4 py-2.5 border-b border-white/10 bg-white/5">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/35">
                    {t("gimnasio.subtotal")}
                  </p>
                </div>
                {gimnasioServicios.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 text-xs"
                  >
                    <span className="text-white/55">{s.tipo}</span>
                    <span className="font-black text-white">{fmt(s.tarifa)}</span>
                  </div>
                ))}
              </div>
            )}

            {avisoContextual && (
              <div className="border-l-2 border-[#f0552f] pl-4 py-0.5">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#f0552f] mb-1.5">
                  {t("summary.noticeTitle")}
                </p>
                <p className="text-[11px] text-white/45 leading-relaxed">
                  {avisoContextual}
                </p>
              </div>
            )}

            <p className="text-[11px] text-white/22 leading-relaxed">
              {t("disclaimer")}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ── Sub-componentes ──────────────────────────────────────────────────────────

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-3 flex items-start justify-between gap-3">
      <span className="text-[10px] font-black uppercase tracking-[0.13em] text-white/30 shrink-0">
        {label}
      </span>
      <span className="text-xs font-bold text-white/68 text-right leading-relaxed">
        {value}
      </span>
    </div>
  );
}

function NumberStepper({
  label,
  placeholder,
  value,
  onChange,
  optional = false,
}: {
  label: string;
  placeholder: string;
  value: number;
  onChange: (v: number) => void;
  optional?: boolean;
}) {
  return (
    <div>
      <label className="block text-[10px] font-black uppercase tracking-wider text-[#212226]/45 mb-2">
        {label}
        {optional && (
          <span className="ml-1.5 text-[#212226]/28 normal-case tracking-normal font-normal text-[11px]">
            (opcional)
          </span>
        )}
      </label>
      <div className="flex h-12 items-center rounded-xl border border-[#212226]/10 bg-[#faf9f7] overflow-hidden focus-within:border-[#f0552f] transition-colors">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          className="flex h-full w-11 shrink-0 items-center justify-center border-r border-[#212226]/8 text-[#212226]/35 hover:text-[#f0552f] hover:bg-[#f0552f]/5 transition-colors"
        >
          <MinusIcon className="h-3.5 w-3.5" />
        </button>
        <input
          type="number"
          min={0}
          value={value || ""}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          placeholder={placeholder}
          className="flex-1 bg-transparent px-3 text-sm text-center outline-none placeholder:text-[#212226]/22"
        />
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="flex h-full w-11 shrink-0 items-center justify-center border-l border-[#212226]/8 text-[#212226]/35 hover:text-[#f0552f] hover:bg-[#f0552f]/5 transition-colors"
        >
          <PlusIcon className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
