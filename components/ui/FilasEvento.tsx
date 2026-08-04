"use client";

import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import type { FilaEvento } from "@/lib/eventos-engine";

const fmt = (n: number) =>
  new Intl.NumberFormat("es-PY", {
    style: "currency",
    currency: "PYG",
    minimumFractionDigits: 0,
  }).format(n);

const soloNumeros = (v: string) => Number(v.replace(/\D/g, "")) || 0;
const conSeparadores = (n: number) =>
  n > 0 ? new Intl.NumberFormat("es-PY").format(n) : "";

/**
 * Carga de sectores o fechas de un evento.
 *
 * El eje cambia el sentido del cálculo, no solo las etiquetas: en `sectores`
 * las filas son partes de un mismo evento y comparten un único mínimo; en
 * `fechas` cada fila se liquida entera y por separado.
 */
export default function FilasEvento({
  filas,
  onChange,
  conIngresos,
  textos,
}: {
  filas: FilaEvento[];
  onChange: (filas: FilaEvento[]) => void;
  /** Si no cobran entrada, el precio no se pide */
  conIngresos: boolean;
  textos: {
    titulo: string;
    ayuda: string;
    etiqueta: string;
    etiquetaPlaceholder: string;
    personas: string;
    precio: string;
    agregar: string;
    quitar: string;
    subtotal: string;
  };
}) {
  const editar = (i: number, cambio: Partial<FilaEvento>) =>
    onChange(filas.map((f, j) => (j === i ? { ...f, ...cambio } : f)));

  const agregar = () =>
    onChange([...filas, { etiqueta: "", personas: 0, precioEntrada: 0 }]);

  const quitar = (i: number) => onChange(filas.filter((_, j) => j !== i));

  const totalPersonas = filas.reduce((a, f) => a + f.personas, 0);
  const totalIngreso = filas.reduce(
    (a, f) => a + f.personas * f.precioEntrada,
    0,
  );

  return (
    <div className="max-w-2xl space-y-3">
      <div>
        <p className="text-[11px] font-black uppercase tracking-wider text-[#212226]/65">
          {textos.titulo}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-[#212226]/65">
          {textos.ayuda}
        </p>
      </div>

      <div className="space-y-2.5">
        {filas.map((fila, i) => (
          <div
            key={i}
            className="rounded-xl border border-[#212226]/10 bg-[#faf9f7] p-3"
          >
            <div className="flex items-start gap-2">
              <div className="flex-1 space-y-2">
                <input
                  value={fila.etiqueta ?? ""}
                  onChange={(e) => editar(i, { etiqueta: e.target.value })}
                  placeholder={textos.etiquetaPlaceholder}
                  aria-label={`${textos.etiqueta} ${i + 1}`}
                  className="h-10 w-full rounded-lg border border-[#212226]/10 bg-white px-3 text-sm font-bold outline-none transition-colors placeholder:font-normal placeholder:text-[#212226]/55 focus:border-[#f0552f]"
                />
                <div
                  className={`grid gap-2 ${conIngresos ? "grid-cols-2" : "grid-cols-1"}`}
                >
                  <label className="block">
                    <span className="mb-1 block text-[10px] font-black uppercase tracking-wider text-[#212226]/65">
                      {textos.personas}
                    </span>
                    <input
                      inputMode="numeric"
                      value={conSeparadores(fila.personas)}
                      onChange={(e) =>
                        editar(i, { personas: soloNumeros(e.target.value) })
                      }
                      placeholder="0"
                      className="h-10 w-full rounded-lg border border-[#212226]/10 bg-white px-3 text-sm outline-none transition-colors placeholder:text-[#212226]/55 focus:border-[#f0552f]"
                    />
                  </label>
                  {conIngresos && (
                    <label className="block">
                      <span className="mb-1 block text-[10px] font-black uppercase tracking-wider text-[#212226]/65">
                        {textos.precio}
                      </span>
                      <div className="flex h-10 items-center overflow-hidden rounded-lg border border-[#212226]/10 bg-white transition-colors focus-within:border-[#f0552f]">
                        <span className="pl-3 text-sm font-bold text-[#212226]/55">
                          Gs.
                        </span>
                        <input
                          inputMode="numeric"
                          value={conSeparadores(fila.precioEntrada)}
                          onChange={(e) =>
                            editar(i, {
                              precioEntrada: soloNumeros(e.target.value),
                            })
                          }
                          placeholder="0"
                          className="w-full bg-transparent px-2 text-sm outline-none placeholder:text-[#212226]/55"
                        />
                      </div>
                    </label>
                  )}
                </div>
              </div>

              {filas.length > 1 && (
                <button
                  type="button"
                  onClick={() => quitar(i)}
                  aria-label={`${textos.quitar} ${i + 1}`}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#212226]/10 text-[#212226]/55 transition-colors hover:border-[#f0552f] hover:text-[#f0552f]"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={agregar}
          className="inline-flex items-center gap-2 rounded-xl border border-dashed border-[#212226]/20 px-4 py-2.5 text-xs font-black uppercase tracking-[0.14em] text-[#212226]/65 transition-colors hover:border-[#f0552f] hover:text-[#f0552f]"
        >
          <PlusIcon className="h-3.5 w-3.5" />
          {textos.agregar}
        </button>

        {filas.length > 1 && totalPersonas > 0 && (
          <p className="text-xs text-[#212226]/65">
            {textos.subtotal}:{" "}
            <strong className="text-[#212226]/80">
              {new Intl.NumberFormat("es-PY").format(totalPersonas)}
            </strong>
            {conIngresos && totalIngreso > 0 && (
              <>
                {" · "}
                <strong className="text-[#212226]/80">
                  {fmt(totalIngreso)}
                </strong>
              </>
            )}
          </p>
        )}
      </div>
    </div>
  );
}
