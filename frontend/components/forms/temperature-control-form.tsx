"use client"

import { FileCheck, Clock, AlertTriangle, Thermometer } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"

interface TemperatureControlFormProps {
  lotNumber: string
  productType: string
}

export function TemperatureControlForm({ lotNumber, productType }: TemperatureControlFormProps) {
  return (
    <Card className="w-full bg-white/90 backdrop-blur-sm shadow-lg rounded-xl border border-blue-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-blue-800 flex items-center gap-2">
          <Thermometer className="h-5 w-5 text-blue-600" />
          Planilla: Control de Temperatura
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge className="text-xs font-medium bg-blue-100 text-blue-700">Lote: {lotNumber}</Badge>
          <Badge className="text-xs font-medium bg-emerald-100 text-emerald-700">{productType}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Campos de Temperatura */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Temperatura Inicial (°C)</label>
            <Input
              placeholder="-18.5"
              className="h-10 text-base border-blue-300 focus:border-blue-500"
              type="number"
              step="0.1"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Temperatura Final (°C)</label>
            <Input
              placeholder="-18.2"
              className="h-10 text-base border-blue-300 focus:border-blue-500"
              type="number"
              step="0.1"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Hora Inicio</label>
            <Input type="time" className="h-10 text-base border-blue-300 focus:border-blue-500" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Hora Fin</label>
            <Input type="time" className="h-10 text-base border-blue-300 focus:border-blue-500" />
          </div>
        </div>

        {/* Observaciones */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Observaciones</label>
          <Textarea
            placeholder="Registrar cualquier anomalía o observación relevante..."
            className="text-base h-24 border-blue-300 focus:border-blue-500"
          />
        </div>

        {/* Verificaciones */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-gray-700">Verificaciones Obligatorias</label>
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="temp-range"
                className="h-5 w-5 border-blue-400 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
              />
              <label htmlFor="temp-range" className="text-sm font-medium text-gray-700">
                Temperatura dentro del rango permitido
              </label>
            </div>
            <div className="flex items-center space-x-3">
              <Checkbox
                id="equipment-ok"
                className="h-5 w-5 border-blue-400 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
              />
              <label htmlFor="equipment-ok" className="text-sm font-medium text-gray-700">
                Equipos de medición calibrados y funcionales
              </label>
            </div>
            <div className="flex items-center space-x-3">
              <Checkbox
                id="record-complete"
                className="h-5 w-5 border-blue-400 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
              />
              <label htmlFor="record-complete" className="text-sm font-medium text-gray-700">
                Registro completo, legible y sin errores
              </label>
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex gap-3 pt-4">
          <Button className="flex-1 h-10 text-base font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-md rounded-lg">
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
            Esta planilla requiere autorización del Jefe de Calidad para su aprobación final.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
