import { useEffect, useState } from 'react'
import VideoCard from '@/components/VideoCard'
import { api } from '@/lib/api'
import type { Favorite } from '@/types'

export default function MyList() {
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get<{ results?: Favorite[] } | Favorite[]>('/favorites/')
      .then((res) => setFavorites(Array.isArray(res.data) ? res.data : res.data.results || []))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="grid h-[60vh] place-items-center text-mist">Loading…</div>

  return (
    <div className="px-4 py-6 sm:px-8">
      <h1 className="mb-5 text-xl font-bold text-white sm:text-2xl">My List</h1>
      {favorites.length === 0 ? (
        <p className="text-mist">You haven't added anything yet. Tap "+ My List" on a video to save it here.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {favorites.map((f) => (
            <VideoCard key={f.id} video={f.video} layout="grid" />
          ))}
        </div>
      )}
    </div>
  )
}
