"use client"

import { Package, Fish, Truck, Clock, Factory, CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export function ProductionOverview() {
  const productionData = [
    {
      product: "Salmón Atlántico",
      batch: "SA-2024-001",
      quantity: "2,500 kg",
      status: "processing",
      progress: 75,
      estimatedCompletion: "2 horas",
      quality: 98.5,
    },
    {
      product: "Merluza Austral",
      batch: "MA-2024-023",
      quantity: "1,800 kg",
      status: "quality-check",
      progress: 90,
      estimatedCompletion: "30 min",
      quality: 97.2,
    },
    {
      product: "Langostinos",
      batch: "LG-2024-045",
      quantity: "950 kg",
      status: "packaging",
      progress: 95,
      estimatedCompletion: "15 min",
      quality: 99.1,
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "processing":
        return <Badge className="text-xs font-medium bg-blue-100 text-blue-700">Procesando</Badge>
      case "quality-check":
        return <Badge className="text-xs font-medium bg-amber-100 text-amber-700">Control Calidad</Badge>
      case "packaging":
        return <Badge className="text-xs font-medium bg-emerald-100 text-emerald-700">Empacando</Badge>
      case "ready":
        return <Badge className="text-xs font-medium bg-purple-100 text-purple-700">Listo</Badge>
      default:
        return <Badge className="text-xs font-medium bg-gray-100 text-gray-700">Desconocido</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "processing":
        return <Factory className="h-4 w-4 text-blue-600" />
      case "quality-check":
        return <Fish className="h-4 w-4 text-amber-600" />
      case "packaging":
        return <Package className="h-4 w-4 text-emerald-600" />
      case "ready":
        return <Truck className="h-4 w-4 text-purple-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <Card className="w-full bg-white/90 backdrop-blur-sm shadow-lg rounded-xl border border-blue-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-blue-800 flex items-center gap-2">
          <Package className="h-5 w-5 text-indigo-600" />
          Resumen de Producción - Tiempo Real
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Métricas de Producción */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-blue-50 p-4 rounded-lg text-center shadow-sm border border-blue-100">
            <Package className="h-6 w-6 mx-auto text-blue-600 mb-2" />
            <p className="text-xl font-bold text-blue-800">5,250</p>
            <p className="text-xs text-gray-600">kg Hoy</p>
          </div>
          <div className="bg-emerald-50 p-4 rounded-lg text-center shadow-sm border border-emerald-100">
            <Fish className="h-6 w-6 mx-auto text-emerald-600 mb-2" />
            <p className="text-xl font-bold text-emerald-800">3</p>
            <p className="text-xs text-gray-600">Lotes Activos</p>
          </div>
          <div className="bg-amber-50 p-4 rounded-lg text-center shadow-sm border border-amber-100">
            <Clock className="h-6 w-6 mx-auto text-amber-600 mb-2" />
            <p className="text-xl font-bold text-amber-800">2.5</p>
            <p className="text-xs text-gray-600">hrs Promedio</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center shadow-sm border border-purple-100">
            <Truck className="h-6 w-6 mx-auto text-purple-600 mb-2" />
            <p className="text-xl font-bold text-purple-800">98.3%</p>
            <p className="text-xs text-gray-600">Calidad General</p>
          </div>
        </div>

        {/* Lotes en Producción */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700">Lotes en Producción</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
            {productionData.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3 bg-white shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(item.status)}
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{item.product}</p>
                      <p className="text-xs text-gray-600">
                        Lote: {item.batch} ({item.quantity})
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(item.status)}
                    <p className="text-xs text-emerald-600 font-medium mt-1">Calidad: {item.quality}%</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progreso</span>
                    <span className="font-medium text-gray-800">
                      {item.progress}% - {item.estimatedCompletion} restantes
                    </span>
                  </div>
                  <Progress value={item.progress} className="h-2 bg-gray-200 [&>*]:bg-blue-500" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alertas de Producción */}
        <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 text-sm">
          <p className="font-medium text-emerald-800 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            Estado de Producción: Todos los lotes dentro de los tiempos estimados.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
