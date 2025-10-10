"use client"

import { User, Anchor } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function LoginPanel() {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <User className="h-4 w-4 text-blue-600" />
          Iniciar Sesión
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-center mb-4">
          <div className="bg-blue-100 p-3 rounded-full w-16 h-16 mx-auto mb-2">
            <Anchor className="h-10 w-10 text-blue-600" />
          </div>
          <h3 className="font-semibold text-blue-900">Mar2Control</h3>
        </div>

        <Input placeholder="Usuario" className="text-xs" />
        <Input placeholder="Contraseña" type="password" className="text-xs" />

        <Select>
          <SelectTrigger className="text-xs">
            <SelectValue placeholder="Seleccionar Empresa" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pesquera-del-sur">Pesquera del Sur</SelectItem>
            <SelectItem value="mariscos-pacifico">Mariscos Pacífico</SelectItem>
            <SelectItem value="exportadora-marina">Exportadora Marina</SelectItem>
          </SelectContent>
        </Select>

        <Button className="w-full text-xs bg-blue-600 hover:bg-blue-700">Iniciar Sesión</Button>
      </CardContent>
    </Card>
  )
}
