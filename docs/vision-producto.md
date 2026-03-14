# Visión de producto — Coldev-CADC

## Qué es Coldev-CADC

Coldev-CADC es una plataforma real de **control de calidad** para operación pesquera, diseñada bajo la línea de producto ColDev.

Debe evolucionar desde el frontend prototipo actual hacia una solución:

- real
- segura
- multitenant
- multiplataforma
- mantenible
- preparada para reporting y BI

## Lo que necesitamos

### Necesidades técnicas

- separar frontend y backend en proyectos distintos
- backend Django como fuente de verdad
- PostgreSQL como base relacional principal
- arquitectura multitenant con aislamiento fuerte
- soporte a auth híbrida
- resolución de tenant por subdominio con fallback por slug
- roles y permisos reales
- auditoría de acciones sensibles
- contratos API claros entre frontend y backend

### Necesidades de producto

- acceso real al sistema
- usuarios reales por tenant
- administración de roles/permisos
- empresas/tenants bien separadas
- trazabilidad
- base para lotes, formularios, aprobaciones, reportes y métricas

### Necesidades operativas

- respaldo por tenant
- restauración por tenant
- separación fuerte de datos
- documentación viva antes de escalar implementación

## Lo que queremos construir

Queremos construir un producto:

- alineado a la identidad ColDev
- enfocado en producto real, no demo
- con arquitectura correcta desde el inicio
- preparado para crecer hacia módulos operativos completos

## Lo que haremos primero

### Slice oficial inicial

1. autenticación
2. resolución de tenant
3. usuarios
4. roles y permisos

## Lo que NO queremos hacer

- seguir ampliando mocks como solución permanente
- mezclar lógica de dominio en frontend
- dejar tolerancias permanentes a errores de build
- diseñar el sistema sin documentación base
- improvisar el modelo de datos sin revisar la referencia funcional

## Principios rectores

1. producto real antes que demo
2. seguridad antes que conveniencia
3. separación de responsabilidades
4. backend-first para lógica de negocio
5. multitenancy con aislamiento fuerte
6. documentación antes de escalar
