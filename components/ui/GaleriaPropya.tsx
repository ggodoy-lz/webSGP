"use client";

/* eslint-disable @next/next/no-img-element --
   Las fotos ya se generaron en dos anchos y en WebP, y se sirven con srcset,
   que es justamente lo que aportaría next/image. Evitarlo ahorra el servicio de
   optimización de imágenes. */

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from "@heroicons/react/24/outline";

/**
 * Fotos de la ceremonia de los Propya Awards.
 *
 * Son nueve de las diecisiete que entregó SGP: se eligió una por tipo de
 * momento y se descartaron los encuadres repetidos. La restricción real no es
 * el peso —cada foto pesa entre 18 y 32 KB en el tamaño en que se muestra—
 * sino que una galería con tomas casi iguales se lee como relleno.
 */
const FOTOS = [
  "auditorio",
  "premiados",
  "artista-del-ano",
  "arpa",
  "trofeo",
  "performance",
  "alfombra-roja",
  "retrato",
  "publico",
] as const;

type Foto = (typeof FOTOS)[number];

const src = (foto: Foto, ancho: 640 | 1280) => `/img/propya/${foto}-${ancho}.webp`;

export default function GaleriaPropya() {
  const t = useTranslations("galardones.galeria");
  const [abierta, setAbierta] = useState<number | null>(null);

  const cerrar = useCallback(() => setAbierta(null), []);
  const mover = useCallback(
    (paso: number) =>
      setAbierta((i) => (i === null ? null : (i + paso + FOTOS.length) % FOTOS.length)),
    [],
  );

  // El listener va en `document` y no en el overlay: un div no recibe el
  // teclado a menos que tenga foco, así que ahí las teclas no llegarían.
  useEffect(() => {
    if (abierta === null) return;

    const alPresionar = (e: KeyboardEvent) => {
      if (e.key === "Escape") cerrar();
      if (e.key === "ArrowRight") mover(1);
      if (e.key === "ArrowLeft") mover(-1);
    };
    document.addEventListener("keydown", alPresionar);

    // Sin esto la página de atrás sigue scrolleando debajo del visor.
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", alPresionar);
      document.body.style.overflow = overflowPrevio;
    };
  }, [abierta, cerrar, mover]);

  return (
    <>
      <div className="mt-16">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-[3px] bg-white/70 shrink-0" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">
            {t("titulo")}
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-1.5">
          {FOTOS.map((foto, i) => (
            <button
              key={foto}
              type="button"
              onClick={() => setAbierta(i)}
              className="group relative block aspect-video overflow-hidden bg-[#212226] focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <img
                src={src(foto, 640)}
                srcSet={`${src(foto, 640)} 640w, ${src(foto, 1280)} 1280w`}
                sizes="(min-width: 1024px) 33vw, 50vw"
                alt={t(`fotos.${foto}`)}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute inset-0 bg-[#212226]/0 group-hover:bg-[#212226]/25 transition-colors" />
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {abierta !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[100] bg-[#212226]/95 flex items-center justify-center p-4 sm:p-8"
            onClick={cerrar}
            role="dialog"
            aria-modal="true"
            aria-label={t("titulo")}
          >
            <button
              type="button"
              onClick={cerrar}
              aria-label={t("cerrar")}
              className="absolute top-4 right-4 p-2 text-white/60 hover:text-white transition-colors"
            >
              <XMarkIcon className="w-7 h-7" />
            </button>

            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); mover(-1); }}
              aria-label={t("anterior")}
              className="absolute left-2 sm:left-6 p-2 text-white/60 hover:text-white transition-colors"
            >
              <ChevronLeftIcon className="w-8 h-8" />
            </button>

            <figure
              className="max-w-5xl w-full"
              // Un clic sobre la foto no debería cerrar el visor.
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={src(FOTOS[abierta], 1280)}
                alt={t(`fotos.${FOTOS[abierta]}`)}
                className="w-full h-auto max-h-[80vh] object-contain"
              />
              <figcaption className="text-center text-xs text-white/55 mt-4">
                {t(`fotos.${FOTOS[abierta]}`)}
                <span className="text-white/30"> · {abierta + 1}/{FOTOS.length}</span>
              </figcaption>
            </figure>

            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); mover(1); }}
              aria-label={t("siguiente")}
              className="absolute right-2 sm:right-6 p-2 text-white/60 hover:text-white transition-colors"
            >
              <ChevronRightIcon className="w-8 h-8" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
