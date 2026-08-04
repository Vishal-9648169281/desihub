import { useRef } from 'react'
import type { VideoCard as VideoCardType } from '@/types'
import VideoCard from './VideoCard'

export default function Carousel({ title, videos }: { title: string; videos: VideoCardType[] }) {
  const trackRef = useRef<HTMLDivElement>(null)

  function scrollBy(dir: 1 | -1) {
    trackRef.current?.scrollBy({ left: dir * trackRef.current.clientWidth * 0.9, behavior: 'smooth' })
  }

  if (!videos.length) return null

  return (
    <section className="relative py-1">
      <div className="mb-2 flex items-center justify-between px-4 sm:px-8">
        <h2 className="text-base font-semibold text-white sm:text-lg">{title}</h2>
      </div>

      <div className="group/row relative">
        <button
          aria-label="Scroll left"
          onClick={() => scrollBy(-1)}
          className="absolute left-0 top-0 z-10 hidden h-full w-10 items-center justify-center bg-gradient-to-r from-ink to-transparent text-white opacity-0 transition-opacity group-hover/row:opacity-100 sm:flex"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6"><path d="M15 18l-6-6 6-6v12z" /></svg>
        </button>

        <div
          ref={trackRef}
          className="no-scrollbar flex snap-x snap-mandatory gap-2.5 overflow-x-auto scroll-smooth px-4 pb-1 sm:gap-3 sm:px-8"
        >
          {videos.map((v) => (
            <VideoCard key={v.id} video={v} />
          ))}
        </div>

        <button
          aria-label="Scroll right"
          onClick={() => scrollBy(1)}
          className="absolute right-0 top-0 z-10 hidden h-full w-10 items-center justify-center bg-gradient-to-l from-ink to-transparent text-white opacity-0 transition-opacity group-hover/row:opacity-100 sm:flex"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6"><path d="M9 6l6 6-6 6V6z" /></svg>
        </button>
      </div>
    </section>
  )
}
