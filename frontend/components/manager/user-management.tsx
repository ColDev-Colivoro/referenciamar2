"use client"

import { useEffect, useMemo, useState, type FormEvent } from "react"
import { Loader2, RefreshCw, Shield, UserCheck, UserPlus, UserX, Users } from "lucide-react"

import { ApiError } from "@/lib/api/client"
import { createUser, listRoles, listUsers, updateMembership } from "@/lib/users/api"
import type { Role, UserMembership } from "@/lib/users/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface UserManagementProps {
  canManage?: boolean
  tenantName?: string
  currentUserRoleLabel?: string
}

const emptyForm = {
  username: "",
  password: "",
  first_name: "",
  last_name: "",
  email: "",
  role_id: "",
}

const roleBadgeStyles: Record<string, string> = {
  global_admin: "bg-indigo-100 text-indigo-700",
  tenant_admin: "bg-violet-100 text-violet-700",
  manager: "bg-emerald-100 text-emerald-700",
  quality_manager: "bg-amber-100 text-amber-700",
  monitor: "bg-sky-100 text-sky-700",
  production_supervisor: "bg-orange-100 text-orange-700",
}

const roleLabels: Record<string, string> = {
  global_admin: "Administrador Global",
  tenant_admin: "Administrador Tenant",
  manager: "Gerente",
  quality_manager: "Jefe de Calidad",
  monitor: "Monitor",
  production_supervisor: "Jefe de Planta",
}

export function UserManagement({ canManage = true, tenantName, currentUserRoleLabel }: UserManagementProps) {
  const [users, setUsers] = useState<UserMembership[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(canManage)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [formData, setFormData] = useState(emptyForm)

  const loadData = async () => {
    if (!canManage) {
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const [memberships, nextRoles] = await Promise.all([listUsers(), listRoles()])
      setUsers(memberships)
      setRoles(nextRoles)
      setFormData((current) => ({
        ...current,
        role_id: current.role_id || (nextRoles[0] ? String(nextRoles[0].id) : ""),
      }))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No fue posible cargar la gestión de usuarios.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [canManage])

  const summary = useMemo(() => {
    const active = users.filter((user) => user.is_active).length
    const inactive = users.length - active
    const admins = users.filter((user) => ["global_admin", "tenant_admin"].includes(user.role.code)).length

    return { total: users.length, active, inactive, admins }
  }, [users])

  const getRoleBadge = (role: string) => (
    <Badge className={`text-xs font-medium ${roleBadgeStyles[role] ?? "bg-gray-100 text-gray-700"}`}>
      {roleLabels[role] ?? role}
    </Badge>
  )

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return (
        <Badge className="text-xs font-medium bg-emerald-100 text-emerald-700 flex items-center gap-1">
          <UserCheck className="h-3 w-3" /> Activo
        </Badge>
      )
    }

    return (
      <Badge className="text-xs font-medium bg-gray-100 text-gray-700 flex items-center gap-1">
        <UserX className="h-3 w-3" /> Inactivo
      </Badge>
    )
  }

  const handleCreateUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!formData.role_id) {
      setError("Debes seleccionar un rol.")
      return
    }

    setIsSubmitting(true)
    setError("")
    setSuccessMessage("")

    try {
      const newMembership = await createUser({
        username: formData.username,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        role_id: Number(formData.role_id),
      })

      setUsers((current) => [newMembership, ...current])
      setFormData({ ...emptyForm, role_id: formData.role_id })
      setSuccessMessage("Usuario creado correctamente.")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No fue posible crear el usuario.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleMembershipUpdate = async (membershipId: number, payload: { role_id?: number; is_active?: boolean }) => {
    setError("")
    setSuccessMessage("")

    try {
      const updatedMembership = await updateMembership(membershipId, payload)
      setUsers((current) => current.map((membership) => (membership.id === membershipId ? updatedMembership : membership)))
      setSuccessMessage("Membresía actualizada.")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No fue posible actualizar la membresía.")
    }
  }

  if (!canManage) {
    return (
      <Card className="w-full bg-white/90 backdrop-blur-sm shadow-lg rounded-xl border border-blue-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold text-blue-800 flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-600" />
            Gestión de Usuarios
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-slate-700">
            Tu rol actual <strong>{currentUserRoleLabel ?? "sin permisos"}</strong> no puede administrar usuarios en <strong>{tenantName ?? "este tenant"}</strong>.
          </p>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            Este panel quedará disponible cuando ingreses con un rol administrativo o con permisos explícitos de gestión de usuarios.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full bg-white/90 backdrop-blur-sm shadow-lg rounded-xl border border-blue-200">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className="text-lg font-bold text-blue-800 flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-600" />
            Gestión de Usuarios
          </CardTitle>
          <Button type="button" size="sm" variant="outline" className="gap-2 bg-transparent" onClick={() => void loadData()} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Recargar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-2 gap-2 text-center lg:grid-cols-4">
          <div className="bg-emerald-50 p-2 rounded-lg shadow-sm border border-emerald-100">
            <p className="text-xl font-bold text-emerald-800">{summary.active}</p>
            <p className="text-xs text-gray-600">Activos</p>
          </div>
          <div className="bg-gray-50 p-2 rounded-lg shadow-sm border border-gray-100">
            <p className="text-xl font-bold text-gray-800">{summary.inactive}</p>
            <p className="text-xs text-gray-600">Inactivos</p>
          </div>
          <div className="bg-indigo-50 p-2 rounded-lg shadow-sm border border-indigo-100">
            <p className="text-xl font-bold text-indigo-800">{summary.admins}</p>
            <p className="text-xs text-gray-600">Admins</p>
          </div>
          <div className="bg-sky-50 p-2 rounded-lg shadow-sm border border-sky-100">
            <p className="text-xl font-bold text-sky-800">{summary.total}</p>
            <p className="text-xs text-gray-600">Total</p>
          </div>
        </div>

        <form onSubmit={handleCreateUser} className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div>
            <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-emerald-600" />
              Crear usuario del tenant
            </h4>
            <p className="text-xs text-slate-500">Alta rápida de usuarios y asignación inicial de rol.</p>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="username">Usuario</Label>
              <Input id="username" value={formData.username} onChange={(event) => setFormData((current) => ({ ...current, username: event.target.value }))} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" value={formData.password} onChange={(event) => setFormData((current) => ({ ...current, password: event.target.value }))} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="role_id">Rol</Label>
              <select
                id="role_id"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.role_id}
                onChange={(event) => setFormData((current) => ({ ...current, role_id: event.target.value }))}
                required
              >
                <option value="" disabled>
                  Seleccionar rol
                </option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="first_name">Nombre</Label>
              <Input id="first_name" value={formData.first_name} onChange={(event) => setFormData((current) => ({ ...current, first_name: event.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="last_name">Apellido</Label>
              <Input id="last_name" value={formData.last_name} onChange={(event) => setFormData((current) => ({ ...current, last_name: event.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={formData.email} onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))} />
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting || isLoading || roles.length === 0}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
            Crear usuario
          </Button>
        </form>

        {error ? <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}
        {successMessage ? <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{successMessage}</div> : null}

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-semibold text-gray-700">Usuarios del tenant</h4>
            <span className="text-xs text-slate-500">{tenantName ?? "Tenant actual"}</span>
          </div>
          <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
            {isLoading ? (
              <div className="flex items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cargando usuarios y roles...
              </div>
            ) : null}

            {!isLoading && users.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
                No hay usuarios cargados aún para este tenant.
              </div>
            ) : null}

            {users.map((user) => (
              <div key={user.id} className="border border-gray-200 rounded-lg p-3 space-y-3 bg-white shadow-sm">
                <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{user.full_name}</p>
                    <p className="text-xs text-gray-500">
                      @{user.username}
                      {user.email ? ` · ${user.email}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {getRoleBadge(user.role.code)}
                    {getStatusBadge(user.is_active)}
                  </div>
                </div>

                <div className="grid gap-2 lg:grid-cols-[1fr_auto_auto] lg:items-center">
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                    value={user.role.id}
                    onChange={(event) => void handleMembershipUpdate(user.id, { role_id: Number(event.target.value) })}
                  >
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-9 text-xs font-medium border-gray-300 text-gray-700 hover:bg-gray-100 rounded-md bg-transparent"
                    onClick={() => void handleMembershipUpdate(user.id, { is_active: !user.is_active })}
                  >
                    {user.is_active ? (
                      <>
                        <UserX className="mr-1 h-3 w-3" />
                        Desactivar
                      </>
                    ) : (
                      <>
                        <UserCheck className="mr-1 h-3 w-3" />
                        Activar
                      </>
                    )}
                  </Button>
                  <Badge className="justify-center bg-slate-100 text-slate-700">
                    <Shield className="mr-1 h-3 w-3" />
                    ID #{user.id}
                  </Badge>
                </div>

                <div className="text-xs text-slate-500">Alta: {new Date(user.created_at).toLocaleString("es-CL")}</div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
