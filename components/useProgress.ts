"use client";
import { useEffect, useState } from "react";

export type ProgressMap = Record<string, { 
  position: number; 
  duration: number; 
  completed?: boolean;
  title?: string;
  episode?: string;
  season?: string;
  poster?: string;
  seriesUrl?: string;
  postId?: number;
  watchedAt?: number;
}>;
const KEY = "amai:progress:v1";

function load(): ProgressMap {
  try { const raw = localStorage.getItem(KEY); if (raw) return JSON.parse(raw); } catch {}
  return {};
}

function save(map: ProgressMap) {
  try { localStorage.setItem(KEY, JSON.stringify(map)); } catch {}
}

export function useProgress() {
  const [map, setMap] = useState<ProgressMap>({});
  useEffect(() => { setMap(load()); }, []);
  
  const set = (
    episodeUrl: string, 
    position: number, 
    duration: number, 
    metadata?: { title?: string, episode?: string, season?: string, poster?: string | null, seriesUrl?: string, postId?: number }
  ) => {
    const completed = duration > 0 && position / duration >= 0.98;
    const next: ProgressMap = { 
      ...map, 
      [episodeUrl]: { 
        ...map[episodeUrl],
        position, 
        duration, 
        completed,
        title: metadata?.title || map[episodeUrl]?.title,
        episode: metadata?.episode || map[episodeUrl]?.episode,
        season: metadata?.season || map[episodeUrl]?.season,
        poster: metadata?.poster || map[episodeUrl]?.poster || undefined,
        seriesUrl: metadata?.seriesUrl || map[episodeUrl]?.seriesUrl,
        postId: metadata?.postId || map[episodeUrl]?.postId,
        watchedAt: Date.now(),
      } 
    };
    setMap(next); save(next);
  };
  const get = (episodeUrl: string) => map[episodeUrl];
  const isCompleted = (episodeUrl: string) => !!map[episodeUrl]?.completed;
  const ratio = (episodeUrl: string) => {
    const p = map[episodeUrl];
    if (!p || !p.duration) return 0;
    return Math.min(1, p.position / p.duration);
  };
  return { set, get, isCompleted, ratio };
}


