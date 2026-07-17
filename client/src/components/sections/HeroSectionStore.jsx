"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconArrowRight,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";

const LOCAL_FALLBACKS = [
  {
    id: "fallback-1",
    image: "/hero.jpg",
    tabletImage: "/hero-tablet.jpg",
    mobileImage: "/hero-mobile.jpg",
    title: "Step Into the World of RHOSEATTE",
    subtitle: "A curated gallery of luxury fragrances, crafted for those who appreciate quiet elegance.",
    link: "/products",
  },
  {
    id: "fallback-2",
    image: "/hero-slide-2.jpg",
    tabletImage: "/hero-tablet.jpg",
    mobileImage: "/hero-mobile.jpg",
    title: "The Art of Fragrance",
    subtitle: "Each scent tells a story \u2014 layered, complex, and unmistakably yours.",
    link: "/categories",
  },
];

function SkeletonLoader() {
  return (
    <div className="min-h-[500px] md:min-h-[700px] lg:min-h-[850px] bg-noir animate-pulse">
      <div className="absolute inset-0 bg-gradient-to-br from-noir via-noir/90 to-noir/80" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center space-y-6 px-6">
          <div className="h-px w-16 bg-white/10 mx-auto" />
          <div className="h-8 w-48 bg-white/5 rounded mx-auto" />
          <div className="h-4 w-64 bg-white/5 rounded mx-auto" />
          <div className="h-10 w-40 bg-white/5 rounded mx-auto mt-4" />
        </div>
      </div>
    </div>
  );
}

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction) => ({
    x: direction > 0 ? "-100%" : "100%",
    opacity: 0,
  }),
};

const contentVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay: 0.3 + i * 0.15, ease: [0.22, 1, 0.36, 1] },
  }),
  exit: { opacity: 0, y: -12, transition: { duration: 0.3 } },
};

export default function HeroSectionStore() {
  const router = useRouter();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isLaptop, setIsLaptop] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const autoPlayRef = useRef(null);

  useEffect(() => {
    const checkScreen = () => {
      const w = window.innerWidth;
      setIsMobile(w < 640);
      setIsTablet(w >= 640 && w < 1024);
      setIsLaptop(w >= 1024 && w < 1440);
    };
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  useEffect(() => {
    let alive = true;
    fetchApi("/public/banners")
      .then((res) => {
        const arr = res?.data?.banners;
        if (alive && Array.isArray(arr) && arr.length > 0) {
          const mapped = arr.map((b, i) => ({
            id: b._id || b.id || `banner-${i}`,
            image: b.image || b.imageUrl || "/hero.jpg",
            tabletImage: b.tabletImage || b.tabletImg || b.image || b.imageUrl || "/hero-tablet.jpg",
            mobileImage: b.mobileImage || b.mobileImg || b.image || b.imageUrl || "/hero-mobile.jpg",
            title: b.title || "RHOSEATTE",
            subtitle: b.subtitle || "Discover luxury, redefined.",
            link: b.link || "/products",
          }));
          setBanners(mapped);
        } else if (alive) {
          setBanners(LOCAL_FALLBACKS);
        }
      })
      .catch(() => {
        if (alive) setBanners(LOCAL_FALLBACKS);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => { alive = false; };
  }, []);

  const goTo = useCallback(
    (idx) => {
      setDirection(idx > currentIndex ? 1 : -1);
      setCurrentIndex(idx);
    },
    [currentIndex]
  );

  const next = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  }, [banners.length]);

  useEffect(() => {
    if (banners.length <= 1 || isPaused) return;
    autoPlayRef.current = setInterval(next, 5000);
    return () => clearInterval(autoPlayRef.current);
  }, [banners.length, isPaused, next]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [next, prev]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) next();
      else prev();
    }
  };

  if (loading) return <SkeletonLoader />;

  const current = banners[currentIndex];

  return (
    <section
      className="relative w-full bg-noir text-white overflow-hidden"
      style={{
        height: isMobile ? "550px" : isTablet ? "600px" : isLaptop ? "700px" : "850px",
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="region"
      aria-label="Hero banner carousel"
    >
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={current.id}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <Image
            src={
              isMobile
                ? current.mobileImage || "/hero-mobile.jpg"
                : (isTablet ? current.tabletImage || "/hero-tablet.jpg" : current.image || "/hero.jpg")
            }
            alt={current.title}
            fill
            priority={currentIndex === 0}
            sizes="100vw"
            className="object-cover object-center"
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyMCIgaGVpZ2h0PSIxMDgwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMxMTExMTEiLz48L3N2Zz4="
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          className="absolute inset-0 z-20 flex items-center"
        >
          <div className="w-full px-5 sm:px-10 md:px-16 lg:px-20 xl:px-24">
            <div className="max-w-[620px] pointer-events-auto">
              <motion.div
                custom={0}
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="flex items-center gap-3 mb-6 md:mb-8"
              >
                <span className="block h-px w-10 bg-gold" />
                <span className="text-[10px] md:text-[11px] uppercase tracking-[0.3em] text-white/70 font-light">
                  The RHOSEATTE Maison
                </span>
              </motion.div>

              <motion.h1
                custom={1}
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="font-display font-normal leading-[1.05] mb-6 md:mb-8 text-white"
                style={{
                  fontSize: isMobile ? "36px" : isTablet ? "48px" : isLaptop ? "60px" : "78px",
                }}
              >
                {current.title.split(" ").length > 3 ? (
                  <>
                    {current.title.split(" ").slice(0, Math.ceil(current.title.split(" ").length / 2)).join(" ")}{" "}
                    <em className="italic text-gold-light">
                      {current.title.split(" ").slice(Math.ceil(current.title.split(" ").length / 2)).join(" ")}
                    </em>
                  </>
                ) : (
                  current.title
                )}
              </motion.h1>

              <motion.p
                custom={2}
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="font-light leading-relaxed tracking-wide mb-10 md:mb-12 text-white/70 max-w-[520px]"
                style={{
                  fontSize: isMobile ? "16px" : isTablet ? "17px" : "19px",
                }}
              >
                {current.subtitle}
              </motion.p>

              <motion.div
                custom={3}
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="flex flex-wrap gap-4"
              >
                <button
                  onClick={() => router.push(current.link || "/products")}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gold text-noir text-[13px] font-medium tracking-[0.08em] uppercase rounded-[6px] hover:bg-gold-light transition-all duration-300 active:scale-[0.98]"
                  style={{ height: "56px", paddingLeft: "34px", paddingRight: "34px" }}
                >
                  Explore Now
                  <IconArrowRight className="h-4 w-4" stroke={1.5} />
                </button>
                <Link
                  href="/categories"
                  className="inline-flex items-center gap-3 px-8 py-4 border border-white/25 text-white text-[13px] font-light tracking-[0.08em] uppercase rounded-[6px] hover:bg-white/10 transition-all duration-300 active:scale-[0.98]"
                  style={{ height: "56px", paddingLeft: "34px", paddingRight: "34px" }}
                >
                  Browse Collections
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {banners.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm border border-white/10 text-white/60 hover:text-white hover:bg-black/50 transition-all duration-300"
            aria-label="Previous banner"
          >
            <IconChevronLeft className="h-6 w-6" stroke={1.5} />
          </button>
          <button
            onClick={next}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm border border-white/10 text-white/60 hover:text-white hover:bg-black/50 transition-all duration-300"
            aria-label="Next banner"
          >
            <IconChevronRight className="h-6 w-6" stroke={1.5} />
          </button>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`transition-all duration-300 rounded-full ${
                  i === currentIndex
                    ? "w-8 h-2 bg-gold"
                    : "w-2 h-2 bg-white/30 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
        </>
      )}

      <div className="absolute bottom-0 left-0 right-0 z-10">
        <div className="w-full px-5 sm:px-10 md:px-16 lg:px-20 xl:px-24 pb-6 md:pb-8 flex items-end justify-between">
          <span className="text-[9px] uppercase tracking-[0.35em] text-white/25">
            RHOSEATTE \u2014 Luxury Perfume Maison
          </span>
          <span className="text-[9px] uppercase tracking-[0.35em] text-white/25">
            {String(currentIndex + 1).padStart(2, "0")} / {String(banners.length).padStart(2, "0")}
          </span>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 z-[5] bg-gradient-to-t from-noir to-transparent pointer-events-none" />
    </section>
  );
}
