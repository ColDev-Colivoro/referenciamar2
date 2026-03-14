export type UserRole =
  | "global_admin"
  | "tenant_admin"
  | "manager"
  | "quality_manager"
  | "monitor"
  | "production_supervisor"

export interface LoginRequest {
  username: string
  password: string
  tenantSlug?: string
}

export interface LoginResponse {
  accessToken?: string
  refreshToken?: string
  sessionMode: "cookie" | "hybrid"
  user: {
    id: string
    fullName: string
    role: UserRole
  }
  tenant: {
    id: string
    slug: string
    name: string
  }
  permissions: string[]
}
