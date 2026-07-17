"use client";

import { useState, useEffect } from "react";
import { fetchApi } from "@/lib/utils";
import Link from "next/link";
import BrandCarousel from "@/components/sections/BrandCarousel";
import { ProductCard } from "@/components/products/ProductCard";
import Reveal from "@/components/ui/Reveal";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { IconArrowRight, IconArrowLeft } from "@tabler/icons-react";

const SECTION_METADATA = {
  featured: {
    bannerImage: "/featured_banner.png",
    tag: "Signature Collection",
    title: "NIGHTFALL",
    subtitle: "EDITION",
    dateText: "Velvet Allure & Noir Petals \u2014 our latest luxury fragrance collection",
    linkUrl: "/products?search=featured"
  },
  latest: {
    bannerImage: "/latest_banner.png",
    tag: "New Release",
    title: "VELVET",
    subtitle: "ALLURE",
    dateText: "A sophisticated blend of bergamot, sandalwood, and oud",
    linkUrl: "/products?search=latest"
  },
  bestseller: {
    bannerImage: "/bestseller_banner.png",
    tag: "Most Loved",
    title: "NOIR",
    subtitle: "PETALS",
    dateText: "Dark florals meet vanilla and patchouli in this intimate scent",
    linkUrl: "/products?search=bestseller"
  },
  trending: {
    bannerImage: "/trending_banner.png",
    tag: "Trending Now",
    title: "ARTISAN",
    subtitle: "FRAGRANCES",
    dateText: "Handcrafted scents for the discerning connoisseur",
    linkUrl: "/products?search=trending"
  },
  new: {
    bannerImage: "/new_banner.png",
    tag: "Just Arrived",
    title: "LUXURY",
    subtitle: "SCENTS",
    dateText: "Discover our newest additions to the maison",
    linkUrl: "/products?search=new"
  }
};

const ProductSkeleton = () => (
  <div className="bg-white overflow-hidden animate-pulse" style={{ borderRadius: "8px", border: "1px solid #EAEAEA" }}>
    <div className="aspect-[4/5] w-full bg-ivory" style={{ borderRadius: "8px 8px 0 0" }} />
    <div className="pt-4 pb-5 px-4 space-y-2.5">
      <div className="h-2 w-16 bg-ivory-deep" style={{ borderRadius: "2px" }} />
      <div className="h-3 w-3/4 bg-ivory-deep" style={{ borderRadius: "2px" }} />
      <div className="h-3 w-1/2 bg-ivory-deep" style={{ borderRadius: "2px" }} />
      <div className="h-3 w-20 bg-ivory-deep mt-3" style={{ borderRadius: "2px" }} />
    </div>
  </div>
);

function ProductCarousel({ products, isLoading }) {
  const [api, setApi] = useState(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => {
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    };
    api.on("select", onSelect);
    onSelect();
    return () => api.off("select", onSelect);
  }, [api]);

  useEffect(() => {
    if (!api) return;
    const interval = setInterval(() => {
      if (api.canScrollNext()) {
        api.scrollNext();
      } else {
        api.scrollTo(0);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [api]);

  if (!isLoading && products.length === 0) return null;

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5 lg:gap-6">
        {[...Array(4)].map((_, i) => <ProductSkeleton key={i} />)}
      </div>
    );
  }

  return (
    <div className="relative group/carousel">
      <Carousel
        setApi={setApi}
        opts={{ align: "start", loop: false, slidesToScroll: 1 }}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {products.map((product, index) => (
            <CarouselItem
              key={product.id || product.slug || index}
              className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4"
            >
              <ProductCard product={product} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {canScrollPrev && (
        <button
          onClick={() => api?.scrollPrev()}
          aria-label="Previous products"
          className="absolute left-0 top-[40%] -translate-y-1/2 -translate-x-2 md:-translate-x-4 w-10 h-10 md:w-12 md:h-12 bg-white border border-line text-noir flex items-center justify-center hover:bg-noir hover:text-white hover:border-noir transition-all duration-300 opacity-0 group-hover/carousel:opacity-100 z-10"
          style={{ borderRadius: "6px" }}
        >
          <IconArrowLeft className="h-4 w-4 md:h-5 md:w-5" stroke={1.5} />
        </button>
      )}
      {canScrollNext && (
        <button
          onClick={() => api?.scrollNext()}
          aria-label="Next products"
          className="absolute right-0 top-[40%] -translate-y-1/2 translate-x-2 md:translate-x-4 w-10 h-10 md:w-12 md:h-12 bg-white border border-line text-noir flex items-center justify-center hover:bg-noir hover:text-white hover:border-noir transition-all duration-300 opacity-0 group-hover/carousel:opacity-100 z-10"
          style={{ borderRadius: "6px" }}
        >
          <IconArrowRight className="h-4 w-4 md:h-5 md:w-5" stroke={1.5} />
        </button>
      )}
    </div>
  );
}

export default function HomePageContent() {
  const [loading, setLoading] = useState(true);
  const [dbSections, setDbSections] = useState([]);
  const [products, setProducts] = useState({});

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        let fetchedSections = [];
        try {
          const sectionRes = await fetchApi("/public/product-sections");
          if (sectionRes?.data?.sections) {
            fetchedSections = sectionRes.data.sections;
            setDbSections(fetchedSections);
          }
        } catch (sectionErr) {
          console.error("Error fetching db sections:", sectionErr);
        }

        const displaySections = fetchedSections.length > 0 ? fetchedSections : [
          { slug: "featured" },
          { slug: "latest" },
          { slug: "bestseller" },
          { slug: "trending" },
          { slug: "new" },
        ];

        const dynamicEndpoints = displaySections.map(sec => ({
          key: sec.slug?.toLowerCase(),
          url: `/public/products/type/${sec.slug?.toLowerCase()}?limit=12`
        }));

        const results = await Promise.allSettled(
          dynamicEndpoints.map(({ url }) => fetchApi(url))
        );

        const updated = {};
        results.forEach((result, index) => {
          const key = dynamicEndpoints[index].key;
          if (result.status === "fulfilled") {
            updated[key] = result.value?.data?.products || [];
          }
        });
        setProducts(updated);
      } catch (err) {
        console.error("Error fetching home products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const renderSection = (key, sectionIndex) => {
    const sectionProducts = products[key];
    if (!loading && sectionProducts?.length === 0) return null;

    const dbSection = dbSections.find(
      (s) =>
        s.slug?.toLowerCase() === key.toLowerCase() ||
        s.slug?.toLowerCase().replace(/-/g, "") === key.toLowerCase()
    );

    const defaultBanner = SECTION_METADATA[key] || {
      bannerImage: "/placeholder.jpg",
      tag: "Collection",
      title: key.toUpperCase(),
      subtitle: "",
      dateText: "",
      linkUrl: `/products?search=${key}`
    };

    const banner = {
      ...defaultBanner,
      bannerImage: dbSection?.image || defaultBanner.bannerImage,
      tag: defaultBanner.tag,
      title: defaultBanner.title,
      subtitle: defaultBanner.subtitle,
      dateText: defaultBanner.dateText,
    };


    return (
      <section className={`py-10 md:py-14  overflow-hidden ${sectionIndex % 2 === 1 ? "bg-ivory" : "bg-white"}`}>
        <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-10">
          <Reveal>
            <div className="mb-10 md:mb-12">
              <div className="flex items-center gap-3 mb-3">
                <span className="font-display text-[13px] text-gold tracking-[0.15em]">
                  {String(sectionIndex + 1).padStart(2, "0")}
                </span>
                <span className="h-px w-8 bg-gold/40" />
              </div>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.3em] text-stone block mb-2 font-medium">{banner.tag}</span>
                  <h2 className="font-display text-2xl md:text-3xl lg:text-[34px] tracking-tight text-noir leading-tight">
                    {banner.title.charAt(0) + banner.title.slice(1).toLowerCase()}
                    {banner.subtitle && (
                      <em className="luxe-italic text-gold ml-2">
                        {banner.subtitle.toLowerCase()}
                      </em>
                    )}
                  </h2>
                </div>
                <Link
                  href={banner.linkUrl}
                  className="shrink-0 inline-flex items-center gap-1.5 group/link text-[11px] uppercase tracking-[0.15em] text-noir/60 hover:text-noir transition-colors"
                >
                  View All
                  <IconArrowRight className="h-3.5 w-3.5 transition-transform group-hover/link:translate-x-0.5" stroke={1.5} />
                </Link>
              </div>
            </div>

            <ProductCarousel products={sectionProducts || []} isLoading={loading} />
          </Reveal>
        </div>
      </section>
    );
  };

  const displaySections = dbSections.length > 0
    ? [...dbSections].sort((a, b) => a.displayOrder - b.displayOrder)
    : [
      { id: "featured", slug: "featured", name: "SIGNATURE COLLECTION", description: "Our signature fragrances, curated for the season" },
      { id: "latest", slug: "latest", name: "NEW RELEASES", description: "Freshly crafted scents from the maison" },
      { id: "bestseller", slug: "bestseller", name: "MOST LOVED", description: "The fragrances our clients keep coming back for" },
      { id: "trending", slug: "trending", name: "TRENDING NOW", description: "The most sought-after scents of the moment" },
      { id: "new", slug: "new", name: "JUST ARRIVED", description: "New additions to our curated collection" },
    ];

  return (
    <>
      {displaySections.map((sec, idx) => {
        const key = sec.slug?.toLowerCase();
        if (!products[key]) return null;

        return (
          <div key={sec.id || key}>
            {renderSection(key, idx)}
            {idx === 0 && <BrandCarousel tag="NEW" title="Discover Our Collections" />}
            {idx === 3 && <BrandCarousel tag="LUXURY" title="Artisan Fragrances" />}
          </div>
        );
      })}
    </>
  );
}
