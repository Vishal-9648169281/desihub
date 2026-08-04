import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import type { Category } from '@/types'
import { getCategories } from '@/lib/videos'

export default function Upload() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState<Category[]>([])
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    language: 'Hindi',
    release_date: '',
    content_rating: 'ALL',
    visibility: 'PRIVATE',
  })
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [posterFile, setPosterFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getCategories().then(setCategories)
  }, [])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (!videoFile) {
      setError('Please select a video file.')
      return
    }

    const data = new FormData()
    Object.entries(form).forEach(([k, v]) => v && data.append(k, v))
    data.append('original_file', videoFile)
    if (posterFile) data.append('poster', posterFile)

    try {
      setUploadProgress(0)
      await api.post('/admin/videos/', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (evt) => {
          if (evt.total) setUploadProgress(Math.round((evt.loaded / evt.total) * 100))
        },
      })
      navigate('/admin-dashboard/videos')
    } catch {
      setError('Upload failed. Check the file size/type and try again.')
      setUploadProgress(null)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-5 text-lg font-bold text-white">Upload Video</h1>

      <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-line bg-ink-soft p-5">
        <div>
          <label className="mb-1 block text-xs text-mist">Title</label>
          <input
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full rounded-lg border border-line bg-ink px-3 py-2 text-sm text-white outline-none focus:border-marigold"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-mist">Description</label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full rounded-lg border border-line bg-ink px-3 py-2 text-sm text-white outline-none focus:border-marigold"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs text-mist">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full rounded-lg border border-line bg-ink px-3 py-2 text-sm text-white"
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-mist">Language</label>
            <input
              value={form.language}
              onChange={(e) => setForm({ ...form, language: e.target.value })}
              className="w-full rounded-lg border border-line bg-ink px-3 py-2 text-sm text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="mb-1 block text-xs text-mist">Release Date</label>
            <input
              type="date"
              value={form.release_date}
              onChange={(e) => setForm({ ...form, release_date: e.target.value })}
              className="w-full rounded-lg border border-line bg-ink px-3 py-2 text-sm text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-mist">Rating</label>
            <select
              value={form.content_rating}
              onChange={(e) => setForm({ ...form, content_rating: e.target.value })}
              className="w-full rounded-lg border border-line bg-ink px-3 py-2 text-sm text-white"
            >
              {['ALL', '13+', '16+', '18+'].map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-mist">Visibility</label>
            <select
              value={form.visibility}
              onChange={(e) => setForm({ ...form, visibility: e.target.value })}
              className="w-full rounded-lg border border-line bg-ink px-3 py-2 text-sm text-white"
            >
              {['PRIVATE', 'UNLISTED', 'PUBLIC'].map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs text-mist">Video File (mp4, mov, mkv, webm)</label>
          <input
            type="file"
            accept="video/*"
            required
            onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
            className="w-full rounded-lg border border-line bg-ink px-3 py-2 text-sm text-white file:mr-3 file:rounded file:border-0 file:bg-marigold/20 file:px-3 file:py-1 file:text-marigold"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-mist">Custom Thumbnail (optional — auto-generated otherwise)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPosterFile(e.target.files?.[0] || null)}
            className="w-full rounded-lg border border-line bg-ink px-3 py-2 text-sm text-white file:mr-3 file:rounded file:border-0 file:bg-marigold/20 file:px-3 file:py-1 file:text-marigold"
          />
        </div>

        {error && <p className="text-sm text-crimson">{error}</p>}

        {uploadProgress !== null && (
          <div className="h-2 w-full overflow-hidden rounded-full bg-ink-card">
            <div className="h-full brand-gradient-bg transition-all" style={{ width: `${uploadProgress}%` }} />
          </div>
        )}

        <button
          type="submit"
          disabled={uploadProgress !== null && uploadProgress < 100}
          className="w-full rounded-lg brand-gradient-bg py-2.5 text-sm font-bold text-black disabled:opacity-60"
        >
          {uploadProgress !== null ? `Uploading… ${uploadProgress}%` : 'Upload Video'}
        </button>
        <p className="text-center text-[11px] text-mist">
          After upload, thumbnails are generated automatically in the background (FFmpeg). Publish once status shows "Ready".
        </p>
      </form>
    </div>
  )
}
