"use client"

import { MainLayout } from "../layout/main-layout"
import { ManagerDashboard } from "../dashboard/manager-dashboard"
import { AuditPanel } from "../audit/audit-panel"
import { MetricsOverview } from "../metrics/metrics-overview"
import { UserManagement } from "../manager/user-management"
import { ReportsPanel } from "../manager/reports-panel"
import { QualityTrends } from "../manager/quality-trends"
import { ProductionOverview } from "../manager/production-overview"

export function ManagerPage() {
  const companies = [
    {
      id: "pesquera-sur",
      name: "Pesquera del Sur",
      activeUsers: { total: 24, managers: 2, supervisors: 4, monitors: 18 },
      products: { total: 156, fish: 89, seafood: 34, cephalopods: 33 },
      activeProcesses: [
        { name: "Salmón Atlántico", type: "frozen" as const },
        { name: "Merluza Austral", type: "chilled" as const },
      ],
    },
  ]

  return (
    <MainLayout userRole="manager" userName="Carlos Mendoza" companyName="Pesquera del Sur">
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Dashboard Principal del Gerente */}
        <div className="xl:col-span-2">
          <ManagerDashboard companyName="Pesquera del Sur" />
        </div>

        {/* Métricas Generales */}
        <div className="col-span-1">
          <MetricsOverview />
        </div>

        {/* Tendencias de Calidad */}
        <div className="col-span-1">
          <QualityTrends />
        </div>

        {/* Resumen de Producción */}
        <div className="xl:col-span-2">
          <ProductionOverview />
        </div>

        {/* Gestión de Usuarios */}
        <div className="col-span-1">
          <UserManagement />
        </div>

        {/* Panel de Reportes */}
        <div className="col-span-1">
          <ReportsPanel />
        </div>

        {/* Gestión de Empresas (si aplica para gerente) */}
        {/* <div className="lg:col-span-2">
          <CompanyManagement companies={companies} />
        </div> */}

        {/* Panel de Auditoría */}
        <div className="lg:col-span-2">
          <AuditPanel />
        </div>
      </div>
    </MainLayout>
  )
}
