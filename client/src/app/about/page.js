"use client";

import Image from "next/image";
import Link from "next/link";
import { IconArrowRight, IconPlayerPlay, IconChevronRight, IconChevronLeft } from "@tabler/icons-react";
import { useRef } from "react";

export default function AboutPage() {
  const scrollRef = useRef(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -320, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 320, behavior: "smooth" });
    }
  };

  const processSteps = [
    {
      title: "1. Raw Botanical Extraction & Distillation",
      description: "Extracting pure botanical essences using time-honored distillation methods inspired by ancient Indian fragrance heritage.",
      videoPlaceholder: "Perfume Making & Botanical Extraction"
    },
    {
      title: "2. Accord Composition & Formulation",
      description: "Master perfumers blending top, heart, and base notes according to the principles of Brihat Samhita and Gandhayukti.",
      videoPlaceholder: "Olfactory Accord Blending"
    },
    {
      title: "3. Maceration & Age Maturation",
      description: "Resting each batch in climate-controlled tanks to allow complex natural notes to meld gracefully.",
      videoPlaceholder: "Maceration & Maturation Vault"
    },
    {
      title: "4. Sensory Evaluation & Quality Testing",
      description: "Rigorous olfactory tests ensuring peak longevity, projection, and formulation purity before bottling.",
      videoPlaceholder: "Sensory Quality Evaluation"
    },
    {
      title: "5. Artisanal Flacon Bottle Filling",
      description: "Precision filling each glass flacon under sterile, controlled atelier conditions.",
      videoPlaceholder: "Bottle Filling Process"
    },
    {
      title: "6. Hand-Finished Packaging & Dispatch",
      description: "Hand-wrapping every box with protective seals and custom details, ready for shipment to your doorstep.",
      videoPlaceholder: "Packaging & Dispatch Line"
    }
  ];

  const teamMembers = [
    {
      name: "Vaishnavi Pote",
      role: "Founder & CEO",
      image: "/Vaishnavi.jpeg",
      bio: "Biologist by education, salesperson by experience, bringing India's rich perfumery heritage back into global spotlight."
    },
    {
      name: "Dabori Khakhlary",
      role: "Marketing & Social Media Head",
      image: "/Dabori Khakhlary.jpeg",
      bio: "Leading brand strategy, digital storytelling, creative campaigns, and luxury audience engagement for Rhoseatte."
    },
    {
      name: "Suvarna",
      role: "Operations & Supply Chain Head",
      image: "/Suvarna.jpeg",
      bio: "Managing seamless supply chain, artisanal quality checks, and nationwide fulfillment for bespoke creations."
    }
  ];

  return (
    <main 
      className="bg-white text-[#111111] min-h-screen pt-28 pb-20 px-5 sm:px-8 lg:px-16"
      style={{ fontFamily: "'Times New Roman', Times, Georgia, serif" }}
    >
      <div className="max-w-6xl mx-auto space-y-24 md:space-y-32">

        {/* ── SECTION 1: Rhoseatte's Origin ── */}
        <section className="pt-8">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <span className="text-xs uppercase tracking-[0.3em] text-[#B8976A] font-semibold block">
              1. Rhoseatte&apos;s Origin
            </span>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-normal leading-tight text-[#111111]">
              Crafted With Purpose, Inspired By <em className="italic text-[#B8976A]">Heritage</em>
            </h1>

            <div className="w-16 h-px bg-[#B8976A] mx-auto my-6" />

            <p className="text-base sm:text-lg md:text-xl text-[#333333] leading-relaxed font-normal text-justify sm:text-center">
              Rhoseatte was born from a frustration with a world where too many fragrances smell the same. We believed that everyone deserves a fragrance as unique as their story not one designed to follow trends, but one that reflects individuality. Inspired by India&apos;s rich perfumery heritage and the timeless principles of <strong className="font-bold text-[#111111]">Brihat Samhita</strong> and <strong className="font-bold text-[#111111]">Gandhayukti</strong>, our formulas are crafted with purpose, where every ingredient earns its place and every blend tells a story. By combining ancient fragrance wisdom with contemporary craftsmanship, we create perfumes that are not just worn, but remembered because a truly great fragrance should leave an impression as distinctive as the person who wears it.
            </p>
          </div>
        </section>

        {/* ── SECTION 2: THE PROCESS ── */}
        <section className="border-t border-[#EAEAEA] pt-20">
          <div className="text-center mb-16 space-y-3">
            <span className="text-xs uppercase tracking-[0.3em] text-[#B8976A] font-semibold block">
              2. THE PROCESS
            </span>
            <h2 className="text-3xl sm:text-4xl font-normal text-[#111111]">
              From Atelier Creation To Your Doorstep
            </h2>
            <p className="text-sm text-[#666666] italic">
              (Alternating video showcases from perfume making to bottle filling and shipping)
            </p>
          </div>

          <div className="space-y-16 md:space-y-24">
            {processSteps.map((step, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <div 
                  key={idx}
                  className={`flex flex-col ${isEven ? "md:flex-row" : "md:flex-row-reverse"} items-center gap-8 md:gap-14 bg-white p-6 md:p-8 rounded-xl border border-[#F0F0F0] shadow-sm`}
                >
                  {/* Video Box */}
                  <div className="w-full md:w-1/2 aspect-video bg-[#FAF9F6] border border-[#E0E0E0] rounded-lg flex flex-col items-center justify-center p-6 text-center relative overflow-hidden group">
                    <div className="w-14 h-14 rounded-full bg-[#B8976A]/10 border border-[#B8976A] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                      <IconPlayerPlay className="w-6 h-6 text-[#B8976A] ml-1" />
                    </div>
                    <span className="text-xs uppercase tracking-widest text-[#B8976A] font-semibold mb-1">
                      Video Showcase {idx + 1}
                    </span>
                    <p className="text-sm font-medium text-[#222222]">
                      {step.videoPlaceholder}
                    </p>
                    <span className="text-[11px] text-[#888888] mt-2 italic">
                      Video footage loading soon
                    </span>
                  </div>

                  {/* Text Side */}
                  <div className="w-full md:w-1/2 space-y-4">
                    <span className="text-xs uppercase tracking-[0.2em] text-[#B8976A] font-bold">
                      Stage 0{idx + 1}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-normal text-[#111111]">
                      {step.title}
                    </h3>
                    <p className="text-base text-[#444444] leading-relaxed font-normal">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── SECTION 3: Behind Rhoseatte ── */}
        <section className="border-t border-[#EAEAEA] pt-20">
          <div className="mb-12">
            <span className="text-xs uppercase tracking-[0.3em] text-[#B8976A] font-semibold block mb-2">
              3. Behind Rhoseatte
            </span>
            <h2 className="text-3xl sm:text-4xl font-normal text-[#111111]">
              A Word From Our Founder
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Text on Left */}
            <div className="space-y-6 text-base sm:text-lg text-[#333333] leading-relaxed font-normal">
              <p>
                Hi, I&apos;m <strong className="font-bold text-[#111111]">Vaishnavi Pote</strong>. I&apos;ve always been fascinated by fragrances and the emotions they can bring back with just one spray. I&apos;m a biologist by education, a salesperson by experience, and now an entrepreneur with one dream to bring India&apos;s rich fragrance heritage back into the spotlight.
              </p>
              <p>
                I started Rhoseatte because I believe everyone deserves a fragrance that feels truly personal, not one that smells like everyone else&apos;s. Every perfume I create is inspired by our heritage, crafted with purpose, and made to leave a lasting memory.
              </p>
              <div className="pt-4 border-t border-[#EAEAEA]">
                <p className="text-lg font-bold text-[#111111]">Vaishnavi Pote</p>
                <p className="text-xs uppercase tracking-widest text-[#B8976A]">Founder & CEO, Rhoseatte</p>
              </div>
            </div>

            {/* Photograph on Right */}
            <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden border border-[#E0E0E0] shadow-md bg-white">
              <Image
                src="/Vaishnavi.jpeg"
                alt="Vaishnavi Pote - Founder of Rhoseatte"
                fill
                className="object-cover object-top"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </section>

        {/* ── SECTION 4: Meet the team ── */}
        <section className="border-t border-[#EAEAEA] pt-20 pb-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs uppercase tracking-[0.3em] text-[#B8976A] font-semibold block mb-2">
                4. Meet the Team
              </span>
              <h2 className="text-3xl sm:text-4xl font-normal text-[#111111]">
                The Minds Behind Rhoseatte
              </h2>
            </div>

            {/* Horizontal Scroll Nav Buttons */}
            <div className="flex items-center gap-3">
              <button 
                onClick={scrollLeft}
                className="w-10 h-10 rounded-full border border-[#D0D0D0] flex items-center justify-center text-[#111111] hover:border-[#B8976A] hover:text-[#B8976A] transition-colors"
                aria-label="Scroll left"
              >
                <IconChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={scrollRight}
                className="w-10 h-10 rounded-full border border-[#D0D0D0] flex items-center justify-center text-[#111111] hover:border-[#B8976A] hover:text-[#B8976A] transition-colors"
                aria-label="Scroll right"
              >
                <IconChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Horizontal Scrollable Team Cards */}
          <div 
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto pb-6 scrollbar-none snap-x snap-mandatory"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {teamMembers.map((member, idx) => (
              <div 
                key={idx}
                className="min-w-[280px] sm:min-w-[340px] max-w-[360px] bg-white border border-[#E0E0E0] rounded-xl p-6 snap-start flex-shrink-0 shadow-sm hover:border-[#B8976A] transition-colors"
              >
                <div className="relative aspect-[4/5] w-full rounded-lg overflow-hidden mb-6 bg-[#FAF9F6]">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover object-top"
                  />
                </div>
                <h3 className="text-xl font-bold text-[#111111] mb-1">{member.name}</h3>
                <p className="text-xs uppercase tracking-widest text-[#B8976A] font-semibold mb-3">{member.role}</p>
                <p className="text-sm text-[#555555] leading-relaxed font-normal">{member.bio}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}
