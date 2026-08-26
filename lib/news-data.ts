/**
 * Modelo de las noticias del sitio.
 *
 * Este archivo define la forma de una noticia y guarda el contenido inicial
 * (semilla). El contenido real lo administra SGP desde /admin/noticias y vive
 * en el almacenamiento que resuelve `lib/news-store.ts`; la semilla solo se usa
 * mientras no se haya guardado nada.
 *
 * A propósito no importa nada del servidor: también lo usan componentes de
 * cliente.
 */

export const CATEGORIAS = ["Streaming", "SGP", "Legal", "Industria"] as const;
export type CategoriaNoticia = (typeof CATEGORIAS)[number];

export const ESTADOS = ["publicado", "borrador"] as const;
export type EstadoNoticia = (typeof ESTADOS)[number];

export type NewsArticle = {
  id: string;
  slug: string;
  category: CategoriaNoticia;
  /** Solo las publicadas se ven en el sitio. */
  estado: EstadoNoticia;
  /** ISO `aaaa-mm-dd`. Se formatea por idioma al mostrarla. */
  fecha: string;
  /**
   * URL de la imagen de portada, o "" si no tiene. La usan las tarjetas del
   * home y la portada de la nota.
   */
  imagen: string;
  titleEs: string;
  titleEn: string;
  excerptEs: string;
  excerptEn: string;
  contentEs: string;
  contentEn: string;
};

export const COLORES_CATEGORIA: Record<CategoriaNoticia, string> = {
  Streaming: "#4666a6",
  SGP: "#f0552f",
  Legal: "#f2b33d",
  Industria: "#f0552f",
};

export function colorCategoria(categoria: string): string {
  return COLORES_CATEGORIA[categoria as CategoriaNoticia] ?? "#f0552f";
}

const MESES_ES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const MESES_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * Formatea la fecha sin pasar por `Date`, para que no se corra un día según la
 * zona horaria en la que corra el servidor.
 */
export function formatearFecha(iso: string, locale: string): string {
  const [a, m, d] = iso.split("-").map(Number);
  if (!a || !m || !d || m < 1 || m > 12) return iso;
  return locale === "es"
    ? `${d} ${MESES_ES[m - 1]} ${a}`
    : `${MESES_EN[m - 1]} ${d}, ${a}`;
}

/** Convierte un título en un slug usable en la URL. */
export function generarSlug(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** De la más nueva a la más vieja. */
export function ordenarPorFecha(lista: NewsArticle[]): NewsArticle[] {
  return [...lista].sort((a, b) => b.fecha.localeCompare(a.fecha));
}

export function soloPublicadas(lista: NewsArticle[]): NewsArticle[] {
  return ordenarPorFecha(lista.filter((a) => a.estado === "publicado"));
}

/**
 * Contenido inicial: son las notas de demostración que se cargaron al armar el
 * sitio. Quedan como borrador para que no sigan publicadas sin que SGP las
 * revise, pero se conservan para que puedan editarlas en vez de retipearlas.
 */
export const NOTICIAS_SEMILLA: NewsArticle[] = [
  {
    id: "sgp-record-regalias-2026",
    slug: "sgp-record-regalias-2026",
    category: "Streaming",
    estado: "borrador",
    fecha: "2026-03-12",
    imagen: "",
    titleEs: "SGP distribuye récord histórico de regalías en el primer trimestre 2026",
    titleEn: "SGP distributes historic record royalties in Q1 2026",
    excerptEs:
      "La Sociedad de Gestión de Productores Fonográficos reportó una distribución sin precedentes, reflejando el crecimiento del streaming en Paraguay.",
    excerptEn:
      "SGP reported an unprecedented distribution, reflecting the growth of streaming in Paraguay.",
    contentEs:
      "SGP ha distribuido un récord histórico de regalías durante el primer trimestre de 2026, superando todas las expectativas del sector. Este hito refleja el crecimiento sostenido del consumo de música digital en Paraguay y el fortalecimiento de los acuerdos con plataformas internacionales de streaming.\n\nLa distribución abarcó a más de 500 productores fonográficos nacionales e internacionales, con un incremento del 35% respecto al mismo período del año anterior. Los géneros más escuchados en Paraguay durante este período fueron la música tropical, el pop nacional y el folclore paraguayo.\n\nSGP continuará fortaleciendo sus convenios con plataformas digitales y trabajando por la justa compensación de todos los productores fonográficos del Paraguay.",
    contentEn:
      "SGP has distributed a historic record of royalties during Q1 2026, exceeding all sector expectations. This milestone reflects the sustained growth of digital music consumption in Paraguay and the strengthening of agreements with international streaming platforms.\n\nThe distribution covered more than 500 national and international phonographic producers, with an increase of 35% compared to the same period last year. The most listened to genres in Paraguay during this period were tropical music, national pop and Paraguayan folklore.\n\nSGP will continue to strengthen its agreements with digital platforms and work for the fair compensation of all phonographic producers in Paraguay.",
  },
  {
    id: "primera-edicion-propya-awards",
    slug: "primera-edicion-propya-awards",
    category: "SGP",
    estado: "borrador",
    fecha: "2026-02-05",
    imagen: "",
    titleEs: "Paraguay celebra los primeros Propya Awards de la industria fonográfica",
    titleEn: "Paraguay celebrates the first Propya Awards of the phonographic industry",
    excerptEs:
      "La primera edición de los Propya Awards reunió a los principales productores y artistas del país en una noche histórica para la música paraguaya.",
    excerptEn:
      "The first edition of the Propya Awards brought together the leading producers and artists of the country in a historic night for Paraguayan music.",
    contentEs:
      "Asunción fue escenario de la primera edición de los Propya Awards, la ceremonia de premiación de la industria fonográfica paraguaya organizada por SGP. La noche congregó a los principales artistas, productores y figuras de la industria musical del Paraguay en un evento sin precedentes.\n\nLos premios, que reconocen la excelencia en la producción musical nacional, contaron con categorías como Producción del Año, Artista Revelación, Álbum del Año y Mejor Producción Folclórica, entre otras.\n\nLos Propya Awards se celebrarán anualmente, consolidándose como el reconocimiento más importante de la industria musical paraguaya.",
    contentEn:
      "Asunción hosted the first edition of the Propya Awards, the phonographic industry award ceremony organised by SGP. The evening brought together leading artists, producers and figures from the music industry of Paraguay in an unprecedented event.\n\nThe awards, which recognise excellence in national music production, featured categories including Production of the Year, Breakthrough Artist, Album of the Year and Best Folkloric Production, among others.\n\nThe Propya Awards will be held annually, establishing themselves as the most important recognition in the Paraguayan music industry.",
  },
  {
    id: "nuevas-tarifas-plataformas-digitales",
    slug: "nuevas-tarifas-plataformas-digitales",
    category: "Legal",
    estado: "borrador",
    fecha: "2026-01-20",
    imagen: "",
    titleEs: "Nuevas tarifas de licencias para plataformas digitales entran en vigencia",
    titleEn: "New licence rates for digital platforms come into effect",
    excerptEs:
      "SGP actualizó su estructura tarifaria para plataformas digitales de streaming, alineándose con los estándares internacionales de IFPI.",
    excerptEn:
      "SGP updated its tariff structure for digital streaming platforms, aligning with IFPI international standards.",
    contentEs:
      "SGP ha anunciado la actualización de su estructura tarifaria para plataformas de streaming y servicios digitales, en línea con las directrices internacionales establecidas por IFPI. Las nuevas tarifas entran en vigencia a partir del 1 de abril de 2026.\n\nLas actualizaciones afectan a servicios de streaming on-demand, radio online, servicios de música de fondo y plataformas de videos musicales. SGP ha trabajado en colaboración con la industria para establecer tarifas justas que equilibren la compensación de los productores con la viabilidad de los servicios digitales.\n\nPara más información sobre las nuevas tarifas, contactar al Departamento Comercial de SGP.",
    contentEn:
      "SGP has announced the update of its tariff structure for streaming platforms and digital services, in line with international guidelines established by IFPI. The new rates come into effect from 1 April 2026.\n\nThe updates affect on-demand streaming services, online radio, background music services and music video platforms. SGP has worked in collaboration with the industry to establish fair rates that balance producer compensation with the viability of digital services.\n\nFor more information about the new rates, contact the SGP Commercial Department.",
  },
  {
    id: "convenio-ifpi-ampliado-2026",
    slug: "convenio-ifpi-ampliado-2026",
    category: "Industria",
    estado: "borrador",
    fecha: "2026-01-10",
    imagen: "",
    titleEs: "SGP amplía su convenio con IFPI para mayor cobertura internacional",
    titleEn: "SGP expands its agreement with IFPI for greater international coverage",
    excerptEs:
      "El nuevo convenio permite a los productores paraguayos recaudar regalías en 15 nuevos mercados, ampliando la red de cobertura a más de 70 países.",
    excerptEn:
      "The new agreement allows Paraguayan producers to collect royalties in 15 new markets, expanding the coverage network to more than 70 countries.",
    contentEs:
      "SGP ha firmado una ampliación de su convenio con IFPI (International Federation of the Phonographic Industry) que extiende la cobertura de recaudación de regalías para los productores paraguayos a 15 nuevos mercados, incluyendo varios países de Asia y África.\n\nCon esta ampliación, los productores fonográficos paraguayos ahora pueden cobrar sus regalías en más de 70 países a través de la red de organizaciones miembros de IFPI.\n\nEste logro posiciona a Paraguay como un referente en la gestión de derechos fonográficos en América del Sur y refleja el trabajo continuo de SGP en fortalecer los lazos con organizaciones internacionales de la industria musical.",
    contentEn:
      "SGP has signed an expansion of its agreement with IFPI (International Federation of the Phonographic Industry) that extends royalty collection coverage for Paraguayan producers to 15 new markets, including several countries in Asia and Africa.\n\nWith this expansion, Paraguayan phonographic producers can now collect their royalties in more than 70 countries through the network of IFPI member organisations.\n\nThis achievement positions Paraguay as a benchmark in phonographic rights management in South America and reflects the ongoing work of SGP to strengthen ties with international organisations in the music industry.",
  },
];
