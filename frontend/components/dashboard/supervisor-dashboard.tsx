"use client"

import { Shield, Edit, Check, X, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface PendingApproval {
  id: string
  title: string
  monitor: string
  modifiedTime: string
  status: "pending" | "approved" | "rejected"
}

interface SupervisorDashboardProps {
  pendingApprovals: PendingApproval[]
}

export function SupervisorDashboard({ pendingApprovals }: SupervisorDashboardProps) {
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Shield className="h-4 w-4 text-orange-600" />
          Panel Jefe de Planta
        </CardTitle>
        <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 w-fit">
          <Edit className="h-3 w-3 mr-1" />
          Autoriza Cambios
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-700">Planillas Pendientes de Autorización</h4>

          {pendingApprovals.map((approval) => (
            <div key={approval.id} className="border rounded p-2 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-medium">{approval.title}</p>
                  <p className="text-xs text-gray-600">Monitor: {approval.monitor}</p>
                  <p className="text-xs text-gray-500">Modificado: {approval.modifiedTime}</p>
                </div>
                <Badge className="text-xs bg-yellow-100 text-yellow-700">
                  <Clock className="h-3 w-3 mr-1" />
                  Pendiente
                </Badge>
              </div>
              <div className="flex gap-1">
                <Button size="sm" className="text-xs flex-1 bg-green-600">
                  <Check className="h-3 w-3 mr-1" />
                  Aprobar
                </Button>
                <Button size="sm" variant="outline" className="text-xs flex-1 bg-transparent">
                  <X className="h-3 w-3 mr-1" />
                  Rechazar
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-blue-50 p-2 rounded">
          <p className="text-xs font-medium text-blue-800">Autorizaciones Hoy</p>
          <p className="text-xs text-blue-600">✓ 12 Aprobadas | ✗ 2 Rechazadas</p>
        </div>
      </CardContent>
    </Card>
  )
}
