# Requisitos funcionales — borrador inicial refinado

> Estado: borrador refinado con base en el frontend actual y en una referencia documental operacional anonimizada.  
> Regla: no usar nombres reales de personas ni de empresas provenientes del documento fuente.

## 1. Acceso y seguridad

- El sistema debe permitir autenticación de usuarios reales.
- El sistema debe resolver el tenant del usuario.
- El sistema debe restringir acceso según rol y permisos.
- El sistema debe impedir acceso cruzado entre tenants.
- El sistema debe permitir auth híbrida para soportar web y futura expansión multiplataforma.

## 2. Administración global

- El sistema debe permitir visualizar tenants/empresas registradas.
- El sistema debe permitir revisar estado de empresa, plan, actividad y métricas globales.
- El sistema debe permitir creación y configuración inicial de empresa.
- El sistema debe permitir trazabilidad y configuración global.

## 3. Gestión de usuarios

- El sistema debe permitir crear usuarios por tenant.
- El sistema debe permitir activar, desactivar, editar y eliminar usuarios.
- El sistema debe permitir asignar roles y permisos.
- El sistema debe registrar último acceso y estado del usuario.

## 4. Gestión de lotes

- El sistema debe asignar un lote trazable desde recepción hasta despacho.
- El sistema debe permitir crear lotes.
- El sistema debe permitir listar lotes por estado.
- El sistema debe permitir ver detalle de lote.
- El sistema debe permitir seguir proceso y progreso del lote.

## 5. Recepción de materia prima

- El sistema debe registrar la recepción de materia prima por lote.
- El sistema debe registrar proveedor/origen de materia prima.
- El sistema debe registrar especie, presentación, kilos y documentación de origen.
- El sistema debe registrar transporte, condiciones de recepción y embarcación cuando aplique.
- El sistema debe registrar temperatura de recepción y evaluación sensorial.

## 6. Proceso productivo

- El sistema debe permitir registrar etapas del proceso productivo.
- El sistema debe contemplar al menos estas etapas iniciales:
  - recepción
  - almacenamiento opcional
  - eviscerado / limpieza / corte
  - fileteo
  - pesaje / emparrillado
  - congelación / enfriado
  - empaque / reempaque
  - almacenamiento
  - despacho
- El sistema debe permitir asociar controles, tiempos y observaciones por etapa.

## 7. Formularios y planillas

- El sistema debe permitir asignar formularios por tipo de producto o proceso.
- El sistema debe permitir completar formularios operativos.
- El sistema debe permitir guardar borradores y envíos.
- El sistema debe permitir manejar estado de formularios/planillas.
- El sistema debe soportar registros de PCC y controles de proceso.

## 8. Flujo de aprobación

- El sistema debe permitir que perfiles responsables aprueben o rechacen planillas.
- El sistema debe registrar prioridad, estado y responsable de revisión.
- El sistema debe registrar historial de cambios y revisión.

## 9. Empaque, reempaque y rotulación

- El sistema debe permitir registrar operaciones de empaque y reempaque.
- El sistema debe permitir conservar trazabilidad del lote original durante reempaque.
- El sistema debe permitir registrar etiquetas con información de producto, presentación, lote, fechas y condiciones de conservación.

## 10. Almacenamiento y despacho

- El sistema debe registrar almacenamiento en frío y sus condiciones.
- El sistema debe registrar despacho de producto terminado.
- El sistema debe registrar condiciones del transporte de salida.
- El sistema debe permitir controlar vida útil según tipo de producto.

## 11. Auditoría

- El sistema debe registrar eventos del sistema.
- El sistema debe registrar usuario, acción, fecha/hora y objeto afectado.
- El sistema debe permitir consulta de auditoría reciente y completa.
- El sistema debe registrar acciones correctivas derivadas de controles o desvíos.

## 12. Métricas y reportes

- El sistema debe mostrar métricas globales y por tenant.
- El sistema debe permitir medir cumplimiento, actividad, formularios y usuarios.
- El modelo de datos debe permitir futura integración con Power BI.

## 13. Requisitos no funcionales relevantes

- multitenancy fuerte
- seguridad por tenant
- backup/restore por tenant
- arquitectura frontend/backend separada
- backend Django
- PostgreSQL
- multiplataforma
- documentación funcional y operativa viva
- trazabilidad completa por lote y proceso
