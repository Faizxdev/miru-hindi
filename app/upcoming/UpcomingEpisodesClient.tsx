"use client";
import { useEffect, useState } from "react";
import AnimeLink from "@/components/AnimeLink";

interface UpcomingEpisode {
  id: string;
  title: string;
  image: string;
  episode: string;
  countdown: number;
  url: string;
}

export default function UpcomingEpisodesClient() {
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
      <div className="space-y-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="aspect-[2/3] w-full bg-bg-surface border border-border-subtle rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center max-w-2xl mx-auto space-y-4">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mx-auto">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="section-heading text-xl text-red-500">Error Loading Episodes</h3>
        <p className="section-subtitle text-red-400/80">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="btn-outline px-6 py-2 rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (episodes.length === 0) {
    return (
      <div className="text-center py-20 space-y-6">
        <div className="w-24 h-24 bg-bg-surface border border-border-subtle rounded-full flex items-center justify-center text-content-tertiary mx-auto">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="space-y-2">
          <p className="section-heading text-xl">No upcoming episodes</p>
          <p className="section-subtitle">There are no episodes scheduled for release at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-16">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {episodes.map((episode) => {
          const { timeText, isPast } = formatCountdown(episode.countdown);
          const imageSrc = episode.image.startsWith('data:') ? episode.image : `/api/image?src=${encodeURIComponent(episode.image.startsWith('//') ? `https:${episode.image}` : episode.image)}`;
          return (
            <div key={episode.id} className="group relative">
              <AnimeLink seriesUrl={episode.url} className="block">
                <div className="bg-bg-surface border border-border-subtle rounded-2xl overflow-hidden transition-all duration-300 group-hover:border-accent/30 group-hover:shadow-2xl group-hover:shadow-accent/5">
                  <div className="relative aspect-[2/3]">
                    <img
                      src={imageSrc}
                      alt={episode.title}
                      className="w-full h-full object-cover transition-opacity duration-500"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==';
                      }}
                    />
                    
                    {/* Dark Overlay on Hover */}
                    <div className="absolute inset-0 bg-bg-base/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="w-14 h-14 bg-accent text-bg-base rounded-full flex items-center justify-center transition-all duration-300 shadow-xl">
                        <svg className="w-7 h-7 ml-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                    </div>

                    <div className="absolute bottom-3 left-3 px-3 py-1 bg-bg-elevated/90 backdrop-blur-md rounded-lg border border-border-subtle text-[10px] font-bold uppercase tracking-widest text-content-primary z-10">
                      {episode.episode}
                    </div>

                    <div 
                      className={`absolute top-3 right-3 px-3 py-1 rounded-lg font-bold text-[10px] uppercase tracking-widest shadow-lg z-10 transition-all duration-300 ${
                        isPast ? 'bg-red-500 text-white' : 'bg-accent text-bg-base'
                      }`}
                    >
                      {timeText}
                    </div>
                  </div>
                  <div className="p-4 space-y-1">
                    <h3 className="text-content-primary text-sm font-bold line-clamp-2 leading-tight min-h-[2.5rem] group-hover:text-accent transition-colors duration-300">
                      {episode.title}
                    </h3>
                  </div>
                </div>
              </AnimeLink>
            </div>
          );
        })}
      </div>

      <div className="pt-12">
        <div className="bg-bg-surface border border-border-subtle rounded-3xl p-8 max-w-3xl mx-auto text-center space-y-6">
          <div className="space-y-2">
            <h3 className="section-heading text-2xl font-serif">Release Schedule</h3>
            <p className="section-subtitle text-sm">
              Timers update automatically every 30 seconds.
            </p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-8 py-2">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-accent rounded-full shadow-lg shadow-accent/20"></div>
              <span className="text-xs font-bold uppercase tracking-widest text-content-secondary">Upcoming Release</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-red-500 rounded-full shadow-lg shadow-red-500/20"></div>
              <span className="text-xs font-bold uppercase tracking-widest text-content-secondary">Recently Aired</span>
            </div>
          </div>
          <p className="text-content-tertiary text-xs max-w-lg mx-auto leading-relaxed">
            Release times are based on original Japanese schedules. Subtitles and different languages may take additional time to process and become available.
          </p>
        </div>
      </div>
    </div>
  );
}
