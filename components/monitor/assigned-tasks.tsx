"use client"

import {
  ListChecks,
  Clock,
  AlertTriangle,
  CheckCircle,
  Thermometer,
  Eye,
  FileText,
  ShieldCheck,
  ClipboardList,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface Task {
  id: string
  title: string
  lotNumber: string
  productType: string
  status: "available" | "blocked" | "completed"
  priority: "high" | "medium" | "low"
}

interface AssignedTasksProps {
  tasks: Task[]
}

export function AssignedTasks({ tasks }: AssignedTasksProps) {
  const getStatusBadge = (status: Task["status"]) => {
    switch (status) {
      case "available":
        return <Badge className="text-xs font-medium bg-emerald-100 text-emerald-700">Disponible</Badge>
      case "blocked":
        return <Badge className="text-xs font-medium bg-gray-100 text-gray-700">Bloqueada</Badge>
      case "completed":
        return <Badge className="text-xs font-medium bg-blue-100 text-blue-700">Completada</Badge>
    }
  }

  const getPriorityBadge = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return (
          <Badge className="text-xs font-medium bg-red-100 text-red-700 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" /> Alta
          </Badge>
        )
      case "medium":
        return (
          <Badge className="text-xs font-medium bg-amber-100 text-amber-700 flex items-center gap-1">
            <Clock className="h-3 w-3" /> Media
          </Badge>
        )
      case "low":
        return (
          <Badge className="text-xs font-medium bg-blue-100 text-blue-700 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> Baja
          </Badge>
        )
    }
  }

  const getTaskIcon = (title: string) => {
    if (title.includes("Temperatura")) return <Thermometer className="h-4 w-4 text-blue-600" />
    if (title.includes("Inspección")) return <Eye className="h-4 w-4 text-emerald-600" />
    if (title.includes("Ficha")) return <FileText className="h-4 w-4 text-purple-600" />
    if (title.includes("Sanitario")) return <ShieldCheck className="h-4 w-4 text-red-600" />
    return <ClipboardList className="h-4 w-4 text-gray-600" />
  }

  return (
    <Card className="w-full bg-white/90 backdrop-blur-sm shadow-lg rounded-xl border border-blue-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-blue-800 flex items-center gap-2">
          <ListChecks className="h-5 w-5 text-sky-600" />
          Mis Tareas Asignadas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`border border-gray-200 rounded-lg p-4 space-y-2 bg-white shadow-sm ${task.status === "blocked" ? "opacity-60 grayscale" : ""}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  {getTaskIcon(task.title)}
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{task.title}</p>
                    <p className="text-xs text-gray-600">
                      Lote: <span className="font-medium">{task.lotNumber}</span>
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {getStatusBadge(task.status)}
                  {task.status === "available" && getPriorityBadge(task.priority)}
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  className="flex-1 h-9 text-sm font-semibold bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 rounded-md"
                  disabled={task.status === "blocked"}
                >
                  Completar Tarea
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 text-sm font-semibold border-gray-300 text-gray-700 hover:bg-gray-100 rounded-md bg-transparent"
                  disabled={task.status === "blocked"}
                >
                  Ver Detalles
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-sky-50 p-3 rounded-lg border border-sky-200 text-sm">
          <p className="font-medium text-sky-800 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            Tienes <span className="font-semibold">{tasks.filter((t) => t.status === "available").length}</span> tareas
            pendientes. ¡Vamos!
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
