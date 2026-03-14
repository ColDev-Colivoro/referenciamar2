const fallbackApiBaseUrl = "http://localhost:8000"

export const env = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || fallbackApiBaseUrl,
}

export function buildApiUrl(path: string) {
  return `${env.apiBaseUrl}${path.startsWith("/") ? path : `/${path}`}`
}
