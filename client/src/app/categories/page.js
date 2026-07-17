"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { fetchApi, sortCategories } from "@/lib/utils";
import {
  IconSearch,
  IconArrowRight,
  IconArrowUpRight,
  IconChevronLeft,
  IconChevronRight,
  IconMoodEmpty,
  IconSparkles,
} from "@tabler/icons-react";

const getImageUrl = (image) => {
  if (!image) return "/placeholder.jpg";
  if (image.startsWith("http")) return image;
  return image;
};

/* ─── Category Card ─────────────────────────────────────── */
const CategoryCard = ({ category, index }) => {
  const productCount = category._count?.products || 0;

  return (
    <Link href={`/category/${category.slug}`} className="group block">
      <div className="bg-white border border-line overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.08)] hover:border-gold/30">
        {/* Image */}
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-ivory">
          {category.image ? (
            <Image
              src={getImageUrl(category.image)}
              alt={category.name}
              fill
              className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="font-display italic text-[5rem] text-noir/5 select-none">
                {category.name?.charAt(0)?.toUpperCase() || "S"}
              </span>
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-noir/0 group-hover:bg-noir/10 transition-all duration-500" />

          {/* Arrow */}
          <span className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center border border-white/30 text-white opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 bg-noir/20 backdrop-blur-sm">
            <IconArrowUpRight className="h-4 w-4" stroke={1.5} />
          </span>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="font-display text-lg text-noir tracking-tight mb-1">
            {category.name}
          </h3>
          <p className="text-[11px] text-stone font-light mb-3">
            {productCount > 0 ? `${productCount} Pieces` : "Explore Collection"}
          </p>
          <span className="inline-flex items-center gap-2 text-[10px] uppercase font-medium tracking-[0.15em] text-noir group-hover:text-gold transition-colors duration-300">
            Explore Collection
            <span className="h-px w-0 bg-gold group-hover:w-6 transition-all duration-500" />
            <IconArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" stroke={1.5} />
          </span>
        </div>
      </div>
    </Link>
  );
};

/* ─── Skeleton ──────────────────────────────────────────── */
const CategoryCardSkeleton = () => (
  <div className="overflow-hidden animate-pulse bg-white border border-line">
    <div className="aspect-[4/5] w-full bg-ivory-deep" />
    <div className="p-5 space-y-3">
      <div className="h-4 bg-ivory-deep rounded w-2/3" />
      <div className="h-3 bg-ivory-deep rounded w-1/3" />
      <div className="h-3 bg-ivory-deep rounded w-1/2" />
    </div>
  </div>
);

/* ─── Main Page ─────────────────────────────────────────── */
export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("name-asc");
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const limit = 24;

  const fetchCategories = useCallback(async (page = 1, searchQuery = "", sortValue = "name-asc") => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        sort: sortValue,
      });
      if (searchQuery) params.set("search", searchQuery);

      const res = await fetchApi(`/public/categories?${params.toString()}`);
      const cats = res.data?.categories || [];
      const pag = res.data?.pagination;

      if (pag) {
        setCategories(cats);
        setPagination(pag);
      } else {
        setCategories(sortCategories(cats));
        setPagination(null);
      }
    } catch (err) {
      setError(err.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories(1, "", "name-asc");
  }, [fetchCategories]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);
    setCurrentPage(1);
    if (searchTimeout) clearTimeout(searchTimeout);
    const timeout = setTimeout(() => {
      fetchCategories(1, value, sort);
    }, 300);
    setSearchTimeout(timeout);
  };

  const handleSort = (e) => {
    const value = e.target.value;
    setSort(value);
    setCurrentPage(1);
    fetchCategories(1, search, value);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchCategories(page, search, sort);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const showPagination = pagination && pagination.pages > 1;

  return (
    <div className="min-h-screen bg-white">

      {/* Hero */}
      <section className="relative py-20 md:py-28 overflow-hidden bg-noir luxe-grain luxe-aurora">
        <span
          className="pointer-events-none select-none absolute -bottom-10 left-1/2 -translate-x-1/2 font-display italic whitespace-nowrap text-[9rem] leading-none text-hollow opacity-40 hidden lg:block"
          aria-hidden="true"
        >
          Collections
        </span>
        <div className="relative z-10 max-w-7xl mx-auto px-5 text-center">
          <div className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.3em] text-white/40 mb-7">
            <Link href="/" className="hover:text-gold-light transition-colors">Home</Link>
            <span className="text-gold">·</span>
            <span className="text-white/80">Collections</span>
          </div>
          <span className="luxe-eyebrow-dark block mb-5">
            {pagination ? `${pagination.total} Curated Collections` : categories.length > 0 ? `${categories.length} Curated Collections` : "Curated For You"}
          </span>
          <h1 className="font-display text-4xl md:text-6xl text-ivory mb-6 tracking-tight">
            The <em className="luxe-italic text-gradient-light">Collections</em>
          </h1>
          <span className="mx-auto block h-px w-24 bg-gradient-to-r from-transparent via-gold to-transparent mb-6" />
          <p className="text-white/50 max-w-lg mx-auto text-sm md:text-base font-light leading-relaxed">
            Handpicked edits — from clothing and bags to footwear and accessories.
          </p>
        </div>
      </section>

      {/* Error */}
      {error && (
        <div className="max-w-7xl mx-auto px-5 mt-8">
          <div className="bg-ivory border border-brand-error/30 p-5 flex items-start gap-3">
            <IconMoodEmpty className="text-brand-error flex-shrink-0 w-5 h-5 mt-0.5" stroke={1.5} />
            <div>
              <h3 className="font-display text-lg text-noir mb-1">Error Loading Collections</h3>
              <p className="text-stone text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="max-w-7xl mx-auto px-5 pt-14 md:pt-20 pb-8">
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone" stroke={1.5} />
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Search collections..."
              className="w-full h-12 pl-11 pr-4 border border-line bg-white text-noir text-sm placeholder:text-stone/60 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 transition-all duration-300"
            />
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sort}
              onChange={handleSort}
              className="h-12 px-5 pr-10 border border-line bg-white text-noir text-sm appearance-none cursor-pointer focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 transition-all duration-300"
            >
              <option value="name-asc">Alphabetical (A–Z)</option>
              <option value="name-desc">Alphabetical (Z–A)</option>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="popular">Most Popular</option>
            </select>
            <IconChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 -rotate-90 h-4 w-4 text-stone pointer-events-none" stroke={1.5} />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-5 pb-16 md:pb-24">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
            {[...Array(8)].map((_, i) => <CategoryCardSkeleton key={i} />)}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-24 bg-ivory border border-line">
            <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center border border-line bg-white">
              <IconMoodEmpty className="w-7 h-7 text-gold-dark" stroke={1.2} />
            </div>
            <h2 className="font-display text-3xl text-noir mb-3">No Collections Found</h2>
            <p className="text-stone mb-10 max-w-sm mx-auto text-sm font-light">
              {search ? `No results for "${search}". Try a different search.` : "Collections will appear here once added."}
            </p>
            <Link href="/products" className="btn-luxe">
              Browse All Products <IconArrowRight className="h-4 w-4" stroke={1.5} />
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
              {categories.map((cat, i) => (
                <CategoryCard key={cat.id} category={cat} index={i} />
              ))}
            </div>

            {/* Pagination */}
            {showPagination && (
              <div className="flex justify-center items-center mt-14 gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="w-11 h-11 flex items-center justify-center border border-line bg-white text-noir hover:border-gold hover:text-gold disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300"
                >
                  <IconChevronLeft className="h-4 w-4" stroke={1.5} />
                </button>

                {[...Array(pagination.pages)].map((_, i) => {
                  const page = i + 1;
                  if (
                    page === 1 ||
                    page === pagination.pages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-11 h-11 flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                          currentPage === page
                            ? "bg-noir text-white border border-noir"
                            : "bg-white text-noir border border-line hover:border-gold hover:text-gold"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  }
                  if (
                    (page === 2 && currentPage > 3) ||
                    (page === pagination.pages - 1 && currentPage < pagination.pages - 2)
                  ) {
                    return (
                      <span key={page} className="text-stone px-1">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.pages}
                  className="w-11 h-11 flex items-center justify-center border border-line bg-white text-noir hover:border-gold hover:text-gold disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300"
                >
                  <IconChevronRight className="h-4 w-4" stroke={1.5} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
