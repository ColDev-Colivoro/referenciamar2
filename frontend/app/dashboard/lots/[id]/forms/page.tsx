"use client"

import { useState } from "react"
import { Loader2, Plus, RefreshCw } from "lucide-react"

import { useSession } from "@/lib/auth/use-session"
import { useForms } from "@/hooks/use-forms"
import { FormStatusBadge } from "@/components/forms/form-status-badge"
import { Button } from "@/components/ui/button"
import { FORM_TYPE_LABELS } from "@/lib/forms/types"
import type { FormType, CreateFormInput } from "@/lib/forms/types"

// Roles allowed to approve / reject forms
const APPROVE_ROLES = new Set(["global_admin", "tenant_admin", "manager", "quality_manager"])

interface FormsPageProps {
  params: { id: string }
}

export default function FormsPage({ params }: FormsPageProps) {
  const lotId = Number(params.id)
  const { session } = useSession()
  const { forms, isLoading, error, refresh, createForm, changeFormStatus } = useForms(lotId)
  const [formOpen, setFormOpen] = useState(false)
  const [newFormType, setNewFormType] = useState<FormType>("recepcion_materia_prima")
  const [newFormNotes, setNewFormNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const canApprove = session ? APPROVE_ROLES.has(session.user.role) : false

  async function handleCreate() {
    setSubmitting(true)
    setSubmitError(null)
    try {
      const input: CreateFormInput = { form_type: newFormType, notes: newFormNotes }
      await createForm(input)
      setFormOpen(false)
      setNewFormNotes("")
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Error al crear el formulario.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Formularios del Lote #{params.id}</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => void refresh()} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
          <Button size="sm" onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Nuevo Formulario
          </Button>
        </div>
      </div>

      {/* Inline create form */}
      {formOpen && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">Nuevo Formulario</h2>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-600">Tipo</label>
              <select
                value={newFormType}
                onChange={(e) => setNewFormType(e.target.value as FormType)}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {(Object.keys(FORM_TYPE_LABELS) as FormType[]).map((key) => (
                  <option key={key} value={key}>
                    {FORM_TYPE_LABELS[key]}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-xs text-gray-600">Notas (opcional)</label>
              <input
                type="text"
                value={newFormNotes}
                onChange={(e) => setNewFormNotes(e.target.value)}
                placeholder="Observaciones…"
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => void handleCreate()} disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                Crear
              </Button>
              <Button variant="outline" size="sm" onClick={() => setFormOpen(false)}>
                Cancelar
              </Button>
            </div>
          </div>
          {submitError && <p className="text-xs text-red-600">{submitError}</p>}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400 mr-2" />
          <span className="text-gray-500">Cargando formularios…</span>
        </div>
      )}

      {/* Error */}
      {!isLoading && error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-700">{error}</div>
      )}

      {/* Empty */}
      {!isLoading && !error && forms.length === 0 && (
        <div className="rounded-md bg-gray-50 border border-gray-200 p-10 text-center text-sm text-gray-500">
          No hay formularios registrados para este lote
        </div>
      )}

      {/* Table */}
      {!isLoading && !error && forms.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
            <thead className="bg-gray-50">
              <tr>
                {["Tipo", "Estado", "Completado por", "Enviado", "Campos"].concat(
                  canApprove ? ["Acciones"] : [],
                ).map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {forms.map((form) => (
                <tr key={form.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-800">
                    {FORM_TYPE_LABELS[form.form_type] ?? form.form_type}
                  </td>
                  <td className="px-4 py-3">
                    <FormStatusBadge status={form.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-700">{form.filled_by_username ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {form.submitted_at ? new Date(form.submitted_at).toLocaleDateString("es-CL") : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{form.fields.length}</td>
                  {canApprove && (
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-700 border-green-300 hover:bg-green-50"
                          disabled={form.status === "approved"}
                          onClick={() => void changeFormStatus(form.id, "approved")}
                        >
                          Aprobar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-700 border-red-300 hover:bg-red-50"
                          disabled={form.status === "rejected"}
                          onClick={() => void changeFormStatus(form.id, "rejected")}
                        >
                          Rechazar
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
