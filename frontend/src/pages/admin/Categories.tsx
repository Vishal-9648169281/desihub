import { useEffect, useState, type FormEvent } from 'react'
import { api } from '@/lib/api'
import type { Category } from '@/types'

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  function load() {
    api.get<Category[] | { results: Category[] }>('/categories/', { params: { page_size: 100 } }).then((res) =>
      setCategories(Array.isArray(res.data) ? res.data : res.data.results),
    )
  }

  useEffect(load, [])

  async function onCreate(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    await api.post('/categories/', { name, description })
    setName('')
    setDescription('')
    load()
  }

  async function onDelete(id: number) {
    if (!confirm('Delete this category?')) return
    await api.delete(`/categories/${id}/`)
    load()
  }

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <form onSubmit={onCreate} className="space-y-3 rounded-xl border border-line bg-ink-soft p-5 lg:col-span-1">
        <h2 className="text-sm font-semibold text-white">New Category</h2>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          required
          className="w-full rounded-lg border border-line bg-ink px-3 py-2 text-sm text-white outline-none focus:border-marigold"
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="w-full rounded-lg border border-line bg-ink px-3 py-2 text-sm text-white outline-none focus:border-marigold"
        />
        <button className="rounded-lg brand-gradient-bg px-4 py-2 text-xs font-bold text-black">Add Category</button>
      </form>

      <div className="rounded-xl border border-line bg-ink-soft lg:col-span-2">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase text-mist">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-t border-line">
                <td className="px-4 py-3 text-white/90">{c.name}</td>
                <td className="px-4 py-3 text-mist">{c.slug}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => onDelete(c.id)} className="text-xs font-semibold text-crimson hover:underline">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
