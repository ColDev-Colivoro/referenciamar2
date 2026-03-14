# Análisis del frontend de referencia

## Resumen

El frontend actual funciona como **fuente de referencia funcional y visual**, no como fuente final de verdad de negocio.

La mayor parte del sistema actual está basada en:

- datos mock
- arrays hardcodeados
- flujos simulados
- componentes de presentación

## Roles detectados

- administrador global
- gerente
- jefe de calidad
- monitor
- supervisor

## Dominios funcionales detectados

### Administración global

Archivos relevantes:

- `frontend/components/pages/admin-page.tsx`
- `frontend/components/admin/company-list.tsx`
- `frontend/components/admin/company-creation-form.tsx`
- `frontend/components/admin/global-metrics.tsx`
- `frontend/components/admin/system-configuration.tsx`
- `frontend/components/admin/system-logs.tsx`
- `frontend/components/admin/billing-overview.tsx`
- `frontend/components/admin/support-tickets.tsx`

Entidades inferidas:

- empresa / tenant
- plan
- administrador de empresa
- métricas globales
- tickets
- configuración del sistema

### Gestión de usuarios

Archivo relevante:

- `frontend/components/manager/user-management.tsx`

Entidades inferidas:

- usuario
- rol
- estado de usuario
- último acceso

### Calidad y operación

Archivos relevantes:

- `frontend/components/quality-manager/lot-management.tsx`
- `frontend/components/quality-manager/form-assignment.tsx`
- `frontend/components/workflow/approval-workflow.tsx`
- `frontend/components/forms/temperature-control-form.tsx`
- `frontend/components/forms/visual-inspection-form.tsx`
- `frontend/components/monitor/assigned-tasks.tsx`
- `frontend/components/audit/audit-panel.tsx`

Entidades inferidas:

- lote
- producto
- formulario / planilla
- plantilla de formulario
- tarea asignada
- aprobación
- evento de auditoría

## Hallazgos de diseño actual

- existe buena cobertura visual por rol
- la navegación principal ya modela flujos importantes
- los módulos principales del negocio ya están insinuados en la UI
- falta consolidar la fuente real de datos
- falta un modelo de dominio común y persistente

## Conclusión

El frontend actual sirve para:

- identificar dominios
- extraer requisitos funcionales preliminares
- diseñar la primera versión del modelo de datos
- definir arquitectura objetivo

No debe usarse como verdad definitiva sin contrastarlo con el documento funcional real.
