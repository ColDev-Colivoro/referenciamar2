import { apiRequest } from "../api/client"

import type { Plan, TenantSubscription } from "./types"

export function listPlans(): Promise<Plan[]> {
  return apiRequest<Plan[]>("/api/v1/billing/plans/")
}

export function getSubscription(): Promise<TenantSubscription> {
  return apiRequest<TenantSubscription>("/api/v1/billing/subscription/")
}
