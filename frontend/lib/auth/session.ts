import { apiRequest } from "@/lib/api/client"
import { setToken } from "@/lib/auth/token"
import type { LoginRequest, LoginResponse, UserRole } from "@/lib/auth/types"

const roleRouteMap: Record<UserRole, string> = {
  global_admin: "/admin",
  tenant_admin: "/admin",
  manager: "/dashboard/manager",
  quality_manager: "/dashboard/quality-manager",
  monitor: "/dashboard/monitor",
  production_supervisor: "/dashboard/supervisor",
}

export function getRouteForRole(role: UserRole) {
  return roleRouteMap[role]
}

export async function login(input: LoginRequest) {
  const response = await apiRequest<LoginResponse>("/api/v1/auth/login/", {
    method: "POST",
    body: JSON.stringify(input),
  })
  setToken(response.accessToken)
  return response
}
