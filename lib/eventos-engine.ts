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
  DEPORTIVO_PORCENTAJE,
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
  zona: Zona;
  personas: number;
  /** true si cobran entrada / cover */
  conIngresos: boolean;
  /** Precio de la entrada en Gs. */
  precioEntrada: number;
  /** true si el evento incluye baile (empresariales y estudiantiles) */
  conBaile: boolean;
  /** Invitaciones de cortesía (Academias de Danza) */
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
      /** Tarifa total conjunta APA + SGP en Gs. */
      total: number;
      /** Filas de desglose para mostrar cómo se llegó al total */
      detalle: { clave: string; valor: number }[];
      /** true si el total salió de un mínimo y no del cálculo sobre ingresos */
      aplicaMinimo: boolean;
    }
  | {
      estado: "ejecutivo";
      /** Motivo por el que se deriva a un ejecutivo comercial */
      motivo: "superaTabla" | "concierto" | "musicalProporcional";
    };

const ejecutivo = (
  motivo: "superaTabla" | "concierto" | "musicalProporcional",
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

  switch (spec.modo) {
    case "derivaEjecutivo":
      return ejecutivo("concierto");

    case "porcentual": {
      if (input.conIngresos) {
        const porIngresos = ingresoTotal * spec.porcentaje;
        let minimo: number;
        if (spec.minCon.tipo === "fijoSGP") {
          minimo = spec.minCon.sgp + apa;
        } else {
          const t = tablaEmpresarial(input.zona, personas, spec.minCon.baile);
          if (t === null) return ejecutivo("superaTabla");
          minimo = t;
        }
        const total = Math.max(porIngresos, minimo);
        return {
          estado: "ok",
          total: Math.round(total),
          aplicaMinimo: porIngresos < minimo,
          detalle: [
            { clave: "porcentajeIngresos", valor: Math.round(porIngresos) },
            { clave: "minimo", valor: Math.round(minimo) },
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
          aplicaMinimo: true,
          detalle: [{ clave: "tablaFija", valor: Math.round(t) }],
        };
      }
      // Por persona: SGP = max(personaSGP × p, minSGP); total = SGP + APA
      const sgpPorPersona = spec.sin.personaSGP * personas;
      const sgp = Math.max(sgpPorPersona, spec.sin.minSGP);
      const total = sgp + apa;
      return {
        estado: "ok",
        total: Math.round(total),
        aplicaMinimo: sgpPorPersona < spec.sin.minSGP,
        detalle: [
          { clave: "porPersona", valor: Math.round(sgpPorPersona + apa) },
          { clave: "minimo", valor: Math.round(spec.sin.minSGP + apa) },
        ],
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
        detalle: [{ clave: "tablaFija", valor: Math.round(t) }],
      };
    }

    case "empresarial": {
      const t = tablaEmpresarial(input.zona, personas, input.conBaile);
      if (t === null) return ejecutivo("superaTabla");
      return {
        estado: "ok",
        total: Math.round(t),
        aplicaMinimo: false,
        detalle: [{ clave: "tablaFija", valor: Math.round(t) }],
      };
    }

    case "estudiantil": {
      // Solo las fiestas bailables con imposición económica usan el 20%.
      const tabla = tablaEstudiantil(input.zona, personas, input.conBaile);
      if (tabla === null) return ejecutivo("superaTabla");
      if (input.conIngresos && input.conBaile) {
        const porIngresos = ingresoTotal * 0.2;
        const total = Math.max(porIngresos, tabla);
        return {
          estado: "ok",
          total: Math.round(total),
          aplicaMinimo: porIngresos < tabla,
          detalle: [
            { clave: "porcentajeIngresos", valor: Math.round(porIngresos) },
            { clave: "minimo", valor: Math.round(tabla) },
          ],
        };
      }
      return {
        estado: "ok",
        total: Math.round(tabla),
        aplicaMinimo: false,
        detalle: [{ clave: "tablaFija", valor: Math.round(tabla) }],
      };
    }

    case "academia": {
      const tabla = tablaEstudiantil(input.zona, personas, input.conBaile);
      if (tabla === null) return ejecutivo("superaTabla");
      // Las cortesías se SUMAN después de aplicar el 10%: no integran la base.
      const cortesias = Math.max(0, input.cortesias) * POR_PERSONA_BAILE;
      if (input.conIngresos) {
        const porIngresos = ingresoTotal * 0.1;
        const base = Math.max(porIngresos, tabla);
        const total = base + cortesias;
        return {
          estado: "ok",
          total: Math.round(total),
          aplicaMinimo: porIngresos < tabla,
          detalle: [
            { clave: "porcentajeIngresos", valor: Math.round(porIngresos) },
            { clave: "minimo", valor: Math.round(tabla) },
            { clave: "cortesias", valor: Math.round(cortesias) },
          ],
        };
      }
      return {
        estado: "ok",
        total: Math.round(tabla + cortesias),
        aplicaMinimo: false,
        detalle: [
          { clave: "tablaFija", valor: Math.round(tabla) },
          { clave: "cortesias", valor: Math.round(cortesias) },
        ],
      };
    }

    case "deportivo": {
      const minSGP = minimoDeportivoSGP(personas);
      const minimo = minSGP + apa;
      if (input.conIngresos) {
        const porIngresos = ingresoTotal * DEPORTIVO_PORCENTAJE;
        const total = Math.max(porIngresos, minimo);
        return {
          estado: "ok",
          total: Math.round(total),
          aplicaMinimo: porIngresos < minimo,
          detalle: [
            { clave: "porcentajeIngresos", valor: Math.round(porIngresos) },
            { clave: "minimo", valor: Math.round(minimo) },
          ],
        };
      }
      return {
        estado: "ok",
        total: Math.round(minimo),
        aplicaMinimo: true,
        detalle: [{ clave: "minimo", valor: Math.round(minimo) }],
      };
    }

    case "circoTeatro": {
      const usos = spec.establecimiento === "circo" ? CIRCO_USOS : TEATRO_USOS;
      const aforo = Math.max(0, input.aforo);
      const funciones = Math.max(1, input.funciones);

      // El descuento proporcional de Musicales no se calcula en la web.
      if (input.usos.includes("musical")) {
        return ejecutivo("musicalProporcional");
      }
      // Combinaciones válidas: A, B, C, A+B o A+C. Nunca B+C.
      if (
        input.usos.includes("durante_corto") &&
        input.usos.includes("durante_largo")
      ) {
        return ejecutivo("superaTabla");
      }
      if (input.usos.length === 0) return ejecutivo("superaTabla");

      const detalle = input.usos.map((id) => {
        const uso = usos.find((u) => u.id === id)!;
        return { clave: id, valor: Math.round(tarifaUso(uso, aforo)) };
      });
      const porFuncion = detalle.reduce((acc, d) => acc + d.valor, 0);
      return {
        estado: "ok",
        total: Math.round(porFuncion * funciones),
        aplicaMinimo: false,
        detalle: [...detalle, { clave: "funciones", valor: funciones }],
      };
    }
  }
}
