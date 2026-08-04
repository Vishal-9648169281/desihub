import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '@/context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form)
      navigate('/', { replace: true })
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data) {
        const data = err.response.data as Record<string, string[]>
        const firstError = Object.values(data)[0]?.[0]
        setError(firstError || 'Registration failed.')
      } else {
        setError('Registration failed.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-ink-soft p-6 sm:p-8">
        <Link to="/" className="mb-6 flex items-center justify-center gap-1.5 text-2xl font-black">
          <span className="brand-gradient-text">DESI</span>
          <span className="text-white">HUB</span>
        </Link>
        <h1 className="mb-6 text-center text-lg font-semibold text-white">Create your account</h1>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-mist">Username</label>
            <input
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
              className="w-full rounded-lg border border-line bg-ink px-3 py-2.5 text-sm text-white outline-none focus:border-marigold"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-mist">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="w-full rounded-lg border border-line bg-ink px-3 py-2.5 text-sm text-white outline-none focus:border-marigold"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-mist">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={8}
              className="w-full rounded-lg border border-line bg-ink px-3 py-2.5 text-sm text-white outline-none focus:border-marigold"
            />
          </div>

          {error && <p className="text-sm text-crimson">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg brand-gradient-bg py-2.5 text-sm font-bold text-black disabled:opacity-60"
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-mist">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-marigold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
