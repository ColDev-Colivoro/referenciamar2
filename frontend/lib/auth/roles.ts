import type { LoginResponse, UserRole } from "@/lib/auth/types"

export type LayoutRole = "admin" | "manager" | "quality-manager" | "monitor" | "supervisor"

const rolePresentation: Record<UserRole | LayoutRole, { label: string; color: string; layoutRole: LayoutRole }> = {
  admin: { label: "Administrador Global", color: "bg-indigo-100 text-indigo-700", layoutRole: "admin" },
  global_admin: { label: "Administrador Global", color: "bg-indigo-100 text-indigo-700", layoutRole: "admin" },
  tenant_admin: { label: "Administrador Tenant", color: "bg-violet-100 text-violet-700", layoutRole: "admin" },
  manager: { label: "Gerente", color: "bg-emerald-100 text-emerald-700", layoutRole: "manager" },
  "quality-manager": { label: "Jefe de Calidad", color: "bg-amber-100 text-amber-700", layoutRole: "quality-manager" },
  quality_manager: { label: "Jefe de Calidad", color: "bg-amber-100 text-amber-700", layoutRole: "quality-manager" },
  monitor: { label: "Monitor", color: "bg-sky-100 text-sky-700", layoutRole: "monitor" },
  supervisor: { label: "Jefe de Planta", color: "bg-orange-100 text-orange-700", layoutRole: "supervisor" },
  production_supervisor: { label: "Jefe de Planta", color: "bg-orange-100 text-orange-700", layoutRole: "supervisor" },
}

const MANAGE_USER_PERMISSIONS = new Set(["users.manage", "users.write", "users.admin", "tenant.users.manage"])
const MANAGE_USER_ROLES = new Set<UserRole>(["global_admin", "tenant_admin"])

export function getRolePresentation(role?: UserRole | LayoutRole) {
  if (!role) {
    return { label: "Usuario", color: "bg-gray-100 text-gray-700", layoutRole: "monitor" as LayoutRole }
  }

  return rolePresentation[role] ?? { label: "Usuario", color: "bg-gray-100 text-gray-700", layoutRole: "monitor" as LayoutRole }
}

export function canManageUsers(session: LoginResponse | null) {
  if (!session) {
    return false
  }

  if (MANAGE_USER_ROLES.has(session.user.role)) {
    return true
  }

  return session.permissions.some((permission) => MANAGE_USER_PERMISSIONS.has(permission))
}
