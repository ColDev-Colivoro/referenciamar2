# Frontend shell y flujo de usuario propuesto

## Problema actual

El frontend actual concentra demasiadas funcionalidades en paneles únicos y pantallas densas.
Esto genera:

- navegación confusa
- demasiadas tarjetas mezcladas en una misma vista
- dificultad para crecer por módulos
- mala lectura del estado real del sistema
- baja sensación de producto profesional

Además, todavía conviven componentes heredados con enfoques distintos, incluyendo restos no alineados con la app web actual.

## Decisión

El frontend de **Coldev-CADC** debe migrar desde pantallas monolíticas a un patrón de **App Shell + Sidebar + Secciones + Tarjetas funcionales**.

## Objetivo UX

Cada usuario debe entrar a un espacio claro, con este orden:

1. **Layout principal persistente**
   - header superior
   - sidebar lateral
   - área central de contenido

2. **Sidebar por rol**
   - navegación clara por dominios
   - acceso visible solo a módulos autorizados
   - agrupación por secciones

3. **Vista de sección**
   - encabezado de sección
   - resumen breve
   - tarjetas con subfuncionalidades

4. **Vista de funcionalidad**
   - formulario, tabla, workflow o detalle específico
   - sin mezclar módulos no relacionados

## Patrón de diseño recomendado

### 1. App Shell
Responsable de:
- sidebar
- topbar
- breadcrumbs
- estado de sesión
- tenant actual
- alerts/notificaciones

### 2. Sidebar Navigation Pattern
Cada rol ve solo sus secciones relevantes.
La navegación debe ser:
- persistente
- predecible
- jerárquica
- escalable

### 3. Section Landing Pattern
Cada sección principal tendrá una página de entrada con:
- resumen
- KPIs mínimos
- tarjetas de acceso
- acciones principales

### 4. Feature Page Pattern
Cada funcionalidad debe vivir en su propia pantalla:
- listado
- creación
- edición
- detalle
- auditoría
- reportes

No deben coexistir demasiadas funciones distintas en una sola vista.

## Estructura conceptual de navegación

### Núcleo transversal
- Inicio
- Mi sesión
- Notificaciones
- Ayuda

### Administración
- Usuarios
- Roles y permisos
- Tenants / empresas
- Configuración
- Auditoría

### Operación
- Recepción
- Lotes
- Producción
- Formularios
- Calidad
- Despacho

### Analítica
- Reportes
- Indicadores
- Tendencias
- Exportaciones

## Sidebar por rol

### Global Admin / Tenant Admin
- Resumen
- Usuarios
- Roles
- Auditoría
- Configuración
- Empresas/Tenants (cuando exista backend)

### Manager
- Resumen
- Operación
- Calidad
- Reportes
- Auditoría
- Usuarios (solo si tiene permisos)

### Quality Manager
- Resumen
- Lotes
- Formularios de calidad
- Aprobaciones
- No conformidades
- Reportes

### Monitor
- Tareas asignadas
- Formularios pendientes
- Registros recientes

### Production Supervisor
- Producción
- Seguimiento de etapas
- Incidencias
- Coordinación operativa

## Estructura objetivo de rutas

```text
app/
  (protected)/
    layout.tsx                  -> app shell autenticado
    page.tsx                    -> home según rol

    admin/
      page.tsx                  -> resumen admin
      users/page.tsx            -> gestión de usuarios
      roles/page.tsx            -> roles y permisos
      audit/page.tsx            -> auditoría
      settings/page.tsx         -> configuración

    operations/
      page.tsx                  -> resumen operativo
      receptions/page.tsx
      lots/page.tsx
      production/page.tsx
      dispatch/page.tsx

    quality/
      page.tsx                  -> resumen calidad
      forms/page.tsx
      approvals/page.tsx
      findings/page.tsx
      trends/page.tsx

    analytics/
      page.tsx                  -> resumen analítico
      reports/page.tsx
      indicators/page.tsx
      exports/page.tsx
```

## Regla de composición visual

Cada sección tendrá:

- encabezado con contexto
- tarjetas de navegación funcional
- tabla o resumen principal
- CTA claros
- estados vacíos reales
- mensajes de permisos cuando aplique

## Qué debe desaparecer

- paneles enormes con módulos no relacionados mezclados
- dashboards que intentan resolver todo a la vez
- pantallas con datos mock mezclados con flujos reales
- navegación ambigua o dependiente de botones dentro de tarjetas aisladas

## Qué debe aparecer

- sidebar consistente
- navegación entre secciones
- jerarquía por dominio
- páginas enfocadas por tarea
- separación entre overview y detalle
- control visual de permisos por rol

## Decisión técnica de implementación

La refactorización del frontend debe hacerse en este orden:

1. crear **App Shell autenticado** reutilizable
2. definir configuración de navegación por rol
3. separar dashboards grandes en **secciones principales**
4. mover tarjetas actuales a páginas de sección o páginas funcionales
5. eliminar gradualmente componentes mock o heredados
6. conectar cada pantalla nueva a backend real de forma incremental

## Primer batch recomendado

### Batch 1
- layout autenticado con sidebar
- configuración de menú por rol
- resumen admin simplificado
- resumen manager simplificado
- mover gestión de usuarios a ruta dedicada

### Batch 2
- sección calidad
- sección operaciones
- home por rol
- breadcrumbs y estados vacíos

### Batch 3
- desacople final de dashboards monolíticos
- limpieza de componentes heredados
- alineación visual completa

## Relación con SDD actual

Este frente debe tratarse como una continuación natural de la fundación del producto, pero conceptualmente equivale a un subcambio de:

- arquitectura frontend
- experiencia de navegación
- organización modular de la plataforma

## Notas

Esta propuesta no usa nombres reales de empresas ni personas.
Se alinea con la idea de producto real, modular y escalable para Coldev-CADC.
