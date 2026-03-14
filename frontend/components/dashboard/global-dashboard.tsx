"use client"

import { Globe, Building2, Users, TrendingUp, Shield, Settings } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export function GlobalDashboard() {
  return (
    <Card className="w-full bg-white/90 backdrop-blur-sm shadow-lg rounded-xl border border-blue-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-blue-800 flex items-center gap-2">
          <Globe className="h-5 w-5 text-indigo-600" />
          Panel Administrador Global
        </CardTitle>
        <Badge className="text-xs font-medium bg-indigo-100 text-indigo-700 w-fit">
          <Shield className="h-3 w-3 mr-1" />
          ColDev-Mar2Control
        </Badge>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Métricas Globales - Más visuales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg text-center shadow-sm border border-blue-100">
            <Building2 className="h-6 w-6 mx-auto text-blue-600 mb-2" />
            <p className="text-xl font-bold text-blue-800">3</p>
            <p className="text-xs text-gray-600">Empresas Activas</p>
          </div>
          <div className="bg-emerald-50 p-4 rounded-lg text-center shadow-sm border border-emerald-100">
            <Users className="h-6 w-6 mx-auto text-emerald-600 mb-2" />
            <p className="text-xl font-bold text-emerald-800">73</p>
            <p className="text-xs text-gray-600">Usuarios Totales</p>
          </div>
          <div className="bg-amber-50 p-4 rounded-lg text-center shadow-sm border border-amber-100">
            <TrendingUp className="h-6 w-6 mx-auto text-amber-600 mb-2" />
            <p className="text-xl font-bold text-amber-800">3,595</p>
            <p className="text-xs text-gray-600">Planillas/Mes</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center shadow-sm border border-purple-100">
            <Shield className="h-6 w-6 mx-auto text-purple-600 mb-2" />
            <p className="text-xl font-bold text-purple-800">96.5%</p>
            <p className="text-xs text-gray-600">Cumplimiento</p>
          </div>
        </div>

        {/* Estado de Empresas - Barras de progreso más claras */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700">Estado de Empresas</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span>Pesquera del Sur</span>
              <Badge className="text-xs font-medium bg-emerald-100 text-emerald-700">Activa</Badge>
            </div>
            <Progress value={98} className="h-2 bg-gray-200 [&>*]:bg-emerald-500" />
            <div className="flex justify-between items-center text-sm">
              <span>Mariscos Pacífico</span>
              <Badge className="text-xs font-medium bg-emerald-100 text-emerald-700">Activa</Badge>
            </div>
            <Progress value={96} className="h-2 bg-gray-200 [&>*]:bg-emerald-500" />
            <div className="flex justify-between items-center text-sm">
              <span>Exportadora Marina</span>
              <Badge className="text-xs font-medium bg-amber-100 text-amber-700">Configuración</Badge>
            </div>
            <Progress value={75} className="h-2 bg-gray-200 [&>*]:bg-amber-500" />
          </div>
        </div>

        {/* Acciones Administrativas - Botones con gradiente */}
        <div className="flex gap-3 pt-2">
          <Button className="flex-1 text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md rounded-lg">
            <Building2 className="h-4 w-4 mr-2" />
            Nueva Empresa
          </Button>
          <Button
            variant="outline"
            className="flex-1 text-sm font-semibold border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors duration-200 rounded-lg bg-transparent"
          >
            <Settings className="h-4 w-4 mr-2" />
            Configurar Sistema
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
