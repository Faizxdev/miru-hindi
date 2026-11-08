"use client";

import React from "react";

/**
 * Standard Anime Card Skeleton
 * Matches NewAnimeCard with exact aspect-[2/3] ratio, rounded corners,
 * and realistic title/meta placeholder lines to prevent Cumulative Layout Shift (CLS).
 */
export function CardSkeleton() {
  return (
    <div className="space-y-3 font-sans" aria-hidden="true">
      {/* Poster Thumbnail Placeholder */}
      <div className="relative aspect-[2/3] w-full rounded-md bg-bg-surface border border-border-subtle overflow-hidden skeleton-shimmer">
        <div className="absolute inset-0 bg-gradient-to-t from-bg-elevated/40 via-transparent to-transparent" />
      </div>

      {/* Content Meta Placeholder */}
      <div className="space-y-1.5 pt-0.5">
        <div className="h-3.5 w-4/5 rounded-sm bg-bg-surface skeleton-shimmer" />
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-10 rounded-sm bg-bg-surface skeleton-shimmer" />
          <div className="h-1.5 w-1.5 rounded-full bg-border-subtle" />
          <div className="h-2.5 w-16 rounded-sm bg-bg-surface skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
}

/**
 * Carousel Card Skeleton
 * Matches the exact width w-40 md:w-52 pr-6 used across horizontal shelves.
 */
export function CarouselCardSkeleton() {
  return (
    <div className="flex-shrink-0 w-40 md:w-52 pr-6">
      <CardSkeleton />
    </div>
  );
}

/**
 * Grid Skeleton
 * Renders a responsive grid of card skeletons matching catalog pages (Anime, Movies, Series).
 */
export function GridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div 
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4" 
      aria-hidden="true"
    >
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Hero Banner Skeleton
 * Matches HeroBanner geometry, reserving space above the fold for instant LCP.
 */
export function HeroSkeleton() {
  return (
    <section 
      className="relative w-full h-[480px] md:h-[580px] bg-bg-surface border-b border-border-subtle overflow-hidden animate-pulse"
      aria-hidden="true"
    >
      {/* Subtle Gradient Backdrop */}
      <div className="absolute inset-0 bg-gradient-to-t from-bg-base via-bg-base/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-bg-base via-bg-base/40 to-transparent" />

      {/* Foreground Content Skeleton */}
      <div className="relative h-full max-w-[1280px] mx-auto px-5 md:px-12 flex flex-col justify-end pb-16 space-y-4">
        {/* Spotlight Tag Placeholder */}
        <div className="h-5 w-28 rounded bg-bg-elevated" />

        {/* Title Placeholder */}
        <div className="h-9 md:h-12 w-3/4 md:w-1/2 rounded bg-bg-elevated" />

        {/* Meta Row Placeholder */}
        <div className="flex items-center gap-3">
          <div className="h-4 w-12 rounded bg-bg-elevated" />
          <div className="h-3 w-3 rounded-full bg-border-subtle" />
          <div className="h-4 w-20 rounded bg-bg-elevated" />
          <div className="h-3 w-3 rounded-full bg-border-subtle" />
          <div className="h-4 w-14 rounded bg-bg-elevated" />
        </div>

        {/* Description Placeholder */}
        <div className="space-y-2 max-w-xl pt-2">
          <div className="h-3.5 w-full rounded bg-bg-elevated" />
          <div className="h-3.5 w-4/5 rounded bg-bg-elevated" />
        </div>

        {/* Dual Button Placeholders */}
        <div className="flex items-center gap-3 pt-3">
          <div className="h-11 w-32 rounded-sm bg-accent/20 border border-accent/30" />
          <div className="h-11 w-28 rounded-sm bg-bg-elevated border border-border-subtle" />
        </div>
      </div>
    </section>
  );
}

/**
 * Shelf / Carousel Skeleton
 * Matches NewCarousel horizontal shelf with header and card row.
 */
export function ShelfSkeleton({ title = "Loading titles" }: { title?: string }) {
  return (
    <div className="space-y-5 animate-pulse" aria-hidden="true">
      {/* Shelf Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-6 w-44 rounded bg-bg-surface" />
          <div className="h-3.5 w-60 rounded bg-bg-surface" />
        </div>
        <div className="h-4 w-16 rounded bg-bg-surface" />
      </div>

      {/* Horizontal Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

/**
 * Full Page Skeleton
 * Used by loading.tsx for root-level and route-level suspense transitions.
 * Replaces the old modal splash screen with authentic structural placeholders.
 */
export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-bg-base text-content-primary font-sans flex flex-col">
      {/* Sticky Top Navbar Skeleton */}
      <header className="sticky top-0 z-50 bg-bg-surface border-b border-border-subtle h-16 px-4 md:px-6 flex items-center justify-between animate-pulse">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-md bg-bg-elevated" />
          <div className="h-5 w-28 rounded bg-bg-elevated" />
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded bg-bg-elevated" />
          <div className="w-8 h-8 rounded bg-bg-elevated" />
        </div>
      </header>

      {/* Hero Skeleton */}
      <HeroSkeleton />

      {/* Main Shelves Skeleton */}
      <main className="w-full px-4 md:px-8 py-12 space-y-16 flex-1">
        <ShelfSkeleton />
        <ShelfSkeleton />
      </main>

      {/* Bottom Nav Placeholder for mobile */}
      <div className="md:hidden fixed bottom-0 inset-x-0 h-16 bg-bg-surface border-t border-border-subtle flex items-center justify-around px-2 z-40">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="w-8 h-8 rounded-full bg-bg-elevated" />
        ))}
      </div>
    </div>
  );
}

/**
 * Backward compatibility alias so existing ScreenSkeleton references
 * automatically use the fast PageSkeleton instead of any splash screen.
 */
export const ScreenSkeleton = PageSkeleton;
