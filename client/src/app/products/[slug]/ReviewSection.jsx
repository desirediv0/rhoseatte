"use client";

import { useState, useEffect, useMemo } from "react";
import { IconStar, IconAlertCircle } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import ReviewLightbox from "@/components/ReviewLightbox";

export default function ReviewSection({ product }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    title: "",
    comment: "",
  });
  const [showForm, setShowForm] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [lightbox, setLightbox] = useState(null); // { images, index }
  const [visibleCount, setVisibleCount] = useState(4);
  const [photos, setPhotos] = useState([]); // File[] (max 5)
  const previews = useMemo(() => photos.map((f) => URL.createObjectURL(f)), [photos]);
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);

  const handlePhotos = (e) => {
    const chosen = Array.from(e.target.files || []);
    e.target.value = "";
    const ok = chosen.filter((f) => {
      if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) {
        toast.error(`${f.name}: only JPG, PNG or WEBP photos`);
        return false;
      }
      if (f.size > 5 * 1024 * 1024) {
        toast.error(`${f.name}: photo must be under 5 MB`);
        return false;
      }
      return true;
    });
    const merged = [...photos, ...ok];
    if (merged.length > 5) toast.error("You can add up to 5 photos");
    setPhotos(merged.slice(0, 5));
  };

  // Arriving from the "review your order" email (?review=true): open the form
  useEffect(() => {
    if (!isAuthenticated) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("review") === "true") setShowForm(true);
  }, [isAuthenticated]);

  const handleRatingClick = (rating) => {
    setReviewForm((prev) => ({ ...prev, rating }));
    if (formErrors.rating) {
      setFormErrors((prev) => ({ ...prev, rating: null }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReviewForm((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (reviewForm.rating === 0) {
      errors.rating = "Please select a rating";
    }

    if (!reviewForm.comment.trim()) {
      errors.comment = "Please provide a review comment";
    }

    if (reviewForm.title.trim() && reviewForm.title.trim().length < 3) {
      errors.title = "Title should be at least 3 characters";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      router.push(`/auth?redirect=/products/${product.slug}&review=true`);
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetchApi(`/users/reviews`, {
        method: "POST",
        credentials: "include",
        body: (() => {
          const fd = new FormData();
          fd.append("productId", product.id);
          fd.append("rating", String(reviewForm.rating));
          fd.append("title", reviewForm.title.trim() || "Review");
          fd.append("comment", reviewForm.comment.trim());
          photos.forEach((f) => fd.append("images", f));
          return fd;
        })(),
      });

      if (response.success) {
        toast.success("Review submitted successfully!");
        setReviewForm({ rating: 0, title: "", comment: "" });
        setPhotos([]);
        setShowForm(false);
        window.location.reload();
      } else {
        toast.error(response.message || "Failed to submit review");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canReview = () => {
    return isAuthenticated;
  };

  const ReviewFormComponent = () => (
    <form onSubmit={handleReviewSubmit} className="space-y-5">
      <div>
        <label className="block text-[11px] font-medium uppercase tracking-[0.2em] mb-3" style={{ color: "#111111" }}>Rating <span style={{ color: "#C24B42" }}>*</span></label>
        <div className="flex justify-center gap-1">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button type="button" key={rating} onClick={() => handleRatingClick(rating)}>
              <IconStar
                className="h-8 w-8 cursor-pointer transition-colors"
                style={{ color: reviewForm.rating >= rating ? "#B8976A" : formErrors.rating ? "#fca5a5" : "#d1d5db" }}
                fill={reviewForm.rating >= rating ? "#B8976A" : "none"}
                stroke={1.5}
              />
            </button>
          ))}
        </div>
        {formErrors.rating && <p className="text-[12px] mt-2 text-center" style={{ color: "#C24B42" }}>{formErrors.rating}</p>}
      </div>

      <div>
        <label htmlFor="title" className="block text-[11px] font-medium uppercase tracking-[0.2em] mb-2" style={{ color: "#111111" }}>Review Title</label>
        <input type="text" id="title" name="title" value={reviewForm.title} onChange={handleInputChange}
          className="w-full px-4 py-3 text-[13px] focus:outline-none transition-colors"
          style={{
            border: formErrors.title ? "1px solid #C24B42" : "1px solid #EAEAEA",
            borderRadius: "8px",
            color: "#111111",
          }}
          placeholder="Give your review a title (optional)" />
        {formErrors.title && <p className="text-[12px] mt-1" style={{ color: "#C24B42" }}>{formErrors.title}</p>}
      </div>

      <div>
        <label htmlFor="comment" className="block text-[11px] font-medium uppercase tracking-[0.2em] mb-2" style={{ color: "#111111" }}>Review <span style={{ color: "#C24B42" }}>*</span></label>
        <textarea id="comment" name="comment" value={reviewForm.comment} onChange={handleInputChange} rows={4}
          className="w-full px-4 py-3 text-[13px] focus:outline-none transition-colors resize-none"
          style={{
            border: formErrors.comment ? "1px solid #C24B42" : "1px solid #EAEAEA",
            borderRadius: "8px",
            color: "#111111",
          }}
          placeholder="Write your review here"></textarea>
        {formErrors.comment && <p className="text-[12px] mt-1" style={{ color: "#C24B42" }}>{formErrors.comment}</p>}
      </div>

      <div>
        <label className="block text-[11px] font-medium uppercase tracking-[0.2em] mb-2" style={{ color: "#111111" }}>Photos (optional, up to 5)</label>
        <div className="flex flex-wrap gap-2">
          {previews.map((src, i) => (
            <div key={src} className="relative h-16 w-16">
              <img src={src} alt="" className="h-16 w-16 object-cover" style={{ borderRadius: "6px", border: "1px solid #EAEAEA" }} />
              <button type="button" aria-label="Remove photo" onClick={() => setPhotos((p) => p.filter((_, idx) => idx !== i))}
                className="absolute -top-2 -right-2 h-5 w-5 rounded-full text-[11px] leading-none flex items-center justify-center"
                style={{ backgroundColor: "#111111", color: "#fff" }}>×</button>
            </div>
          ))}
          {photos.length < 5 && (
            <label className="h-16 w-16 flex items-center justify-center cursor-pointer text-[22px]" style={{ border: "1px dashed #B8976A", color: "#B8976A", borderRadius: "6px" }}>
              +
              <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={handlePhotos} />
            </label>
          )}
        </div>
      </div>

      <div className="flex gap-3 justify-center pt-2">
        <button type="submit" disabled={isSubmitting}
          className="px-8 py-3 text-[11px] uppercase tracking-[0.18em] font-medium transition-colors duration-300 disabled:opacity-40"
          style={{ backgroundColor: "#111111", color: "#fff", borderRadius: "8px" }}>
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Submitting...
            </div>
          ) : "Submit Review"}
        </button>
        <button type="button" onClick={() => { setShowForm(false); setFormErrors({}); setPhotos([]); setReviewForm({ rating: 0, title: "", comment: "" }); }}
          className="px-6 py-3 text-[11px] uppercase tracking-[0.18em] font-medium transition-colors duration-300"
          style={{ border: "1px solid #EAEAEA", color: "#666666", borderRadius: "8px" }}>
          Cancel
        </button>
      </div>
    </form>
  );

  const reviews = product.reviews || [];
  const avg = parseFloat(product.avgRating) || 0;
  const total = product.reviewCount || reviews.length;
  const allPhotos = reviews.flatMap((r) => r.images || []);
  const startWriting = () => {
    if (!isAuthenticated) {
      router.push(`/auth?redirect=/products/${product.slug}&review=true`);
      return;
    }
    setShowForm(true);
  };
  const stars = (value, size = "h-4 w-4") =>
    [1, 2, 3, 4, 5].map((i) => (
      <IconStar key={i} className={size} style={{ color: i <= Math.round(value) ? "#F5B301" : "#E5E7EB" }} fill={i <= Math.round(value) ? "#F5B301" : "#E5E7EB"} stroke={0} />
    ));

  return (
    <div>
      {/* Summary */}
      <div className="flex flex-col gap-6 pb-8 sm:flex-row sm:items-center sm:justify-between" style={{ borderBottom: "1px solid #EAEAEA" }}>
        <h3 className="font-display text-2xl" style={{ color: "#111111" }}>Customer Reviews</h3>
        <div className="flex flex-wrap items-center gap-6">
          {reviews.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="font-display text-4xl leading-none" style={{ color: "#111111" }}>{avg.toFixed(1)}</span>
              <div>
                <div className="flex gap-0.5">{stars(avg, "h-5 w-5")}</div>
                <p className="mt-1 text-[12px]" style={{ color: "#666666" }}>Based on {total} {total === 1 ? "review" : "reviews"}</p>
              </div>
            </div>
          )}
          {!showForm && (
            <button onClick={startWriting}
              className="px-7 py-3 text-[11px] uppercase tracking-[0.18em] font-medium transition-opacity hover:opacity-85"
              style={{ backgroundColor: "#111111", color: "#fff", borderRadius: "8px" }}>
              Write a Review
            </button>
          )}
        </div>
      </div>

      {/* Write a review */}
      {showForm && (
        <div className="mt-8 p-6" style={{ backgroundColor: "#FAFAFA", border: "1px solid #EAEAEA", borderRadius: "12px" }}>
          <h4 className="font-display text-lg mb-5" style={{ color: "#111111" }}>Write a Review</h4>
          <ReviewFormComponent />
        </div>
      )}
      {!isAuthenticated && !showForm && (
        <p className="mt-4 flex items-center text-[12px]" style={{ color: "#8a7a5c" }}>
          <IconAlertCircle className="h-4 w-4 mr-2 flex-shrink-0" stroke={1.5} />
          Sign in to write a review. Only customers who bought this product can review it.
        </p>
      )}

      {reviews.length === 0 ? (
        <div className="mt-8 text-center py-14" style={{ backgroundColor: "#FAFAFA", border: "1px solid #EAEAEA", borderRadius: "12px" }}>
          <div className="flex justify-center gap-1 mb-3">{stars(0, "h-6 w-6")}</div>
          <p className="text-[14px] font-light" style={{ color: "#666666" }}>No reviews yet. Be the first to review this product!</p>
        </div>
      ) : (
        <>
          {/* Photos from customers */}
          {allPhotos.length > 0 && (
            <div className="mt-8">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: "#111111" }}>Photos from customers</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {allPhotos.slice(0, 10).map((src, i) => (
                  <button key={i} type="button" onClick={() => setLightbox({ images: allPhotos, index: i })}
                    className="relative h-20 w-20 flex-shrink-0 overflow-hidden transition-transform hover:scale-[1.04]"
                    style={{ borderRadius: "8px", border: "1px solid #EAEAEA" }} aria-label={`Open customer photo ${i + 1}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="Customer photo" loading="lazy" className="h-full w-full object-cover" />
                    {i === 9 && allPhotos.length > 10 && (
                      <span className="absolute inset-0 flex items-center justify-center text-sm font-medium text-white" style={{ backgroundColor: "rgba(0,0,0,0.55)" }}>+{allPhotos.length - 10}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Review cards */}
          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
            {reviews.slice(0, visibleCount).map((review) => {
              const name = review.user?.name || review.reviewerName || "Customer";
              const hasTitle = review.title && review.title !== "Review";
              return (
                <article key={review.id} className="p-5" style={{ border: "1px solid #EAEAEA", borderRadius: "12px", backgroundColor: "#fff" }}>
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold uppercase" style={{ backgroundColor: "#F3EBDD", color: "#8a6d3b" }}>
                      {name.trim().charAt(0) || "C"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-[14px] font-medium" style={{ color: "#111111" }}>{name}</p>
                        <span className="flex-shrink-0 text-[11px]" style={{ color: "#888888" }}>{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="mt-1 flex gap-0.5">{stars(review.rating, "h-3.5 w-3.5")}</div>
                    </div>
                  </div>

                  {hasTitle && (
                    <h4 className="mt-4 text-[14px] font-semibold" style={{ color: "#111111" }}>{review.title}</h4>
                  )}
                  <p className={`${hasTitle ? "mt-1.5" : "mt-4"} whitespace-pre-line text-[13px] leading-relaxed`} style={{ color: "#555555" }}>{review.comment}</p>

                  {review.images?.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {review.images.map((src, i) => (
                        <button key={i} type="button" onClick={() => setLightbox({ images: review.images, index: i })}
                          className="h-[72px] w-[72px] overflow-hidden transition-transform hover:scale-[1.04]"
                          style={{ borderRadius: "8px", border: "1px solid #EAEAEA" }} aria-label={`Open photo ${i + 1} of ${review.images.length}`}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={src} alt="Customer photo" loading="lazy" className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}

                  {review.adminReply && (
                    <div className="mt-4 p-3.5" style={{ backgroundColor: "#FAF7F2", borderLeft: "3px solid #B8976A", borderRadius: "6px" }}>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.15em]" style={{ color: "#8a6d3b" }}>Response from RHOSEATTE</p>
                      <p className="mt-1.5 text-[13px] leading-relaxed" style={{ color: "#555555" }}>{review.adminReply}</p>
                    </div>
                  )}
                </article>
              );
            })}
          </div>

          {visibleCount < reviews.length && (
            <div className="mt-6 text-center">
              <button type="button" onClick={() => setVisibleCount((n) => n + 6)}
                className="px-8 py-3 text-[11px] uppercase tracking-[0.18em] font-medium"
                style={{ border: "1px solid #111111", color: "#111111", borderRadius: "8px" }}>
                Show more reviews ({reviews.length - visibleCount})
              </button>
            </div>
          )}
        </>
      )}

      {lightbox && (
        <ReviewLightbox images={lightbox.images} startIndex={lightbox.index} onClose={() => setLightbox(null)} />
      )}
    </div>
  );
}
