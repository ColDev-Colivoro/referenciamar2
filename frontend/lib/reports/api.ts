import { apiRequest } from "@/lib/api/client"

import type { DashboardStats } from "./types"

export function getDashboardStats(): Promise<DashboardStats> {
  return apiRequest<DashboardStats>("/api/v1/reports/dashboard/")
}
