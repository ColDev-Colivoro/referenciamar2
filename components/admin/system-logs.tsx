"use client"

import { FileText, AlertTriangle, Info, XCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function SystemLogs() {
  const logs = [
    {
      id: "LOG-001",
      timestamp: "2024-03-15 14:30:25",
      action: "company_created",
      user: "ColDev Admin",
      details: "Nueva empresa creada: Exportadora Marina",
      level: "info",
      ip: "192.168.1.100",
    },
    {
      id: "LOG-002",
      timestamp: "2024-03-15 13:45:12",
      action: "user_login_failed",
      user: "unknown",
      details: "Intento de login fallido desde IP sospechosa",
      level: "warning",
      ip: "45.123.45.67",
    },
    {
      id: "LOG-003",
      timestamp: "2024-03-15 12:20:08",
      action: "system_backup",
      user: "System",
      details: "Backup automático completado exitosamente",
      level: "info",
      ip: "localhost",
    },
    {
      id: "LOG-004",
      timestamp: "2024-03-15 11:15:33",
      action: "config_changed",
      user: "ColDev Admin",
      details: "Configuración de seguridad actualizada",
      level: "info",
      ip: "192.168.1.100",
    },
    {
      id: "LOG-005",
      timestamp: "2024-03-15 10:05:17",
      action: "database_error",
      user: "System",
      details: "Error temporal en conexión a base de datos",
      level: "error",
      ip: "localhost",
    },
  ]

  const getLevelBadge = (level: string) => {
    switch (level) {
      case "error":
        return <Badge className="text-xs font-medium bg-red-100 text-red-700">Error</Badge>
      case "warning":
        return <Badge className="text-xs font-medium bg-amber-100 text-amber-700">Advertencia</Badge>
      case "info":
        return <Badge className="text-xs font-medium bg-blue-100 text-blue-700">Info</Badge>
      default:
        return <Badge className="text-xs font-medium bg-gray-100 text-gray-700">Debug</Badge>
    }
  }

  const getActionIcon = (level: string) => {
    switch (level) {
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-amber-600" />
      case "info":
        return <Info className="h-4 w-4 text-blue-600" />
      default:
        return <FileText className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <Card className="w-full bg-white/90 backdrop-blur-sm shadow-lg rounded-xl border border-blue-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-blue-800 flex items-center gap-2">
          <FileText className="h-5 w-5 text-gray-600" />
          Logs del Sistema
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Filtros */}
        <div className="grid grid-cols-2 gap-3">
          <Select>
            <SelectTrigger className="h-10 text-base border-blue-300 focus:border-blue-500">
              <SelectValue placeholder="Filtrar por nivel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="error">Errores</SelectItem>
              <SelectItem value="warning">Advertencias</SelectItem>
              <SelectItem value="info">Información</SelectItem>
            </SelectContent>
          </Select>
          <Input placeholder="Buscar en logs..." className="h-10 text-base border-blue-300 focus:border-blue-500" />
        </div>

        {/* Lista de Logs */}
        <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
          {logs.map((log) => (
            <div key={log.id} className="border border-gray-200 rounded-lg p-3 space-y-1 bg-white shadow-sm">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  {getActionIcon(log.level)}
                  <span className="text-sm font-semibold text-gray-800">{log.timestamp.split(" ")[1]}</span>
                </div>
                {getLevelBadge(log.level)}
              </div>
              <p className="text-sm font-medium text-gray-700">{log.details}</p>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Usuario: {log.user}</span>
                <span>IP: {log.ip}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Estadísticas */}
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm">
          <p className="font-medium text-gray-800">Resumen Últimas 24 horas</p>
          <p className="text-gray-600 mt-1">
            <span className="font-semibold">1</span> error • <span className="font-semibold">2</span> advertencias •{" "}
            <span className="font-semibold">15</span> eventos info
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
