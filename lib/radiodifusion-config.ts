/* ── Tarifario Radiodifusión (RTG Secciones 6 y 7) ───────────────────────────
 *
 * Aplica a organismos de radiodifusión: radios AM/FM, TV abierta y TV cable/OTT.
 * La tarifa se basa en los ingresos del operador y en el % de uso de música,
 * nunca inferior a un mínimo en UDA que depende de la categoría, el medio y
 * (solo para radio) la zona.
 */

export const UDA = 39_200;

export type RadioMedio = "radio" | "tv_abierta" | "tv_cable";
export type RadioCategoria = "especial" | "a" | "b" | "c" | "d";
export type Zona = "capital" | "interior";

export const RADIO_MEDIOS: RadioMedio[] = ["radio", "tv_abierta", "tv_cable"];
export const RADIO_CATEGORIAS: RadioCategoria[] = ["especial", "a", "b", "c", "d"];

// La zona solo cambia los mínimos en Radio. TV abierta y cable/OTT tienen los
// mismos mínimos en Capital e Interior.
export const MEDIO_USA_ZONA: Record<RadioMedio, boolean> = {
  radio: true,
  tv_abierta: false,
  tv_cable: false,
};

// Tarifa base (% sobre ingresos mensuales) por tipo de medio.
export const RADIO_BASE: Record<RadioMedio, number> = {
  radio: 0.015, // 1.5%
  tv_abierta: 0.01, // 1.0%
  tv_cable: 0.01, // 1.0%
};

// Descuento sobre la tarifa base según categoría de uso musical.
export const RADIO_DESCUENTOS: Record<RadioCategoria, number> = {
  especial: 0.05, // >90% música
  a: 0.1, // 76–90%
  b: 0.2, // 51–75%
  c: 0.4, // 30–50%
  d: 0.6, // <30%
};

// Mínimos en UDA por medio → categoría → zona.
export const RADIO_MINIMOS_UDA: Record<
  RadioMedio,
  Record<RadioCategoria, { capital: number; interior: number }>
> = {
  radio: {
    especial: { capital: 31, interior: 19 },
    a: { capital: 28, interior: 14 },
    b: { capital: 25, interior: 10 },
    c: { capital: 19, interior: 7 }, // mínimo FM
    d: { capital: 12, interior: 5 }, // mínimo AM
  },
  tv_abierta: {
    especial: { capital: 16, interior: 16 },
    a: { capital: 12, interior: 12 },
    b: { capital: 9, interior: 9 },
    c: { capital: 6, interior: 6 },
    d: { capital: 4, interior: 4 },
  },
  tv_cable: {
    especial: { capital: 16, interior: 16 },
    a: { capital: 12, interior: 12 },
    b: { capital: 9, interior: 9 },
    c: { capital: 6, interior: 6 },
    d: { capital: 4, interior: 4 },
  },
};

// Descuento adicional por pronto pago (dentro de los 15 días del mes siguiente).
export const PRONTO_PAGO_DESCUENTO = 0.1;

export function minimoRadiodifusion(
  medio: RadioMedio,
  categoria: RadioCategoria,
  zona: Zona,
): number {
  const uda = RADIO_MINIMOS_UDA[medio][categoria][zona];
  return uda * UDA;
}
