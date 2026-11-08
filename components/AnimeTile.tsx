import Image from 'next/image'
import AnimeLink from '@/components/AnimeLink'

type Props = {
  url: string
  title: string | null
  image?: string | null
  postId?: number
  priority?: boolean
}

export default function AnimeTile({ url, title, image, postId, priority }: Props) {
  return (
    <AnimeLink seriesUrl={url} postId={postId} className="group relative snap-start shrink-0 w-40 sm:w-44 md:w-48">
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-surface border border-stroke shadow-sm">
        {image ? (
          <Image
            priority={priority}
            unoptimized
            src={image.startsWith('data:') ? image : `/api/image?src=${encodeURIComponent(image)}`}
            alt={title || 'Anime'}
            fill
            sizes="(max-width: 640px) 160px, 192px"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.06]"
          />
        ) : (
          <div className="h-full w-full grid place-items-center text-xs text-text-dim">No Image</div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="pointer-events-none absolute bottom-0 inset-x-0 p-2">
          <div className="text-[11px] font-medium text-text-high line-clamp-2 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">{title || 'Untitled'}</div>
        </div>
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition">
          <span className="rounded-full bg-primary text-[10px] px-2 py-1">Play</span>
        </div>
      </div>
    </AnimeLink>
  )
}


