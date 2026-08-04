import { useEffect, useState } from 'react'
import VideoCard from '@/components/VideoCard'
import { api } from '@/lib/api'
import { DEMO_VIDEOS } from '@/lib/videos'
import type { Paginated, VideoCard as VideoCardType } from '@/types'

export default function Latest() {
  const [videos, setVideos] = useState<VideoCardType[]>([])

  useEffect(() => {
    api
      .get<Paginated<VideoCardType>>('/videos/', { params: { ordering: '-created_at', page_size: 40 } })
      .then((res) => setVideos(res.data.results.length ? res.data.results : DEMO_VIDEOS))
      .catch(() => setVideos(DEMO_VIDEOS))
  }, [])

  return (
    <div className="px-4 py-6 sm:px-8">
      <h1 className="mb-5 text-xl font-bold text-white sm:text-2xl">Latest Uploads</h1>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {videos.map((v) => (
          <VideoCard key={v.id} video={v} layout="grid" />
        ))}
      </div>
    </div>
  )
}
