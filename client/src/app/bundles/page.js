"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { fetchApi } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  IconArrowRight,
  IconArrowUpRight,
  IconPackage,
  IconSparkles,
  IconLoader2,
} from "@tabler/icons-react";

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

/* ─── Bundle Card ──────────────────────────────────────── */
function BundleCard({ bundle, index }) {
  const lowestSlab = Array.isArray(bundle.pricingSlabs) ? bundle.pricingSlabs[0] : undefined;
  const highestSlab = Array.isArray(bundle.pricingSlabs) && bundle.pricingSlabs.length > 0
    ? bundle.pricingSlabs[bundle.pricingSlabs.length - 1]
    : undefined;

  return (
    <motion.div variants={cardVariant}>
      <Link href={`/bundles/${bundle.slug}`} className="block group">
        <div className="relative overflow-hidden bg-noir cursor-pointer" style={{ borderRadius: "8px", height: "480px" }}>
          {/* Banner Image */}
          {bundle.banner ? (
            <Image
              src={bundle.banner}
              alt={bundle.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform ease-out group-hover:scale-105"
              style={{ transitionDuration: "1400ms" }}
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-noir via-stone/90 to-gold/20 flex items-center justify-center">
              <IconPackage className="h-20 w-20 text-white/10" stroke={1} />
            </div>
          )}

          {/* Gradient overlays */}
          <div
            className="absolute inset-0 transition-all duration-700"
            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.4) 45%, rgba(0,0,0,0.05) 100%)" }}
          />
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.15) 100%)" }}
          />

          {/* Bundle Type Badge */}
          <div className="absolute top-6 left-6 z-10">
            <span
              className="inline-block px-3 py-1.5 text-[9px] uppercase tracking-[0.25em] font-medium"
              style={{ backgroundColor: "rgba(184,151,106,0.9)", color: "#fff", borderRadius: "3px" }}
            >
              {bundle.bundleType?.replace(/_/g, " ") || "Bundle"}
            </span>
          </div>

          {/* Arrow on hover */}
          <span className="absolute top-6 right-6 z-10 w-10 h-10 flex items-center justify-center border border-white/20 text-white opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 bg-white/10 backdrop-blur-sm">
            <IconArrowUpRight className="h-4 w-4" stroke={1.5} />
          </span>

          {/* Bottom Content */}
          <div className="absolute inset-x-0 bottom-0 z-10 p-8 md:p-10">
            <h2 className="font-display text-3xl md:text-4xl text-white leading-tight mb-3 tracking-tight">
              {bundle.title}
            </h2>

            {bundle.description && (
              <p className="text-white/50 text-sm font-light line-clamp-2 mb-5 max-w-md">
                {bundle.description}
              </p>
            )}

            {/* Pricing Slabs */}
            {lowestSlab && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                {bundle.pricingSlabs?.slice(0, 3).map((slab, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-3 py-1.5 bg-white/10 backdrop-blur-sm text-white/80 rounded-[3px] uppercase tracking-wider font-medium"
                  >
                    {slab.itemCount} items — ₹{slab.price?.toLocaleString("en-IN")}
                  </span>
                ))}
                {(bundle.pricingSlabs?.length || 0) > 3 && (
                  <span className="text-[10px] px-3 py-1.5 bg-white/5 text-white/40 rounded-[3px]">
                    +{bundle.pricingSlabs.length - 3} more
                  </span>
                )}
              </div>
            )}

            {/* CTA */}
            <div className="flex items-center gap-3">
              <span className="block h-px w-0 bg-gold group-hover:w-12 transition-all duration-700" />
              <span className="text-[11px] uppercase tracking-[0.18em] text-white/80 font-medium flex items-center gap-2 translate-y-0 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100">
                Explore Bundle
                <IconArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" stroke={1.5} />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ─── Skeleton ──────────────────────────────────────────── */
function BundleSkeleton() {
  return (
    <div className="animate-pulse" style={{ borderRadius: "8px", height: "480px" }}>
      <div className="relative w-full h-full bg-stone/10 overflow-hidden" style={{ borderRadius: "8px" }}>
        <div className="absolute inset-0 bg-gradient-to-t from-noir/80 via-transparent to-transparent" />
        <div className="absolute bottom-8 left-8 right-8 space-y-3">
          <div className="h-6 bg-white/10 rounded w-1/2" />
          <div className="h-4 bg-white/10 rounded w-3/4" />
          <div className="flex gap-2">
            <div className="h-6 bg-white/10 rounded w-20" />
            <div className="h-6 bg-white/10 rounded w-20" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────── */
export default function BundlesPage() {
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBundles = async () => {
      try {
        const res = await fetchApi("/bundles");
        setBundles(res.data || []);
      } catch (err) {
        setError(err.message || "Failed to load bundles");
      } finally {
        setLoading(false);
      }
    };
    fetchBundles();
  }, []);

  return (
    <div className="min-h-screen bg-white">

      {/* Hero */}
      <section className="relative py-20 md:py-28 overflow-hidden bg-noir luxe-grain luxe-aurora">
        <span
          className="pointer-events-none select-none absolute -bottom-10 left-1/2 -translate-x-1/2 font-display italic whitespace-nowrap text-[9rem] leading-none text-hollow opacity-40 hidden lg:block"
          aria-hidden="true"
        >
          Bundles
        </span>
        <div className="relative z-10 max-w-7xl mx-auto px-5 text-center">
          <div className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.3em] text-white/40 mb-7">
            <Link href="/" className="hover:text-gold-light transition-colors">Home</Link>
            <span className="text-gold">·</span>
            <span className="text-white/80">Bundles</span>
          </div>
          <span className="luxe-eyebrow-dark block mb-5">
            {loading ? "Curated For You" : `${bundles.length} Exclusive Bundle${bundles.length !== 1 ? "s" : ""}`}
          </span>
          <h1 className="font-display text-4xl md:text-6xl text-ivory mb-6 tracking-tight">
            Bundle <em className="luxe-italic text-gradient-light">Collections</em>
          </h1>
          <span className="mx-auto block h-px w-24 bg-gradient-to-r from-transparent via-gold to-transparent mb-6" />
          <p className="text-white/50 max-w-lg mx-auto text-sm md:text-base font-light leading-relaxed">
            Curated bundles at exclusive prices. Save more when you buy together.
          </p>
        </div>
      </section>

      {/* Error */}
      {error && (
        <div className="max-w-7xl mx-auto px-5 mt-8">
          <div className="bg-ivory border border-brand-error/30 p-5 flex items-start gap-3">
            <IconSparkles className="text-brand-error flex-shrink-0 w-5 h-5 mt-0.5" stroke={1.5} />
            <div>
              <h3 className="font-display text-lg text-noir mb-1">Error Loading Bundles</h3>
              <p className="text-stone text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Bundles Grid */}
      <div className="max-w-7xl mx-auto px-5 py-16 md:py-24">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => <BundleSkeleton key={i} />)}
          </div>
        ) : bundles.length === 0 ? (
          <div className="text-center py-24 bg-ivory border border-line">
            <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center border border-line bg-white">
              <IconPackage className="w-7 h-7 text-gold-dark" stroke={1.2} />
            </div>
            <h2 className="font-display text-3xl text-noir mb-3">No Bundles Available</h2>
            <p className="text-stone mb-10 max-w-sm mx-auto text-sm font-light">
              Exclusive bundles will appear here once added.
            </p>
            <Link href="/products" className="btn-luxe">
              Browse All Products <IconArrowRight className="h-4 w-4" stroke={1.5} />
            </Link>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            {bundles.map((bundle, i) => (
              <BundleCard key={bundle.id} bundle={bundle} index={i} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
