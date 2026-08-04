import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <div className="grid h-[60vh] place-items-center text-mist">Loading…</div>
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  return <>{children}</>
}

export function RequireContentStaff({ children }: { children: ReactNode }) {
  const { user, loading, isContentStaff } = useAuth()

  if (loading) return <div className="grid h-[60vh] place-items-center text-mist">Loading…</div>
  if (!user || !isContentStaff) return <Navigate to="/" replace />
  return <>{children}</>
}

export function RequireSuperAdmin({ children }: { children: ReactNode }) {
  const { user, loading, isSuperAdmin } = useAuth()

  if (loading) return <div className="grid h-[60vh] place-items-center text-mist">Loading…</div>
  if (!user || !isSuperAdmin) return <Navigate to="/admin-dashboard" replace />
  return <>{children}</>
}
