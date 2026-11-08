import Image from 'next/image'
import SmartButtons from './SmartButtons'
import { MyListButton } from './MyListButton'

function getPosterSize(url?: string | null): { w: number; h: number } {
  const fallbackW = 342;
  const wMatch = url?.match(/\/w(\d+)\//);
  const w = wMatch ? Math.max(120, Number(wMatch[1])) : fallbackW;
  // TMDB posters are 2:3 ratio typically
  const h = Math.round(w * 1.5);
  return { w, h };
}

export default function DetailsHeader({
  poster,
  title,
  genres = [],
  year,
  totalEpisodes,
  duration,
  languages = [],
  studio,
  status,
  rating,
  smartButtons,
}: {
  poster?: string | null
  title: string
  genres?: string[]
  year?: number | null
  totalEpisodes?: number | null
  duration?: string | null
  languages?: string[]
  studio?: string | null
  status?: string | null
  rating?: number | null
  smartButtons?: { url: string; actionText: string; episodeText: string; buttonClass: string }[]
}) {
  return (
    <section className="relative w-full -mt-16 overflow-hidden bg-bg-base font-sans">
      {/* Background Hero Image */}
      <div className="absolute inset-0 h-[600px]">
        {poster ? (
          <div className="relative w-full h-full">
            <Image 
              unoptimized 
              src={poster} 
              alt="" 
              fill 
              sizes="100vw" 
              className="object-cover opacity-30" 
            />
            {/* Top-to-bottom dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-bg-base via-transparent to-bg-base"></div>
          </div>
        ) : (
          <div className="w-full h-full bg-bg-surface opacity-10"></div>
        )}
      </div>

      <div className="relative max-w-[1280px] mx-auto px-5 md:px-12 pt-32 pb-12">
        <div className="grid gap-8 md:grid-cols-[240px_1fr] items-end">
          {/* Poster - Modern 2:3 Float */}
          <div className="hidden md:block">
            {poster ? (
              <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden border border-border-subtle shadow-2xl">
                <Image
                  unoptimized
                  src={poster}
                  alt={title}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="aspect-[2/3] w-full bg-bg-surface border border-border-subtle rounded-2xl flex items-center justify-center text-content-tertiary">No Poster</div>
            )}
          </div>

          {/* Main Info */}
          <div className="space-y-6">
            <div className="space-y-3">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-medium text-white tracking-tight leading-tight">
                {title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-3">
                {rating && (
                  <span className="badge badge-accent font-bold">★ {rating.toFixed(1)}</span>
                )}
                {year && <span className="badge badge-outline">{year}</span>}
                {totalEpisodes && <span className="badge badge-outline">{totalEpisodes} Episodes</span>}
                {status && <span className="badge badge-outline">{status}</span>}
                <span className="badge badge-outline">HD</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              {smartButtons && smartButtons.length > 0 && (
                <a href={smartButtons[0].url} className="btn-primary min-w-[160px] h-12 flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  <span>Watch Now</span>
                </a>
              )}
              
              <MyListButton
                animeId={title.toLowerCase().replace(/[^a-z0-9]/g, '-')}
                animeTitle={title}
                animePoster={poster || undefined}
                animeUrl={`/title/${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
              />
            </div>

            {/* Meta Details Row */}
            <div className="flex flex-wrap gap-x-8 gap-y-3 pt-4 border-t border-border-subtle/30 text-sm">
              {studio && (
                <div className="flex flex-col">
                  <span className="text-content-tertiary text-[11px] uppercase tracking-wider font-bold">Studio</span>
                  <span className="text-content-primary font-medium">{studio}</span>
                </div>
              )}
              {genres.length > 0 && (
                <div className="flex flex-col">
                  <span className="text-content-tertiary text-[11px] uppercase tracking-wider font-bold">Genre</span>
                  <span className="text-content-primary font-medium">{genres.slice(0, 3).join(', ')}</span>
                </div>
              )}
              {languages.length > 0 && (
                <div className="flex flex-col">
                  <span className="text-content-tertiary text-[11px] uppercase tracking-wider font-bold">Language</span>
                  <span className="text-content-primary font-medium uppercase">{languages.join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}


