"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import { apiRequest, ApiError } from "@/lib/api/client"
import type { LoginResponse, UserRole } from "@/lib/auth/types"

export function useSession() {
  const [session, setSession] = useState<LoginResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>("")

  const refreshSession = useCallback(async () => {
    setIsLoading(true)
    setError("")
    try {
      const nextSession = await apiRequest<LoginResponse>("/api/v1/auth/me/")
      setSession(nextSession)
      return nextSession
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        setSession(null)
      } else {
        setError("No fue posible validar la sesión actual.")
      }
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshSession()
  }, [refreshSession])

  return useMemo(
    () => ({
      session,
      isLoading,
      error,
      isAuthenticated: Boolean(session),
      role: session?.user.role as UserRole | undefined,
      refreshSession,
    }),
    [error, isLoading, refreshSession, session],
  )
}
