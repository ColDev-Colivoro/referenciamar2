"use client"

import { MainLayout } from "../layout/main-layout"
import { SupervisorDashboard } from "../dashboard/supervisor-dashboard"
import { ApprovalWorkflow } from "../workflow/approval-workflow"
import { TeamOverview } from "../team/team-overview"

export function SupervisorPage() {
  const pendingApprovals = [
    {
      id: "1",
      title: "Ficha Técnica - Merluza",
      monitor: "Juan Pérez",
      modifiedTime: "10:30 AM",
      status: "pending" as const,
      priority: "high" as const,
    },
    {
      id: "2",
      title: "Control Temperatura",
      monitor: "María López",
      modifiedTime: "09:15 AM",
      status: "pending" as const,
      priority: "medium" as const,
    },
    {
      id: "3",
      title: "Inspección Visual - Langostinos",
      monitor: "Pedro García",
      modifiedTime: "08:45 AM",
      status: "pending" as const,
      priority: "low" as const,
    },
  ]

  return (
    <MainLayout userRole="supervisor" userName="Ana García" companyName="Pesquera del Sur">
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Dashboard Principal del Supervisor */}
        <div className="xl:col-span-2">
          <SupervisorDashboard pendingApprovals={pendingApprovals} />
        </div>

        {/* Vista del Equipo */}
        <div className="col-span-1">
          <TeamOverview />
        </div>

        {/* Flujo de Aprobaciones */}
        <div className="lg:col-span-2">
          <ApprovalWorkflow pendingApprovals={pendingApprovals} />
        </div>
      </div>
    </MainLayout>
  )
}
