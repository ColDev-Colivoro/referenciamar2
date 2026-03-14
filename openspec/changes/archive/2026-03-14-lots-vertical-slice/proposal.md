# Proposal: Lots Vertical Slice — ColdevConAC

## Intent

El dominio **Lot (Lote)** es la unidad operativa central de la plataforma de control
de calidad pesquera. Actualmente existe un componente frontend mock (`lot-management.tsx`)
con datos hardcodeados y un modelo placeholder (`QualityPlaceholder`) en el backend,
pero ninguna capa real de persistencia, API ni integración end-to-end.

Este cambio entrega el primer vertical slice operativo real del dominio de lotes:
modelo de base de datos, migraciones, endpoints CRUD, y página frontend conectada
a la API real — respetando multitenancy, autenticación por token y las convenciones
ya establecidas en auth y users.

---

## Scope

### In Scope

- **Modelo `Lot`** en `backend/apps/quality/models.py` con todos los campos del dominio
  (`code`, `species`, `origin`, `entry_date`, `status`, `quantity_kg`, `tenant`, `created_by`, `created_at`, `updated_at`)
- **Migración** inicial del modelo `Lot` (reemplaza `QualityPlaceholder`)
- **Serializers** DRF: `LotSerializer` (lista/detalle) y `LotCreateUpdateSerializer` (escritura)
- **ViewSet** `LotViewSet` con acciones: `list`, `create`, `retrieve`, `partial_update`, `destroy` + acción `change_status`
- **URLs** en `backend/apps/quality/urls.py` registradas bajo `/api/v1/lots/`
- **Wiring de URLs** en `backend/config/urls.py`
- **Permisos** basados en membresía de tenant + roles (reutiliza `get_request_membership`)
- **Página frontend** `/dashboard/lots/` con tabla de lotes y botón "Nuevo Lote"
- **Formulario de creación** de lote conectado a `POST /api/v1/lots/`
- **Badge de estado** con los 4 estados del dominio: `pending`, `in_process`, `approved`, `rejected`
- **Hook `useLots`** en `frontend/hooks/` para encapsular llamadas a la API
- **Refactor** de `lot-management.tsx` (mock) para usar datos reales desde el hook

### Out of Scope

- Formularios de control de calidad asociados al lote (próximo slice)
- Informes y exportación PDF/Excel de lotes
- Paginación avanzada y filtros complejos en el frontend
- Bulk actions (aprobación masiva, etc.)
- Histórico de cambios de estado del lote (auditoría detallada, fase futura)
- Integración con Power BI
- Tests automatizados (se abordan en change separado de testing)

---

## Approach

### Backend

1. **Reemplazar `QualityPlaceholder`** por el modelo `Lot` en `apps/quality/models.py`.
   El modelo usa `tenant` FK a `TenantRegistry` (igual que el placeholder) para aislamiento
   multitenant. `created_by` FK a `settings.AUTH_USER_MODEL`.

2. **Código de lote** generado en `save()` si no se provee: prefijo `LOT-{year}-{seq:03d}`
   único por tenant, garantizado con `unique_together = ('code', 'tenant')`.

3. **ViewSet** filtra siempre por `tenant = request.tenant` (resuelto por
   `TenantContextMiddleware` ya existente). Ningún lote de otro tenant puede escapar.

4. **Acción `change_status`**: `POST /api/v1/lots/{id}/change_status/` con body
   `{status: "approved"}`. Valida transiciones permitidas.

5. **Permiso**: `LotPermission` custom — requiere membresía activa en el tenant.
   Escritura solo para roles `quality_manager`, `manager`, `tenant_admin`, `global_admin`.
   Lectura para cualquier rol activo en el tenant.

### Frontend

1. **Hook `useLots`** usa `fetch` con el token JWT/DRF desde `AuthContext` (ya existente).
   Expone `lots`, `loading`, `error`, `createLot`, `changeStatus`.

2. **Página `/dashboard/lots/`** nueva en `frontend/app/dashboard/lots/page.tsx`.
   Tabla responsiva con columnas: Código, Especie, Origen, Fecha entrada, Kg, Estado.

3. **Formulario en modal** (Shadcn `Dialog`) para crear lote con validación client-side
   básica antes de submit.

4. **`lot-management.tsx`** se refactoriza para aceptar datos reales desde el hook
   en lugar del mock `Lot[]`. La interfaz interna se alinea con el schema real de la API.

---

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `backend/apps/quality/models.py` | Modified | Reemplazar `QualityPlaceholder` por `Lot` |
| `backend/apps/quality/migrations/` | New | Migración inicial del modelo `Lot` |
| `backend/apps/quality/serializers.py` | New | `LotSerializer`, `LotCreateUpdateSerializer` |
| `backend/apps/quality/views.py` | New | `LotViewSet` con permisos multitenant |
| `backend/apps/quality/permissions.py` | New | `LotPermission` basada en membresía y rol |
| `backend/apps/quality/urls.py` | New | Router DRF registrando `LotViewSet` |
| `backend/config/urls.py` | Modified | Incluir `apps.quality.urls` bajo `/api/v1/lots/` |
| `frontend/hooks/useLots.ts` | New | Hook para llamadas a la API de lotes |
| `frontend/app/dashboard/lots/page.tsx` | New | Página de lista de lotes |
| `frontend/components/quality-manager/lot-management.tsx` | Modified | Refactor: datos reales vía hook |
| `frontend/components/lots/LotForm.tsx` | New | Modal de creación de lote |
| `frontend/components/lots/LotStatusBadge.tsx` | New | Badge con los 4 estados reales |

---

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| `QualityPlaceholder` tiene datos en BD de desarrollo | Low | La migración lo elimina; es placeholder sin datos críticos |
| Conflicto con tenant-scoped routing en el DB router | Med | Revisar `TENANT_SCOPED_MODEL_LABELS` y añadir `quality.Lot`; hacer test manual con 2 tenants |
| Frontend AuthContext aún incompleto (estado-proyecto: 0%) | High | El hook `useLots` acepta el token como parámetro opcional para desacoplar; si AuthContext no está listo, se documenta como blocker |
| Generación de código de lote concurrente produce duplicados | Low | Usar `select_for_update()` + retry, o dejar que `unique_together` lo rechace con error 400 |
| Roles/permisos frontend no implementados aún | Med | La página muestra lotes para cualquier usuario autenticado; los botones de escritura solo se muestran si el rol lo permite (comprobado contra el campo `role.permissions` del contexto) |

---

## Rollback Plan

1. `git revert` del commit del change o `git reset --hard` al commit anterior.
2. Restaurar `QualityPlaceholder` manualmente si la migración ya corrió:
   ```bash
   python manage.py migrate quality 0001  # volver a la migración anterior
   ```
3. Los archivos nuevos de frontend se eliminan; `lot-management.tsx` se restaura con `git checkout`.
4. Eliminar la línea del include en `backend/config/urls.py`.

No hay impacto en los módulos de auth ni users — este cambio es aditivo en su totalidad
excepto por el reemplazo del placeholder.

---

## Dependencies

- `TenantContextMiddleware` (ya implementado en `apps.core.middleware`) — resuelve `request.tenant`
- `get_request_membership` helper (ya existente en `apps.users`) — valida membresía activa
- DRF TokenAuthentication (ya configurado en `REST_FRAMEWORK`) — autentica la request
- `AuthContext` en frontend — provee el token al hook `useLots` (si no está listo, es un blocker parcial solo para la UI)
- Shadcn `Dialog`, `Table`, `Badge`, `Select`, `Input` (ya disponibles en el proyecto)

---

## Success Criteria

- [ ] El modelo `Lot` existe en la base de datos del tenant con todos los campos especificados
- [ ] `GET /api/v1/lots/` retorna solo lotes del tenant activo (HTTP 200)
- [ ] `POST /api/v1/lots/` crea un lote con código auto-generado único por tenant (HTTP 201)
- [ ] `POST /api/v1/lots/{id}/change_status/` cambia el estado del lote (HTTP 200)
- [ ] Un token de tenant A no puede ver lotes de tenant B (HTTP 403 o lista vacía)
- [ ] La página `/dashboard/lots/` carga y muestra la lista real desde la API
- [ ] El formulario de creación envía al backend y refleja el nuevo lote sin recarga manual
- [ ] Los badges de estado muestran los 4 estados del dominio con colores semánticos correctos
- [ ] Ningún mock data queda activo en la ruta de producción de lotes
