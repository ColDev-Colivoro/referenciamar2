import type { LotStatus } from "@/lib/lots/types"

const statusConfig: Record<LotStatus, { label: string; className: string }> = {
  pending: { label: "Pendiente", className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  in_process: { label: "En Proceso", className: "bg-primary/15 text-primary border-primary/30" },
  approved: { label: "Aprobado", className: "bg-green-100 text-green-700 border-green-200" },
  rejected: { label: "Rechazado", className: "bg-red-100 text-red-700 border-red-200" },
}

interface LotStatusBadgeProps {
  status: string
}

export function LotStatusBadge({ status }: LotStatusBadgeProps) {
  const config = statusConfig[status as LotStatus] ?? {
    label: status,
    className: "bg-gray-100 text-gray-700 border-gray-200",
  }
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}
    >
      {config.label}
    </span>
  )
}
