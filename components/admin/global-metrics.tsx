"use client"

import { BarChart3, TrendingUp, AlertTriangle, CheckCircle, Server, HardDrive } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export function GlobalMetrics() {
  return (
    <Card className="w-full bg-white/90 backdrop-blur-sm shadow-lg rounded-xl border border-blue-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-blue-800 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-indigo-600" />
          Métricas Globales del Sistema
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* KPIs Principales */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-emerald-50 p-4 rounded-lg text-center shadow-sm border border-emerald-100">
            <CheckCircle className="h-6 w-6 mx-auto text-emerald-600 mb-2" />
            <p className="text-xl font-bold text-emerald-800">99.8%</p>
            <p className="text-xs text-gray-600">Disponibilidad</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg text-center shadow-sm border border-blue-100">
            <TrendingUp className="h-6 w-6 mx-auto text-blue-600 mb-2" />
            <p className="text-xl font-bold text-blue-800">+12%</p>
            <p className="text-xs text-gray-600">Crecimiento Mensual</p>
          </div>
        </div>

        {/* Uso del Sistema */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700">Uso del Sistema</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Planillas Procesadas</span>
              <span className="font-medium text-gray-800">3,595 / 4,000</span>
            </div>
            <Progress value={90} className="h-2 bg-gray-200 [&>*]:bg-blue-500" />

            <div className="flex justify-between text-sm">
              <span>Almacenamiento Usado</span>
              <span className="font-medium text-gray-800">2.3 GB / 10 GB</span>
            </div>
            <Progress value={23} className="h-2 bg-gray-200 [&>*]:bg-purple-500" />
          </div>
        </div>

        {/* Estado del Sistema */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700">Estado del Sistema</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Server className="h-4 w-4 text-emerald-600" />
              <span>Servidores operativos</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <HardDrive className="h-4 w-4 text-emerald-600" />
              <span>Base de datos estable</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span>Mantenimiento programado: Dom 2:00 AM</span>
            </div>
          </div>
        </div>

        {/* Estadísticas Mensuales */}
        <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200 text-sm">
          <p className="font-medium text-indigo-800">Resumen del Mes</p>
          <p className="text-indigo-600 mt-1">
            <span className="font-semibold">+2</span> empresas nuevas • <span className="font-semibold">+15</span>{" "}
            usuarios • <span className="font-semibold">98.5%</span> uptime
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
