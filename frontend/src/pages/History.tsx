import { useEffect, useState } from 'react'
import VideoCard from '@/components/VideoCard'
import { api } from '@/lib/api'
import type { WatchHistoryEntry } from '@/types'

export default function History() {
  const [history, setHistory] = useState<WatchHistoryEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get<WatchHistoryEntry[]>('/history/')
      .then((res) => setHistory(res.data))
      .finally(() => setLoading(false))
  }, [])

  async function clearAll() {
    await api.delete('/history/')
    setHistory([])
  }

  if (loading) return <div className="grid h-[60vh] place-items-center text-mist">Loading…</div>

  return (
    <div className="px-4 py-6 sm:px-8">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-xl font-bold text-white sm:text-2xl">Watch History</h1>
        {history.length > 0 && (
          <button onClick={clearAll} className="text-xs font-semibold text-crimson hover:underline">
            Clear all
          </button>
        )}
      </div>
      {history.length === 0 ? (
        <p className="text-mist">Nothing watched yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {history.map((h) => (
            <VideoCard key={h.id} video={h.video} layout="grid" />
          ))}
        </div>
      )}
    </div>
  )
}
