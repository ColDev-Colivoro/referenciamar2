# Proposal: Audit Base — API, Frontend y Retrofit Quality Views

## Intent

Completar el sistema de auditoría base de ColdevConAC. El modelo `AuditEvent` y el helper `log_audit_event()` ya existen en `apps/audit/` y están en uso en `users/views.py`, pero faltan:
- La API pública (`GET /api/v1/audit/`) para consultar eventos por tenant
- La page de frontend para que administradores lean el log
- Llamadas a `log_audit_event` en `quality/views.py` (mutations de Lots sin auditar)
- Tests de backend para el módulo audit

Sin la API ni el frontend, los eventos se graban pero son invisibles para el usuario. Sin el retrofit de quality, las mutaciones de Lots quedan sin traza.

## Scope

### In Scope
- `GET /api/v1/audit/` — listado paginado (page_size=50) de `AuditEvent` filtrado por tenant del actor autenticado
- Filtros opcionales: `action`, `level`, `date_from`, `date_to`
- `AuditEventSerializer` (campos: id, action, level, actor_email, metadata, created_at)
- `AuditListView` con permiso `admin` o `global_admin` (reutilizar lógica de `get_request_membership`)
- `backend/apps/audit/urls.py` + inclusión en `backend/config/urls.py`
- Retrofit `quality/views.py`: añadir `log_audit_event` en `post` (lots.create), `patch` (lots.update), y `LotStatusView.patch` (lots.status_change)
- Frontend: tipos `AuditEvent` en `frontend/lib/audit/types.ts`
- Frontend: `listAuditEvents(params)` en `frontend/lib/audit/api.ts`
- Frontend: hook `useAudit()` en `frontend/hooks/use-audit.ts`
- Frontend: página read-only `frontend/app/dashboard/audit/page.tsx` (tabla con columnas: fecha, actor, acción, nivel, metadata)
- Backend tests: list endpoint (permisos, filtros, paginación)

### Out of Scope
- Añadir campos `resource_type` / `resource_id` al modelo (el patrón actual `action` + `metadata` es suficiente para esta etapa)
- Streaming en tiempo real de eventos
- Exportación a CSV/Excel o Power BI
- Políticas de retención / archivado
- Alertas por email en eventos críticos
- Tests de frontend (Cypress/Playwright)

## Approach

El modelo y la migración `0001_initial` ya existen. El helper `log_audit_event(*, action, tenant, actor, level, metadata)` en `services.py` ya funciona con keyword-only args.

**Backend:** Crear `serializers.py` + `views.py` + `urls.py` en `apps/audit/`. La vista filtra `AuditEvent.objects.filter(tenant=membership.tenant)` y aplica `django-filter` o filtrado manual por `action`, `level`, `created_at__date__gte/lte`. Incluir la ruta en `config/urls.py`. Añadir tests en `backend/tests/test_audit.py`.

**Retrofit quality:** En `quality/views.py` importar `log_audit_event` y llamarlo después de cada mutación exitosa (misma firma que users/views.py), pasando `action="lots.create"` / `"lots.update"` / `"lots.status_change"`.

**Frontend:** Patrón idéntico a `useLots()` — tipos → api client → hook → page. La página usa componente `<DataTable>` de shadcn/ui, read-only, accesible sólo para roles `admin`/`global_admin`.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `backend/apps/audit/serializers.py` | New | AuditEventSerializer |
| `backend/apps/audit/views.py` | New | AuditListView (GET, paginado, filtros) |
| `backend/apps/audit/urls.py` | New | urlpatterns para audit |
| `backend/config/urls.py` | Modified | include("apps.audit.urls") bajo `/api/v1/audit/` |
| `backend/apps/quality/views.py` | Modified | Añadir log_audit_event en 3 mutations de Lot |
| `backend/tests/test_audit.py` | New | Tests: list, permisos, filtros, paginación |
| `frontend/lib/audit/types.ts` | New | Tipo AuditEvent TypeScript |
| `frontend/lib/audit/api.ts` | New | listAuditEvents(params) — fetch a /api/v1/audit/ |
| `frontend/hooks/use-audit.ts` | New | useAudit() hook con SWR/fetch |
| `frontend/app/dashboard/audit/page.tsx` | New | Página audit log (tabla read-only) |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| El modelo actual no tiene `resource_type`/`resource_id` y el orchestrator los espera | Med | Proposal explícitamente los excluye; `action` + `metadata` cubre el caso de uso |
| Permiso de audit mal aplicado expone eventos de otros tenants | Med | Filtrar siempre por `tenant=membership.tenant`; test de cross-tenant |
| Retrofit quality rompe tests existentes de Lots | Low | Los 13 tests de lots no verifican audit — retrofit es additive |
| Frontend page visible para roles sin permiso | Low | Guard en page.tsx con rol check; redirigir a /dashboard si no autorizado |

## Rollback Plan

1. Revertir `config/urls.py` quitando la inclusión de audit urls
2. Eliminar `audit/serializers.py`, `audit/views.py`, `audit/urls.py`
3. Revertir `quality/views.py` (quitar import y 3 llamadas a `log_audit_event`)
4. Eliminar archivos frontend: `lib/audit/`, `hooks/use-audit.ts`, `app/dashboard/audit/`
5. El modelo y la migración `0001_initial` pueden quedarse — no rompen nada

```bash
git revert <commit-hash>
# o cherry-pick revert si se hizo en commits atómicos
```

## Dependencies

- `auth-drf-token` ✅ — autenticación por token necesaria para el endpoint
- `users-roles-permissions` ✅ — `get_request_membership()` y roles admin disponibles
- `lots-vertical-slice` ✅ — quality/views.py existe con mutations a retrofitar
- No requiere nuevas librerías: DRF paginación nativa, shadcn `<DataTable>` ya disponible

## Success Criteria

- [ ] `GET /api/v1/audit/` devuelve 200 con lista paginada para usuario admin autenticado
- [ ] `GET /api/v1/audit/` devuelve 403 para usuario con rol `inspector` o sin membership
- [ ] Filtros `action`, `level`, `date_from`, `date_to` funcionan correctamente
- [ ] Crear un Lot genera un `AuditEvent` con `action="lots.create"`
- [ ] Cambiar status de un Lot genera un `AuditEvent` con `action="lots.status_change"`
- [ ] Tests backend pasan (`pytest backend/tests/test_audit.py`)
- [ ] Frontend page `/dashboard/audit` renderiza tabla con eventos del tenant
- [ ] Frontend page no accesible para roles no-admin (redirect o 403)
