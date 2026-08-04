import { useAuth } from '@/context/AuthContext'

export default function Settings() {
  const { user } = useAuth()

  return (
    <div className="max-w-lg space-y-5">
      <div className="rounded-xl border border-line bg-ink-soft p-5">
        <h2 className="mb-3 text-sm font-semibold text-white">Platform</h2>
        <div className="space-y-2 text-sm text-mist">
          <p>Signed in as <span className="text-white">{user?.username}</span> ({user?.role.replace('_', ' ')})</p>
          <p>Desi Hub — managed by Himanshu and the Desi Hub team.</p>
        </div>
      </div>

      <div className="rounded-xl border border-line bg-ink-soft p-5">
        <h2 className="mb-2 text-sm font-semibold text-white">Upload Limits</h2>
        <p className="text-sm text-mist">Configured via the backend <code className="text-marigold">MAX_VIDEO_UPLOAD_SIZE_MB</code> environment variable.</p>
      </div>
    </div>
  )
}
