/* ── Motor de cálculo — Licencias para Internet ──────────────────────────────
 *
 * Simulcasting:    max(publicidad × 0.8%, mínimo USD por visitas → Gs.)
 * Webcasting:      max(20% ingresos, Gs.1 × fonogramas, Gs.10 × usuarios,
 *                      mínimo USD por visitas → Gs.)
 * Ambientación:    tarifa USD por visitas → Gs.
 * Musicalización:  max(10% ingresos, 0.5 UDA × bocas), nunca < 50 UDA.
 */

import {
  UDA,
  SIMULCASTING_BASE,
  WEBCASTING_TARIFA_A,
  WEBCASTING_GS_POR_FONOGRAMA,
  WEBCASTING_GS_POR_USUARIO,
  MUSICALIZACION_BASE,
  MUSICALIZACION_UDA_POR_BOCA,
  MUSICALIZACION_MINIMO_UDA,
  minimoUSDPorVisitas,
  type InternetServicio,
} from "./internet-config";

export interface InternetInput {
  servicio: InternetServicio;
  /** Gs. por USD (cotización BCP) */
  tipoCambio: number;
  /** Visitas mensuales (simulcasting, webcasting, ambientación) */
  visitas: number;
  /** Ingresos brutos mensuales en Gs. */
  ingresos: number;
  /** Fonogramas transmitidos al mes (webcasting) */
  fonogramas: number;
  /** Usuarios/suscriptores (webcasting) */
  usuarios: number;
  /** Bocas/domicilios donde se presta el servicio (musicalización) */
  bocas: number;
}

export interface InternetResult {
  /** Tarifa mensual final en Gs. */
  total: number;
  /** Mínimo por visitas en USD (si aplica al servicio) */
  minimoUSD: number | null;
  /** Mínimo por visitas convertido a Gs. (si aplica) */
  minimoGs: number | null;
  /** Detalle de componentes calculados, para el desglose */
  componentes: { clave: string; valor: number }[];
  /** Clave del componente que definió el total */
  gana: string;
}

export function calcularInternet(input: InternetInput): InternetResult {
  const tc = input.tipoCambio;
  const ingresos = Math.max(0, input.ingresos);

  switch (input.servicio) {
    case "simulcasting": {
      const porIngresos = ingresos * SIMULCASTING_BASE;
      const minimoUSD = minimoUSDPorVisitas(input.visitas);
      const minimoGs = minimoUSD * tc;
      const total = Math.max(porIngresos, minimoGs);
      return {
        total: Math.round(total),
        minimoUSD,
        minimoGs: Math.round(minimoGs),
        componentes: [
          { clave: "publicidad", valor: Math.round(porIngresos) },
          { clave: "minimoVisitas", valor: Math.round(minimoGs) },
        ],
        gana: porIngresos >= minimoGs ? "publicidad" : "minimoVisitas",
      };
    }

    case "webcasting": {
      const tarifaA = ingresos * WEBCASTING_TARIFA_A;
      const tarifaB = Math.max(0, input.fonogramas) * WEBCASTING_GS_POR_FONOGRAMA;
      const tarifaC = Math.max(0, input.usuarios) * WEBCASTING_GS_POR_USUARIO;
      const minimoUSD = minimoUSDPorVisitas(input.visitas);
      const minimoGs = minimoUSD * tc;
      const candidatos: { clave: string; valor: number }[] = [
        { clave: "tarifaA", valor: tarifaA },
        { clave: "tarifaB", valor: tarifaB },
        { clave: "tarifaC", valor: tarifaC },
        { clave: "minimoVisitas", valor: minimoGs },
      ];
      const ganador = candidatos.reduce((a, b) => (b.valor > a.valor ? b : a));
      return {
        total: Math.round(ganador.valor),
        minimoUSD,
        minimoGs: Math.round(minimoGs),
        componentes: candidatos.map((c) => ({ ...c, valor: Math.round(c.valor) })),
        gana: ganador.clave,
      };
    }

    case "ambientacion": {
      const minimoUSD = minimoUSDPorVisitas(input.visitas);
      const minimoGs = minimoUSD * tc;
      return {
        total: Math.round(minimoGs),
        minimoUSD,
        minimoGs: Math.round(minimoGs),
        componentes: [{ clave: "minimoVisitas", valor: Math.round(minimoGs) }],
        gana: "minimoVisitas",
      };
    }

    case "musicalizacion": {
      const porIngresos = ingresos * MUSICALIZACION_BASE;
      const porBocas = Math.max(0, input.bocas) * MUSICALIZACION_UDA_POR_BOCA * UDA;
      const minimo = MUSICALIZACION_MINIMO_UDA * UDA;
      const mayor = Math.max(porIngresos, porBocas);
      const total = Math.max(mayor, minimo);
      const gana =
        total === minimo && mayor < minimo
          ? "minimoUda"
          : porIngresos >= porBocas
            ? "ingresos"
            : "bocas";
      return {
        total: Math.round(total),
        minimoUSD: null,
        minimoGs: null,
        componentes: [
          { clave: "ingresos", valor: Math.round(porIngresos) },
          { clave: "bocas", valor: Math.round(porBocas) },
          { clave: "minimoUda", valor: Math.round(minimo) },
        ],
        gana,
      };
    }
  }
}
