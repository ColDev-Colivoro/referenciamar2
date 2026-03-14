"use client"

import { Settings, Database, Shield, Bell, Mail, CalendarDays } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function SystemConfiguration() {
  return (
    <Card className="w-full bg-white/90 backdrop-blur-sm shadow-lg rounded-xl border border-blue-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-blue-800 flex items-center gap-2">
          <Settings className="h-5 w-5 text-gray-600" />
          Configuración del Sistema
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Configuración de Seguridad */}
        <div className="space-y-3 border-b pb-4 border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Shield className="h-4 w-4 text-purple-600" />
            Seguridad
          </h4>
          <div className="space-y-3 pl-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="two-factor"
                defaultChecked
                className="border-blue-400 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
              />
              <label htmlFor="two-factor" className="text-sm text-gray-700 font-medium">
                Requerir autenticación de dos factores (2FA)
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="session-timeout"
                defaultChecked
                className="border-blue-400 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
              />
              <label htmlFor="session-timeout" className="text-sm text-gray-700 font-medium">
                Timeout de sesión automático (30 min)
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Intentos de login fallidos</label>
                <Input placeholder="3" className="h-9 text-sm border-blue-300 focus:border-blue-500" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Bloqueo de cuenta (min)</label>
                <Input placeholder="15" className="h-9 text-sm border-blue-300 focus:border-blue-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Configuración de Base de Datos */}
        <div className="space-y-3 border-b pb-4 border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Database className="h-4 w-4 text-emerald-600" />
            Base de Datos
          </h4>
          <div className="space-y-3 pl-6">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Frecuencia de Backup</label>
                <Select defaultValue="daily">
                  <SelectTrigger className="h-9 text-sm border-blue-300 focus:border-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Cada hora</SelectItem>
                    <SelectItem value="daily">Diario</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Retención de Backups (días)</label>
                <Input placeholder="30" className="h-9 text-sm border-blue-300 focus:border-blue-500" />
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full h-10 text-sm font-semibold border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg bg-transparent"
            >
              <CalendarDays className="h-4 w-4 mr-2" />
              Programar Mantenimiento
            </Button>
          </div>
        </div>

        {/* Configuración de Notificaciones */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Bell className="h-4 w-4 text-amber-600" />
            Notificaciones del Sistema
          </h4>
          <div className="space-y-3 pl-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="email-alerts"
                defaultChecked
                className="border-blue-400 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
              />
              <label htmlFor="email-alerts" className="text-sm text-gray-700 font-medium">
                Enviar alertas por email a administradores
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="system-maintenance"
                defaultChecked
                className="border-blue-400 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
              />
              <label htmlFor="system-maintenance" className="text-sm text-gray-700 font-medium">
                Notificar mantenimientos programados a usuarios
              </label>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">Email de Soporte</label>
              <div className="relative">
                <Mail className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="soporte@mar2control.com"
                  className="h-9 text-sm pl-10 border-blue-300 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex gap-3 pt-4">
          <Button className="flex-1 h-10 text-base font-semibold bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 transition-all duration-300 shadow-md rounded-lg">
            <Settings className="h-4 w-4 mr-2" />
            Guardar Configuración
          </Button>
          <Button
            variant="outline"
            className="flex-1 h-10 text-base font-semibold border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors duration-200 rounded-lg bg-transparent"
          >
            Restaurar Valores por Defecto
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
