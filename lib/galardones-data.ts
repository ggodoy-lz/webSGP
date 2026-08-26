/**
 * Modelo del contenido editable de la página de Premios: los galardones de
 * streaming y las categorías de los Propya Awards.
 *
 * El contenido real lo administra SGP desde /admin/galardones y vive en el
 * almacenamiento que resuelve `galardones-store.ts`; la semilla solo se usa
 * mientras no se haya guardado nada.
 *
 * A propósito no importa nada del servidor: también lo usan componentes de
 * cliente.
 */

export const NIVELES = ["Oro", "Platino", "Diamante"] as const;
export type Nivel = (typeof NIVELES)[number];

/**
 * Umbrales de reproducciones de cada nivel, de mayor a menor.
 *
 * Son los mismos que la página muestra en las tarjetas de nivel. El nivel de
 * cada galardón se deriva de acá en vez de guardarse: así la tabla no puede
 * terminar diciendo "Platino" al lado de una cifra que, según las tarjetas de
 * arriba, es Oro.
 */
export const UMBRALES: { nivel: Nivel; desde: number }[] = [
  { nivel: "Diamante", desde: 1_000_000 },
  { nivel: "Platino", desde: 500_000 },
  { nivel: "Oro", desde: 100_000 },
];

export const COLOR_NIVEL: Record<Nivel, string> = {
  Oro: "#f2b33d",
  Platino: "#8a847a",
  Diamante: "#4666a6",
};

export type Galardon = {
  id: string;
  artista: string;
  obra: string;
  /** Reproducciones acumuladas. De acá sale el nivel. */
  streams: number;
  /** Solo los publicados se ven en el sitio. */
  publicado: boolean;
};

export type ContenidoGalardones = {
  galardones: Galardon[];
  categoriasPropya: string[];
};

/** Nivel que le corresponde a una cifra, o `null` si no llega al mínimo. */
export function nivelDe(streams: number): Nivel | null {
  return UMBRALES.find((u) => streams >= u.desde)?.nivel ?? null;
}

/** Formatea la cifra como en la tabla: 1.2M, 650K, 980. */
export function formatearStreams(streams: number): string {
  if (streams >= 1_000_000) {
    const millones = streams / 1_000_000;
    return `${millones % 1 === 0 ? millones : millones.toFixed(1)}M`;
  }
  if (streams >= 1_000) return `${Math.round(streams / 1_000)}K`;
  return String(streams);
}

/** Publicados, del más escuchado al menos. */
export function galardonesVisibles(lista: Galardon[]): Galardon[] {
  return lista.filter((g) => g.publicado && nivelDe(g.streams)).sort((a, b) => b.streams - a.streams);
}

/**
 * Contenido inicial.
 *
 * Los cinco galardones son los de demostración que se cargaron al armar el
 * sitio: artistas y cifras inventados. Quedan sin publicar para que no sigan
 * figurando como premios entregados, pero se conservan para que SGP vea el
 * formato antes de cargar los reales.
 *
 * Las categorías de Propya sí se publican tal cual estaban.
 */
export const GALARDONES_SEMILLA: ContenidoGalardones = {
  galardones: [
    { id: "demo-1", artista: "Beto Ayala", obra: "Alma Guaraní", streams: 1_200_000, publicado: false },
    { id: "demo-2", artista: "Mara Flores", obra: "Corazón Paraguay", streams: 650_000, publicado: false },
    { id: "demo-3", artista: "Grupo Cañaveral", obra: "Fiesta Paraguaya", streams: 590_000, publicado: false },
    { id: "demo-4", artista: "Pedro Giménez", obra: "Madrugada", streams: 210_000, publicado: false },
    { id: "demo-5", artista: "Luna Nueva", obra: "Entre Ríos", streams: 180_000, publicado: false },
  ],
  categoriasPropya: [
    "Producción del Año",
    "Artista Revelación",
    "Álbum del Año",
    "Canción del Año",
    "Mejor Producción Folclórica",
    "Mejor Producción Pop",
    "Mejor Producción Urbana",
    "Trayectoria",
  ],
};
