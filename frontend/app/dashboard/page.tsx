"use client"

import { Loader2 } from "lucide-react"
import { useSession } from "@/lib/auth/use-session"
import { useReports } from "@/hooks/use-reports"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { MainLayout } from "@/components/layout/main-layout"
import { DashboardNav } from "@/components/layout/dashboard-nav"

export default function DashboardHomePage() {
  const { session } = useSession()
  const { stats, isLoading, error } = useReports()

  return (
    <MainLayout
      userRole={session?.user.role}
      userName={session?.user.fullName}
      companyName={session?.tenant.name}
    >
      <div className="space-y-6">
        <DashboardNav />

        <h1 className="text-2xl font-bold text-gray-900">Panel de Control</h1>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400 mr-2" />
            <span className="text-gray-500">Cargando estadísticas…</span>
          </div>
        )}

        {!isLoading && error && (
          <div className="rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-700">{error}</div>
        )}

        {!isLoading && !error && stats && <StatsCards stats={stats} />}
      </div>
    </MainLayout>
  )
}
