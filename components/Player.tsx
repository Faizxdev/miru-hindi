"use client";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useProgress } from "@/components/useProgress";
import { useWatchHistory } from "@/hooks/useWatchHistory";
import { useAuth } from "@/contexts/AuthContext";

type PlayerSourceItem = { src: string; kind: "iframe" | "video"; label?: string | null; quality?: string | null };

interface PlayerProps {
  sources: PlayerSourceItem[];
  episodeData?: {
    id: string;
    title: string;
    episode: string;
    season?: string;
    poster?: string;
    seriesUrl?: string;
    postId?: number;
    url: string;
  };
  nextEpisodeUrl?: string;
}

export default function Player({ sources, episodeData, nextEpisodeUrl }: PlayerProps) {
  const safeSources = useMemo(() => {
    const seen = new Set<string>();
    return (sources || []).filter((s) => (s?.src && !seen.has(s.src) ? (seen.add(s.src), true) : false));
  }, [sources]);

  const [idx, setIdx] = useState(0);
  const current = safeSources[idx] || null;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const { user } = useAuth();
  const { set: setProgress, get: getProgress } = useProgress();
  const { addToWatchHistory, updateWatchProgress } = useWatchHistory();
  const [hasAddedToHistory, setHasAddedToHistory] = useState(false);

  // --- Skip Intro/Outro & Auto Next toggle state ---
  const [autoNextEnabled, setAutoNextEnabled] = useState(true);
  const [autoSkipEnabled, setAutoSkipEnabled] = useState(true);

  // Load toggle state from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    setAutoNextEnabled(localStorage.getItem('auto_next') !== 'false');
    setAutoSkipEnabled(localStorage.getItem('auto_skip_intro_outro') !== 'false');
  }, []);

  const handleAutoNextToggle = useCallback((checked: boolean) => {
    setAutoNextEnabled(checked);
    localStorage.setItem('auto_next', checked ? 'true' : 'false');
  }, []);

  const handleAutoSkipToggle = useCallback((checked: boolean) => {
    setAutoSkipEnabled(checked);
    localStorage.setItem('auto_skip_intro_outro', checked ? 'true' : 'false');
  }, []);

  // --- Auto Skip Intro/Outro: send postMessage to iframe ---
  useEffect(() => {
    if (!current || current.kind !== 'iframe') return;

    const interval = setInterval(() => {
      const iframe = iframeRef.current;
      if (!iframe?.contentWindow) return;
      // Only send if auto-skip is enabled (re-read from localStorage for real-time toggle)
      const enabled = localStorage.getItem('auto_skip_intro_outro') !== 'false';
      if (enabled) {
        try {
          iframe.contentWindow.postMessage(
            { autoSkip: { intro: true, outro: true } },
            '*'
          );
        } catch { /* cross-origin errors are expected for some servers */ }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [current?.src, current?.kind]);

  // --- Auto Next Episode: listen for video_playback_completed ---
  useEffect(() => {
    if (!nextEpisodeUrl) return;

    const handler = (e: MessageEvent) => {
      // Check if auto-next is enabled (re-read from localStorage for real-time toggle)
      const enabled = localStorage.getItem('auto_next') !== 'false';
      if (!enabled) return;

      if (e.data === 'video_playback_completed') {
        console.log('Player: Auto Next triggered — navigating to next episode');
        window.location.href = nextEpisodeUrl;
      }
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [nextEpisodeUrl]);

  // Add to watch history when user starts watching
  useEffect(() => {
    if (!episodeData || hasAddedToHistory) return;
    
    console.log('Player: Adding to watch history:', episodeData);
    
    // Add to history after a short delay to ensure the player is loaded
    const timer = setTimeout(() => {
      if (episodeData) {
        console.log('Player: Calling addToWatchHistory with:', {
          id: episodeData.id,
          title: episodeData.title,
          episode: episodeData.episode,
          season: episodeData.season,
          poster: episodeData.poster,
          url: episodeData.url
        });
        
        addToWatchHistory({
          id: episodeData.id,
          title: episodeData.title,
          episode: episodeData.episode,
          season: episodeData.season,
          poster: episodeData.poster,
          seriesUrl: episodeData.seriesUrl,
          postId: episodeData.postId,
          url: episodeData.url
        });
        setHasAddedToHistory(true);
      }
    }, 2000); // 2 second delay

    return () => clearTimeout(timer);
  }, [episodeData, hasAddedToHistory, addToWatchHistory]);

  // Debug effect to track user presence
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).amai_auth = {
        isLoggedIn: !!user,
        uid: user?.uid || null,
        email: user?.email || null
      };
      if (!user) console.warn('AMAI Player: User not found. XP tracking disabled.');
    }
  }, [user]);

  // Heartbeat for IFrames (since we can't track progress via events)
  useEffect(() => {
    if (!current || current.kind !== "iframe" || !episodeData) return;

    console.log('Player: Starting iframe heartbeat for:', episodeData.title);
    
    const interval = setInterval(() => {
      // Only sync if the tab is visible to prevent AFK XP farming
      if (document.visibilityState === 'visible') {
        console.log('Player: Iframe heartbeat - Syncing with Firestore...');
        updateWatchProgress(episodeData.id, 0, 0, {
          id: episodeData.id,
          title: episodeData.title,
          episode: episodeData.episode,
          season: episodeData.season,
          poster: episodeData.poster,
          seriesUrl: episodeData.seriesUrl,
          postId: episodeData.postId,
          url: episodeData.url
        }, true); // Pass isHeartbeat=true
        
        // Also update LocalStorage for guest history
        setProgress(current.src, 0, 0, {
          title: episodeData.title,
          episode: episodeData.episode,
          season: episodeData.season,
          poster: episodeData.poster,
          seriesUrl: episodeData.seriesUrl,
          postId: episodeData.postId
        });
        
        // Update debug object
        if (typeof window !== 'undefined') {
          (window as any).amai_xp = {
            last_heartbeat: new Date().toLocaleTimeString(),
            status: 'Synced',
            content: episodeData.title
          };
        }
      }
    }, 30000); // Every 30 seconds for better responsiveness

    return () => clearInterval(interval);
  }, [current?.src, current?.kind, episodeData, updateWatchProgress]);

  // Resume time for HTML5 video
  useEffect(() => {
    if (!current || current.kind !== "video") return;
    const v = videoRef.current;
    if (!v) return;

    if (typeof window !== 'undefined') {
      (window as any).amai_xp_mode = 'HTML5-Video';
    }

    try {
      const p = getProgress(current.src);
      if (p && p.position > 0 && p.duration > 0 && p.position < p.duration - 2) {
        v.currentTime = p.position;
      }
    } catch {}

    const onTime = () => {
      try {
        if (!v.duration || isNaN(v.duration)) return;
        const progress = (v.currentTime / v.duration) * 100;
        
        // Update LocalStorage (for guests/redundancy)
        if (episodeData) {
          setProgress(current.src, v.currentTime || 0, v.duration || 0, {
            title: episodeData.title,
            episode: episodeData.episode,
            season: episodeData.season,
            poster: episodeData.poster,
            seriesUrl: episodeData.seriesUrl,
            postId: episodeData.postId
          });
        }

        // Update Firestore (for logged in users - every ~3% increment)
        if (episodeData) {
          const lastSynced = v.getAttribute('data-last-sync') || '0';
          if (Math.abs(progress - parseFloat(lastSynced)) > 3 || v.ended) {
            console.log(`Player: HTML5 Sync at ${progress.toFixed(2)}%`);
            
            // Debug for user
            if (typeof window !== 'undefined') {
              (window as any).amai_xp = {
                last_sync: new Date().toLocaleTimeString(),
                progress: progress.toFixed(2),
                id: episodeData.id
              };
            }

            updateWatchProgress(episodeData.id, progress, v.duration, {
              id: episodeData.id,
              title: episodeData.title,
              episode: episodeData.episode,
              season: episodeData.season,
              poster: episodeData.poster,
              seriesUrl: episodeData.seriesUrl,
              postId: episodeData.postId,
              url: episodeData.url
            });
            v.setAttribute('data-last-sync', progress.toString());
          }
        }
      } catch {}
    };
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("ended", onTime);
    return () => {
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("ended", onTime);
    };
  }, [current?.src, current?.kind]);

  return (
    <div className="space-y-6">
      <div className="bg-bg-surface rounded-md overflow-hidden border border-border-subtle shadow-2xl">
        <div className="aspect-video w-full bg-black">
          {current ? (
            current.kind === "iframe" ? (
              <iframe
                key={current.src}
                ref={iframeRef}
                src={current.src}
                className="w-full h-full"
                frameBorder={0}
                allowFullScreen
                allow="autoplay; encrypted-media"
                referrerPolicy="no-referrer"
                sandbox="allow-scripts allow-same-origin allow-forms"
              />
            ) : (
              <video
                key={current.src}
                ref={videoRef as any}
                controls
                className="w-full h-full text-accent"
                autoPlay
              >
                <source src={current.src} />
                Your browser does not support the video tag.
              </video>
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center text-content-tertiary">
              <span className="text-sm">No player sources available</span>
            </div>
          )}
        </div>
      </div>

      {/* Server selector + Toggle switches row */}
      <div className="flex flex-col gap-3">
        {safeSources.length > 1 && (
          <div className="flex items-center justify-between bg-bg-surface rounded-md px-5 py-3 border border-border-subtle">
            <div className="text-[13px] font-medium text-content-secondary uppercase tracking-wider">Select Server</div>
            <div className="relative">
              <select
                value={idx}
                onChange={(e) => setIdx(Number(e.target.value))}
                className="bg-bg-elevated text-content-primary text-sm px-4 py-2 rounded-md border border-border-subtle focus:outline-none focus:border-accent-muted transition-colors appearance-none pr-10 cursor-pointer"
              >
                {safeSources.map((s, i) => (
                  <option key={s.src} value={i}>
                    {s.label || s.quality || `Server ${i + 1}`}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-content-tertiary">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Auto Next & Skip Intro/Outro toggles */}
        <div className="flex items-center justify-between bg-bg-surface rounded-md px-5 py-3 border border-border-subtle">
          <div className="flex items-center gap-6">
            {/* Auto Next toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none group">
              <span className="text-[13px] font-medium text-content-secondary group-hover:text-content-primary transition-colors">Auto Next</span>
              <button
                type="button"
                role="switch"
                aria-checked={autoNextEnabled}
                onClick={() => handleAutoNextToggle(!autoNextEnabled)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-accent/30 ${
                  autoNextEnabled ? 'bg-accent' : 'bg-border-subtle'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${
                    autoNextEnabled ? 'translate-x-[18px]' : 'translate-x-[3px]'
                  }`}
                />
              </button>
            </label>

            {/* Skip Intro/Outro toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none group">
              <span className="text-[13px] font-medium text-content-secondary group-hover:text-content-primary transition-colors">Skip Intro/Outro</span>
              <button
                type="button"
                role="switch"
                aria-checked={autoSkipEnabled}
                onClick={() => handleAutoSkipToggle(!autoSkipEnabled)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-accent/30 ${
                  autoSkipEnabled ? 'bg-accent' : 'bg-border-subtle'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${
                    autoSkipEnabled ? 'translate-x-[18px]' : 'translate-x-[3px]'
                  }`}
                />
              </button>
            </label>
          </div>

          {/* Status indicators */}
          <div className="flex items-center gap-4">
            {nextEpisodeUrl && autoNextEnabled && (
              <span className="text-[11px] text-accent font-medium uppercase tracking-wider flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
                Auto
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


