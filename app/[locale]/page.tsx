import Hero from "@/components/sections/Hero";
import TwoCards from "@/components/sections/TwoCards";
import Portals from "@/components/sections/Portals";
import Partners from "@/components/sections/Partners";
import ArtistOfMonth from "@/components/sections/ArtistOfMonth";
import RankingSGP from "@/components/sections/RankingSGP";
import NewsPreview from "@/components/sections/NewsPreview";
import AwardsPreview from "@/components/sections/AwardsPreview";

export default function HomePage() {
  return (
    <>
      <Hero />
      <TwoCards />
      <Portals />
      <Partners />
      <ArtistOfMonth />
      <RankingSGP />
      <NewsPreview />
      <AwardsPreview />
    </>
  );
}
