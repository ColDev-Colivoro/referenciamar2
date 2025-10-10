"use client"

import { Building2, Eye, Edit, Trash2, CheckCircle, Clock, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Company {
  id: string
  name: string
  status: "active" | "pending" | "suspended"
  createdDate: string
  totalUsers: number
  monthlyForms: number
  complianceRate: number
  adminContact: string
  plan: string
  lastActivity: string
  storage: string
}

interface CompanyListProps {
  companies: Company[]
}

export function CompanyList({ companies }: CompanyListProps) {
  const getStatusBadge = (status: Company["status"]) => {
    switch (status) {
      case "active":
        return (
          <Badge className="text-xs font-medium bg-emerald-100 text-emerald-700">
            <CheckCircle className="h-3 w-3 mr-1" />
            Activa
          </Badge>
        )
      case "pending":
        return (
          <Badge className="text-xs font-medium bg-amber-100 text-amber-700">
            <Clock className="h-3 w-3 mr-1" />
            Configuración
          </Badge>
        )
      case "suspended":
        return (
          <Badge className="text-xs font-medium bg-red-100 text-red-700">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Suspendida
          </Badge>
        )
    }
  }

  return (
    <Card className="w-full bg-white/90 backdrop-blur-sm shadow-lg rounded-xl border border-blue-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-blue-800 flex items-center gap-2">
          <Building2 className="h-5 w-5 text-blue-600" />
          Empresas Registradas ({companies.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-3">
          {companies.map((company) => (
            <div key={company.id} className="border border-gray-200 rounded-lg p-4 space-y-3 shadow-sm bg-white">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-base font-semibold text-gray-800">{company.name}</h4>
                    {getStatusBadge(company.status)}
                  </div>
                  <p className="text-sm text-gray-600">Plan: {company.plan}</p>
                  <p className="text-xs text-gray-500">Creada: {company.createdDate}</p>
                  <p className="text-xs text-gray-500">Admin: {company.adminContact}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-700">{company.totalUsers} usuarios</p>
                  <p className="text-xs text-gray-600">{company.monthlyForms} planillas/mes</p>
                  <p className="text-xs text-emerald-600">{company.complianceRate}% cumplimiento</p>
                  <p className="text-xs text-gray-500">Almacenamiento: {company.storage}</p>
                  <p className="text-xs text-gray-500">Últ. Actividad: {company.lastActivity}</p>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button size="sm" className="flex-1 text-xs font-medium bg-blue-600 hover:bg-blue-700 rounded-md">
                  <Eye className="h-3 w-3 mr-1" />
                  Ver Métricas
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-xs font-medium border-gray-300 text-gray-700 hover:bg-gray-100 rounded-md bg-transparent"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs font-medium border-red-300 text-red-600 hover:bg-red-50 rounded-md bg-transparent"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm">
          <p className="font-medium text-gray-800">Resumen Global</p>
          <p className="text-gray-600 mt-1">
            <span className="font-semibold">{companies.filter((c) => c.status === "active").length}</span> activas •{" "}
            <span className="font-semibold">{companies.filter((c) => c.status === "pending").length}</span> en
            configuración • <span className="font-semibold">{companies.reduce((sum, c) => sum + c.totalUsers, 0)}</span>{" "}
            usuarios totales
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
