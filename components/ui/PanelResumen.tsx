"use client";

import { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

export interface FilaResumen {
  label: string;
  value: string;
}

/**
 * Resumen lateral de una calculadora.
 *
 * En desktop es la columna derecha, siempre visible. En mobile pasa arriba del
 * formulario y se colapsa detrás de un botón: si quedara abajo (su posición en
 * el DOM) nadie lo vería mientras carga los datos, y desplegado siempre
 * empujaría el formulario fuera de pantalla.
 */
export default function PanelResumen({
  titulo,
  monto,
  montoLabel,
  vacio,
  filas,
  disclaimer,
  children,
}: {
  titulo: string;
  /** null → todavía no hay tarifa que mostrar */
  monto: number | null;
  montoLabel?: string;
  vacio: string;
  filas: FilaResumen[];
  disclaimer: string;
  /** Bloques extra (desglose acumulado, cotización, etc.) */
  children?: React.ReactNode;
}) {
  const [abierto, setAbierto] = useState(false);
  const fmt = (n: number) =>
    new Intl.NumberFormat("es-PY", {
      style: "currency",
      currency: "PYG",
      minimumFractionDigits: 0,
    }).format(n);

  return (
    <aside className="order-first border-b border-[#212226]/10 bg-white px-6 py-5 shadow-[-1px_0_0_0_rgba(33,34,38,0.07)] lg:order-none lg:self-stretch lg:border-b-0 lg:border-l lg:px-8 lg:py-10">
      {/* Encabezado: en mobile es el botón que despliega */}
      <button
        type="button"
        onClick={() => setAbierto(!abierto)}
        className="flex w-full items-center justify-between gap-4 text-left lg:pointer-events-none lg:mb-3"
      >
        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#212226]/65">
          {titulo}
        </span>
        <span className="flex items-center gap-2 lg:hidden">
          {monto !== null && (
            <span className="font-display text-lg font-black leading-none text-[#f0552f]">
              {fmt(monto)}
            </span>
          )}
          <ChevronDownIcon
            className={`h-4 w-4 shrink-0 text-[#212226]/65 transition-transform ${abierto ? "rotate-180" : ""}`}
          />
        </span>
      </button>

      <div className={`${abierto ? "block" : "hidden"} lg:block`}>
        <div className="space-y-5 pt-4 lg:pt-0">
          <div>
            <p className="font-display text-4xl font-black leading-none text-[#f0552f] lg:text-5xl">
              {monto !== null ? fmt(monto) : "—"}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-[#212226]/65">
              {monto !== null && montoLabel ? montoLabel : vacio}
            </p>
          </div>

          <div className="divide-y divide-[#212226]/6 border-y border-[#212226]/6">
            {filas.map((f) => (
              <div key={f.label} className="flex items-start justify-between gap-3 py-3">
                <span className="shrink-0 text-[11px] font-black uppercase tracking-[0.13em] text-[#212226]/65">
                  {f.label}
                </span>
                <span className="text-right text-xs font-bold leading-relaxed text-[#212226]/70">
                  {f.value}
                </span>
              </div>
            ))}
          </div>

          {children}

          <p className="text-xs leading-relaxed text-[#212226]/65">{disclaimer}</p>
        </div>
      </div>
    </aside>
  );
}
