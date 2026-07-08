/* ── Tarifario Licencias para Internet (RTG Secciones 8.1–8.4) ───────────────
 *
 * Cuatro servicios:
 *  - Simulcasting: emisión simultánea de radio/TV por internet.
 *  - Webcasting: radio/TV online pura (sin señal tradicional).
 *  - Ambientación Musical de Sitios Web.
 *  - Musicalización para Locales Comerciales (background music, SaaS).
 *
 * Los mínimos por visitas se expresan en USD y se liquidan al tipo de cambio
 * del BCP del último día hábil del mes anterior.
 */

export const UDA = 39_200;

export type InternetServicio =
  | "simulcasting"
  | "webcasting"
  | "ambientacion"
  | "musicalizacion";

export const INTERNET_SERVICIOS: InternetServicio[] = [
  "simulcasting",
  "webcasting",
  "ambientacion",
  "musicalizacion",
];

// ── Tabla de mínimos por visitas mensuales (USD) ───────────────────────────
// Compartida por Simulcasting, Webcasting y Ambientación Web.

export interface RangoVisitas {
  desde: number;
  hasta: number; // Infinity para el último rango
  usd: number;
}

export const TABLA_VISITAS_USD: RangoVisitas[] = [
  { desde: 0, hasta: 5_000, usd: 50 },
  { desde: 5_001, hasta: 10_000, usd: 100 },
  { desde: 10_001, hasta: 50_000, usd: 300 },
  { desde: 50_001, hasta: 100_000, usd: 800 },
  { desde: 100_001, hasta: 150_000, usd: 1_000 },
];

// Más de 150.000 visitas: USD 1.700 por mes por cada tramo de 150.000.
// 150.001–300.000 = USD 1.700; 300.001–450.000 = USD 3.400; y así sucesivamente.
export const VISITAS_BASE_EXTRA = 150_000;
export const VISITAS_USD_POR_BLOQUE_EXTRA = 1_700;

export function minimoUSDPorVisitas(visitas: number): number {
  const v = Math.max(0, visitas);
  const rango = TABLA_VISITAS_USD.find((r) => v >= r.desde && v <= r.hasta);
  if (rango) return rango.usd;
  const bloques = Math.ceil((v - VISITAS_BASE_EXTRA) / VISITAS_BASE_EXTRA);
  return bloques * VISITAS_USD_POR_BLOQUE_EXTRA;
}

// ── Simulcasting (RTG 8.4) ─────────────────────────────────────────────────

// 0.8% + IVA de la facturación bruta mensual por publicidad en las URLs.
export const SIMULCASTING_BASE = 0.008;

// ── Webcasting (RTG 8.3) — se aplica la MAYOR de las tarifas ───────────────

export const WEBCASTING_TARIFA_A = 0.2; // 20% de ingresos brutos
export const WEBCASTING_GS_POR_FONOGRAMA = 1; // Gs. 1 por fonograma transmitido a cada IP
export const WEBCASTING_GS_POR_USUARIO = 10; // Gs. 10 por usuario/suscriptor

// ── Musicalización para Locales Comerciales (RTG 8.2) ──────────────────────

export const MUSICALIZACION_BASE = 0.1; // 10% de ingresos brutos
export const MUSICALIZACION_UDA_POR_BOCA = 0.5; // 0.5 UDA por boca/domicilio
export const MUSICALIZACION_MINIMO_UDA = 50; // mínimo garantizado 50 UDA
