"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import AnimeLink from "@/components/AnimeLink";

type Slide = {
  title: string | null;
  image?: string | null;
  url: string;
  postId?: number;
  genres?: string[];
  tagline?: string | null;
};

export default function HeroSlider({ slides }: { slides: Slide[] }) {
  const [idx, setIdx] = useState(0);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const count = slides.length;

  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % Math.max(1, count)), 6000);
    return () => clearInterval(id);
  }, [count]);

  const go = (n: number) => setIdx((n + count) % count);

  if (count === 0) return null;

  const s = slides[idx];
  const watchHrefBase = `/title?url=${encodeURIComponent(s.url)}${s.postId ? `&post_id=${s.postId}&season=1` : ""}`;

  return (
    <section
      className="relative overflow-hidden rounded-2xl border border-stroke bg-surface"
      onTouchStart={(e) => (touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY })}
      onTouchEnd={(e) => {
        if (!touch.current) return;
        const dx = e.changedTouches[0].clientX - touch.current.x;
        if (Math.abs(dx) > 40) go(idx + (dx < 0 ? 1 : -1));
        touch.current = null;
      }}
    >
      <div className="relative h-[46vw] max-h-[560px] min-h-[240px]">
        {s.image ? (
          <Image unoptimized src={s.image.startsWith("data:") ? s.image : s.image} alt={s.title || "Anime"} fill sizes="100vw" className="object-cover" />
        ) : (
          <div className="h-full w-full grid place-items-center text-text-dim">No Image</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-900 via-bg-900/30 to-transparent" />
        <div className="absolute inset-y-0 left-0 w-full md:w-[58%] px-6 md:px-12 flex items-end pb-10">
          <div className="space-y-4 max-w-2xl animate-[fadeIn_400ms_ease]">
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight drop-shadow-[0_6px_18px_rgba(0,0,0,0.6)]">{s.title || "Untitled"}</h2>
            {s.genres && s.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 text-[11px] text-text-dim">
                {s.genres.slice(0, 5).map((g) => (
                  <span key={g} className="px-2 py-0.5 rounded-full border border-stroke">
                    {g}
                  </span>
                ))}
              </div>
            )}
            <p className="text-sm text-text-dim line-clamp-2 md:line-clamp-3">{s.tagline || "Stream now on AMAI TV"}</p>
            <div className="flex gap-2">
              <AnimeLink seriesUrl={s.url} postId={s.postId} className="btn btn-primary">
                Watch Now
              </AnimeLink>
              <button className="btn btn-outline">Add to Watchlist</button>
            </div>
          </div>
        </div>
        {/* Arrows */}
        <button aria-label="Prev" onClick={() => go(idx - 1)} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-stroke bg-bg-900/70 p-2 hover:bg-bg-900/90 shadow-[0_0_12px_rgba(229,72,77,0.25)]">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <button aria-label="Next" onClick={() => go(idx + 1)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-stroke bg-bg-900/70 p-2 hover:bg-bg-900/90 shadow-[0_0_12px_rgba(229,72,77,0.25)]">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        {/* Dots */}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)} className={`h-1.5 rounded-full transition-all ${i === idx ? 'w-6 bg-primary shadow-[0_0_10px_rgba(229,72,77,0.5)]' : 'w-3 bg-white/30'}`} />
          ))}
        </div>
      </div>
    </section>
  );
}


