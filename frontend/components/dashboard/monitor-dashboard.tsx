"use client"

import { ClipboardCheck, FileCheck, Edit, X, Clock, CheckCircle, AlertTriangle, Package } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface AvailableForm {
  id: string
  title: string
  lotNumber: string
  productType: string
  status: "available" | "blocked" | "completed"
  priority: "high" | "medium" | "low"
}

interface MonitorDashboardProps {
  availableForms: AvailableForm[]
  completedToday: number
}

export function MonitorDashboard({ availableForms, completedToday }: MonitorDashboardProps) {
  const getStatusBadge = (status: AvailableForm["status"]) => {
    switch (status) {
      case "available":
        return <Badge className="text-xs font-medium bg-emerald-100 text-emerald-700">Disponible</Badge>
      case "blocked":
        return <Badge className="text-xs font-medium bg-gray-100 text-gray-700">Bloqueada</Badge>
      case "completed":
        return <Badge className="text-xs font-medium bg-blue-100 text-blue-700">Completada</Badge>
    }
  }

  const getPriorityBadge = (priority: AvailableForm["priority"]) => {
    switch (priority) {
      case "high":
        return <Badge className="text-xs font-medium bg-red-100 text-red-700">Alta</Badge>
      case "medium":
        return <Badge className="text-xs font-medium bg-amber-100 text-amber-700">Media</Badge>
      case "low":
        return <Badge className="text-xs font-medium bg-blue-100 text-blue-700">Baja</Badge>
    }
  }

  const getActionButton = (form: AvailableForm) => {
    if (form.status === "available") {
      return (
        <Button
          size="sm"
          className="w-full h-9 text-sm font-semibold bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 rounded-md"
        >
          <Edit className="h-4 w-4 mr-1" />
          Completar
        </Button>
      )
    }
    return (
      <Button
        size="sm"
        className="w-full h-9 text-sm font-semibold bg-gray-200 text-gray-500 cursor-not-allowed rounded-md"
        disabled
      >
        <X className="h-4 w-4 mr-1" />
        No Disponible
      </Button>
    )
  }

  return (
    <Card className="w-full bg-white/90 backdrop-blur-sm shadow-lg rounded-xl border border-blue-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-blue-800 flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-sky-600" />
          Panel Monitor
        </CardTitle>
        <Badge className="text-xs font-medium bg-sky-100 text-sky-700 w-fit">
          <FileCheck className="h-3 w-3 mr-1" />
          Solo Completar
        </Badge>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Resumen de Tareas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-emerald-50 p-4 rounded-lg text-center shadow-sm border border-emerald-100">
            <CheckCircle className="h-6 w-6 mx-auto text-emerald-600 mb-2" />
            <p className="text-xl font-bold text-emerald-800">{completedToday}</p>
            <p className="text-xs text-gray-600">Completadas Hoy</p>
          </div>
          <div className="bg-amber-50 p-4 rounded-lg text-center shadow-sm border border-amber-100">
            <Clock className="h-6 w-6 mx-auto text-amber-600 mb-2" />
            <p className="text-xl font-bold text-amber-800">
              {availableForms.filter((f) => f.status === "available").length}
            </p>
            <p className="text-xs text-gray-600">Pendientes</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg text-center shadow-sm border border-red-100">
            <AlertTriangle className="h-6 w-6 mx-auto text-red-600 mb-2" />
            <p className="text-xl font-bold text-red-800">
              {availableForms.filter((f) => f.priority === "high" && f.status === "available").length}
            </p>
            <p className="text-xs text-gray-600">Urgentes</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg text-center shadow-sm border border-blue-100">
            <Package className="h-6 w-6 mx-auto text-blue-600 mb-2" />
            <p className="text-xl font-bold text-blue-800">
              {availableForms.filter((f) => f.status !== "blocked").length}
            </p>
            <p className="text-xs text-gray-600">Total Asignadas</p>
          </div>
        </div>

        {/* Planillas Disponibles */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700">Planillas Disponibles</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
            {availableForms.map((form) => (
              <div
                key={form.id}
                className={`border border-gray-200 rounded-lg p-4 space-y-3 bg-white shadow-sm ${
                  form.status === "blocked" ? "opacity-60 grayscale" : ""
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{form.title}</p>
                    <p className="text-xs text-gray-600">
                      Lote: <span className="font-medium">{form.lotNumber}</span> • Producto:{" "}
                      <span className="font-medium">{form.productType}</span>
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {getStatusBadge(form.status)}
                    {form.status === "available" && getPriorityBadge(form.priority)}
                  </div>
                </div>
                {getActionButton(form)}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 text-sm">
          <p className="font-medium text-emerald-800 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            ¡Excelente! Has completado <span className="font-semibold">{completedToday}</span> planillas hoy.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
