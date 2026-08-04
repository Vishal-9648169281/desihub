import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import VideoPlayer from '@/components/VideoPlayer'
import Carousel from '@/components/Carousel'
import { getRelated, getVideoBySlug } from '@/lib/videos'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import type { VideoCard, VideoDetail } from '@/types'
import { formatDuration } from '@/lib/format'

const FALLBACK_SRC = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'

export default function Watch() {
  const { slug } = useParams<{ slug: string }>()
  const { user } = useAuth()
  const [video, setVideo] = useState<VideoDetail | null>(null)
  const [related, setRelated] = useState<VideoCard[]>([])
  const [resumeAt, setResumeAt] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    getVideoBySlug(slug)
      .then((v) => {
        setVideo(v)
        getRelated(slug).then(setRelated)
        api
          .post('/views/', { video_id: v.id, watch_seconds: 0, completed: false })
          .catch(() => {})
        if (user) {
          api
            .get(`/progress/${v.id}/`)
            .then((res) => {
              if (res.data?.position_seconds) setResumeAt(res.data.position_seconds)
            })
            .catch(() => {})
        }
      })
      .finally(() => setLoading(false))
  }, [slug, user])

  const handleProgress = useCallback(
    (position: number, duration: number) => {
      if (!video || !user) return
      api.post('/progress/', { video_id: video.id, position_seconds: position, duration_seconds: duration }).catch(() => {})
    },
    [video, user],
  )

  async function toggleFavorite() {
    if (!video || !user) return
    if (isFavorite) {
      await api.delete(`/favorites/video/${video.id}/`)
      setIsFavorite(false)
    } else {
      await api.post('/favorites/', { video_id: video.id })
      setIsFavorite(true)
    }
  }

  if (loading) {
    return <div className="grid h-screen place-items-center text-mist">Loading…</div>
  }

  if (!video) {
    return <div className="grid h-screen place-items-center text-mist">Video not found.</div>
  }

  return (
    <div>
      <VideoPlayer
        src={video.video_url || FALLBACK_SRC}
        poster={video.thumbnail_url}
        startAt={resumeAt}
        onProgress={handleProgress}
      />

      <div className="px-4 py-5 sm:px-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-white sm:text-2xl">{video.title}</h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-mist sm:text-sm">
              {video.category && <span>{video.category.name}</span>}
              <span>&middot;</span>
              <span>{formatDuration(video.duration_seconds)}</span>
              <span>&middot;</span>
              <span>{video.view_count.toLocaleString()} views</span>
              <span>&middot;</span>
              <span className="rounded border border-white/20 px-1.5 py-0.5 text-[10px]">{video.content_rating}</span>
            </div>
          </div>

          {user && (
            <button
              onClick={toggleFavorite}
              className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-semibold sm:text-sm ${
                isFavorite ? 'border-marigold text-marigold' : 'border-white/25 text-white/80 hover:border-white/50'
              }`}
            >
              {isFavorite ? '✓ In My List' : '+ My List'}
            </button>
          )}
        </div>

        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/80">{video.description}</p>

        {video.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {video.tags.map((t) => (
              <span key={t.id} className="rounded-full bg-ink-card px-2.5 py-1 text-[11px] text-mist">
                #{t.name}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-2">
        <Carousel title="Related Videos" videos={related} />
      </div>
    </div>
  )
}
