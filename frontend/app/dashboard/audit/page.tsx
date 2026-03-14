"use client"

import { useState } from "react"
import { Loader2, RefreshCw } from "lucide-react"

import { useSession } from "@/lib/auth/use-session"
import { useAudit } from "@/hooks/use-audit"
import { Button } from "@/components/ui/button"
import { DashboardNav } from "@/components/layout/dashboard-nav"

const AUDIT_ROLES = new Set(["global_admin", "tenant_admin"])

const LEVEL_STYLES: Record<string, string> = {
  info: "bg-primary/10 text-primary border-primary/30",
  warning: "bg-yellow-50 text-yellow-700 border-yellow-200",
  error: "bg-red-50 text-red-700 border-red-200",
}

export default function AuditPage() {
  const { session } = useSession()
  const [pendingFilters, setPendingFilters] = useState({ action: "", date_from: "", date_to: "" })
  const { events, total, isLoading, error, setFilters, refresh } = useAudit()

  const canView = session ? AUDIT_ROLES.has(session.user.role) : false

  if (session && !canView) {
    return (
      <div className="p-6">
        <div className="rounded-md bg-red-50 border border-red-200 p-6 text-center text-sm text-red-700">
          Acceso denegado — se requiere rol <strong>global_admin</strong> o <strong>tenant_admin</strong>.
        </div>
      </div>
    )
  }

  const applyFilters = () => {
    setFilters({
      action: pendingFilters.action || undefined,
      date_from: pendingFilters.date_from || undefined,
      date_to: pendingFilters.date_to || undefined,
    })
  }

  return (
    <div className="p-6 space-y-6">
      <DashboardNav />
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Auditoría</h1>
        <Button variant="outline" size="sm" onClick={() => void refresh()} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Acción</label>
          <input
            type="text"
            placeholder="Ej: lot.created"
            value={pendingFilters.action}
            onChange={(e) => setPendingFilters((f) => ({ ...f, action: e.target.value }))}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Desde</label>
          <input
            type="date"
            value={pendingFilters.date_from}
            onChange={(e) => setPendingFilters((f) => ({ ...f, date_from: e.target.value }))}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Hasta</label>
          <input
            type="date"
            value={pendingFilters.date_to}
            onChange={(e) => setPendingFilters((f) => ({ ...f, date_to: e.target.value }))}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <Button size="sm" onClick={applyFilters} disabled={isLoading}>
          Aplicar
        </Button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400 mr-2" />
          <span className="text-gray-500">Cargando eventos…</span>
        </div>
      )}

      {/* Error */}
      {!isLoading && error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-700">{error}</div>
      )}

      {/* Empty */}
      {!isLoading && !error && events.length === 0 && (
        <div className="rounded-md bg-gray-50 border border-gray-200 p-10 text-center text-sm text-gray-500">
          No hay eventos de auditoría
        </div>
      )}

      {/* Table */}
      {!isLoading && !error && events.length > 0 && (
        <>
          <p className="text-sm text-gray-500">
            Total: <span className="font-medium text-gray-800">{total}</span> eventos
          </p>
          <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {["Fecha", "Actor", "Acción", "Nivel", "Metadata"].map((h) => (
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
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {new Date(event.created_at).toLocaleString("es-CL")}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {event.actor_username ?? event.actor_email ?? "—"}
                    </td>
                    <td className="px-4 py-3 font-mono text-gray-800">{event.action}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium ${LEVEL_STYLES[event.level] ?? ""}`}
                      >
                        {event.level}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs max-w-xs truncate">
                      {JSON.stringify(event.metadata).slice(0, 80)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
