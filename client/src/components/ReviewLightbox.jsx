"use client";

import { useEffect, useCallback, useRef, useState } from "react";

// Full-screen photo viewer for review photos.
//  - `images`:  list of photo URLs
//  - `details`: optional list (same length) of { name, rating, date, title, comment, adminReply }
//               shown next to the photo (below it on phones) so the review text is readable with the picture
//  - `startIndex`: the photo that was clicked
// Render it only while open (`{open && <ReviewLightbox .../>}`).
function Stars({ value }) {
  return (
    <div style={{ display: "flex", gap: 2 }} aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"
            fill={i <= Math.round(value) ? "#F5B301" : "#E5E7EB"}
          />
        </svg>
      ))}
    </div>
  );
}

export default function ReviewLightbox({ images, details, startIndex = 0, onClose }) {
  const count = images.length;
  const [index, setIndex] = useState(Math.min(Math.max(startIndex, 0), Math.max(count - 1, 0)));
  const touchX = useRef(null);

  const prev = useCallback(() => setIndex((i) => (i - 1 + count) % count), [count]);
  const next = useCallback(() => setIndex((i) => (i + 1) % count), [count]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden"; // no page scroll behind the viewer
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose, prev, next]);

  if (count === 0) return null;
  const detail = details?.[index] || null;

  const onTouchStart = (e) => {
    touchX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e) => {
    if (touchX.current === null || count < 2) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) > 50) (dx > 0 ? prev : next)();
  };

  const arrowStyle = {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    width: 46,
    height: 46,
    borderRadius: "9999px",
    backgroundColor: "rgba(255,255,255,0.18)",
    color: "#fff",
    fontSize: 26,
    lineHeight: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid rgba(255,255,255,0.3)",
    cursor: "pointer",
    zIndex: 2,
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Review photos"
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 1000, backgroundColor: "rgba(0,0,0,0.92)", display: "flex", flexDirection: "column" }}
    >
      {/* counter + close */}
      <span style={{ position: "absolute", top: 16, left: 20, zIndex: 3, color: "#fff", fontSize: 13, letterSpacing: "0.12em" }}>
        {index + 1} / {count}
      </span>
      <button
        type="button"
        aria-label="Close"
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        style={{ position: "absolute", top: 10, right: 14, zIndex: 3, width: 40, height: 40, borderRadius: "9999px", color: "#fff", fontSize: 28, lineHeight: 1, backgroundColor: "rgba(255,255,255,0.18)" }}
      >
        ×
      </button>

      <style>{`
        .rl-body { display: flex; flex: 1; min-height: 0; flex-direction: column; padding-top: 52px; }
        .rl-photo { position: relative; flex: 1 1 auto; min-width: 0; min-height: 0; display: flex; flex-direction: column; }
        .rl-aside { flex: 0 0 auto; max-height: 42%; overflow-y: auto; background: #fff; color: #111; padding: 18px 18px 24px; }
        @media (min-width: 768px) {
          .rl-body { flex-direction: row; }
          .rl-photo { flex: 1 1 0; }
          .rl-aside { flex: 0 0 380px; max-height: 100%; padding: 24px 24px 32px; }
        }
      `}</style>
      <div className="rl-body">
        {/* photo + thumbnails */}
        <div className="rl-photo" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <div style={{ position: "relative", flex: 1, minHeight: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 56px" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[index]}
              alt={`Customer photo ${index + 1}`}
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: 8 }}
            />
            {count > 1 && (
              <>
                <button type="button" aria-label="Previous photo" onClick={(e) => { e.stopPropagation(); prev(); }} style={{ ...arrowStyle, left: 8 }}>‹</button>
                <button type="button" aria-label="Next photo" onClick={(e) => { e.stopPropagation(); next(); }} style={{ ...arrowStyle, right: 8 }}>›</button>
              </>
            )}
          </div>

          {count > 1 && (
            <div
              onClick={(e) => e.stopPropagation()}
              style={{ display: "flex", gap: 8, justifyContent: count > 8 ? "flex-start" : "center", padding: "10px 12px 14px", overflowX: "auto" }}
            >
              {images.map((src, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Photo ${i + 1}`}
                  onClick={() => setIndex(i)}
                  style={{
                    flex: "0 0 auto",
                    width: 52,
                    height: 52,
                    borderRadius: 6,
                    overflow: "hidden",
                    border: i === index ? "2px solid #B8976A" : "2px solid transparent",
                    opacity: i === index ? 1 : 0.55,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* review text */}
        {detail && (
          <aside className="rl-aside" onClick={(e) => e.stopPropagation()} aria-label="Review">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: "9999px", backgroundColor: "#F3EBDD", color: "#8a6d3b", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, textTransform: "uppercase" }}>
                {(detail.name || "C").trim().charAt(0) || "C"}
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>{detail.name || "Customer"}</p>
                {detail.date && <p style={{ fontSize: 12, color: "#888", margin: "2px 0 0" }}>{detail.date}</p>}
              </div>
            </div>
            <div style={{ marginTop: 14 }}>
              <Stars value={detail.rating || 0} />
            </div>
            {detail.title && detail.title !== "Review" && (
              <h4 style={{ fontSize: 15, fontWeight: 600, margin: "14px 0 0" }}>{detail.title}</h4>
            )}
            {detail.comment && (
              <p style={{ fontSize: 14, lineHeight: 1.65, color: "#444", margin: "10px 0 0", whiteSpace: "pre-line" }}>{detail.comment}</p>
            )}
            {detail.adminReply && (
              <div style={{ marginTop: 18, padding: "12px 14px", backgroundColor: "#FAF7F2", borderLeft: "3px solid #B8976A", borderRadius: 6 }}>
                <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "#8a6d3b", margin: 0 }}>Response from RHOSEATTE</p>
                <p style={{ fontSize: 13, lineHeight: 1.6, color: "#555", margin: "6px 0 0" }}>{detail.adminReply}</p>
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}
