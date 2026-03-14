"use client"

import { HelpCircle, Clock, CheckCircle, AlertTriangle, MessageSquare, User } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function SupportTickets() {
  const tickets = [
    {
      id: "TK-001",
      company: "Pesquera del Sur",
      subject: "Error en carga de planillas",
      priority: "high",
      status: "open",
      created: "2024-03-15 10:30",
      assignedTo: "Soporte Nivel 2",
    },
    {
      id: "TK-002",
      company: "Mariscos Pacífico",
      subject: "Solicitud de nuevos usuarios",
      priority: "medium",
      status: "in-progress",
      created: "2024-03-14 14:15",
      assignedTo: "Equipo de Onboarding",
    },
    {
      id: "TK-003",
      company: "Exportadora Marina",
      subject: "Configuración de reportes",
      priority: "low",
      status: "resolved",
      created: "2024-03-13 09:20",
      assignedTo: "Soporte Nivel 1",
    },
  ]

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge className="text-xs font-medium bg-red-100 text-red-700">Alta</Badge>
      case "medium":
        return <Badge className="text-xs font-medium bg-amber-100 text-amber-700">Media</Badge>
      case "low":
        return <Badge className="text-xs font-medium bg-emerald-100 text-emerald-700">Baja</Badge>
      default:
        return <Badge className="text-xs font-medium bg-gray-100 text-gray-700">Normal</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case "in-progress":
        return <Clock className="h-4 w-4 text-amber-600" />
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-emerald-600" />
      default:
        return <HelpCircle className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <Card className="w-full bg-white/90 backdrop-blur-sm shadow-lg rounded-xl border border-blue-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-blue-800 flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-blue-600" />
          Tickets de Soporte
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Resumen de Tickets */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-red-50 p-2 rounded-lg shadow-sm border border-red-100">
            <p className="text-xl font-bold text-red-800">1</p>
            <p className="text-xs text-gray-600">Abiertos</p>
          </div>
          <div className="bg-amber-50 p-2 rounded-lg shadow-sm border border-amber-100">
            <p className="text-xl font-bold text-amber-800">1</p>
            <p className="text-xs text-gray-600">En Proceso</p>
          </div>
          <div className="bg-emerald-50 p-2 rounded-lg shadow-sm border border-emerald-100">
            <p className="text-xl font-bold text-emerald-800">1</p>
            <p className="text-xs text-gray-600">Resueltos</p>
          </div>
        </div>

        {/* Lista de Tickets */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700">Tickets Recientes</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="border border-gray-200 rounded-lg p-3 space-y-1 bg-white shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(ticket.status)}
                    <span className="text-sm font-semibold text-gray-800">{ticket.id}</span>
                  </div>
                  {getPriorityBadge(ticket.priority)}
                </div>
                <p className="text-sm font-medium text-gray-700">{ticket.subject}</p>
                <p className="text-xs text-gray-600">{ticket.company}</p>
                <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{ticket.assignedTo}</span>
                  </div>
                  <span>{ticket.created}</span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-full text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-md mt-2"
                >
                  <MessageSquare className="h-3 w-3 mr-1" />
                  Ver Conversación
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Acciones */}
        <Button className="w-full h-10 text-base font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-md rounded-lg">
          <HelpCircle className="h-4 w-4 mr-2" />
          Ver Todos los Tickets
        </Button>
      </CardContent>
    </Card>
  )
}
