import { Link } from 'react-router-dom'
import type { VideoDetail } from '@/types'
import { formatDuration, gradientForTitle } from '@/lib/format'

export default function Hero({ video }: { video: VideoDetail | null }) {
  if (!video) {
    return (
      <div className="flex h-[62vh] min-h-[380px] items-center justify-center bg-ink-soft sm:h-[78vh]">
        <div className="text-center">
          <p className="brand-gradient-text text-3xl font-black">DESI HUB</p>
          <p className="mt-2 text-sm text-mist">Loading featured content…</p>
        </div>
      </div>
    )
  }

  const year = video.release_date ? new Date(video.release_date).getFullYear() : null

  return (
    <div className="relative h-[62vh] min-h-[420px] w-full overflow-hidden sm:h-[82vh]">
      {video.thumbnail_url ? (
        <img src={video.thumbnail_url} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${gradientForTitle(video.title)}`} />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/20 to-transparent sm:from-ink/80" />

      <div className="absolute bottom-24 left-0 w-full px-4 sm:bottom-28 sm:px-8 lg:w-[55%]">
        <span className="mb-3 inline-block rounded bg-marigold/20 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-marigold">
          {video.category?.name ?? 'Featured'}
        </span>
        <h1 className="text-3xl font-black leading-tight text-white drop-shadow-lg sm:text-5xl">{video.title}</h1>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-white/80 sm:text-sm">
          {year && <span>{year}</span>}
          <span>&middot;</span>
          <span>{formatDuration(video.duration_seconds)}</span>
          <span>&middot;</span>
          <span className="rounded border border-white/30 px-1.5 py-0.5 text-[10px]">{video.content_rating}</span>
        </div>

        <p className="mt-3 line-clamp-2 max-w-xl text-sm text-white/80 sm:line-clamp-3 sm:text-base">
          {video.description}
        </p>

        <div className="mt-5 flex gap-3">
          <Link
            to={`/watch/${video.slug}`}
            className="flex items-center gap-2 rounded-md bg-white px-5 py-2.5 text-sm font-bold text-black transition hover:bg-white/85 sm:px-6 sm:py-3"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 sm:h-5 sm:w-5"><path d="M8 5v14l11-7z" /></svg>
            Play
          </Link>
          <Link
            to={`/watch/${video.slug}`}
            className="flex items-center gap-2 rounded-md bg-white/15 px-5 py-2.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/25 sm:px-6 sm:py-3"
          >
            More Info
          </Link>
        </div>
      </div>
    </div>
  )
}
