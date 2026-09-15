import type { MetadataRoute } from "next";
import { SITIO } from "@/lib/sitio";
import { soloPublicadas } from "@/lib/news-data";
import { leerNoticias } from "@/lib/news-store";

const IDIOMAS = ["es", "en"] as const;

/** Secciones fijas del sitio, sin los paneles de administración. */
const SECCIONES = [
  "",
  "/licencias",
  "/tarifario",
  "/regalias",
  "/isrc",
  "/galardones",
  "/noticias",
  "/sobre-nosotros",
  "/contacto",
  "/marco-legal",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const paginas: MetadataRoute.Sitemap = [];

  for (const idioma of IDIOMAS) {
    for (const seccion of SECCIONES) {
      paginas.push({
        url: `${SITIO}/${idioma}${seccion}`,
        changeFrequency: seccion === "" || seccion === "/noticias" ? "weekly" : "monthly",
        priority: seccion === "" ? 1 : 0.7,
      });
    }
  }

  // Las notas publicadas: sin esto, los buscadores solo llegan al listado.
  const noticias = soloPublicadas(await leerNoticias());
  for (const idioma of IDIOMAS) {
    for (const nota of noticias) {
      paginas.push({
        url: `${SITIO}/${idioma}/noticias/${nota.slug}`,
        lastModified: nota.fecha,
        changeFrequency: "yearly",
        priority: 0.5,
      });
    }
  }

  return paginas;
}
