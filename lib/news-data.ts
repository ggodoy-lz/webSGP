export type NewsArticle = {
  id: number;
  slug: string;
  category: "Streaming" | "SGP" | "Legal" | "Industria";
  titleEs: string;
  titleEn: string;
  excerptEs: string;
  excerptEn: string;
  contentEs: string;
  contentEn: string;
  date: string;
  dateEn: string;
};

export const articles: NewsArticle[] = [
  {
    id: 1,
    slug: "sgp-record-regalias-2026",
    category: "Streaming",
    titleEs: "SGP distribuye récord histórico de regalías en el primer trimestre 2026",
    titleEn: "SGP distributes historic record royalties in Q1 2026",
    excerptEs: "La Sociedad de Gestión de Productores Fonográficos reportó una distribución sin precedentes, reflejando el crecimiento del streaming en Paraguay.",
    excerptEn: "SGP reported an unprecedented distribution, reflecting the growth of streaming in Paraguay.",
    contentEs: `SGP ha distribuido un récord histórico de regalías durante el primer trimestre de 2026, superando todas las expectativas del sector. Este hito refleja el crecimiento sostenido del consumo de música digital en Paraguay y el fortalecimiento de los acuerdos con plataformas internacionales de streaming.\n\nLa distribución abarcó a más de 500 productores fonográficos nacionales e internacionales, con un incremento del 35% respecto al mismo período del año anterior. Los géneros más escuchados en Paraguay durante este período fueron la música tropical, el pop nacional y el folclore paraguayo.\n\nXimena Blanco, representante de SGP, destacó que "este récord es el resultado de años de trabajo en la gestión de los derechos fonográficos y de la confianza que los artistas y sellos depositan en nuestra institución".\n\nSGP continuará fortaleciendo sus convenios con plataformas digitales y trabajando por la justa compensación de todos los productores fonográficos del Paraguay.`,
    contentEn: `SGP has distributed a historic record of royalties during Q1 2026, exceeding all sector expectations. This milestone reflects the sustained growth of digital music consumption in Paraguay and the strengthening of agreements with international streaming platforms.\n\nThe distribution covered more than 500 national and international phonographic producers, with an increase of 35% compared to the same period last year. The most listened to genres in Paraguay during this period were tropical music, national pop and Paraguayan folklore.\n\nXimena Blanco, SGP representative, highlighted that "this record is the result of years of work in managing phonographic rights and the trust that artists and labels place in our institution".\n\nSGP will continue to strengthen its agreements with digital platforms and work for the fair compensation of all phonographic producers in Paraguay.`,
    date: "12 Mar 2026",
    dateEn: "Mar 12, 2026",
  },
  {
    id: 2,
    slug: "primera-edicion-propya-awards",
    category: "SGP",
    titleEs: "Paraguay celebra los primeros Propya Awards de la industria fonográfica",
    titleEn: "Paraguay celebrates the first Propya Awards of the phonographic industry",
    excerptEs: "La primera edición de los Propya Awards reunió a los principales productores y artistas del país en una noche histórica para la música paraguaya.",
    excerptEn: "The first edition of the Propya Awards brought together the leading producers and artists of the country in a historic night for Paraguayan music.",
    contentEs: `Asunción fue escenario de la primera edición de los Propya Awards, la ceremonia de premiación de la industria fonográfica paraguaya organizada por SGP. La noche congregó a los principales artistas, productores y figuras de la industria musical del Paraguay en un evento sin precedentes.\n\nLos premios, que reconocen la excelencia en la producción musical nacional, contaron con categorías como Producción del Año, Artista Revelación, Álbum del Año y Mejor Producción Folclórica, entre otras.\n\nEl evento contó con la presencia de representantes de IFPI y WIPO, quienes destacaron el compromiso de Paraguay con la protección de los derechos fonográficos a nivel internacional.\n\nLos Propya Awards se celebrarán anualmente, consolidándose como el reconocimiento más importante de la industria musical paraguaya.`,
    contentEn: `Asunción hosted the first edition of the Propya Awards, the phonographic industry award ceremony organised by SGP. The evening brought together leading artists, producers and figures from Paraguay's music industry in an unprecedented event.\n\nThe awards, which recognise excellence in national music production, featured categories including Production of the Year, Breakthrough Artist, Album of the Year and Best Folkloric Production, among others.\n\nThe event was attended by representatives of IFPI and WIPO, who highlighted Paraguay's commitment to protecting phonographic rights at the international level.\n\nThe Propya Awards will be held annually, establishing themselves as the most important recognition in the Paraguayan music industry.`,
    date: "5 Feb 2026",
    dateEn: "Feb 5, 2026",
  },
  {
    id: 3,
    slug: "nuevas-tarifas-plataformas-digitales",
    category: "Legal",
    titleEs: "Nuevas tarifas de licencias para plataformas digitales entran en vigencia",
    titleEn: "New licence rates for digital platforms come into effect",
    excerptEs: "SGP actualizó su estructura tarifaria para plataformas digitales de streaming, alineándose con los estándares internacionales de IFPI.",
    excerptEn: "SGP updated its tariff structure for digital streaming platforms, aligning with IFPI international standards.",
    contentEs: `SGP ha anunciado la actualización de su estructura tarifaria para plataformas de streaming y servicios digitales, en línea con las directrices internacionales establecidas por IFPI. Las nuevas tarifas entran en vigencia a partir del 1 de abril de 2026.\n\nLas actualizaciones afectan a servicios de streaming on-demand, radio online, servicios de música de fondo y plataformas de videos musicales. SGP ha trabajado en colaboración con la industria para establecer tarifas justas que equilibren la compensación de los productores con la viabilidad de los servicios digitales.\n\nLas plataformas que operan en Paraguay tienen plazo hasta el 1 de junio de 2026 para adecuarse a las nuevas tarifas y renovar sus licencias con SGP.\n\nPara más información sobre las nuevas tarifas, contactar al Departamento Comercial de SGP.`,
    contentEn: `SGP has announced the update of its tariff structure for streaming platforms and digital services, in line with international guidelines established by IFPI. The new rates come into effect from 1 April 2026.\n\nThe updates affect on-demand streaming services, online radio, background music services and music video platforms. SGP has worked in collaboration with the industry to establish fair rates that balance producer compensation with the viability of digital services.\n\nPlatforms operating in Paraguay have until 1 June 2026 to adapt to the new rates and renew their licences with SGP.\n\nFor more information about the new rates, contact the SGP Commercial Department.`,
    date: "20 Ene 2026",
    dateEn: "Jan 20, 2026",
  },
  {
    id: 4,
    slug: "convenio-ifpi-ampliado-2026",
    category: "Industria",
    titleEs: "SGP amplía su convenio con IFPI para mayor cobertura internacional",
    titleEn: "SGP expands its agreement with IFPI for greater international coverage",
    excerptEs: "El nuevo convenio permite a los productores paraguayos recaudar regalías en 15 nuevos mercados, ampliando la red de cobertura a más de 70 países.",
    excerptEn: "The new agreement allows Paraguayan producers to collect royalties in 15 new markets, expanding the coverage network to more than 70 countries.",
    contentEs: `SGP ha firmado una ampliación de su convenio con IFPI (International Federation of the Phonographic Industry) que extiende la cobertura de recaudación de regalías para los productores paraguayos a 15 nuevos mercados, incluyendo varios países de Asia y África.\n\nCon esta ampliación, los productores fonográficos paraguayos ahora pueden cobrar sus regalías en más de 70 países a través de la red de organizaciones miembros de IFPI.\n\nEste logro posiciona a Paraguay como un referente en la gestión de derechos fonográficos en América del Sur y refleja el trabajo continuo de SGP en fortalecer los lazos con organizaciones internacionales de la industria musical.`,
    contentEn: `SGP has signed an expansion of its agreement with IFPI (International Federation of the Phonographic Industry) that extends royalty collection coverage for Paraguayan producers to 15 new markets, including several countries in Asia and Africa.\n\nWith this expansion, Paraguayan phonographic producers can now collect their royalties in more than 70 countries through the network of IFPI member organisations.\n\nThis achievement positions Paraguay as a benchmark in phonographic rights management in South America and reflects SGP's ongoing work to strengthen ties with international organisations in the music industry.`,
    date: "10 Ene 2026",
    dateEn: "Jan 10, 2026",
  },
];

export function getArticleBySlug(slug: string) {
  return articles.find((a) => a.slug === slug);
}
