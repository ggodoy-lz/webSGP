"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { motion } from "framer-motion";
import {
  ArrowLeftIcon,
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon,
  Cog6ToothIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  NewspaperIcon,
  PlusIcon,
  TrophyIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import {
  COLOR_NIVEL,
  UMBRALES,
  formatearStreams,
  nivelDe,
  type ContenidoGalardones,
  type Galardon,
} from "@/lib/galardones-data";

type Estado = "idle" | "guardando" | "guardado" | "error";

const VACIO: ContenidoGalardones = { galardones: [], categoriasPropya: [] };

function galardonVacio(): Galardon {
  return {
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `g-${Date.now()}`,
    artista: "",
    obra: "",
    streams: 0,
    publicado: false,
  };
}

const inputCls =
  "w-full bg-[#feffff] border border-[#212226]/12 rounded-lg px-4 py-3 text-sm text-[#212226] outline-none transition-colors focus:border-[#f0552f] focus:ring-1 focus:ring-[#f0552f]/20";
const labelCls =
  "block text-[10px] font-black uppercase tracking-[0.12em] text-[#212226]/45 mb-2";

export default function AdminGalardonesPage() {
  const locale = useLocale();

  const [password, setPassword] = useState("");
  const [autenticado, setAutenticado] = useState(false);
  const [errorLogin, setErrorLogin] = useState("");

  const [contenido, setContenido] = useState<ContenidoGalardones>(VACIO);
  const [almacenamiento, setAlmacenamiento] = useState("");
  const [persistente, setPersistente] = useState(true);

  const [sucio, setSucio] = useState(false);
  const [estado, setEstado] = useState<Estado>("idle");
  const [mensajeError, setMensajeError] = useState("");

  const { galardones, categoriasPropya } = contenido;
  const publicados = galardones.filter((g) => g.publicado && nivelDe(g.streams)).length;

  /* ------------------------------------------------------------------ */
  /* Datos                                                               */
  /* ------------------------------------------------------------------ */

  const ingresar = useCallback(async (pw: string) => {
    setErrorLogin("");
    try {
      const res = await fetch("/api/admin/galardones", { headers: { "x-admin-password": pw } });
      if (!res.ok) {
        setErrorLogin(res.status === 401 ? "Contraseña incorrecta" : "No se pudo cargar el panel");
        return;
      }
      const data = await res.json();
      setContenido(data.contenido ?? VACIO);
      setAlmacenamiento(data.almacenamiento ?? "");
      setPersistente(Boolean(data.persistente));
      setAutenticado(true);
      setSucio(false);
    } catch {
      setErrorLogin("Error de conexión");
    }
  }, []);

  const guardar = useCallback(async () => {
    setEstado("guardando");
    setMensajeError("");
    try {
      const res = await fetch("/api/admin/galardones", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-admin-password": password },
        body: JSON.stringify({ contenido }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setMensajeError(data.error ?? "No se pudo guardar");
        setEstado("error");
        return;
      }
      const data = await res.json();
      setContenido(data.contenido ?? contenido);
      setSucio(false);
      setEstado("guardado");
    } catch {
      setMensajeError("Error de conexión");
      setEstado("error");
    }
  }, [contenido, password]);

  useEffect(() => {
    if (estado !== "guardado") return;
    const t = setTimeout(() => setEstado("idle"), 2500);
    return () => clearTimeout(t);
  }, [estado]);

  useEffect(() => {
    if (!sucio) return;
    const aviso = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", aviso);
    return () => window.removeEventListener("beforeunload", aviso);
  }, [sucio]);

  /* ------------------------------------------------------------------ */
  /* Edición                                                             */
  /* ------------------------------------------------------------------ */

  const actualizar = useCallback((cambio: Partial<ContenidoGalardones>) => {
    setContenido((prev) => ({ ...prev, ...cambio }));
    setSucio(true);
  }, []);

  const actualizarGalardon = useCallback(
    (id: string, cambios: Partial<Galardon>) =>
      setContenido((prev) => {
        setSucio(true);
        return {
          ...prev,
          galardones: prev.galardones.map((g) => (g.id === id ? { ...g, ...cambios } : g)),
        };
      }),
    [],
  );

  /* ------------------------------------------------------------------ */
  /* Login                                                               */
  /* ------------------------------------------------------------------ */

  if (!autenticado) {
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
              <p className="font-display font-black text-5xl text-[#212226] tracking-tighter mb-2">SGP</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#212226]/40">
                Panel · Premios
              </p>
            </div>
            <div className="bg-[#feffff] border-t-4 border-[#212226] shadow-[0_20px_50px_-12px_rgba(33,34,38,0.15)] p-8 lg:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-lg bg-[#f0552f]/10 flex items-center justify-center">
                  <LockClosedIcon className="w-5 h-5 text-[#f0552f]" />
                </div>
                <div>
                  <h1 className="font-display font-black text-[#212226] text-xl">Acceso restringido</h1>
                  <p className="text-xs text-[#212226]/45 mt-0.5">Solo personal autorizado de SGP</p>
                </div>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && ingresar(password)}
                placeholder="Contraseña de administrador"
                className={inputCls + " mb-3"}
              />
              {errorLogin && (
                <p className="flex items-center gap-2 text-xs text-[#f0552f] mb-3">
                  <ExclamationTriangleIcon className="w-4 h-4 shrink-0" />
                  {errorLogin}
                </p>
              )}
              <button
                type="button"
                onClick={() => ingresar(password)}
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

  /* ------------------------------------------------------------------ */
  /* Panel                                                               */
  /* ------------------------------------------------------------------ */

  return (
    <div className="min-h-screen flex flex-col bg-[#f2e2c4]">
      <div className="h-1 bg-[#f0552f] shrink-0" />

      <div className="flex flex-1 min-h-0">
        <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-[#212226] text-white">
          <div className="p-6 border-b border-white/10">
            <p className="font-display font-black text-3xl tracking-tighter">SGP</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/35 mt-1">
              Admin premios
            </p>
          </div>
          <nav className="flex-1 p-3 space-y-1">
            <span className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-xs font-bold uppercase tracking-wider bg-[#f0552f] text-white">
              <TrophyIcon className="w-5 h-5 shrink-0 opacity-80" />
              <span className="flex-1">Premios</span>
              <span className="text-[9px] font-black normal-case tracking-normal px-1.5 py-0.5 rounded bg-black/20">
                {galardones.length}
              </span>
            </span>
            <Link
              href={`/${locale}/admin/noticias`}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-xs font-bold uppercase tracking-wider text-white/70 hover:bg-white/5 hover:text-white transition-all"
            >
              <NewspaperIcon className="w-5 h-5 shrink-0 opacity-80" />
              <span className="flex-1">Noticias</span>
            </Link>
            <Link
              href={`/${locale}/admin/tarifario`}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-xs font-bold uppercase tracking-wider text-white/70 hover:bg-white/5 hover:text-white transition-all"
            >
              <Cog6ToothIcon className="w-5 h-5 shrink-0 opacity-80" />
              <span className="flex-1">Tarifario</span>
            </Link>
          </nav>
          <div className="p-4 border-t border-white/10 space-y-2">
            <Link
              href={`/${locale}/galardones`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 text-[10px] font-black uppercase tracking-wider text-[#f2e2c4] border border-white/20 hover:border-[#f0552f] hover:text-[#f0552f] transition-colors"
            >
              Ver página pública
              <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
            </Link>
            <button
              type="button"
              onClick={() => setAutenticado(false)}
              className="w-full py-2.5 text-[10px] font-black uppercase tracking-wider text-white/40 hover:text-white transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        </aside>

        <main className="flex-1 flex flex-col min-w-0">
          <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#212226] text-white">
            <span className="font-display font-black text-xl">SGP · Premios</span>
            <button
              type="button"
              onClick={() => setAutenticado(false)}
              className="text-[10px] font-black uppercase tracking-wider text-white/50"
            >
              Salir
            </button>
          </header>

          <div className="sticky top-0 z-20 flex items-center justify-between gap-4 px-6 py-3 bg-[#feffff] border-b border-[#212226]/10">
            <p className="text-xs text-[#212226]/50 min-w-0 truncate">
              {publicados} en el sitio de {galardones.length}
              {sucio && <span className="text-[#f0552f] font-bold"> · cambios sin guardar</span>}
            </p>
            <div className="flex items-center gap-3 shrink-0">
              {estado === "guardado" && (
                <span className="flex items-center gap-1.5 text-xs font-bold text-[#2e7d4f]">
                  <CheckCircleIcon className="w-4 h-4" />
                  Guardado
                </span>
              )}
              {estado === "error" && (
                <span className="flex items-center gap-1.5 text-xs font-bold text-[#f0552f]">
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  {mensajeError}
                </span>
              )}
              <button
                type="button"
                onClick={guardar}
                disabled={estado === "guardando" || !sucio}
                className="bg-[#212226] hover:bg-[#f0552f] disabled:bg-[#212226]/20 disabled:cursor-not-allowed text-white text-[10px] font-black uppercase tracking-[0.2em] px-6 py-3 transition-colors duration-300"
              >
                {estado === "guardando" ? "Guardando…" : "Guardar cambios"}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-6 py-10 space-y-12">
              {!persistente && (
                <div className="flex gap-3 bg-[#f2b33d]/15 border-l-4 border-[#f2b33d] p-4">
                  <ExclamationTriangleIcon className="w-5 h-5 text-[#a97b12] shrink-0 mt-0.5" />
                  <div className="text-sm text-[#212226]/75">
                    <p className="font-bold text-[#212226] mb-1">Los cambios no van a sobrevivir al próximo deploy</p>
                    <p>
                      Se está guardando en <code className="text-xs bg-[#212226]/5 px-1">{almacenamiento}</code>.
                      Para que persista en producción hay que crear un store de Vercel Blob.
                    </p>
                  </div>
                </div>
              )}

              {/* Galardones de streaming */}
              <section>
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f0552f] mb-2">
                      Contenido
                    </p>
                    <h2 className="font-display font-black text-[#212226] text-3xl">
                      Galardones de streaming
                    </h2>
                    <p className="text-sm text-[#212226]/50 mt-2 max-w-lg">
                      El nivel se calcula solo a partir de las reproducciones, con los mismos
                      umbrales que muestra la página:{" "}
                      {UMBRALES.slice().reverse().map((u, i) => (
                        <span key={u.nivel}>
                          {i > 0 && ", "}
                          <b>{u.nivel}</b> desde {u.desde.toLocaleString("es-PY")}
                        </span>
                      ))}
                      .
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      actualizar({ galardones: [galardonVacio(), ...galardones] })
                    }
                    className="flex items-center justify-center gap-2 bg-[#f0552f] hover:bg-[#212226] text-white text-[10px] font-black uppercase tracking-[0.2em] px-5 py-3 transition-colors duration-300 shrink-0"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Agregar
                  </button>
                </div>

                {galardones.length === 0 ? (
                  <p className="text-sm text-[#212226]/45 bg-[#feffff] p-10 text-center">
                    Todavía no hay galardones cargados.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {galardones.map((g) => {
                      const nivel = nivelDe(g.streams);
                      return (
                        <li key={g.id} className="bg-[#feffff] p-4 sm:p-5">
                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:items-end">
                            <div className="sm:col-span-4">
                              <label className={labelCls}>Artista</label>
                              <input
                                type="text"
                                value={g.artista}
                                onChange={(e) => actualizarGalardon(g.id, { artista: e.target.value })}
                                className={inputCls}
                              />
                            </div>
                            <div className="sm:col-span-4">
                              <label className={labelCls}>Obra</label>
                              <input
                                type="text"
                                value={g.obra}
                                onChange={(e) => actualizarGalardon(g.id, { obra: e.target.value })}
                                className={inputCls}
                              />
                            </div>
                            <div className="sm:col-span-4">
                              <label className={labelCls}>Reproducciones</label>
                              <input
                                type="number"
                                min={0}
                                step={1000}
                                value={g.streams || ""}
                                onChange={(e) =>
                                  actualizarGalardon(g.id, { streams: Number(e.target.value) || 0 })
                                }
                                className={inputCls}
                              />
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-[#212226]/8">
                            {nivel ? (
                              <span
                                className="text-[10px] font-black uppercase tracking-wider px-2 py-1"
                                style={{ backgroundColor: COLOR_NIVEL[nivel] + "22", color: COLOR_NIVEL[nivel] }}
                              >
                                {nivel} · {formatearStreams(g.streams)}
                              </span>
                            ) : (
                              <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#a97b12]">
                                <ExclamationTriangleIcon className="w-3.5 h-3.5" />
                                No llega al mínimo de Oro
                              </span>
                            )}

                            <button
                              type="button"
                              disabled={!nivel}
                              onClick={() => actualizarGalardon(g.id, { publicado: !g.publicado })}
                              title={nivel ? undefined : "Necesita al menos el mínimo de Oro para publicarse"}
                              className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                                g.publicado
                                  ? "bg-[#2e7d4f]/12 text-[#2e7d4f]"
                                  : "bg-[#212226]/8 text-[#212226]/45 hover:bg-[#212226]/14"
                              }`}
                            >
                              {g.publicado ? <EyeIcon className="w-3.5 h-3.5" /> : <EyeSlashIcon className="w-3.5 h-3.5" />}
                              {g.publicado ? "En el sitio" : "Oculto"}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                const nombre = g.artista || g.obra || "este galardón";
                                if (!window.confirm(`¿Eliminar "${nombre}"?`)) return;
                                actualizar({ galardones: galardones.filter((x) => x.id !== g.id) });
                              }}
                              className="ml-auto inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#212226]/40 hover:text-[#f0552f] transition-colors"
                            >
                              <TrashIcon className="w-3.5 h-3.5" />
                              Eliminar
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>

              {/* Categorías de Propya */}
              <section>
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
                  <div>
                    <h2 className="font-display font-black text-[#212226] text-3xl">
                      Categorías de Propya
                    </h2>
                    <p className="text-sm text-[#212226]/50 mt-2 max-w-lg">
                      Se listan en la sección de Propya Awards, en el orden en que estén acá.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => actualizar({ categoriasPropya: [...categoriasPropya, ""] })}
                    className="flex items-center justify-center gap-2 bg-[#f0552f] hover:bg-[#212226] text-white text-[10px] font-black uppercase tracking-[0.2em] px-5 py-3 transition-colors duration-300 shrink-0"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Agregar
                  </button>
                </div>

                <ul className="bg-[#feffff] divide-y divide-[#212226]/8">
                  {categoriasPropya.map((cat, i) => (
                    <li key={i} className="flex items-center gap-3 px-4 py-3">
                      <span className="font-display font-black text-[#212226]/25 text-xs w-6 shrink-0">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <input
                        type="text"
                        value={cat}
                        onChange={(e) => {
                          const copia = [...categoriasPropya];
                          copia[i] = e.target.value;
                          actualizar({ categoriasPropya: copia });
                        }}
                        placeholder="Nombre de la categoría"
                        className={inputCls}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          actualizar({
                            categoriasPropya: categoriasPropya.filter((_, j) => j !== i),
                          })
                        }
                        aria-label={`Eliminar ${cat || "categoría"}`}
                        className="p-2 text-[#212226]/35 hover:text-[#f0552f] transition-colors shrink-0"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                  {categoriasPropya.length === 0 && (
                    <li className="px-4 py-10 text-center text-sm text-[#212226]/45">
                      Sin categorías cargadas.
                    </li>
                  )}
                </ul>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
