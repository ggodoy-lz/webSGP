"use client";

import { useState } from "react";
import {
  ArrowPathIcon,
  ChevronDownIcon,
  InformationCircleIcon,
  PhoneIcon,
  PrinterIcon,
  ShareIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";

export interface FilaResultado {
  label: string;
  value: string;
  /** Resalta la fila (ej. el valor que definió el total) */
  destacado?: boolean;
}

export interface AvisoResultado {
  tono: "beneficio" | "contacto" | "neutro";
  titulo?: string;
  texto: string;
  /** Línea extra en negrita, ej. teléfonos de contacto */
  extra?: string;
}

/**
 * Resultado de una calculadora presentado como un comprobante único:
 * el monto es el centro visual, el detalle se ordena debajo y los avisos
 * quedan al pie sin competir con la cifra.
 */
export default function ResultadoTarifa({
  monto,
  etiqueta,
  subtitulo,
  calculo,
  datos,
  avisos = [],
  disclaimer,
  onReset,
  resetLabel,
  labelCalculo,
  labelDatos,
  labelImprimir,
  labelCompartir,
  labelCopiado,
}: {
  monto: number;
  etiqueta: string;
  subtitulo?: string;
  calculo?: FilaResultado[];
  datos: FilaResultado[];
  avisos?: AvisoResultado[];
  disclaimer: string;
  onReset: () => void;
  resetLabel: string;
  labelCalculo: string;
  labelDatos: string;
  labelImprimir: string;
  labelCompartir: string;
  labelCopiado: string;
}) {
  const [abierto, setAbierto] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const fmt = (n: number) =>
    new Intl.NumberFormat("es-PY", {
      style: "currency",
      currency: "PYG",
      minimumFractionDigits: 0,
    }).format(n);

  const compartir = async () => {
    const texto = [
      subtitulo ? `${subtitulo} — ${etiqueta}` : etiqueta,
      fmt(monto),
      typeof window !== "undefined" ? window.location.href : "",
    ]
      .filter(Boolean)
      .join("\n");

    // navigator.share solo existe en contexto seguro y sobre todo en mobile.
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ text: texto });
        return;
      } catch {
        // El usuario canceló el diálogo: no es un error que deba reportarse.
        return;
      }
    }
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Sin portapapeles disponible no hay alternativa razonable.
    }
  };

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="print-comprobante overflow-hidden rounded-3xl border border-[#212226]/10 bg-white shadow-[0_20px_60px_-20px_rgba(33,34,38,0.18)]">
        <div className="h-1.5 bg-[#f0552f]" />

        {/* Monto — centro visual */}
        <div className="px-6 pt-9 pb-8 text-center sm:px-10">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#212226]/35">
            {etiqueta}
          </p>
          <p className="mt-3 font-display text-5xl font-black leading-none text-[#f0552f] sm:text-6xl">
            {fmt(monto)}
          </p>
          {subtitulo && (
            <p className="mt-3 text-sm font-bold text-[#212226]/60">{subtitulo}</p>
          )}
        </div>

        {/* Datos declarados */}
        <div className="border-t border-[#212226]/8 bg-[#faf9f7] px-6 py-5 sm:px-10">
          <p className="mb-3 text-[10px] font-black uppercase tracking-[0.16em] text-[#212226]/35">
            {labelDatos}
          </p>
          <dl className="space-y-2.5">
            {datos.map((d) => (
              <div key={d.label} className="flex items-baseline justify-between gap-6">
                <dt className="text-sm text-[#212226]/50">{d.label}</dt>
                <dd className="text-right text-sm font-bold text-[#212226]/80">
                  {d.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Cómo se calculó — plegable */}
        {calculo && calculo.length > 0 && (
          <div className="border-t border-[#212226]/8">
            <button
              type="button"
              onClick={() => setAbierto(!abierto)}
              aria-expanded={abierto}
              className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left transition-colors hover:bg-[#faf9f7] sm:px-10"
            >
              <span className="text-[10px] font-black uppercase tracking-[0.16em] text-[#212226]/45">
                {labelCalculo}
              </span>
              <ChevronDownIcon
                className={`no-print h-4 w-4 shrink-0 text-[#212226]/35 transition-transform ${abierto ? "rotate-180" : ""}`}
              />
            </button>
            {/* Oculto con CSS, no desmontado: así la impresión puede
                desplegarlo aunque el usuario lo tenga cerrado. */}
            <div
              className={`${abierto ? "block" : "hidden"} print-expandir space-y-2.5 border-t border-[#212226]/6 px-6 py-4 sm:px-10`}
            >
              {calculo.map((c) => (
                <div
                  key={c.label}
                  className="flex items-baseline justify-between gap-6"
                >
                  <span
                    className={`text-sm ${c.destacado ? "font-bold text-[#212226]/70" : "text-[#212226]/50"}`}
                  >
                    {c.label}
                  </span>
                  <span
                    className={`shrink-0 text-right text-sm font-bold ${c.destacado ? "text-[#f0552f]" : "text-[#212226]/60"}`}
                  >
                    {c.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Avisos */}
        {avisos.length > 0 && (
          <div className="divide-y divide-[#212226]/6 border-t border-[#212226]/8">
            {avisos.map((a, i) => {
              const Icon = a.tono === "contacto" ? PhoneIcon : InformationCircleIcon;
              const color =
                a.tono === "beneficio"
                  ? "text-[#b57f14]"
                  : a.tono === "contacto"
                    ? "text-[#f0552f]"
                    : "text-[#212226]/40";
              return (
                <div key={i} className="flex gap-3 px-6 py-4 sm:px-10">
                  <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${color}`} />
                  <div>
                    {a.titulo && (
                      <p className={`text-xs font-black ${color} mb-1`}>{a.titulo}</p>
                    )}
                    <p className="text-xs leading-relaxed text-[#212226]/55">
                      {a.texto}
                    </p>
                    {a.extra && (
                      <p className="mt-1.5 text-xs font-bold text-[#212226]/75">
                        {a.extra}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <p className="mt-5 text-center text-xs leading-relaxed text-[#212226]/35">
        {disclaimer}
      </p>

      <div className="no-print mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 rounded-xl bg-[#212226] px-6 py-3.5 text-xs font-black uppercase tracking-[0.14em] text-white transition-all hover:bg-[#f0552f]"
        >
          <ArrowPathIcon className="h-3.5 w-3.5" />
          {resetLabel}
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-xl border border-[#212226]/12 px-5 py-3.5 text-xs font-black uppercase tracking-[0.14em] text-[#212226]/60 transition-all hover:border-[#f0552f] hover:text-[#f0552f]"
        >
          <PrinterIcon className="h-3.5 w-3.5" />
          {labelImprimir}
        </button>
        <button
          type="button"
          onClick={compartir}
          className="inline-flex items-center gap-2 rounded-xl border border-[#212226]/12 px-5 py-3.5 text-xs font-black uppercase tracking-[0.14em] text-[#212226]/60 transition-all hover:border-[#f0552f] hover:text-[#f0552f]"
        >
          {copiado ? (
            <CheckIcon className="h-3.5 w-3.5 text-[#f0552f]" />
          ) : (
            <ShareIcon className="h-3.5 w-3.5" />
          )}
          {copiado ? labelCopiado : labelCompartir}
        </button>
      </div>
    </div>
  );
}
