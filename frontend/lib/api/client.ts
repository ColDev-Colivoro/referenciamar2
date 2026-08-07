import { buildApiUrl } from "@/lib/config/env"
import { getToken } from "@/lib/auth/token"

export class ApiError extends Error {
  status: number
  details?: unknown

  constructor(message: string, status: number, details?: unknown) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.details = details
  }
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken()

  const headers = new Headers({
    "Content-Type": "application/json",
  })
  if (token) headers.set("Authorization", `Token ${token}`)
  if (init?.headers) {
    const initHeaders = new Headers(init.headers as HeadersInit)
    initHeaders.forEach((value, key) => headers.set(key, value))
  }

  const response = await fetch(buildApiUrl(path), {
    ...init,
    headers,
  })

  const isJson = response.headers.get("content-type")?.includes("application/json")
  const payload = isJson ? await response.json() : await response.text()

  if (!response.ok) {
    const message =
      typeof payload === "object" && payload && "detail" in payload
        ? String(payload.detail)
        : `Request failed with status ${response.status}`

    throw new ApiError(message, response.status, payload)
  }

  return payload as T
}
