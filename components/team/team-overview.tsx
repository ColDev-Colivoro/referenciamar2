"use client"

import { Users, UserCheck, UserX, PauseCircle, Activity } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function TeamOverview() {
  const teamMembers = [
    { name: "Juan Pérez", role: "Monitor", status: "active", tasksToday: 5, lastActivity: "Hace 10 min" },
    { name: "María López", role: "Monitor", status: "active", tasksToday: 3, lastActivity: "Hace 30 min" },
    { name: "Pedro García", role: "Monitor", status: "break", tasksToday: 4, lastActivity: "Hace 1 hora" },
    { name: "Ana Ruiz", role: "Monitor", status: "active", tasksToday: 6, lastActivity: "Hace 5 min" },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="text-xs font-medium bg-emerald-100 text-emerald-700 flex items-center gap-1">
            <UserCheck className="h-3 w-3" /> Activo
          </Badge>
        )
      case "break":
        return (
          <Badge className="text-xs font-medium bg-amber-100 text-amber-700 flex items-center gap-1">
            <PauseCircle className="h-3 w-3" /> Descanso
          </Badge>
        )
      default:
        return (
          <Badge className="text-xs font-medium bg-gray-100 text-gray-700 flex items-center gap-1">
            <UserX className="h-3 w-3" /> Inactivo
          </Badge>
        )
    }
  }

  return (
    <Card className="w-full bg-white/90 backdrop-blur-sm shadow-lg rounded-xl border border-blue-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-blue-800 flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" />
          Equipo de Monitores
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Resumen del Equipo */}
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="bg-emerald-50 p-4 rounded-lg shadow-sm border border-emerald-100">
            <p className="text-xl font-bold text-emerald-800">
              {teamMembers.filter((m) => m.status === "active").length}
            </p>
            <p className="text-xs text-gray-600">Monitores Activos</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg text-center shadow-sm border border-blue-100">
            <p className="text-xl font-bold text-blue-800">{teamMembers.reduce((sum, m) => sum + m.tasksToday, 0)}</p>
            <p className="text-xs text-gray-600">Tareas Completadas Hoy</p>
          </div>
        </div>

        {/* Lista de Miembros */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700">Estado de Monitores</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
            {teamMembers.map((member, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-1 bg-white shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{member.name}</p>
                    <p className="text-xs text-gray-600">{member.role}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {getStatusBadge(member.status)}
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <Activity className="h-3 w-3" /> {member.lastActivity}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full h-9 text-xs font-semibold border-gray-300 text-gray-700 hover:bg-gray-100 rounded-md bg-transparent"
                >
                  Ver Tareas
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 text-sm">
          <p className="font-medium text-blue-800">Resumen del Equipo</p>
          <p className="text-blue-600 mt-1">
            Monitores activos:{" "}
            <span className="font-semibold">{teamMembers.filter((m) => m.status === "active").length}</span> de{" "}
            <span className="font-semibold">{teamMembers.length}</span>.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
