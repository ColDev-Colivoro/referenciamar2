"use client"

import { MainLayout } from "../layout/main-layout"
import { GlobalDashboard } from "../dashboard/global-dashboard"
import { CompanyCreationForm } from "../admin/company-creation-form"
import { CompanyList } from "../admin/company-list"
import { GlobalMetrics } from "../admin/global-metrics"
import { SystemConfiguration } from "../admin/system-configuration"
import { SystemLogs } from "../admin/system-logs"
import { BillingOverview } from "../admin/billing-overview"
import { SupportTickets } from "../admin/support-tickets"

export function AdminPage() {
  const companies = [
    {
      id: "pesquera-del-sur",
      name: "Pesquera del Sur",
      status: "active" as const,
      createdDate: "2024-01-15",
      totalUsers: 24,
      monthlyForms: 1247,
      complianceRate: 98.5,
      adminContact: "carlos.mendoza@pesqueradsur.com",
      plan: "enterprise",
      lastActivity: "2024-03-15 14:30",
      storage: "2.3 GB",
    },
    {
      id: "mariscos-pacifico",
      name: "Mariscos Pacífico",
      status: "active" as const,
      createdDate: "2024-02-03",
      totalUsers: 18,
      monthlyForms: 892,
      complianceRate: 96.2,
      adminContact: "ana.garcia@mariscospacifico.com",
      plan: "professional",
      lastActivity: "2024-03-15 12:15",
      storage: "1.8 GB",
    },
    {
      id: "exportadora-marina",
      name: "Exportadora Marina",
      status: "pending" as const,
      createdDate: "2024-03-10",
      totalUsers: 31,
      monthlyForms: 1456,
      complianceRate: 94.8,
      adminContact: "luis.torres@exportadoramarina.com",
      plan: "enterprise",
      lastActivity: "2024-03-15 09:45",
      storage: "3.1 GB",
    },
  ]

  return (
    <MainLayout userRole="admin" userName="ColDev Admin" companyName="Mar2Control Global">
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Dashboard Global */}
        <div className="xl:col-span-2">
          <GlobalDashboard />
        </div>

        {/* Métricas Globales */}
        <div className="col-span-1">
          <GlobalMetrics />
        </div>

        {/* Tickets de Soporte */}
        <div className="col-span-1">
          <SupportTickets />
        </div>

        {/* Lista de Empresas */}
        <div className="xl:col-span-2">
          <CompanyList companies={companies} />
        </div>

        {/* Facturación */}
        <div className="col-span-1">
          <BillingOverview />
        </div>

        {/* Formulario Nueva Empresa */}
        <div className="col-span-1">
          <CompanyCreationForm />
        </div>

        {/* Logs del Sistema */}
        <div className="lg:col-span-2">
          <SystemLogs />
        </div>

        {/* Configuración del Sistema */}
        <div className="lg:col-span-2">
          <SystemConfiguration />
        </div>
      </div>
    </MainLayout>
  )
}
