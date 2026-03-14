"use client"

import { TrendingUp, TrendingDown, Minus, BarChart2, CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export function QualityTrends() {
  const trends = [
    { metric: "Cumplimiento General", current: 98.5, previous: 97.2, trend: "up" as const, unit: "%" },
    { metric: "Tiempo de Procesamiento", current: 2.3, previous: 2.8, trend: "down" as const, unit: "hrs" },
    { metric: "Tasa de Rechazos", current: 1.5, previous: 2.1, trend: "down" as const, unit: "%" },
    { metric: "Satisfacción Cliente", current: 4.8, previous: 4.8, trend: "stable" as const, unit: "/5" },
  ]

  const getTrendIcon = (trend: (typeof trends)[0]["trend"]) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-emerald-600" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Minus className="h-4 w-4 text-gray-600" />
    }
  }

  const getTrendColor = (trend: (typeof trends)[0]["trend"], metricName: string) => {
    const reverseMetrics = ["Tiempo de Procesamiento", "Tasa de Rechazos"]
    const isReverse = reverseMetrics.includes(metricName)

    if (trend === "up") return isReverse ? "text-red-600" : "text-emerald-600"
    if (trend === "down") return isReverse ? "text-emerald-600" : "text-red-600"
    return "text-gray-600"
  }

  return (
    <Card className="w-full bg-white/90 backdrop-blur-sm shadow-lg rounded-xl border border-blue-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-blue-800 flex items-center gap-2">
          <BarChart2 className="h-5 w-5 text-blue-600" />
          Tendencias de Calidad
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Métricas con Tendencias */}
        <div className="space-y-3">
          {trends.map((item, index) => (
            <div key={index} className="space-y-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-800">{item.metric}</span>
                <div className="flex items-center gap-2">
                  {getTrendIcon(item.trend)}
                  <span className={`text-base font-bold ${getTrendColor(item.trend, item.metric)}`}>
                    {item.current}
                    {item.unit}
                  </span>
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-600">
                <span>
                  Anterior:{" "}
                  <span className="font-medium">
                    {item.previous}
                    {item.unit}
                  </span>
                </span>
                <span className={`font-medium ${getTrendColor(item.trend, item.metric)}`}>
                  {item.trend === "up" && "+"}
                  {item.trend === "down" && "-"}
                  {item.trend !== "stable" && Math.abs(item.current - item.previous).toFixed(1)}
                  {item.trend === "stable" && "Sin cambios"}
                </span>
              </div>
              <Progress
                value={item.metric === "Tiempo de Procesamiento" ? (5 - item.current) * 20 : item.current} // Example mapping for progress
                className="h-2 bg-gray-200 [&>*]:bg-blue-500"
              />
            </div>
          ))}
        </div>

        {/* Resumen */}
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 text-sm">
          <p className="font-medium text-blue-800">Resumen del Período</p>
          <p className="text-blue-600 mt-1">
            <CheckCircle className="h-4 w-4 inline mr-1 text-emerald-600" />
            Mejora general en cumplimiento y reducción de rechazos.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
