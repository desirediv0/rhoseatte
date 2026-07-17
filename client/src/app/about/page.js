import Link from "next/link";
import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import {
  IconArrowRight,
  IconLeaf,
  IconFlask,
  IconClock,
  IconChecklist,
  IconGift,
  IconShieldCheck,
  IconHeart,
  IconAward,
  IconPackage,
  IconSparkles,
  IconBrandInstagram,
  IconBrandFacebook,
  IconMapPin,
  IconPhoneCall,
  IconBuildingStore,
  IconCoin,
  IconUsers,
  IconBuilding,
  IconCalendar,
} from "@tabler/icons-react";

export const metadata = {
  title: "The Maison | RHOSEATTE — Luxury Perfume Maison",
  description:
    "Discover RHOSEATTE — a luxury perfume house creating exquisite fragrances that blend timeless elegance with modern craftsmanship. Learn about our story and artistry.",
};

/* ─── Craft Steps ───────────────────────────────────────── */
const craftSteps = [
  {
    icon: IconLeaf,
    title: "Ingredient Selection",
    description:
      "We source the finest raw materials from Grasse, India, and the Middle East — rare absolutes, handpicked essences, and precious naturals that form the soul of each fragrance.",
  },
  {
    icon: IconFlask,
    title: "Blending",
    description:
      "Our master perfumers compose each scent with mathematical precision and artistic intuition, layering top, heart, and base notes into a harmonious olfactory narrative.",
  },
  {
    icon: IconClock,
    title: "Maceration",
    description:
      "Each blend rests in temperature-controlled vessels for weeks, allowing the notes to mature, intertwine, and develop their full character — patience as a luxury.",
  },
  {
    icon: IconChecklist,
    title: "Quality Testing",
    description:
      "Every batch undergoes rigorous sensory evaluation and stability testing. We do not compromise — only fragrances that meet our exacting standards earn the RHOSEATTE name.",
  },
  {
    icon: IconGift,
    title: "Luxury Packaging",
    description:
      "From the weight of the glass to the grain of the box, every detail is designed to make the unboxing a ritual — a moment of anticipation and delight.",
  },
];

/* ─── Features ──────────────────────────────────────────── */
const features = [
  {
    icon: IconClock,
    title: "Long Lasting",
    description:
      "Formulated for endurance. Our fragrances evolve gracefully throughout the day, revealing new facets with every passing hour.",
  },
  {
    icon: IconLeaf,
    title: "Premium Ingredients",
    description:
      "Only the finest naturals and synthetics — sourced from Grasse, India, and the world's most revered perfumery houses.",
  },
  {
    icon: IconPackage,
    title: "Luxury Packaging",
    description:
      "Every bottle is a statement piece. Heavy glass, magnetic closures, and hand-finished details that feel as premium as the scent inside.",
  },
  {
    icon: IconFlask,
    title: "Modern Perfumery",
    description:
      "Where tradition meets innovation. We honour classical techniques while embracing contemporary molecular artistry.",
  },
  {
    icon: IconHeart,
    title: "Elegant Lifestyle",
    description:
      "More than fragrance — an extension of identity. RHOSEATTE is for those who curate every detail of their lives.",
  },
  {
    icon: IconAward,
    title: "Curated Collections",
    description:
      "Each collection is thoughtfully composed around a mood, a memory, or a moment — never random, always intentional.",
  },
];

/* ─── Stats ─────────────────────────────────────────────── */
const stats = [
  { icon: IconSparkles, value: 50, suffix: "+", label: "Fragrances" },
  { icon: IconUsers, value: 10000, suffix: "+", label: "Customers" },
  { icon: IconBuilding, value: 50, suffix: "+", label: "Cities" },
  { icon: IconCalendar, value: 2, suffix: "", label: "Years of Craft" },
];

/* ─── Page ──────────────────────────────────────────────── */
export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero ──────────────────────────────────────── */}
      <section className="relative h-[60vh] md:h-[80vh] overflow-hidden">
        <Image
          src="/about-hero.jpg"
          alt="RHOSEATTE Atelier"
          fill
          className="object-cover"
          priority
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(17,17,17,0.88) 0%, rgba(17,17,17,0.35) 50%, transparent 100%)",
          }}
        />
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto px-5 pb-16 md:pb-24 w-full">
            <Reveal>
              <span className="luxe-eyebrow-dark block mb-4">Our Story</span>
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-white mb-5 tracking-tight leading-[1.1]">
                The Story of <br className="hidden sm:block" />
                <em className="luxe-italic text-gradient-light">RHOSEATTE</em>
              </h1>
              <span className="block h-px w-16 bg-gold mb-5" />
              <p className="text-white/50 max-w-lg text-sm md:text-base font-light leading-relaxed">
                A luxury perfume house born from the belief that fragrance is the
                most intimate form of self-expression.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Philosophy (Editorial 2-column) ───────────── */}
      <section className="py-20 md:py-28 px-5">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <Reveal>
              <div className="relative aspect-[3/4] overflow-hidden bg-ivory">
                <Image
                  src="/about-philosophy.jpg"
                  alt="RHOSEATTE Philosophy"
                  fill
                  className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-105"
                />
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <div>
                <span className="luxe-eyebrow block mb-5">Our Philosophy</span>
                <h2 className="font-display text-3xl sm:text-4xl md:text-[42px] text-noir tracking-tight leading-[1.15] mb-6">
                  Luxury is not a{" "}
                  <em className="italic text-gold-dark">label</em>
                  <br />
                  — it is a <em className="italic text-gold-dark">feeling</em>
                </h2>
                <div className="space-y-4 text-stone text-[14px] font-light leading-relaxed tracking-wide">
                  <p>
                    At RHOSEATTE, we believe true luxury is felt before it is seen.
                    It lives in the weight of a glass flacon, the first breath of
                    a carefully composed accord, the quiet confidence that comes
                    from wearing something crafted — not manufactured.
                  </p>
                  <p>
                    Our maison was founded on a singular conviction: that fragrance
                    should be an extension of identity. Not a trend, not a
                    commodity — but a deeply personal art form, composed with the
                    same rigour and reverence as a fine composition.
                  </p>
                  <p>
                    Every RHOSEATTE fragrance begins as a story — a memory, a
                    landscape, an emotion — and is brought to life through the
                    hands of master perfumers who understand that the finest
                    ingredients deserve the deepest respect.
                  </p>
                </div>
                <span className="block h-px w-12 bg-gold mt-8" />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Our Craft (Timeline) ──────────────────────── */}
      <section className="py-20 md:py-28 bg-ivory px-5">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="text-center mb-16">
              <span className="luxe-eyebrow block mb-5">Our Craft</span>
              <h2 className="font-display text-3xl sm:text-4xl md:text-[42px] text-noir tracking-tight">
                From <em className="italic text-gold-dark">Ingredient</em> to{" "}
                <em className="italic text-gold-dark">Indispensable</em>
              </h2>
              <p className="text-stone text-[14px] font-light mt-4 max-w-lg mx-auto tracking-wide">
                Five stages of uncompromising artistry, each one a testament to
                our devotion to the craft.
              </p>
            </div>
          </Reveal>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-line -translate-x-px" />

            <div className="space-y-12 md:space-y-16">
              {craftSteps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <Reveal key={i} delay={i * 0.08}>
                    <div
                      className={`relative flex items-start gap-6 md:gap-0 ${
                        i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                      }`}
                    >
                      {/* Dot */}
                      <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-3 h-3 rounded-full border-2 border-white shadow-sm z-10 bg-gold" />

                      <div
                        className={`ml-14 md:ml-0 md:w-1/2 ${
                          i % 2 === 0 ? "md:pr-14" : "md:pl-14"
                        }`}
                      >
                        <div className="bg-white p-7 md:p-8 border border-line hover:border-gold/30 transition-all duration-500 group">
                          <div className="w-12 h-12 flex items-center justify-center mb-5 bg-ivory border border-line group-hover:border-gold/30 transition-colors duration-300">
                            <Icon
                              className="h-5 w-5 text-gold"
                              stroke={1.5}
                            />
                          </div>
                          <div className="flex items-center gap-3 mb-3">
                            <span className="font-display text-[13px] text-gold tracking-[0.15em]">
                              {String(i + 1).padStart(2, "0")}
                            </span>
                            <span className="h-px w-6 bg-gold/40" />
                          </div>
                          <h3 className="font-display text-[17px] text-noir mb-2 tracking-tight">
                            {step.title}
                          </h3>
                          <p className="text-stone text-[13px] leading-relaxed font-light tracking-wide">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── The Perfumer ──────────────────────────────── */}
      <section className="py-20 md:py-28 px-5">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <Reveal>
              <div>
                <span className="luxe-eyebrow block mb-5">The Artisan</span>
                <h2 className="font-display text-3xl sm:text-4xl md:text-[42px] text-noir tracking-tight leading-[1.15] mb-6">
                  The <em className="italic text-gold-dark">Perfumer</em>
                </h2>
                <div className="space-y-4 text-stone text-[14px] font-light leading-relaxed tracking-wide">
                  <p>
                    Every great fragrance has a voice — and behind RHOSEATTE
                    stands a perfumer whose hands have shaped some of the most
                    compelling olfactory narratives of our time.
                  </p>
                  <p>
                    Trained in the classical traditions of Grasse and shaped by
                    the raw, untamed beauty of Indian botanics, our perfumer
                    approaches each composition as both scientist and poet.
                    Precision in formulation. Poetry in expression.
                  </p>
                  <p>
                    &ldquo;I do not create perfumes for the moment. I create them
                    for the memory they become.&rdquo;
                  </p>
                </div>
                <div className="mt-8 pt-6 border-t border-line">
                  <p className="font-display text-[15px] text-noir italic">
                    — The House Perfumer, RHOSEATTE
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="relative aspect-[3/4] overflow-hidden bg-ivory">
                <Image
                  src="/master-perfumer.jpg"
                  alt="The RHOSEATTE Perfumer"
                  fill
                  className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-105"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Why Choose RHOSEATTE ──────────────────────── */}
      <section className="py-20 md:py-28 bg-ivory px-5">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="text-center mb-16">
              <span className="luxe-eyebrow block mb-5">Why RHOSEATTE</span>
              <h2 className="font-display text-3xl sm:text-4xl md:text-[42px] text-noir tracking-tight">
                What Sets Us <em className="italic text-gold-dark">Apart</em>
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {features.map((item, i) => {
              const Icon = item.icon;
              return (
                <Reveal key={i} delay={i * 0.06}>
                  <div className="bg-white p-8 md:p-9 border border-line hover:border-gold/40 transition-all duration-500 h-full group">
                    <div className="w-12 h-12 flex items-center justify-center mb-5 border border-line bg-ivory group-hover:border-gold/30 transition-colors duration-300">
                      <Icon className="h-5 w-5 text-gold" stroke={1.5} />
                    </div>
                    <h3 className="font-display text-[16px] text-noir mb-2 tracking-tight">
                      {item.title}
                    </h3>
                    <p className="text-stone text-[13px] leading-relaxed font-light tracking-wide">
                      {item.description}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Luxury Numbers ────────────────────────────── */}
      <section className="py-20 md:py-28 px-5">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="text-center mb-16">
              <span className="luxe-eyebrow block mb-5">Our Legacy</span>
              <h2 className="font-display text-3xl sm:text-4xl md:text-[42px] text-noir tracking-tight">
                The Numbers That{" "}
                <em className="italic text-gold-dark">Define</em> Us
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <Reveal key={i} delay={i * 0.1}>
                  <div className="text-center p-8 md:p-10 border border-line hover:border-gold/30 transition-all duration-500 bg-white">
                    <div className="w-12 h-12 flex items-center justify-center mx-auto mb-5 border border-line bg-ivory">
                      <Icon className="h-5 w-5 text-gold" stroke={1.5} />
                    </div>
                    <div className="font-display text-3xl md:text-4xl text-noir mb-2">
                      <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                    </div>
                    <p className="text-[11px] uppercase tracking-[0.2em] text-stone font-medium">
                      {stat.label}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────── */}
      <section className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        <Image
          src="/about-cta.jpg"
          alt="Explore RHOSEATTE"
          fill
          className="object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(17,17,17,0.9) 0%, rgba(17,17,17,0.3) 50%, transparent 100%)",
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Reveal>
            <div className="text-center px-5">
              <span className="luxe-eyebrow-dark block mb-5">Begin Your Journey</span>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-white mb-6 tracking-tight">
                Experience The{" "}
                <em className="luxe-italic text-gradient-light">Collection</em>
              </h2>
              <span className="block h-px w-16 bg-gold mx-auto mb-8" />
              <Link
                href="/products"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gold text-white text-[11px] uppercase font-semibold tracking-[0.15em] hover:bg-gold-dark transition-colors duration-500"
                style={{ borderRadius: "var(--radius)" }}
              >
                Explore Fragrances
                <IconArrowRight className="h-4 w-4" stroke={1.5} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

    </div>
  );
}
