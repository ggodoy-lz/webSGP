/**
 * Almacenamiento del contenido de la página de Premios. Solo servidor.
 *
 * El acceso al almacenamiento vive en `almacen.ts`; acá está el esquema y la
 * validación.
 */

import {
  describirAlmacenamiento as describir,
  guardarJson,
  leerJson,
  usaBlob,
  type OpcionesLectura,
} from "./almacen";
import { GALARDONES_SEMILLA, type ContenidoGalardones, type Galardon } from "./galardones-data";

const CLAVE = "galardones/galardones.json";
const ARCHIVO_LOCAL = "galardones.json";

export { usaBlob };
export const describirAlmacenamiento = () => describir(ARCHIVO_LOCAL);

function texto(valor: unknown, maximo: number): string {
  return typeof valor === "string" ? valor.trim().slice(0, maximo) : "";
}

function numero(valor: unknown): number {
  const n = typeof valor === "number" ? valor : Number(texto(valor, 20).replace(/[^\d]/g, ""));
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

function normalizarGalardon(entrada: unknown, indice: number): Galardon | null {
  if (!entrada || typeof entrada !== "object") return null;
  const g = entrada as Record<string, unknown>;

  const artista = texto(g.artista, 160);
  const obra = texto(g.obra, 200);
  // Sin artista ni obra no hay galardón; una fila vacía se descarta.
  if (!artista && !obra) return null;

  return {
    id: texto(g.id, 100) || `galardon-${indice + 1}`,
    artista,
    obra,
    streams: numero(g.streams),
    publicado: g.publicado === true,
  };
}

/**
 * Normaliza lo que llega del panel. El contenido lo escribe personal de SGP,
 * pero igual se valida: un JSON mal formado dejaría la página de Premios caída.
 */
export function normalizarContenido(entrada: unknown): ContenidoGalardones {
  const c = (entrada ?? {}) as Record<string, unknown>;

  const galardones = Array.isArray(c.galardones)
    ? c.galardones
        .map(normalizarGalardon)
        .filter((g): g is Galardon => g !== null)
    : [];

  const categoriasPropya = Array.isArray(c.categoriasPropya)
    ? c.categoriasPropya.map((v) => texto(v, 120)).filter(Boolean).slice(0, 40)
    : [];

  return { galardones, categoriasPropya };
}

/**
 * Todo el contenido, publicado y no publicado. Las páginas públicas tienen que
 * filtrar con `galardonesVisibles`.
 *
 * Si el almacenamiento falla devuelve la semilla, para que la página no se
 * caiga por un problema de lectura.
 */
export async function leerGalardones(
  opciones: OpcionesLectura = {},
): Promise<ContenidoGalardones> {
  const guardado = await leerJson(CLAVE, ARCHIVO_LOCAL, opciones);
  return guardado ? normalizarContenido(guardado) : GALARDONES_SEMILLA;
}

export async function guardarGalardones(contenido: ContenidoGalardones): Promise<void> {
  await guardarJson(CLAVE, ARCHIVO_LOCAL, contenido);
}
