"use client"

import { Package, FlaskConical, CheckCircle, Clock, AlertTriangle, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"

interface Lot {
  id: string
  name: string
  status: "active" | "processing" | "completed" | "on-hold"
  product: string
  quantity: string
  created: string
  currentProcess: string
  progress: number
  qualityScore: number
}

interface ProcessMonitoringProps {
  lots: Lot[]
}

export function ProcessMonitoring({ lots }: ProcessMonitoringProps) {
  const getStatusBadge = (status: Lot["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="text-xs font-medium bg-blue-100 text-blue-700">Activo</Badge>
      case "processing":
        return <Badge className="text-xs font-medium bg-amber-100 text-amber-700">En Proceso</Badge>
      case "completed":
        return <Badge className="text-xs font-medium bg-emerald-100 text-emerald-700">Completado</Badge>
      case "on-hold":
        return <Badge className="text-xs font-medium bg-red-100 text-red-700">En Espera</Badge>
      default:
        return <Badge className="text-xs font-medium bg-gray-100 text-gray-700">Desconocido</Badge>
    }
  }

  const getProcessIcon = (process: string) => {
    if (process.includes("Inspección")) return <FlaskConical className="h-4 w-4 text-blue-600" />
    if (process.includes("Temperatura")) return <Clock className="h-4 w-4 text-cyan-600" />
    if (process.includes("Empaque")) return <Package className="h-4 w-4 text-emerald-600" />
    return <TrendingUp className="h-4 w-4 text-gray-600" />
  }

  return (
    <Card className="w-full bg-white/90 backdrop-blur-sm shadow-lg rounded-xl border border-blue-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-blue-800 flex items-center gap-2">
          <FlaskConical className="h-5 w-5 text-amber-600" />
          Monitoreo de Procesos de Calidad
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Resumen de Procesos */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-blue-50 p-4 rounded-lg text-center shadow-sm border border-blue-100">
            <Package className="h-6 w-6 mx-auto text-blue-600 mb-2" />
            <p className="text-xl font-bold text-blue-800">{lots.length}</p>
            <p className="text-xs text-gray-600">Total Lotes</p>
          </div>
          <div className="bg-emerald-50 p-4 rounded-lg text-center shadow-sm border border-emerald-100">
            <CheckCircle className="h-6 w-6 mx-auto text-emerald-600 mb-2" />
            <p className="text-xl font-bold text-emerald-800">{lots.filter((l) => l.qualityScore >= 95).length}</p>
            <p className="text-xs text-gray-600">Lotes Alta Calidad</p>
          </div>
          <div className="bg-amber-50 p-4 rounded-lg text-center shadow-sm border border-amber-100">
            <AlertTriangle className="h-6 w-6 mx-auto text-amber-600 mb-2" />
            <p className="text-xl font-bold text-amber-800">{lots.filter((l) => l.qualityScore < 95).length}</p>
            <p className="text-xs text-gray-600">Lotes con Alerta</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center shadow-sm border border-purple-100">
            <Clock className="h-6 w-6 mx-auto text-purple-600 mb-2" />
            <p className="text-xl font-bold text-purple-800">2.1</p>
            <p className="text-xs text-gray-600">hrs/Lote Prom.</p>
          </div>
        </div>

        {/* Lotes en Monitoreo */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700">Lotes en Monitoreo Activo</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
            {lots
              .filter((l) => l.status === "active" || l.status === "processing")
              .map((lot) => (
                <div key={lot.id} className="border border-gray-200 rounded-lg p-4 space-y-3 bg-white shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      {getProcessIcon(lot.currentProcess)}
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{lot.name}</p>
                        <p className="text-xs text-gray-600">
                          Producto: <span className="font-medium">{lot.product}</span> ({lot.quantity})
                        </p>
                        <p className="text-xs text-gray-500">
                          Proceso Actual: <span className="font-medium">{lot.currentProcess}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(lot.status)}
                      <p className="text-xs text-emerald-600 font-medium mt-1">Calidad: {lot.qualityScore}%</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progreso del Proceso</span>
                      <span className="font-medium text-gray-800">{lot.progress}%</span>
                    </div>
                    <Progress value={lot.progress} className="h-2 bg-gray-200 [&>*]:bg-blue-500" />
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full h-9 text-xs font-semibold border-gray-300 text-gray-700 hover:bg-gray-100 rounded-md bg-transparent"
                  >
                    Ver Detalles del Lote
                  </Button>
                </div>
              ))}
          </div>
        </div>

        {/* Alertas de Procesos */}
        <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-sm">
          <p className="font-medium text-amber-800 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            Alerta: <span className="font-semibold">1 lote con retraso en control de calidad.</span>
          </p>
          <p className="text-amber-600 mt-1">Lote MA-2024-023 requiere atención urgente.</p>
        </div>
      </CardContent>
    </Card>
  )
}
