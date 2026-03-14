"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import { ApiError } from "@/lib/api/client"
import { listAuditEvents } from "@/lib/audit/api"
import type { AuditEvent, AuditFilters } from "@/lib/audit/types"

export function useAudit(initialFilters: AuditFilters = {}) {
  const [events, setEvents] = useState<AuditEvent[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [filters, setFilters] = useState<AuditFilters>(initialFilters)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError("")
    try {
      const data = await listAuditEvents(filters)
      setEvents(data.results)
      setTotal(data.count)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No fue posible cargar los eventos de auditoría.")
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return useMemo(
    () => ({ events, total, isLoading, error, filters, setFilters, refresh }),
    [events, total, isLoading, error, filters, refresh],
  )
}
