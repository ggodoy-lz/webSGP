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
  ejeDeRepeticion,
  type Zona,
  type RangoTarifaDoble,
  type UsoCircoTeatro,
  type CalculoSpec,
} from "./eventos-config";

/** Una fila declarada: un sector del evento o una fecha del período. */
export interface FilaEvento {
  /** Nombre libre del sector o de la fecha, para el desglose */
  etiqueta?: string;
  personas: number;
  precioEntrada: number;
}

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
  /**
   * Sectores o fechas declarados. Si viene vacío se usa `personas` y
   * `precioEntrada` como fila única.
   */
  filas?: FilaEvento[];
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
      detalle: { clave: string; valor: number; etiqueta?: string }[];
      /** true si el total salió de un mínimo y no del cálculo sobre ingresos */
      aplicaMinimo: boolean;
      /** true si el valor sale de una tabla fija (no admite descuentos extra) */
      esTablaFija: boolean;
    }
  | {
      estado: "ejecutivo";
      /** Motivo por el que se deriva a un ejecutivo comercial */
      motivo: "superaTabla" | "concierto" | "combinacionInvalida" | "otros";
    };

const ejecutivo = (
  motivo: "superaTabla" | "concierto" | "combinacionInvalida" | "otros",
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

/**
 * Calcula una unidad de liquidación: un evento completo, o una fecha suelta
 * cuando el tipo se declara por fechas. Recibe los agregados ya resueltos para
 * que quien la llame decida si suma las filas antes (sectores de un mismo
 * evento, un solo mínimo) o después (fechas distintas, un mínimo cada una).
 */
function calcularUnidad(
  spec: CalculoSpec,
  input: EventosInput,
  personas: number,
  ingresoTotal: number,
  cortesiasCant: number,
): EventosResultado {
  const apa = personas * APA_POR_PERSONA;

  // Las cortesías se valoran a la tarifa mínima de baile por persona y se
  // suman DESPUÉS del cálculo: no forman parte de la base imponible.
  const cortesias =
    input.conIngresos && cortesiasCant > 0
      ? Math.round(cortesiasCant * POR_PERSONA_BAILE)
      : 0;
  const filaCortesias = cortesias > 0 ? [{ clave: "cortesias", valor: cortesias }] : [];

  // Las cortesías asisten al evento: cuentan para elegir el tramo de tabla o
  // de mínimo, aunque no hayan abonado entrada.
  const asistentes = personas + (input.conIngresos ? cortesiasCant : 0);

  // Playback estudiantil: se liquida como bailable aunque se declare sin baile.
  const conBaile =
    input.variante && VARIANTES_SIEMPRE_BAILE.includes(input.variante)
      ? true
      : input.conBaile;

  switch (spec.modo) {
    case "derivaEjecutivo":
      return ejecutivo(spec.motivo);

    case "estudiantilFijo": {
      // Solo zona y cantidad: siempre la tabla de uso secundario.
      const tabla = tablaEstudiantil(input.zona, personas, false);
      if (tabla === null) return ejecutivo("superaTabla");
      return {
        estado: "ok",
        total: Math.round(tabla),
        aplicaMinimo: false,
        esTablaFija: true,
        detalle: [],
      };
    }

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
      // Las cortesías asisten al evento, así que cuentan para el tramo del
      // mínimo de SGP, que se define por cantidad de asistentes.
      const minSGP = minimoDeportivoSGP(asistentes);

      if (input.conIngresos) {
        // APA y SGP se calculan por separado: el 0,5% de SGP se compara con
        // el mínimo de tabla y se aplica el mayor, luego se suma APA.
        // El APA nunca baja de 2.940 por persona.
        const apaPorc = ingresoTotal * DEPORTIVO_APA_PORCENTAJE;
        const apaCalc = Math.max(apaPorc, personas * APA_POR_PERSONA);
        // De la cortesía solo se suma su APA: la parte de SGP ya está
        // comprendida en el mínimo por cantidad de asistentes, y cobrarla
        // aparte contaría dos veces a la misma persona.
        const apaCortesias = cortesiasCant * APA_POR_PERSONA;
        const sgpPorc = ingresoTotal * DEPORTIVO_SGP_PORCENTAJE;
        const aplicaMinimo =
          sgpPorc < minSGP || apaPorc < personas * APA_POR_PERSONA;
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
      // APA y SGP se calculan por separado sobre la misma base, y cada uno
      // tiene su propio piso: se aplica el mayor de cada lado y se suman.
      if (input.conIngresos) {
        // Las cortesías se liquidan al valor por persona del propio evento:
        // su parte de SGP más los 2.940 de APA.
        const apaCortesias = cortesiasCant * APA_POR_PERSONA;
        const sgpCortesias = cortesiasCant * spec.sgpPorPersona;

        const apaCalc = Math.max(
          ingresoTotal * spec.apaPorc,
          personas * APA_POR_PERSONA,
        );
        const sgpCalc = Math.max(ingresoTotal * spec.sgpPorc, spec.minSgpCon);
        const aplicaMinimo =
          ingresoTotal * spec.sgpPorc < spec.minSgpCon ||
          ingresoTotal * spec.apaPorc < personas * APA_POR_PERSONA;

        const cortesiasGs = Math.round(apaCortesias + sgpCortesias);
        return {
          estado: "ok",
          total: Math.round(apaCalc + sgpCalc) + cortesiasGs,
          aplicaMinimo,
          esTablaFija: false,
          detalle: cortesiasGs > 0 ? [{ clave: "cortesias", valor: cortesiasGs }] : [],
        };
      }
      // Sin ingresos: cada lado contra su propio piso por persona.
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
        // El APA nunca baja de 2.940 por persona.
        const apaPorc = ingresoTotal * PARQUE_APA_PORCENTAJE;
        const apaCalc = Math.max(apaPorc, personas * APA_POR_PERSONA);
        const sgpPorc = ingresoTotal * PARQUE_SGP_PORCENTAJE;
        const aplicaMinimo =
          sgpPorc < PARQUE_SGP_MIN_CON_INGRESOS ||
          apaPorc < personas * APA_POR_PERSONA;
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

/** Filas declaradas, o una sola armada con los valores sueltos del input. */
function normalizarFilas(input: EventosInput): FilaEvento[] {
  const filas = (input.filas ?? []).filter(
    (f) => f.personas > 0 || f.precioEntrada > 0,
  );
  if (filas.length > 0) return filas;
  return [{ personas: input.personas, precioEntrada: input.precioEntrada }];
}

export function calcularEventos(input: EventosInput): EventosResultado {
  const evento = getEvento(input.tipo);
  if (!evento) return ejecutivo("superaTabla");

  const spec = evento.calculo;
  const filas = normalizarFilas(input);
  const cortesias = input.conIngresos ? Math.max(0, input.cortesias) : 0;
  const eje = ejeDeRepeticion(spec.modo);

  // Fechas distintas: cada una se liquida entera, con su propio mínimo, y
  // recién después se suman. Es lo que pidió SGP (opción B).
  if (eje === "fechas" && filas.length > 1) {
    const parciales: { fila: FilaEvento; res: EventosResultado }[] = filas.map(
      (fila, i) => ({
        fila,
        // Las cortesías pertenecen al evento, no a cada jornada: se cargan
        // una sola vez, en la primera fecha.
        res: calcularUnidad(
          spec,
          input,
          Math.max(0, fila.personas),
          Math.max(0, fila.precioEntrada) * Math.max(0, fila.personas),
          i === 0 ? cortesias : 0,
        ),
      }),
    );

    const derivada = parciales.find((p) => p.res.estado === "ejecutivo");
    if (derivada && derivada.res.estado === "ejecutivo") {
      return ejecutivo(derivada.res.motivo);
    }

    let total = 0;
    let aplicaMinimo = false;
    let esTablaFija = true;
    const detalle = parciales.map(({ fila, res }, i) => {
      if (res.estado !== "ok") throw new Error("unreachable");
      total += res.total;
      aplicaMinimo = aplicaMinimo || res.aplicaMinimo;
      esTablaFija = esTablaFija && res.esTablaFija;
      return {
        clave: `fila-${i}`,
        valor: res.total,
        etiqueta: fila.etiqueta?.trim() || undefined,
      };
    });

    return { estado: "ok", total, detalle, aplicaMinimo, esTablaFija };
  }

  // Sectores de un mismo evento (o fila única): se suman las bases y se
  // aplica un solo mínimo al conjunto.
  const personas = filas.reduce((acc, f) => acc + Math.max(0, f.personas), 0);
  const ingresoTotal = filas.reduce(
    (acc, f) => acc + Math.max(0, f.personas) * Math.max(0, f.precioEntrada),
    0,
  );
  return calcularUnidad(spec, input, personas, ingresoTotal, cortesias);
}
