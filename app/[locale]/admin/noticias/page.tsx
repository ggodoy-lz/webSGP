"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { motion } from "framer-motion";
import {
  ArrowLeftIcon,
  ArrowTopRightOnSquareIcon,
  ArrowUturnLeftIcon,
  CheckCircleIcon,
  Cog6ToothIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  NewspaperIcon,
  PlusIcon,
  PhotoIcon,
  TrashIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";
import { prepararImagen } from "@/lib/redimensionar";
import {
  CATEGORIAS,
  colorCategoria,
  formatearFecha,
  generarSlug,
  ordenarPorFecha,
  type CategoriaNoticia,
  type NewsArticle,
} from "@/lib/news-data";

type Estado = "idle" | "guardando" | "guardado" | "error";

const hoy = () => new Date().toISOString().slice(0, 10);

function noticiaVacia(): NewsArticle {
  return {
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `n-${Date.now()}`,
    slug: "",
    category: "SGP",
    estado: "borrador",
    fecha: hoy(),
    imagen: "",
    titleEs: "",
    titleEn: "",
    excerptEs: "",
    excerptEn: "",
    contentEs: "",
    contentEn: "",
  };
}

const inputCls =
  "w-full bg-[#feffff] border border-[#212226]/12 rounded-lg px-4 py-3 text-sm text-[#212226] outline-none transition-colors focus:border-[#f0552f] focus:ring-1 focus:ring-[#f0552f]/20";
const labelCls =
  "block text-[10px] font-black uppercase tracking-[0.12em] text-[#212226]/45 mb-2";

export default function AdminNoticiasPage() {
  const locale = useLocale();

  const [password, setPassword] = useState("");
  const [autenticado, setAutenticado] = useState(false);
  const [errorLogin, setErrorLogin] = useState("");

  const [noticias, setNoticias] = useState<NewsArticle[]>([]);
  const [almacenamiento, setAlmacenamiento] = useState("");
  const [persistente, setPersistente] = useState(true);

  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [sucio, setSucio] = useState(false);
  const [estado, setEstado] = useState<Estado>("idle");
  const [mensajeError, setMensajeError] = useState("");

  const editando = useMemo(
    () => noticias.find((n) => n.id === editandoId) ?? null,
    [noticias, editandoId],
  );

  const publicadas = noticias.filter((n) => n.estado === "publicado").length;

  /* ------------------------------------------------------------------ */
  /* Datos                                                               */
  /* ------------------------------------------------------------------ */

  const ingresar = useCallback(async (pw: string) => {
    setErrorLogin("");
    try {
      const res = await fetch("/api/admin/noticias", { headers: { "x-admin-password": pw } });
      if (!res.ok) {
        setErrorLogin(res.status === 401 ? "Contraseña incorrecta" : "No se pudo cargar el panel");
        return;
      }
      const data = await res.json();
      setNoticias(ordenarPorFecha(data.noticias ?? []));
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
      const res = await fetch("/api/admin/noticias", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-admin-password": password },
        body: JSON.stringify({ noticias }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setMensajeError(data.error ?? "No se pudo guardar");
        setEstado("error");
        return;
      }
      const data = await res.json();
      // El servidor devuelve la lista ya normalizada (slugs únicos, fechas
      // válidas), así que se adopta esa versión en vez de la local.
      setNoticias(ordenarPorFecha(data.noticias ?? noticias));
      setSucio(false);
      setEstado("guardado");
    } catch {
      setMensajeError("Error de conexión");
      setEstado("error");
    }
  }, [noticias, password]);

  useEffect(() => {
    if (estado !== "guardado") return;
    const t = setTimeout(() => setEstado("idle"), 2500);
    return () => clearTimeout(t);
  }, [estado]);

  // Avisa si se intenta cerrar la pestaña con cambios sin guardar.
  useEffect(() => {
    if (!sucio) return;
    const aviso = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", aviso);
    return () => window.removeEventListener("beforeunload", aviso);
  }, [sucio]);

  /* ------------------------------------------------------------------ */
  /* Edición                                                             */
  /* ------------------------------------------------------------------ */

  const actualizar = useCallback((id: string, cambios: Partial<NewsArticle>) => {
    setNoticias((prev) => prev.map((n) => (n.id === id ? { ...n, ...cambios } : n)));
    setSucio(true);
  }, []);

  /**
   * Al cambiar el título en español se recalcula el slug, salvo que ya lo hayan
   * escrito a mano: no queremos pisar una URL elegida a propósito.
   */
  const cambiarTitulo = useCallback(
    (n: NewsArticle, titleEs: string) => {
      const eraAutomatico = !n.slug || n.slug === generarSlug(n.titleEs);
      actualizar(n.id, eraAutomatico ? { titleEs, slug: generarSlug(titleEs) } : { titleEs });
    },
    [actualizar],
  );

  const crear = useCallback(() => {
    const nueva = noticiaVacia();
    setNoticias((prev) => [nueva, ...prev]);
    setEditandoId(nueva.id);
    setSucio(true);
  }, []);

  const eliminar = useCallback((n: NewsArticle) => {
    const nombre = n.titleEs || n.titleEn || "esta noticia";
    if (!window.confirm(`¿Eliminar "${nombre}"? No se puede deshacer una vez que guardes.`)) return;
    setNoticias((prev) => prev.filter((x) => x.id !== n.id));
    setEditandoId(null);
    setSucio(true);
  }, []);

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
                Panel · Noticias
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
        {/* Sidebar */}
        <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-[#212226] text-white">
          <div className="p-6 border-b border-white/10">
            <p className="font-display font-black text-3xl tracking-tighter">SGP</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/35 mt-1">
              Admin noticias
            </p>
          </div>
          <nav className="flex-1 p-3 space-y-1">
            <span className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-xs font-bold uppercase tracking-wider bg-[#f0552f] text-white">
              <NewspaperIcon className="w-5 h-5 shrink-0 opacity-80" />
              <span className="flex-1">Noticias</span>
              <span className="text-[9px] font-black normal-case tracking-normal px-1.5 py-0.5 rounded bg-black/20">
                {noticias.length}
              </span>
            </span>
            <Link
              href={`/${locale}/admin/galardones`}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-xs font-bold uppercase tracking-wider text-white/70 hover:bg-white/5 hover:text-white transition-all"
            >
              <TrophyIcon className="w-5 h-5 shrink-0 opacity-80" />
              <span className="flex-1">Premios</span>
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
              href={`/${locale}/noticias`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 text-[10px] font-black uppercase tracking-wider text-[#f2e2c4] border border-white/20 hover:border-[#f0552f] hover:text-[#f0552f] transition-colors"
            >
              Ver noticias públicas
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

        {/* Main */}
        <main className="flex-1 flex flex-col min-w-0">
          <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#212226] text-white">
            <span className="font-display font-black text-xl">SGP · Noticias</span>
            <button
              type="button"
              onClick={() => setAutenticado(false)}
              className="text-[10px] font-black uppercase tracking-wider text-white/50"
            >
              Salir
            </button>
          </header>

          {/* Barra de guardado */}
          <div className="sticky top-0 z-20 flex items-center justify-between gap-4 px-6 py-3 bg-[#feffff] border-b border-[#212226]/10">
            <p className="text-xs text-[#212226]/50 min-w-0 truncate">
              {publicadas} publicada{publicadas === 1 ? "" : "s"} de {noticias.length}
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
            <div className="max-w-4xl mx-auto px-6 py-10">
              {!persistente && (
                <div className="flex gap-3 bg-[#f2b33d]/15 border-l-4 border-[#f2b33d] p-4 mb-8">
                  <ExclamationTriangleIcon className="w-5 h-5 text-[#a97b12] shrink-0 mt-0.5" />
                  <div className="text-sm text-[#212226]/75">
                    <p className="font-bold text-[#212226] mb-1">Los cambios no van a sobrevivir al próximo deploy</p>
                    <p>
                      Se está guardando en <code className="text-xs bg-[#212226]/5 px-1">{almacenamiento}</code>.
                      Para que persista en producción hay que crear un store de Vercel Blob; recién ahí el
                      panel guarda de verdad.
                    </p>
                  </div>
                </div>
              )}

              {editando ? (
                <motion.div
                  key="editor"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  <Editor
                    noticia={editando}
                    locale={locale}
                    password={password}
                    onCambio={(cambios) => actualizar(editando.id, cambios)}
                    onTitulo={(v) => cambiarTitulo(editando, v)}
                    onVolver={() => setEditandoId(null)}
                    onEliminar={() => eliminar(editando)}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="listado"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f0552f] mb-2">
                        Contenido
                      </p>
                      <h2 className="font-display font-black text-[#212226] text-3xl lg:text-4xl">
                        Noticias
                      </h2>
                      <p className="text-sm text-[#212226]/50 mt-2 max-w-lg">
                        Lo que esté publicado se ve en la sección de noticias y en el carrusel de la
                        portada. Los borradores quedan solo acá.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={crear}
                      className="flex items-center justify-center gap-2 bg-[#f0552f] hover:bg-[#212226] text-white text-[10px] font-black uppercase tracking-[0.2em] px-5 py-3 transition-colors duration-300 shrink-0"
                    >
                      <PlusIcon className="w-4 h-4" />
                      Nueva noticia
                    </button>
                  </div>

                  {noticias.length === 0 ? (
                    <p className="text-sm text-[#212226]/45 bg-[#feffff] p-10 text-center">
                      Todavía no hay noticias cargadas.
                    </p>
                  ) : (
                    <ul className="bg-[#feffff] divide-y divide-[#212226]/8">
                      {noticias.map((n) => (
                        <li key={n.id}>
                          <button
                            type="button"
                            onClick={() => setEditandoId(n.id)}
                            className="group w-full text-left flex items-start gap-4 px-5 py-4 hover:bg-[#f2e2c4]/40 transition-colors"
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full shrink-0 mt-2"
                              style={{ backgroundColor: colorCategoria(n.category) }}
                            />
                            <span className="flex-1 min-w-0">
                              <span className="block font-display font-black text-[#212226] leading-tight group-hover:text-[#f0552f] transition-colors">
                                {n.titleEs || n.titleEn || "(sin título)"}
                              </span>
                              <span className="block text-[10px] uppercase tracking-widest text-[#212226]/35 mt-1">
                                {n.category} · {formatearFecha(n.fecha, "es")} ·{" "}
                                {/* El slug va en minúscula porque así es la URL real. */}
                                <span className="normal-case tracking-normal">
                                  /{n.slug || "sin-slug"}
                                </span>
                              </span>
                            </span>
                            <span
                              className={`shrink-0 flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-1 ${
                                n.estado === "publicado"
                                  ? "bg-[#2e7d4f]/12 text-[#2e7d4f]"
                                  : "bg-[#212226]/8 text-[#212226]/45"
                              }`}
                            >
                              {n.estado === "publicado" ? (
                                <EyeIcon className="w-3 h-3" />
                              ) : (
                                <EyeSlashIcon className="w-3 h-3" />
                              )}
                                {n.estado}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </motion.div>
                )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function Editor({
  noticia,
  locale,
  password,
  onCambio,
  onTitulo,
  onVolver,
  onEliminar,
}: {
  noticia: NewsArticle;
  locale: string;
  password: string;
  onCambio: (cambios: Partial<NewsArticle>) => void;
  onTitulo: (valor: string) => void;
  onVolver: () => void;
  onEliminar: () => void;
}) {
  const publicada = noticia.estado === "publicado";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onVolver}
          className="group inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#212226]/45 hover:text-[#f0552f] transition-colors"
        >
          <ArrowUturnLeftIcon className="w-3.5 h-3.5" />
          Volver al listado
        </button>
        <div className="flex items-center gap-3">
          {publicada && noticia.slug && (
            <Link
              href={`/${locale}/noticias/${noticia.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#212226]/45 hover:text-[#f0552f] transition-colors"
            >
              Ver en el sitio
              <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
            </Link>
          )}
          <button
            type="button"
            onClick={onEliminar}
            className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#212226]/45 hover:text-[#f0552f] transition-colors"
          >
            <TrashIcon className="w-3.5 h-3.5" />
            Eliminar
          </button>
        </div>
      </div>

      {/* Publicación */}
      <section className="bg-[#feffff] border-l-4 border-[#f0552f] p-6 lg:p-8 shadow-sm space-y-6">
        <h3 className="font-display font-black text-[#212226] text-lg">Publicación</h3>

        <div className="flex flex-wrap gap-2">
          {(["publicado", "borrador"] as const).map((valor) => (
            <button
              key={valor}
              type="button"
              onClick={() => onCambio({ estado: valor })}
              className={`flex items-center gap-2 px-4 py-2.5 text-[10px] font-black uppercase tracking-wider transition-colors ${
                noticia.estado === valor
                  ? "bg-[#212226] text-white"
                  : "bg-[#212226]/6 text-[#212226]/55 hover:bg-[#212226]/12"
              }`}
            >
              {valor === "publicado" ? <EyeIcon className="w-4 h-4" /> : <EyeSlashIcon className="w-4 h-4" />}
              {valor}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={labelCls} htmlFor="fecha">Fecha</label>
            <input
              id="fecha"
              type="date"
              value={noticia.fecha}
              onChange={(e) => onCambio({ fecha: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="categoria">Categoría</label>
            <select
              id="categoria"
              value={noticia.category}
              onChange={(e) => onCambio({ category: e.target.value as CategoriaNoticia })}
              className={inputCls}
            >
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={labelCls} htmlFor="slug">Dirección de la nota</label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#212226]/35 shrink-0">/noticias/</span>
            <input
              id="slug"
              type="text"
              value={noticia.slug}
              onChange={(e) => onCambio({ slug: generarSlug(e.target.value) })}
              placeholder="se-genera-del-titulo"
              className={inputCls}
            />
          </div>
          <p className="text-xs text-[#212226]/40 mt-2">
            Se completa sola con el título. Si ya compartiste el enlace de una nota publicada,
            cambiarlo hace que el anterior deje de funcionar.
          </p>
        </div>
      </section>

      {/* Portada */}
      <section className="bg-[#feffff] border-l-4 border-[#212226]/20 p-6 lg:p-8 shadow-sm">
        <div className="mb-5">
          <h3 className="font-display font-black text-[#212226] text-lg">Imagen de portada</h3>
          <p className="text-xs text-[#212226]/45 mt-1">
            Se muestra en el carrusel de la portada del sitio y arriba de la nota. Sin imagen, la
            tarjeta queda solo con texto. Se recomienda una foto horizontal.
          </p>
        </div>
        <CargaDeImagen
          url={noticia.imagen}
          password={password}
          onCambio={(imagen) => onCambio({ imagen })}
        />
      </section>

      {/* Español */}
      <section className="bg-[#feffff] border-l-4 border-[#4666a6] p-6 lg:p-8 shadow-sm space-y-5">
        <h3 className="font-display font-black text-[#212226] text-lg">Español</h3>
        <div>
          <label className={labelCls} htmlFor="titleEs">Título</label>
          <input
            id="titleEs"
            type="text"
            value={noticia.titleEs}
            onChange={(e) => onTitulo(e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="excerptEs">Bajada</label>
          <textarea
            id="excerptEs"
            rows={3}
            value={noticia.excerptEs}
            onChange={(e) => onCambio({ excerptEs: e.target.value })}
            placeholder="Resumen corto que aparece en el listado y en la portada."
            className={inputCls + " resize-y"}
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="contentEs">Cuerpo</label>
          <textarea
            id="contentEs"
            rows={14}
            value={noticia.contentEs}
            onChange={(e) => onCambio({ contentEs: e.target.value })}
            placeholder="Un párrafo por línea."
            className={inputCls + " resize-y leading-relaxed"}
          />
          <p className="text-xs text-[#212226]/40 mt-2">Cada línea en blanco separa un párrafo.</p>
        </div>
      </section>

      {/* Inglés */}
      <section className="bg-[#feffff] border-l-4 border-[#f2b33d] p-6 lg:p-8 shadow-sm space-y-5">
        <div>
          <h3 className="font-display font-black text-[#212226] text-lg">English</h3>
          <p className="text-xs text-[#212226]/45 mt-1">
            Si se deja vacío, la versión en inglés del sitio muestra el texto en español.
          </p>
        </div>
        <div>
          <label className={labelCls} htmlFor="titleEn">Title</label>
          <input
            id="titleEn"
            type="text"
            value={noticia.titleEn}
            onChange={(e) => onCambio({ titleEn: e.target.value })}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="excerptEn">Summary</label>
          <textarea
            id="excerptEn"
            rows={3}
            value={noticia.excerptEn}
            onChange={(e) => onCambio({ excerptEn: e.target.value })}
            className={inputCls + " resize-y"}
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="contentEn">Body</label>
          <textarea
            id="contentEn"
            rows={14}
            value={noticia.contentEn}
            onChange={(e) => onCambio({ contentEn: e.target.value })}
            className={inputCls + " resize-y leading-relaxed"}
          />
        </div>
      </section>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * Subida de la portada. La imagen se reduce y se convierte a WebP en el
 * navegador antes de viajar, así lo que se sube pesa alrededor de 100 KB
 * aunque la original venga de una cámara.
 */
function CargaDeImagen({
  url,
  password,
  onCambio,
}: {
  url: string;
  password: string;
  onCambio: (url: string) => void;
}) {
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState("");

  const seleccionar = async (archivo: File | undefined) => {
    if (!archivo) return;
    setError("");
    setSubiendo(true);

    try {
      const { blob } = await prepararImagen(archivo);

      const cuerpo = new FormData();
      cuerpo.append("imagen", blob, "portada.webp");

      const res = await fetch("/api/admin/noticias/imagen", {
        method: "POST",
        headers: { "x-admin-password": password },
        body: cuerpo,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "No se pudo subir la imagen");
        return;
      }

      // La anterior deja de usarse: se borra para no acumular archivos sueltos.
      if (url) quitarDelServidor(url, password);
      onCambio(data.url);
    } catch {
      setError("No se pudo procesar la imagen");
    } finally {
      setSubiendo(false);
    }
  };

  const quitar = () => {
    if (url) quitarDelServidor(url, password);
    onCambio("");
  };

  return (
    <div>
      {url && (
        // eslint-disable-next-line @next/next/no-img-element -- vista previa del panel
        <img
          src={url}
          alt=""
          className="w-full max-w-md aspect-video object-cover bg-[#212226]/5 mb-4"
        />
      )}

      <div className="flex flex-wrap items-center gap-3">
        <label
          className={`inline-flex items-center gap-2 px-4 py-2.5 text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer ${
            subiendo
              ? "bg-[#212226]/10 text-[#212226]/40 cursor-wait"
              : "bg-[#212226]/8 text-[#212226]/70 hover:bg-[#212226]/14"
          }`}
        >
          <PhotoIcon className="w-4 h-4" />
          {subiendo ? "Subiendo…" : url ? "Cambiar imagen" : "Subir imagen"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={subiendo}
            onChange={(e) => {
              seleccionar(e.target.files?.[0]);
              // Permite volver a elegir el mismo archivo después de quitarlo.
              e.target.value = "";
            }}
            className="hidden"
          />
        </label>

        {url && !subiendo && (
          <button
            type="button"
            onClick={quitar}
            className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#212226]/45 hover:text-[#f0552f] transition-colors"
          >
            <TrashIcon className="w-3.5 h-3.5" />
            Quitar
          </button>
        )}
      </div>

      {error && (
        <p className="flex items-center gap-2 text-xs text-[#f0552f] mt-3">
          <ExclamationTriangleIcon className="w-4 h-4 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Borra el archivo del servidor. No se espera el resultado ni se corta el flujo
 * si falla: que quede un archivo huérfano no debería impedir editar la nota.
 */
function quitarDelServidor(url: string, password: string) {
  fetch(`/api/admin/noticias/imagen?url=${encodeURIComponent(url)}`, {
    method: "DELETE",
    headers: { "x-admin-password": password },
  }).catch(() => {});
}
