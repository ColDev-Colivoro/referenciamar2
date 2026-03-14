"use client"

import { Briefcase, KeyRound, ShieldCheck } from "lucide-react"

import { canManageUsers, getRolePresentation } from "@/lib/auth/roles"
import { useSession } from "@/lib/auth/use-session"
import { MainLayout } from "../layout/main-layout"
import { ManagerDashboard } from "../dashboard/manager-dashboard"
import { AuditPanel } from "../audit/audit-panel"
import { MetricsOverview } from "../metrics/metrics-overview"
import { UserManagement } from "../manager/user-management"
import { ReportsPanel } from "../manager/reports-panel"
import { QualityTrends } from "../manager/quality-trends"
import { ProductionOverview } from "../manager/production-overview"
import { Badge } from "../ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"

export function ManagerPage() {
  const { session } = useSession()
  const rolePresentation = getRolePresentation(session?.user.role)
  const hasUserManagementAccess = canManageUsers(session)

  return (
    <MainLayout
      userRole={session?.user.role ?? "manager"}
      userName={session?.user.fullName ?? "Gerencia"}
      companyName={session?.tenant.name ?? "Tenant actual"}
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-4">
        <div className="xl:col-span-2">
          <ManagerDashboard companyName={session?.tenant.name ?? "Tenant actual"} />
        </div>

        <div className="col-span-1">
          <MetricsOverview />
        </div>

        <div className="col-span-1">
          <QualityTrends />
        </div>

        <div className="xl:col-span-2">
          <ProductionOverview />
        </div>

        <div className="col-span-1">
          <UserManagement canManage={hasUserManagementAccess} tenantName={session?.tenant.name} currentUserRoleLabel={rolePresentation.label} />
        </div>

        <div className="col-span-1">
          <ReportsPanel />
        </div>

        <div className="lg:col-span-2">
          <AuditPanel />
        </div>

        <div className="lg:col-span-2">
          <Card className="border border-slate-200 bg-white/90 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <ShieldCheck className="h-5 w-5 text-slate-600" />
                Acceso real según rol
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-700">
              <div className="flex flex-wrap gap-2">
                <Badge className={rolePresentation.color}>{rolePresentation.label}</Badge>
                <Badge className="bg-sky-100 text-sky-700">Tenant: {session?.tenant.slug ?? "sin tenant"}</Badge>
              </div>
              <p>
                Esta vista ahora toma la sesión real del backend. Si el rol no tiene permisos administrativos, la gestión de usuarios se
                muestra restringida.
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                  <div className="mb-1 flex items-center gap-2 font-medium text-emerald-900">
                    <Briefcase className="h-4 w-4" />
                    Acciones de gerencia
                  </div>
                  <p className="text-emerald-800">Seguimiento operativo, métricas, reportes y auditoría.</p>
                </div>
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <div className="mb-1 flex items-center gap-2 font-medium text-amber-900">
                    <KeyRound className="h-4 w-4" />
                    Gestión de usuarios
                  </div>
                  <p className="text-amber-800">
                    {hasUserManagementAccess
                      ? "Habilitada para este rol o por permisos explícitos."
                      : "Bloqueada para este rol hasta contar con permisos de administración."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
