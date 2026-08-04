import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

const LINKS = [
  { to: '/admin-dashboard', label: 'Dashboard', end: true },
  { to: '/admin-dashboard/videos', label: 'Videos' },
  { to: '/admin-dashboard/videos/upload', label: 'Upload Video' },
  { to: '/admin-dashboard/categories', label: 'Categories' },
  { to: '/admin-dashboard/users', label: 'Users', superOnly: true },
  { to: '/admin-dashboard/team', label: 'Team', superOnly: true },
  { to: '/admin-dashboard/analytics', label: 'Analytics' },
  { to: '/admin-dashboard/search-analytics', label: 'Search Analytics' },
  { to: '/admin-dashboard/settings', label: 'Settings', superOnly: true },
]

export default function AdminLayout() {
  const { user, isSuperAdmin, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-ink">
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-line bg-ink-soft transition-transform lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center gap-1.5 border-b border-line px-5 text-xl font-black">
          <span className="brand-gradient-text">DESI</span>
          <span className="text-white">HUB</span>
          <span className="ml-1 text-xs font-normal text-mist">Admin</span>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {LINKS.filter((l) => !l.superOnly || isSuperAdmin).map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2.5 text-sm font-medium ${
                  isActive ? 'bg-marigold/15 text-marigold' : 'text-white/75 hover:bg-white/5'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <Link to="/" className="mt-4 rounded-lg px-3 py-2.5 text-sm font-medium text-white/60 hover:bg-white/5">
            ← Back to site
          </Link>
        </nav>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1">
        <header className="flex h-16 items-center justify-between border-b border-line px-4 sm:px-6">
          <button onClick={() => setSidebarOpen(true)} className="text-white lg:hidden" aria-label="Open menu">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
            </svg>
          </button>
          <span className="hidden text-sm text-mist lg:block">Welcome back, {user?.username}</span>
          <button onClick={logout} className="text-xs font-semibold text-white/70 hover:text-crimson">
            Logout
          </button>
        </header>
        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
