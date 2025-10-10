# Mar2Control - Sistema de Control de Calidad Pesquera

![Mar2Control Logo](public/placeholder-logo.png)

Mar2Control es una plataforma web integral diseñada para el control de calidad en la industria pesquera. El sistema permite gestionar formularios, lotes, usuarios y reportes de manera eficiente, con diferentes niveles de acceso según el rol del usuario.

## 🚀 Características Principales

### 📊 Dashboard Multi-Rol
- **Administrador Global**: Gestión completa del sistema, métricas globales y configuración
- **Gerente de Empresa**: Vista general de producción, tendencias de calidad y gestión de usuarios
- **Jefe de Calidad**: Monitoreo de procesos, asignación de formularios y gestión de lotes
- **Monitor de Campo**: Tareas asignadas y acciones rápidas para control de calidad

### 🔧 Funcionalidades Clave
- **Gestión de Formularios**: Sistema de formularios dinámicos para control de calidad
- **Control de Lotes**: Seguimiento completo de lotes de producción
- **Sistema de Tareas**: Asignación y seguimiento de tareas por usuario
- **Reportes y Métricas**: Generación automática de reportes y análisis de tendencias
- **Auditoría**: Registro completo de actividades del sistema
- **Soporte Técnico**: Sistema integrado de tickets de soporte

## 🛠️ Tecnologías Utilizadas

### Frontend
- **Next.js 15.2.4** - Framework de React para aplicaciones web
- **React 19** - Biblioteca de interfaz de usuario
- **TypeScript** - Tipado estático para JavaScript
- **Tailwind CSS** - Framework de CSS utilitario
- **Radix UI** - Componentes de interfaz accesibles
- **Lucide React** - Iconografía moderna
- **Recharts** - Biblioteca de gráficos
- **React Hook Form** - Manejo de formularios
- **Zod** - Validación de esquemas

### Backend
- **Django** - Framework web de Python
- **SQLite** - Base de datos (desarrollo)
- **Django REST Framework** - API REST

### Herramientas de Desarrollo
- **pnpm** - Gestor de paquetes
- **ESLint** - Linter de JavaScript/TypeScript
- **PostCSS** - Procesador de CSS
- **Geist Fonts** - Tipografía moderna

## 📁 Estructura del Proyecto

```
referenciamar2/
├── app/                          # Páginas de Next.js (App Router)
│   ├── admin/                    # Panel de administración
│   ├── dashboard/                # Dashboards por rol
│   │   ├── manager/             # Dashboard del gerente
│   │   ├── monitor/             # Dashboard del monitor
│   │   ├── quality-manager/     # Dashboard del jefe de calidad
│   │   └── supervisor/          # Dashboard del supervisor
│   ├── layout.tsx               # Layout principal
│   └── page.tsx                 # Página de inicio
├── components/                   # Componentes reutilizables
│   ├── admin/                   # Componentes específicos de admin
│   ├── dashboard/               # Componentes de dashboards
│   ├── forms/                   # Formularios de control
│   ├── ui/                      # Componentes base de UI
│   └── pages/                   # Páginas completas
├── hooks/                       # Custom hooks
├── lib/                         # Utilidades y configuraciones
├── public/                      # Archivos estáticos
└── styles/                      # Estilos globales
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- pnpm (recomendado) o npm
- Python 3.8+ (para el backend)

### 1. Clonar el Repositorio
```bash
git clone <url-del-repositorio>
cd referenciamar2
```

### 2. Instalar Dependencias
```bash
# Usando pnpm (recomendado)
pnpm install

# O usando npm
npm install
```

### 3. Configurar Variables de Entorno
Crear un archivo `.env.local` en la raíz del proyecto:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_APP_NAME=Mar2Control
```

### 4. Iniciar el Servidor de Desarrollo
```bash
# Usando pnpm
pnpm dev

# O usando npm
npm run dev
```

El servidor estará disponible en [http://localhost:3000](http://localhost:3000)

## 📋 Scripts Disponibles

```bash
# Desarrollo
pnpm dev          # Inicia el servidor de desarrollo
pnpm build        # Construye la aplicación para producción
pnpm start        # Inicia el servidor de producción
pnpm lint         # Ejecuta el linter

# Construcción
pnpm build        # Compila la aplicación
pnpm start        # Ejecuta la versión de producción
```

## 🔐 Usuarios de Prueba

El sistema incluye usuarios predefinidos para testing:

| Usuario | Rol | Descripción |
|---------|-----|-------------|
| `admin` | Administrador | Acceso completo al sistema |
| `gerente` | Gerente | Gestión de empresa y producción |
| `jefe` | Jefe de Calidad | Control de procesos de calidad |
| `monitor` | Monitor | Tareas de campo y control |

**Contraseña**: `cualquiera`  
**Empresa**: `cualquiera`

## 🎯 Funcionalidades por Rol

### 👑 Administrador Global
- Gestión de empresas y usuarios
- Configuración del sistema
- Métricas globales
- Tickets de soporte
- Facturación y planes
- Logs del sistema

### 👔 Gerente de Empresa
- Vista general de producción
- Tendencias de calidad
- Gestión de usuarios de la empresa
- Reportes y análisis
- Configuración de empresa

### 🔬 Jefe de Calidad
- Monitoreo de procesos
- Asignación de formularios
- Gestión de lotes
- Desglose de calidad
- Flujo de aprobaciones

### 📊 Monitor de Campo
- Tareas asignadas
- Acciones rápidas
- Formularios de control
- Registro de datos en tiempo real

## 🔧 Configuración del Backend

### 1. Navegar al Directorio Backend
```bash
cd ../backend
```

### 2. Crear Entorno Virtual
```bash
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
```

### 3. Instalar Dependencias
```bash
pip install -r requirements.txt
```

### 4. Configurar Base de Datos
```bash
python manage.py migrate
python manage.py createsuperuser
```

### 5. Iniciar Servidor Django
```bash
python manage.py runserver
```

El API estará disponible en [http://localhost:8000](http://localhost:8000)

## 🌐 API Endpoints

### Autenticación
- `POST /api/auth/login/` - Inicio de sesión
- `POST /api/auth/logout/` - Cierre de sesión
- `GET /api/auth/user/` - Información del usuario

### Empresas
- `GET /api/companies/` - Lista de empresas
- `POST /api/companies/` - Crear empresa
- `GET /api/companies/{id}/` - Detalles de empresa

### Formularios
- `GET /api/forms/` - Lista de formularios
- `POST /api/forms/` - Enviar formulario
- `GET /api/forms/templates/` - Plantillas de formularios

### Lotes
- `GET /api/lots/` - Lista de lotes
- `POST /api/lots/` - Crear lote
- `PUT /api/lots/{id}/` - Actualizar lote

## 🎨 Personalización

### Temas
El sistema soporta temas claro y oscuro. La configuración se encuentra en:
- `components/theme-provider.tsx`
- `app/layout.tsx`

### Colores
Los colores principales se definen en:
- `tailwind.config.ts`
- `styles/globals.css`

### Componentes
Los componentes base están en `components/ui/` y pueden ser personalizados según las necesidades.

## 📱 Aplicación Móvil

El proyecto también incluye una aplicación móvil desarrollada con Expo React Native en el directorio `mar2control/`:

```bash
cd ../mar2control
npm install
npx expo start
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Para soporte técnico o consultas:
- Email: soporte@coldev.com
- Documentación: [Wiki del Proyecto]
- Issues: [GitHub Issues]

## 🚀 Roadmap

### Versión 1.1
- [ ] Notificaciones push
- [ ] Exportación de reportes en PDF
- [ ] Integración con dispositivos IoT
- [ ] Dashboard en tiempo real

### Versión 1.2
- [ ] App móvil completa
- [ ] Sistema de alertas avanzado
- [ ] Integración con sistemas ERP
- [ ] API de terceros

---

**Desarrollado por ColDev - Mar2Control Team** 🐟

