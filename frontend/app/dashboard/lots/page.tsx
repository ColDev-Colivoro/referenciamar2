"use client"

import { useState } from "react"
import { Loader2, Plus, RefreshCw } from "lucide-react"

import { useSession } from "@/lib/auth/use-session"
import { useLots } from "@/hooks/use-lots"
import { LotStatusBadge } from "@/components/lots/lot-status-badge"
import { LotForm } from "@/components/lots/lot-form"
import { Button } from "@/components/ui/button"
import { DashboardNav } from "@/components/layout/dashboard-nav"

// Roles allowed to create / modify lots
const WRITE_ROLES = new Set(["global_admin", "tenant_admin", "manager", "quality_manager"])

export default function LotsPage() {
  const { session } = useSession()
  const { lots, isLoading, error, refresh, createLot } = useLots()
  const [formOpen, setFormOpen] = useState(false)

  const canWrite = session ? WRITE_ROLES.has(session.user.role) : false

  return (
    <div className="p-6 space-y-6">
      <DashboardNav />
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Lotes</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => void refresh()} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
          {canWrite && (
            <Button size="sm" onClick={() => setFormOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Nuevo Lote
            </Button>
          )}
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400 mr-2" />
          <span className="text-gray-500">Cargando lotes…</span>
        </div>
      )}

      {/* Error */}
      {!isLoading && error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-700">{error}</div>
      )}

      {/* Empty */}
      {!isLoading && !error && lots.length === 0 && (
        <div className="rounded-md bg-gray-50 border border-gray-200 p-10 text-center text-sm text-gray-500">
          No hay lotes registrados
        </div>
      )}

      {/* Table */}
      {!isLoading && !error && lots.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
            <thead className="bg-gray-50">
              <tr>
                {["Código", "Especie", "Origen", "Fecha Entrada", "Cantidad (Kg)", "Estado"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {lots.map((lot) => (
                <tr key={lot.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-gray-800">{lot.code}</td>
                  <td className="px-4 py-3 text-gray-700">{lot.species}</td>
                  <td className="px-4 py-3 text-gray-700">{lot.origin}</td>
                  <td className="px-4 py-3 text-gray-500">{lot.entry_date}</td>
                  <td className="px-4 py-3 text-gray-700">{lot.quantity_kg} kg</td>
                  <td className="px-4 py-3">
                    <LotStatusBadge status={lot.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create form dialog */}
      <LotForm open={formOpen} onOpenChange={setFormOpen} onSubmit={createLot} />
    </div>
  )
}
