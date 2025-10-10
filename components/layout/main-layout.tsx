"use client"

import type React from "react"
import { Waves, LogOut, User, Building2, Bell, Menu } from "lucide-react"
import { Card, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ModeToggle } from "@/components/ui/theme-toggle"

interface MainLayoutProps {
  children: React.ReactNode
  userRole?: "manager" | "quality-manager" | "monitor" | "admin"
  userName?: string
  companyName?: string
}

export function MainLayout({ children, userRole, userName, companyName }: MainLayoutProps) {
  const getRoleBadge = () => {
    const roleConfig = {
      manager: { label: "Gerente", color: "bg-emerald-100 text-emerald-700" },
      "quality-manager": { label: "Jefe de Calidad", color: "bg-amber-100 text-amber-700" },
      monitor: { label: "Monitor", color: "bg-sky-100 text-sky-700" },
      admin: { label: "Administrador Global", color: "bg-indigo-100 text-indigo-700" },
    }

    const config = userRole ? roleConfig[userRole] : { label: "Usuario", color: "bg-gray-100 text-gray-700" }

    return (
      <Badge className={`text-xs font-medium ${config.color}`}>
        <User className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  const handleLogout = () => {
    window.location.href = "/"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 p-4 font-sans antialiased">
      {/* Header Principal - Más moderno y prominente */}
      <header className="mb-8">
        <Card className="bg-gradient-to-r from-blue-700 to-cyan-600 text-white shadow-lg rounded-xl overflow-hidden">
          <CardHeader className="py-5 px-6 flex flex-row items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
                <Waves className="h-9 w-9 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Mar2Control</h1>
                <p className="text-blue-100 text-sm opacity-90">Gestión de Calidad Pesquera</p>
              </div>
            </div>

            {/* Info del Usuario - Más espaciado y claro */}
            {userRole && userName && companyName && (
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="flex items-center justify-end gap-2 mb-1">
                    <span className="text-lg font-semibold">{userName}</span>
                    {getRoleBadge()}
                  </div>
                  <div className="flex items-center justify-end gap-1 text-sm text-blue-200">
                    <Building2 className="h-4 w-4" />
                    {companyName}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-white hover:bg-white/20 transition-colors duration-200 rounded-full"
                  >
                    <Bell className="h-5 w-5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-white hover:bg-white/20 transition-colors duration-200 rounded-full"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                  {/* Theme Toggle */}
                  <ModeToggle />
                  {/* Menú para móvil */}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="lg:hidden text-white hover:bg-white/20 transition-colors duration-200 rounded-full"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}
          </CardHeader>
        </Card>
      </header>

      {/* Contenido Principal */}
      <main className="container mx-auto max-w-7xl">{children}</main>
    </div>
  )
}
