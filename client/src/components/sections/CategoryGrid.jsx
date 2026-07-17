"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { fetchApi, sortCategories } from "@/lib/utils";
import Reveal from "@/components/ui/Reveal";
import { IconArrowRight, IconArrowUpRight } from "@tabler/icons-react";

const HeroCategoryCard = ({ category }) => {
  const productCount = category._count?.products || 0;

  return (
    <Link href={`/category/${category.slug}`} className="block group">
      <div
        className="relative overflow-hidden bg-noir cursor-pointer w-full"
        style={{ borderRadius: "8px", height: "600px" }}
      >
        {category.image ? (
          <Image
            src={category.image}
            alt={category.name || "Category"}
            fill
            sizes="(max-width: 1024px) 100vw, 65vw"
            className="object-cover transition-transform ease-out group-hover:scale-105"
            style={{ transitionDuration: "1400ms" }}
            loading="lazy"
            priority
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-ivory-deep">
            <span className="font-display italic text-[10rem] text-noir/10 select-none">
              {category.name?.charAt(0)?.toUpperCase() || "S"}
            </span>
          </div>
        )}

        {/* Gradient overlays */}
        <div
          className="absolute inset-0 transition-all duration-700"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.05) 100%)" }}
        />
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.15) 100%)" }}
        />

        {/* Top-left index */}
        <div className="absolute top-6 left-6 z-10">
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-medium">Featured</span>
        </div>

        {/* Bottom content */}
        <div className="absolute inset-x-0 bottom-0 z-10 p-8 md:p-10 lg:p-12">
          <div className="flex items-center gap-2 mb-4">
            <span
              className="inline-block px-3 py-1.5 text-[9px] uppercase tracking-[0.25em] font-medium"
              style={{ backgroundColor: "rgba(184,151,106,0.9)", color: "#fff", borderRadius: "3px" }}
            >
              {productCount > 0 ? `${productCount} ${productCount === 1 ? "piece" : "pieces"}` : "Explore"}
            </span>
          </div>

          <h2 className="font-display text-4xl sm:text-5xl md:text-[3.5rem] lg:text-[4rem] text-white leading-[1.05] mb-5 tracking-tight">
            {category.name}
          </h2>

          <div className="flex items-center gap-3 group/link">
            <span className="block h-px w-0 bg-gold group-hover:w-16 transition-all duration-700" />
            <span className="text-[11px] uppercase tracking-[0.18em] text-white/80 font-medium flex items-center gap-2 translate-y-0 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100">
              Explore Collection
              <IconArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" stroke={1.5} />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

const SmallCategoryCard = ({ category, index }) => {
  const productCount = category._count?.products || 0;

  return (
    <Link href={`/category/${category.slug}`} className="block group">
      <div
        className="relative overflow-hidden bg-noir cursor-pointer w-full"
        style={{ borderRadius: "8px", height: "290px" }}
      >
        {category.image ? (
          <Image
            src={category.image}
            alt={category.name || "Category"}
            fill
            sizes="(max-width: 1024px) 50vw, 18vw"
            className="object-cover transition-transform ease-out group-hover:scale-110"
            style={{ transitionDuration: "1400ms" }}
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-ivory-deep">
            <span className="font-display italic text-[5rem] text-noir/10 select-none">
              {category.name?.charAt(0)?.toUpperCase() || "S"}
            </span>
          </div>
        )}

        {/* Gradient overlays */}
        <div
          className="absolute inset-0 transition-all duration-700"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.05) 100%)" }}
        />
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.15) 100%)" }}
        />

        {/* Arrow */}
        <div className="absolute top-4 right-4 z-10">
          <div
            className="w-9 h-9 flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500"
            style={{ borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.12)", backdropFilter: "blur(6px)" }}
          >
            <IconArrowUpRight className="h-4 w-4 text-white" stroke={1.5} />
          </div>
        </div>

        {/* Bottom content */}
        <div className="absolute inset-x-0 bottom-0 z-10 p-6 md:p-7">
          <div className="flex items-center gap-2 mb-2.5">
            <span
              className="inline-block px-2.5 py-1 text-[8px] uppercase tracking-[0.2em] font-medium"
              style={{ backgroundColor: "rgba(184,151,106,0.85)", color: "#fff", borderRadius: "3px" }}
            >
              {productCount > 0 ? `${productCount} pieces` : "Explore"}
            </span>
          </div>

          <h3 className="font-display text-xl md:text-2xl text-white leading-tight mb-1.5 tracking-tight">
            {category.name}
          </h3>

          <div className="flex items-center gap-2 mt-3">
            <span className="block h-px w-0 bg-gold group-hover:w-10 transition-all duration-700" />
            <span className="text-[10px] uppercase tracking-[0.15em] text-white/70 font-medium opacity-0 group-hover:opacity-100 translate-x-[-6px] group-hover:translate-x-0 transition-all duration-500 delay-75 flex items-center gap-1.5">
              View
              <IconArrowRight className="h-3 w-3" stroke={2} />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

const SkeletonLoader = () => (
  <div className="grid grid-cols-1 lg:grid-cols-[1.85fr_1fr] gap-5">
    <div className="animate-pulse bg-ivory-deep" style={{ borderRadius: "8px", height: "600px" }} />
    <div className="grid grid-cols-2 gap-5">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="animate-pulse bg-ivory-deep" style={{ borderRadius: "8px", height: "290px" }} />
      ))}
    </div>
  </div>
);

const CategoryGrid = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchApi("/public/categories");
        if (response.success && response.data?.categories) {
          setCategories(sortCategories(response.data.categories));
        } else {
          setError(response.message || "Failed to fetch categories");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch categories");
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, []);

  if (loading) {
    return (
      <section className="py-14 md:py-16  bg-white">
        <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-10">
          <SkeletonLoader />
        </div>
      </section>
    );
  }

  if (error || !categories || categories.length === 0) {
    return null;
  }

  const heroCategory = categories[0];
  const smallCategories = categories.slice(1, 5);

  return (
    <section className="py-14 md:py-16  bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-10">
        {/* Section Header */}
        <Reveal>
          <div className="text-center mb-14 md:mb-18 lg:mb-20">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="h-px w-8 bg-gold/40" />
              <span className="text-[10px] uppercase tracking-[0.3em] text-gold font-medium">Discover</span>
              <span className="h-px w-8 bg-gold/40" />
            </div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-[42px] lg:text-[48px] text-noir tracking-tight leading-tight">
              Shop by <em className="italic text-gold-dark">Collection</em>
            </h2>
            <p className="text-[15px] md:text-[16px] text-stone mt-4 font-light tracking-wide max-w-lg mx-auto leading-relaxed">
              Explore our curated collections, each telling a unique story of elegance and refinement
            </p>
          </div>
        </Reveal>

        {/* Editorial Layout */}
        <Reveal delay={0.1}>
          <div className="grid grid-cols-1 lg:grid-cols-[1.85fr_1fr] gap-5">
            {/* Hero Category — large */}
            <div>
              <HeroCategoryCard category={heroCategory} />
            </div>

            {/* 4 smaller categories — 2×2 grid */}
            <div className="grid grid-cols-2 gap-5">
              {smallCategories.map((category, index) => (
                <SmallCategoryCard key={category.id} category={category} index={index} />
              ))}
            </div>
          </div>
        </Reveal>

        {/* View All — mobile */}
        <div className="mt-10 sm:hidden text-center">
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] font-medium text-noir hover:text-gold transition-colors duration-300"
          >
            View All Collections
            <IconArrowRight className="h-4 w-4" stroke={1.5} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
