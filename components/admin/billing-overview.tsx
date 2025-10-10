"use client"

import { DollarSign, CreditCard, TrendingUp, AlertCircle, FileText } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"

export function BillingOverview() {
  const billingData = [
    { company: "Pesquera del Sur", plan: "Enterprise", amount: 299, status: "paid", dueDate: "2024-04-15" },
    { company: "Mariscos Pacífico", plan: "Professional", amount: 199, status: "paid", dueDate: "2024-04-03" },
    { company: "Exportadora Marina", plan: "Enterprise", amount: 299, status: "pending", dueDate: "2024-03-20" },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="text-xs font-medium bg-emerald-100 text-emerald-700">Pagado</Badge>
      case "pending":
        return <Badge className="text-xs font-medium bg-amber-100 text-amber-700">Pendiente</Badge>
      case "overdue":
        return <Badge className="text-xs font-medium bg-red-100 text-red-700">Vencido</Badge>
      default:
        return <Badge className="text-xs font-medium bg-gray-100 text-gray-700">Desconocido</Badge>
    }
  }

  return (
    <Card className="w-full bg-white/90 backdrop-blur-sm shadow-lg rounded-xl border border-blue-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-blue-800 flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-emerald-600" />
          Facturación y Planes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Resumen Financiero */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-emerald-50 p-4 rounded-lg text-center shadow-sm border border-emerald-100">
            <CreditCard className="h-6 w-6 mx-auto text-emerald-600 mb-2" />
            <p className="text-xl font-bold text-emerald-800">$797</p>
            <p className="text-xs text-gray-600">Ingresos/Mes</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg text-center shadow-sm border border-blue-100">
            <TrendingUp className="h-6 w-6 mx-auto text-blue-600 mb-2" />
            <p className="text-xl font-bold text-blue-800">+15%</p>
            <p className="text-xs text-gray-600">Crecimiento</p>
          </div>
        </div>

        {/* Estado de Pagos */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700">Estado de Pagos</h4>
          <div className="space-y-2">
            {billingData.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">{item.company}</p>
                  <p className="text-xs text-gray-600">
                    {item.plan} - <span className="font-semibold">${item.amount}</span>
                  </p>
                  <p className="text-xs text-gray-500">Vence: {item.dueDate}</p>
                </div>
                {getStatusBadge(item.status)}
              </div>
            ))}
          </div>
        </div>

        {/* Progreso de Cobros */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Cobros del Mes</span>
            <span className="font-medium text-gray-800">$498 / $797</span>
          </div>
          <Progress value={62} className="h-2 bg-gray-200 [&>*]:bg-emerald-500" />
        </div>

        {/* Alertas */}
        <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-sm">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <p className="font-medium text-amber-800">1 pago pendiente</p>
          </div>
          <p className="text-amber-600">Exportadora Marina - Vence en 5 días</p>
          <Button
            size="sm"
            variant="outline"
            className="mt-3 w-full text-xs font-semibold border-amber-300 text-amber-700 hover:bg-amber-100 rounded-md bg-transparent"
          >
            <FileText className="h-3 w-3 mr-1" />
            Enviar Recordatorio
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
