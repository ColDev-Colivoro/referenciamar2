"use client"

import type { ReactNode } from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { useSession } from "@/lib/auth/use-session"
import type { UserRole } from "@/lib/auth/types"

interface ProtectedRouteProps {
  allowedRoles: UserRole[]
  children: ReactNode
}

export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const router = useRouter()
  const { isAuthenticated, isLoading, role } = useSession()

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      router.replace("/")
      return
    }

    if (role && !allowedRoles.includes(role)) {
      router.replace("/")
    }
  }, [allowedRoles, isAuthenticated, isLoading, role, router])

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-gray-600">Cargando sesión...</div>
  }

  if (!isAuthenticated || !role || !allowedRoles.includes(role)) {
    return null
  }

  return <>{children}</>
}
