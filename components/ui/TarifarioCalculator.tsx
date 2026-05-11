"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRightIcon,
  ArrowLeftIcon,
  ArrowPathIcon,
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

type Step = 1 | 2 | 3 | 4 | 5;

const compactNumber = (n: number) =>
  n > 0 ? new Intl.NumberFormat("es-PY").format(n) : "";

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
    gimnasioServicios.reduce((acc, servicio) => acc + servicio.tarifa, 0) +
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

  // Detecta estrellas implícitas en el nombre del tipo de hotel
  const hotelEstrellasImplicitas: Record<string, CategoriaHotel> = {
    "Hotel 1 Estrella": 1,
    "Hotel 2 Estrellas": 2,
    "Hotel 3 Estrellas": 3,
    "Hotel 4 Estrellas": 4,
    "Hotel 5 Estrellas": 5,
  };
  const categoriaImplicita = hotelEstrellasImplicitas[tipoLocal] ?? null;
  const subtipoGimnasio = grupo === "gimnasios" && tipoLocal
    ? getGimnasioSubtipo(tipoLocal)
    : null;

  // Hoteles usan fórmula lineal: no necesitan días, horas ni medio
  const needsHorario = grupo !== "academias" && grupo !== "hoteles";
  const needsMedio = (() => {
    if (!grupo) return true;
    if (grupo === "academias") return false;
    if (grupo === "hoteles") return false;
    if (grupo === "entretenimiento") return false;
    if (grupo === "gimnasios") {
      const sub = getGimnasioSubtipo(tipoLocal);
      return sub === "secundario";
    }
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

  const toggleTurno = (t: Turno) =>
    setTurnos((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
    );

  const buildInput = useCallback((): TarifarioInput => {
    return {
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
    };
  }, [grupo, tipoLocal, medio, mesas, butacas, metrosCuadrados, habitaciones, categoriaImplicita, categoriaHotel, estaciones, alumnos, ubicacion, maquinas, sesionesPorDia, sillasEspera, camas, dias, turnos]);

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
    setStep(1);
    setGrupo(null);
    setTipoLocal("");
    setTipoFiltro("");
    setMedio("parlante");
    setDias([]);
    setTurnos([]);
    setMesas(0); setButacas(0);
    setMetrosCuadrados(0);
    setHabitaciones(0); setCategoriaHotel(3);
    setEstaciones(0);
    setAlumnos(0);
    setUbicacion("capital");
    setMaquinas(0); setSesionesPorDia(0);
    setSillasEspera(0);
    setCamas(0);
    setResultado(null);
    setGimnasioServicios([]);
  };

  const canNext = (() => {
    if (step === 1) return !!grupo && !!tipoLocal;
    if (step === 2) {
      if (grupo === "gastronomia") return mesas > 0 || butacas > 0;
      if (grupo === "comercial") return metrosCuadrados > 0;
      if (grupo === "entretenimiento") return metrosCuadrados > 0;
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
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (grupo === "academias" || grupo === "hoteles") {
        handleCalcular();
      } else {
        setStep(3);
      }
    } else if (step === 3) {
      if (!needsMedio) {
        handleCalcular();
      } else {
        setStep(4);
      }
    } else if (step === 4) {
      handleCalcular();
    }
  };

  const handleBack = () => {
    if (step === 3) setStep(2);
    else if (step === 4) setStep(3);
    else if (step === 2) setStep(1);
  };

  const fieldCls =
    "w-full bg-transparent border border-[#212226]/15 rounded-lg px-4 py-3 text-sm outline-none transition-colors focus:border-[#f0552f] placeholder:text-[#212226]/30";

  const datosLocal = (() => {
    if (grupo === "gastronomia") {
      const values = [
        mesas > 0 ? `${compactNumber(mesas)} ${t("fields.mesas").toLowerCase()}` : "",
        butacas > 0 ? `${compactNumber(butacas)} ${t("fields.butacas").toLowerCase()}` : "",
      ].filter(Boolean);
      return values.join(" / ");
    }
    if (grupo === "comercial" || grupo === "entretenimiento") {
      return metrosCuadrados > 0 ? `${compactNumber(metrosCuadrados)} m2` : "";
    }
    if (grupo === "hoteles") {
      return habitaciones > 0 ? `${compactNumber(habitaciones)} ${t("fields.habitaciones").toLowerCase()}` : "";
    }
    if (grupo === "estetica") {
      return estaciones > 0 ? `${compactNumber(estaciones)} ${t("fields.estaciones").toLowerCase()}` : "";
    }
    if (grupo === "academias") {
      return alumnos > 0 ? `${compactNumber(alumnos)} ${t("fields.alumnos").toLowerCase()}` : "";
    }
    if (grupo === "gimnasios") {
      const base = subtipoGimnasio === "indispensable"
        ? (metrosCuadrados > 0 ? `${compactNumber(metrosCuadrados)} m2` : "")
        : (maquinas > 0 ? `${compactNumber(maquinas)} ${t("fields.maquinas").toLowerCase()}` : "");
      const sesiones = sesionesPorDia > 0 ? `${compactNumber(sesionesPorDia)} ${t("fields.sesiones").toLowerCase()}` : "";
      return [base, sesiones].filter(Boolean).join(" / ");
    }
    if (grupo === "oficinas") {
      return sillasEspera > 0 ? `${compactNumber(sillasEspera)} ${t("fields.sillasEspera").toLowerCase()}` : "";
    }
    if (grupo === "motel") {
      return camas > 0 ? `${compactNumber(camas)} ${t("fields.camas").toLowerCase()}` : "";
    }
    return "";
  })();

  const avisoContextual = (() => {
    if (grupo === "gastronomia" && turnos.includes("noche")) {
      return t("summary.noticeGastronomiaNoche");
    }
    if (grupo === "oficinas") {
      return t("summary.noticeOficinas");
    }
    if ((grupo === "comercial" || grupo === "entretenimiento") && dias.length === 7) {
      return t("summary.notice30Dias");
    }
    if (grupo === "gimnasios") {
      return t("gimnasio.agregarAviso");
    }
    return "";
  })();

  const stepIndicator = (
    <div className="flex flex-wrap items-center gap-2 mb-8">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
        <div key={s} className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              step >= s
                ? "bg-[#f0552f] text-white"
                : "bg-[#212226]/10 text-[#212226]/40"
            }`}
          >
            {s}
          </div>
          {s < totalSteps && (
            <div
              className={`w-8 h-px ${step > s ? "bg-[#f0552f]" : "bg-[#212226]/15"}`}
            />
          )}
        </div>
      ))}
      <span className="lg:ml-3 text-[10px] font-bold uppercase tracking-[0.15em] text-[#212226]/40">
        {step === 1 && t("step1")}
        {step === 2 && t("step2")}
        {step === 3 && t("step3")}
        {step === 4 && t("step4")}
        {step === 5 && t("resultado")}
      </span>
    </div>
  );

  const motionProps = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.25 },
  };

  return (
    <div className="bg-[#feffff] border-t-4 border-[#212226] shadow-[0_24px_80px_rgba(33,34,38,0.08)]">
      {showOuterHeader && (
        <div className="px-6 lg:px-12 py-8 border-b border-[#212226]/10">
          <div className="max-w-4xl">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f0552f] mb-2">
              Calculadora
            </p>
            <h3 className="font-display font-black text-[#212226] text-3xl lg:text-4xl leading-none">
              {t("title")}
            </h3>
            <p className="text-sm text-[#212226]/50 mt-2 leading-relaxed">{t("subtitle")}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_400px] gap-0 min-h-[680px]">
        <section className="px-6 lg:px-12 py-10">
          <div className="max-w-4xl">
            {step < 5 && stepIndicator}

            <AnimatePresence mode="wait">
              {/* ── STEP 1: Grupo + Tipo ──────────────────── */}
              {step === 1 && (
                <motion.div key="s1" {...motionProps}>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#212226]/40 mb-6">
                    01 — {agregandoServicioGimnasio ? t("gimnasio.nuevoServicio") : t("step1")}
                  </p>

              {!agregandoServicioGimnasio && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                  {GRUPOS.map((g) => {
                    const Icon = GRUPO_ICONS[g.id];
                    const selected = grupo === g.id;
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => {
                          setGrupo(g.id);
                          setTipoLocal("");
                          setTipoFiltro("");
                        }}
                        className={`flex flex-col items-center gap-2 p-4 rounded-lg border text-center transition-all ${
                          selected
                            ? "border-[#f0552f] bg-[#f0552f]/5"
                            : "border-[#212226]/10 hover:border-[#212226]/30"
                        }`}
                      >
                        <Icon
                          className={`w-6 h-6 ${selected ? "text-[#f0552f]" : "text-[#212226]/40"}`}
                        />
                        <span
                          className={`text-xs font-bold ${selected ? "text-[#f0552f]" : "text-[#212226]/70"}`}
                        >
                          {t(`grupos.${g.id}`)}
                        </span>
                        <span className="text-[10px] text-[#212226]/35 leading-tight hidden sm:block">
                          {t(`gruposDesc.${g.id}`)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {grupo && grupoConfig && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="overflow-hidden"
                >
                  <div className="border border-[#212226]/10 bg-[#faf9f7] p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-4">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-[#212226]/50 mb-1">
                          {t("fields.tipoLocal")}
                        </label>
                        <p className="text-xs text-[#212226]/45">
                          {t("fields.tipoLocalHelper")}
                        </p>
                      </div>
                      {tiposDisponibles.length > 8 && (
                        <input
                          type="search"
                          value={tipoFiltro}
                          onChange={(e) => setTipoFiltro(e.target.value)}
                          placeholder={t("fields.buscarTipo")}
                          className="w-full sm:w-64 bg-white border border-[#212226]/10 px-3 py-2 text-xs outline-none focus:border-[#f0552f] placeholder:text-[#212226]/30"
                        />
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[310px] overflow-y-auto pr-1">
                      {tiposFiltrados.map((tp) => {
                        const selected = tipoLocal === tp;
                        return (
                          <button
                            key={tp}
                            type="button"
                            onClick={() => setTipoLocal(tp)}
                            className={`min-h-11 px-3 py-2 border text-left text-xs font-bold transition-all ${
                              selected
                                ? "border-[#f0552f] bg-[#f0552f] text-white"
                                : "border-[#212226]/10 bg-white text-[#212226]/65 hover:border-[#f0552f]/50 hover:text-[#212226]"
                            }`}
                          >
                            {tp}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
                </motion.div>
              )}

          {/* ── STEP 2: Datos del local ──────────────── */}
          {step === 2 && (
            <motion.div key="s2" {...motionProps}>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#212226]/40 mb-6">
                02 — {t("step2")}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {grupo === "gastronomia" && (
                  <>
                    <InputField
                      label={t("fields.mesas")}
                      placeholder={t("fields.mesasPlaceholder")}
                      value={mesas}
                      onChange={setMesas}
                    />
                    <InputField
                      label={t("fields.butacas")}
                      placeholder={t("fields.butacasPlaceholder")}
                      value={butacas}
                      onChange={setButacas}
                    />
                  </>
                )}

                {(grupo === "comercial" || grupo === "entretenimiento") && (
                  <InputField
                    label={t("fields.metrosCuadrados")}
                    placeholder={t("fields.metrosCuadradosPlaceholder")}
                    value={metrosCuadrados}
                    onChange={setMetrosCuadrados}
                  />
                )}

                {grupo === "hoteles" && (
                  <>
                    <InputField
                      label={t("fields.habitaciones")}
                      placeholder={t("fields.habitacionesPlaceholder")}
                      value={habitaciones}
                      onChange={setHabitaciones}
                    />
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-[#212226]/50 mb-2">
                        {t("fields.categoriaHotel")}
                      </label>
                      <div className={fieldCls + " text-[#212226]/60"}>
                        {categoriaImplicita
                          ? t(`hotel.estrellas${categoriaImplicita}`)
                          : t("hotel.sinCategoria")}
                      </div>
                    </div>
                  </>
                )}

                {grupo === "estetica" && (
                  <InputField
                    label={t("fields.estaciones")}
                    placeholder={t("fields.estacionesPlaceholder")}
                    value={estaciones}
                    onChange={setEstaciones}
                  />
                )}

                {grupo === "academias" && (
                  <>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-[#212226]/50 mb-3">
                        {t("academia.ubicacion")}
                      </label>
                      <div className="flex gap-3">
                        {(["capital", "interior"] as const).map((u) => (
                          <button
                            key={u}
                            type="button"
                            onClick={() => setUbicacion(u)}
                            className={`flex-1 px-4 py-3 rounded-lg border text-sm font-bold transition-all ${
                              ubicacion === u
                                ? "border-[#f0552f] bg-[#f0552f]/5 text-[#f0552f]"
                                : "border-[#212226]/10 text-[#212226]/70 hover:border-[#212226]/30"
                            }`}
                          >
                            {t(`academia.${u}`)}
                          </button>
                        ))}
                      </div>
                    </div>
                    <InputField
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
                      <InputField
                        label={t("fields.metrosCuadrados")}
                        placeholder={t("fields.metrosCuadradosPlaceholder")}
                        value={metrosCuadrados}
                        onChange={setMetrosCuadrados}
                      />
                    ) : (
                      <InputField
                        label={t("fields.maquinas")}
                        placeholder={t("fields.maquinasPlaceholder")}
                        value={maquinas}
                        onChange={setMaquinas}
                      />
                    )}
                    {getGimnasioSubtipo(tipoLocal) !== "secundario" && (
                      <InputField
                        label={t("fields.sesiones")}
                        placeholder={t("fields.sesionesPlaceholder")}
                        value={sesionesPorDia}
                        onChange={setSesionesPorDia}
                      />
                    )}
                  </>
                )}

                {grupo === "oficinas" && (
                  <InputField
                    label={t("fields.sillasEspera")}
                    placeholder={t("fields.sillasEsperaPlaceholder")}
                    value={sillasEspera}
                    onChange={setSillasEspera}
                  />
                )}

                {grupo === "motel" && (
                  <InputField
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
            <motion.div key="s3" {...motionProps}>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#212226]/40 mb-6">
                03 — {t("step3")}
              </p>

              <div className="mb-8">
                <label className="block text-[10px] font-black uppercase tracking-wider text-[#212226]/50 mb-3">
                  {t("dias.label")}
                </label>
                <div className="flex flex-wrap gap-2">
                  {DIAS_SEMANA.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => toggleDia(d)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                        dias.includes(d)
                          ? "bg-[#f0552f] text-white"
                          : "bg-[#212226]/5 text-[#212226]/50 hover:bg-[#212226]/10"
                      }`}
                    >
                      {t(`dias.${d}`)}
                    </button>
                  ))}
                </div>
              </div>

              {grupo === "gastronomia" && (
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-[#212226]/50 mb-3">
                    {t("turnos.label")}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {TURNOS.map((tr) => (
                      <button
                        key={tr}
                        type="button"
                        onClick={() => toggleTurno(tr)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                          turnos.includes(tr)
                            ? "bg-[#4666a6] text-white"
                            : "bg-[#212226]/5 text-[#212226]/50 hover:bg-[#212226]/10"
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
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#212226]/40 mb-6">
                04 — {t("step4")}
              </p>

              <label className="block text-[10px] font-black uppercase tracking-wider text-[#212226]/50 mb-4">
                {t("medio.label")}
              </label>

              <div className="flex flex-col sm:flex-row gap-3">
                {(["parlante", "televisor"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMedio(m)}
                    className={`flex-1 px-6 py-4 rounded-lg border text-left transition-all ${
                      medio === m
                        ? "border-[#f0552f] bg-[#f0552f]/5"
                        : "border-[#212226]/10 hover:border-[#212226]/30"
                    }`}
                  >
                    <span
                      className={`text-sm font-bold ${medio === m ? "text-[#f0552f]" : "text-[#212226]/70"}`}
                    >
                      {t(`medio.${m}`)}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── STEP 5: Resultado ────────────────────── */}
          {step === 5 && (
            <motion.div key="s5" {...motionProps}>
              <div className="text-center py-8">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#212226]/40 mb-2">
                  {t("tarifaMensual")}
                </p>

                {grupo === "gimnasios" && resultado !== null && (
                  <div className="max-w-md mx-auto mb-6 text-left border border-[#212226]/10 rounded-lg overflow-hidden">
                    {gimnasioServicios.map((s, i) => (
                      <div key={i} className="flex justify-between items-center px-4 py-2 border-b border-[#212226]/5 text-xs text-[#212226]/60">
                        <span>{s.tipo}</span>
                        <span className="font-bold">{fmt(s.tarifa)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center px-4 py-2 border-b border-[#212226]/5 text-xs text-[#212226]/60">
                      <span>{tipoLocal || t("gimnasio.servicioActual")}</span>
                      <span className="font-bold">{fmt(resultado)}</span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-3 bg-[#212226]/5 text-xs font-black text-[#212226]/70">
                      <span>{t("gimnasio.totalFinal")}</span>
                      <span>{fmt(gimnasioTotal)}</span>
                    </div>
                  </div>
                )}

                <p className="font-display font-black text-[#f0552f] text-5xl lg:text-6xl mb-4">
                  {fmt(grupo === "gimnasios" ? gimnasioTotal : (resultado ?? 0))}
                </p>
                <p className="text-sm text-[#212226]/45 max-w-md mx-auto mb-8 leading-relaxed">
                  {t("disclaimer")}
                </p>
                {grupo === "gimnasios" && (
                  <p className="text-xs text-[#212226]/50 max-w-md mx-auto mb-6 leading-relaxed">
                    {t("gimnasio.agregarAviso")}
                  </p>
                )}
                {grupo === "gastronomia" && turnos.includes("noche") && (
                  <div className="border border-[#212226]/15 rounded-lg px-6 py-5 max-w-sm mx-auto mb-6 text-left">
                    <p className="text-xs font-black uppercase tracking-wider text-[#212226]/60 mb-2">
                      {t("gastronomia.baileTitle")}
                    </p>
                    <p className="text-xs text-[#212226]/55 leading-relaxed mb-3">
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
                      {t("gastronomia.baileBtn")}
                    </button>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  {grupo === "gimnasios" && (
                    <button
                      onClick={() => {
                        setGimnasioServicios(prev => [...prev, { tipo: tipoLocal, tarifa: resultado ?? 0 }]);
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
                      className="inline-flex items-center justify-center gap-2 border border-[#f0552f] text-[#f0552f] hover:bg-[#f0552f] hover:text-white text-xs font-black uppercase tracking-[0.15em] px-7 py-4 transition-colors duration-300"
                    >
                      + {t("gimnasio.agregarServicio")}
                    </button>
                  )}
                  <button
                    onClick={handleReset}
                    className="inline-flex items-center justify-center gap-2 bg-[#212226] hover:bg-[#f0552f] text-white text-xs font-black uppercase tracking-[0.15em] px-7 py-4 transition-colors duration-300"
                  >
                    <ArrowPathIcon className="w-4 h-4" />
                    {t("reiniciar")}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
            </AnimatePresence>

            {/* ── Navigation ─────────────────────────────── */}
            {step < 5 && (
              <div className="flex items-center justify-between mt-10 pt-6 border-t border-[#212226]/10">
                {step > 1 ? (
                  <button
                    onClick={handleBack}
                    className="inline-flex items-center gap-2 text-xs font-bold text-[#212226]/50 hover:text-[#212226] transition-colors"
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
                  className="inline-flex items-center gap-2 bg-[#212226] hover:bg-[#f0552f] disabled:opacity-30 disabled:hover:bg-[#212226] text-white text-xs font-black uppercase tracking-[0.15em] px-7 py-4 transition-colors duration-300"
                >
                  {loading ? (
                    "Calculando..."
                  ) : step === totalSteps ? (
                    <>{t("calcular")}</>
                  ) : (
                    <>
                      {t("siguiente")}
                      <ArrowRightIcon className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </section>

        <aside className="border-t xl:border-t-0 xl:border-l border-[#212226]/10 bg-[#f5f2ec]/70 px-6 lg:px-8 py-8 xl:sticky xl:top-0 xl:self-start">
          <div className="space-y-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#212226]/40 mb-2">
                {t("summary.title")}
              </p>
              <p className="font-display font-black text-[#f0552f] text-4xl lg:text-5xl leading-none">
                {tieneTarifaVisible ? fmt(tarifaVisible) : "—"}
              </p>
              <p className="text-xs text-[#212226]/45 mt-3 leading-relaxed">
                {tieneTarifaVisible ? t("tarifaMensual") : t("summary.empty")}
              </p>
            </div>

            <div className="divide-y divide-[#212226]/10 border-y border-[#212226]/10">
              <SummaryRow label={t("summary.rubro")} value={grupo ? t(`grupos.${grupo}`) : t("summary.pending")} />
              <SummaryRow label={t("summary.tipo")} value={tipoLocal || t("summary.pending")} />
              <SummaryRow label={t("summary.datos")} value={datosLocal || t("summary.pending")} />
              {grupo && needsHorario && (
                <SummaryRow
                  label={t("summary.horario")}
                  value={dias.length > 0 ? `${dias.length} ${t("summary.diasSeleccionados")}` : t("summary.pending")}
                />
              )}
              {grupo && needsMedio && (
                <SummaryRow label={t("summary.medio")} value={t(`medio.${medio}`)} />
              )}
            </div>

            {grupo === "gimnasios" && gimnasioServicios.length > 0 && (
              <div className="border border-[#212226]/10 bg-white/55">
                <div className="px-4 py-3 border-b border-[#212226]/10">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#212226]/45">
                    {t("gimnasio.subtotal")}
                  </p>
                </div>
                {gimnasioServicios.map((servicio, index) => (
                  <div key={`${servicio.tipo}-${index}`} className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[#212226]/5 text-xs">
                    <span className="font-bold text-[#212226]/65">{servicio.tipo}</span>
                    <span className="font-black text-[#212226]">{fmt(servicio.tarifa)}</span>
                  </div>
                ))}
              </div>
            )}

            {avisoContextual && (
              <div className="border-l-4 border-[#f0552f] bg-white/65 px-4 py-4">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#f0552f] mb-2">
                  {t("summary.noticeTitle")}
                </p>
                <p className="text-xs text-[#212226]/60 leading-relaxed">
                  {avisoContextual}
                </p>
              </div>
            )}

            <p className="text-[11px] text-[#212226]/40 leading-relaxed">
              {t("disclaimer")}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-3 flex items-start justify-between gap-4">
      <span className="text-[10px] font-black uppercase tracking-[0.14em] text-[#212226]/40">
        {label}
      </span>
      <span className="text-xs font-bold text-[#212226]/70 text-right leading-relaxed">
        {value}
      </span>
    </div>
  );
}

function InputField({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="block text-[10px] font-black uppercase tracking-wider text-[#212226]/50 mb-2">
        {label}
      </label>
      <input
        type="number"
        min={0}
        value={value || ""}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        placeholder={placeholder}
        className="w-full bg-transparent border border-[#212226]/15 rounded-lg px-4 py-3 text-sm outline-none transition-colors focus:border-[#f0552f] placeholder:text-[#212226]/30"
      />
    </div>
  );
}
