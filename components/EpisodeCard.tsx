import Image from 'next/image'

type Props = {
  url: string
  title?: string | null
  number?: string | null
  poster?: string | null
  seriesUrl: string
  postId?: number
  season: number
  progress?: number // 0..1
  completed?: boolean
  isCurrentEpisode?: boolean
  useSlugFormat?: boolean
}

export default function EpisodeCard({ url, title, number, poster, seriesUrl, postId, season, progress = 0, completed = false, isCurrentEpisode = false, useSlugFormat = false }: Props) {
  const seriesTitle = decodeURIComponent(seriesUrl.split('/').filter(Boolean).pop() || '');
  
  // Extract episode identifier from the full episode URL
  let episodeId = '';
  try {
    const decoded = decodeURIComponent(url);
    if (/^https?:\/\//i.test(decoded) && decoded.includes('/episode/')) {
      episodeId = decoded.split('/episode/')[1]?.split('/')[0] || '';
    } else if (/^episode-/i.test(decoded)) {
      episodeId = decoded.replace(/^episode-/i, '');
    } else if (/-\d+x\d+$/i.test(decoded)) {
      episodeId = decoded;
    }
  } catch {}

  const watchHref = episodeId ? `/watch/${episodeId}` : `/watch?episode=${encodeURIComponent(url)}`;
  
  if (seriesUrl) {
    // Add metadata if provided (already done via watchHref but kept for clarity)
  }
  
  return (
    <a href={watchHref} className="group block focus:outline-none">
      <article className="flex flex-col space-y-2 transition-all duration-300">
        {/* Thumbnail Container */}
        <div className={`relative aspect-video overflow-hidden rounded-sm transition-all duration-300 ${
          isCurrentEpisode 
            ? 'ring-2 ring-accent ring-offset-2 ring-offset-bg-base shadow-lg shadow-accent/20' 
            : 'group-hover:shadow-xl group-hover:shadow-black/50'
        }`}>
          {poster ? (
            <Image 
              unoptimized 
              src={poster.startsWith('data:') ? poster : `/api/image?src=${encodeURIComponent(poster)}`} 
              alt={title || 'Episode'} 
              fill 
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" 
              className="object-cover transition-all duration-500 group-hover:scale-105 group-hover:opacity-80" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-bg-elevated">
              <span className="text-accent/40 font-serif text-3xl font-bold italic">{number || '?'}</span>
            </div>
          )}
          
          {/* Episode Number Badge (Matched to Screenshot) */}
          <div className="absolute top-0 left-0 px-2 py-0.5 bg-black/70 backdrop-blur-sm rounded-br-sm">
            <span className="text-white text-[10px] font-bold leading-none">{number || '?'}</span>
          </div>

          {/* Now Playing Indicator (Matched to Screenshot) */}
          {isCurrentEpisode && (
            <div className="absolute top-0 right-0 px-2 py-0.5 bg-accent/90 rounded-bl-sm">
              <span className="text-bg-base text-[9px] font-black uppercase tracking-widest leading-none">Playing</span>
            </div>
          )}
          
          {/* Play Overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/30">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-accent/90 shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-300">
              <svg className="w-4 h-4 text-bg-base ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>

          {/* Progress Bar */}
          {progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
              <div 
                className="h-full bg-accent transition-all duration-500" 
                style={{ width: `${Math.min(100, Math.round(progress * 100))}%` }} 
              />
            </div>
          )}
        </div>
        
        {/* Episode Info (Matched to Screenshot) */}
        <div className="space-y-0.5">
          <h3 className={`text-[11px] font-medium leading-tight line-clamp-1 transition-colors ${
            isCurrentEpisode ? 'text-accent' : 'text-content-secondary group-hover:text-accent'
          }`}>
            {title || `Episode ${number || 'Unknown'}`}
          </h3>
          <div className="flex items-center gap-2">
             <span className="text-[9px] text-content-tertiary font-bold uppercase tracking-widest opacity-80">
              EP {number || '?'}
            </span>
            {completed && !isCurrentEpisode && (
              <div className="w-3 h-3 bg-accent/20 rounded-full flex items-center justify-center">
                <svg className="w-2 h-2 text-accent" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              </div>
            )}
          </div>
        </div>
      </article>
    </a>
  )
}
