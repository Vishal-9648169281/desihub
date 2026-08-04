export type Role = 'SUPER_ADMIN' | 'CONTENT_MANAGER' | 'USER'

export interface User {
  id: number
  uuid: string
  username: string
  email: string
  first_name: string
  last_name: string
  role: Role
  avatar: string | null
  date_joined: string
}

export interface Category {
  id: number
  name: string
  slug: string
  description: string
  order: number
}

export interface Tag {
  id: number
  name: string
  slug: string
}

export interface VideoCard {
  id: number
  uuid: string
  title: string
  slug: string
  category: string | null
  category_name: string | null
  duration_seconds: number
  content_rating: string
  thumbnail_url: string | null
  view_count: number
  is_featured: boolean
}

export interface VideoThumbnail {
  id: number
  image: string
  position_percent: number
  is_selected: boolean
  is_custom: boolean
}

export interface VideoAsset {
  id: number
  quality: string
  file: string
  bitrate_kbps: number
}

export interface VideoDetail {
  id: number
  uuid: string
  title: string
  slug: string
  description: string
  category: Category | null
  tags: Tag[]
  language: string
  release_date: string | null
  duration_seconds: number
  content_rating: string
  status: string
  visibility: string
  thumbnail_url: string | null
  video_url: string | null
  thumbnails: VideoThumbnail[]
  assets: VideoAsset[]
  view_count: number
  is_featured: boolean
  created_by_username: string | null
  created_at: string
  published_at: string | null
}

export interface WatchProgress {
  id: number
  video: VideoCard
  position_seconds: number
  duration_seconds: number
  completed: boolean
  percent_complete: number
  updated_at: string
}

export interface WatchHistoryEntry {
  id: number
  video: VideoCard
  watched_at: string
  position_seconds: number
}

export interface Favorite {
  id: number
  video: VideoCard
  created_at: string
}

export interface Paginated<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface AdminVideo {
  id: number
  uuid: string
  title: string
  slug: string
  category: number | null
  category_name: string | null
  status: 'UPLOADING' | 'PROCESSING' | 'READY' | 'PUBLISHED' | 'FAILED'
  visibility: 'PUBLIC' | 'UNLISTED' | 'PRIVATE'
  view_count: number
  duration_seconds: number
  thumbnail_url: string | null
  created_at: string
  published_at: string | null
  is_featured: boolean
}

export interface DashboardStats {
  total_videos: number
  published_videos: number
  draft_videos: number
  total_users: number
  total_views: number
  total_watch_time_hours: number
  most_watched: AdminVideo[]
  recent_uploads: AdminVideo[]
  recent_users: { id: number; username: string; email: string; date_joined: string }[]
}
