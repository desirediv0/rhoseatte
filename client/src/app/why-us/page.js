import {
  Sparkles,
  Droplets,
  Clock,
  Crown,
  Leaf,
  Gift,
  Star,
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Why Rhoseatte | Artisanal Luxury Fragrances",
  description: "Discover the Rhoseatte distinction. Handcrafted, high-longevity signature perfumes formulated with rare botanical absolutes and pure essential oils.",
};

const REASONS = [
  {
    icon: Sparkles,
    color: "#B8976A",
    title: "Artisanal Craftsmanship",
    description: "Every Rhoseatte creation is formulated in-house by master perfumers. We bypass commercial shortcuts to craft complex, original olfactory profiles.",
  },
  {
    icon: Droplets,
    color: "#B8976A",
    title: "Pure & Rare Botanical Absolutes",
    description: "We source only the finest absolute concentrates, natural resins, and premium essential oils, ensuring a rich and multi-dimensional scent journey.",
  },
  {
    icon: Clock,
    color: "#B8976A",
    title: "Exceptional Longevity (12+ Hours)",
    description: "Engineered at high Extrait and Eau de Parfum concentrations, our fragrances are designed to evolve beautifully on your skin and linger for over 12 hours.",
  },
  {
    icon: Crown,
    color: "#B8976A",
    title: "Exclusive Signature Blends",
    description: "Our signature collections, like the Nightfall Edition and Velvet Allure, offer distinct characters for individuals who prefer quiet luxury over loud statements.",
  },
  {
    icon: Leaf,
    color: "#B8976A",
    title: "Cruelty-Free & Conscious Luxury",
    description: "We prioritize ethically sourced natural ingredients, zero animal testing, and sustainable packaging without compromising on premium quality.",
  },
  {
    icon: Gift,
    color: "#B8976A",
    title: "The Unboxing Ritual",
    description: "Every bottle is encased in handcrafted packaging and accompanied by custom cards, making it the perfect personal indulgence or an exquisite gift.",
  },
];

const REVIEWS = [
  {
    name: "Kiara Sen",
    role: "Collector, Delhi",
    rating: 5,
    text: "The sillage of Velvet Allure is extraordinary. I get complimented every single time I wear it. Truly international quality handcrafted locally."
  },
  {
    name: "Rohan Malhotra",
    role: "Connoisseur, Mumbai",
    rating: 5,
    text: "Nightfall Edition is my go-to evening companion. It has this rich, woody warmth that evolves beautifully on skin and lasts into the next morning."
  },
  {
    name: "Dr. Vikram Adiga",
    role: "Physician, Bangalore",
    rating: 5,
    text: "Finally, an Indian luxury house that rivals premium niche perfume brands. The quality of the oils and the presentation is top-tier."
  }
];

const STATS = [
  { value: "100%", label: "Pure Oils & Resins" },
  { value: "12+ Hrs", label: "Longevity & Sillage" },
  { value: "15+", label: "In-House Formulations" },
  { value: "4.9★", label: "Customer Rating" },
];

export default function WhyUsPage() {
  return (
    <div className="min-h-screen bg-[#070707] text-[#F3F4F6]">
      {/* ── Hero Section ── */}
      <section className="relative py-24 md:py-32 overflow-hidden border-b border-[#1A1A1A]">
        {/* Gradients */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-[#B8976A]/5 blur-[120px]" />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full bg-[#B8976A]/3 blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <span className="text-[11px] uppercase tracking-[0.3em] text-[#B8976A] font-semibold mb-4 block">
            The Rhoseatte Olfactory Philosophy
          </span>
          <h1 className="font-display text-4xl md:text-6xl text-white mb-6 leading-tight font-medium">
            The Art of <br />
            <span className="italic font-light text-[#B8976A]">Quiet Luxury</span>
          </h1>
          <p className="text-[#9CA3AF] text-base md:text-lg max-w-2xl mx-auto font-light leading-relaxed">
            We reject the mass-produced, chemically-diluted approach. Rhoseatte stands for original signature profiles, highly concentrated pure oils, and premium packaging crafted for true perfume connoisseurs.
          </p>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="bg-[#0C0C0C] border-b border-[#1A1A1A]">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {STATS.map((stat, i) => (
              <div key={i} className="space-y-1">
                <p className="font-display text-3xl md:text-4xl font-light text-[#B8976A]">
                  {stat.value}
                </p>
                <p className="text-[11px] uppercase tracking-wider text-[#6B7280]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Reasons Grid ── */}
      <section className="py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl text-white mb-4 font-medium">
              Olfactory Excellence Redefined
            </h2>
            <p className="text-[#9CA3AF] max-w-xl mx-auto font-light text-sm">
              Discover what makes our perfumes unique compared to mass-market designer sprays.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {REASONS.map((reason, i) => (
              <div
                key={i}
                className="group bg-[#0C0C0C] rounded-xl p-8 border border-[#1A1A1A] transition-all duration-300 hover:border-[#B8976A]/40 hover:bg-[#121212] hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-6 bg-[#1A1A1A] transition-all duration-300 group-hover:bg-[#B8976A]/10">
                  <reason.icon className="h-5 w-5 text-[#B8976A] transition-transform duration-300 group-hover:scale-110" />
                </div>
                <h3 className="font-display text-lg text-white mb-3 font-medium">
                  {reason.title}
                </h3>
                <p className="text-[#9CA3AF] text-sm leading-relaxed font-light">
                  {reason.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Comparison Table Section ── */}
      <section className="py-20 bg-[#0C0C0C] border-y border-[#1A1A1A]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="font-display text-2xl md:text-3xl text-white font-medium mb-3">
              Niche Perfumery vs. Commercial Sprays
            </h2>
            <p className="text-xs text-[#6B7280]">How we deliver true value and quality</p>
          </div>

          <div className="overflow-x-auto border border-[#1A1A1A] rounded-xl">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-[#1A1A1A] bg-[#121212]">
                  <th className="p-4 font-semibold text-white">Olfactory Features</th>
                  <th className="p-4 font-semibold text-[#B8976A]">Rhoseatte Perfumes</th>
                  <th className="p-4 font-semibold text-stone-500">Commercial Brands</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1A1A]">
                <tr>
                  <td className="p-4 font-medium text-white">Concentration</td>
                  <td className="p-4 text-[#E5E7EB] font-light">Extrait (25% - 30% concentration)</td>
                  <td className="p-4 text-[#8A8A8A] font-light">EDT / EDP (8% - 15% concentration)</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-white">Formulations</td>
                  <td className="p-4 text-[#E5E7EB] font-light">In-house, original creative blends</td>
                  <td className="p-4 text-[#8A8A8A] font-light">Mass-market sweet synthetic formulas</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-white">Raw Ingredients</td>
                  <td className="p-4 text-[#E5E7EB] font-light">Pure botanical extracts & resins</td>
                  <td className="p-4 text-[#8A8A8A] font-light">Synthetics and industrial alcohol fillers</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-white">Longevity</td>
                  <td className="p-4 text-[#E5E7EB] font-light">12+ Hours (High sillage & projection)</td>
                  <td className="p-4 text-[#8A8A8A] font-light">3 - 5 Hours (Fades quickly)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Reviews Section ── */}
      <section className="py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl text-white mb-3 font-medium">
              Connoisseur Endorsements
            </h2>
            <p className="text-[#9CA3AF] text-sm font-light">
              Here is what fragrance enthusiasts have to say about their signature bottle.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {REVIEWS.map((review, i) => (
              <div
                key={i}
                className="bg-[#0C0C0C] rounded-xl p-8 border border-[#1A1A1A] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(review.rating)].map((_, j) => (
                      <Star key={j} className="h-3.5 w-3.5 fill-[#B8976A] text-[#B8976A]" />
                    ))}
                  </div>
                  <p className="text-[#9CA3AF] text-sm italic leading-relaxed font-light mb-6">
                    &quot;{review.text}&quot;
                  </p>
                </div>

                <div className="flex items-center gap-3 border-t border-[#1A1A1A] pt-4 mt-auto">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold bg-[#B8976A]/20 text-[#B8976A]">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-white">{review.name}</h4>
                    <p className="text-[10px] text-[#6B7280]">{review.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Premium CTA ── */}
      <section className="py-24 bg-[#090909] border-t border-[#1A1A1A]">
        <div className="max-w-4xl mx-auto px-6 text-center relative overflow-hidden">
          <div className="relative z-10 space-y-6">
            <h2 className="font-display text-3xl md:text-4xl text-white font-medium">
              Begin Your Olfactory Journey
            </h2>
            <p className="text-[#9CA3AF] text-base font-light max-w-xl mx-auto leading-relaxed">
              Explore our handcrafted signature blends and discover quiet luxury bottled to perfection.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-xs font-semibold uppercase tracking-wider text-noir bg-[#B8976A] hover:bg-[#c9a77a] transition-all duration-300 rounded-md"
              >
                Explore Collection <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/fragrance-finder"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-xs font-semibold uppercase tracking-wider text-[#B8976A] border border-[#B8976A]/40 hover:border-[#B8976A] hover:bg-[#B8976A]/5 transition-all duration-300 rounded-md"
              >
                Find Your Signature Scent
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
