"use client"

// Hook that encapsulates dashboard stats state and API calls
// Exposes: stats, isLoading, error, refresh

import { useCallback, useEffect, useMemo, useState } from "react"

import { ApiError } from "@/lib/api/client"
import { getDashboardStats } from "@/lib/reports/api"
import type { DashboardStats } from "@/lib/reports/types"

export function useReports() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getDashboardStats()
      setStats(data)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No fue posible cargar las estadísticas.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return useMemo(
    () => ({ stats, isLoading, error, refresh }),
    [stats, isLoading, error, refresh],
  )
}
