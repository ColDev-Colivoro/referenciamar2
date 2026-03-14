"use client"

// Hook that encapsulates all lot management state and API calls
// Exposes: lots, isLoading, error, refresh, createLot, updateLot, changeLotStatus

import { useCallback, useEffect, useMemo, useState } from "react"

import { ApiError } from "@/lib/api/client"
import {
  listLots,
  createLot as createLotApi,
  updateLot as updateLotApi,
  changeLotStatus as changeLotStatusApi,
} from "@/lib/lots/api"
import type { CreateLotInput, Lot, LotStatus, UpdateLotInput } from "@/lib/lots/types"

export function useLots() {
  const [lots, setLots] = useState<Lot[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError("")
    try {
      const data = await listLots()
      setLots(data)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No fue posible cargar los lotes.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const createLot = useCallback(async (input: CreateLotInput) => {
    const newLot = await createLotApi(input)
    setLots((current) => [newLot, ...current])
    return newLot
  }, [])

  const updateLot = useCallback(async (id: number, input: UpdateLotInput) => {
    const updated = await updateLotApi(id, input)
    setLots((current) => current.map((l) => (l.id === id ? updated : l)))
    return updated
  }, [])

  const changeLotStatus = useCallback(async (id: number, status: LotStatus) => {
    const updated = await changeLotStatusApi(id, status)
    setLots((current) => current.map((l) => (l.id === id ? updated : l)))
    return updated
  }, [])

  return useMemo(
    () => ({ lots, isLoading, error, refresh, createLot, updateLot, changeLotStatus }),
    [lots, isLoading, error, refresh, createLot, updateLot, changeLotStatus],
  )
}
