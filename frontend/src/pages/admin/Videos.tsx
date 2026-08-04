import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/lib/api'
import type { AdminVideo, Paginated } from '@/types'
import { formatDuration } from '@/lib/format'

const STATUS_COLORS: Record<string, string> = {
  PUBLISHED: 'bg-emerald-500/15 text-emerald-400',
  READY: 'bg-blue-500/15 text-blue-400',
  PROCESSING: 'bg-amber-500/15 text-amber-400',
  UPLOADING: 'bg-mist/15 text-mist',
  FAILED: 'bg-red-500/15 text-red-400',
}

export default function AdminVideos() {
  const [videos, setVideos] = useState<AdminVideo[]>([])
  const [loading, setLoading] = useState(true)

  function load() {
    setLoading(true)
    api
      .get<Paginated<AdminVideo> | AdminVideo[]>('/admin/videos/', { params: { page_size: 100 } })
      .then((res) => setVideos(Array.isArray(res.data) ? res.data : res.data.results))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  async function publish(id: number) {
    await api.post(`/admin/videos/${id}/publish/`)
    load()
  }

  async function unpublish(id: number) {
    await api.post(`/admin/videos/${id}/unpublish/`)
    load()
  }

  async function remove(id: number) {
    if (!confirm('Delete this video permanently?')) return
    await api.delete(`/admin/videos/${id}/`)
    load()
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-white">Videos ({videos.length})</h1>
        <Link to="/admin-dashboard/videos/upload" className="rounded-lg brand-gradient-bg px-4 py-2 text-xs font-bold text-black">
          + Upload Video
        </Link>
      </div>

      {loading ? (
        <p className="text-mist">Loading…</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="w-full text-left text-sm">
            <thead className="bg-ink-soft text-xs uppercase text-mist">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Views</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {videos.map((v) => (
                <tr key={v.id} className="border-t border-line bg-ink">
                  <td className="max-w-[220px] truncate px-4 py-3 text-white/90">{v.title}</td>
                  <td className="px-4 py-3 text-mist">{v.category_name || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded px-2 py-0.5 text-[10px] font-semibold ${STATUS_COLORS[v.status] || ''}`}>{v.status}</span>
                  </td>
                  <td className="px-4 py-3 text-mist">{formatDuration(v.duration_seconds)}</td>
                  <td className="px-4 py-3 text-mist">{v.view_count.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {v.status === 'PUBLISHED' ? (
                        <button onClick={() => unpublish(v.id)} className="text-xs font-semibold text-amber-400 hover:underline">
                          Unpublish
                        </button>
                      ) : (
                        <button onClick={() => publish(v.id)} className="text-xs font-semibold text-emerald-400 hover:underline">
                          Publish
                        </button>
                      )}
                      <button onClick={() => remove(v.id)} className="text-xs font-semibold text-crimson hover:underline">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {videos.length === 0 && <p className="p-6 text-center text-mist">No videos yet. Upload your first one.</p>}
        </div>
      )}
    </div>
  )
}
