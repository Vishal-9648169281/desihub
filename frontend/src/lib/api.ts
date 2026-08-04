import axios from 'axios'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
})

function getTokens() {
  const raw = localStorage.getItem('desihub_tokens')
  return raw ? (JSON.parse(raw) as { access: string; refresh: string }) : null
}

function setTokens(tokens: { access: string; refresh: string }) {
  localStorage.setItem('desihub_tokens', JSON.stringify(tokens))
}

export function clearTokens() {
  localStorage.removeItem('desihub_tokens')
}

api.interceptors.request.use((config) => {
  const tokens = getTokens()
  if (tokens?.access) {
    config.headers.Authorization = `Bearer ${tokens.access}`
  }
  return config
})

let refreshing: Promise<string | null> | null = null

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const tokens = getTokens()
      if (!tokens?.refresh) {
        clearTokens()
        return Promise.reject(error)
      }
      if (!refreshing) {
        refreshing = axios
          .post(`${API_BASE_URL}/auth/refresh/`, { refresh: tokens.refresh })
          .then((res) => {
            setTokens({ access: res.data.access, refresh: tokens.refresh })
            return res.data.access as string
          })
          .catch(() => {
            clearTokens()
            return null
          })
          .finally(() => {
            refreshing = null
          })
      }
      const newAccess = await refreshing
      if (newAccess) {
        original.headers.Authorization = `Bearer ${newAccess}`
        return api(original)
      }
    }
    return Promise.reject(error)
  },
)

export { getTokens, setTokens }
