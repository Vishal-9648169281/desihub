import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCategories } from '@/lib/videos'
import { gradientForTitle } from '@/lib/format'
import type { Category } from '@/types'

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    getCategories().then(setCategories)
  }, [])

  return (
    <div className="px-4 py-6 sm:px-8">
      <h1 className="mb-5 text-xl font-bold text-white sm:text-2xl">Browse Categories</h1>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {categories.map((c) => (
          <Link
            key={c.id}
            to={`/category/${c.slug}`}
            className={`flex h-24 items-center justify-center rounded-xl bg-gradient-to-br p-4 text-center font-bold text-white shadow-lg transition hover:scale-[1.03] sm:h-32 ${gradientForTitle(c.name)}`}
          >
            {c.name}
          </Link>
        ))}
      </div>
    </div>
  )
}
