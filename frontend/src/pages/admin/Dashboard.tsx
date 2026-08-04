import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/lib/api'
import type { DashboardStats } from '@/types'

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-line bg-ink-soft p-4">
      <p className="text-xs text-mist">{label}</p>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)

  useEffect(() => {
    api.get<DashboardStats>('/admin/dashboard/stats/').then((res) => setStats(res.data))
  }, [])

  if (!stats) return <div className="text-mist">Loading dashboard…</div>

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Total Videos" value={stats.total_videos} />
        <StatCard label="Published" value={stats.published_videos} />
        <StatCard label="Drafts" value={stats.draft_videos} />
        <StatCard label="Total Users" value={stats.total_users} />
        <StatCard label="Total Views" value={stats.total_views.toLocaleString()} />
        <StatCard label="Watch Time (hrs)" value={stats.total_watch_time_hours} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-line bg-ink-soft p-4">
          <h2 className="mb-3 text-sm font-semibold text-white">Most Watched</h2>
          <ul className="space-y-2">
            {stats.most_watched.map((v) => (
              <li key={v.id} className="flex items-center justify-between text-sm">
                <Link to={`/admin-dashboard/videos`} className="truncate text-white/85 hover:text-marigold">
                  {v.title}
                </Link>
                <span className="text-mist">{v.view_count.toLocaleString()} views</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-line bg-ink-soft p-4">
          <h2 className="mb-3 text-sm font-semibold text-white">Recent Uploads</h2>
          <ul className="space-y-2">
            {stats.recent_uploads.map((v) => (
              <li key={v.id} className="flex items-center justify-between text-sm">
                <span className="truncate text-white/85">{v.title}</span>
                <span className="rounded bg-ink-card px-1.5 py-0.5 text-[10px] text-mist">{v.status}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-xl border border-line bg-ink-soft p-4">
        <h2 className="mb-3 text-sm font-semibold text-white">Recently Registered Users</h2>
        <ul className="space-y-2">
          {stats.recent_users.map((u) => (
            <li key={u.id} className="flex items-center justify-between text-sm">
              <span className="text-white/85">{u.username}</span>
              <span className="text-mist">{u.email}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
