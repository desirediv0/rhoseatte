

import HeroSectionStore from "@/components/sections/HeroSectionStore";
import TrustBadgesSection from "@/components/sections/TrustBadgesSection";
import HomePageContent from "@/components/sections/HomePageContent";
import WatchAndBuySection from "@/components/sections/WatchAndBuySection";
import { WhyBuySection } from "@/components/sections/WhyBuySection";
import { ColdChainBanner } from "@/components/sections/JewelryHomeSections";
import CategoryGrid from "@/components/sections/CategoryGrid";
import JournalSection from "@/components/sections/JournalSection";
import NightfallEditionSection from "@/components/sections/NightfallEditionSection";

export const metadata = {
  title: "RHOSEATTE — Luxury Perfume Maison",
  description: "Discover RHOSEATTE — a luxury perfume house creating exquisite fragrances that blend timeless elegance with modern craftsmanship. Explore our curated collections.",
};

export default function Home() {
  return (
    <>
      <main>
        <HeroSectionStore />
        <CategoryGrid />
        <WatchAndBuySection />
        <HomePageContent />
        <NightfallEditionSection />
        <ColdChainBanner />
        <TrustBadgesSection />
        <JournalSection />
        <WhyBuySection />
      </main>
    </>
  );
}
