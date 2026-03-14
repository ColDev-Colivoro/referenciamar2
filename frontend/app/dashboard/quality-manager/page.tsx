"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { QualityManagerPage } from "../../../components/pages/quality-manager-page"

export default function QualityManagerDashboard() {
  return (
    <ProtectedRoute allowedRoles={["quality_manager", "tenant_admin", "global_admin"]}>
      <QualityManagerPage />
    </ProtectedRoute>
  )
}
