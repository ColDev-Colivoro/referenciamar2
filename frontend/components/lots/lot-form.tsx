"use client"

import { type FormEvent, useState } from "react"

import { ApiError } from "@/lib/api/client"
import type { CreateLotInput } from "@/lib/lots/types"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface LotFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: CreateLotInput) => Promise<unknown>
}

const emptyForm = {
  code: "",
  species: "",
  origin: "",
  entry_date: "",
  quantity_kg: "",
  notes: "",
}

export function LotForm({ open, onOpenChange, onSubmit }: LotFormProps) {
  const [formData, setFormData] = useState(emptyForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (field: keyof typeof emptyForm, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")

    if (!formData.species.trim() || !formData.origin.trim() || !formData.entry_date || !formData.quantity_kg) {
      setError("Los campos Especie, Origen, Fecha de Entrada y Cantidad son obligatorios.")
      return
    }

    setIsSubmitting(true)
    try {
      const input: CreateLotInput = {
        species: formData.species.trim(),
        origin: formData.origin.trim(),
        entry_date: formData.entry_date,
        quantity_kg: Number(formData.quantity_kg),
        ...(formData.code.trim() && { code: formData.code.trim() }),
        ...(formData.notes.trim() && { notes: formData.notes.trim() }),
      }
      await onSubmit(input)
      setFormData(emptyForm)
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No fue posible crear el lote.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo Lote</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="lot-code">Código (opcional)</Label>
            <Input
              id="lot-code"
              value={formData.code}
              onChange={(e) => handleChange("code", e.target.value)}
              placeholder="Ej: LOT-2024-001"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="lot-species">Especie *</Label>
            <Input
              id="lot-species"
              value={formData.species}
              onChange={(e) => handleChange("species", e.target.value)}
              placeholder="Ej: Salmón Atlántico"
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="lot-origin">Origen *</Label>
            <Input
              id="lot-origin"
              value={formData.origin}
              onChange={(e) => handleChange("origin", e.target.value)}
              placeholder="Ej: Chile"
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="lot-date">Fecha de Entrada *</Label>
            <Input
              id="lot-date"
              type="date"
              value={formData.entry_date}
              onChange={(e) => handleChange("entry_date", e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="lot-qty">Cantidad (Kg) *</Label>
            <Input
              id="lot-qty"
              type="number"
              min="0"
              step="0.01"
              value={formData.quantity_kg}
              onChange={(e) => handleChange("quantity_kg", e.target.value)}
              placeholder="Ej: 1500"
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="lot-notes">Notas (opcional)</Label>
            <textarea
              id="lot-notes"
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Observaciones adicionales..."
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando…" : "Crear Lote"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
