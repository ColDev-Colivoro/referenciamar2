"use client"

import { useState } from "react"
import { Loader2, Package, Plus } from "lucide-react"

import { useLots } from "@/hooks/use-lots"
import { LotStatusBadge } from "@/components/lots/lot-status-badge"
import { LotForm } from "@/components/lots/lot-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function LotManagement() {
  const { lots, isLoading, error, createLot } = useLots()
  const [formOpen, setFormOpen] = useState(false)

  const pending = lots.filter((l) => l.status === "pending").length
  const inProcess = lots.filter((l) => l.status === "in_process").length
  const approved = lots.filter((l) => l.status === "approved").length

  return (
    <Card className="w-full bg-white/90 backdrop-blur-sm shadow-lg rounded-xl border border-blue-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-blue-800 flex items-center gap-2">
          <Package className="h-5 w-5 text-blue-600" />
          Gestión de Lotes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Resumen de Lotes */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-yellow-50 p-2 rounded-lg shadow-sm border border-yellow-100">
            <p className="text-xl font-bold text-yellow-800">{pending}</p>
            <p className="text-xs text-gray-600">Pendientes</p>
          </div>
          <div className="bg-blue-50 p-2 rounded-lg shadow-sm border border-blue-100">
            <p className="text-xl font-bold text-blue-800">{inProcess}</p>
            <p className="text-xs text-gray-600">En Proceso</p>
          </div>
          <div className="bg-emerald-50 p-2 rounded-lg shadow-sm border border-emerald-100">
            <p className="text-xl font-bold text-emerald-800">{approved}</p>
            <p className="text-xs text-gray-600">Aprobados</p>
          </div>
        </div>

        {/* Crear Nuevo Lote */}
        <div className="border-t pt-4 mt-4 border-gray-200">
          <Button
            className="w-full h-10 text-base font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-md rounded-lg"
            onClick={() => setFormOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Crear Lote
          </Button>
        </div>

        {/* Lista de Lotes */}
        <div className="space-y-3 border-t pt-4 mt-4 border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700">Lotes Recientes</h4>

          {isLoading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-gray-400 mr-2" />
              <span className="text-xs text-gray-500">Cargando…</span>
            </div>
          )}

          {!isLoading && error && (
            <p className="text-xs text-red-600">{error}</p>
          )}

          {!isLoading && !error && lots.length === 0 && (
            <p className="text-xs text-gray-500 text-center py-4">No hay lotes registrados</p>
          )}

          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {lots.map((lot) => (
              <div key={lot.id} className="border border-gray-200 rounded-lg p-3 space-y-1 bg-white shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{lot.code}</p>
                    <p className="text-xs text-gray-600">
                      <span className="font-medium">{lot.species}</span> — {lot.origin}
                    </p>
                    <p className="text-xs text-gray-500">{lot.quantity_kg} kg · {lot.entry_date}</p>
                  </div>
                  <LotStatusBadge status={lot.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <LotForm open={formOpen} onOpenChange={setFormOpen} onSubmit={createLot} />
      </CardContent>
    </Card>
  )
}
