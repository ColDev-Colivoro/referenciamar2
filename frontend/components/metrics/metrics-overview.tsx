"use client"

import { Users, CheckCircle, AlertTriangle, BarChart2, Activity } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export function MetricsOverview() {
  return (
    <Card className="w-full bg-white/90 backdrop-blur-sm shadow-lg rounded-xl border border-blue-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-blue-800 flex items-center gap-2">
          <BarChart2 className="h-5 w-5 text-purple-600" />
          Métricas Generales
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* KPIs Principales */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-emerald-50 p-4 rounded-lg text-center shadow-sm border border-emerald-100">
            <CheckCircle className="h-6 w-6 mx-auto text-emerald-600 mb-2" />
            <p className="text-xl font-bold text-emerald-800">94.2%</p>
            <p className="text-xs text-gray-600">Eficiencia Operativa</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg text-center shadow-sm border border-blue-100">
            <Users className="h-6 w-6 mx-auto text-blue-600 mb-2" />
            <p className="text-xl font-bold text-blue-800">67</p>
            <p className="text-xs text-gray-600">Usuarios Activos</p>
          </div>
        </div>

        {/* Progreso Mensual */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700">Progreso Mensual</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Planillas Completadas</span>
              <span className="font-medium text-gray-800">1,247 / 1,400</span>
            </div>
            <Progress value={89} className="h-2 bg-gray-200 [&>*]:bg-blue-500" />

            <div className="flex justify-between text-sm">
              <span>Autorizaciones Aprobadas</span>
              <span className="font-medium text-gray-800">1,156 / 1,247</span>
            </div>
            <Progress value={93} className="h-2 bg-gray-200 [&>*]:bg-emerald-500" />
          </div>
        </div>

        {/* Alertas */}
        <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-sm">
          <p className="text-amber-800 font-medium flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            Alertas Activas: <span className="font-semibold">3 planillas requieren atención urgente.</span>
          </p>
          <p className="text-amber-600 mt-1">Revisar sección de "Planillas Pendientes" para detalles.</p>
        </div>

        {/* Actividad Reciente */}
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm">
          <p className="font-medium text-gray-800 flex items-center gap-2">
            <Activity className="h-4 w-4 text-gray-600" />
            Actividad Reciente
          </p>
          <p className="text-gray-600 mt-1">
            Última actualización de datos: <span className="font-semibold">Hace 5 minutos.</span>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
