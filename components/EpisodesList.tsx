"use client";
import EpisodeCard from "@/components/EpisodeCard";
import { useProgress } from "@/components/useProgress";

type Episode = { url: string; title?: string | null; number?: string | null; poster?: string | null };

export default function EpisodesList({
  episodes,
  seriesUrl,
  postId,
  season,
  currentEpisodeUrl,
  seasons,
  useSlugFormat,
}: {
  episodes: Episode[];
  seriesUrl: string;
  postId?: number;
  season: number;
  currentEpisodeUrl?: string | null;
  seasons?: { season: number | string; label: string; nonRegional: boolean; regionalLanguageInfo?: { isNonRegional: boolean; isSubbed: boolean; isDubbed: boolean; languageType: 'dubbed' | 'subbed' | 'unknown' } }[];
  useSlugFormat?: boolean;
}) {
  const { ratio, isCompleted } = useProgress();

  // Check if current season has non-regional episodes
  const currentSeasonInfo = seasons?.find(s => Number(s.season) === season);
  const hasNonRegionalEpisodes = currentSeasonInfo?.nonRegional || 
    currentSeasonInfo?.regionalLanguageInfo?.isNonRegional || 
    currentSeasonInfo?.regionalLanguageInfo?.isSubbed;

  // Show empty state if no episodes
  if (!episodes || episodes.length === 0) {
    return (
      <div className="bg-bg-surface border border-border-subtle rounded-2xl p-16 text-center shadow-2xl shadow-bg-base/50">
        <div className="text-content-tertiary mb-6 opacity-20">
          <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="section-heading text-2xl mb-3">No Episodes Available</h3>
        <p className="section-subtitle max-w-sm mx-auto">This season doesn't have any episodes yet. Please try a different season from the selector above.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Episode Count Badge */}
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-content-tertiary">
          {episodes.length} {episodes.length === 1 ? 'Episode' : 'Episodes'}
        </span>
        <div className="flex-1 h-px bg-border-subtle/50"></div>
      </div>

      {/* Episode Grid — full width, 8 cols on desktop */}
      <div className="grid gap-2.5 grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 w-full p-0">
        {episodes.map((ep, index) => (
          <EpisodeCard
            key={ep.url}
            url={ep.url}
            title={ep.title || `Episode ${ep.number || index + 1}`}
            number={ep.number || String(index + 1)}
            poster={ep.poster}
            seriesUrl={seriesUrl}
            postId={postId}
            season={season}
            progress={ratio(ep.url)}
            completed={isCompleted(ep.url)}
            isCurrentEpisode={currentEpisodeUrl ? currentEpisodeUrl === ep.url : false}
            useSlugFormat={useSlugFormat}
          />
        ))}
      </div>
      
      {/* Regional Language Notice */}
      {hasNonRegionalEpisodes && (
        <div className="flex items-center justify-center py-6 px-4 border-t border-border-subtle/30">
          <div className="flex items-center gap-3 text-content-tertiary">
            <svg className="w-4 h-4 text-accent/60 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="font-bold uppercase tracking-[0.2em] text-[10px] opacity-60">Some episodes are subbed-only</span>
          </div>
        </div>
      )}
    </div>
  );
}
