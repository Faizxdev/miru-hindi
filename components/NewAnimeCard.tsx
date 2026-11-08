"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createTitleUrl } from "@/lib/utils";

type AnimeCardProps = {
  url: string;
  title: string | null;
  image?: string | null;
  postId?: number;
  genres?: string[];
  rating?: number;
  year?: number;
  episodeCount?: number;
  isNew?: boolean;
  isPopular?: boolean;
  season?: string;
  episodeRange?: string;
};

export default function NewAnimeCard({
  url,
  title,
  image,
  postId,
  genres,
  rating,
  year,
  episodeCount,
  isNew = false,
  isPopular = false,
  season,
  episodeRange,
}: AnimeCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Generate the new slug-based URL
  const titleUrl = title ? createTitleUrl(title, postId) : url;

  return (
    <div className="group relative cursor-pointer font-sans animate-in fade-in duration-300">
      <Link href={titleUrl} className="block">
        {/* Thumbnail Stack */}
        <div className="relative aspect-[2/3] overflow-hidden rounded-md bg-bg-surface border border-border-subtle transition-colors group-hover:border-border-medium">
          {/* Skeleton Shimmer Underlay - Visible while live image loads */}
          <div 
            className={`absolute inset-0 bg-bg-elevated skeleton-shimmer transition-opacity duration-500 ${
              imageLoaded ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-bg-base/80 via-transparent to-transparent" />
          </div>

          {image && !imageError ? (
            <Image
              src={image}
              alt={title || "Anime"}
              fill
              className={`object-cover transition-all duration-500 ease-out group-hover:opacity-85 ${
                imageLoaded ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-95 blur-sm"
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-bg-elevated">
              <svg className="w-8 h-8 text-content-tertiary/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
              <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>

          {/* Minimal Badges - Top Left */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
            {isNew && (
              <span className="px-1.5 py-0.5 bg-accent text-white text-[9px] font-black rounded-sm uppercase tracking-wider block shadow-sm shadow-black/40">
                New
              </span>
            )}
            {season && (
              <span className="px-1.5 py-0.5 bg-black/80 backdrop-blur-sm text-white text-[9px] font-bold rounded-sm uppercase tracking-wider block border border-white/10">
                {season}
              </span>
            )}
          </div>

          {/* Audio Badge - Top Right */}
          {title && /hindi|dub|dual/i.test(title) && (
            <div className="absolute top-2 right-2">
              <span className="px-1.5 py-0.5 bg-accent text-white text-[9px] font-black rounded-sm uppercase tracking-wider block shadow-sm shadow-black/60">
                HINDI
              </span>
            </div>
          )}

          {/* Minimal Badges - Bottom Left */}
          {episodeRange && (
            <div className="absolute bottom-2 left-2">
              <span className="px-1.5 py-0.5 bg-black/85 backdrop-blur-sm text-white/90 text-[9px] font-medium rounded-sm uppercase tracking-wider block border border-white/10">
                {episodeRange}
              </span>
            </div>
          )}
        </div>

        {/* Content Info */}
        <div className="mt-3 space-y-1">
          <h3 className="text-[13px] font-medium text-content-primary leading-tight line-clamp-2 transition-colors group-hover:text-accent">
            {title || "Untitled"}
          </h3>
          
          <div className="flex items-center text-[11px] text-content-tertiary">
            <span>{year || "2024"}</span>
            <span className="mx-1.5 text-[8px] opacity-50">•</span>
            <span className="truncate">
              {genres && genres.length > 0 ? genres[0] : "Anime"}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
