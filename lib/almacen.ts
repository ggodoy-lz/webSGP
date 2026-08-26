/**
 * Almacenamiento del contenido que administra SGP. Solo servidor.
 *
 * Producción usa Vercel Blob, porque el filesystem de Vercel es de solo lectura
 * y se descarta en cada deploy: lo que se guarde ahí se pierde. En desarrollo,
 * cuando no hay token de Blob, cae a un archivo local para poder trabajar sin
 * depender de la nube.
 *
 * Lo usan `news-store.ts` y `galardones-store.ts`, que le agregan encima el
 * esquema y la validación de cada contenido.
 */

import { list, put } from "@vercel/blob";
import { promises as fs } from "fs";
import path from "path";

export function usaBlob(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

/** Dónde se está guardando ahora, para mostrarlo en el panel. */
export function describirAlmacenamiento(archivoLocal: string): string {
  return usaBlob() ? "Vercel Blob" : `data/${archivoLocal} (solo local)`;
}

export type OpcionesLectura = {
  /**
   * `true` saltea la caché. Lo usa el panel, para que quien acaba de guardar
   * vea su propio cambio; las páginas públicas prefieren la versión cacheada.
   */
  fresco?: boolean;
};

const rutaFs = (archivoLocal: string) => path.join(process.cwd(), "data", archivoLocal);

async function leerDeBlob(clave: string, { fresco }: OpcionesLectura): Promise<unknown | null> {
  const { blobs } = await list({ prefix: clave, limit: 1 });
  const blob = blobs.find((b) => b.pathname === clave);
  if (!blob) return null;

  const res = await fetch(blob.url, fresco ? { cache: "no-store" } : { next: { revalidate: 60 } });
  return res.ok ? await res.json() : null;
}

async function leerDeArchivo(archivoLocal: string): Promise<unknown | null> {
  try {
    return JSON.parse(await fs.readFile(rutaFs(archivoLocal), "utf-8"));
  } catch {
    return null;
  }
}

/**
 * Devuelve el JSON guardado, o `null` si todavía no se guardó nada o si el
 * almacenamiento falló. Quien llama decide con qué reemplazarlo: conviene una
 * semilla antes que propagar el error, para que la página no se caiga.
 */
export async function leerJson(
  clave: string,
  archivoLocal: string,
  opciones: OpcionesLectura = {},
): Promise<unknown | null> {
  try {
    return usaBlob() ? await leerDeBlob(clave, opciones) : await leerDeArchivo(archivoLocal);
  } catch (error) {
    console.error(`[${clave}] no se pudo leer el almacenamiento:`, error);
    return null;
  }
}

export async function guardarJson(
  clave: string,
  archivoLocal: string,
  datos: unknown,
): Promise<void> {
  const json = JSON.stringify(datos, null, 2);

  if (usaBlob()) {
    await put(clave, json, {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    return;
  }

  const ruta = rutaFs(archivoLocal);
  await fs.mkdir(path.dirname(ruta), { recursive: true });
  await fs.writeFile(ruta, json, "utf-8");
}
