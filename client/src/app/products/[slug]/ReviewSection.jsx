"use client";

import { useState, useEffect, useMemo } from "react";
import { IconStar, IconAlertCircle } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

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

  return (
    <div>
      {product.reviews && product.reviews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-lg" style={{ color: "#111111" }}>Customer Reviews</h3>
              <div className="flex items-center">
                <div className="flex mr-2">
                  {[...Array(5)].map((_, i) => <IconStar key={i} className="h-4 w-4" style={{ color: i < Math.round(product.avgRating || 0) ? "#B8976A" : "#EAEAEA" }} fill={i < Math.round(product.avgRating || 0) ? "#B8976A" : "none"} stroke={0} />)}
                </div>
                <span className="text-[12px]" style={{ color: "#666666" }}>Based on {product.reviewCount} reviews</span>
              </div>
            </div>

            <div className="space-y-8 max-h-[600px] overflow-y-auto pr-4">
              {product.reviews.map((review) => (
                <div key={review.id} className="pb-8" style={{ borderBottom: "1px solid #EAEAEA" }}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-[14px]" style={{ color: "#111111" }}>{review.user?.name || review.reviewerName || "Customer"}</p>
                      <div className="flex mt-1">
                        {[...Array(5)].map((_, i) => <IconStar key={i} className="h-3.5 w-3.5" style={{ color: i < review.rating ? "#B8976A" : "#EAEAEA" }} fill={i < review.rating ? "#B8976A" : "none"} stroke={0} />)}
                      </div>
                    </div>
                    <span className="text-[12px]" style={{ color: "#666666" }}>{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>

                  <h4 className="font-medium text-[14px] mt-3" style={{ color: "#111111" }}>{review.title}</h4>
                  <p className="mt-2 text-[13px] leading-relaxed font-light" style={{ color: "#666666" }}>{review.comment}</p>
                  {review.images?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {review.images.map((src, i) => (
                        <a key={i} href={src} target="_blank" rel="noopener noreferrer">
                          <img src={src} alt="Customer photo" loading="lazy" className="h-16 w-16 object-cover" style={{ borderRadius: "6px", border: "1px solid #EAEAEA" }} />
                        </a>
                      ))}
                    </div>
                  )}

                  {review.adminReply && (
                    <div className="mt-4 p-4" style={{ backgroundColor: "#FAFAFA", border: "1px solid #EAEAEA", borderRadius: "8px" }}>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ color: "#B8976A" }}>Response from RHOSEATTE:</p>
                      <p className="mt-2 text-[13px] leading-relaxed font-light" style={{ color: "#666666" }}>{review.adminReply}</p>
                      {review.adminReplyDate && <p className="mt-2 text-[11px]" style={{ color: "#999999" }}>Replied on {new Date(review.adminReplyDate).toLocaleDateString()}</p>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="p-6" style={{ backgroundColor: "#FAFAFA", border: "1px solid #EAEAEA", borderRadius: "8px" }}>
            <h3 className="font-display text-lg mb-5" style={{ color: "#111111" }}>Write a Review</h3>

            {!showForm ? (
              <button onClick={() => { if (!isAuthenticated) { router.push(`/auth?redirect=/products/${product.slug}&review=true`); return; } setShowForm(true); }}
                className="px-8 py-3 text-[11px] uppercase tracking-[0.18em] font-medium transition-colors duration-300"
                style={{ backgroundColor: "#111111", color: "#fff", borderRadius: "8px" }}>
                Write a Review
              </button>
            ) : <ReviewFormComponent />}

            {!canReview() && (
              <div className="mt-4 p-3 flex items-center text-[12px]" style={{ backgroundColor: "#FAFAFA", border: "1px solid rgba(184,151,106,0.3)", color: "#B8976A", borderRadius: "8px" }}>
                <IconAlertCircle className="h-4 w-4 mr-2 flex-shrink-0" stroke={1.5} />
                You need to purchase this product to write a review
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-12" style={{ backgroundColor: "#FAFAFA", border: "1px solid #EAEAEA", borderRadius: "8px" }}>
          <p className="text-[14px] mb-6 font-light" style={{ color: "#666666" }}>No reviews yet. Be the first to review this product!</p>
          <button onClick={() => { if (!isAuthenticated) { router.push(`/auth?redirect=/products/${product.slug}&review=true`); return; } setShowForm(true); }}
            className="px-8 py-3 text-[11px] uppercase tracking-[0.18em] font-medium transition-colors duration-300"
            style={{ backgroundColor: "#111111", color: "#fff", borderRadius: "8px" }}>
            Write a Review
          </button>

          {showForm && (
            <div className="max-w-lg mx-auto mt-8 p-6 bg-white" style={{ border: "1px solid #EAEAEA", borderRadius: "8px" }}>
              <ReviewFormComponent />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
