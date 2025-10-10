"use client"

import { BarChart3, Fish, CheckCircle, Clock, TrendingUp, Eye, Settings, UserCheck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface ManagerDashboardProps {
  companyName: string
}

export function ManagerDashboard({ companyName }: ManagerDashboardProps) {
  return (
    <Card className="w-full bg-white/90 backdrop-blur-sm shadow-lg rounded-xl border border-blue-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-blue-800 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-emerald-600" />
          Panel Gerente - {companyName}
        </CardTitle>
        <Badge className="text-xs font-medium bg-emerald-100 text-emerald-700 w-fit">
          <UserCheck className="h-3 w-3 mr-1" />
          Acceso Total
        </Badge>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Métricas Principales - Más visuales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg text-center shadow-sm border border-blue-100">
            <Fish className="h-6 w-6 mx-auto text-blue-600 mb-2" />
            <p className="text-xl font-bold text-blue-800">1,247</p>
            <p className="text-xs text-gray-600">Lotes Activos</p>
          </div>
          <div className="bg-emerald-50 p-4 rounded-lg text-center shadow-sm border border-emerald-100">
            <CheckCircle className="h-6 w-6 mx-auto text-emerald-600 mb-2" />
            <p className="text-xl font-bold text-emerald-800">98.5%</p>
            <p className="text-xs text-gray-600">Calidad Promedio</p>
          </div>
          <div className="bg-amber-50 p-4 rounded-lg text-center shadow-sm border border-amber-100">
            <Clock className="h-6 w-6 mx-auto text-amber-600 mb-2" />
            <p className="text-xl font-bold text-amber-800">23</p>
            <p className="text-xs text-gray-600">Planillas Pendientes</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center shadow-sm border border-purple-100">
            <TrendingUp className="h-6 w-6 mx-auto text-purple-600 mb-2" />
            <p className="text-xl font-bold text-purple-800">$2.1M</p>
            <p className="text-xs text-gray-600">Exportaciones (YTD)</p>
          </div>
        </div>

        {/* Procesos en Curso - Barras de progreso más claras */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700">Procesos de Lotes en Curso</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span>Salmón Atlántico - Lote SA-2024-001</span>
              <Badge className="text-xs font-medium bg-blue-100 text-blue-700">Congelado</Badge>
            </div>
            <Progress value={85} className="h-2 bg-gray-200 [&>*]:bg-blue-500" />
            <div className="flex justify-between items-center text-sm">
              <span>Langostinos - Lote LG-2024-045</span>
              <Badge className="text-xs font-medium bg-cyan-100 text-cyan-700">Enfriado</Badge>
            </div>
            <Progress value={60} className="h-2 bg-gray-200 [&>*]:bg-cyan-500" />
          </div>
        </div>

        {/* Acciones - Botones con gradiente */}
        <div className="flex gap-3 pt-2">
          <Button className="flex-1 h-10 text-base font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-md rounded-lg">
            <Eye className="h-4 w-4 mr-2" />
            Ver Todos los Lotes
          </Button>
          <Button
            variant="outline"
            className="flex-1 h-10 text-base font-semibold border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors duration-200 rounded-lg bg-transparent"
          >
            <Settings className="h-4 w-4 mr-2" />
            Configuración de Empresa
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
