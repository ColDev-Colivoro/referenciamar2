"use client"

import { Search, Clock, CheckCircle, AlertTriangle, FileText, Edit, Package } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function AuditPanel() {
  const auditLogs = [
    {
      id: "AUD-001",
      action: "Planilla Temperatura Modificada",
      user: "Juan Pérez (Monitor)",
      timestamp: "10:30 AM",
      lot: "SA-2024-001",
      status: "info",
    },
    {
      id: "AUD-002",
      action: "Autorización Aprobada",
      user: "Ana García (Jefe Calidad)",
      timestamp: "10:45 AM",
      lot: "FT-Merluza",
      status: "success",
    },
    {
      id: "AUD-003",
      action: "Planilla Rechazada",
      user: "Carlos Ruiz (Gerente)",
      timestamp: "09:15 AM",
      lot: "Control Sanitario",
      status: "error",
    },
    {
      id: "AUD-004",
      action: "Nuevo Lote Creado",
      user: "Ana García (Jefe Calidad)",
      timestamp: "08:00 AM",
      lot: "LG-2024-046",
      status: "info",
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "info":
        return <Badge className="text-xs font-medium bg-blue-100 text-blue-700">Info</Badge>
      case "success":
        return <Badge className="text-xs font-medium bg-emerald-100 text-emerald-700">Éxito</Badge>
      case "error":
        return <Badge className="text-xs font-medium bg-red-100 text-red-700">Error</Badge>
      default:
        return <Badge className="text-xs font-medium bg-gray-100 text-gray-700">Evento</Badge>
    }
  }

  const getActionIcon = (action: string) => {
    if (action.includes("Modificada")) return <Edit className="h-4 w-4 text-blue-600" />
    if (action.includes("Aprobada")) return <CheckCircle className="h-4 w-4 text-emerald-600" />
    if (action.includes("Rechazada")) return <AlertTriangle className="h-4 w-4 text-red-600" />
    if (action.includes("Creado")) return <Package className="h-4 w-4 text-purple-600" />
    return <FileText className="h-4 w-4 text-gray-600" />
  }

  return (
    <Card className="w-full bg-white/90 backdrop-blur-sm shadow-lg rounded-xl border border-blue-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-blue-800 flex items-center gap-2">
          <Search className="h-5 w-5 text-indigo-600" />
          Auditoría Reciente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700">Últimos Eventos</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
            {auditLogs.map((log) => (
              <div key={log.id} className="border border-gray-200 rounded-lg p-3 space-y-1 bg-white shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    {getActionIcon(log.action)}
                    <span className="text-sm font-semibold text-gray-800">{log.action}</span>
                  </div>
                  {getStatusBadge(log.status)}
                </div>
                <p className="text-xs text-gray-600">
                  Usuario: <span className="font-medium">{log.user}</span>
                </p>
                <p className="text-xs text-gray-500">
                  Lote/Documento: <span className="font-medium">{log.lot}</span>
                </p>
                <p className="text-xs text-gray-500">Hora: {log.timestamp}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200 text-sm">
          <p className="font-medium text-indigo-800 flex items-center gap-2">
            <Clock className="h-4 w-4 text-indigo-600" />
            Historial de Auditoría
          </p>
          <p className="text-indigo-600 mt-1">
            Todos los eventos del sistema son registrados para trazabilidad completa.
          </p>
          <Button
            size="sm"
            variant="outline"
            className="mt-3 w-full text-xs font-semibold border-indigo-300 text-indigo-700 hover:bg-indigo-100 rounded-md bg-transparent"
          >
            <FileText className="h-3 w-3 mr-1" />
            Ver Reporte Completo
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
