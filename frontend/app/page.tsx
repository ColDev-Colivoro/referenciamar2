"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { MainLayout } from "../components/layout/main-layout"
import { LoginPage } from "../components/pages/login-page"
import { getRouteForRole } from "@/lib/auth/session"
import { useSession } from "@/lib/auth/use-session"

export default function Page() {
  const router = useRouter()
  const { session, isLoading } = useSession()

  useEffect(() => {
    if (!isLoading && session) {
      router.replace(getRouteForRole(session.user.role))
    }
  }, [isLoading, router, session])

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-gray-600">Validando acceso...</div>
  }

  return (
    <MainLayout>
      <LoginPage />
    </MainLayout>
  )
}
