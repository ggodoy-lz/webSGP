import Hero from "@/components/sections/Hero";
import TwoCards from "@/components/sections/TwoCards";
import Partners from "@/components/sections/Partners";
import NewsPreview from "@/components/sections/NewsPreview";
import AwardsPreview from "@/components/sections/AwardsPreview";

export default function HomePage() {
  return (
    <>
      <Hero />
      <TwoCards />
      <NewsPreview />
      <Partners />
      <AwardsPreview />
    </>
  );
}
