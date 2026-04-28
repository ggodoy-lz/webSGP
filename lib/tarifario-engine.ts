/* ── Tarifario SGP – Motor de cálculo ───────────────────────────────────── */

import {
  UDA,
  INCIDENCIAS,
  CATEGORIA_DEFAULT,
  CATEGORIAS_HOTEL,
  MEDIOS_DE_USO,
  DESCUENTO_AFORO,
  HORAS_POR_TURNO,
  MINUTOS_POR_SESION,
  AFORO_MESA,
  AFORO_BUTACA,
  AFORO_ESTACION_ESTETICA,
  AFORO_ESTACION_GYM,
  AFORO_SILLA_OFICINA,
  AFORO_CAMA_HOTEL,
  TOPE_M2_GRANDES,
  TOPE_AFORO_EFECTIVO_GRANDES,
  UDA_PORCENTAJE_GRANDES,
  SHOPPING_TIPOS,
  ENTRETENIMIENTO_HORAS,
  ENTRETENIMIENTO_HORAS_DEFAULT,
  HORAS_ESTETICA_DOM_JUE,
  HORAS_ESTETICA_VIE_SAB,
  ACADEMIA_ADICIONAL_POR_25,
  TARIFA_MINIMA_OFICINAS,
  buscarRangoM2,
  buscarRangoAcademia,
  buscarRangoAcademiaInterior,
  getGimnasioSubtipo,
  type GrupoId,
  type MedioDeUso,
  type DiaSemana,
  type Turno,
  type CategoriaHotel,
} from "./tarifario-config";

// ── Tipos de input ─────────────────────────────────────────────────────────

export interface TarifarioInput {
  grupo: GrupoId;
  tipoLocal: string;
  medio?: MedioDeUso;

  // Gastronomía
  mesas?: number;
  butacas?: number;

  // Comercial / Entretenimiento
  metrosCuadrados?: number;

  // Hoteles
  habitaciones?: number;
  categoriaHotel?: CategoriaHotel;

  // Estética
  estaciones?: number;

  // Academias
  alumnos?: number;
  ubicacion?: "capital" | "interior";

  // Gimnasios
  maquinas?: number;
  sesionesPorDia?: number;

  // Oficinas
  sillasEspera?: number;

  // Motel
  camas?: number;

  // Horarios
  dias?: DiaSemana[];
  turnos?: Turno[];
}

export interface TarifarioResult {
  tarifa: number;
  disclaimer: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function calcularHorasMensuales(
  dias: DiaSemana[],
  turnos: Turno[],
): number {
  const horasPorDia = turnos.reduce((acc, t) => acc + HORAS_POR_TURNO[t], 0);
  const diasPorSemana = dias.length;
  return horasPorDia * diasPorSemana * 4; // 4 semanas por mes según spec
}

function calcularHorasEstandarMensuales(
  dias: DiaSemana[],
  horasPorDia: number,
): number {
  return dias.length * horasPorDia * 4;
}

function calcularHorasEsteticaMensuales(dias: DiaSemana[]): number {
  let total = 0;
  for (const d of dias) {
    if (d === "vie" || d === "sab") {
      total += HORAS_ESTETICA_VIE_SAB;
    } else {
      total += HORAS_ESTETICA_DOM_JUE;
    }
  }
  return total * 4;
}

function formulaBase(
  udaEfectivo: number,
  aforoNeto: number,
  horasMes: number,
  categoria: number,
  medioUso: number,
): number {
  return Math.round(udaEfectivo * aforoNeto * horasMes * categoria * medioUso);
}

// ── Cálculos por grupo ─────────────────────────────────────────────────────

function calcularGastronomia(input: TarifarioInput): number {
  const mesas = input.mesas ?? 0;
  const butacas = input.butacas ?? 0;
  const aforoBruto = mesas * AFORO_MESA + butacas * AFORO_BUTACA;
  const aforoNeto = aforoBruto * DESCUENTO_AFORO;
  const udaEfectivo = UDA * INCIDENCIAS.secundaria;
  const horas = calcularHorasMensuales(input.dias ?? [], input.turnos ?? []);
  const medio = MEDIOS_DE_USO[input.medio ?? "parlante"];
  return formulaBase(udaEfectivo, aforoNeto, horas, CATEGORIA_DEFAULT, medio);
}

function calcularComercial(input: TarifarioInput): number {
  const m2 = input.metrosCuadrados ?? 0;

  if (m2 > 500) {
    return calcularComercialGrande(input);
  }

  const rango = buscarRangoM2(m2);
  if (!rango) return 0;

  const aforoNeto = rango.circ10;
  const udaEfectivo = UDA * INCIDENCIAS.secundaria;
  const isShopping = SHOPPING_TIPOS.includes(input.tipoLocal);
  const horasStd = isShopping ? 8 : 6;
  const horas = calcularHorasEstandarMensuales(input.dias ?? [], horasStd);
  const medio = MEDIOS_DE_USO[input.medio ?? "parlante"];
  return formulaBase(udaEfectivo, aforoNeto, horas, CATEGORIA_DEFAULT, medio);
}

function calcularComercialGrande(input: TarifarioInput): number {
  const m2 = Math.min(input.metrosCuadrados ?? 0, TOPE_M2_GRANDES);
  const circ10 = m2 * 0.10;
  const aforoEfectivo = Math.min(circ10, TOPE_AFORO_EFECTIVO_GRANDES);
  const aforoNeto = aforoEfectivo * DESCUENTO_AFORO;
  const udaEfectivo = UDA * UDA_PORCENTAJE_GRANDES;
  const isShopping = SHOPPING_TIPOS.includes(input.tipoLocal);
  const horasStd = isShopping ? 8 : 6;
  const horas = horasStd * 30; // locales grandes: abiertos los 30 días del mes
  const medio = MEDIOS_DE_USO[input.medio ?? "parlante"];
  return formulaBase(udaEfectivo, aforoNeto, horas, CATEGORIA_DEFAULT, medio);
}

function calcularEntretenimiento(input: TarifarioInput): number {
  const m2 = input.metrosCuadrados ?? 0;
  // Grupo 3: aforo = 100% del m² total, sin reducción del 60%
  const aforoNeto = m2;
  const udaEfectivo = UDA * INCIDENCIAS.indispensable;
  const hPorDia = ENTRETENIMIENTO_HORAS[input.tipoLocal] ?? ENTRETENIMIENTO_HORAS_DEFAULT;
  const horas = calcularHorasEstandarMensuales(input.dias ?? [], hPorDia);
  const medio = MEDIOS_DE_USO.parlante;
  return formulaBase(udaEfectivo, aforoNeto, horas, CATEGORIA_DEFAULT, medio);
}

function calcularHoteles(input: TarifarioInput): number {
  // Fórmula lineal: habitaciones × (UDA × % según categoría de estrellas)
  const habitaciones = input.habitaciones ?? 0;
  const cat = input.categoriaHotel ?? 3;
  const multiplicador = CATEGORIAS_HOTEL[cat] ?? CATEGORIAS_HOTEL[3];
  return Math.round(habitaciones * (UDA * multiplicador));
}

function calcularEstetica(input: TarifarioInput): number {
  const estaciones = input.estaciones ?? 0;
  const aforoBruto = estaciones * AFORO_ESTACION_ESTETICA;
  const aforoNeto = aforoBruto * DESCUENTO_AFORO;
  const udaEfectivo = UDA * INCIDENCIAS.secundaria;
  const horas = calcularHorasEsteticaMensuales(input.dias ?? []);
  const medio = MEDIOS_DE_USO[input.medio ?? "parlante"];
  return formulaBase(udaEfectivo, aforoNeto, horas, CATEGORIA_DEFAULT, medio);
}

function calcularAcademias(input: TarifarioInput): number {
  const alumnos = input.alumnos ?? 0;
  const esInterior = input.ubicacion === "interior";
  const rango = esInterior
    ? buscarRangoAcademiaInterior(alumnos)
    : buscarRangoAcademia(alumnos);
  if (!rango) return 0;

  let tarifa = rango.tarifaTotal;

  if (alumnos > 300) {
    const excedente = alumnos - 300;
    const bloques = Math.ceil(excedente / 25);
    tarifa = rango.tarifaTotal + bloques * ACADEMIA_ADICIONAL_POR_25;
  }

  return tarifa;
}

function calcularGimnasios(input: TarifarioInput): number {
  const subtipo = getGimnasioSubtipo(input.tipoLocal);
  const maquinas = input.maquinas ?? 0;
  const aforoBruto = maquinas * AFORO_ESTACION_GYM;
  const aforoNeto = aforoBruto * DESCUENTO_AFORO;

  let udaEfectivo: number;
  let medio: number;
  let horas: number;

  if (subtipo === "secundario") {
    udaEfectivo = UDA * INCIDENCIAS.secundaria;
    medio = MEDIOS_DE_USO[input.medio ?? "parlante"];
    horas = calcularHorasEstandarMensuales(input.dias ?? [], 6);
  } else if (subtipo === "necesario") {
    udaEfectivo = UDA * INCIDENCIAS.necesaria;
    medio = MEDIOS_DE_USO.parlante;
    const sesiones = input.sesionesPorDia ?? 0;
    const diasPorSemana = (input.dias ?? []).length;
    const horasPorSesion = MINUTOS_POR_SESION / 60;
    horas = sesiones * horasPorSesion * diasPorSemana * 4;
  } else {
    udaEfectivo = UDA * INCIDENCIAS.indispensable;
    medio = MEDIOS_DE_USO.parlante;
    const sesiones = input.sesionesPorDia ?? 0;
    const diasPorSemana = (input.dias ?? []).length;
    const horasPorSesion = MINUTOS_POR_SESION / 60;
    horas = sesiones * horasPorSesion * diasPorSemana * 4;
  }

  return formulaBase(udaEfectivo, aforoNeto, horas, CATEGORIA_DEFAULT, medio);
}

function calcularOficinas(input: TarifarioInput): number {
  const sillas = input.sillasEspera ?? 0;
  const aforoBruto = sillas * AFORO_SILLA_OFICINA;
  const aforoNeto = aforoBruto * DESCUENTO_AFORO;
  const udaEfectivo = UDA * INCIDENCIAS.secundaria;
  const horas = calcularHorasEstandarMensuales(input.dias ?? [], 6);
  const medio = MEDIOS_DE_USO[input.medio ?? "parlante"];
  const tarifa = formulaBase(udaEfectivo, aforoNeto, horas, CATEGORIA_DEFAULT, medio);
  // Tarifa mínima: 7.5 × UDA = 294.000 Gs.
  return Math.max(tarifa, TARIFA_MINIMA_OFICINAS);
}

function calcularMotel(input: TarifarioInput): number {
  const camas = input.camas ?? 0;
  const aforoBruto = camas * AFORO_CAMA_HOTEL;
  const aforoNeto = aforoBruto * DESCUENTO_AFORO;
  const udaEfectivo = UDA * INCIDENCIAS.secundaria;
  const horas = 6 * 30; // 6h x 30 días (abre todos los días)
  const medio = MEDIOS_DE_USO[input.medio ?? "parlante"];
  return formulaBase(udaEfectivo, aforoNeto, horas, CATEGORIA_DEFAULT, medio);
}

// ── Dispatcher principal ──────────────────────────────────────────────────

export function calcularTarifa(input: TarifarioInput): TarifarioResult {
  let tarifa = 0;

  switch (input.grupo) {
    case "gastronomia":
      tarifa = calcularGastronomia(input);
      break;
    case "comercial":
      tarifa = calcularComercial(input);
      break;
    case "entretenimiento":
      tarifa = calcularEntretenimiento(input);
      break;
    case "hoteles":
      tarifa = calcularHoteles(input);
      break;
    case "estetica":
      tarifa = calcularEstetica(input);
      break;
    case "academias":
      tarifa = calcularAcademias(input);
      break;
    case "gimnasios":
      tarifa = calcularGimnasios(input);
      break;
    case "oficinas":
      tarifa = calcularOficinas(input);
      break;
    case "motel":
      tarifa = calcularMotel(input);
      break;
  }

  return {
    tarifa,
    disclaimer:
      "Este valor es una estimación orientativa. SGP confirmará la tarifa final luego de verificar los datos declarados.",
  };
}
