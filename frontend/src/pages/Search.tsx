import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import VideoCard from '@/components/VideoCard'
import { getSearchSuggestions, searchVideos } from '@/lib/videos'
import type { VideoCard as VideoCardType } from '@/types'

const SORTS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'popularity', label: 'Popularity' },
]

export default function Search() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') || ''
  const sort = params.get('sort') || 'relevance'

  const [input, setInput] = useState(q)
  const [results, setResults] = useState<VideoCardType[]>([])
  const [count, setCount] = useState(0)
  const [suggestions, setSuggestions] = useState<{ recent: string[]; popular: string[]; titles: string[] }>({
    recent: [],
    popular: [],
    titles: [],
  })
  const [showSuggestions, setShowSuggestions] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)

  useEffect(() => {
    if (q) {
      searchVideos({ q, sort }).then((res) => {
        setResults(res.results)
        setCount(res.count)
      })
    } else {
      setResults([])
      setCount(0)
    }
  }, [q, sort])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      getSearchSuggestions(input).then(setSuggestions)
    }, 200)
  }, [input])

  function submitSearch(value: string) {
    setInput(value)
    setParams({ q: value, sort })
    setShowSuggestions(false)
  }

  return (
    <div className="min-h-screen px-4 py-4 sm:px-8">
      <div className="relative mx-auto max-w-2xl">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          onKeyDown={(e) => e.key === 'Enter' && submitSearch(input)}
          placeholder="Search titles, categories, tags…"
          className="w-full rounded-full border border-line bg-ink-card px-5 py-3 text-sm text-white outline-none focus:border-marigold"
          autoFocus
        />

        {showSuggestions && (suggestions.titles.length || suggestions.recent.length || suggestions.popular.length) > 0 && (
          <div className="absolute z-20 mt-2 w-full rounded-xl border border-line bg-ink-soft py-2 shadow-2xl">
            {suggestions.titles.map((t) => (
              <button key={t} onClick={() => submitSearch(t)} className="block w-full px-4 py-2 text-left text-sm text-white/90 hover:bg-white/5">
                {t}
              </button>
            ))}
            {suggestions.recent.length > 0 && (
              <div className="mt-1 border-t border-line px-4 py-1.5 text-[10px] uppercase tracking-wide text-mist">Recent</div>
            )}
            {suggestions.recent.map((t) => (
              <button key={t} onClick={() => submitSearch(t)} className="block w-full px-4 py-1.5 text-left text-sm text-mist hover:bg-white/5">
                {t}
              </button>
            ))}
          </div>
        )}
      </div>

      {q && (
        <div className="mx-auto mt-6 max-w-6xl">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-mist">{count} results for "{q}"</p>
            <select
              value={sort}
              onChange={(e) => setParams({ q, sort: e.target.value })}
              className="rounded-md border border-line bg-ink-card px-3 py-1.5 text-xs text-white"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {results.map((v) => (
              <VideoCard key={v.id} video={v} layout="grid" />
            ))}
          </div>

          {results.length === 0 && <p className="mt-10 text-center text-mist">No results found. Try a different search.</p>}
        </div>
      )}
    </div>
  )
}
