"use client";

import { createTitleUrl } from "@/lib/utils";
import { useRef, useState, useEffect, useCallback } from 'react';

type SeasonItem = { 
  season: number | string; 
  label: string; 
  nonRegional: boolean; 
  regionalLanguageInfo?: { 
    isNonRegional: boolean; 
    isSubbed: boolean; 
    isDubbed: boolean; 
    languageType: 'dubbed' | 'subbed' | 'unknown' 
  } 
};

export default function SeasonSelector({
  seasons,
  selected,
  seriesUrl,
  postId,
}: {
  seasons: SeasonItem[];
  selected?: number;
  seriesUrl: string;
  postId?: number;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hasOverflow, setHasOverflow] = useState(false);
  
  const title = decodeURIComponent(seriesUrl.split('/').filter(Boolean).pop() || '');
  
  const checkOverflow = useCallback(() => {
    if (scrollRef.current) {
      const { scrollWidth, clientWidth, scrollLeft } = scrollRef.current;
      const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 2;
      setHasOverflow(scrollWidth > clientWidth && !isAtEnd);
    }
  }, []);

  useEffect(() => {
    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    const el = scrollRef.current;
    el?.addEventListener('scroll', checkOverflow);
    return () => {
      window.removeEventListener('resize', checkOverflow);
      el?.removeEventListener('scroll', checkOverflow);
    };
  }, [checkOverflow, seasons]);

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: scrollRef.current.clientWidth * 0.8, behavior: 'smooth' });
  };
  
  const getSeasonType = (s: SeasonItem) => {
    if (s.regionalLanguageInfo) return s.regionalLanguageInfo.languageType;
    const l = s.label.toLowerCase();
    if (l.includes('dub')) return 'dubbed';
    if (l.includes('sub') || s.nonRegional) return 'subbed';
    return null;
  };
  
  return (
    <div className="relative w-full min-w-0 max-w-full overflow-hidden">
      <div 
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto overflow-y-hidden scrollbar-hide"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {seasons.map((s) => {
          const href = createTitleUrl(title, postId, Number(s.season));
          const isActive = selected === Number(s.season);
          const seasonType = getSeasonType(s);
          const isSub = s.nonRegional || seasonType === 'subbed';
          
          return (
            <a
              key={String(s.season)}
              href={href}
              className={[
                'px-4 py-2.5 rounded-lg whitespace-nowrap text-[12px] font-medium tracking-wide',
                'flex-shrink-0 transition-all duration-300 border',
                isActive 
                  ? 'bg-white/15 text-white border-white/40 shadow-md' 
                  : isSub
                    ? 'bg-white/5 text-white/50 border-white/20 border-dashed italic hover:text-white/70 hover:border-white/30'
                    : 'bg-white/5 text-white/60 border-white/20 hover:text-white/80 hover:border-white/40 hover:bg-white/10 hover:-translate-y-px hover:shadow-md',
              ].join(' ')}
            >
              <span className="flex items-center gap-2">
                {s.label}
                {seasonType === 'dubbed' && (
                  <span className="px-1.5 py-0.5 bg-accent/10 text-accent/80 text-[9px] rounded font-bold border border-accent/20">DUB</span>
                )}
                {seasonType === 'subbed' && (
                  <span className="px-1.5 py-0.5 bg-white/10 text-white/50 text-[9px] rounded font-bold border border-white/20">SUB</span>
                )}
              </span>
            </a>
          );
        })}
      </div>

      {/* Fade + arrow */}
      {hasOverflow && (
        <>
          <div className="absolute right-0 top-0 bottom-0 w-16 pointer-events-none bg-gradient-to-r from-transparent to-bg-base" />
          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 text-accent text-3xl font-bold bg-transparent border-none cursor-pointer z-10 hover:translate-x-0.5 transition-transform"
            aria-label="Scroll seasons"
          >
            »
          </button>
        </>
      )}
    </div>
  );
}
