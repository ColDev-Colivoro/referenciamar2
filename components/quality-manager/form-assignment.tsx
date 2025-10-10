"use client"

import { FileText, Plus, Edit, Trash2, CheckCircle, XCircle, ClipboardList } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface FormTemplate {
  id: string
  name: string
  assignedTo: string
  status: "active" | "inactive"
}

interface FormAssignmentProps {
  forms: FormTemplate[]
}

export function FormAssignment({ forms }: FormAssignmentProps) {
  const getStatusBadge = (status: FormTemplate["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="text-xs font-medium bg-emerald-100 text-emerald-700">Activa</Badge>
      case "inactive":
        return <Badge className="text-xs font-medium bg-gray-100 text-gray-700">Inactiva</Badge>
      default:
        return <Badge className="text-xs font-medium bg-gray-100 text-gray-700">Desconocido</Badge>
    }
  }

  const getStatusIcon = (status: FormTemplate["status"]) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-emerald-600" />
      case "inactive":
        return <XCircle className="h-4 w-4 text-gray-600" />
      default:
        return <FileText className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <Card className="w-full bg-white/90 backdrop-blur-sm shadow-lg rounded-xl border border-blue-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-blue-800 flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-purple-600" />
          Asignación de Planillas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Crear Nueva Planilla */}
        <div className="space-y-3 border-b pb-4 mb-4 border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700">Crear/Asignar Nueva Planilla</h4>
          <Input
            placeholder="Nombre de la Planilla (Ej: Ficha Técnica)"
            className="h-10 text-base border-blue-300 focus:border-blue-500"
          />
          <Select>
            <SelectTrigger className="h-10 text-base border-blue-300 focus:border-blue-500">
              <SelectValue placeholder="Asignar a..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-lots">Todos los Lotes</SelectItem>
              <SelectItem value="specific-lot">Lote Específico</SelectItem>
              <SelectItem value="product-type">Tipo de Producto</SelectItem>
              <SelectItem value="monitor">Monitor Específico</SelectItem>
            </SelectContent>
          </Select>
          <Button className="w-full h-10 text-base font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-md rounded-lg">
            <Plus className="h-4 w-4 mr-2" />
            Guardar Planilla
          </Button>
        </div>

        {/* Lista de Planillas */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700">Planillas Activas</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {forms.map((form) => (
              <div key={form.id} className="border border-gray-200 rounded-lg p-3 space-y-1 bg-white shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(form.status)}
                    <span className="text-sm font-semibold text-gray-800">{form.name}</span>
                  </div>
                  {getStatusBadge(form.status)}
                </div>
                <p className="text-xs text-gray-600">
                  Asignada a: <span className="font-medium">{form.assignedTo}</span>
                </p>
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 h-9 text-xs font-semibold border-gray-300 text-gray-700 hover:bg-gray-100 rounded-md bg-transparent"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
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

        {/* Resumen */}
        <div className="bg-purple-50 p-3 rounded-lg border border-purple-200 text-sm">
          <p className="font-medium text-purple-800">Resumen de Planillas</p>
          <p className="text-purple-600 mt-1">
            <span className="font-semibold">4</span> plantillas activas • <span className="font-semibold">1</span>{" "}
            inactiva • <span className="font-semibold">2</span> pendientes de revisión
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
