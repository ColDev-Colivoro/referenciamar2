import { apiRequest } from "@/lib/api/client"

import type { CreateFormInput, FormStatus, QualityForm } from "@/lib/forms/types"

export function listForms(lotId: number): Promise<QualityForm[]> {
  return apiRequest<QualityForm[]>(`/api/v1/lots/${lotId}/forms/`)
}

export function createForm(lotId: number, input: CreateFormInput): Promise<QualityForm> {
  return apiRequest<QualityForm>(`/api/v1/lots/${lotId}/forms/`, {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export function getForm(lotId: number, formId: number): Promise<QualityForm> {
  return apiRequest<QualityForm>(`/api/v1/lots/${lotId}/forms/${formId}/`)
}

export function changeFormStatus(lotId: number, formId: number, status: FormStatus): Promise<QualityForm> {
  return apiRequest<QualityForm>(`/api/v1/lots/${lotId}/forms/${formId}/status/`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  })
}
