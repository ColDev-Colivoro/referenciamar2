"use client"

import { Users, UserPlus, Edit, Trash2, Shield, UserCheck, UserX } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function UserManagement() {
  const users = [
    { name: "Ana García", role: "quality-manager", status: "active", lastLogin: "Hoy 14:30" },
    { name: "Juan Pérez", role: "monitor", status: "active", lastLogin: "Hoy 12:15" },
    { name: "María López", role: "monitor", status: "inactive", lastLogin: "Ayer 16:45" },
    { name: "Pedro García", role: "monitor", status: "active", lastLogin: "Hoy 09:30" },
  ]

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "quality-manager":
        return <Badge className="text-xs font-medium bg-amber-100 text-amber-700">Jefe de Calidad</Badge>
      case "monitor":
        return <Badge className="text-xs font-medium bg-sky-100 text-sky-700">Monitor</Badge>
      default:
        return <Badge className="text-xs font-medium bg-gray-100 text-gray-700">Usuario</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="text-xs font-medium bg-emerald-100 text-emerald-700 flex items-center gap-1">
            <UserCheck className="h-3 w-3" /> Activo
          </Badge>
        )
      case "inactive":
        return (
          <Badge className="text-xs font-medium bg-gray-100 text-gray-700 flex items-center gap-1">
            <UserX className="h-3 w-3" /> Inactivo
          </Badge>
        )
      default:
        return (
          <Badge className="text-xs font-medium bg-red-100 text-red-700 flex items-center gap-1">
            <UserX className="h-3 w-3" /> Suspendido
          </Badge>
        )
    }
  }

  return (
    <Card className="w-full bg-white/90 backdrop-blur-sm shadow-lg rounded-xl border border-blue-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-blue-800 flex items-center gap-2">
          <Users className="h-5 w-5 text-emerald-600" />
          Gestión de Usuarios
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Resumen de Usuarios */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-emerald-50 p-2 rounded-lg shadow-sm border border-emerald-100">
            <p className="text-xl font-bold text-emerald-800">22</p>
            <p className="text-xs text-gray-600">Activos</p>
          </div>
          <div className="bg-gray-50 p-2 rounded-lg shadow-sm border border-gray-100">
            <p className="text-xl font-bold text-gray-800">2</p>
            <p className="text-xs text-gray-600">Inactivos</p>
          </div>
          <div className="bg-amber-50 p-2 rounded-lg shadow-sm border border-amber-100">
            <p className="text-xl font-bold text-amber-800">4</p>
            <p className="text-xs text-gray-600">Jefes Calidad</p>
          </div>
        </div>

        {/* Lista de Usuarios */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-semibold text-gray-700">Usuarios Recientes</h4>
            <Button
              size="sm"
              className="h-9 text-sm font-semibold bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 rounded-lg"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Nuevo Usuario
            </Button>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {users.map((user, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-3 space-y-2 bg-white shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{user.name}</p>
                    <p className="text-xs text-gray-500">Último acceso: {user.lastLogin}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {getRoleBadge(user.role)}
                    {getStatusBadge(user.status)}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 h-9 text-xs font-medium border-gray-300 text-gray-700 hover:bg-gray-100 rounded-md bg-transparent"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-9 text-xs font-medium border-gray-300 text-gray-700 hover:bg-gray-100 rounded-md bg-transparent"
                  >
                    <Shield className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-9 text-xs font-medium border-red-300 text-red-600 hover:bg-red-50 rounded-md bg-transparent"
                  >
                    <Trash2 className="h-3 w-3" />
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
