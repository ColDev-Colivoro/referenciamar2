import type { SubscriptionStatus } from "@/lib/billing/types"

const statusConfig: Record<SubscriptionStatus, { label: string; className: string }> = {
  active: { label: "Activo", className: "bg-green-100 text-green-700 border-green-200" },
  trial: { label: "Prueba", className: "bg-blue-100 text-blue-700 border-blue-200" },
  expired: { label: "Expirado", className: "bg-red-100 text-red-700 border-red-200" },
  suspended: { label: "Suspendido", className: "bg-orange-100 text-orange-700 border-orange-200" },
}

interface SubscriptionStatusBadgeProps {
  status: string
}

export function SubscriptionStatusBadge({ status }: SubscriptionStatusBadgeProps) {
  const config = statusConfig[status as SubscriptionStatus] ?? {
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
