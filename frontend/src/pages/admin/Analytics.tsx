import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { DashboardStats } from '@/types'
import { formatDuration } from '@/lib/format'

export default function Analytics() {
  const [stats, setStats] = useState<DashboardStats | null>(null)

  useEffect(() => {
    api.get<DashboardStats>('/admin/dashboard/stats/').then((res) => setStats(res.data))
  }, [])

  if (!stats) return <p className="text-mist">Loading analytics…</p>

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-line bg-ink-soft p-4">
          <p className="text-xs text-mist">Total Views</p>
          <p className="mt-1 text-2xl font-bold text-white">{stats.total_views.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-line bg-ink-soft p-4">
          <p className="text-xs text-mist">Total Watch Time</p>
          <p className="mt-1 text-2xl font-bold text-white">{stats.total_watch_time_hours}h</p>
        </div>
        <div className="rounded-xl border border-line bg-ink-soft p-4">
          <p className="text-xs text-mist">Published Videos</p>
          <p className="mt-1 text-2xl font-bold text-white">{stats.published_videos}</p>
        </div>
        <div className="rounded-xl border border-line bg-ink-soft p-4">
          <p className="text-xs text-mist">Total Users</p>
          <p className="mt-1 text-2xl font-bold text-white">{stats.total_users}</p>
        </div>
      </div>

      <div className="rounded-xl border border-line bg-ink-soft p-5">
        <h2 className="mb-3 text-sm font-semibold text-white">Most Watched Videos</h2>
        <div className="space-y-2">
          {stats.most_watched.map((v, i) => (
            <div key={v.id} className="flex items-center gap-3">
              <span className="w-5 text-xs text-mist">#{i + 1}</span>
              <div className="flex-1">
                <p className="text-sm text-white/90">{v.title}</p>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-ink-card">
                  <div
                    className="h-full brand-gradient-bg"
                    style={{ width: `${Math.min(100, (v.view_count / (stats.most_watched[0]?.view_count || 1)) * 100)}%` }}
                  />
                </div>
              </div>
              <span className="text-xs text-mist">{v.view_count.toLocaleString()}</span>
              <span className="text-xs text-mist">{formatDuration(v.duration_seconds)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
