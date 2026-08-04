import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import VideoCard from '@/components/VideoCard'
import { getByCategory } from '@/lib/videos'
import type { VideoCard as VideoCardType } from '@/types'

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>()
  const [videos, setVideos] = useState<VideoCardType[]>([])

  useEffect(() => {
    if (slug) getByCategory(slug).then(setVideos)
  }, [slug])

  return (
    <div className="px-4 py-6 sm:px-8">
      <h1 className="mb-5 text-xl font-bold capitalize text-white sm:text-2xl">{slug?.replace(/-/g, ' ')}</h1>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {videos.map((v) => (
          <VideoCard key={v.id} video={v} layout="grid" />
        ))}
      </div>
      {videos.length === 0 && <p className="text-mist">No videos in this category yet.</p>}
    </div>
  )
}
