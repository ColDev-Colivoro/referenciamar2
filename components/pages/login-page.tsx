"use client"

import { useState } from "react"
import { Waves } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [selectedCompany, setSelectedCompany] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async () => {
    setIsLoading(true)

    // Simulación de autenticación
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Lógica de redirección según usuario (simulada)
    const userRole = getUserRole(username)

    switch (userRole) {
      case "admin":
        window.location.href = "/admin"
        break
      case "manager":
        window.location.href = "/dashboard/manager"
        break
      case "quality-manager":
        window.location.href = "/dashboard/quality-manager"
        break
      case "monitor":
        window.location.href = "/dashboard/monitor"
        break
      default:
        alert("Usuario no válido")
    }

    setIsLoading(false)
  }

  // Simulación de roles por usuario
  const getUserRole = (username: string) => {
    const roles: Record<string, string> = {
      admin: "admin",
      coldev: "admin",
      gerente: "manager",
      jefe: "quality-manager",
      monitor: "monitor",
    }
    return roles[username.toLowerCase()] || null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 flex items-center justify-center p-4 font-sans antialiased">
      <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm shadow-2xl rounded-xl border border-blue-200">
        <CardHeader className="text-center pt-8 pb-6">
          <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-5 rounded-full w-24 h-24 mx-auto mb-4 shadow-lg flex items-center justify-center">
            <Waves className="h-14 w-14 text-white" />
          </div>
          <CardTitle className="text-3xl font-extrabold text-blue-900 tracking-tight">Mar2Control</CardTitle>
          <p className="text-base text-gray-600 mt-2">Sistema de Control de Calidad Pesquera</p>
        </CardHeader>

        <CardContent className="space-y-6 px-6 pb-8">
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700">Usuario</label>
            <Input
              placeholder="Ingrese su usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="h-10 text-base border-blue-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
            />
            <div className="bg-blue-50 p-4 rounded-lg text-sm border border-blue-200">
              <p className="font-bold text-blue-800 mb-2">Usuarios de Prueba:</p>
              <div className="space-y-1 text-blue-700">
                <p>
                  • <strong className="font-semibold">admin</strong> → Administrador Global
                </p>
                <p>
                  • <strong className="font-semibold">gerente</strong> → Gerente de Empresa
                </p>
                <p>
                  • <strong className="font-semibold">jefe</strong> → Jefe de Calidad
                </p>
                <p>
                  • <strong className="font-semibold">monitor</strong> → Monitor de Campo
                </p>
              </div>
              <p className="text-blue-600 mt-3">
                Contraseña: <strong className="font-semibold">cualquiera</strong> | Empresa:{" "}
                <strong className="font-semibold">cualquiera</strong>
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700">Contraseña</label>
            <Input
              type="password"
              placeholder="Ingrese su contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-10 text-base border-blue-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700">Empresa</label>
            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
              <SelectTrigger className="h-10 text-base border-blue-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200">
                <SelectValue placeholder="Seleccionar Empresa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="global">ColDev-Mar2Control (Global)</SelectItem>
                <SelectItem value="pesquera-del-sur">Pesquera del Sur</SelectItem>
                <SelectItem value="mariscos-pacifico">Mariscos Pacífico</SelectItem>
                <SelectItem value="exportadora-marina">Exportadora Marina</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            className="w-full h-12 text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-lg rounded-lg"
            onClick={handleLogin}
            disabled={!username || !password || !selectedCompany || isLoading}
          >
            {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </Button>

          <div className="text-center pt-6 border-t border-gray-200 space-y-4">
            <p className="text-sm text-gray-600 font-semibold mb-3">Acceso Directo para Desarrollo:</p>
            <div className="grid grid-cols-2 gap-3">
              <Button
                size="lg"
                variant="outline"
                className="h-10 text-sm font-medium border-blue-400 text-blue-700 hover:bg-blue-50 transition-colors duration-200 rounded-lg bg-transparent"
                onClick={() => (window.location.href = "/admin")}
              >
                Vista Admin
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-10 text-sm font-medium border-emerald-400 text-emerald-700 hover:bg-emerald-50 transition-colors duration-200 rounded-lg bg-transparent"
                onClick={() => (window.location.href = "/dashboard/manager")}
              >
                Vista Gerente
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-10 text-sm font-medium border-amber-400 text-amber-700 hover:bg-amber-50 transition-colors duration-200 rounded-lg bg-transparent"
                onClick={() => (window.location.href = "/dashboard/quality-manager")}
              >
                Vista Jefe Calidad
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-10 text-sm font-medium border-sky-400 text-sky-700 hover:bg-sky-50 transition-colors duration-200 rounded-lg bg-transparent"
                onClick={() => (window.location.href = "/dashboard/monitor")}
              >
                Vista Monitor
              </Button>
            </div>
          </div>
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">ColDev-Mar2Control v1.0</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
