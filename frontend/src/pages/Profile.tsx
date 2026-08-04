import { useState, type FormEvent } from 'react'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'

export default function Profile() {
  const { user, refreshMe, logout } = useAuth()
  const [firstName, setFirstName] = useState(user?.first_name || '')
  const [lastName, setLastName] = useState(user?.last_name || '')
  const [saved, setSaved] = useState(false)

  async function onSave(e: FormEvent) {
    e.preventDefault()
    await api.patch('/users/me/', { first_name: firstName, last_name: lastName })
    await refreshMe()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!user) return null

  return (
    <div className="mx-auto max-w-lg px-4 py-8 sm:px-8">
      <div className="mb-6 flex items-center gap-4">
        <div className="grid h-16 w-16 place-items-center rounded-full brand-gradient-bg text-2xl font-black text-black">
          {user.username[0]?.toUpperCase()}
        </div>
        <div>
          <p className="text-lg font-bold text-white">{user.username}</p>
          <p className="text-sm text-mist">{user.email}</p>
          <span className="mt-1 inline-block rounded bg-ink-card px-2 py-0.5 text-[10px] font-semibold text-marigold">
            {user.role.replace('_', ' ')}
          </span>
        </div>
      </div>

      <form onSubmit={onSave} className="space-y-4 rounded-xl border border-line bg-ink-soft p-5">
        <h2 className="text-sm font-semibold text-white">Account Settings</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs text-mist">First name</label>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full rounded-lg border border-line bg-ink px-3 py-2 text-sm text-white outline-none focus:border-marigold"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-mist">Last name</label>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full rounded-lg border border-line bg-ink px-3 py-2 text-sm text-white outline-none focus:border-marigold"
            />
          </div>
        </div>
        <button type="submit" className="rounded-lg brand-gradient-bg px-4 py-2 text-sm font-bold text-black">
          Save Changes
        </button>
        {saved && <p className="text-xs text-emerald-400">Saved.</p>}
      </form>

      <button onClick={logout} className="mt-5 w-full rounded-lg border border-white/20 py-2.5 text-sm font-semibold text-white/80 hover:border-crimson hover:text-crimson">
        Logout
      </button>
    </div>
  )
}
