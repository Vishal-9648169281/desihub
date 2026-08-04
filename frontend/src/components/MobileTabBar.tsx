import { NavLink } from 'react-router-dom'

const TABS = [
  {
    to: '/',
    label: 'Home',
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" className="h-5 w-5">
        <path d="M3 11.5 12 4l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    to: '/search',
    label: 'Search',
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} className="h-5 w-5">
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: '/my-list',
    label: 'My List',
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" className="h-5 w-5">
        <path d="M12 21s-7-4.35-9.5-8.5C.7 9 2 5.5 5.3 5A5 5 0 0 1 12 7a5 5 0 0 1 6.7-2c3.3.5 4.6 4 2.8 7.5C19 16.65 12 21 12 21z" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    to: '/profile',
    label: 'Profile',
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" className="h-5 w-5">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c1.5-4 5-6 8-6s6.5 2 8 6" strokeLinecap="round" />
      </svg>
    ),
  },
]

export default function MobileTabBar() {
  return (
    <nav className="fixed bottom-0 left-0 z-40 flex w-full items-center justify-around border-t border-line bg-ink-soft/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden">
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.to === '/'}
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium ${
              isActive ? 'text-marigold' : 'text-white/60'
            }`
          }
        >
          {({ isActive }) => (
            <>
              {tab.icon(isActive)}
              {tab.label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
