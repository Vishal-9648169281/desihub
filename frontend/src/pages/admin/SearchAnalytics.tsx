import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

interface QueryCount {
  query: string
  count: number
}

export default function SearchAnalytics() {
  const [topQueries, setTopQueries] = useState<QueryCount[]>([])
  const [zeroResult, setZeroResult] = useState<QueryCount[]>([])

  useEffect(() => {
    api.get('/admin/analytics/search/').then((res) => {
      setTopQueries(res.data.top_queries)
      setZeroResult(res.data.zero_result_queries)
    })
  }, [])

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="rounded-xl border border-line bg-ink-soft p-5">
        <h2 className="mb-3 text-sm font-semibold text-white">Top Searches</h2>
        <div className="space-y-2">
          {topQueries.map((q) => (
            <div key={q.query} className="flex items-center justify-between text-sm">
              <span className="text-white/85">{q.query || '(empty)'}</span>
              <span className="text-mist">{q.count}</span>
            </div>
          ))}
          {topQueries.length === 0 && <p className="text-mist">No search data yet.</p>}
        </div>
      </div>

      <div className="rounded-xl border border-line bg-ink-soft p-5">
        <h2 className="mb-3 text-sm font-semibold text-white">Zero-Result Searches</h2>
        <p className="mb-2 text-xs text-mist">These queries found nothing — good candidates for new content or tags.</p>
        <div className="space-y-2">
          {zeroResult.map((q) => (
            <div key={q.query} className="flex items-center justify-between text-sm">
              <span className="text-white/85">{q.query}</span>
              <span className="text-crimson">{q.count}</span>
            </div>
          ))}
          {zeroResult.length === 0 && <p className="text-mist">None yet.</p>}
        </div>
      </div>
    </div>
  )
}
