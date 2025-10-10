"use client"

import { Eye, FileCheck, Clock, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface VisualInspectionFormProps {
  lotNumber: string
  productType: string
}

export function VisualInspectionForm({ lotNumber, productType }: VisualInspectionFormProps) {
  return (
    <Card className="w-full bg-white/90 backdrop-blur-sm shadow-lg rounded-xl border border-blue-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-blue-800 flex items-center gap-2">
          <Eye className="h-5 w-5 text-emerald-600" />
          Planilla: Inspección Visual
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge className="text-xs font-medium bg-blue-100 text-blue-700">Lote: {lotNumber}</Badge>
          <Badge className="text-xs font-medium bg-emerald-100 text-emerald-700">{productType}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Estado General */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Estado General</label>
            <Select>
              <SelectTrigger className="h-10 text-base border-blue-300 focus:border-blue-500">
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="excelente">Excelente</SelectItem>
                <SelectItem value="bueno">Bueno</SelectItem>
                <SelectItem value="regular">Regular</SelectItem>
                <SelectItem value="deficiente">Deficiente</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Color</label>
            <Select>
              <SelectTrigger className="h-10 text-base border-blue-300 focus:border-blue-500">
                <SelectValue placeholder="Evaluar color" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="ligeramente-alterado">Ligeramente Alterado</SelectItem>
                <SelectItem value="alterado">Alterado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Observaciones */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Observaciones Detalladas</label>
          <Textarea
            placeholder="Describir apariencia, textura, defectos visibles, etc."
            className="text-base h-28 border-blue-300 focus:border-blue-500"
          />
        </div>

        {/* Verificaciones */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-gray-700">Verificaciones de Calidad</label>
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="no-parasites"
                className="h-5 w-5 border-blue-400 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
              />
              <label htmlFor="no-parasites" className="text-sm font-medium text-gray-700">
                Ausencia de parásitos visibles
              </label>
            </div>
            <div className="flex items-center space-x-3">
              <Checkbox
                id="no-damage"
                className="h-5 w-5 border-blue-400 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
              />
              <label htmlFor="no-damage" className="text-sm font-medium text-gray-700">
                Sin daños mecánicos o físicos
              </label>
            </div>
            <div className="flex items-center space-x-3">
              <Checkbox
                id="proper-size"
                className="h-5 w-5 border-blue-400 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
              />
              <label htmlFor="proper-size" className="text-sm font-medium text-gray-700">
                Tamaño y peso conforme a especificaciones
              </label>
            </div>
            <div className="flex items-center space-x-3">
              <Checkbox
                id="fresh-appearance"
                className="h-5 w-5 border-blue-400 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
              />
              <label htmlFor="fresh-appearance" className="text-sm font-medium text-gray-700">
                Apariencia fresca y saludable
              </label>
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex gap-3 pt-4">
          <Button className="flex-1 h-10 text-base font-semibold bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 transition-all duration-300 shadow-md rounded-lg">
            <FileCheck className="h-4 w-4 mr-2" />
            Guardar y Enviar
          </Button>
          <Button
            variant="outline"
            className="flex-1 h-10 text-base font-semibold border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors duration-200 rounded-lg bg-transparent"
          >
            <Clock className="h-4 w-4 mr-2" />
            Guardar Borrador
          </Button>
        </div>

        {/* Alerta */}
        <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-sm">
          <p className="text-amber-800 font-medium flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            Esta inspección requiere autorización del Jefe de Calidad.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
