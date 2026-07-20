"use client";

import { CheckIcon } from "@heroicons/react/24/outline";

/**
 * Indicador de progreso del asistente. Los pasos ya completados son botones:
 * permiten volver atrás sin apretar "Anterior" varias veces. Los pasos
 * siguientes no son navegables — saltearlos se saltearía las validaciones.
 */
export default function IndicadorPasos({
  labels,
  actual,
  onIr,
  volverA,
}: {
  labels: string[];
  /** Índice 0-based del paso actual */
  actual: number;
  /** Se llama solo con índices de pasos ya completados */
  onIr: (indice: number) => void;
  /** Texto accesible del botón, ej. "Volver a" */
  volverA: string;
}) {
  return (
    <ol className="mb-8 flex items-center">
      {labels.map((label, idx) => {
        const activo = actual === idx;
        const hecho = actual > idx;
        return (
          <li key={label} className="flex flex-1 items-center last:flex-none">
            {hecho ? (
              <button
                type="button"
                onClick={() => onIr(idx)}
                aria-label={`${volverA} ${label}`}
                className="group flex shrink-0 items-center gap-2 rounded-lg transition-opacity hover:opacity-70"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#212226] text-[11px] font-black text-white transition-colors group-hover:bg-[#f0552f]">
                  <CheckIcon className="h-3.5 w-3.5" />
                </span>
                <span className="hidden text-[11px] font-bold text-[#212226]/65 transition-colors group-hover:text-[#f0552f] sm:block">
                  {label}
                </span>
              </button>
            ) : (
              <div className="flex shrink-0 items-center gap-2">
                <span
                  aria-current={activo ? "step" : undefined}
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-black transition-all ${
                    activo
                      ? "bg-[#f0552f] text-white shadow-[0_0_0_3px_rgba(240,85,47,0.15)]"
                      : "bg-[#212226]/10 text-[#212226]/65"
                  }`}
                >
                  {idx + 1}
                </span>
                <span
                  className={`hidden text-[11px] font-bold transition-colors sm:block ${
                    // El paso pendiente es un estado inactivo: se mantiene más
                    // tenue que el activo, pero legible.
                    activo ? "text-[#212226]" : "text-[#212226]/55"
                  }`}
                >
                  {label}
                </span>
              </div>
            )}
            {idx < labels.length - 1 && (
              <div
                className={`mx-3 h-px flex-1 transition-colors ${
                  actual > idx ? "bg-[#212226]/30" : "bg-[#212226]/8"
                }`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
