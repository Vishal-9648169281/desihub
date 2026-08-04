import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="grid h-[70vh] place-items-center px-4 text-center">
      <div>
        <p className="brand-gradient-text text-5xl font-black">404</p>
        <p className="mt-2 text-mist">This page took a wrong turn.</p>
        <Link to="/" className="mt-5 inline-block rounded-lg brand-gradient-bg px-5 py-2.5 text-sm font-bold text-black">
          Back to Desi Hub
        </Link>
      </div>
    </div>
  )
}
