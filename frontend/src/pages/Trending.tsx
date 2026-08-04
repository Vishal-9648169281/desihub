import { useEffect, useState } from 'react'
import VideoCard from '@/components/VideoCard'
import { getTrending } from '@/lib/videos'
import type { VideoCard as VideoCardType } from '@/types'

export default function Trending() {
  const [videos, setVideos] = useState<VideoCardType[]>([])

  useEffect(() => {
    getTrending().then(setVideos)
  }, [])

  return (
    <div className="px-4 py-6 sm:px-8">
      <h1 className="mb-5 text-xl font-bold text-white sm:text-2xl">🔥 Trending Now</h1>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {videos.map((v) => (
          <VideoCard key={v.id} video={v} layout="grid" />
        ))}
      </div>
    </div>
  )
}
