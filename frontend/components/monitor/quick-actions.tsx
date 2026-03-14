"use client"

import { Bolt, Scan, Camera, Upload, MessageSquare, HelpCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function QuickActions() {
  return (
    <Card className="w-full bg-white/90 backdrop-blur-sm shadow-lg rounded-xl border border-blue-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-blue-800 flex items-center gap-2">
          <Bolt className="h-5 w-5 text-amber-600" />
          Acciones Rápidas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button className="w-full h-12 text-base font-semibold bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 transition-all duration-300 shadow-md rounded-lg">
          <Scan className="h-5 w-5 mr-2" />
          Escanear Lote
        </Button>
        <Button
          variant="outline"
          className="w-full h-12 text-base font-semibold border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors duration-200 rounded-lg bg-transparent"
        >
          <Camera className="h-5 w-5 mr-2" />
          Tomar Foto de Evidencia
        </Button>
        <Button
          variant="outline"
          className="w-full h-12 text-base font-semibold border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors duration-200 rounded-lg bg-transparent"
        >
          <Upload className="h-5 w-5 mr-2" />
          Subir Documento
        </Button>
        <Button
          variant="outline"
          className="w-full h-12 text-base font-semibold border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors duration-200 rounded-lg bg-transparent"
        >
          <MessageSquare className="h-5 w-5 mr-2" />
          Reportar Incidencia
        </Button>
        <Button
          variant="outline"
          className="w-full h-12 text-base font-semibold border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors duration-200 rounded-lg bg-transparent"
        >
          <HelpCircle className="h-5 w-5 mr-2" />
          Ayuda y Soporte
        </Button>
      </CardContent>
    </Card>
  )
}
