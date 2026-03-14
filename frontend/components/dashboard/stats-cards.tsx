import type { DashboardStats } from "@/lib/reports/types"

interface StatsCardsProps {
  stats: DashboardStats
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      label: "Total Lotes",
      value: stats.lot_summary.total,
      sub: `${stats.lot_summary.this_month} este mes`,
      color: "blue",
    },
    {
      label: "Lotes Aprobados",
      value: stats.lot_summary.by_status.approved,
      sub: `${stats.lot_summary.by_status.rejected} rechazados`,
      color: "green",
    },
    {
      label: "Formularios Enviados",
      value: stats.form_summary.by_status.submitted,
      sub: `${stats.form_summary.total} total`,
      color: "yellow",
    },
    {
      label: "Formularios Aprobados",
      value: stats.form_summary.by_status.approved,
      sub: `${stats.form_summary.by_status.rejected} rechazados`,
      color: "purple",
    },
  ]

  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    green: "bg-green-50 border-green-200 text-green-700",
    yellow: "bg-yellow-50 border-yellow-200 text-yellow-700",
    purple: "bg-purple-50 border-purple-200 text-purple-700",
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`rounded-lg border p-4 ${colorMap[card.color] ?? ""}`}
        >
          <p className="text-sm font-medium opacity-80">{card.label}</p>
          <p className="text-3xl font-bold mt-1">{card.value}</p>
          <p className="text-xs mt-1 opacity-60">{card.sub}</p>
        </div>
      ))}
    </div>
  )
}
