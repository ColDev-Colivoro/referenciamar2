import type { FormStatus } from "@/lib/forms/types"

const statusConfig: Record<FormStatus, { label: string; className: string }> = {
  draft: { label: "Borrador", className: "bg-gray-100 text-gray-700 border-gray-200" },
  submitted: { label: "Enviado", className: "bg-blue-100 text-blue-700 border-blue-200" },
  approved: { label: "Aprobado", className: "bg-green-100 text-green-700 border-green-200" },
  rejected: { label: "Rechazado", className: "bg-red-100 text-red-700 border-red-200" },
}

interface FormStatusBadgeProps {
  status: string
}

export function FormStatusBadge({ status }: FormStatusBadgeProps) {
  const config = statusConfig[status as FormStatus] ?? {
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
