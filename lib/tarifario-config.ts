/* ── Tarifario SGP – Configuración central ──────────────────────────────── */

// ── Tipos ──────────────────────────────────────────────────────────────────

export type Incidencia = "secundaria" | "necesaria" | "indispensable";
export type MedioDeUso = "parlante" | "televisor";
export type Turno = "manana" | "mediodia" | "tarde" | "noche";
export type DiaSemana = "dom" | "lun" | "mar" | "mie" | "jue" | "vie" | "sab";

export interface AforoRangoM2 {
  desde: number;
  hasta: number;
  m2Promedio: number;
  porcAforo: number;
  aforo: number;
  aforo60: number;
  circ10: number;
}

export interface AcademiaRango {
  desde: number;
  hasta: number;
  udaSGP: number;
  udaAPA: number;
  tarifaTotal: number;
}

export type GrupoId =
  | "gastronomia"
  | "comercial"
  | "entretenimiento"
  | "hoteles"
  | "estetica"
  | "academias"
  | "gimnasios"
  | "oficinas"
  | "motel";

export interface GrupoConfig {
  id: GrupoId;
  incidencia: Incidencia;
  medioFijo?: MedioDeUso;
  horasEstandar?: number;
  tipos: string[];
}

export type CategoriaHotel = 1 | 2 | 3 | 4 | 5;

export type GimnasioSubtipo = "secundario" | "necesario" | "indispensable";

// ── Constantes ─────────────────────────────────────────────────────────────

export const UDA = 39_200;

export const INCIDENCIAS: Record<Incidencia, number> = {
  secundaria: 0.33,
  necesaria: 0.60,
  indispensable: 1.00,
};

export const CATEGORIA_DEFAULT = 0.24;

// 1–3 estrellas / sin categ = 20% | 4 estrellas = 30% | 5 estrellas = 40%
export const CATEGORIAS_HOTEL: Record<CategoriaHotel, number> = {
  1: 0.20,
  2: 0.20,
  3: 0.20,
  4: 0.30,
  5: 0.40,
};

export const MEDIOS_DE_USO: Record<MedioDeUso, number> = {
  parlante: 0.15,
  televisor: 0.12,
};

export const DESCUENTO_AFORO = 0.60;

export const HORAS_POR_TURNO: Record<Turno, number> = {
  manana: 4,
  mediodia: 3,
  tarde: 4,
  noche: 5,
};

export const DIAS_SEMANA: DiaSemana[] = [
  "dom", "lun", "mar", "mie", "jue", "vie", "sab",
];

export const MINUTOS_POR_SESION = 40;

// ── Tabla de aforo por m² (sección 3 del documento) ───────────────────────

export const TABLA_AFORO_M2: AforoRangoM2[] = [
  { desde: 0,   hasta: 15,   m2Promedio: 15,  porcAforo: 1.00, aforo: 15,  aforo60: 9,   circ10: 0.9  },
  { desde: 16,  hasta: 25,   m2Promedio: 21,  porcAforo: 0.95, aforo: 19,  aforo60: 12,  circ10: 1.2  },
  { desde: 26,  hasta: 50,   m2Promedio: 38,  porcAforo: 0.77, aforo: 29,  aforo60: 18,  circ10: 1.8  },
  { desde: 51,  hasta: 75,   m2Promedio: 63,  porcAforo: 0.63, aforo: 40,  aforo60: 24,  circ10: 2.4  },
  { desde: 76,  hasta: 100,  m2Promedio: 88,  porcAforo: 0.57, aforo: 50,  aforo60: 30,  circ10: 3.0  },
  { desde: 101, hasta: 150,  m2Promedio: 126, porcAforo: 0.56, aforo: 70,  aforo60: 42,  circ10: 4.2  },
  { desde: 151, hasta: 200,  m2Promedio: 176, porcAforo: 0.51, aforo: 90,  aforo60: 54,  circ10: 5.4  },
  { desde: 201, hasta: 250,  m2Promedio: 226, porcAforo: 0.48, aforo: 108, aforo60: 65,  circ10: 6.5  },
  { desde: 251, hasta: 300,  m2Promedio: 276, porcAforo: 0.47, aforo: 129, aforo60: 78,  circ10: 7.8  },
  { desde: 301, hasta: 400,  m2Promedio: 351, porcAforo: 0.46, aforo: 161, aforo60: 97,  circ10: 9.7  },
  { desde: 401, hasta: 500,  m2Promedio: 451, porcAforo: 0.42, aforo: 189, aforo60: 114, circ10: 11.4 },
];

// ── Academias de danza – tarifa fija conjunta SGP + APA ───────────────────

export const TABLA_ACADEMIAS: AcademiaRango[] = [
  { desde: 1,   hasta: 50,  udaSGP: 4,  udaAPA: 0.50, tarifaTotal: 205_800 },
  { desde: 51,  hasta: 100, udaSGP: 6,  udaAPA: 0.75, tarifaTotal: 308_700 },
  { desde: 101, hasta: 200, udaSGP: 8,  udaAPA: 1.25, tarifaTotal: 436_100 },
  { desde: 201, hasta: 300, udaSGP: 10, udaAPA: 1.75, tarifaTotal: 563_500 },
  { desde: 301, hasta: 999, udaSGP: 12, udaAPA: 2.00, tarifaTotal: 666_400 },
];

export const ACADEMIA_ADICIONAL_POR_25 = 78_400;

export const TABLA_ACADEMIAS_INTERIOR: AcademiaRango[] = [
  { desde: 1,   hasta: 50,  udaSGP: 4,  udaAPA: 0.50, tarifaTotal: 102_900 },
  { desde: 51,  hasta: 100, udaSGP: 6,  udaAPA: 0.75, tarifaTotal: 154_840 },
  { desde: 101, hasta: 200, udaSGP: 8,  udaAPA: 1.25, tarifaTotal: 218_540 },
  { desde: 201, hasta: 300, udaSGP: 10, udaAPA: 1.75, tarifaTotal: 282_240 },
  { desde: 301, hasta: 999, udaSGP: 12, udaAPA: 2.00, tarifaTotal: 333_200 },
];

export const TARIFA_MINIMA_OFICINAS = 294_000; // 7.5 × UDA

// ── Constantes de aforo por grupo ─────────────────────────────────────────

export const AFORO_MESA = 0.49;
export const AFORO_BUTACA = 0.16;
export const AFORO_ESTACION_ESTETICA = 0.64;
export const AFORO_ESTACION_GYM = 0.16;
export const AFORO_SILLA_OFICINA = 0.16;
export const AFORO_CAMA_HOTEL = 0.864;

export const TOPE_M2_GRANDES = 2000;
export const TOPE_AFORO_EFECTIVO_GRANDES = 200;
export const UDA_PORCENTAJE_GRANDES = 0.05;

// ── Grupos de rubros ──────────────────────────────────────────────────────

export const GRUPOS: GrupoConfig[] = [
  {
    id: "gastronomia",
    incidencia: "secundaria",
    tipos: [
      "Bar", "Restaurante", "Restobar", "Confitería", "Churrasquería",
      "Pizzería", "Cafetería", "Pollería", "Heladería", "Comedor al Paso",
      "Copetín", "Cantina", "Quiosco", "Rotisería", "Bodega",
      "Sandwichería", "Hamburguesería", "Parrillada", "Food Park",
      "Food Truck", "Fast Food", "Panadería", "Panchería", "Vinoteca",
      "Juguería", "Lomitería", "Cervecería", "Taquería", "Otro",
    ],
  },
  {
    id: "comercial",
    incidencia: "secundaria",
    tipos: [
      "Tienda de Ropa", "Tienda de Calzado", "Electrónica/Tecnología",
      "Supermercado", "Minimercado", "Mini Market", "Farmacia",
      "Librería", "Joyería", "Ferretería", "Mueblería", "Tienda de Regalos",
      "Galería Comercial", "Galería de Arte", "Despensa", "Conveniencia",
      "Shopping", "Centro Comercial", "Otro",
    ],
    horasEstandar: 6,
  },
  {
    id: "entretenimiento",
    incidencia: "indispensable",
    medioFijo: "parlante",
    horasEstandar: 6,
    tipos: [
      "Discoteca", "Karaoke", "Pub con Baile", "Bar con Baile",
      "Sala de Baile", "Club Nocturno", "Otro",
    ],
  },
  {
    id: "hoteles",
    incidencia: "secundaria",
    tipos: [
      "Hotel 1 Estrella", "Hotel 2 Estrellas", "Hotel 3 Estrellas",
      "Hotel 4 Estrellas", "Hotel 5 Estrellas",
      "Apart Hotel", "Hostel", "Posada",
      "Sala de Internación", "Otro",
    ],
  },
  {
    id: "estetica",
    incidencia: "secundaria",
    horasEstandar: 1, // horas variables por día (Dom-Jue: 5h, Vie-Sáb: 8h) — oculta selector de turnos
    tipos: [
      "Salón de Belleza", "Salón Unisex", "Peluquería", "Barbería",
      "Spa", "Nail", "Centro Estético", "Centro de Depilación",
      "Centro de Masajes", "Otro",
    ],
  },
  {
    id: "academias",
    incidencia: "indispensable",
    medioFijo: "parlante",
    tipos: ["Academia de Danza"],
  },
  {
    id: "gimnasios",
    incidencia: "secundaria",
    tipos: [
      "Musculación", "Funcional", "CrossFit", "Máquinas",
      "Aeróbica", "Spinning", "Aerospinning",
      "Zumba", "Bailoterapia", "Danzaterapia", "Otro",
    ],
  },
  {
    id: "oficinas",
    incidencia: "secundaria",
    tipos: [
      "Empresa", "Oficina Administrativa", "Cooperativa",
      "Agencia/Sucursal", "Estudio Profesional", "Escribanía", "Otro",
    ],
    horasEstandar: 6,
  },
  {
    id: "motel",
    incidencia: "secundaria",
    tipos: ["Motel"],
    horasEstandar: 6,
  },
];

export const GIMNASIO_TIPOS_SECUNDARIO = [
  "Musculación", "Funcional", "CrossFit", "Máquinas",
];
export const GIMNASIO_TIPOS_NECESARIO = [
  "Aeróbica", "Spinning", "Aerospinning",
];
export const GIMNASIO_TIPOS_INDISPENSABLE = [
  "Zumba", "Bailoterapia", "Danzaterapia",
];

export const SHOPPING_TIPOS = ["Shopping", "Centro Comercial"];

// ── Horas estándar para estética ──────────────────────────────────────────

export const HORAS_ESTETICA_DOM_JUE = 5;
export const HORAS_ESTETICA_VIE_SAB = 8;

export function getGrupo(id: GrupoId): GrupoConfig | undefined {
  return GRUPOS.find((g) => g.id === id);
}

export function buscarRangoM2(m2: number): AforoRangoM2 | undefined {
  return TABLA_AFORO_M2.find((r) => m2 >= r.desde && m2 <= r.hasta);
}

export function buscarRangoAcademia(alumnos: number): AcademiaRango | undefined {
  return TABLA_ACADEMIAS.find((r) => alumnos >= r.desde && alumnos <= r.hasta);
}

export function buscarRangoAcademiaInterior(alumnos: number): AcademiaRango | undefined {
  return TABLA_ACADEMIAS_INTERIOR.find((r) => alumnos >= r.desde && alumnos <= r.hasta);
}

export function getGimnasioSubtipo(tipoLocal: string): GimnasioSubtipo {
  if (GIMNASIO_TIPOS_NECESARIO.includes(tipoLocal)) return "necesario";
  if (GIMNASIO_TIPOS_INDISPENSABLE.includes(tipoLocal)) return "indispensable";
  return "secundario";
}
