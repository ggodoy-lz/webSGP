/* ── Tarifario Eventos (Gestión Conjunta APA–SGP/AIE) ────────────────────────
 *
 * Regla principal: el cliente ve UN SOLO TOTAL en Gs. = SGP + APA combinados.
 * El desglose interno nunca se muestra. Ver spec del documento "04 - EVENTOS".
 *
 * Constantes base:
 *   UDA-SGP = 39.200 · UDA-APA = 98.000 · APA por persona = 2.940 (3% UDA-APA)
 *   Descuento pago adelantado = 10% (si paga antes de la fecha del evento).
 */

export const UDA_SGP = 39_200;
export const UDA_APA = 98_000;
export const APA_POR_PERSONA = 2_940; // 3% de UDA-APA
export const DESCUENTO_PAGO_ADELANTADO = 0.1;

/**
 * Tarifa mínima de baile por persona (9.408 SGP + 2.940 APA). Se usa para
 * valorar las invitaciones de cortesía en Academias de Danza: el importe se
 * SUMA después de aplicar el 10%, no forma parte de la base de cálculo.
 */
export const POR_PERSONA_BAILE = 12_348;

export type Zona = "capital" | "interior";

export type EventoGrupo =
  | "bailes"
  | "familiares"
  | "espectaculos"
  | "empresariales"
  | "estudiantiles"
  | "academias"
  | "circos";

// ── Tablas fijas por rango de personas ─────────────────────────────────────

export interface RangoTarifa {
  desde: number;
  hasta: number; // Infinity = sin tope superior
  tarifa: number;
}

export interface RangoTarifaDoble {
  desde: number;
  hasta: number;
  sinBaile: number | null;
  /** null = ese rango no existe en la tabla → deriva a ejecutivo comercial */
  conBaile: number | null;
}

// Sección 4.1 — Celebraciones familiares
export const FAMILIARES_CAPITAL: RangoTarifa[] = [
  { desde: 1, hasta: 100, tarifa: 765_000 },
  { desde: 101, hasta: 200, tarifa: 828_000 },
  { desde: 201, hasta: 300, tarifa: 956_000 },
  { desde: 301, hasta: 400, tarifa: 1_147_000 },
  { desde: 401, hasta: 500, tarifa: 1_402_000 },
  { desde: 501, hasta: 600, tarifa: 1_593_000 },
  { desde: 601, hasta: 700, tarifa: 1_721_000 },
  { desde: 701, hasta: 800, tarifa: 1_849_000 },
  { desde: 801, hasta: 900, tarifa: 2_104_000 },
  { desde: 901, hasta: 1_000, tarifa: 2_295_000 },
];

// Interior hasta 200; a partir de 201 aplica tabla Capital (regla del documento).
export const FAMILIARES_INTERIOR: RangoTarifa[] = [
  { desde: 1, hasta: 100, tarifa: 433_000 },
  { desde: 101, hasta: 200, tarifa: 650_000 },
];

// Sección 4.1 — Eventos infantiles
export const INFANTILES_CAPITAL: RangoTarifa[] = [
  { desde: 1, hasta: 50, tarifa: 214_000 },
  { desde: 51, hasta: 80, tarifa: 278_000 },
  { desde: 81, hasta: 100, tarifa: 428_000 },
  { desde: 101, hasta: 150, tarifa: 469_000 },
  { desde: 151, hasta: 200, tarifa: 624_000 },
];

export const INFANTILES_INTERIOR: RangoTarifa[] = [
  { desde: 1, hasta: 50, tarifa: 128_000 },
  { desde: 51, hasta: 80, tarifa: 167_000 },
  { desde: 81, hasta: 100, tarifa: 257_000 },
  { desde: 101, hasta: 150, tarifa: 281_000 },
  { desde: 151, hasta: 200, tarifa: 375_000 },
];

// Sección 6 — Empresariales (SIN/CON baile, por zona)
export const EMPRESARIAL_CAPITAL: RangoTarifaDoble[] = [
  { desde: 1, hasta: 100, sinBaile: 2_040_000, conBaile: 2_856_000 },
  { desde: 101, hasta: 200, sinBaile: 2_167_000, conBaile: 3_034_000 },
  { desde: 201, hasta: 300, sinBaile: 2_295_000, conBaile: 3_212_000 },
  { desde: 301, hasta: 400, sinBaile: 2_422_000, conBaile: 3_391_000 },
  { desde: 401, hasta: 500, sinBaile: 2_550_000, conBaile: 3_569_000 },
  { desde: 501, hasta: 600, sinBaile: 2_677_000, conBaile: 3_748_000 },
  { desde: 601, hasta: 700, sinBaile: 2_804_000, conBaile: 3_926_000 },
  { desde: 701, hasta: 800, sinBaile: 2_932_000, conBaile: 4_105_000 },
  { desde: 801, hasta: 900, sinBaile: 3_059_000, conBaile: 4_283_000 },
  { desde: 901, hasta: 1_000, sinBaile: 3_187_000, conBaile: 4_462_000 },
];

// Interior: SIN BAILE llega hasta 300, CON BAILE solo hasta 200. Por encima de
// esos topes el documento no define tarifa → deriva a ejecutivo comercial.
export const EMPRESARIAL_INTERIOR: RangoTarifaDoble[] = [
  { desde: 1, hasta: 100, sinBaile: 1_223_000, conBaile: 1_714_000 },
  { desde: 101, hasta: 200, sinBaile: 1_301_000, conBaile: 1_820_000 },
  { desde: 201, hasta: 300, sinBaile: 1_379_000, conBaile: null },
];

// Sección 7 — Estudiantiles (SIN/CON baile, por zona)
export const ESTUDIANTIL_CAPITAL: RangoTarifaDoble[] = [
  { desde: 1, hasta: 200, sinBaile: 255_000, conBaile: 696_000 },
  { desde: 201, hasta: 400, sinBaile: 357_000, conBaile: 1_044_000 },
  { desde: 401, hasta: 600, sinBaile: 459_000, conBaile: 1_392_000 },
  { desde: 601, hasta: 800, sinBaile: 561_000, conBaile: 1_740_000 },
  { desde: 801, hasta: 1_000, sinBaile: 689_000, conBaile: 2_088_000 },
  { desde: 1_001, hasta: 2_000, sinBaile: 803_000, conBaile: 2_436_000 },
  { desde: 2_001, hasta: 4_000, sinBaile: 918_000, conBaile: 2_784_000 },
  { desde: 4_001, hasta: 6_000, sinBaile: 1_033_000, conBaile: 3_132_000 },
  { desde: 6_001, hasta: Infinity, sinBaile: 1_147_000, conBaile: 3_480_000 },
];

export const ESTUDIANTIL_INTERIOR: RangoTarifaDoble[] = [
  { desde: 1, hasta: 200, sinBaile: 153_000, conBaile: 417_000 },
  { desde: 201, hasta: 400, sinBaile: 214_000, conBaile: 626_000 },
  { desde: 401, hasta: 600, sinBaile: 276_000, conBaile: 835_000 },
  { desde: 601, hasta: 800, sinBaile: 337_000, conBaile: 1_044_000 },
  { desde: 801, hasta: 1_000, sinBaile: 413_000, conBaile: 1_252_000 },
  { desde: 1_001, hasta: 2_000, sinBaile: 482_000, conBaile: 1_461_000 },
  { desde: 2_001, hasta: 4_000, sinBaile: 551_000, conBaile: 1_671_000 },
  { desde: 4_001, hasta: 6_000, sinBaile: 619_000, conBaile: 1_880_000 },
  { desde: 6_001, hasta: Infinity, sinBaile: 688_000, conBaile: 2_088_000 },
];

// Sección 5.12 — Deportivos: mínimos SGP escalonados (APA = 2.940 × personas aparte)
export const DEPORTIVO_MINIMOS: RangoTarifa[] = [
  { desde: 1, hasta: 200, tarifa: 1_019_200 }, // 26 UDA
  { desde: 201, hasta: 500, tarifa: 1_411_200 }, // 36 UDA
  { desde: 501, hasta: 1_000, tarifa: 1_803_200 }, // 46 UDA
  { desde: 1_001, hasta: 3_000, tarifa: 3_920_000 }, // 100 UDA
  { desde: 3_001, hasta: 5_000, tarifa: 5_880_000 }, // 150 UDA
];
export const DEPORTIVO_BASE_5000 = 5_880_000;
export const DEPORTIVO_ADICIONAL_POR_1000 = 1_176_000; // 30 UDA, desde 5.001
export const DEPORTIVO_PORCENTAJE = 0.055;

// ── Circos (sección 9) y Teatros (sección 10) — por función y aforo ─────────
// Cada "uso" tiene una tabla por aforo (hasta 200/400/600/800/1000) y un
// adicional en UDA por cada N personas por encima de 1.000.

export interface UsoCircoTeatro {
  id: "antes" | "durante_corto" | "durante_largo" | "musical";
  tramos: number[]; // [≤200, ≤400, ≤600, ≤800, ≤1000]
  adicionalUda: number; // UDA por bloque adicional
  adicionalCada: number; // tamaño del bloque de personas
}

// Sección 9 — Circos
export const CIRCO_USOS: UsoCircoTeatro[] = [
  {
    id: "antes",
    tramos: [558_600, 686_000, 813_400, 940_800, 1_068_200],
    adicionalUda: 7.5,
    adicionalCada: 100,
  },
  {
    id: "durante_corto",
    tramos: [509_600, 686_000, 980_000, 1_274_000, 1_666_000],
    adicionalUda: 2.5,
    adicionalCada: 100,
  },
  {
    id: "durante_largo",
    tramos: [686_000, 940_800, 1_117_200, 1_293_600, 1_470_000],
    adicionalUda: 5,
    adicionalCada: 100,
  },
];

// Sección 10 — Teatros / Salas / Centros Culturales
export const TEATRO_USOS: UsoCircoTeatro[] = [
  {
    id: "antes",
    tramos: [431_200, 784_000, 1_176_000, 1_568_000, 1_960_000],
    adicionalUda: 1,
    adicionalCada: 50,
  },
  {
    id: "durante_corto",
    tramos: [176_400, 313_600, 450_800, 588_000, 725_200],
    adicionalUda: 1,
    adicionalCada: 200,
  },
  {
    id: "durante_largo",
    tramos: [303_800, 480_200, 656_600, 784_000, 911_400],
    adicionalUda: 2,
    adicionalCada: 200,
  },
  {
    // Musicales — la tarifa de tabla es el tope; el descuento proporcional por
    // duración lo determina un ejecutivo (punto 14c pendiente de SGP).
    id: "musical",
    tramos: [911_400, 1_195_600, 1_479_800, 1_813_000, 2_195_200],
    adicionalUda: 2,
    adicionalCada: 200,
  },
];

export const CIRCO_TEATRO_TRAMOS_TOPE = [200, 400, 600, 800, 1000];

// ── Especificación de cálculo por tipo de evento ───────────────────────────

// Cómo se obtiene el mínimo cuando el evento es CON ingresos.
export type MinConIngresos =
  | { tipo: "fijoSGP"; sgp: number } // sgp fijo + APA × personas
  | { tipo: "tablaEmp"; baile: boolean }; // tabla empresarial (ya incluye APA)

// Cómo se calcula cuando el evento es SIN ingresos.
export type SinIngresos =
  | { tipo: "porPersona"; personaSGP: number; minSGP: number } // (max(personaSGP×p, minSGP)) + APA×p
  | { tipo: "tablaEmp"; baile: boolean }; // tabla empresarial directa

export type CalculoSpec =
  | {
      modo: "porcentual";
      porcentaje: number;
      minCon: MinConIngresos;
      sin: SinIngresos;
      mensual?: boolean; // parques: tarifa mensual por temporada
    }
  | { modo: "tablaFija"; tabla: "familiares" | "infantiles" }
  | { modo: "empresarial" }
  | { modo: "estudiantil" }
  | { modo: "academia" }
  | { modo: "deportivo" }
  | { modo: "circoTeatro"; establecimiento: "circo" | "teatro" }
  | { modo: "derivaEjecutivo" }; // conciertos

export interface EventoTipo {
  id: string;
  grupo: EventoGrupo;
  calculo: CalculoSpec;
}

// APA por persona = 2.940. personaSGP = valorPorPersonaTotal − 2.940.
export const EVENTOS: EventoTipo[] = [
  // ── Bailes (sección 3) ──
  {
    id: "baileComun",
    grupo: "bailes",
    calculo: {
      modo: "porcentual",
      porcentaje: 0.2,
      minCon: { tipo: "fijoSGP", sgp: 1_470_000 },
      sin: { tipo: "porPersona", personaSGP: 9_408, minSGP: 1_019_200 },
    },
  },
  {
    id: "showBailablePromo",
    grupo: "bailes",
    calculo: {
      modo: "porcentual",
      porcentaje: 0.2,
      minCon: { tipo: "tablaEmp", baile: true },
      sin: { tipo: "tablaEmp", baile: true },
    },
  },
  {
    id: "cenaBailable",
    grupo: "bailes",
    calculo: {
      modo: "porcentual",
      porcentaje: 0.2,
      minCon: { tipo: "fijoSGP", sgp: 1_528_800 },
      sin: { tipo: "porPersona", personaSGP: 14_112, minSGP: 1_528_800 },
    },
  },

  // ── Celebraciones familiares (sección 4) ──
  { id: "eventoSocial", grupo: "familiares", calculo: { modo: "tablaFija", tabla: "familiares" } },
  { id: "eventoInfantil", grupo: "familiares", calculo: { modo: "tablaFija", tabla: "infantiles" } },

  // ── Espectáculos (sección 5) ──
  {
    id: "recital",
    grupo: "espectaculos",
    calculo: {
      modo: "porcentual",
      porcentaje: 0.2,
      minCon: { tipo: "fijoSGP", sgp: 1_411_200 },
      sin: { tipo: "porPersona", personaSGP: 9_408, minSGP: 1_019_200 },
    },
  },
  {
    id: "promoProducto",
    grupo: "espectaculos",
    calculo: {
      modo: "porcentual",
      porcentaje: 0.2,
      minCon: { tipo: "tablaEmp", baile: false },
      sin: { tipo: "tablaEmp", baile: false },
    },
  },
  {
    id: "aniversario",
    grupo: "espectaculos",
    calculo: {
      modo: "porcentual",
      porcentaje: 0.2,
      minCon: { tipo: "tablaEmp", baile: true }, // confirmado por SGP
      sin: { tipo: "tablaEmp", baile: true },
    },
  },
  {
    id: "cenaShow",
    grupo: "espectaculos",
    calculo: {
      modo: "porcentual",
      porcentaje: 0.11,
      minCon: { tipo: "fijoSGP", sgp: 1_019_200 },
      sin: { tipo: "porPersona", personaSGP: 9_408, minSGP: 1_019_200 },
    },
  },
  {
    id: "reinas",
    grupo: "espectaculos",
    calculo: {
      modo: "porcentual",
      porcentaje: 0.1,
      minCon: { tipo: "fijoSGP", sgp: 1_019_200 },
      sin: { tipo: "porPersona", personaSGP: 9_408, minSGP: 1_019_200 },
    },
  },
  {
    id: "sobreHielo",
    grupo: "espectaculos",
    calculo: {
      modo: "porcentual",
      porcentaje: 0.09,
      minCon: { tipo: "fijoSGP", sgp: 1_019_200 },
      sin: { tipo: "porPersona", personaSGP: 9_408, minSGP: 1_019_200 },
    },
  },
  {
    id: "rifasBingos",
    grupo: "espectaculos",
    calculo: {
      modo: "porcentual",
      porcentaje: 0.08,
      minCon: { tipo: "fijoSGP", sgp: 1_019_200 },
      sin: { tipo: "porPersona", personaSGP: 7_056, minSGP: 1_019_200 },
    },
  },
  {
    id: "feriasExpo",
    grupo: "espectaculos",
    calculo: {
      modo: "porcentual",
      porcentaje: 0.05,
      minCon: { tipo: "fijoSGP", sgp: 1_019_200 },
      sin: { tipo: "porPersona", personaSGP: 2_744, minSGP: 401_800 },
    },
  },
  {
    id: "fiestaPatronal",
    grupo: "espectaculos",
    calculo: {
      modo: "porcentual",
      porcentaje: 0.2,
      minCon: { tipo: "fijoSGP", sgp: 1_019_200 },
      sin: { tipo: "porPersona", personaSGP: 1_960, minSGP: 784_000 },
    },
  },
  {
    id: "jineteadas",
    grupo: "espectaculos",
    calculo: {
      modo: "porcentual",
      porcentaje: 0.15,
      minCon: { tipo: "fijoSGP", sgp: 1_019_200 },
      sin: { tipo: "porPersona", personaSGP: 1_960, minSGP: 784_000 },
    },
  },
  {
    id: "parqueDiversiones",
    grupo: "espectaculos",
    calculo: {
      modo: "porcentual",
      porcentaje: 0.06,
      minCon: { tipo: "fijoSGP", sgp: 1_176_000 },
      sin: { tipo: "porPersona", personaSGP: 2_744, minSGP: 1_019_200 },
      mensual: true,
    },
  },
  { id: "deportivo", grupo: "espectaculos", calculo: { modo: "deportivo" } },
  { id: "concierto", grupo: "espectaculos", calculo: { modo: "derivaEjecutivo" } },

  // ── Empresariales (sección 6) ──
  { id: "empresarial", grupo: "empresariales", calculo: { modo: "empresarial" } },

  // ── Estudiantiles (sección 7) ──
  { id: "estudiantil", grupo: "estudiantiles", calculo: { modo: "estudiantil" } },

  // ── Academias de danza (sección 8) ──
  { id: "academiaDanza", grupo: "academias", calculo: { modo: "academia" } },

  // ── Circos y Teatros (secciones 9 y 10) ──
  { id: "circo", grupo: "circos", calculo: { modo: "circoTeatro", establecimiento: "circo" } },
  { id: "teatro", grupo: "circos", calculo: { modo: "circoTeatro", establecimiento: "teatro" } },
];

export const EVENTO_GRUPOS: EventoGrupo[] = [
  "bailes",
  "familiares",
  "espectaculos",
  "empresariales",
  "estudiantiles",
  "academias",
  "circos",
];

export function eventosPorGrupo(grupo: EventoGrupo): EventoTipo[] {
  return EVENTOS.filter((e) => e.grupo === grupo);
}

export function getEvento(id: string): EventoTipo | undefined {
  return EVENTOS.find((e) => e.id === id);
}

// Busca la tarifa en una tabla simple por cantidad de personas.
export function buscarRango(tabla: RangoTarifa[], personas: number): RangoTarifa | undefined {
  return tabla.find((r) => personas >= r.desde && personas <= r.hasta);
}

export function buscarRangoDoble(
  tabla: RangoTarifaDoble[],
  personas: number,
): RangoTarifaDoble | undefined {
  return tabla.find((r) => personas >= r.desde && personas <= r.hasta);
}
