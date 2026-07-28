"use client";

import Link from "next/link";
import { IconSparkles, IconArrowRight, IconCompass } from "@tabler/icons-react";
import Reveal from "@/components/ui/Reveal";

export default function FragranceFinderSection() {
  return (
    <section className="py-16 md:py-24 bg-noir text-white relative overflow-hidden">
      {/* Background Accent */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle at 50% 50%, rgba(184, 151, 106, 0.3) 0%, transparent 70%)"
        }}
      />

      <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-10 relative z-10">
        <Reveal>
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-gold/30 rounded-full text-gold text-xs uppercase tracking-[0.2em] mb-6">
              <IconSparkles className="w-3.5 h-3.5" />
              Scent Discovery
            </div>

            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl tracking-tight leading-tight mb-6">
              Find Your <em className="italic text-gold">Signature Scent</em>
            </h2>

            <p className="text-white/70 text-base md:text-lg font-light leading-relaxed mb-10 max-w-2xl mx-auto">
              Unsure which fragrance matches your personality and occasion? Take our 2-minute scent quiz to discover your personalized perfume selection crafted by master perfumers.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/fragrance-finder"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gold text-noir text-xs font-medium tracking-[0.15em] uppercase rounded-[6px] hover:bg-gold-light transition-all duration-300 w-full sm:w-auto justify-center"
              >
                <IconCompass className="w-4 h-4" />
                Start Fragrance Finder
                <IconArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
