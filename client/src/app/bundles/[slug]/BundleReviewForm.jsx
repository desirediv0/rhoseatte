"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { IconStar } from "@tabler/icons-react";
import { fetchApi } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

// Write-a-review form for a bundle (same rules as a product: only customers
// who bought it can review, reviews are approved before they show).
export default function BundleReviewForm({ bundle }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [photos, setPhotos] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const previews = useMemo(() => photos.map((f) => URL.createObjectURL(f)), [photos]);
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);

  // Arriving from the "review your order" email (?review=true)
  useEffect(() => {
    if (!isAuthenticated) return;
    if (new URLSearchParams(window.location.search).get("review") === "true") setOpen(true);
  }, [isAuthenticated]);

  const pickPhotos = (e) => {
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

  const start = () => {
    if (!isAuthenticated) {
      router.push(`/auth?redirect=/bundles/${bundle.slug}&review=true`);
      return;
    }
    setOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (rating === 0) return toast.error("Please select a rating");
    if (!comment.trim()) return toast.error("Please write your review");
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("bundleCampaignId", bundle.id);
      fd.append("rating", String(rating));
      fd.append("title", title.trim() || "Review");
      fd.append("comment", comment.trim());
      photos.forEach((f) => fd.append("images", f));
      const res = await fetchApi("/users/reviews", { method: "POST", credentials: "include", body: fd });
      if (res.success) {
        toast.success("Thank you! Your review will appear after approval.");
        setOpen(false);
        setRating(0);
        setTitle("");
        setComment("");
        setPhotos([]);
      } else {
        toast.error(res.message || "Failed to submit review");
      }
    } catch (err) {
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={start}
        className="px-8 py-3 bg-noir text-white text-xs uppercase tracking-wider font-medium"
      >
        Write a Review
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4 max-w-lg">
      <div>
        <p className="text-xs uppercase tracking-wider mb-2">Rating</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button type="button" key={n} onClick={() => setRating(n)} aria-label={`${n} stars`}>
              <IconStar size={26} stroke={0} fill={n <= rating ? "#B8976A" : "#EAEAEA"} />
            </button>
          ))}
        </div>
      </div>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title (optional)"
        className="w-full border border-gray-300 px-3 py-2 text-sm"
      />
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={4}
        placeholder="Write your review here"
        className="w-full border border-gray-300 px-3 py-2 text-sm"
      />
      <div>
        <p className="text-xs uppercase tracking-wider mb-2">Photos (optional, up to 5)</p>
        <div className="flex flex-wrap gap-2">
          {previews.map((src, i) => (
            <div key={src} className="relative h-16 w-16">
              <img src={src} alt="" className="h-16 w-16 object-cover rounded border border-gray-200" />
              <button
                type="button"
                aria-label="Remove photo"
                onClick={() => setPhotos((p) => p.filter((_, idx) => idx !== i))}
                className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-black text-white text-[11px] leading-none"
              >
                ×
              </button>
            </div>
          ))}
          {photos.length < 5 && (
            <label className="h-16 w-16 flex items-center justify-center cursor-pointer text-xl border border-dashed border-gold-dark rounded">
              +
              <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={pickPhotos} />
            </label>
          )}
        </div>
      </div>
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="px-8 py-3 bg-noir text-white text-xs uppercase tracking-wider font-medium disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Submit Review"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="px-6 py-3 border border-gray-300 text-xs uppercase tracking-wider">
          Cancel
        </button>
      </div>
    </form>
  );
}
