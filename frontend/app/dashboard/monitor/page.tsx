"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { MonitorPage } from "../../../components/pages/monitor-page"

export default function MonitorDashboard() {
  return (
    <ProtectedRoute allowedRoles={["monitor", "tenant_admin", "global_admin"]}>
      <MonitorPage />
    </ProtectedRoute>
  )
}
