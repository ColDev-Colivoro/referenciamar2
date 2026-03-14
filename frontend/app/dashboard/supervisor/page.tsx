"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { SupervisorPage } from "../../../components/pages/supervisor-page"

export default function SupervisorDashboard() {
  return (
    <ProtectedRoute allowedRoles={["production_supervisor", "tenant_admin", "global_admin"]}>
      <SupervisorPage />
    </ProtectedRoute>
  )
}
