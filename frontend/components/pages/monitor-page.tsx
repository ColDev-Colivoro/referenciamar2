"use client"

import { MainLayout } from "../layout/main-layout"
import { MonitorDashboard } from "../dashboard/monitor-dashboard"
import { TemperatureControlForm } from "../forms/temperature-control-form"
import { VisualInspectionForm } from "../forms/visual-inspection-form"
import { AssignedTasks } from "../monitor/assigned-tasks"
import { QuickActions } from "../monitor/quick-actions"

export function MonitorPage() {
  const availableForms = [
    {
      id: "1",
      title: "Control de Temperatura",
      lotNumber: "SA-2024-001",
      productType: "Salmón Atlántico",
      status: "available" as const,
      priority: "high" as const,
    },
    {
      id: "2",
      title: "Inspección Visual",
      lotNumber: "LG-2024-045",
      productType: "Langostinos",
      status: "available" as const,
      priority: "medium" as const,
    },
    {
      id: "3",
      title: "Ficha Técnica",
      lotNumber: "MZ-2024-012",
      productType: "Merluza",
      status: "blocked" as const,
      priority: "low" as const,
    },
    {
      id: "4",
      title: "Control Sanitario",
      lotNumber: "CM-2024-005",
      productType: "Calamar",
      status: "available" as const,
      priority: "high" as const,
    },
  ]

  return (
    <MainLayout userRole="monitor" userName="Juan Pérez" companyName="Pesquera del Sur">
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Dashboard del Monitor */}
        <div className="xl:col-span-2">
          <MonitorDashboard availableForms={availableForms} completedToday={8} />
        </div>

        {/* Tareas Asignadas */}
        <div className="col-span-1">
          <AssignedTasks tasks={availableForms} />
        </div>

        {/* Formulario Activo (ejemplo) */}
        <div className="lg:col-span-2">
          <TemperatureControlForm lotNumber="SA-2024-001" productType="Salmón Atlántico" />
        </div>

        {/* Segundo Formulario (ejemplo) */}
        <div className="col-span-1">
          <VisualInspectionForm lotNumber="LG-2024-045" productType="Langostinos" />
        </div>

        {/* Acciones Rápidas */}
        <div className="col-span-1">
          <QuickActions />
        </div>
      </div>
    </MainLayout>
  )
}
