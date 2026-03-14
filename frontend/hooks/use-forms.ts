"use client"

// Hook that encapsulates all form management state and API calls for a given lot
// Exposes: forms, isLoading, error, refresh, createForm, changeFormStatus

import { useCallback, useEffect, useMemo, useState } from "react"

import { ApiError } from "@/lib/api/client"
import {
  listForms,
  createForm as createFormApi,
  changeFormStatus as changeFormStatusApi,
} from "@/lib/forms/api"
import type { CreateFormInput, FormStatus, QualityForm } from "@/lib/forms/types"

export interface UseFormsReturn {
  forms: QualityForm[]
  isLoading: boolean
  error: string | null
  refresh: () => void
  createForm: (input: CreateFormInput) => Promise<QualityForm>
  changeFormStatus: (formId: number, status: FormStatus) => Promise<QualityForm>
}

export function useForms(lotId: number): UseFormsReturn {
  const [forms, setForms] = useState<QualityForm[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await listForms(lotId)
      setForms(data)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No fue posible cargar los formularios.")
    } finally {
      setIsLoading(false)
    }
  }, [lotId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const createForm = useCallback(
    async (input: CreateFormInput) => {
      const newForm = await createFormApi(lotId, input)
      setForms((current) => [newForm, ...current])
      return newForm
    },
    [lotId],
  )

  const changeFormStatus = useCallback(
    async (formId: number, status: FormStatus) => {
      const updated = await changeFormStatusApi(lotId, formId, status)
      setForms((current) => current.map((f) => (f.id === formId ? updated : f)))
      return updated
    },
    [lotId],
  )

  return useMemo(
    () => ({ forms, isLoading, error, refresh, createForm, changeFormStatus }),
    [forms, isLoading, error, refresh, createForm, changeFormStatus],
  )
}
