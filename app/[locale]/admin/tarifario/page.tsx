"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cog6ToothIcon,
  TableCellsIcon,
  ClockIcon,
  AcademicCapIcon,
  ArrowLeftIcon,
  ArrowTopRightOnSquareIcon,
  LockClosedIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

interface Config {
  uda: number;
  incidencias: { secundaria: number; necesaria: number; indispensable: number };
  categoriaDefault: number;
  medios: { parlante: number; televisor: number };
  descuentoAforo: number;
}

const DEFAULT_CONFIG: Config = {
  uda: 39200,
  incidencias: { secundaria: 0.33, necesaria: 0.60, indispensable: 1.00 },
  categoriaDefault: 0.24,
  medios: { parlante: 0.15, televisor: 0.12 },
  descuentoAforo: 0.60,
};

type AdminSection = "general" | "tabla" | "turnos" | "academias";

const sidebarItems: { id: AdminSection; label: string; icon: typeof Cog6ToothIcon; ready: boolean }[] = [
  { id: "general", label: "Parámetros generales", icon: Cog6ToothIcon, ready: true },
  { id: "tabla", label: "Tabla de aforo (m²)", icon: TableCellsIcon, ready: false },
  { id: "turnos", label: "Horas por turno", icon: ClockIcon, ready: false },
  { id: "academias", label: "Academias de danza", icon: AcademicCapIcon, ready: false },
];

export default function AdminTarifarioPage() {
  const locale = useLocale();
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [section, setSection] = useState<AdminSection>("general");
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const fetchConfig = async (pw: string) => {
    try {
      const res = await fetch("/api/admin/tarifario", {
        headers: { "x-admin-password": pw },
      });
      if (res.ok) {
        const data = await res.json();
        setConfig({ ...DEFAULT_CONFIG, ...data });
        setAuthenticated(true);
      } else {
        alert("Contraseña incorrecta");
      }
    } catch {
      alert("Error de conexión");
    }
  };

  const handleSave = async () => {
    setStatus("saving");
    try {
      const res = await fetch("/api/admin/tarifario", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify(config),
      });
      setStatus(res.ok ? "saved" : "error");
    } catch {
      setStatus("error");
    }
  };

  useEffect(() => {
    if (status === "saved") {
      const t = setTimeout(() => setStatus("idle"), 2500);
      return () => clearTimeout(t);
    }
  }, [status]);

  const inputCls =
    "w-full bg-[#feffff] border border-[#212226]/12 rounded-lg px-4 py-3 text-sm text-[#212226] outline-none transition-colors focus:border-[#f0552f] focus:ring-1 focus:ring-[#f0552f]/20";
  const labelCls =
    "block text-[10px] font-black uppercase tracking-[0.12em] text-[#212226]/45 mb-2";

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#f2e2c4] flex flex-col">
        <div className="h-1 bg-[#f0552f] shrink-0" />
        <div className="flex-1 flex items-center justify-center px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="w-full max-w-md"
          >
            <div className="text-center mb-10">
              <p className="font-display font-black text-5xl text-[#212226] tracking-tighter mb-2">
                SGP
              </p>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#212226]/40">
                Panel · Tarifario web
              </p>
            </div>
            <div className="bg-[#feffff] border-t-4 border-[#212226] shadow-[0_20px_50px_-12px_rgba(33,34,38,0.15)] p-8 lg:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-lg bg-[#f0552f]/10 flex items-center justify-center">
                  <LockClosedIcon className="w-5 h-5 text-[#f0552f]" />
                </div>
                <div>
                  <h1 className="font-display font-black text-[#212226] text-xl">
                    Acceso restringido
                  </h1>
                  <p className="text-xs text-[#212226]/45 mt-0.5">
                    Solo personal autorizado de SGP
                  </p>
                </div>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchConfig(password)}
                placeholder="Contraseña de administrador"
                className={inputCls + " mb-4"}
              />
              <button
                type="button"
                onClick={() => fetchConfig(password)}
                className="w-full bg-[#212226] hover:bg-[#f0552f] text-white text-xs font-black uppercase tracking-[0.2em] py-4 transition-colors duration-300"
              >
                Ingresar
              </button>
            </div>
            <div className="text-center mt-8">
              <Link
                href={`/${locale}`}
                className="inline-flex items-center gap-2 text-xs font-bold text-[#212226]/50 hover:text-[#f0552f] transition-colors"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                Volver al sitio público
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f2e2c4]">
      <div className="h-1 bg-[#f0552f] shrink-0" />

      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-[#212226] text-white">
          <div className="p-6 border-b border-white/10">
            <p className="font-display font-black text-3xl tracking-tighter">SGP</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/35 mt-1">
              Admin tarifario
            </p>
          </div>
          <nav className="flex-1 p-3 space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const active = section === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={!item.ready}
                  onClick={() => item.ready && setSection(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-xs font-bold uppercase tracking-wider transition-all ${
                    active
                      ? "bg-[#f0552f] text-white"
                      : item.ready
                        ? "text-white/70 hover:bg-white/5 hover:text-white"
                        : "text-white/25 cursor-not-allowed"
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0 opacity-80" />
                  <span className="flex-1">{item.label}</span>
                  {!item.ready && (
                    <span className="text-[9px] font-black normal-case tracking-normal px-1.5 py-0.5 rounded bg-white/10 text-white/40">
                      Pronto
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
          <div className="p-4 border-t border-white/10 space-y-2">
            <Link
              href={`/${locale}/tarifario`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 text-[10px] font-black uppercase tracking-wider text-[#f2e2c4] border border-white/20 hover:border-[#f0552f] hover:text-[#f0552f] transition-colors"
            >
              Ver calculadora pública
              <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
            </Link>
            <button
              type="button"
              onClick={() => setAuthenticated(false)}
              className="w-full py-2.5 text-[10px] font-black uppercase tracking-wider text-white/40 hover:text-white transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Mobile top bar */}
          <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#212226] text-white">
            <span className="font-display font-black text-xl">SGP</span>
            <button
              type="button"
              onClick={() => setAuthenticated(false)}
              className="text-[10px] font-black uppercase tracking-wider text-white/50"
            >
              Salir
            </button>
          </header>

          <div className="lg:hidden border-b border-[#212226]/10 bg-[#feffff] px-2 py-2 flex gap-1 overflow-x-auto">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                type="button"
                disabled={!item.ready}
                onClick={() => item.ready && setSection(item.id)}
                className={`shrink-0 px-3 py-2 text-[10px] font-black uppercase tracking-wider rounded ${
                  section === item.id
                    ? "bg-[#212226] text-white"
                    : item.ready
                      ? "bg-[#212226]/5 text-[#212226]/60"
                      : "opacity-40"
                }`}
              >
                {item.id === "general" ? "General" : item.label.split(" ")[0]}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto px-6 py-10 lg:py-12">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f0552f] mb-2">
                    Configuración
                  </p>
                  <h2 className="font-display font-black text-[#212226] text-3xl lg:text-4xl">
                    Motor de tarifas
                  </h2>
                  <p className="text-sm text-[#212226]/50 mt-2 max-w-lg">
                    Valores que alimentan la calculadora pública. Los cambios se guardan en{" "}
                    <code className="text-xs bg-[#212226]/5 px-1">data/tarifario.json</code> en el servidor.
                  </p>
                </div>
                <div className="hidden sm:block text-right">
                  <p className="text-[10px] font-black uppercase tracking-wider text-[#212226]/35">
                    UDA vigente (vista rápida)
                  </p>
                  <p className="font-display font-black text-2xl text-[#f0552f]">
                    Gs. {config.uda.toLocaleString("es-PY")}
                  </p>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {section === "general" && (
                  <motion.div
                    key="general"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-8"
                  >
                    <section className="bg-[#feffff] border-l-4 border-[#f0552f] p-6 lg:p-8 shadow-sm">
                      <h3 className="font-display font-black text-[#212226] text-lg mb-6">
                        Unidad de Derecho de Autor (UDA)
                      </h3>
                      <label className={labelCls}>Valor en guaraníes</label>
                      <input
                        type="number"
                        value={config.uda}
                        onChange={(e) =>
                          setConfig({ ...config, uda: Number(e.target.value) })
                        }
                        className={inputCls}
                      />
                    </section>

                    <section className="bg-[#feffff] border-l-4 border-[#4666a6] p-6 lg:p-8 shadow-sm">
                      <h3 className="font-display font-black text-[#212226] text-lg mb-6">
                        Incidencia musical
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        {(["secundaria", "necesaria", "indispensable"] as const).map(
                          (key) => (
                            <div key={key}>
                              <label className={labelCls}>{key}</label>
                              <input
                                type="number"
                                step="0.01"
                                value={config.incidencias[key]}
                                onChange={(e) =>
                                  setConfig({
                                    ...config,
                                    incidencias: {
                                      ...config.incidencias,
                                      [key]: Number(e.target.value),
                                    },
                                  })
                                }
                                className={inputCls}
                              />
                            </div>
                          ),
                        )}
                      </div>
                    </section>

                    <section className="bg-[#feffff] border-l-4 border-[#f2b33d] p-6 lg:p-8 shadow-sm">
                      <h3 className="font-display font-black text-[#212226] text-lg mb-6">
                        Categoría e índices de uso
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className={labelCls}>Categoría por defecto</label>
                          <input
                            type="number"
                            step="0.01"
                            value={config.categoriaDefault}
                            onChange={(e) =>
                              setConfig({
                                ...config,
                                categoriaDefault: Number(e.target.value),
                              })
                            }
                            className={inputCls}
                          />
                        </div>
                        <div>
                          <label className={labelCls}>Descuento de aforo (0–1)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={config.descuentoAforo}
                            onChange={(e) =>
                              setConfig({
                                ...config,
                                descuentoAforo: Number(e.target.value),
                              })
                            }
                            className={inputCls}
                          />
                        </div>
                      </div>
                    </section>

                    <section className="bg-[#feffff] border-l-4 border-[#212226] p-6 lg:p-8 shadow-sm">
                      <h3 className="font-display font-black text-[#212226] text-lg mb-6">
                        Medio de ejecución
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className={labelCls}>Parlante</label>
                          <input
                            type="number"
                            step="0.01"
                            value={config.medios.parlante}
                            onChange={(e) =>
                              setConfig({
                                ...config,
                                medios: {
                                  ...config.medios,
                                  parlante: Number(e.target.value),
                                },
                              })
                            }
                            className={inputCls}
                          />
                        </div>
                        <div>
                          <label className={labelCls}>Televisor / pantalla</label>
                          <input
                            type="number"
                            step="0.01"
                            value={config.medios.televisor}
                            onChange={(e) =>
                              setConfig({
                                ...config,
                                medios: {
                                  ...config.medios,
                                  televisor: Number(e.target.value),
                                },
                              })
                            }
                            className={inputCls}
                          />
                        </div>
                      </div>
                    </section>

                    <div className="sticky bottom-0 left-0 right-0 flex flex-wrap items-center gap-4 py-4 bg-[#f2e2c4]/95 backdrop-blur-sm border-t border-[#212226]/10 -mx-6 px-6 lg:static lg:border-0 lg:bg-transparent lg:p-0">
                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={status === "saving"}
                        className="bg-[#212226] hover:bg-[#f0552f] disabled:opacity-50 text-white text-xs font-black uppercase tracking-[0.2em] px-8 py-4 transition-colors"
                      >
                        {status === "saving" ? "Guardando…" : "Guardar cambios"}
                      </button>
                      {status === "saved" && (
                        <span className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700">
                          <CheckCircleIcon className="w-5 h-5" />
                          Cambios guardados
                        </span>
                      )}
                      {status === "error" && (
                        <span className="inline-flex items-center gap-2 text-sm font-medium text-[#f0552f]">
                          <ExclamationTriangleIcon className="w-5 h-5" />
                          No se pudo guardar
                        </span>
                      )}
                    </div>
                  </motion.div>
                )}

                {section !== "general" && (
                  <motion.div
                    key="soon"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-[#feffff] border border-[#212226]/10 p-10 text-center"
                  >
                    <TableCellsIcon className="w-12 h-12 text-[#212226]/15 mx-auto mb-4" />
                    <h3 className="font-display font-black text-[#212226] text-xl mb-2">
                      Sección en desarrollo
                    </h3>
                    <p className="text-sm text-[#212226]/45 max-w-md mx-auto leading-relaxed">
                      La edición de tablas (aforo por m², turnos y academias) desde este panel se habilitará en la próxima iteración, alineada al reglamento de tarifas de SGP.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSection("general")}
                      className="mt-8 text-xs font-black uppercase tracking-wider text-[#f0552f] hover:underline"
                    >
                      Volver a parámetros generales
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-12 pt-8 border-t border-[#212226]/10">
                <Link
                  href={`/${locale}`}
                  className="inline-flex items-center gap-2 text-xs font-bold text-[#212226]/45 hover:text-[#f0552f] transition-colors"
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                  Volver al inicio del sitio
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
