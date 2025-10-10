"use client"

import { Shield, Clock, AlertTriangle, CheckCircle, FileText } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface PendingApproval {
  id: string
  title: string
  monitor: string
  modifiedTime: string
  status: "pending" | "approved" | "rejected"
  priority: "high" | "medium" | "low"
}

interface ApprovalWorkflowProps {
  pendingApprovals: PendingApproval[]
}

export function ApprovalWorkflow({ pendingApprovals }: ApprovalWorkflowProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700"
      case "medium":
        return "bg-amber-100 text-amber-700"
      case "low":
        return "bg-emerald-100 text-emerald-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-amber-600" />
      case "approved":
        return <CheckCircle className="h-4 w-4 text-emerald-600" />
      case "rejected":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <FileText className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <Card className="w-full bg-white/90 backdrop-blur-sm shadow-lg rounded-xl border border-blue-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-blue-800 flex items-center gap-2">
          <Shield className="h-5 w-5 text-orange-600" />
          Flujo de Aprobaciones
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700">Planillas Pendientes de Revisión</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
            {pendingApprovals.map((approval) => (
              <div key={approval.id} className="border border-gray-200 rounded-lg p-4 space-y-2 bg-white shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(approval.status)}
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{approval.title}</p>
                      <p className="text-xs text-gray-600">
                        Monitor: <span className="font-medium">{approval.monitor}</span>
                      </p>
                      <p className="text-xs text-gray-500">Modificado: {approval.modifiedTime}</p>
                    </div>
                  </div>
                  <Badge className={`text-xs font-medium ${getPriorityColor(approval.priority)}`}>
                    {approval.priority.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    className="flex-1 h-9 text-xs font-semibold bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 rounded-md"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Aprobar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 h-9 text-xs font-semibold border-red-300 text-red-600 hover:bg-red-50 rounded-md bg-transparent"
                  >
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Rechazar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-9 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-md"
                  >
                    Ver Detalles
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-sm">
          <p className="font-medium text-amber-800 flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-600" />
            Tienes <span className="font-semibold">{pendingApprovals.length}</span> planillas pendientes de tu revisión.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
