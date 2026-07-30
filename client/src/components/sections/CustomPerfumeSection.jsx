"use client";

import Link from "next/link";
import Image from "next/image";
import { IconSparkles, IconArrowRight, IconFlask } from "@tabler/icons-react";
import Reveal from "@/components/ui/Reveal";

export default function CustomPerfumeSection() {
  return (
    <section className="py-16 md:py-24 bg-ivory relative overflow-hidden border-y border-line">
      <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <Reveal>
            <div className="relative aspect-[4/5] sm:aspect-[3/4] lg:aspect-[4/5] max-w-md mx-auto lg:max-w-none rounded-xl overflow-hidden shadow-xl bg-white border border-line/60">
              <Image
                src="/card1.jpeg"
                alt="Custom Perfume Atelier"
                fill
                className="object-contain p-2"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-noir/90 via-noir/20 to-transparent pointer-events-none" />
              <div className="absolute bottom-6 left-6 right-6 text-white z-10">
                <span className="text-xs uppercase tracking-[0.2em] text-gold block mb-1">Atelier Bespoke</span>
                <p className="font-display text-xl drop-shadow-sm">Handcrafted specifically for your unique essence</p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-gold/40 bg-gold/5 rounded-full text-gold text-xs uppercase tracking-[0.2em] mb-6">
                <IconFlask className="w-3.5 h-3.5" />
                Bespoke Atelier
              </div>

              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-noir tracking-tight leading-tight mb-6">
                Custom <em className="italic text-gold-dark">Perfume</em>
              </h2>

              <p className="text-stone text-base leading-relaxed mb-6 font-light">
                Experience the pinnacle of luxury with our bespoke fragrance creation service. Work directly with master perfumers to blend rare ingredients, personalized notes, and custom bottles tailored exclusively to your scent signature.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-gold mt-2 shrink-0" />
                  <p className="text-sm text-noir/80"><strong className="text-noir">Personalized Olfactory Consultation:</strong> Select top, heart, and base notes.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-gold mt-2 shrink-0" />
                  <p className="text-sm text-noir/80"><strong className="text-noir">Monogram Bottle:</strong> Custom luxury flacon with your name or initials.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-gold mt-2 shrink-0" />
                  <p className="text-sm text-noir/80"><strong className="text-noir">Exclusive Formula Vaulting:</strong> Your unique blend stored in our permanent vault for easy reorders.</p>
                </div>
              </div>

              <Link
                href="/custom-perfume"
                className="inline-flex items-center gap-3 px-8 py-4 bg-noir text-white text-xs font-medium tracking-[0.15em] uppercase rounded-[6px] hover:bg-gold hover:text-noir transition-all duration-300"
              >
                Create Custom Perfume
                <IconArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
