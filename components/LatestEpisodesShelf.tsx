"use client";

import { useEffect, useState } from "react";
import NewCarousel from "@/components/NewCarousel";
import NewAnimeCard from "@/components/NewAnimeCard";
import { SeriesListItem } from "@/server/types";

const AUTO_REFRESH_MS = 5 * 60 * 1000;

interface LatestEpisodesShelfProps {
  initialItems: SeriesListItem[];
}

export default function LatestEpisodesShelf({ initialItems }: LatestEpisodesShelfProps) {
  const [items, setItems] = useState<SeriesListItem[]>(initialItems);

  useEffect(() => {
    let mounted = true;

    const refreshLatestEpisodes = async () => {
      try {
        const response = await fetch("/api/latest-episodes", {
          cache: "no-store",
        });

        if (!response.ok) return;

        const data = await response.json();
        if (mounted && Array.isArray(data.items) && data.items.length > 0) {
          setItems(data.items);
        }
      } catch (error) {
        console.error("Failed to refresh latest episodes:", error);
      }
    };

    refreshLatestEpisodes();
    const intervalId = window.setInterval(refreshLatestEpisodes, AUTO_REFRESH_MS);

    return () => {
      mounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <NewCarousel
      title="Latest Episodes"
      subtitle="Newly added episodes and latest releases"
      showViewAll
      viewAllHref="/anime"
    >
      {items.map((anime, index) => (
        <div key={anime.url} className="flex-shrink-0 w-40 md:w-52 pr-6">
          <NewAnimeCard
            url={anime.url}
            title={anime.title}
            image={anime.image}
            postId={anime.postId}
            year={2024}
            season={anime.season}
            episodeRange={anime.episodeRange}
            isNew={index < 5}
          />
        </div>
      ))}
    </NewCarousel>
  );
}
