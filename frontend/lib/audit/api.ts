import { apiRequest } from "@/lib/api/client"

import type { AuditFilters, PaginatedAuditResponse } from "./types"

export function listAuditEvents(filters?: AuditFilters): Promise<PaginatedAuditResponse> {
  const params = new URLSearchParams()
  if (filters?.action) params.set("action", filters.action)
  if (filters?.date_from) params.set("date_from", filters.date_from)
  if (filters?.date_to) params.set("date_to", filters.date_to)
  const query = params.toString()
  const url = `/api/v1/audit/${query ? `?${query}` : ""}`
  return apiRequest<PaginatedAuditResponse>(url)
}
