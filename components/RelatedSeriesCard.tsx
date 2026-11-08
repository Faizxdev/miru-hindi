"use client";

import Image from 'next/image';
import { useState } from 'react';

interface RelatedSeriesCardProps {
  url: string;
  title?: string | null;
  poster?: string | null;
  genres?: string[];
  postId?: number;
}

export default function RelatedSeriesCard({ url, title, poster, genres, postId }: RelatedSeriesCardProps) {
  const [imageError, setImageError] = useState(false);
  
  const relatedSlug = title?.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim() || 'unknown';

  return (
    <a 
      href={`/title/${relatedSlug}${postId ? `?post_id=${postId}` : ''}`} 
      className="group relative rounded-xl overflow-hidden border border-white/10 bg-black hover:border-white/25 transition-all duration-300"
    >
      {poster && !imageError ? (
        <Image 
          unoptimized 
          src={`/api/image?src=${encodeURIComponent(poster)}`} 
          alt={title || 'Related'} 
          width={220} 
          height={330} 
          className="w-full h-auto object-cover" 
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="aspect-[2/3] w-full grid place-items-center text-xs text-gray-300 bg-black">
          {title || 'No Image'}
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition" />
      <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition">
        <div className="text-sm font-medium line-clamp-2 text-white">{title}</div>
        <div className="mt-1 text-[11px] text-gray-300 line-clamp-1">{(genres || []).join(', ')}</div>
      </div>
    </a>
  );
}
