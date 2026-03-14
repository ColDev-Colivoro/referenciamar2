"use client"

import { Loader2, RefreshCw } from "lucide-react"

import { useSession } from "@/lib/auth/use-session"
import { useSubscription } from "@/hooks/use-subscription"
import { PlanBadge } from "@/components/billing/plan-badge"
import { SubscriptionStatusBadge } from "@/components/billing/subscription-status-badge"
import { Button } from "@/components/ui/button"
import { DashboardNav } from "@/components/layout/dashboard-nav"

const ALLOWED_ROLES = new Set(["global_admin", "tenant_admin"])

export default function BillingPage() {
  const { session } = useSession()
  const { subscription, isLoading, error, refresh } = useSubscription()

  if (session && !ALLOWED_ROLES.has(session.user.role)) {
    return (
      <div className="p-6">
        <div className="rounded-md bg-red-50 border border-red-200 p-6 text-sm text-red-700">
          Acceso denegado
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <DashboardNav />
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Facturación y Licencia</h1>
        <Button variant="outline" size="sm" onClick={() => void refresh()} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400 mr-2" />
          <span className="text-gray-500">Cargando suscripción…</span>
        </div>
      )}

      {/* Error */}
      {!isLoading && error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-700">{error}</div>
      )}

      {/* No subscription */}
      {!isLoading && !error && !subscription && (
        <div className="rounded-md bg-gray-50 border border-gray-200 p-10 text-center text-sm text-gray-500">
          No se encontró una suscripción activa
        </div>
      )}

      {/* Subscription details */}
      {!isLoading && !error && subscription && (
        <div className="space-y-6">
          {/* Plan & Status */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Suscripción actual</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex flex-col gap-1">
                <span className="text-gray-500 text-xs uppercase font-medium">Plan</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-800">{subscription.plan.name}</span>
                  <PlanBadge code={subscription.plan.code} />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-gray-500 text-xs uppercase font-medium">Estado</span>
                <SubscriptionStatusBadge status={subscription.status} />
              </div>
              {subscription.trial_ends_at && (
                <div className="flex flex-col gap-1">
                  <span className="text-gray-500 text-xs uppercase font-medium">Fin del periodo de prueba</span>
                  <span className="text-gray-700">{new Date(subscription.trial_ends_at).toLocaleDateString()}</span>
                </div>
              )}
              {subscription.expires_at && (
                <div className="flex flex-col gap-1">
                  <span className="text-gray-500 text-xs uppercase font-medium">Fecha de vencimiento</span>
                  <span className="text-gray-700">{new Date(subscription.expires_at).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Plan limits */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Límites del plan</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex flex-col gap-1">
                <span className="text-gray-500 text-xs uppercase font-medium">Usuarios máximos</span>
                <span className="text-gray-800 font-medium">{subscription.plan.max_users}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-gray-500 text-xs uppercase font-medium">Lotes por mes</span>
                <span className="text-gray-800 font-medium">{subscription.plan.max_lots_per_month}</span>
              </div>
            </div>
          </div>

          {/* Features */}
          {Object.keys(subscription.plan.features).length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">Características del plan</h2>
              <ul className="space-y-2 text-sm">
                {Object.entries(subscription.plan.features).map(([feature, enabled]) => (
                  <li key={feature} className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${enabled ? "bg-green-500" : "bg-gray-300"}`}
                    />
                    <span className={enabled ? "text-gray-800" : "text-gray-400 line-through"}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
