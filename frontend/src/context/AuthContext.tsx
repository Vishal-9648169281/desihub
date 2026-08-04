import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { api, clearTokens, setTokens } from '@/lib/api'
import type { User } from '@/types'

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  register: (data: { username: string; email: string; password: string }) => Promise<void>
  logout: () => void
  isContentStaff: boolean
  isSuperAdmin: boolean
  refreshMe: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  async function refreshMe() {
    try {
      const res = await api.get<User>('/users/me/')
      setUser(res.data)
    } catch {
      setUser(null)
    }
  }

  useEffect(() => {
    const raw = localStorage.getItem('desihub_tokens')
    if (!raw) {
      setLoading(false)
      return
    }
    refreshMe().finally(() => setLoading(false))
  }, [])

  async function login(username: string, password: string) {
    const res = await api.post('/auth/login/', { username, password })
    setTokens({ access: res.data.access, refresh: res.data.refresh })
    setUser(res.data.user)
  }

  async function register(data: { username: string; email: string; password: string }) {
    await api.post('/auth/register/', data)
    await login(data.username, data.password)
  }

  function logout() {
    clearTokens()
    setUser(null)
  }

  const isContentStaff = user?.role === 'SUPER_ADMIN' || user?.role === 'CONTENT_MANAGER'
  const isSuperAdmin = user?.role === 'SUPER_ADMIN'

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isContentStaff, isSuperAdmin, refreshMe }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
