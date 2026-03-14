"use client"

import { Edit, Check, X, Clock, Package, BarChart3, AlertTriangle, Eye, Settings, FlaskConical } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface PendingApproval {
  id: string
  title: string
  monitor: string
  modifiedTime: string
  status: "pending" | "approved" | "rejected"
}

interface QualityManagerDashboardProps {
  pendingApprovals: PendingApproval[]
}

export function QualityManagerDashboard({ pendingApprovals }: QualityManagerDashboardProps) {
  return (
    <Card className="w-full bg-white/90 backdrop-blur-sm shadow-lg rounded-xl border border-blue-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-blue-800 flex items-center gap-2">
          <FlaskConical className="h-5 w-5 text-amber-600" />
          Panel Jefe de Calidad
        </CardTitle>
        <Badge className="text-xs font-medium bg-amber-100 text-amber-700 w-fit">
          <Edit className="h-3 w-3 mr-1" />
          Gestión y Autorización
        </Badge>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Métricas Clave de Calidad - Más visuales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-emerald-50 p-4 rounded-lg text-center shadow-sm border border-emerald-100">
            <BarChart3 className="h-6 w-6 mx-auto text-emerald-600 mb-2" />
            <p className="text-xl font-bold text-emerald-800">98.5%</p>
            <p className="text-xs text-gray-600">Calidad Promedio</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg text-center shadow-sm border border-red-100">
            <AlertTriangle className="h-6 w-6 mx-auto text-red-600 mb-2" />
            <p className="text-xl font-bold text-red-800">1.2%</p>
            <p className="text-xs text-gray-600">Tasa de Rechazo</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg text-center shadow-sm border border-blue-100">
            <Package className="h-6 w-6 mx-auto text-blue-600 mb-2" />
            <p className="text-xl font-bold text-blue-800">12</p>
            <p className="text-xs text-gray-600">Lotes Activos</p>
          </div>
          <div className="bg-amber-50 p-4 rounded-lg text-center shadow-sm border border-amber-100">
            <Clock className="h-6 w-6 mx-auto text-amber-600 mb-2" />
            <p className="text-xl font-bold text-amber-800">5</p>
            <p className="text-xs text-gray-600">Planillas Pendientes</p>
          </div>
        </div>

        {/* Procesos de Lotes en Curso - Barras de progreso más claras */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700">Lotes en Proceso de Calidad</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span>Salmón Atlántico - Lote SA-2024-001</span>
              <Badge className="text-xs font-medium bg-blue-100 text-blue-700">Inspección</Badge>
            </div>
            <Progress value={70} className="h-2 bg-gray-200 [&>*]:bg-blue-500" />
            <div className="flex justify-between items-center text-sm">
              <span>Langostinos - Lote LG-2024-045</span>
              <Badge className="text-xs font-medium bg-cyan-100 text-cyan-700">Control Temp.</Badge>
            </div>
            <Progress value={45} className="h-2 bg-gray-200 [&>*]:bg-cyan-500" />
          </div>
        </div>

        {/* Planillas Pendientes de Autorización */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700">Planillas Pendientes de Autorización</h4>

          {pendingApprovals.slice(0, 2).map((approval) => (
            <div key={approval.id} className="border border-gray-200 rounded-lg p-3 space-y-2 bg-white shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-800">{approval.title}</p>
                  <p className="text-xs text-gray-600">Monitor: {approval.monitor}</p>
                  <p className="text-xs text-gray-500">Modificado: {approval.modifiedTime}</p>
                </div>
                <Badge className="text-xs font-medium bg-amber-100 text-amber-700">
                  <Clock className="h-3 w-3 mr-1" />
                  Pendiente
                </Badge>
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  className="flex-1 h-9 text-xs font-semibold bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 rounded-md"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Aprobar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 h-9 text-xs font-semibold border-red-300 text-red-600 hover:bg-red-50 rounded-md bg-transparent"
                >
                  <X className="h-4 w-4 mr-1" />
                  Rechazar
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 pt-2">
          <Button className="flex-1 h-10 text-base font-semibold bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 transition-all duration-300 shadow-md rounded-lg">
            <Eye className="h-4 w-4 mr-2" />
            Ver Todas las Autorizaciones
          </Button>
          <Button
            variant="outline"
            className="flex-1 h-10 text-base font-semibold border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors duration-200 rounded-lg bg-transparent"
          >
            <Settings className="h-4 w-4 mr-2" />
            Configurar Procesos
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
