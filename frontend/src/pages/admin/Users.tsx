import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { Paginated } from '@/types'

interface AdminUser {
  id: number
  username: string
  email: string
  role: string
  is_active: boolean
  date_joined: string
}

const ROLES = ['USER', 'CONTENT_MANAGER', 'SUPER_ADMIN']

export default function Users() {
  const [users, setUsers] = useState<AdminUser[]>([])

  function load() {
    api
      .get<Paginated<AdminUser> | AdminUser[]>('/admin/users/', { params: { page_size: 100 } })
      .then((res) => setUsers(Array.isArray(res.data) ? res.data : res.data.results))
  }

  useEffect(load, [])

  async function updateRole(id: number, role: string) {
    await api.patch(`/admin/users/${id}/`, { role })
    load()
  }

  async function toggleActive(id: number, is_active: boolean) {
    await api.patch(`/admin/users/${id}/`, { is_active: !is_active })
    load()
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-line">
      <table className="w-full text-left text-sm">
        <thead className="bg-ink-soft text-xs uppercase text-mist">
          <tr>
            <th className="px-4 py-3">Username</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Joined</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t border-line bg-ink">
              <td className="px-4 py-3 text-white/90">{u.username}</td>
              <td className="px-4 py-3 text-mist">{u.email}</td>
              <td className="px-4 py-3">
                <select
                  value={u.role}
                  onChange={(e) => updateRole(u.id, e.target.value)}
                  className="rounded-md border border-line bg-ink-card px-2 py-1 text-xs text-white"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r.replace('_', ' ')}</option>
                  ))}
                </select>
              </td>
              <td className="px-4 py-3">
                <button
                  onClick={() => toggleActive(u.id, u.is_active)}
                  className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                    u.is_active ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
                  }`}
                >
                  {u.is_active ? 'Active' : 'Suspended'}
                </button>
              </td>
              <td className="px-4 py-3 text-mist">{new Date(u.date_joined).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
