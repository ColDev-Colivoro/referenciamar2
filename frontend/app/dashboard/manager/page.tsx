"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { ManagerPage } from "../../../components/pages/manager-page"

export default function ManagerDashboard() {
  return (
    <ProtectedRoute allowedRoles={["manager", "tenant_admin", "global_admin"]}>
      <ManagerPage />
    </ProtectedRoute>
  )
}
