"use client"

import { MainLayout } from "../layout/main-layout"
import { QualityManagerDashboard } from "../dashboard/quality-manager-dashboard"
import { ApprovalWorkflow } from "../workflow/approval-workflow"
import { TeamOverview } from "../team/team-overview"
import { LotManagement } from "../quality-manager/lot-management"
import { QualityBreakdown } from "../quality-manager/quality-breakdown"
import { FormAssignment } from "../quality-manager/form-assignment"
import { ProcessMonitoring } from "../quality-manager/process-monitoring"

export function QualityManagerPage() {
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

  const lots = [
    {
      id: "LT-001",
      name: "Salmón Atlántico Lote A",
      status: "active" as const,
      product: "Salmón",
      quantity: "2500 kg",
      created: "2024-03-10",
      currentProcess: "Inspección Visual",
      progress: 70,
      qualityScore: 98.5,
    },
    {
      id: "LT-002",
      name: "Merluza Austral Lote B",
      status: "processing" as const,
      product: "Merluza",
      quantity: "1800 kg",
      created: "2024-03-12",
      currentProcess: "Control de Temperatura",
      progress: 45,
      qualityScore: 97.2,
    },
    {
      id: "LT-003",
      name: "Langostinos Lote C",
      status: "completed" as const,
      product: "Langostinos",
      quantity: "950 kg",
      created: "2024-03-08",
      currentProcess: "Empaque",
      progress: 100,
      qualityScore: 99.1,
    },
  ]

  const qualityMetrics = [
    { metric: "Defectos Menores", value: 1.2, unit: "%", trend: "down" as const },
    { metric: "No Conformidades", value: 0.5, unit: "%", trend: "stable" as const },
    { metric: "Cumplimiento Normativo", value: 99.1, unit: "%", trend: "up" as const },
  ]

  const forms = [
    { id: "FT-001", name: "Ficha Técnica de Producto", assignedTo: "Todos los lotes", status: "active" as const },
    { id: "CT-002", name: "Control de Temperatura", assignedTo: "Lotes Congelados", status: "active" as const },
    { id: "IV-003", name: "Inspección Visual", assignedTo: "Todos los productos", status: "active" as const },
    { id: "CS-004", name: "Control Sanitario", assignedTo: "Lotes de Mariscos", status: "inactive" as const },
  ]

  return (
    <MainLayout userRole="quality-manager" userName="Ana García" companyName="Pesquera del Sur">
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Dashboard Principal del Jefe de Calidad */}
        <div className="xl:col-span-2">
          <QualityManagerDashboard pendingApprovals={pendingApprovals} />
        </div>

        {/* Gestión de Lotes */}
        <div className="col-span-1">
          <LotManagement lots={lots} />
        </div>

        {/* Desglose de Calidad */}
        <div className="col-span-1">
          <QualityBreakdown metrics={qualityMetrics} />
        </div>

        {/* Monitoreo de Procesos */}
        <div className="xl:col-span-2">
          <ProcessMonitoring lots={lots} />
        </div>

        {/* Flujo de Aprobaciones */}
        <div className="col-span-1">
          <ApprovalWorkflow pendingApprovals={pendingApprovals} />
        </div>

        {/* Asignación de Planillas */}
        <div className="col-span-1">
          <FormAssignment forms={forms} />
        </div>

        {/* Vista del Equipo */}
        <div className="col-span-1">
          <TeamOverview />
        </div>
      </div>
    </MainLayout>
  )
}
