/**
 * Marco Legal.
 *
 * Los textos se tomaron de https://www.sgp.com.py/marco-legal y los documentos
 * se alojan en el propio sitio (public/docs/marco-legal) en vez de enlazar al
 * sitio actual: si el sitio nuevo pasa a ocupar ese dominio, los enlaces
 * viejos dejarían de funcionar.
 */

export type ApartadoMarcoLegal = { titulo: string; texto: string };

export type DocumentoNormativo = {
  nombre: string;
  detalle?: string;
  archivo: string;
  peso: string;
};

export const APARTADOS_MARCO_LEGAL: ApartadoMarcoLegal[] = [
  {
    "titulo": "Constitución de la República del Paraguay",
    "texto": "Artículo 110. Todo autor, inventor, productor o comerciante gozará de la propiedad exclusiva de su obra, invención, marca o nombre comercial, con arreglo a la Ley."
  },
  {
    "titulo": "Ley 1.328/98 de Derecho de Autor y Derechos Conexos",
    "texto": "Artículo 128. Los productores de fonogramas tienen igualmente el derecho a recibir una remuneración por la comunicación del fonograma al público, por cualquier medio o procedimiento, salvo en los casos de las utilizaciones lícitas a que se refiere el Artículo 38 de la presente ley, la cual será compartida, en partes iguales, con los artistas intérpretes o ejecutantes."
  },
  {
    "titulo": "Convenios Internacionales en materia de Propiedad Intelectual",
    "texto": "Convención de Roma para la protección de los Artistas Intérpretes o Ejecutantes, los Productores de Fonogramas y los Organismos de Radiodifusión de 1961; Convenio de Ginebra para la protección de los productores de fonogramas contra la Reproducción no autorizada de sus fonogramas de 1971; y Tratado de la OMPI sobre Interpretaciones, Ejecuciones y Fonogramas de 1996."
  }
];

export const DOCUMENTOS_MARCO_LEGAL: DocumentoNormativo[] = [
  {
    "nombre": "Ley 1.328/98",
    "archivo": "ley-1328-98-derecho-de-autor.pdf",
    "peso": "441 KB",
    "detalle": "De Derecho de Autor y Derechos Conexos"
  },
  {
    "nombre": "Ley 5.247/14",
    "archivo": "ley-5247-14-modifica-ley-1328.pdf",
    "peso": "230 KB",
    "detalle": "Que modifica los artículos 126 y 130 de la Ley 1.328/98"
  },
  {
    "nombre": "Normas Técnicas",
    "archivo": "normas-tecnicas-gestion-documental.pdf",
    "peso": "717 KB",
    "detalle": "Para la Gestión Documental"
  },
  {
    "nombre": "Resolución Nro. 58",
    "archivo": "resolucion-58.pdf",
    "peso": "1,7 MB"
  },
  {
    "nombre": "Decreto Reglamentario",
    "archivo": "decreto-reglamentario-5159-99.pdf",
    "peso": "143 KB",
    "detalle": "Decreto 5.159/1999"
  },
  {
    "nombre": "Decreto Nro. 17.598",
    "archivo": "decreto-17598.pdf",
    "peso": "121 KB"
  },
  {
    "nombre": "Decreto Nro. 9.365",
    "archivo": "decreto-9365.pdf",
    "peso": "314 KB"
  },
  {
    "nombre": "Estatuto SGP",
    "archivo": "estatuto-sgp.pdf",
    "peso": "10,7 MB",
    "detalle": "Estatuto y decreto (documento escaneado)"
  },
  {
    "nombre": "Reglamento de Distribución",
    "archivo": "reglamento-distribucion.pdf",
    "peso": "318 KB"
  },
  {
    "nombre": "Reglamento de Audio Streams de SGP",
    "archivo": "reglamento-galardones-audio-streams.pdf",
    "peso": "151 KB",
    "detalle": "Galardones de audio streams, octubre 2025"
  }
];
