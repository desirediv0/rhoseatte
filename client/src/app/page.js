import HeroSectionStore from "@/components/sections/HeroSectionStore";
import CategoryGrid from "@/components/sections/CategoryGrid";
import WatchAndBuySection from "@/components/sections/WatchAndBuySection";
import NewArrivals from "@/components/sections/NewArrivals";
import FragranceFinderSection from "@/components/sections/FragranceFinderSection";
import FeaturedProducts from "@/components/sections/FeaturedProducts";
import CustomPerfumeSection from "@/components/sections/CustomPerfumeSection";
import TrustBadgesSection from "@/components/sections/TrustBadgesSection";
import HomeFAQSection from "@/components/sections/HomeFAQSection";
import JoinTheCultSection from "@/components/sections/JoinTheCultSection";

export const metadata = {
  title: "RHOSEATTE — Luxury Perfume Maison",
  description: "Discover RHOSEATTE — a luxury perfume house creating exquisite fragrances that blend timeless elegance with modern craftsmanship.",
};

export default function Home() {
  return (
    <main>
      {/* 1. Banner */}
      <HeroSectionStore />

      {/* 2. Find Your Fragrance */}
      <FragranceFinderSection />

      {/* 3. Shop By Collection */}
      <CategoryGrid />

      {/* 4. Customised Perfume */}
      <CustomPerfumeSection />

      {/* 5. Watch & Buy */}
      <WatchAndBuySection />

      {/* 6. New Arrivals */}
      <NewArrivals />

      {/* 7. Featured Products */}
      <FeaturedProducts />

      {/* 8. The Rhoseatte Promise */}
      <TrustBadgesSection />

      {/* 9. FAQ */}
      <HomeFAQSection />

      {/* 10. Join The Cult / Footer precedes */}
      <JoinTheCultSection />
    </main>
  );
}
