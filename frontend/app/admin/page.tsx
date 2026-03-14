"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { AdminPage } from "../../components/pages/admin-page"

export default function AdminDashboard() {
  return (
    <ProtectedRoute allowedRoles={["global_admin", "tenant_admin"]}>
      <AdminPage />
    </ProtectedRoute>
  )
}
