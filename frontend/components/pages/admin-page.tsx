"use client"

import { Building2, KeyRound, ShieldCheck, Users } from "lucide-react"

import { getRolePresentation } from "@/lib/auth/roles"
import { useSession } from "@/lib/auth/use-session"
import { MainLayout } from "../layout/main-layout"
import { UserManagement } from "../manager/user-management"
import { Badge } from "../ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"

export function AdminPage() {
  const { session } = useSession()
  const rolePresentation = getRolePresentation(session?.user.role)

  return (
    <MainLayout
      userRole={session?.user.role ?? "admin"}
      userName={session?.user.fullName ?? "Administrador"}
      companyName={session?.tenant.name ?? "Coldev-CADC"}
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-4">
        <div className="xl:col-span-2">
          <Card className="border border-indigo-200 bg-white/90 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-900">
                <ShieldCheck className="h-5 w-5 text-indigo-600" />
                Fundación administrativa activa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-700">
              <p>
                Este panel ya opera sobre la sesión real del backend Django y sobre el tenant resuelto. La prioridad actual es cerrar
                seguridad, usuarios, roles y auditoría.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge className={rolePresentation.color}>{rolePresentation.label}</Badge>
                <Badge className="bg-sky-100 text-sky-700">Tenant: {session?.tenant.slug ?? "sin resolver"}</Badge>
                <Badge className="bg-emerald-100 text-emerald-700">Modo: {session?.sessionMode ?? "hybrid"}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-1">
          <Card className="border border-sky-200 bg-white/90 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sky-900">
                <Users className="h-5 w-5 text-sky-600" />
                Alcance actual
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-700">
              <p>Slice en curso: auth híbrida, tenant resolution y gestión de usuarios/roles.</p>
              <p>Las vistas globales de empresas, facturación y soporte quedan diferidas hasta tener backend dedicado.</p>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-1">
          <Card className="border border-emerald-200 bg-white/90 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-900">
                <KeyRound className="h-5 w-5 text-emerald-600" />
                Controles disponibles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-700">
              <ul className="list-disc space-y-1 pl-5">
                <li>Login real vía API</li>
                <li>Sesión híbrida con cookies</li>
                <li>Protección por rol en rutas</li>
                <li>Gestión tenant-aware de usuarios</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="xl:col-span-2">
          <UserManagement canManage tenantName={session?.tenant.name} currentUserRoleLabel={rolePresentation.label} />
        </div>

        <div className="lg:col-span-2">
          <Card className="border border-slate-200 bg-white/90 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <Building2 className="h-5 w-5 text-slate-600" />
                Próximos módulos administrativos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-700">
              <p>
                La administración global de empresas, planes, soporte y billing se retomará cuando exista backend específico para esos
                dominios.
              </p>
              <p>Por ahora este panel deja de mostrar mocks y se concentra en funciones ya respaldadas por API real.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
