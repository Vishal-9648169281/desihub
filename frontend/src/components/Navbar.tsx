import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/trending', label: 'Trending' },
  { to: '/latest', label: 'Latest' },
  { to: '/categories', label: 'Categories' },
  { to: '/my-list', label: 'My List' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, logout, isContentStaff } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 z-40 w-full transition-colors duration-300 ${
        scrolled ? 'bg-ink/95 backdrop-blur-md shadow-lg shadow-black/30' : 'bg-gradient-to-b from-black/80 to-transparent'
      }`}
    >
      <div className="flex h-14 items-center justify-between px-4 sm:h-16 sm:px-8">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-1.5 text-xl font-black tracking-tight sm:text-2xl">
            <span className="brand-gradient-text font-display">DESI</span>
            <span className="text-white">HUB</span>
          </Link>

          <nav className="hidden items-center gap-6 lg:flex">
            {NAV_LINKS.map((link) => (
              <Link key={link.to} to={link.to} className="text-sm font-medium text-white/80 transition hover:text-white">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <Link to="/search" aria-label="Search" className="text-white/90 hover:text-white">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 sm:h-6 sm:w-6">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" strokeLinecap="round" />
            </svg>
          </Link>

          {isContentStaff && (
            <Link
              to="/admin-dashboard"
              className="hidden rounded-md border border-marigold/40 px-3 py-1.5 text-xs font-semibold text-marigold hover:bg-marigold/10 sm:block"
            >
              Admin
            </Link>
          )}

          {user ? (
            <button onClick={() => setMenuOpen((o) => !o)} className="relative">
              <div className="grid h-8 w-8 place-items-center rounded-md brand-gradient-bg text-sm font-bold text-black sm:h-9 sm:w-9">
                {user.username[0]?.toUpperCase()}
              </div>
              {menuOpen && (
                <div className="absolute right-0 top-11 w-48 rounded-lg border border-line bg-ink-soft py-1.5 text-left shadow-xl">
                  <Link to="/profile" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-white/90 hover:bg-white/5">
                    Profile
                  </Link>
                  <Link to="/history" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-white/90 hover:bg-white/5">
                    Watch History
                  </Link>
                  {isContentStaff && (
                    <Link to="/admin-dashboard" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-marigold hover:bg-white/5 lg:hidden">
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout()
                      setMenuOpen(false)
                      navigate('/')
                    }}
                    className="block w-full px-4 py-2 text-left text-sm text-white/90 hover:bg-white/5"
                  >
                    Logout
                  </button>
                </div>
              )}
            </button>
          ) : (
            <Link to="/login" className="rounded-md brand-gradient-bg px-3 py-1.5 text-xs font-bold text-black sm:px-4 sm:py-2 sm:text-sm">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
