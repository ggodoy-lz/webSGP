/* ── Motor de cálculo — Eventos (Gestión Conjunta APA–SGP/AIE) ───────────────
 *
 * El cliente ve UN SOLO TOTAL. Internamente se calculan SGP y APA por separado
 * cuando la tarifa es porcentual o por persona; las tablas fijas ya son
 * conjuntas (incluyen ambas entidades).
 *
 * Cuando la cantidad de personas supera el máximo de una tabla fija, no se
 * extrapola: se deriva a un Ejecutivo Comercial (definición de SGP).
 *
 * El descuento del 10% por pago adelantado NO se aplica acá: solo se informa
 * como beneficio. Se determina en la pasarela, al declarar la fecha del evento.
 */

import {
  APA_POR_PERSONA,
  POR_PERSONA_BAILE,
  DEPORTIVO_MINIMOS,
  DEPORTIVO_BASE_5000,
  DEPORTIVO_ADICIONAL_POR_1000,
  DEPORTIVO_APA_PORCENTAJE,
  DEPORTIVO_SGP_PORCENTAJE,
  PARQUE_APA_PORCENTAJE,
  PARQUE_SGP_PORCENTAJE,
  PARQUE_SGP_MIN_CON_INGRESOS,
  PARQUE_SGP_MIN_SIN_INGRESOS,
  PARQUE_SGP_POR_PERSONA,
  FAMILIARES_CAPITAL,
  FAMILIARES_INTERIOR,
  INFANTILES_CAPITAL,
  INFANTILES_INTERIOR,
  EMPRESARIAL_CAPITAL,
  EMPRESARIAL_INTERIOR,
  ESTUDIANTIL_CAPITAL,
  ESTUDIANTIL_INTERIOR,
  CIRCO_USOS,
  TEATRO_USOS,
  UDA_SGP,
  VARIANTES_SIEMPRE_BAILE,
  buscarRango,
  buscarRangoDoble,
  getEvento,
  type Zona,
  type RangoTarifaDoble,
  type UsoCircoTeatro,
} from "./eventos-config";

export interface EventosInput {
  /** id del tipo de evento (ver EVENTOS en eventos-config) */
  tipo: string;
  /** variante elegida dentro del tipo (ej. "playback"), si corresponde */
  variante?: string | null;
  zona: Zona;
  personas: number;
  /** true si cobran entrada */
  conIngresos: boolean;
  /** Precio de la entrada en Gs. */
  precioEntrada: number;
  /** true si el evento incluye baile (empresariales y estudiantiles) */
  conBaile: boolean;
  /** Invitaciones de cortesía: se valoran aparte y se suman al final */
  cortesias: number;
  /** Aforo del local (circos y teatros) */
  aforo: number;
  /** Cantidad de funciones declaradas (circos y teatros) */
  funciones: number;
  /** Usos musicales seleccionados (circos y teatros) */
  usos: UsoCircoTeatro["id"][];
}

export type EventosResultado =
  | {
      estado: "ok";
      /** Valor total conjunto APA + SGP de la licencia, en Gs. */
      total: number;
      /** Filas de desglose. Nunca incluye el valor mínimo (SGP pidió ocultarlo). */
      detalle: { clave: string; valor: number }[];
      /** true si el total salió de un mínimo y no del cálculo sobre ingresos */
      aplicaMinimo: boolean;
      /** true si el valor sale de una tabla fija (no admite descuentos extra) */
      esTablaFija: boolean;
    }
  | {
      estado: "ejecutivo";
      /** Motivo por el que se deriva a un ejecutivo comercial */
      motivo: "superaTabla" | "concierto" | "combinacionInvalida";
    };

const ejecutivo = (
  motivo: "superaTabla" | "concierto" | "combinacionInvalida",
): EventosResultado => ({ estado: "ejecutivo", motivo });

/** Tabla doble (empresarial / estudiantil) según zona. */
function tablaDoble(
  tabla: RangoTarifaDoble[],
  personas: number,
  conBaile: boolean,
): number | null {
  const r = buscarRangoDoble(tabla, personas);
  if (!r) return null;
  const v = conBaile ? r.conBaile : r.sinBaile;
  return v ?? null;
}

function tablaEmpresarial(
  zona: Zona,
  personas: number,
  conBaile: boolean,
): number | null {
  return tablaDoble(
    zona === "capital" ? EMPRESARIAL_CAPITAL : EMPRESARIAL_INTERIOR,
    personas,
    conBaile,
  );
}

function tablaEstudiantil(
  zona: Zona,
  personas: number,
  conBaile: boolean,
): number | null {
  return tablaDoble(
    zona === "capital" ? ESTUDIANTIL_CAPITAL : ESTUDIANTIL_INTERIOR,
    personas,
    conBaile,
  );
}

function tablaFamiliares(zona: Zona, personas: number): number | null {
  // Interior cubre hasta 200; a partir de 201 aplica la tabla de Capital.
  if (zona === "interior" && personas <= 200) {
    return buscarRango(FAMILIARES_INTERIOR, personas)?.tarifa ?? null;
  }
  return buscarRango(FAMILIARES_CAPITAL, personas)?.tarifa ?? null;
}

function tablaInfantiles(zona: Zona, personas: number): number | null {
  const tabla = zona === "capital" ? INFANTILES_CAPITAL : INFANTILES_INTERIOR;
  return buscarRango(tabla, personas)?.tarifa ?? null;
}

/** Mínimo SGP para deportivos, con adicional acumulativo desde 5.001. */
export function minimoDeportivoSGP(personas: number): number {
  const r = buscarRango(DEPORTIVO_MINIMOS, personas);
  if (r) return r.tarifa;
  const bloques = Math.ceil((personas - 5_000) / 1_000);
  return DEPORTIVO_BASE_5000 + bloques * DEPORTIVO_ADICIONAL_POR_1000;
}

/** Tarifa por función de un uso de circo/teatro según aforo. */
export function tarifaUso(uso: UsoCircoTeatro, aforo: number): number {
  const topes = [200, 400, 600, 800, 1_000];
  const idx = topes.findIndex((t) => aforo <= t);
  if (idx >= 0) return uso.tramos[idx];
  // Por encima de 1.000: último tramo + adicional por bloque
  const bloques = Math.ceil((aforo - 1_000) / uso.adicionalCada);
  return uso.tramos[4] + bloques * uso.adicionalUda * UDA_SGP;
}

export function calcularEventos(input: EventosInput): EventosResultado {
  const evento = getEvento(input.tipo);
  if (!evento) return ejecutivo("superaTabla");

  const personas = Math.max(0, input.personas);
  const apa = personas * APA_POR_PERSONA;
  const ingresoTotal = Math.max(0, input.precioEntrada) * personas;
  const spec = evento.calculo;

  // Las cortesías se valoran a la tarifa mínima de baile por persona y se
  // suman DESPUÉS del cálculo: no forman parte de la base imponible.
  const cortesias =
    input.conIngresos && input.cortesias > 0
      ? Math.round(input.cortesias * POR_PERSONA_BAILE)
      : 0;
  const filaCortesias = cortesias > 0 ? [{ clave: "cortesias", valor: cortesias }] : [];

  // Las cortesías asisten al evento: cuentan para elegir el tramo de tabla o
  // de mínimo, aunque no hayan abonado entrada.
  const asistentes =
    personas + (input.conIngresos ? Math.max(0, input.cortesias) : 0);

  // Playback estudiantil: se liquida como bailable aunque se declare sin baile.
  const conBaile =
    input.variante && VARIANTES_SIEMPRE_BAILE.includes(input.variante)
      ? true
      : input.conBaile;

  switch (spec.modo) {
    case "derivaEjecutivo":
      return ejecutivo("concierto");

    case "porcentual": {
      if (input.conIngresos) {
        const porIngresos = ingresoTotal * spec.porcentaje;
        let minimo: number;
        if (spec.minCon.tipo === "fijoSGP") {
          // Las cortesías asisten, así que su APA integra el mínimo.
          minimo = spec.minCon.sgp + asistentes * APA_POR_PERSONA;
        } else {
          const t = tablaEmpresarial(input.zona, asistentes, spec.minCon.baile);
          if (t === null) return ejecutivo("superaTabla");
          minimo = t;
        }
        // El mínimo es un piso para todo el evento: si manda, ya contempla a
        // las cortesías y no se les cobra nada aparte.
        const calculado = porIngresos + cortesias;
        const aplicaMinimo = calculado < minimo;
        return {
          estado: "ok",
          total: Math.round(Math.max(calculado, minimo)),
          aplicaMinimo,
          esTablaFija: false,
          // Si manda el mínimo no se muestra el desglose: revelaría su valor.
          detalle: aplicaMinimo
            ? []
            : [
                { clave: "porcentajeIngresos", valor: Math.round(porIngresos) },
                ...filaCortesias,
              ],
        };
      }
      // SIN ingresos
      if (spec.sin.tipo === "tablaEmp") {
        const t = tablaEmpresarial(input.zona, personas, spec.sin.baile);
        if (t === null) return ejecutivo("superaTabla");
        return {
          estado: "ok",
          total: Math.round(t),
          aplicaMinimo: false,
          esTablaFija: true,
          detalle: [],
        };
      }
      // Por persona: SGP = max(personaSGP × p, minSGP); total = SGP + APA
      const sgpPorPersona = spec.sin.personaSGP * personas;
      const sgp = Math.max(sgpPorPersona, spec.sin.minSGP);
      return {
        estado: "ok",
        total: Math.round(sgp + apa),
        aplicaMinimo: sgpPorPersona < spec.sin.minSGP,
        esTablaFija: false,
        detalle: [],
      };
    }

    case "tablaFija": {
      const t =
        spec.tabla === "familiares"
          ? tablaFamiliares(input.zona, personas)
          : tablaInfantiles(input.zona, personas);
      if (t === null) return ejecutivo("superaTabla");
      return {
        estado: "ok",
        total: Math.round(t),
        aplicaMinimo: false,
        esTablaFija: true,
        detalle: [],
      };
    }

    case "empresarial": {
      const t = tablaEmpresarial(input.zona, personas, conBaile);
      if (t === null) return ejecutivo("superaTabla");
      return {
        estado: "ok",
        total: Math.round(t),
        aplicaMinimo: false,
        esTablaFija: true,
        detalle: [],
      };
    }

    case "estudiantil": {
      // Solo las fiestas bailables con imposición económica usan el 20%.
      const tabla = tablaEstudiantil(input.zona, asistentes, conBaile);
      if (tabla === null) return ejecutivo("superaTabla");
      if (input.conIngresos && conBaile) {
        const porIngresos = ingresoTotal * 0.2;
        const calculado = porIngresos + cortesias;
        const aplicaMinimo = calculado < tabla;
        return {
          estado: "ok",
          total: Math.round(Math.max(calculado, tabla)),
          aplicaMinimo,
          esTablaFija: false,
          detalle: aplicaMinimo
            ? []
            : [
                { clave: "porcentajeIngresos", valor: Math.round(porIngresos) },
                ...filaCortesias,
              ],
        };
      }
      return {
        estado: "ok",
        total: Math.round(tabla),
        aplicaMinimo: false,
        esTablaFija: true,
        detalle: [],
      };
    }

    case "academia": {
      // En academias de danza todos los eventos se liquidan como bailables.
      const tabla = tablaEstudiantil(input.zona, asistentes, true);
      if (tabla === null) return ejecutivo("superaTabla");
      if (input.conIngresos) {
        const porIngresos = ingresoTotal * 0.1;
        const calculado = porIngresos + cortesias;
        const aplicaMinimo = calculado < tabla;
        return {
          estado: "ok",
          total: Math.round(Math.max(calculado, tabla)),
          aplicaMinimo,
          esTablaFija: false,
          detalle: aplicaMinimo
            ? []
            : [
                { clave: "porcentajeIngresos", valor: Math.round(porIngresos) },
                ...filaCortesias,
              ],
        };
      }
      return {
        estado: "ok",
        total: Math.round(tabla),
        aplicaMinimo: false,
        esTablaFija: true,
        detalle: [],
      };
    }

    case "deportivo": {
      const cortesiasCant = input.conIngresos ? Math.max(0, input.cortesias) : 0;
      // Las cortesías asisten al evento, así que cuentan para el tramo del
      // mínimo de SGP, que se define por cantidad de asistentes.
      const minSGP = minimoDeportivoSGP(personas + cortesiasCant);

      if (input.conIngresos) {
        // APA y SGP se calculan por separado: el 0,5% de SGP se compara con
        // el mínimo de tabla y se aplica el mayor, luego se suma APA.
        const apaCalc = ingresoTotal * DEPORTIVO_APA_PORCENTAJE;
        // De la cortesía solo se suma su APA: la parte de SGP ya está
        // comprendida en el mínimo por cantidad de asistentes, y cobrarla
        // aparte contaría dos veces a la misma persona.
        const apaCortesias = cortesiasCant * APA_POR_PERSONA;
        const sgpPorc = ingresoTotal * DEPORTIVO_SGP_PORCENTAJE;
        const aplicaMinimo = sgpPorc < minSGP;
        const total = apaCalc + apaCortesias + Math.max(sgpPorc, minSGP);
        const filaCortesiasApa =
          apaCortesias > 0 ? [{ clave: "cortesias", valor: apaCortesias }] : [];
        return {
          estado: "ok",
          total: Math.round(total),
          aplicaMinimo,
          esTablaFija: false,
          detalle: aplicaMinimo
            ? filaCortesiasApa
            : [
                {
                  clave: "porcentajeIngresos",
                  valor: Math.round(apaCalc + sgpPorc),
                },
                ...filaCortesiasApa,
              ],
        };
      }
      return {
        estado: "ok",
        total: Math.round(minSGP + apa),
        aplicaMinimo: true,
        esTablaFija: false,
        detalle: [],
      };
    }

    case "apaSgp": {
      // APA y SGP se calculan por separado sobre la misma base. El mínimo es
      // solo de SGP, así que el APA siempre se suma encima.
      if (input.conIngresos) {
        const apaCalc = ingresoTotal * spec.apaPorc;
        const sgpCalc = ingresoTotal * spec.sgpPorc;
        const aplicaMinimo = sgpCalc < spec.minSgpCon;
        return {
          estado: "ok",
          total: Math.round(apaCalc + Math.max(sgpCalc, spec.minSgpCon)),
          aplicaMinimo,
          esTablaFija: false,
          detalle: aplicaMinimo
            ? []
            : [
                {
                  clave: "porcentajeIngresos",
                  valor: Math.round(apaCalc + sgpCalc),
                },
              ],
        };
      }
      // Sin ingresos: SGP por persona contra su mínimo, más el APA por cabeza.
      const sgpPorPersona = spec.sgpPorPersona * personas;
      return {
        estado: "ok",
        total: Math.round(Math.max(sgpPorPersona, spec.minSgpSin) + apa),
        aplicaMinimo: sgpPorPersona < spec.minSgpSin,
        esTablaFija: false,
        detalle: [],
      };
    }

    case "parque": {
      // Tarifa mensual. APA y SGP se calculan por separado; el mínimo de SGP
      // es mensual y depende de si hay obtención de ingresos.
      if (input.conIngresos) {
        const apaCalc = ingresoTotal * PARQUE_APA_PORCENTAJE;
        const sgpPorc = ingresoTotal * PARQUE_SGP_PORCENTAJE;
        const aplicaMinimo = sgpPorc < PARQUE_SGP_MIN_CON_INGRESOS;
        const total =
          apaCalc + Math.max(sgpPorc, PARQUE_SGP_MIN_CON_INGRESOS);
        return {
          estado: "ok",
          total: Math.round(total),
          aplicaMinimo,
          esTablaFija: false,
          detalle: aplicaMinimo
            ? []
            : [
                {
                  clave: "porcentajeIngresos",
                  valor: Math.round(apaCalc + sgpPorc),
                },
              ],
        };
      }
      // Sin ingresos: SGP por persona contra el mínimo mensual, más APA.
      const sgpPorPersona = PARQUE_SGP_POR_PERSONA * personas;
      const sgp = Math.max(sgpPorPersona, PARQUE_SGP_MIN_SIN_INGRESOS);
      return {
        estado: "ok",
        total: Math.round(sgp + apa),
        aplicaMinimo: sgpPorPersona < PARQUE_SGP_MIN_SIN_INGRESOS,
        esTablaFija: false,
        detalle: [],
      };
    }

    case "circoTeatro": {
      const usos = spec.establecimiento === "circo" ? CIRCO_USOS : TEATRO_USOS;
      const aforo = Math.max(0, input.aforo);
      const funciones = Math.max(1, input.funciones);

      if (input.usos.length === 0) return ejecutivo("combinacionInvalida");
      // En Teatro Musical la música es indispensable, no accesoria: se aplica
      // solo su tarifa y no se combina con ningún otro uso.
      if (input.usos.includes("musical") && input.usos.length > 1) {
        return ejecutivo("combinacionInvalida");
      }
      // En el resto, el uso en intervalos puede sumarse a uno de los usos
      // durante la puesta en escena, pero nunca los dos a la vez.
      if (
        input.usos.includes("durante_corto") &&
        input.usos.includes("durante_largo")
      ) {
        return ejecutivo("combinacionInvalida");
      }

      const detalle = input.usos.map((id) => {
        const uso = usos.find((u) => u.id === id)!;
        return { clave: id, valor: Math.round(tarifaUso(uso, aforo)) };
      });
      const porFuncion = detalle.reduce((acc, d) => acc + d.valor, 0);
      return {
        estado: "ok",
        total: Math.round(porFuncion * funciones),
        aplicaMinimo: false,
        esTablaFija: true,
        detalle:
          funciones > 1 ? [...detalle, { clave: "funciones", valor: funciones }] : detalle,
      };
    }
  }
}
