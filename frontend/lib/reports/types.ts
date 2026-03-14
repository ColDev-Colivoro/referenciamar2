import type { AuditEvent } from "../audit/types"

export interface LotStatusCounts {
  pending: number
  in_process: number
  approved: number
  rejected: number
}

export interface LotSummary {
  total: number
  this_month: number
  by_status: LotStatusCounts
}

export interface FormStatusCounts {
  draft: number
  submitted: number
  approved: number
  rejected: number
}

export interface FormSummary {
  total: number
  by_type: Record<string, number>
  by_status: FormStatusCounts
}

export interface DashboardStats {
  lot_summary: LotSummary
  form_summary: FormSummary
  recent_activity: AuditEvent[]
}
