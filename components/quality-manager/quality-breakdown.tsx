"use client"

import { TrendingUp, TrendingDown, Minus, CheckCircle, AlertTriangle, FlaskConical } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface QualityMetric {
  metric: string
  value: number
  unit: string
  trend: "up" | "down" | "stable"
}

interface QualityBreakdownProps {
  metrics: QualityMetric[]
}

export function QualityBreakdown({ metrics }: QualityBreakdownProps) {
  const getTrendIcon = (trend: QualityMetric["trend"]) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-emerald-600" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Minus className="h-4 w-4 text-gray-600" />
    }
  }

  const getTrendColor = (trend: QualityMetric["trend"], metricName: string) => {
    // Define métricas donde "down" es positivo (ej. defectos, rechazos)
    const positiveDownTrends = ["Defectos Menores", "No Conformidades"]
    const isPositiveDown = positiveDownTrends.includes(metricName)

    if (trend === "up") return isPositiveDown ? "text-red-600" : "text-emerald-600"
    if (trend === "down") return isPositiveDown ? "text-emerald-600" : "text-red-600"
    return "text-gray-600"
  }

  return (
    <Card className="w-full bg-white/90 backdrop-blur-sm shadow-lg rounded-xl border border-blue-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-blue-800 flex items-center gap-2">
          <FlaskConical className="h-5 w-5 text-emerald-600" />
          Desglose de Calidad
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Métricas Detalladas */}
        <div className="space-y-3">
          {metrics.map((metric, index) => (
            <div key={index} className="space-y-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-800">{metric.metric}</span>
                <div className="flex items-center gap-2">
                  {getTrendIcon(metric.trend)}
                  <span className={`text-base font-bold ${getTrendColor(metric.trend, metric.metric)}`}>
                    {metric.value}
                    {metric.unit}
                  </span>
                </div>
              </div>
              <Progress value={metric.value} className="h-2 bg-gray-200 [&>*]:bg-emerald-500" />{" "}
              {/* Asumiendo que el valor es un porcentaje o se puede mapear */}
            </div>
          ))}
        </div>

        {/* Resumen de Auditorías Internas */}
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 text-sm">
          <p className="font-medium text-blue-800">Auditorías Internas</p>
          <p className="text-blue-600 mt-1 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            Última auditoría: <span className="font-semibold">99.5% de cumplimiento</span>
          </p>
        </div>

        {/* Alertas de Calidad */}
        <div className="bg-red-50 p-3 rounded-lg border border-red-200 text-sm">
          <p className="font-medium text-red-800 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            Alerta: <span className="font-semibold">2 lotes con desviaciones menores</span>
          </p>
          <p className="text-red-600 mt-1">Revisar Lote SA-2024-001 y LG-2024-045 para acciones correctivas.</p>
        </div>
      </CardContent>
    </Card>
  )
}
