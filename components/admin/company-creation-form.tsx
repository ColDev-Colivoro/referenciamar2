"use client"

import { Building2, Plus, Mail, Phone, MapPin } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function CompanyCreationForm() {
  return (
    <Card className="w-full bg-white/90 backdrop-blur-sm shadow-lg rounded-xl border border-blue-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-blue-800 flex items-center gap-2">
          <Plus className="h-5 w-5 text-emerald-600" />
          Agregar Nueva Empresa
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Información Básica */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Nombre de la Empresa</label>
          <Input
            placeholder="Ej: Pesquera del Norte"
            className="h-10 text-base border-blue-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Tipo de Empresa</label>
          <Select>
            <SelectTrigger className="h-10 text-base border-blue-300 focus:border-blue-500 focus:ring-blue-500">
              <SelectValue placeholder="Seleccionar tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pesquera">Pesquera</SelectItem>
              <SelectItem value="mariscos">Mariscos</SelectItem>
              <SelectItem value="exportadora">Exportadora</SelectItem>
              <SelectItem value="procesadora">Procesadora</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Contacto Administrativo */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Administrador Principal</label>
          <Input
            placeholder="Nombre completo"
            className="h-10 text-base border-blue-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Email del Administrador</label>
          <div className="relative">
            <Mail className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
            <Input
              placeholder="admin@empresa.com"
              className="h-10 text-base pl-10 border-blue-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Teléfono</label>
          <div className="relative">
            <Phone className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
            <Input
              placeholder="+56 9 1234 5678"
              className="h-10 text-base pl-10 border-blue-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Ubicación */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Dirección</label>
          <div className="relative">
            <MapPin className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
            <Textarea
              placeholder="Dirección completa de la empresa..."
              className="text-base pl-10 h-24 border-blue-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Configuración Inicial */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Límite de Usuarios</label>
          <Select>
            <SelectTrigger className="h-10 text-base border-blue-300 focus:border-blue-500 focus:ring-blue-500">
              <SelectValue placeholder="Seleccionar límite" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">Hasta 10 usuarios</SelectItem>
              <SelectItem value="25">Hasta 25 usuarios</SelectItem>
              <SelectItem value="50">Hasta 50 usuarios</SelectItem>
              <SelectItem value="unlimited">Ilimitado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Botones */}
        <div className="flex gap-3 pt-4">
          <Button className="flex-1 h-10 text-base font-semibold bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 transition-all duration-300 shadow-md rounded-lg">
            <Building2 className="h-4 w-4 mr-2" />
            Crear Empresa
          </Button>
          <Button
            variant="outline"
            className="flex-1 h-10 text-base font-semibold border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors duration-200 rounded-lg bg-transparent"
          >
            Cancelar
          </Button>
        </div>

        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 text-sm">
          <p className="text-blue-800 font-medium flex items-center gap-2">
            <Building2 className="h-4 w-4 text-blue-600" />
            Se enviará un email de configuración al administrador principal.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
