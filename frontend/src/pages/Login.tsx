import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(username, password)
      const from = (location.state as { from?: Location })?.from?.pathname || '/'
      navigate(from, { replace: true })
    } catch {
      setError('Invalid username or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-ink-soft p-6 sm:p-8">
        <Link to="/" className="mb-6 flex items-center justify-center gap-1.5 text-2xl font-black">
          <span className="brand-gradient-text">DESI</span>
          <span className="text-white">HUB</span>
        </Link>
        <h1 className="mb-6 text-center text-lg font-semibold text-white">Sign in to continue</h1>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-mist">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full rounded-lg border border-line bg-ink px-3 py-2.5 text-sm text-white outline-none focus:border-marigold"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-mist">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-line bg-ink px-3 py-2.5 text-sm text-white outline-none focus:border-marigold"
            />
          </div>

          {error && <p className="text-sm text-crimson">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg brand-gradient-bg py-2.5 text-sm font-bold text-black disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-mist">
          New to Desi Hub?{' '}
          <Link to="/register" className="font-semibold text-marigold hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}
