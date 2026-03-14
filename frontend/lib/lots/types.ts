export type LotStatus = "pending" | "in_process" | "approved" | "rejected"

export interface Lot {
  id: number
  code: string
  species: string
  origin: string
  entry_date: string // ISO date string
  status: LotStatus
  quantity_kg: string // Django decimal → string
  notes: string
  created_by_username: string | null
  created_at: string
  updated_at: string
}

export interface CreateLotInput {
  code?: string
  species: string
  origin: string
  entry_date: string
  quantity_kg: number | string
  notes?: string
}

export interface UpdateLotInput {
  code?: string
  species?: string
  origin?: string
  entry_date?: string
  quantity_kg?: number | string
  notes?: string
}
