import type { PlanCode } from "@/lib/billing/types"

const planConfig: Record<PlanCode, { label: string; className: string }> = {
  starter: { label: "Starter", className: "bg-gray-100 text-gray-700 border-gray-200" },
  professional: { label: "Professional", className: "bg-primary/15 text-primary border-primary/30" },
  enterprise: { label: "Enterprise", className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
}

interface PlanBadgeProps {
  code: string
}

export function PlanBadge({ code }: PlanBadgeProps) {
  const config = planConfig[code as PlanCode] ?? {
    label: code,
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
