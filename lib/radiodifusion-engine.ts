/* ── Motor de cálculo — Radiodifusión ────────────────────────────────────────
 *
 * TARIFA = Ingresos × base% × (1 − descuento categoría)
 * Si es menor que el mínimo de la categoría → se aplica el mínimo.
 * Si no hay ingresos → se aplica directamente el mínimo.
 * El pronto pago (−10%) se aplica DESPUÉS.
 */

import {
  RADIO_BASE,
  RADIO_DESCUENTOS,
  PRONTO_PAGO_DESCUENTO,
  minimoRadiodifusion,
  type RadioMedio,
  type RadioCategoria,
  type Zona,
} from "./radiodifusion-config";

export interface RadiodifusionInput {
  medio: RadioMedio;
  zona: Zona;
  categoria: RadioCategoria;
  ingresos: number;
  prontoPago: boolean;
}

export interface RadiodifusionResult {
  /** Tarifa calculada sobre ingresos (antes de comparar con el mínimo) */
  tarifaCalculada: number;
  /** Mínimo aplicable de la categoría (Gs.) */
  minimo: number;
  /** true si se aplicó el mínimo en lugar del cálculo sobre ingresos */
  aplicaMinimo: boolean;
  /** Tarifa antes del descuento por pronto pago */
  subtotal: number;
  /** Monto descontado por pronto pago (Gs.) */
  descuentoProntoPago: number;
  /** Tarifa mensual final (Gs.) */
  total: number;
}

export function calcularRadiodifusion(
  input: RadiodifusionInput,
): RadiodifusionResult {
  const base = RADIO_BASE[input.medio];
  const descuento = RADIO_DESCUENTOS[input.categoria];
  const minimo = minimoRadiodifusion(input.medio, input.categoria, input.zona);

  const ingresos = Math.max(0, input.ingresos);
  const tarifaCalculada = ingresos * base * (1 - descuento);

  const aplicaMinimo = ingresos <= 0 || tarifaCalculada < minimo;
  const subtotal = aplicaMinimo ? minimo : tarifaCalculada;

  const descuentoProntoPago = input.prontoPago
    ? subtotal * PRONTO_PAGO_DESCUENTO
    : 0;
  const total = subtotal - descuentoProntoPago;

  return {
    tarifaCalculada,
    minimo,
    aplicaMinimo,
    subtotal,
    descuentoProntoPago,
    total: Math.round(total),
  };
}
