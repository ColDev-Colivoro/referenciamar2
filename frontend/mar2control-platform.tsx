"use client"

import {
  Fish,
  Building2,
  ClipboardCheck,
  FileText,
  TrendingUp,
  Shield,
  Search,
  Bell,
  Settings,
  Eye,
  Edit,
  Check,
  X,
  Clock,
  User,
  AlertTriangle,
  CheckCircle,
  Menu,
  BarChart3,
  FileCheck,
  UserCheck,
  Anchor,
  Waves,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"

export default function Mar2ControlPlatform() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
      {/* Header Principal */}
      <div className="mb-6">
        <Card className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Waves className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Mar2Control</h1>
                  <p className="text-blue-100">Sistema de Control de Calidad Pesquera</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-100">ColDev-Mar2Control</p>
                <p className="text-xs text-blue-200">Plataforma Global</p>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Grid Principal de Pantallas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* 1. Login Screen */}
        <Card className="col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <User className="h-4 w-4 text-blue-600" />
              Login
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

        {/* 2. Panel Gerente - Vista Completa */}
        <Card className="col-span-1 md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-green-600" />
              Panel Gerente - Pesquera del Sur
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                <UserCheck className="h-3 w-3 mr-1" />
                Gerente - Acceso Total
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="bg-blue-50 p-2 rounded text-center">
                <Fish className="h-4 w-4 mx-auto text-blue-600 mb-1" />
                <p className="text-xs font-semibold">1,247</p>
                <p className="text-xs text-gray-600">Lotes Activos</p>
              </div>
              <div className="bg-green-50 p-2 rounded text-center">
                <CheckCircle className="h-4 w-4 mx-auto text-green-600 mb-1" />
                <p className="text-xs font-semibold">98.5%</p>
                <p className="text-xs text-gray-600">Calidad</p>
              </div>
              <div className="bg-orange-50 p-2 rounded text-center">
                <Clock className="h-4 w-4 mx-auto text-orange-600 mb-1" />
                <p className="text-xs font-semibold">23</p>
                <p className="text-xs text-gray-600">Pendientes</p>
              </div>
              <div className="bg-purple-50 p-2 rounded text-center">
                <TrendingUp className="h-4 w-4 mx-auto text-purple-600 mb-1" />
                <p className="text-xs font-semibold">$2.1M</p>
                <p className="text-xs text-gray-600">Exportaciones</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-700">Procesos en Curso</h4>
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span>Salmón Atlántico - Lote SA-2024-001</span>
                  <Badge className="text-xs bg-blue-100 text-blue-700">Congelado</Badge>
                </div>
                <Progress value={85} className="h-1" />
                <div className="flex justify-between items-center text-xs">
                  <span>Langostinos - Lote LG-2024-045</span>
                  <Badge className="text-xs bg-cyan-100 text-cyan-700">Enfriado</Badge>
                </div>
                <Progress value={60} className="h-1" />
              </div>
            </div>

            <div className="flex gap-1">
              <Button size="sm" className="text-xs flex-1 bg-blue-600">
                <Eye className="h-3 w-3 mr-1" />
                Ver Todo
              </Button>
              <Button size="sm" variant="outline" className="text-xs flex-1 bg-transparent">
                <Settings className="h-3 w-3 mr-1" />
                Configurar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 3. Panel Jefe de Planta - Autorización */}
        <Card className="col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="h-4 w-4 text-orange-600" />
              Panel Jefe de Planta
            </CardTitle>
            <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 w-fit">
              <Edit className="h-3 w-3 mr-1" />
              Autoriza Cambios
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-700">Planillas Pendientes de Autorización</h4>

              <div className="border rounded p-2 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-medium">Ficha Técnica - Merluza</p>
                    <p className="text-xs text-gray-600">Monitor: Juan Pérez</p>
                    <p className="text-xs text-gray-500">Modificado: 10:30 AM</p>
                  </div>
                  <Badge className="text-xs bg-yellow-100 text-yellow-700">
                    <Clock className="h-3 w-3 mr-1" />
                    Pendiente
                  </Badge>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" className="text-xs flex-1 bg-green-600">
                    <Check className="h-3 w-3 mr-1" />
                    Aprobar
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs flex-1 bg-transparent">
                    <X className="h-3 w-3 mr-1" />
                    Rechazar
                  </Button>
                </div>
              </div>

              <div className="border rounded p-2 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-medium">Control Temperatura</p>
                    <p className="text-xs text-gray-600">Monitor: María López</p>
                    <p className="text-xs text-gray-500">Modificado: 09:15 AM</p>
                  </div>
                  <Badge className="text-xs bg-yellow-100 text-yellow-700">
                    <Clock className="h-3 w-3 mr-1" />
                    Pendiente
                  </Badge>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" className="text-xs flex-1 bg-green-600">
                    <Check className="h-3 w-3 mr-1" />
                    Aprobar
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs flex-1 bg-transparent">
                    <X className="h-3 w-3 mr-1" />
                    Rechazar
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-2 rounded">
              <p className="text-xs font-medium text-blue-800">Autorizaciones Hoy</p>
              <p className="text-xs text-blue-600">✓ 12 Aprobadas | ✗ 2 Rechazadas</p>
            </div>
          </CardContent>
        </Card>

        {/* 4. Panel Monitor - Solo Rellenar */}
        <Card className="col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-blue-600" />
              Panel Monitor
            </CardTitle>
            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 w-fit">
              <FileCheck className="h-3 w-3 mr-1" />
              Solo Completar
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-700">Planillas Disponibles</h4>

              <div className="border rounded p-2 space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs font-medium">Control de Temperatura</p>
                    <p className="text-xs text-gray-600">Lote: SA-2024-001</p>
                  </div>
                  <Badge className="text-xs bg-green-100 text-green-700">Disponible</Badge>
                </div>
                <Button size="sm" className="w-full text-xs bg-blue-600">
                  <Edit className="h-3 w-3 mr-1" />
                  Completar
                </Button>
              </div>

              <div className="border rounded p-2 space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs font-medium">Inspección Visual</p>
                    <p className="text-xs text-gray-600">Lote: LG-2024-045</p>
                  </div>
                  <Badge className="text-xs bg-green-100 text-green-700">Disponible</Badge>
                </div>
                <Button size="sm" className="w-full text-xs bg-blue-600">
                  <Edit className="h-3 w-3 mr-1" />
                  Completar
                </Button>
              </div>

              <div className="border rounded p-2 space-y-2 opacity-50">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs font-medium">Ficha Técnica</p>
                    <p className="text-xs text-gray-600">Lote: MZ-2024-012</p>
                  </div>
                  <Badge className="text-xs bg-gray-100 text-gray-700">Bloqueada</Badge>
                </div>
                <Button size="sm" className="w-full text-xs" disabled>
                  <X className="h-3 w-3 mr-1" />
                  No Disponible
                </Button>
              </div>
            </div>

            <div className="bg-green-50 p-2 rounded">
              <p className="text-xs font-medium text-green-800">Completadas Hoy</p>
              <p className="text-xs text-green-600">✓ 8 Planillas</p>
            </div>
          </CardContent>
        </Card>

        {/* 5. Gestión por Empresa */}
        <Card className="col-span-1 md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Building2 className="h-4 w-4 text-purple-600" />
              Gestión por Empresa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Tabs defaultValue="pesquera-sur" className="w-full">
              <TabsList className="grid w-full grid-cols-3 text-xs">
                <TabsTrigger value="pesquera-sur" className="text-xs">
                  Pesquera del Sur
                </TabsTrigger>
                <TabsTrigger value="mariscos-pacifico" className="text-xs">
                  Mariscos Pacífico
                </TabsTrigger>
                <TabsTrigger value="exportadora-marina" className="text-xs">
                  Exportadora Marina
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pesquera-sur" className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-blue-50 p-2 rounded">
                    <p className="text-xs font-semibold">Usuarios Activos</p>
                    <p className="text-sm font-bold text-blue-600">24</p>
                    <div className="text-xs text-gray-600">
                      <p>• 2 Gerentes</p>
                      <p>• 4 Jefes de Planta</p>
                      <p>• 18 Monitores</p>
                    </div>
                  </div>
                  <div className="bg-green-50 p-2 rounded">
                    <p className="text-xs font-semibold">Productos</p>
                    <p className="text-sm font-bold text-green-600">156</p>
                    <div className="text-xs text-gray-600">
                      <p>• 89 Pescados</p>
                      <p>• 34 Mariscos</p>
                      <p>• 33 Cefalópodos</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <h5 className="text-xs font-semibold">Procesos Activos</h5>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Salmón Atlántico</span>
                      <Badge className="text-xs bg-blue-100 text-blue-700">Congelado</Badge>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Merluza Austral</span>
                      <Badge className="text-xs bg-cyan-100 text-cyan-700">Enfriado</Badge>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="mariscos-pacifico" className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-blue-50 p-2 rounded">
                    <p className="text-xs font-semibold">Usuarios Activos</p>
                    <p className="text-sm font-bold text-blue-600">18</p>
                    <div className="text-xs text-gray-600">
                      <p>• 1 Gerente</p>
                      <p>• 3 Jefes de Planta</p>
                      <p>• 14 Monitores</p>
                    </div>
                  </div>
                  <div className="bg-green-50 p-2 rounded">
                    <p className="text-xs font-semibold">Productos</p>
                    <p className="text-sm font-bold text-green-600">89</p>
                    <div className="text-xs text-gray-600">
                      <p>• 12 Pescados</p>
                      <p>• 67 Mariscos</p>
                      <p>• 10 Cefalópodos</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* 6. Formulario de Planilla - Monitor */}
        <Card className="col-span-1 md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              Planilla: Control de Temperatura
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge className="text-xs bg-blue-50 text-blue-700">Lote: SA-2024-001</Badge>
              <Badge className="text-xs bg-green-50 text-green-700">Salmón Atlántico</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-xs font-medium">Temperatura Inicial (°C)</label>
                <Input placeholder="-18.5" className="text-xs" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium">Temperatura Final (°C)</label>
                <Input placeholder="-18.2" className="text-xs" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium">Hora Inicio</label>
                <Input type="time" className="text-xs" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium">Hora Fin</label>
                <Input type="time" className="text-xs" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium">Observaciones</label>
              <Textarea placeholder="Registrar cualquier anomalía o observación..." className="text-xs h-16" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium">Verificaciones</label>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Checkbox id="temp-range" />
                  <label htmlFor="temp-range" className="text-xs">
                    Temperatura dentro del rango permitido
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="equipment-ok" />
                  <label htmlFor="equipment-ok" className="text-xs">
                    Equipos de medición calibrados
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="record-complete" />
                  <label htmlFor="record-complete" className="text-xs">
                    Registro completo y legible
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button className="flex-1 text-xs bg-blue-600">
                <FileCheck className="h-3 w-3 mr-1" />
                Guardar y Enviar
              </Button>
              <Button variant="outline" className="flex-1 text-xs bg-transparent">
                <Clock className="h-3 w-3 mr-1" />
                Guardar Borrador
              </Button>
            </div>

            <div className="bg-yellow-50 p-2 rounded">
              <p className="text-xs text-yellow-800">
                <AlertTriangle className="h-3 w-3 inline mr-1" />
                Esta planilla requiere autorización del Jefe de Planta
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 7. Sistema de Autorizaciones */}
        <Card className="col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="h-4 w-4 text-orange-600" />
              Sistema de Autorizaciones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-700">Flujo de Aprobación</h4>

              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-xs font-medium">Monitor</p>
                    <p className="text-xs text-gray-600">Completa planilla</p>
                  </div>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>

                <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded">
                  <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-xs font-medium">Jefe de Planta</p>
                    <p className="text-xs text-gray-600">Revisa y autoriza</p>
                  </div>
                  <Clock className="h-4 w-4 text-yellow-600" />
                </div>

                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-xs font-medium">Gerente</p>
                    <p className="text-xs text-gray-600">Supervisión general</p>
                  </div>
                  <Eye className="h-4 w-4 text-gray-600" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-700">Estados de Planillas</h4>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span>En Proceso</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                  <span>Pendiente</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span>Aprobada</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                  <span>Rechazada</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 8. Vista Móvil Responsive */}
        <Card className="col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Menu className="h-4 w-4 text-purple-600" />
              Vista Móvil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-gray-900 rounded-lg p-3 text-white">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <Waves className="h-4 w-4" />
                  <span className="text-xs font-semibold">Mar2Control</span>
                </div>
                <Bell className="h-4 w-4" />
              </div>

              <div className="space-y-2">
                <div className="bg-white/10 rounded p-2">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="h-3 w-3" />
                    <span className="text-xs">Juan Pérez - Monitor</span>
                  </div>
                  <div className="text-xs text-gray-300">Pesquera del Sur</div>
                </div>

                <div className="grid grid-cols-2 gap-1">
                  <button className="bg-blue-600 p-2 rounded text-xs flex items-center justify-center gap-1">
                    <ClipboardCheck className="h-3 w-3" />
                    Planillas
                  </button>
                  <button className="bg-white/10 p-2 rounded text-xs flex items-center justify-center gap-1">
                    <BarChart3 className="h-3 w-3" />
                    Reportes
                  </button>
                </div>

                <div className="space-y-1">
                  <div className="bg-white/10 rounded p-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs">Control Temp.</span>
                      <Badge className="text-xs bg-green-600">Disponible</Badge>
                    </div>
                  </div>
                  <div className="bg-white/10 rounded p-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs">Inspección</span>
                      <Badge className="text-xs bg-yellow-600">Pendiente</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 9. Auditoría y Trazabilidad */}
        <Card className="col-span-1 md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Search className="h-4 w-4 text-indigo-600" />
              Auditoría y Trazabilidad
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-gray-700">Historial de Cambios</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  <div className="border-l-2 border-blue-600 pl-2 py-1">
                    <p className="text-xs font-medium">Planilla Temperatura Modificada</p>
                    <p className="text-xs text-gray-600">Juan Pérez • 10:30 AM</p>
                    <p className="text-xs text-gray-500">Lote: SA-2024-001</p>
                  </div>
                  <div className="border-l-2 border-green-600 pl-2 py-1">
                    <p className="text-xs font-medium">Autorización Aprobada</p>
                    <p className="text-xs text-gray-600">Carlos Ruiz • 10:45 AM</p>
                    <p className="text-xs text-gray-500">Ficha Técnica Merluza</p>
                  </div>
                  <div className="border-l-2 border-red-600 pl-2 py-1">
                    <p className="text-xs font-medium">Planilla Rechazada</p>
                    <p className="text-xs text-gray-600">Ana García • 09:15 AM</p>
                    <p className="text-xs text-gray-500">Control Sanitario</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-gray-700">Métricas de Empresa</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-blue-50 p-2 rounded text-center">
                    <p className="text-xs font-semibold text-blue-800">Planillas/Día</p>
                    <p className="text-sm font-bold text-blue-600">47</p>
                  </div>
                  <div className="bg-green-50 p-2 rounded text-center">
                    <p className="text-xs font-semibold text-green-800">Aprobación</p>
                    <p className="text-sm font-bold text-green-600">94%</p>
                  </div>
                  <div className="bg-orange-50 p-2 rounded text-center">
                    <p className="text-xs font-semibold text-orange-800">Tiempo Prom.</p>
                    <p className="text-sm font-bold text-orange-600">2.3h</p>
                  </div>
                  <div className="bg-purple-50 p-2 rounded text-center">
                    <p className="text-xs font-semibold text-purple-800">Usuarios Act.</p>
                    <p className="text-sm font-bold text-purple-600">24</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-700">Filtros de Búsqueda</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Select>
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Empresa" />
                  </SelectTrigger>
                </Select>
                <Select>
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Usuario" />
                  </SelectTrigger>
                </Select>
                <Select>
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                </Select>
                <Select>
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Fecha" />
                  </SelectTrigger>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
