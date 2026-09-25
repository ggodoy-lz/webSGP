/**
 * Almacenamiento de las noticias. Solo servidor.
 *
 * El acceso al almacenamiento vive en `almacen.ts`; acá está el esquema y la
 * validación. Mientras no se haya guardado nada devuelve la semilla de
 * `news-data.ts`.
 */

import {
  describirAlmacenamiento as describir,
  guardarJson,
  leerJson,
  usaBlob,
  type OpcionesLectura,
} from "./almacen";
import { esUrlDeImagenValida } from "./imagenes";
import {
  CATEGORIAS,
  ESTADOS,
  NOTICIAS_SEMILLA,
  generarSlug,
  type CategoriaNoticia,
  type EstadoNoticia,
  type NewsArticle,
} from "./news-data";

const CLAVE = "noticias/noticias.json";
const ARCHIVO_LOCAL = "noticias.json";

export { usaBlob };
export const describirAlmacenamiento = () => describir(ARCHIVO_LOCAL);

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

  // El slug va en la URL de la nota: se reduce a letras, números y guiones
  // aunque llegue escrito a mano, para que no pueda romper el enlace ni
  // colarle una ruta.
  const slug =
    generarSlug(texto(n.slug, 80)) || generarSlug(titleEs || titleEn) || `noticia-${indice + 1}`;
  const categoria = texto(n.category, 40) as CategoriaNoticia;
  const estado = texto(n.estado, 20) as EstadoNoticia;
  const fecha = texto(n.fecha, 10);

  // Solo se acepta una imagen que haya subido el propio panel: si no, el panel
  // podría apuntar a un servidor externo y el sitio cargaría contenido ajeno.
  const imagen = texto(n.imagen, 600);

  return {
    id: texto(n.id, 100) || slug,
    slug,
    category: CATEGORIAS.includes(categoria) ? categoria : "SGP",
    estado: ESTADOS.includes(estado) ? estado : "borrador",
    fecha: ES_FECHA_ISO.test(fecha) ? fecha : new Date().toISOString().slice(0, 10),
    imagen: esUrlDeImagenValida(imagen) ? imagen : "",
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

/**
 * Todas las noticias, publicadas y borradores. Las páginas públicas tienen que
 * filtrar con `soloPublicadas`.
 *
 * Si el almacenamiento falla devuelve la semilla: es preferible que la sección
 * muestre algo desactualizado a que la página entera se caiga.
 */
export async function leerNoticias(opciones: OpcionesLectura = {}): Promise<NewsArticle[]> {
  const guardadas = await leerJson(CLAVE, ARCHIVO_LOCAL, opciones);
  return guardadas ? normalizarLista(guardadas) : NOTICIAS_SEMILLA;
}

export async function guardarNoticias(noticias: NewsArticle[]): Promise<void> {
  await guardarJson(CLAVE, ARCHIVO_LOCAL, noticias);
}
