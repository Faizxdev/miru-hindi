"use client";
import { useEffect, useState } from "react";
import AnimeLink from "@/components/AnimeLink";
import { CarouselCardSkeleton } from "./Skeleton";

interface UpcomingEpisode {
  id: string;
  title: string;
  image: string;
  episode: string;
  countdown: number;
  url: string;
}

export default function UpcomingEpisodesGrid() {
  const [episodes, setEpisodes] = useState<UpcomingEpisode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUpcomingEpisodes = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/upcoming');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setEpisodes(data.episodes || []);
        setError(null);
      } catch (err) {
        console.error('Error loading upcoming episodes:', err);
        setError(err instanceof Error ? err.message : 'Failed to load upcoming episodes');
      } finally {
        setLoading(false);
      }
    };

    loadUpcomingEpisodes();
  }, []);

  useEffect(() => {
    function updateCountdowns() {
      setEpisodes(prevEpisodes => 
        prevEpisodes.map(episode => ({
          ...episode,
          countdown: episode.countdown
        }))
      );
    }

    updateCountdowns();
    const interval = setInterval(updateCountdowns, 30000);

    return () => clearInterval(interval);
  }, []);

  const formatCountdown = (timestamp: number) => {
    if (!timestamp || timestamp === 0) {
      return { timeText: 'TBA', isPast: false };
    }
    const now = Math.floor(Date.now() / 1000);
    const diff = timestamp - now;
    const absDiff = Math.abs(diff);
    const isPast = diff <= 0;
    const days = Math.floor(absDiff / (24 * 60 * 60));
    const hours = Math.floor((absDiff % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((absDiff % (60 * 60)) / 60);
    let timeText = '';
    if (days > 0) {
      timeText = `${days}d ${hours}h`;
    } else if (hours > 0) {
      timeText = `${hours}h ${minutes}m`;
    } else {
      timeText = `${minutes}m`;
    }
    return { timeText, isPast };
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4">
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
        <div className="bg-bg-surface border border-red-500/20 rounded-3xl p-8 max-w-md mx-auto">
          <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mx-auto mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h3 className="section-heading text-lg mb-2">Error Loading Upcoming</h3>
          <p className="text-content-tertiary text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (episodes.length === 0) {
    return (
      <div className="text-center py-12 opacity-50">
        <p className="text-content-tertiary">No upcoming episodes available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4">
        {episodes.map((episode) => {
          const { timeText, isPast } = formatCountdown(episode.countdown);
          const imageSrc = episode.image.startsWith('data:') ? episode.image : `/api/image?src=${encodeURIComponent(episode.image.startsWith('//') ? `https:${episode.image}` : episode.image)}`;
          return (
            <div key={episode.id} className="flex-shrink-0 w-40 md:w-52 pr-6 group">
              <AnimeLink seriesUrl={episode.url} className="block space-y-4">
                <div className="relative aspect-[2/3] bg-bg-surface border border-border-subtle rounded-md overflow-hidden transition-all duration-300 group-hover:border-accent group-hover:shadow-2xl group-hover:shadow-accent/5">
                  <img
                    src={imageSrc}
                    alt={episode.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  
                  {/* Dark Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-bg-base/90 via-transparent to-transparent opacity-60" />

                  {/* Badge: Episode */}
                  <div className="absolute bottom-3 left-3 px-2 py-1 bg-bg-surface/90 border border-border-subtle rounded-md backdrop-blur-sm">
                    <span className="text-[10px] font-bold tracking-tight text-accent">{episode.episode}</span>
                  </div>

                  {/* Badge: Timer */}
                  <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-sm text-[10px] font-bold tracking-widest uppercase border backdrop-blur-md shadow-lg ${
                    isPast 
                      ? 'bg-red-500/20 border-red-500/50 text-red-200' 
                      : 'bg-accent/10 border-accent/30 text-accent group-hover:bg-accent group-hover:text-bg-base'
                  }`}>
                    {timeText}
                  </div>

                  {/* Play Icon (Hover Only) */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-bg-base shadow-2xl">
                      <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                  </div>
                </div>

                <div className="px-2 space-y-1">
                  <h3 className="text-[13px] font-medium text-content-primary leading-tight line-clamp-2 transition-colors group-hover:text-accent">
                    {episode.title}
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1 h-1 bg-accent rounded-full animate-pulse"></span>
                    <span className="text-[10px] text-content-tertiary font-medium uppercase tracking-wider">Upcoming</span>
                  </div>
                </div>
              </AnimeLink>
            </div>
          );
        })}
      </div>
    </div>
  );
}
