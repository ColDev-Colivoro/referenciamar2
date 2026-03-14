"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Waves } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ApiError } from "@/lib/api/client"
import { getRouteForRole, login } from "@/lib/auth/session"

export function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [selectedCompany, setSelectedCompany] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const handleLogin = async () => {
    setIsLoading(true)
    setErrorMessage("")

    try {
      const result = await login({
        username,
        password,
        tenantSlug: selectedCompany === "global" ? undefined : selectedCompany,
      })

      router.push(getRouteForRole(result.user.role))
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage("No fue posible iniciar sesión. Intenta nuevamente.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 flex items-center justify-center p-4 font-sans antialiased">
      <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm shadow-2xl rounded-xl border border-blue-200">
        <CardHeader className="text-center pt-8 pb-6">
          <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-5 rounded-full w-24 h-24 mx-auto mb-4 shadow-lg flex items-center justify-center">
            <Waves className="h-14 w-14 text-white" />
          </div>
          <CardTitle className="text-3xl font-extrabold text-blue-900 tracking-tight">Mar2Control</CardTitle>
          <p className="text-base text-gray-600 mt-2">Coldev-CADC · Control de Calidad Pesquera</p>
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
            <div className="bg-blue-50 p-4 rounded-lg text-sm border border-blue-200 text-blue-700">
              <p className="font-bold text-blue-800 mb-2">Acceso real en construcción</p>
              <p>Este login ya está preparado para autenticarse contra el backend Django de Coldev-CADC.</p>
              <p className="mt-2">Debes configurar tenant, usuario y credenciales reales para operar.</p>
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

          {errorMessage ? <p className="text-sm font-medium text-red-600">{errorMessage}</p> : null}

          <div className="text-center pt-6 border-t border-gray-200 space-y-4">
            <p className="text-sm text-gray-600 font-semibold mb-3">Slice actual en progreso</p>
            <p className="text-sm text-gray-500">
              El acceso directo de desarrollo fue removido para priorizar autenticación, tenant y roles reales.
            </p>
          </div>
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">Coldev-CADC · Fundación de producto</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
