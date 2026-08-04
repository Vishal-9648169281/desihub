import { useEffect, useState } from 'react'
import Hero from '@/components/Hero'
import Carousel from '@/components/Carousel'
import { getByCategory, getCategories, getFeatured, getRecommended, getTrending, DEMO_VIDEOS } from '@/lib/videos'
import type { VideoCard, VideoDetail } from '@/types'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'
import type { WatchProgress } from '@/types'

const ROW_NAMES = ['Latest Uploads', 'Popular on Desi Hub', 'Comedy', 'Entertainment', 'Short Films', 'Music', 'Vlogs', 'Web Series']

export default function Home() {
  const { user } = useAuth()
  const [featured, setFeatured] = useState<VideoDetail | null>(null)
  const [trending, setTrending] = useState<VideoCard[]>([])
  const [recommended, setRecommended] = useState<VideoCard[]>([])
  const [continueWatching, setContinueWatching] = useState<WatchProgress[]>([])
  const [rows, setRows] = useState<Record<string, VideoCard[]>>({})

  useEffect(() => {
    getFeatured().then(setFeatured)
    getTrending().then(setTrending)
    getRecommended().then(setRecommended)

    getCategories().then((categories) => {
      const nameToSlug = new Map(categories.map((c) => [c.name, c.slug]))
      const rowsToLoad = ROW_NAMES.filter((r) => nameToSlug.has(r))

      Promise.all(rowsToLoad.map((r) => getByCategory(nameToSlug.get(r)!))).then((results) => {
        const map: Record<string, VideoCard[]> = {}
        rowsToLoad.forEach((r, i) => {
          if (results[i].length) map[r] = results[i]
        })
        if (Object.keys(map).length === 0) {
          map['Popular on Desi Hub'] = DEMO_VIDEOS
        }
        setRows(map)
      })
    })
  }, [])

  useEffect(() => {
    if (!user) {
      setContinueWatching([])
      return
    }
    api
      .get<WatchProgress[]>('/continue-watching/')
      .then((res) => setContinueWatching(res.data))
      .catch(() => setContinueWatching([]))
  }, [user])

  return (
    <div>
      <Hero video={featured} />

      <div className="-mt-16 space-y-6 sm:-mt-24 sm:space-y-8">
        {continueWatching.length > 0 && (
          <Carousel title="Continue Watching" videos={continueWatching.map((p) => p.video)} />
        )}
        <Carousel title="Trending Now" videos={trending} />
        <Carousel title="Recommended For You" videos={recommended} />
        {Object.entries(rows).map(([title, videos]) => (
          <Carousel key={title} title={title} videos={videos} />
        ))}
      </div>
    </div>
  )
}
