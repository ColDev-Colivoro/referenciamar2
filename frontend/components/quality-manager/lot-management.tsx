"use client"

import { Package, Plus, Edit, Trash2, Eye, CheckCircle, Clock, PauseCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

interface LotManagementProps {
  lots: Lot[]
}

export function LotManagement({ lots }: LotManagementProps) {
  const getStatusBadge = (status: Lot["status"]) => {
    switch (status) {
      case "active":
        return (
          <Badge className="text-xs font-medium bg-blue-100 text-blue-700 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> Activo
          </Badge>
        )
      case "processing":
        return (
          <Badge className="text-xs font-medium bg-amber-100 text-amber-700 flex items-center gap-1">
            <Clock className="h-3 w-3" /> En Proceso
          </Badge>
        )
      case "completed":
        return (
          <Badge className="text-xs font-medium bg-emerald-100 text-emerald-700 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> Completado
          </Badge>
        )
      case "on-hold":
        return (
          <Badge className="text-xs font-medium bg-red-100 text-red-700 flex items-center gap-1">
            <PauseCircle className="h-3 w-3" /> En Espera
          </Badge>
        )
      default:
        return <Badge className="text-xs font-medium bg-gray-100 text-gray-700">Desconocido</Badge>
    }
  }

  return (
    <Card className="w-full bg-white/90 backdrop-blur-sm shadow-lg rounded-xl border border-blue-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-blue-800 flex items-center gap-2">
          <Package className="h-5 w-5 text-blue-600" />
          Gestión de Lotes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Resumen de Lotes */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-blue-50 p-2 rounded-lg shadow-sm border border-blue-100">
            <p className="text-xl font-bold text-blue-800">
              {lots.filter((l) => l.status === "active" || l.status === "processing").length}
            </p>
            <p className="text-xs text-gray-600">Activos</p>
          </div>
          <div className="bg-emerald-50 p-2 rounded-lg shadow-sm border border-emerald-100">
            <p className="text-xl font-bold text-emerald-800">{lots.filter((l) => l.status === "completed").length}</p>
            <p className="text-xs text-gray-600">Completados</p>
          </div>
          <div className="bg-amber-50 p-2 rounded-lg shadow-sm border border-amber-100">
            <p className="text-xl font-bold text-amber-800">{lots.filter((l) => l.status === "on-hold").length}</p>
            <p className="text-xs text-gray-600">En Espera</p>
          </div>
        </div>

        {/* Crear Nuevo Lote */}
        <div className="space-y-3 border-t pt-4 mt-4 border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700">Crear Nuevo Lote</h4>
          <Input
            placeholder="Nombre del Lote (Ej: Salmón Atlántico Lote D)"
            className="h-10 text-base border-blue-300 focus:border-blue-500"
          />
          <Select>
            <SelectTrigger className="h-10 text-base border-blue-300 focus:border-blue-500">
              <SelectValue placeholder="Tipo de Producto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="salmon">Salmón</SelectItem>
              <SelectItem value="merluza">Merluza</SelectItem>
              <SelectItem value="langostinos">Langostinos</SelectItem>
              <SelectItem value="calamar">Calamar</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="Cantidad (Ej: 1500 kg)"
            className="h-10 text-base border-blue-300 focus:border-blue-500"
          />
          <Button className="w-full h-10 text-base font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-md rounded-lg">
            <Plus className="h-4 w-4 mr-2" />
            Crear Lote
          </Button>
        </div>

        {/* Lista de Lotes */}
        <div className="space-y-3 border-t pt-4 mt-4 border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700">Lotes Recientes</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {lots.map((lot) => (
              <div key={lot.id} className="border border-gray-200 rounded-lg p-3 space-y-2 bg-white shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{lot.name}</p>
                    <p className="text-xs text-gray-600">
                      Producto: <span className="font-medium">{lot.product}</span> ({lot.quantity})
                    </p>
                    <p className="text-xs text-gray-500">Creado: {lot.created}</p>
                  </div>
                  {getStatusBadge(lot.status)}
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 h-9 text-xs font-semibold border-gray-300 text-gray-700 hover:bg-gray-100 rounded-md bg-transparent"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Detalles
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-9 text-xs font-semibold border-gray-300 text-gray-700 hover:bg-gray-100 rounded-md bg-transparent"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-9 text-xs font-semibold border-red-300 text-red-600 hover:bg-red-50 rounded-md bg-transparent"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
