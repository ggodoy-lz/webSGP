/**
 * Guardado de las imágenes que sube SGP desde el panel. Solo servidor.
 *
 * En producción van a Vercel Blob; en desarrollo, a `public/img/noticias`,
 * que Next sirve directamente. Igual que el resto del contenido: lo que se
 * guarde en el filesystem de Vercel se pierde en el próximo deploy.
 *
 * Las imágenes llegan ya redimensionadas y convertidas a WebP por el navegador
 * (ver `redimensionar.ts`), así que acá solo se validan y se escriben.
 */

import { put, del } from "@vercel/blob";
import { promises as fs } from "fs";
import path from "path";
import { usaBlob } from "./almacen";

const CARPETA = "noticias/imagenes";
const CARPETA_LOCAL = path.join(process.cwd(), "public", "img", "noticias");

/**
 * Tope de tamaño. El navegador entrega alrededor de 100 KB, así que 4 MB deja
 * margen de sobra y a la vez corta cualquier intento de subir algo enorme.
 */
export const MAXIMO_BYTES = 4 * 1024 * 1024;

export const TIPOS_ACEPTADOS = ["image/webp", "image/jpeg", "image/png"];

const EXTENSION: Record<string, string> = {
  "image/webp": "webp",
  "image/jpeg": "jpg",
  "image/png": "png",
};

/** Nombre irrepetible, para que subir una imagen nueva no pise a la anterior. */
function nombreDe(tipo: string): string {
  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  return `${id}.${EXTENSION[tipo] ?? "webp"}`;
}

/** Guarda la imagen y devuelve la URL con la que se muestra en el sitio. */
export async function guardarImagen(bytes: ArrayBuffer, tipo: string): Promise<string> {
  const nombre = nombreDe(tipo);

  if (usaBlob()) {
    const blob = await put(`${CARPETA}/${nombre}`, bytes, {
      access: "public",
      contentType: tipo,
      addRandomSuffix: false,
    });
    return blob.url;
  }

  await fs.mkdir(CARPETA_LOCAL, { recursive: true });
  await fs.writeFile(path.join(CARPETA_LOCAL, nombre), Buffer.from(bytes));
  return `/img/noticias/${nombre}`;
}

/**
 * Borra una imagen que ya no se usa. No lanza si falla: que quede un archivo
 * huérfano es preferible a bloquear el guardado de la noticia.
 */
export async function borrarImagen(url: string): Promise<void> {
  if (!url) return;

  try {
    if (url.startsWith("http")) {
      await del(url);
      return;
    }
    // Solo se borra dentro de la carpeta de noticias, nunca una ruta arbitraria.
    const nombre = path.basename(url);
    if (!url.startsWith("/img/noticias/") || !nombre) return;
    await fs.unlink(path.join(CARPETA_LOCAL, nombre));
  } catch (error) {
    console.error("[noticias] no se pudo borrar la imagen:", url, error);
  }
}

/**
 * Acepta solo rutas que haya generado este módulo. Sin esto, el panel podría
 * guardar una URL a un servidor externo y el sitio terminaría cargando —y
 * mostrando— una imagen de un tercero.
 */
export function esUrlDeImagenValida(url: string): boolean {
  if (url.startsWith("/img/noticias/")) return !url.includes("..");
  try {
    const { protocol, hostname } = new URL(url);
    return protocol === "https:" && hostname.endsWith(".blob.vercel-storage.com");
  } catch {
    return false;
  }
}
