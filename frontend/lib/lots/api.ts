import { apiRequest } from "@/lib/api/client"

import type { CreateLotInput, Lot, LotStatus, UpdateLotInput } from "@/lib/lots/types"

export function listLots(): Promise<Lot[]> {
  return apiRequest<Lot[]>("/api/v1/lots/")
}

export function createLot(input: CreateLotInput): Promise<Lot> {
  return apiRequest<Lot>("/api/v1/lots/", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export function updateLot(id: number, input: UpdateLotInput): Promise<Lot> {
  return apiRequest<Lot>(`/api/v1/lots/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(input),
  })
}

export function changeLotStatus(id: number, status: LotStatus): Promise<Lot> {
  return apiRequest<Lot>(`/api/v1/lots/${id}/status/`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  })
}
