"use client"

import { FileText, Download, Calendar, BarChart3, Settings } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function ReportsPanel() {
  const reports = [
    { name: "Reporte Diario de Calidad", lastGenerated: "Hoy 08:00", size: "2.3 MB", type: "daily" },
    { name: "Cumplimiento Mensual", lastGenerated: "01/03/2024", size: "5.1 MB", type: "monthly" },
    { name: "Análisis de Tendencias", lastGenerated: "28/02/2024", size: "8.7 MB", type: "analysis" },
    { name: "Auditoría Semanal", lastGenerated: "11/03/2024", size: "3.2 MB", type: "audit" },
  ]

  return (
    <Card className="w-full bg-white/90 backdrop-blur-sm shadow-lg rounded-xl border border-blue-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-blue-800 flex items-center gap-2">
          <FileText className="h-5 w-5 text-purple-600" />
          Centro de Reportes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Generación Rápida */}
        <div className="space-y-3 border-b pb-4 border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700">Generar Nuevo Reporte</h4>
          <div className="grid grid-cols-2 gap-3">
            <Select>
              <SelectTrigger className="h-10 text-base border-blue-300 focus:border-blue-500">
                <SelectValue placeholder="Tipo de reporte" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Diario de Calidad</SelectItem>
                <SelectItem value="weekly">Semanal de Producción</SelectItem>
                <SelectItem value="monthly">Mensual de Cumplimiento</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="h-10 text-base border-blue-300 focus:border-blue-500">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hoy</SelectItem>
                <SelectItem value="week">Esta semana</SelectItem>
                <SelectItem value="month">Este mes</SelectItem>
                <SelectItem value="quarter">Este trimestre</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button className="w-full h-10 text-base font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-md rounded-lg">
            <BarChart3 className="h-4 w-4 mr-2" />
            Generar Reporte
          </Button>
        </div>

        {/* Reportes Recientes */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700">Reportes Recientes</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {reports.map((report, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-3 space-y-1 bg-white shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{report.name}</p>
                    <p className="text-xs text-gray-600">Generado: {report.lastGenerated}</p>
                    <p className="text-xs text-gray-500">Tamaño: {report.size}</p>
                  </div>
                  <Button size="sm" variant="ghost" className="h-9 w-9 text-blue-600 hover:bg-blue-50 rounded-full">
                    <Download className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Programación Automática */}
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 text-sm">
          <p className="font-medium text-blue-800 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            Reportes Automáticos Programados
          </p>
          <p className="text-blue-600 mt-1">
            Diario: <span className="font-semibold">08:00 AM</span> • Semanal:{" "}
            <span className="font-semibold">Lunes 07:00 AM</span> • Mensual:{" "}
            <span className="font-semibold">1er día 06:00 AM</span>
          </p>
          <Button
            size="sm"
            variant="outline"
            className="mt-3 w-full text-xs font-semibold border-blue-300 text-blue-700 hover:bg-blue-100 rounded-md bg-transparent"
          >
            <Settings className="h-3 w-3 mr-1" />
            Gestionar Programación
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
