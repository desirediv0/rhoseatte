"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";
import { toast } from "sonner";
import { IconCheck, IconShoppingCart, IconX, IconStar } from "@tabler/icons-react";
import BundleReviewForm from "./BundleReviewForm";

export default function BundleDetailPage({ params }) {
  const slug = params?.slug;
  const { addBundleToCart } = useCart();
  const router = useRouter();
  const [bundle, setBundle] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [addingToCart, setAddingToCart] = useState(false);
  const [productsLoading, setProductsLoading] = useState(true);

  useEffect(() => {
    const fetchBundle = async () => {
      try {
        const res = await fetchApi(`/bundles/${slug}`);
        setBundle(res.data);
      } catch (err) {
        console.error("Failed to fetch bundle:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBundle();
  }, [slug]);

  useEffect(() => {
    if (!bundle) return;
    const fetchProducts = async () => {
      try {
        setProductsLoading(true);
        const res = await fetchApi(`/bundles/${slug}/products?limit=100`);
        const allProducts = res.data?.products || [];
        const inStock = allProducts.filter((p) => {
          const variant = p.variants?.[0];
          const stock = variant?.quantity ?? 0;
          return stock > 0;
        });
        setProducts(inStock);
        // Picks made earlier (e.g. added from a product page) come back
        try {
          const saved = JSON.parse(sessionStorage.getItem(`bundle_sel_${slug}`) || "[]");
          const valid = saved.filter((id) => inStock.some((p) => p.id === id));
          if (valid.length > 0) setSelectedProducts(valid);
        } catch (_) {
          /* no saved selection */
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setProductsLoading(false);
      }
    };
    fetchProducts();
  }, [slug, bundle]);

  // Keep the selection while the customer visits product pages
  useEffect(() => {
    try {
      sessionStorage.setItem(`bundle_sel_${slug}`, JSON.stringify(selectedProducts));
    } catch (_) {
      /* storage unavailable */
    }
  }, [selectedProducts, slug]);

  const toggleProduct = (productId) => {
    setSelectedProducts((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      }

      const maxItems = bundle?.rule?.maxItems;
      if (maxItems && prev.length >= maxItems) {
        toast.error(`Maximum ${maxItems} products allowed for this bundle`);
        return prev;
      }

      return [...prev, productId];
    });
  };

  const getBundlePrice = () => {
    if (!bundle?.pricingSlabs) return 0;
    const slab = bundle.pricingSlabs.find(
      (s) => s.itemCount === selectedProducts.length
    );
    return slab ? slab.price : 0;
  };

  const getActualPrice = () => {
    return products
      .filter((p) => selectedProducts.includes(p.id))
      .reduce((sum, p) => {
        const price = p.variants?.[0]?.salePrice || p.variants?.[0]?.price || 0;
        return sum + parseFloat(price);
      }, 0);
  };

  const handleAddToCart = async (goToCart = false) => {
    if (selectedProducts.length === 0) {
      toast.error("Please select at least one product");
      return;
    }

    const minItems = bundle?.rule?.minItems || 2;
    if (selectedProducts.length < minItems) {
      toast.error(`Minimum ${minItems} products required for this bundle`);
      return;
    }

    try {
      setAddingToCart(true);
      const bPrice = getBundlePrice();
      const aPrice = getActualPrice();
      await addBundleToCart(bundle.id, selectedProducts, {
        title: bundle.title || "Curated Bundle",
        price: bPrice || aPrice || 0,
        actualPrice: aPrice,
        banner: bundle.banner || products.find(p => selectedProducts.includes(p.id))?.images?.[0]?.url || "/rhoseatte_lavender_perfume.png",
        slug: bundle.slug,
        selectedProductDetails: products.filter(p => selectedProducts.includes(p.id)),
      });
      toast.success("Bundle added to cart!");
      setSelectedProducts([]);
      if (goToCart === true) router.push("/cart");
    } catch (err) {
      toast.error(err.message || "Failed to add bundle to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-dark" />
      </div>
    );
  }

  if (!bundle) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-light text-[#111111] mb-4">
          Bundle Not Found
        </h1>
        <a
          href="/bundles"
          className="px-6 py-3 bg-gold-dark text-white text-sm uppercase tracking-wider"
        >
          Browse Bundles
        </a>
      </div>
    );
  }

  const bundlePrice = getBundlePrice();
  const actualPrice = getActualPrice();
  const savings = actualPrice - bundlePrice;

  return (
    <div className="min-h-screen bg-ivory">
      {/* Hero Banner */}
      <div className="relative h-64 md:h-80">
        {bundle.banner ? (
          <Image
            src={bundle.banner}
            alt={bundle.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-noir via-stone/90 to-gold/20 flex items-center justify-center">
            <span className="text-white text-5xl font-light tracking-widest">
              {bundle.bundleType}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-center justify-center text-center text-white px-4">
          <div>
            <span className="inline-block px-3 py-1 bg-white/20 text-white text-xs uppercase tracking-wider mb-4 rounded">
              {bundle.bundleType}
            </span>
            <h1 className="text-3xl md:text-4xl font-light tracking-widest uppercase mb-2">
              {bundle.title}
            </h1>
            {bundle.description && (
              <p className="text-sm text-gray-200 max-w-xl mx-auto">
                {bundle.description}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Products Grid */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-medium text-[#111111] mb-4 uppercase tracking-wider">
              Select Your Products
            </h2>

            {/* Bundle tray: picks so far, price tiers, prices, checkout */}
            <div className="sticky top-2 z-30 mb-6 rounded-3xl bg-black p-3 sm:p-4 shadow-xl">
              <div className="flex gap-2.5 overflow-x-auto pb-3 no-scrollbar">
                {selectedProducts.map((id) => {
                  const p = products.find((x) => x.id === id);
                  if (!p) return null;
                  return (
                    <div key={id} className="relative h-[104px] w-[88px] shrink-0 overflow-hidden rounded-2xl border-2 border-white bg-white">
                      {p.images?.[0]?.url && (
                        <Image src={p.images[0].url} alt={p.name} fill sizes="88px" className="object-cover" />
                      )}
                      <button
                        type="button"
                        aria-label={`Remove ${p.name}`}
                        onClick={() => toggleProduct(id)}
                        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow"
                      >
                        <IconX size={14} />
                      </button>
                    </div>
                  );
                })}
                {(bundle.pricingSlabs || [])
                  .filter((s) => s.itemCount > selectedProducts.length)
                  .map((s) => (
                    <div
                      key={s.itemCount}
                      className="relative flex h-[104px] w-[132px] shrink-0 flex-col items-center justify-center rounded-2xl bg-white px-2 text-center"
                    >
                      <span className="text-sm font-medium text-black">
                        {s.itemCount} for ₹{parseFloat(s.price).toLocaleString()}
                      </span>
                      <span className="absolute bottom-2 right-3 text-xl font-medium text-black">{s.itemCount}</span>
                    </div>
                  ))}
                {selectedProducts.length === 0 && (!bundle.pricingSlabs || bundle.pricingSlabs.length === 0) && (
                  <p className="py-6 text-sm text-gray-300">Pick products below to build your bundle.</p>
                )}
              </div>

              <div className="rounded-2xl bg-white/25 px-4 py-2.5 text-white">
                <div className="flex items-center justify-between text-base sm:text-lg">
                  <span>Actual Price</span>
                  <span>₹ {actualPrice > 0 ? Math.round(actualPrice).toLocaleString() : "–"}</span>
                </div>
                <div className="flex items-center justify-between text-base sm:text-lg">
                  <span>Bundle Price</span>
                  <span>₹ {bundlePrice > 0 ? parseFloat(bundlePrice).toLocaleString() : "–"}</span>
                </div>
              </div>
              {selectedProducts.length > 0 && bundlePrice === 0 && (
                <p className="mt-2 text-center text-xs text-orange-300">
                  Select {bundle.rule?.minItems || 2} or more items to see the bundle price
                </p>
              )}

              <div className="mt-3 flex items-center gap-3">
                <button
                  type="button"
                  aria-label="Browse products"
                  onClick={() => document.getElementById("bundle-products")?.scrollIntoView({ behavior: "smooth" })}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round">
                    <circle cx="11" cy="11" r="7" />
                    <path d="M21 21l-4.3-4.3" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddToCart(true)}
                  disabled={addingToCart || selectedProducts.length === 0 || bundlePrice === 0}
                  className="h-12 flex-1 rounded-full bg-white text-base font-semibold uppercase tracking-wide text-black disabled:opacity-50"
                >
                  {addingToCart ? "Adding..." : "Checkout"}
                </button>
              </div>
            </div>
            <div id="bundle-products" className="scroll-mt-4" />

            {productsLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg p-4 animate-pulse"
                  >
                    <div className="aspect-square bg-gray-100 rounded mb-3" />
                    <div className="h-3 bg-gray-100 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-gray-500">
                  No products available for this bundle.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                {products.map((product) => {
                  const isSelected = selectedProducts.includes(product.id);
                  const variant = product.variants?.[0];
                  const mrp = parseFloat(variant?.price || 0);
                  const sale = variant?.salePrice ? parseFloat(variant.salePrice) : null;
                  const price = sale && sale < mrp ? sale : mrp;
                  const savePct = sale && sale < mrp ? Math.round(((mrp - sale) / mrp) * 100) : 0;
                  const tag = product.categories?.[0]?.name || product.brand?.name;
                  const chips = (variant?.attributes || []).map((a) => a.value).filter(Boolean).slice(0, 3);

                  return (
                    <div
                      key={product.id}
                      className={`relative flex flex-col overflow-hidden rounded-2xl bg-white transition-all ${isSelected ? "border-2 border-black" : "border border-gray-300"}`}
                    >
                      <Link href={`/products/${product.slug}?bundle=${slug}`} className="relative block aspect-[4/5] overflow-hidden bg-ivory-deep">
                        {product.images?.[0]?.url ? (
                          <Image
                            src={product.images[0].url}
                            alt={product.name}
                            fill
                            sizes="(max-width: 768px) 50vw, 25vw"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <span className="text-xs text-gray-400">No Image</span>
                          </div>
                        )}
                        {tag && (
                          <span className="absolute right-2 top-2 rounded-full bg-black px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-white">
                            {tag}
                          </span>
                        )}
                      </Link>

                      <div className="flex flex-1 flex-col p-3">
                        <Link href={`/products/${product.slug}?bundle=${slug}`}>
                          <h3 className="line-clamp-2 text-sm font-bold uppercase leading-snug text-black">
                            {product.name}
                          </h3>
                        </Link>

                        {!(product.reviewCount > 0) && (
                          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-500">
                            <IconStar size={15} stroke={0} fill="#D1D5DB" />
                            <span>No reviews yet</span>
                          </div>
                        )}
                        {product.reviewCount > 0 && (
                          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-black">
                            <IconStar size={15} stroke={0} fill="#F5B301" />
                            <span className="font-medium">{product.avgRating}</span>
                            <span className="h-3.5 w-px bg-gray-400" />
                            <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true">
                              <circle cx="12" cy="12" r="11" fill="#1D6FEB" />
                              <path d="M7 12.5l3.2 3.2L17 9" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span>({product.reviewCount} {product.reviewCount === 1 ? "Review" : "Reviews"})</span>
                          </div>
                        )}

                        {chips.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {chips.map((c, i) => (
                              <span key={i} className="rounded-full border border-gray-400 px-2.5 py-0.5 text-[11px] text-gray-700">
                                {c}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="text-lg font-extrabold text-black">₹{price.toLocaleString()}</span>
                          {savePct > 0 && (
                            <>
                              <span className="text-xs text-gray-400 line-through">₹{mrp.toLocaleString()}</span>
                              <span className="rounded-md bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700">
                                SAVE {savePct}%
                              </span>
                            </>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleProduct(product.id)}
                          className={`mt-3 h-11 w-full rounded-full border-2 border-black text-sm font-semibold uppercase tracking-wide transition-colors ${isSelected ? "bg-black text-white" : "bg-white text-black"}`}
                        >
                          {isSelected ? "Added ✓" : "Add"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bundle Summary Sidebar */}
          <div className="hidden lg:col-span-1 lg:block">
            <div
              className="bg-white p-6 sticky top-24"
              style={{ border: "1px solid #EAEAEA", borderRadius: "8px" }}
            >
              <h3 className="text-lg font-medium text-[#111111] mb-4 uppercase tracking-wider">
                Bundle Summary
              </h3>

              {/* Selected Count */}
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
                <span className="text-sm text-gray-500">Selected Items</span>
                <span className="text-sm font-medium">
                  {selectedProducts.length}
                  {bundle.rule?.maxItems
                    ? ` / ${bundle.rule.maxItems}`
                    : ""}
                </span>
              </div>

              {/* Pricing Slabs */}
              {bundle.pricingSlabs && bundle.pricingSlabs.length > 0 && (
                <div className="mb-4 pb-4 border-b border-gray-100">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                    Pricing Tiers
                  </p>
                  <div className="space-y-1">
                    {bundle.pricingSlabs.map((slab, idx) => (
                      <div
                        key={idx}
                        className={`flex justify-between text-xs p-2 rounded ${selectedProducts.length === slab.itemCount
                          ? "bg-green-50 text-green-700 font-medium"
                          : "text-gray-600"
                          }`}
                      >
                        <span>
                          {slab.label || `${slab.itemCount} Products`}
                        </span>
                        <span>₹{slab.price.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Breakdown */}
              {selectedProducts.length > 0 && (
                <div className="mb-4 pb-4 border-b border-gray-100">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">Actual Price</span>
                    <span className="line-through text-gray-400">
                      ₹{actualPrice.toLocaleString()}
                    </span>
                  </div>
                  {bundlePrice > 0 && (
                    <>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-500">Bundle Price</span>
                        <span className="font-medium text-[#111111]">
                          ₹{bundlePrice.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600 font-medium">
                          You Save
                        </span>
                        <span className="text-green-600 font-medium">
                          ₹{savings.toLocaleString()}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Add to Cart Button */}
              <button
                onClick={() => handleAddToCart(false)}
                disabled={
                  addingToCart ||
                  selectedProducts.length === 0 ||
                  bundlePrice === 0
                }
                className="w-full py-3 bg-noir text-white text-sm uppercase tracking-wider font-medium hover:bg-gold-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {addingToCart ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <>
                    <IconShoppingCart size={16} />
                    Add Bundle to Cart
                  </>
                )}
              </button>

              {selectedProducts.length > 0 && bundlePrice === 0 && (
                <p className="text-xs text-center text-orange-500 mt-2">
                  Select {bundle.rule?.minItems || 2} or more items to see
                  bundle price
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Behind the scenes videos */}
        {bundle.videos?.length > 0 && (
          <div className="mt-14 max-w-4xl">
            <h2 className="text-lg font-medium mb-5">Behind the Scenes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bundle.videos.map((video) => (
                <div key={video.id} className="rounded-lg overflow-hidden border border-gray-200">
                  <div className="aspect-video w-full bg-black">
                    <video
                      src={video.videoUrl}
                      controls
                      preload="metadata"
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Customer reviews */}
        <div id="reviews" className="mt-14 max-w-3xl scroll-mt-24">
          <div className="mb-8">
            <BundleReviewForm bundle={bundle} />
          </div>
        </div>
        {bundle.reviews?.length > 0 && (
          <div className="mt-2 max-w-3xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium">Customer Reviews</h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <IconStar key={i} size={16} stroke={0} fill={i < Math.round(bundle.avgRating || 0) ? "#B8976A" : "#EAEAEA"} />
                  ))}
                </div>
                <span>{bundle.avgRating} · {bundle.reviewCount} {bundle.reviewCount === 1 ? "review" : "reviews"}</span>
              </div>
            </div>
            <div className="space-y-6">
              {bundle.reviews.map((r) => (
                <div key={r.id} className="pb-6 border-b border-gray-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium">{r.user?.name || "Customer"}</p>
                      <div className="flex mt-1">
                        {[...Array(5)].map((_, i) => (
                          <IconStar key={i} size={14} stroke={0} fill={i < r.rating ? "#B8976A" : "#EAEAEA"} />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                  {r.title && <h3 className="text-sm font-medium mt-3">{r.title}</h3>}
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">{r.comment}</p>
                  {r.images?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {r.images.map((src, i) => (
                        <a key={i} href={src} target="_blank" rel="noopener noreferrer">
                          <img src={src} alt="Customer photo" loading="lazy" className="h-16 w-16 object-cover rounded border border-gray-200" />
                        </a>
                      ))}
                    </div>
                  )}
                  {r.adminReply && (
                    <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded text-sm">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-gold-dark">Response from RHOSEATTE</p>
                      <p className="mt-1 text-gray-600">{r.adminReply}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
