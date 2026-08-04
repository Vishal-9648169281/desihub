import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { Paginated } from '@/types'

interface AdminUser {
  id: number
  username: string
  email: string
  role: string
}

export default function Team() {
  const [team, setTeam] = useState<AdminUser[]>([])
  const [promoteUsername, setPromoteUsername] = useState('')
  const [error, setError] = useState('')

  function load() {
    api.get<Paginated<AdminUser> | AdminUser[]>('/admin/users/', { params: { page_size: 200 } }).then((res) => {
      const all = Array.isArray(res.data) ? res.data : res.data.results
      setTeam(all.filter((u) => u.role !== 'USER'))
    })
  }

  useEffect(load, [])

  async function promote(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const all = await api.get<Paginated<AdminUser> | AdminUser[]>('/admin/users/', { params: { page_size: 200 } })
    const list = Array.isArray(all.data) ? all.data : all.data.results
    const target = list.find((u) => u.username === promoteUsername)
    if (!target) {
      setError('No user found with that username.')
      return
    }
    await api.patch(`/admin/users/${target.id}/`, { role: 'CONTENT_MANAGER' })
    setPromoteUsername('')
    load()
  }

  async function demote(id: number) {
    await api.patch(`/admin/users/${id}/`, { role: 'USER' })
    load()
  }

  return (
    <div className="space-y-5">
      <form onSubmit={promote} className="flex flex-wrap items-end gap-3 rounded-xl border border-line bg-ink-soft p-5">
        <div>
          <label className="mb-1 block text-xs text-mist">Promote user to Content Manager</label>
          <input
            value={promoteUsername}
            onChange={(e) => setPromoteUsername(e.target.value)}
            placeholder="username"
            className="w-56 rounded-lg border border-line bg-ink px-3 py-2 text-sm text-white outline-none focus:border-marigold"
          />
        </div>
        <button className="rounded-lg brand-gradient-bg px-4 py-2 text-xs font-bold text-black">Add to Team</button>
        {error && <p className="text-xs text-crimson">{error}</p>}
      </form>

      <div className="overflow-x-auto rounded-xl border border-line">
        <table className="w-full text-left text-sm">
          <thead className="bg-ink-soft text-xs uppercase text-mist">
            <tr>
              <th className="px-4 py-3">Username</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {team.map((u) => (
              <tr key={u.id} className="border-t border-line bg-ink">
                <td className="px-4 py-3 text-white/90">{u.username}</td>
                <td className="px-4 py-3 text-mist">{u.email}</td>
                <td className="px-4 py-3">
                  <span className="rounded bg-marigold/15 px-2 py-0.5 text-[10px] font-semibold text-marigold">
                    {u.role.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {u.role !== 'SUPER_ADMIN' && (
                    <button onClick={() => demote(u.id)} className="text-xs font-semibold text-crimson hover:underline">
                      Remove
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
