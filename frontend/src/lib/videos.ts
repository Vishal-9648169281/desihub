import { api } from '@/lib/api'
import type { Category, Paginated, VideoCard, VideoDetail } from '@/types'

export const DEMO_VIDEOS: VideoCard[] = [
  'Chai Pe Charcha', 'Dilli Ki Galiyan', 'Rangoli Nights', 'Bazaar Beats',
  'Monsoon Diaries', 'The Startup Chai', 'Gully Cricket Chronicles',
  'Sunday Recipes', 'Auto Wale Bhaiya', 'College Ke Din',
].map((title, i) => ({
  id: -(i + 1),
  uuid: `demo-${i}`,
  title,
  slug: title.toLowerCase().replace(/\s+/g, '-'),
  category: ['comedy', 'entertainment', 'music', 'vlogs'][i % 4],
  category_name: ['Comedy', 'Entertainment', 'Music', 'Vlogs'][i % 4],
  duration_seconds: 600 + i * 187,
  content_rating: 'ALL',
  thumbnail_url: null,
  view_count: 1200 * (i + 3),
  is_featured: i < 3,
}))

export async function getTrending(): Promise<VideoCard[]> {
  try {
    const res = await api.get<VideoCard[]>('/videos/trending/')
    return res.data.length ? res.data : DEMO_VIDEOS
  } catch {
    return DEMO_VIDEOS
  }
}

export async function getRecommended(): Promise<VideoCard[]> {
  try {
    const res = await api.get<VideoCard[]>('/videos/recommended/')
    return res.data.length ? res.data : DEMO_VIDEOS.slice().reverse()
  } catch {
    return DEMO_VIDEOS.slice().reverse()
  }
}

export async function getFeatured(): Promise<VideoDetail | null> {
  try {
    const res = await api.get<VideoDetail | null>('/videos/featured/')
    return res.data
  } catch {
    return null
  }
}

export async function getByCategory(slug: string): Promise<VideoCard[]> {
  try {
    const res = await api.get<Paginated<VideoCard>>('/videos/', { params: { category: slug, page_size: 20 } })
    return res.data.results
  } catch {
    return DEMO_VIDEOS.filter((v) => v.category?.toLowerCase() === slug.toLowerCase())
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    const res = await api.get<Paginated<Category> | Category[]>('/categories/', { params: { page_size: 100 } })
    return Array.isArray(res.data) ? res.data : res.data.results
  } catch {
    return []
  }
}

export async function getVideoBySlug(slug: string): Promise<VideoDetail> {
  const res = await api.get<VideoDetail>(`/videos/${slug}/`)
  return res.data
}

export async function getRelated(slug: string): Promise<VideoCard[]> {
  try {
    const res = await api.get<VideoCard[]>(`/videos/${slug}/related/`)
    return res.data
  } catch {
    return []
  }
}

export interface SearchResult {
  count: number
  results: VideoCard[]
}

export async function searchVideos(params: {
  q: string
  sort?: string
  category?: string
}): Promise<SearchResult> {
  const res = await api.get<SearchResult>('/search/', { params })
  return res.data
}

export async function getSearchSuggestions(q: string) {
  const res = await api.get<{ recent: string[]; popular: string[]; titles: string[] }>('/search/suggestions/', {
    params: { q },
  })
  return res.data
}
