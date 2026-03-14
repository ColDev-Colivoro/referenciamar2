# Design: Audit Base — API, Frontend y Retrofit Quality Views

## Technical Approach

El modelo `AuditEvent` y el helper `log_audit_event()` ya existen y funcionan correctamente; no se requieren migraciones ni cambios al modelo. El trabajo consiste en tres capas aditivas: (1) exponer los eventos existentes a través de un endpoint `GET /api/v1/audit/` con paginación y filtros inline, (2) retrofitar `quality/views.py` para que las tres mutaciones de Lots llamen a `log_audit_event()` siguiendo el patrón establecido en `users/views.py`, y (3) construir el slice de frontend `types → api → hook → page` replicando el patrón de `useLots()`. Todo el trabajo es aditivo — no se eliminan ni refactorizan archivos existentes.

## Architecture Decisions

### Decision: APIView read-only para el endpoint de audit

**Choice**: `APIView` con un único método `get()`, paginación `PageNumberPagination(page_size=50)`, filtros via `request.GET.get(...)` inline.

**Alternatives considered**: `ModelViewSet` con `django-filter`; `ListAPIView` genérica.

**Rationale**: Todo el resto de la API usa `APIView` explícito (users, quality). `django-filter` añade dependencia innecesaria para solo 4 parámetros simples. `ModelViewSet` expone automáticamente rutas de escritura que no deben existir para audit.

---

### Decision: Filtrado inline en la vista (sin django-filter)

**Choice**: `request.GET.get('action')`, `request.GET.get('level')`, `request.GET.get('date_from')`, `request.GET.get('date_to')` aplicados directamente al queryset con `.filter()` condicional.

**Alternatives considered**: `django-filter` con `FilterSet`.

**Rationale**: Son exactamente 4 parámetros sobre campos directos del modelo. El overhead de `FilterSet` no está justificado, y no existe en el resto del proyecto.

---

### Decision: Guard de permisos reutilizando `get_request_membership` + `ADMIN_ROLE_CODES`

**Choice**: Llamar `get_request_membership(request)` y verificar `membership.role.code in {"global_admin", "tenant_admin"}`. Retornar 403 si no cumple.

**Alternatives considered**: Crear un nuevo permiso DRF custom class; reutilizar `membership_can_manage_users`.

**Rationale**: `ADMIN_ROLE_CODES = {"global_admin", "tenant_admin"}` ya está definido en `users/services.py` y es exactamente el criterio requerido. `membership_can_manage_users` incluye roles adicionales que no deben ver el log de audit. Consistente con el patrón de `users/views.py`.

---

### Decision: Aislamiento por tenant en el queryset

**Choice**: `AuditEvent.objects.filter(tenant=membership.tenant)` como base del queryset, antes de aplicar cualquier filtro adicional.

**Alternatives considered**: Filtrar por `actor__usermembership__tenant`.

**Rationale**: `AuditEvent.tenant` es una FK directa y es el campo correcto para aislamiento. Evita cross-tenant data leaks — cubierto por test explícito.

---

### Decision: Retrofit quality/views.py aditivo

**Choice**: Añadir `import` de `log_audit_event` y llamarlo después de cada `serializer.save()` / `lot.save()` exitoso en `LotListCreateView.post()`, `LotDetailView.patch()`, y `LotStatusView.patch()`.

**Alternatives considered**: Usar signals Django para auto-auditar.

**Rationale**: Signals ocultan la intención y no están en uso en el proyecto. El patrón explícito post-save es idéntico al de `users/views.py` y es más fácil de razonar y testear.

---

### Decision: Frontend — patrón `useState + useCallback + useEffect + useMemo`

**Choice**: Mismo patrón que `useLots()` — estado local con `useState`, fetch en `useEffect` via `useCallback refresh()`, retorno memoizado con `useMemo`.

**Alternatives considered**: SWR, React Query.

**Rationale**: El proyecto no usa SWR ni React Query. `useLots()` y `useUsers()` usan este patrón; la consistencia es prioritaria.

---

### Decision: Guard de rol en frontend page

**Choice**: Verificar rol en `page.tsx` al montar; redirigir a `/dashboard` si el rol no es `global_admin` ni `tenant_admin`.

**Alternatives considered**: Middleware de Next.js; layout wrapper.

**Rationale**: Las demás páginas de dashboard verifican permisos a nivel de componente. No hay middleware de auth configurado en el proyecto.

## Data Flow

```
Cliente HTTP
    │
    │  GET /api/v1/audit/?action=lots.create&date_from=2024-01-01&page=2
    ▼
AuditListView.get()
    │
    ├─ get_request_membership(request)
    │       │
    │       └─ resolve_tenant(request) ──→ TenantRegistry
    │               + UserMembership lookup
    │
    ├─ guard: role.code in {"global_admin","tenant_admin"} → 403 si no
    │
    ├─ queryset = AuditEvent.objects.filter(tenant=membership.tenant)
    │
    ├─ aplicar filtros opcionales:
    │       action     → .filter(action=action)
    │       level      → .filter(level=level)
    │       date_from  → .filter(created_at__date__gte=date_from)
    │       date_to    → .filter(created_at__date__lte=date_to)
    │
    ├─ AuditPagination.paginate_queryset(queryset, request)
    │       page_size=50
    │
    ├─ AuditEventSerializer(page, many=True)
    │
    └─ paginator.get_paginated_response(serializer.data)
            │
            ▼
        {
          "count": 120,
          "next": "...?page=3",
          "previous": "...?page=1",
          "results": [ { AuditEvent }, ... ]
        }
```

### Retrofit Quality — Data Flow (lots.create)

```
POST /api/v1/lots/
    │
    ▼
LotListCreateView.post()
    ├─ get_request_membership(request)
    ├─ lot_can_write(membership) → 403 si no
    ├─ serializer.is_valid()
    ├─ lot = serializer.save()                 ← existente
    ├─ log_audit_event(                        ← NUEVO
    │       action="lots.create",
    │       tenant=membership.tenant,
    │       actor=request.user,
    │       metadata={"lot_id": lot.id, "code": lot.code}
    │   )
    └─ Response(LotSerializer(lot).data, 201)
```

## File Changes

| File | Action | Description | Status |
|------|--------|-------------|--------|
| `backend/apps/audit/serializers.py` | Create | `AuditEventSerializer` — campos read-only del modelo | ✅ Implemented |
| `backend/apps/audit/views.py` | Create | `AuditListView` con paginación + filtros inline | ✅ Implemented |
| `backend/apps/audit/urls.py` | Create | `urlpatterns` con ruta raíz a `AuditListView` | ✅ Implemented |
| `backend/config/urls.py` | Modify | Añadir `path("api/v1/audit/", include("apps.audit.urls"))` | ✅ Implemented |
| `backend/apps/quality/views.py` | Modify | Importar `log_audit_event`; llamarlo en `post()`, `patch()` (LotDetailView), `patch()` (LotStatusView) | ✅ Implemented |
| `backend/tests/test_audit.py` | Create | 10–12 tests pytest: list, permisos, filtros, paginación, cross-tenant | ✅ Implemented |
| `frontend/lib/audit/types.ts` | Create | Interfaces `AuditEvent` y `AuditFilters` | ✅ Implemented |
| `frontend/lib/audit/api.ts` | Create | `listAuditEvents(params)` → `apiRequest` a `/api/v1/audit/` | ✅ Implemented |
| `frontend/hooks/use-audit.ts` | Create | `useAudit(filters?)` hook con `useState + useCallback + useEffect + useMemo` | ✅ Implemented |
| `frontend/app/dashboard/audit/page.tsx` | Create | Página read-only con `<DataTable>` shadcn/ui + guard de rol | ✅ Implemented |

## Interfaces / Contracts

### Python — AuditEventSerializer

```python
class AuditEventSerializer(serializers.ModelSerializer):
    actor_email = serializers.SerializerMethodField()

    class Meta:
        model = AuditEvent
        fields = ["id", "action", "level", "actor_email", "metadata", "created_at"]
        read_only_fields = fields

    def get_actor_email(self, obj):
        return obj.actor.email if obj.actor else None
```

### Python — AuditListView pseudocode

```python
class AuditPagination(PageNumberPagination):
    page_size = 50

class AuditListView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    pagination_class = AuditPagination

    def get(self, request):
        membership = get_request_membership(request)
        if not membership or membership.role.code not in {"global_admin", "tenant_admin"}:
            return Response({"detail": "No autorizado."}, status=403)

        qs = AuditEvent.objects.filter(tenant=membership.tenant)

        if action := request.GET.get("action"):
            qs = qs.filter(action=action)
        if level := request.GET.get("level"):
            qs = qs.filter(level=level)
        if date_from := request.GET.get("date_from"):
            qs = qs.filter(created_at__date__gte=date_from)
        if date_to := request.GET.get("date_to"):
            qs = qs.filter(created_at__date__lte=date_to)

        paginator = AuditPagination()
        page = paginator.paginate_queryset(qs, request)
        serializer = AuditEventSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)
```

### TypeScript — Interfaces

```typescript
// frontend/lib/audit/types.ts

export type AuditLevel = "info" | "warning" | "error"

export interface AuditEvent {
  id: number
  action: string
  level: AuditLevel
  actor_email: string | null
  metadata: Record<string, unknown>
  created_at: string // ISO datetime string
}

export interface AuditFilters {
  action?: string
  level?: AuditLevel
  date_from?: string // YYYY-MM-DD
  date_to?: string   // YYYY-MM-DD
  page?: number
}

export interface PaginatedAuditResponse {
  count: number
  next: string | null
  previous: string | null
  results: AuditEvent[]
}
```

```typescript
// frontend/lib/audit/api.ts

export function listAuditEvents(params?: AuditFilters): Promise<PaginatedAuditResponse> {
  const qs = new URLSearchParams()
  if (params?.action)    qs.set("action", params.action)
  if (params?.level)     qs.set("level", params.level)
  if (params?.date_from) qs.set("date_from", params.date_from)
  if (params?.date_to)   qs.set("date_to", params.date_to)
  if (params?.page)      qs.set("page", String(params.page))
  const query = qs.toString()
  return apiRequest<PaginatedAuditResponse>(`/api/v1/audit/${query ? `?${query}` : ""}`)
}
```

```typescript
// frontend/hooks/use-audit.ts — return type

interface UseAuditReturn {
  events: AuditEvent[]
  count: number
  isLoading: boolean
  error: string
  page: number
  setPage: (page: number) => void
  filters: AuditFilters
  setFilters: (filters: AuditFilters) => void
  refresh: () => Promise<void>
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `AuditEventSerializer` serializa campos correctamente | pytest + `@pytest.mark.django_db` |
| Integration | `GET /api/v1/audit/` — 200 para tenant_admin, 403 para monitor | `admin_client` / `monitor_client` fixtures de conftest |
| Integration | Filtro `action=lots.create` retorna solo eventos matching | Crear AuditEvents mixtos, verificar subset |
| Integration | Filtro `date_from` / `date_to` | Crear eventos con fechas conocidas |
| Integration | Filtro `level=warning` | Crear eventos con levels mixtos |
| Integration | Paginación: `page_size=50`, segunda página | Crear 55+ eventos, verificar `count` y `next` |
| Integration | Cross-tenant isolation: usuario de tenant_b no ve eventos de tenant_a | Fixtures `membership_b` + `tenant_b` de conftest |
| Integration | Sin autenticación → 401 | `api_client` sin credentials |
| Integration | `lots.create` genera AuditEvent tras POST exitoso a `/api/v1/lots/` | Verificar `AuditEvent.objects.filter(action="lots.create").count()` |
| Integration | `lots.update` genera AuditEvent tras PATCH exitoso | Idem |
| Integration | `lots.status_change` genera AuditEvent tras PATCH a `/status/` | Idem |
| Integration | Respuesta tiene estructura paginada (`count`, `next`, `results`) | Verificar keys en response.data |

Todos los tests usan `@pytest.mark.django_db`, `APIClient` de DRF, y las fixtures de `conftest.py` (`admin_client`, `monitor_client`, `tenant`, `tenant_b`, `seeded_roles`).

## Migration / Rollout

No migration required. El modelo `AuditEvent` y su migración `0001_initial` ya existen. Todos los cambios son aditivos:
- Nuevos archivos en `apps/audit/` no afectan el modelo.
- El retrofit de `quality/views.py` es aditivo (añade llamadas, no modifica lógica existente).
- El frontend añade rutas nuevas sin modificar rutas existentes.

## Open Questions

- [x] ¿Debe `AuditListView` ser accesible también para `global_admin` de un tenant diferente (superadmin cross-tenant)?  
  **Decision**: No. La vista siempre filtra por `membership.tenant` — el `global_admin` consulta únicamente los eventos de su propio tenant (mismo comportamiento que todas las demás vistas). El querying cross-tenant queda diferido a un futuro panel de administración global.

- [x] ¿El campo `actor_email` es suficiente o se necesita `actor_username` también en el serializer?  
  **Decision**: Se añade `actor_username` a `AuditEventSerializer`. El modelo tiene FK a `User` y el campo se expone sin migración adicional.
