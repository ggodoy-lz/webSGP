/**
 * Almacenamiento de las noticias. Solo para código de servidor.
 *
 * Producción usa Vercel Blob, porque el filesystem de Vercel es de solo lectura
 * y se descarta en cada deploy: lo que se guarde ahí se pierde. En desarrollo,
 * cuando no hay token de Blob, cae a `data/noticias.json` para poder trabajar
 * sin depender de la nube.
 *
 * Mientras no se haya guardado nada devuelve la semilla de `news-data.ts`.
 */

import { list, put } from "@vercel/blob";
import { promises as fs } from "fs";
import path from "path";
import {
  CATEGORIAS,
  ESTADOS,
  NOTICIAS_SEMILLA,
  type CategoriaNoticia,
  type EstadoNoticia,
  type NewsArticle,
} from "./news-data";

const RUTA_BLOB = "noticias/noticias.json";
const RUTA_FS = path.join(process.cwd(), "data", "noticias.json");

export function usaBlob(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

/** Dónde se está guardando ahora, para mostrarlo en el panel. */
export function describirAlmacenamiento(): string {
  return usaBlob() ? "Vercel Blob" : "data/noticias.json (solo local)";
}

/* -------------------------------------------------------------------------- */
/* Validación                                                                  */
/* -------------------------------------------------------------------------- */

function texto(valor: unknown, maximo: number): string {
  return typeof valor === "string" ? valor.trim().slice(0, maximo) : "";
}

const ES_FECHA_ISO = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Normaliza lo que llega del panel. El contenido lo escribe personal de SGP,
 * pero igual se valida: la ruta es pública y un JSON mal formado dejaría el
 * listado de noticias caído.
 */
export function normalizarNoticia(entrada: unknown, indice: number): NewsArticle | null {
  if (!entrada || typeof entrada !== "object") return null;
  const n = entrada as Record<string, unknown>;

  const titleEs = texto(n.titleEs, 300);
  const titleEn = texto(n.titleEn, 300);
  // Sin título no hay nota que mostrar; una fila vacía se descarta.
  if (!titleEs && !titleEn) return null;

  const slug = texto(n.slug, 80) || `noticia-${indice + 1}`;
  const categoria = texto(n.category, 40) as CategoriaNoticia;
  const estado = texto(n.estado, 20) as EstadoNoticia;
  const fecha = texto(n.fecha, 10);

  return {
    id: texto(n.id, 100) || slug,
    slug,
    category: CATEGORIAS.includes(categoria) ? categoria : "SGP",
    estado: ESTADOS.includes(estado) ? estado : "borrador",
    fecha: ES_FECHA_ISO.test(fecha) ? fecha : new Date().toISOString().slice(0, 10),
    titleEs: titleEs || titleEn,
    titleEn: titleEn || titleEs,
    excerptEs: texto(n.excerptEs, 600),
    excerptEn: texto(n.excerptEn, 600),
    contentEs: texto(n.contentEs, 40000),
    contentEn: texto(n.contentEn, 40000),
  };
}

/**
 * Valida la lista completa y garantiza que los slugs sean únicos: dos notas con
 * el mismo slug harían que una tape a la otra en `/noticias/[slug]`.
 */
export function normalizarLista(entrada: unknown): NewsArticle[] {
  if (!Array.isArray(entrada)) return [];

  const vistos = new Set<string>();
  const salida: NewsArticle[] = [];

  entrada.forEach((cruda, i) => {
    const noticia = normalizarNoticia(cruda, i);
    if (!noticia) return;

    let slug = noticia.slug;
    let n = 2;
    while (vistos.has(slug)) slug = `${noticia.slug}-${n++}`;
    vistos.add(slug);

    salida.push({ ...noticia, slug });
  });

  return salida;
}

/* -------------------------------------------------------------------------- */
/* Lectura y escritura                                                         */
/* -------------------------------------------------------------------------- */

type OpcionesLectura = {
  /**
   * `true` saltea la caché. Lo usa el panel, para que quien acaba de guardar
   * vea su propio cambio; las páginas públicas prefieren la versión cacheada.
   */
  fresco?: boolean;
};

async function leerDeBlob({ fresco }: OpcionesLectura): Promise<NewsArticle[] | null> {
  const { blobs } = await list({ prefix: RUTA_BLOB, limit: 1 });
  const blob = blobs.find((b) => b.pathname === RUTA_BLOB);
  if (!blob) return null;

  const res = await fetch(blob.url, fresco ? { cache: "no-store" } : { next: { revalidate: 60 } });
  if (!res.ok) return null;

  return normalizarLista(await res.json());
}

async function leerDeArchivo(): Promise<NewsArticle[] | null> {
  try {
    return normalizarLista(JSON.parse(await fs.readFile(RUTA_FS, "utf-8")));
  } catch {
    return null;
  }
}

/**
 * Todas las noticias, publicadas y borradores. Las páginas públicas tienen que
 * filtrar con `soloPublicadas`.
 *
 * Si el almacenamiento falla devuelve la semilla en vez de propagar el error:
 * es preferible que la sección de noticias muestre algo desactualizado a que la
 * página entera se caiga.
 */
export async function leerNoticias(opciones: OpcionesLectura = {}): Promise<NewsArticle[]> {
  try {
    const guardadas = usaBlob() ? await leerDeBlob(opciones) : await leerDeArchivo();
    if (guardadas) return guardadas;
  } catch (error) {
    console.error("[noticias] no se pudo leer el almacenamiento:", error);
  }
  return NOTICIAS_SEMILLA;
}

export async function guardarNoticias(noticias: NewsArticle[]): Promise<void> {
  const json = JSON.stringify(noticias, null, 2);

  if (usaBlob()) {
    await put(RUTA_BLOB, json, {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    return;
  }

  await fs.mkdir(path.dirname(RUTA_FS), { recursive: true });
  await fs.writeFile(RUTA_FS, json, "utf-8");
}
