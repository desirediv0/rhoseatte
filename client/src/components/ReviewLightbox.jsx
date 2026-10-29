"use client";

import { useEffect, useCallback, useRef, useState } from "react";

// Full-screen photo viewer for review photos: arrows / keyboard / swipe,
// thumbnails, counter. `images` is a list of URLs; `startIndex` is the photo
// that was clicked. Render it only while open (`{open && <ReviewLightbox .../>}`).
export default function ReviewLightbox({ images, startIndex = 0, onClose }) {
  const [index, setIndex] = useState(Math.min(Math.max(startIndex, 0), Math.max(images.length - 1, 0)));
  const touchX = useRef(null);
  const count = images.length;

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
    width: 48,
    height: 48,
    borderRadius: "9999px",
    backgroundColor: "rgba(255,255,255,0.15)",
    color: "#fff",
    fontSize: 26,
    lineHeight: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid rgba(255,255,255,0.25)",
    cursor: "pointer",
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Review photos"
      onClick={onClose}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      style={{ position: "fixed", inset: 0, zIndex: 1000, backgroundColor: "rgba(0,0,0,0.92)", display: "flex", flexDirection: "column" }}
    >
      {/* top bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", color: "#fff" }}>
        <span style={{ fontSize: 13, letterSpacing: "0.12em" }}>{index + 1} / {count}</span>
        <button
          type="button"
          aria-label="Close"
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          style={{ width: 40, height: 40, borderRadius: "9999px", color: "#fff", fontSize: 28, lineHeight: 1, backgroundColor: "rgba(255,255,255,0.15)" }}
        >
          ×
        </button>
      </div>

      {/* photo */}
      <div style={{ position: "relative", flex: 1, minHeight: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 64px" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[index]}
          alt={`Customer photo ${index + 1}`}
          onClick={(e) => e.stopPropagation()}
          style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: 8 }}
        />
        {count > 1 && (
          <>
            <button type="button" aria-label="Previous photo" onClick={(e) => { e.stopPropagation(); prev(); }} style={{ ...arrowStyle, left: 10 }}>‹</button>
            <button type="button" aria-label="Next photo" onClick={(e) => { e.stopPropagation(); next(); }} style={{ ...arrowStyle, right: 10 }}>›</button>
          </>
        )}
      </div>

      {/* thumbnails */}
      {count > 1 && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{ display: "flex", gap: 8, justifyContent: "center", padding: "12px 12px 18px", overflowX: "auto" }}
        >
          {images.map((src, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Photo ${i + 1}`}
              onClick={() => setIndex(i)}
              style={{
                flex: "0 0 auto",
                width: 56,
                height: 56,
                borderRadius: 6,
                overflow: "hidden",
                border: i === index ? "2px solid #B8976A" : "2px solid transparent",
                opacity: i === index ? 1 : 0.6,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
