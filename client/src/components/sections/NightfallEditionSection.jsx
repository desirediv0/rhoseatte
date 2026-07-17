"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { IconArrowRight } from "@tabler/icons-react";

const NIGHTFALL_FRAGRANCES = [
  {
    name: "Velvet Allure",
    tagline: "A sophisticated embrace",
    image: "/velvet-allure.jpg",
    notes: [
      { type: "Top", ingredients: ["Bergamot", "Limonene", "Lavender"] },
      { type: "Heart", ingredients: ["Sandalwood", "Vetiver", "Hedione", "Iso E Super"] },
      { type: "Base", ingredients: ["Oud", "Amber", "Galaxolide", "Oakmoss"] },
    ],
    mood: ["Romantic", "Elegant", "Mysterious"],
    description: "A sophisticated blend that opens with bright bergamot and lavender, deepens into warm sandalwood and vetiver, and settles into a luxurious base of oud and amber.",
  },
  {
    name: "Noir Petals",
    tagline: "Dark florals, eternal grace",
    image: "/noir-petals.jpg",
    notes: [
      { type: "Top", ingredients: ["Raspberry", "Peach"] },
      { type: "Heart", ingredients: ["Jasmine", "Rose Royal", "Hedione", "Ambroxan"] },
      { type: "Base", ingredients: ["Patchouli", "Vanilla", "Galaxolide"] },
    ],
    mood: ["Feminine", "Soft", "Confident"],
    description: "Dark florals meet sweet vanilla in this intimate scent. Raspberry and peach open into a heart of jasmine and rose, while patchouli and vanilla create a lasting impression.",
  },
];

const OCCASIONS = [
  "Candlelight Dinners",
  "First Dates",
  "Anniversary Celebrations",
  "Evening Weddings",
  "Cocktail Parties",
  "Luxury Dining",
  "Rooftop Evenings",
  "Romantic Getaways",
  "Sunset Escapes",
  "Festive Celebrations",
  "Night Drives",
  "Formal Events",
  "Intimate Gatherings",
];

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

export default function NightfallEditionSection() {
  return (
    <section className="bg-white overflow-hidden">
      {/* Hero Banner */}
      <div className="relative h-[50vh] md:h-[70vh] lg:h-[80vh] overflow-hidden">
        <Image
          src="/nightfall-hero.jpg"
          alt="Nightfall Edition"
          fill
          className="object-cover"
          priority
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(17,17,17,0.9) 0%, rgba(17,17,17,0.3) 50%, rgba(17,17,17,0.1) 100%)" }}
        />
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-10 pb-16 md:pb-20 w-full">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
            >
              <motion.span variants={fadeInUp} className="text-[10px] uppercase tracking-[0.3em] text-gold font-medium block mb-4">
                The Collection
              </motion.span>
              <motion.h2
                variants={fadeInUp}
                className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white tracking-tight leading-[1.05]"
              >
                Nightfall <em className="italic text-gold-dark">Edition</em>
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-white/60 text-[15px] md:text-[16px] mt-5 max-w-lg font-light tracking-wide leading-relaxed">
                Created for those who appreciate quiet luxury over loud statements. Each fragrance is an intimate evening companion.
              </motion.p>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="py-20 md:py-28 lg:py-32">
        <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-10">
          {/* Fragrance Stories — alternating layout */}
          {NIGHTFALL_FRAGRANCES.map((fragrance, index) => (
            <motion.div
              key={fragrance.name}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={staggerContainer}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center mb-24 md:mb-32 last:mb-0 ${
                index % 2 !== 0 ? "lg:[direction:rtl]" : ""
              }`}
            >
              {/* Image */}
              <motion.div variants={fadeInUp} className={index % 2 !== 0 ? "lg:[direction:ltr]" : ""}>
                <div className="relative overflow-hidden aspect-[4/5] group" style={{ borderRadius: "8px" }}>
                  <Image
                    src={fragrance.image}
                    alt={fragrance.name}
                    fill
                    className="object-cover transition-transform ease-out group-hover:scale-105"
                    style={{ transitionDuration: "1400ms" }}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  <div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 50%)" }}
                  />
                </div>
              </motion.div>

              {/* Content */}
              <motion.div variants={fadeInUp} className={`space-y-7 ${index % 2 !== 0 ? "lg:[direction:ltr]" : ""}`}>
                <div>
                  <span className="text-[10px] uppercase tracking-[0.3em] text-gold font-medium block mb-3">
                    0{index + 1} — {fragrance.mood[0]}
                  </span>
                  <h3 className="font-display text-3xl md:text-4xl lg:text-[2.75rem] text-noir tracking-tight leading-tight">
                    {fragrance.name}
                  </h3>
                  <p className="text-gold-dark text-[14px] italic mt-2 font-light">{fragrance.tagline}</p>
                </div>

                <p className="text-stone text-[14px] md:text-[15px] leading-relaxed font-light">
                  {fragrance.description}
                </p>

                {/* Notes */}
                <div className="space-y-5">
                  {fragrance.notes.map((note) => (
                    <div key={note.type}>
                      <span className="text-[9px] uppercase tracking-[0.25em] text-gold font-medium block mb-2.5">
                        {note.type} Notes
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {note.ingredients.map((ingredient) => (
                          <span
                            key={ingredient}
                            className="px-3 py-1.5 text-[11px] tracking-wide text-stone border border-line"
                            style={{ borderRadius: "4px" }}
                          >
                            {ingredient}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Mood */}
                <div>
                  <span className="text-[9px] uppercase tracking-[0.25em] text-gold font-medium block mb-2.5">
                    Mood
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {fragrance.mood.map((m) => (
                      <span
                        key={m}
                        className="px-3 py-1.5 text-[11px] tracking-wide text-noir border border-noir/10"
                        style={{ borderRadius: "4px" }}
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}

          {/* Scent Personality */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerContainer}
            className="text-center mt-24 md:mt-32 mb-20 md:mb-28"
          >
            <motion.span variants={fadeInUp} className="text-[10px] uppercase tracking-[0.3em] text-gold font-medium block mb-4">
              Scent Personality
            </motion.span>
            <motion.h3
              variants={fadeInUp}
              className="font-display text-2xl md:text-3xl text-noir tracking-tight mb-10"
            >
              Created for those who...
            </motion.h3>
            <motion.div variants={fadeInUp} className="max-w-xl mx-auto space-y-4">
              {[
                "Appreciate quiet luxury over loud statements",
                "Choose elegance before extravagance",
                "Leave lasting impressions through presence, not volume",
                "Believe confidence is calm, not noisy",
                "Turn ordinary evenings into unforgettable memories",
              ].map((trait, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 text-left p-4 border border-line"
                  style={{ borderRadius: "6px" }}
                >
                  <span className="text-gold text-lg font-light">—</span>
                  <span className="text-stone text-[14px] font-light tracking-wide">{trait}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Occasions */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerContainer}
            className="mb-20 md:mb-28"
          >
            <motion.span variants={fadeInUp} className="text-[10px] uppercase tracking-[0.3em] text-gold font-medium block mb-4 text-center">
              Perfect For
            </motion.span>
            <motion.h3
              variants={fadeInUp}
              className="font-display text-2xl md:text-3xl text-noir tracking-tight mb-10 text-center"
            >
              The Occasions
            </motion.h3>
            <motion.div variants={fadeInUp} className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
              {OCCASIONS.map((occasion) => (
                <span
                  key={occasion}
                  className="px-4 py-2 text-[10px] uppercase tracking-[0.12em] text-stone border border-line hover:border-gold hover:text-gold transition-colors duration-300 cursor-default"
                  style={{ borderRadius: "4px" }}
                >
                  {occasion}
                </span>
              ))}
            </motion.div>
          </motion.div>

          {/* Story */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerContainer}
            className="max-w-2xl mx-auto text-center mb-16"
          >
            <motion.span variants={fadeInUp} className="text-[10px] uppercase tracking-[0.3em] text-gold font-medium block mb-4">
              The Story
            </motion.span>
            <motion.h3
              variants={fadeInUp}
              className="font-display text-2xl md:text-3xl text-noir tracking-tight mb-6"
            >
              Behind the Fragrance
            </motion.h3>
            <motion.p variants={fadeInUp} className="text-stone text-[14px] md:text-[15px] leading-relaxed mb-4 font-light">
              Nightfall Edition is inspired by India&apos;s timeless relationship with fragrance — where flowers bloomed in palace gardens, evenings unfolded beneath lantern-lit courtyards, and perfume became an extension of one&apos;s presence.
            </motion.p>
            <motion.p variants={fadeInUp} className="text-stone text-[14px] md:text-[15px] leading-relaxed font-light">
              Rather than recreating history, this collection reinterprets its elegance through modern craftsmanship, blending refined florals and sophisticated woods into fragrances designed for today&apos;s unforgettable evenings.
            </motion.p>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeInUp}
            className="text-center"
          >
            <Link
              href="/products?search=nightfall"
              className="inline-flex items-center gap-2.5 bg-noir text-white px-8 py-4 text-[11px] uppercase tracking-[0.15em] font-medium hover:bg-gold-dark transition-colors duration-500"
              style={{ borderRadius: "8px" }}
            >
              Discover Nightfall Edition
              <IconArrowRight className="h-4 w-4" stroke={1.5} />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
