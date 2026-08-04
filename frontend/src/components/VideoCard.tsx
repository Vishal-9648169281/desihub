import { Link } from 'react-router-dom'
import type { VideoCard as VideoCardType } from '@/types'
import { formatDuration, gradientForTitle } from '@/lib/format'

export default function VideoCard({ video, layout = 'carousel' }: { video: VideoCardType; layout?: 'carousel' | 'grid' }) {
  return (
    <Link
      to={`/watch/${video.slug}`}
      className={`group relative snap-start ${layout === 'carousel' ? 'w-[62vw] shrink-0 xs:w-[54vw] sm:w-[240px]' : 'w-full'}`}
    >
      <div className="relative aspect-video overflow-hidden rounded-lg bg-ink-card ring-1 ring-white/5 transition-transform duration-300 group-hover:scale-[1.04] group-hover:ring-marigold/40 sm:rounded-xl">
        {video.thumbnail_url ? (
          <img
            src={video.thumbnail_url}
            alt={video.title}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${gradientForTitle(video.title)} p-3 text-center`}>
            <span className="text-sm font-semibold text-white/90 line-clamp-3">{video.title}</span>
          </div>
        )}

        <div className="absolute bottom-1.5 right-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
          {formatDuration(video.duration_seconds)}
        </div>

        <div className="pointer-events-none absolute inset-0 hidden items-center justify-center bg-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100 sm:flex">
          <div className="grid h-11 w-11 place-items-center rounded-full bg-white/90 text-ink">
            <svg viewBox="0 0 24 24" fill="currentColor" className="ml-0.5 h-5 w-5">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>
      <div className="mt-1.5 px-0.5">
        <p className="truncate text-[13px] font-medium text-white/90 sm:text-sm">{video.title}</p>
        <p className="truncate text-[11px] text-mist">{video.category_name ?? 'Desi Hub'}</p>
      </div>
    </Link>
  )
}
