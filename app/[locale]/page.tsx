import Hero from "@/components/sections/Hero";
import TwoCards from "@/components/sections/TwoCards";
import Partners from "@/components/sections/Partners";
import NewsPreview from "@/components/sections/NewsPreview";
import AwardsPreview from "@/components/sections/AwardsPreview";
import { soloPublicadas } from "@/lib/news-data";
import { leerNoticias } from "@/lib/news-store";

export default async function HomePage() {
  // El carrusel muestra las últimas notas publicadas desde /admin/noticias.
  const noticias = soloPublicadas(await leerNoticias()).slice(0, 6);

  return (
    <>
      <Hero />
      <TwoCards />
      <NewsPreview articles={noticias} />
      <Partners />
      <AwardsPreview />
    </>
  );
}
