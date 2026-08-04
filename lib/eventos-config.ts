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

// Interior: la tabla llega hasta 200 personas. SGP confirmó que el rango
// 201–300 no corresponde, así que por encima de 200 se deriva a un ejecutivo
// (aplica tanto a Empresariales como a Promoción de Producto, que usa esta
// misma tabla como mínimo).
export const EMPRESARIAL_INTERIOR: RangoTarifaDoble[] = [
  { desde: 1, hasta: 100, sinBaile: 1_223_000, conBaile: 1_714_000 },
  { desde: 101, hasta: 200, sinBaile: 1_301_000, conBaile: 1_820_000 },
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

// Deportivos CON ingresos: APA y SGP se calculan por separado y se suman.
// El 0,5% de SGP se compara contra el mínimo de tabla y se aplica el mayor.
export const DEPORTIVO_APA_PORCENTAJE = 0.05;
export const DEPORTIVO_SGP_PORCENTAJE = 0.005;

// ── Parques de diversiones (5.11) — tarifa mensual ─────────────────────────
// Misma estructura que deportivos: APA y SGP por separado. El 6% del documento
// era la suma de ambos (5% APA + 1% SGP), pero cada parte tiene su propia
// regla, así que se calculan aparte.
export const PARQUE_APA_PORCENTAJE = 0.05;
export const PARQUE_SGP_PORCENTAJE = 0.01;
/** Mínimo SGP mensual con obtención de ingresos: 30 UDA */
export const PARQUE_SGP_MIN_CON_INGRESOS = 1_176_000;
/** Mínimo SGP mensual sin obtención de ingresos: 26 UDA */
export const PARQUE_SGP_MIN_SIN_INGRESOS = 1_019_200;
/** SGP por persona sin obtención de ingresos: 5% de UDA */
export const PARQUE_SGP_POR_PERSONA = 1_960;

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
  | { modo: "parque" }
  /**
   * APA y SGP se calculan por separado sobre la misma base y se suman. El
   * mínimo es solo de SGP: el APA se agrega encima, nunca queda absorbido.
   * Es la estructura que usa SGP en sus planillas para patronales y similares.
   */
  | {
      modo: "apaSgp";
      apaPorc: number;
      sgpPorc: number;
      /** Mínimo de SGP cuando hay obtención de ingresos */
      minSgpCon: number;
      /** Mínimo de SGP cuando no hay obtención de ingresos */
      minSgpSin: number;
      /** SGP por persona cuando no hay obtención de ingresos */
      sgpPorPersona: number;
    }
  | { modo: "circoTeatro"; establecimiento: "circo" | "teatro" }
  | { modo: "derivaEjecutivo" }; // conciertos

export interface EventoTipo {
  id: string;
  grupo: EventoGrupo;
  calculo: CalculoSpec;
  /**
   * Denominaciones que comparten exactamente el mismo cálculo. Se muestran
   * como opciones propias para que el cliente encuentre su evento por nombre
   * ("Oktoberfest") en vez de tener que deducir la categoría técnica.
   * Las claves se traducen desde `eventos.variantes.<clave>`.
   */
  variantes?: string[];
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
    variantes: [
      "discoteca", "salsodromo", "pena", "oktoberfest", "primavera",
      "anoNuevo", "saintPatrick", "amistad", "exa", "retro", "electronica",
      "sunset", "coffeeParty", "carnaval", "otros",
    ],
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
  {
    id: "eventoSocial",
    grupo: "familiares",
    calculo: { modo: "tablaFija", tabla: "familiares" },
    variantes: [
      "quinceAnos", "boda", "cumpleanosFamiliar", "aniversarioFamiliar",
      "colacion", "encuentro", "cocktailSinShow", "brunch", "afterOffice",
      "otros",
    ],
  },
  {
    id: "eventoInfantil",
    grupo: "familiares",
    calculo: { modo: "tablaFija", tabla: "infantiles" },
    variantes: [
      "cumpleanosInfantil", "bautismo", "primeraComunion", "babyShower",
      "otros",
    ],
  },

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
    // Fiesta social / patronal: 10% APA + 10% SGP (el 20% del documento era
    // la suma de ambos). Mínimos SGP: 26 UDA con ingresos, 20 UDA sin ellos.
    id: "fiestaPatronal",
    grupo: "espectaculos",
    calculo: {
      modo: "apaSgp",
      apaPorc: 0.1,
      sgpPorc: 0.1,
      minSgpCon: 1_019_200,
      minSgpSin: 784_000,
      sgpPorPersona: 1_960,
    },
  },
  {
    // Torín / jineteada: 5% APA + 10% SGP (el 15% era la suma).
    id: "jineteadas",
    grupo: "espectaculos",
    calculo: {
      modo: "apaSgp",
      apaPorc: 0.05,
      sgpPorc: 0.1,
      minSgpCon: 1_019_200,
      minSgpSin: 784_000,
      sgpPorPersona: 1_960,
    },
  },
  { id: "parqueDiversiones", grupo: "espectaculos", calculo: { modo: "parque" } },
  { id: "deportivo", grupo: "espectaculos", calculo: { modo: "deportivo" } },
  { id: "concierto", grupo: "espectaculos", calculo: { modo: "derivaEjecutivo" } },

  // ── Empresariales (sección 6) ──
  {
    id: "empresarial",
    grupo: "empresariales",
    calculo: { modo: "empresarial" },
    variantes: [
      "aniversarioEmp", "diaTrabajador", "conferencia", "convencion",
      "cocktail", "lanzamiento", "inauguracion", "cena", "almuerzo",
      "taller", "workshop", "charla", "otros",
    ],
  },

  // ── Estudiantiles (sección 7) ──
  {
    id: "estudiantil",
    grupo: "estudiantiles",
    calculo: { modo: "estudiantil" },
    variantes: [
      "graduacion", "bienvenida", "exposicion", "feria", "sanJuan",
      "diaJuventud", "diaFamilia", "festival", "playback", "intercolegial",
      "interescolar", "competenciaDeportiva", "otros",
    ],
  },

  // ── Academias de danza (sección 8) ──
  {
    id: "academiaDanza",
    grupo: "academias",
    calculo: { modo: "academia" },
    variantes: ["graduacionDanza", "clausura", "tesina", "festivalDanza", "otros"],
  },

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

/**
 * Variantes que se liquidan siempre como evento bailable, aunque el cliente
 * declare lo contrario (SGP: en los playback estudiantiles corresponde la
 * tarifa de baile independientemente de lo declarado).
 */
export const VARIANTES_SIEMPRE_BAILE = ["playback"];

/** Una opción elegible en el paso 2: un tipo, o una variante de un tipo. */
export interface OpcionEvento {
  /** id del EventoTipo que define el cálculo */
  tipo: string;
  /** clave de la variante elegida, o null si el tipo no tiene variantes */
  variante: string | null;
  /** clave de traducción para el texto visible */
  labelKey: string;
}

/** Opciones elegibles de un grupo, con las variantes ya desplegadas. */
export function opcionesPorGrupo(grupo: EventoGrupo): OpcionEvento[] {
  return eventosPorGrupo(grupo).flatMap((e): OpcionEvento[] =>
    e.variantes
      ? e.variantes.map((v) => ({
          tipo: e.id,
          variante: v,
          labelKey: `variantes.${v}`,
        }))
      : [{ tipo: e.id, variante: null, labelKey: `tipos.${e.id}` }],
  );
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
