export type AuditLevel = "info" | "warning" | "error"

export interface AuditEvent {
  id: number
  action: string
  level: AuditLevel
  actor_email: string | null
  actor_username: string | null
  metadata: Record<string, unknown>
  created_at: string // ISO datetime string
}

export interface AuditFilters {
  action?: string
  date_from?: string // YYYY-MM-DD
  date_to?: string   // YYYY-MM-DD
}

export interface PaginatedAuditResponse {
  count: number
  next: string | null
  previous: string | null
  results: AuditEvent[]
}
