"use client"

// Hook that encapsulates subscription state and API calls
// Exposes: subscription, isLoading, error, refresh

import { useCallback, useEffect, useMemo, useState } from "react"

import { ApiError } from "@/lib/api/client"
import { getSubscription } from "@/lib/billing/api"
import type { TenantSubscription } from "@/lib/billing/types"

interface UseSubscriptionReturn {
  subscription: TenantSubscription | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useSubscription(): UseSubscriptionReturn {
  const [subscription, setSubscription] = useState<TenantSubscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getSubscription()
      setSubscription(data)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No fue posible cargar la suscripción.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return useMemo(
    () => ({ subscription, isLoading, error, refresh }),
    [subscription, isLoading, error, refresh],
  )
}
