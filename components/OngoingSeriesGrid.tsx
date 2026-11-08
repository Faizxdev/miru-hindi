"use client";
import { useEffect, useState } from "react";
import NewAnimeCard from "./NewAnimeCard";
import { CarouselCardSkeleton } from "./Skeleton";
import { SeriesListItem } from "@/server/types";

export default function OngoingSeriesGrid() {
  const [ongoingSeries, setOngoingSeries] = useState<SeriesListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOngoingSeries = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/ongoing?page=1');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setOngoingSeries(data.items || []);
        setError(null);
      } catch (err) {
        console.error('Error loading ongoing series:', err);
        setError(err instanceof Error ? err.message : 'Failed to load ongoing series');
      } finally {
        setLoading(false);
      }
    };

    loadOngoingSeries();
  }, []);

  if (loading) {
    return (
      <div className="w-full">
        <div className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth">
          {Array.from({ length: 6 }).map((_, i) => (
            <CarouselCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-bg-surface border border-red-500/20 rounded-md p-8 max-w-md mx-auto">
          <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mx-auto mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h3 className="section-heading text-lg mb-2">Error Loading Series</h3>
          <p className="text-content-tertiary text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (ongoingSeries.length === 0) {
    return (
      <div className="text-center py-12 opacity-50">
        <p className="text-content-tertiary">No ongoing series available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth">
        {ongoingSeries.map((series) => (
          <div key={series.url} className="flex-shrink-0 w-40 md:w-52 pr-6">
            <NewAnimeCard
              url={series.url}
              title={series.title || 'Unknown Title'}
              image={series.image}
              postId={series.postId}
              year={2024}
              episodeCount={24}
              isNew={true}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
