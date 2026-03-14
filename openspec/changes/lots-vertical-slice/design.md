# Design: Lots Vertical Slice

## Technical Approach

The `Lot` model replaces `QualityPlaceholder` in `apps.quality` — no new app is created, since the domain belongs to quality control and the app already exists in `INSTALLED_APPS`. Backend endpoints follow the project's established `APIView` style (not `ModelViewSet`) with explicit URL patterns, tenant scoping enforced via `get_request_membership`, and role-based write guards mirroring `users` views. A dedicated `LotStatusView` handles status transitions as a separate endpoint rather than a router action, keeping the pattern consistent with the rest of the codebase. The frontend follows the exact `useUsers()` hook pattern — `useState + useCallback + useEffect + useMemo` — with a thin `lib/lots/api.ts` layer that calls `apiRequest`.

---

## Architecture Decisions

### Decision: Lot model location

**Choice**: Add `Lot` to the existing `apps.quality` app.  
**Alternatives considered**: Create a new `apps.lots` app.  
**Rationale**: `apps.quality` is already registered in `INSTALLED_APPS`, already has a migration chain, and the `Lot` domain is the core entity of quality control. A new app would add structural overhead with no isolation benefit at this stage.

---

### Decision: API style — APIView vs ModelViewSet

**Choice**: `APIView` with explicit URL patterns (`LotListCreateView`, `LotDetailView`, `LotStatusView`).  
**Alternatives considered**: `ModelViewSet` with a DRF router (as referenced in the proposal).  
**Rationale**: Every existing endpoint (`UserListCreateView`, `UserMembershipDetailView`, `RoleListView`) uses `APIView`. Switching to `ModelViewSet` for this domain alone would introduce an inconsistency. `APIView` also makes the tenant-scoping guard and role check explicit and easy to audit per-method.

---

### Decision: Tenant scoping

**Choice**: All queryset access goes through `get_request_membership(request)` → `membership.tenant`, then `Lot.objects.filter(tenant=membership.tenant)`.  
**Alternatives considered**: Middleware-injected `request.tenant` used directly.  
**Rationale**: `get_request_membership` already validates that the user has an **active** membership in that tenant — not just that the request carries the tenant header. This prevents deactivated members from reading data. It also mirrors the guard pattern in all users views.

---

### Decision: Status transitions validation location

**Choice**: Validated in `LotStatusSerializer.validate_status()`.  
**Alternatives considered**: Service-layer function; view-level if/else.  
**Rationale**: Following the project's existing serializer-level validation pattern (`validate_role_id`, `validate_username` in `users/serializers.py`). Serializer validation keeps the view thin and makes the constraint explicit in the data contract, not scattered in business logic code.

---

### Decision: Lot code uniqueness

**Choice**: `unique_together = ("code", "tenant")` in `Lot.Meta`.  
**Alternatives considered**: Application-level uniqueness check only.  
**Rationale**: DB-level constraint is the authoritative guarantee. Auto-generation logic (`LOT-{year}-{seq:03d}`) runs in `Lot.save()` only when `code` is not provided; if concurrent inserts race, the DB constraint rejects the duplicate and the view returns HTTP 400. No `select_for_update` complexity needed for the MVP.

---

### Decision: Frontend hook pattern

**Choice**: Mirror `useUsers()` exactly — `useState + useCallback + useEffect + useMemo`.  
**Alternatives considered**: React Query / SWR; simpler fetch-in-component.  
**Rationale**: The project has a clear established convention in `use-users.ts`. Consistency reduces cognitive load. If a data-fetching library is adopted in the future, both hooks can be migrated together.

---

### Decision: DB routing for `quality.Lot`

**Choice**: `Lot` lives in the **global** `default` database with a `tenant` FK (shared-DB multi-tenancy). No entry needed in `TENANT_SCOPED_MODEL_LABELS`.  
**Alternatives considered**: Adding `quality.lot` to `TENANT_SCOPED_MODEL_LABELS` for per-tenant DB routing.  
**Rationale**: `QualityPlaceholder` (the model being replaced) already uses the default DB with a `tenant` FK. The `db_router.py` does not list `quality.*` in its scoped labels. The `allow_migrate` returns `None` for `quality` models, letting them run on `default`. Changing to per-tenant routing would require env var changes and is out of scope for this slice.

---

## Data Flow

### Create Lot

```
Browser
  │  POST /api/v1/lots/  { species, origin, entry_date, quantity_kg }
  ▼
Next.js Page (lots/page.tsx)
  │  createLot(input)  ← useLots() hook
  ▼
frontend/lib/lots/api.ts  →  apiRequest("POST /api/v1/lots/")
  │
  ▼  (HTTP + Authorization: Token <token>)
Django APIView: LotListCreateView.post()
  │  1. get_request_membership(request) → membership (or 403)
  │  2. lot_can_write(membership) check (or 403)
  │  3. LotCreateSerializer(data, context={tenant, user}).is_valid()
  │     └─ validate_code(): uniqueness cross-tenant check
  │  4. serializer.save()  →  Lot.save()
  │     └─ auto-generate code if blank: LOT-{year}-{seq:03d}
  │  5. log_audit_event("lots.create", ...)
  ▼
PostgreSQL (default DB)  →  INSERT INTO quality_lot
  │
  ▼  HTTP 201 { id, code, species, ... }
useLots() hook: setLots(prev => [newLot, ...prev])
  ▼
Page re-renders with new lot in table
```

### List Lots

```
Browser  →  GET /dashboard/lots/
  │
  ▼
lots/page.tsx  mounts  →  useLots()
  │  useEffect → refresh()
  │  setIsLoading(true)
  ▼
apiRequest("GET /api/v1/lots/")
  │
  ▼  HTTP + Token
LotListCreateView.get()
  │  1. get_request_membership(request) → membership (or 403)
  │  2. Lot.objects.filter(tenant=membership.tenant)
  │     .select_related("created_by")
  │     .order_by("-entry_date")
  │  3. LotSerializer(qs, many=True).data
  ▼
HTTP 200  [{ id, code, species, status, ... }, ...]
  │
  ▼
setLots(data), setIsLoading(false)
  │
  ▼
Table renders rows; LotStatusBadge renders per status
```

---

## File Changes

| File | Action | Description | Status |
|------|--------|-------------|--------|
| `backend/apps/quality/models.py` | Modify | Replace `QualityPlaceholder` with `Lot` model; all domain fields + `unique_together` + `save()` code gen | ✅ Implemented |
| `backend/apps/quality/migrations/0002_add_lot.py` | Create | Migration: delete `QualityPlaceholder`, create `Lot` table | ✅ Implemented |
| `backend/apps/quality/serializers.py` | Create | `LotSerializer`, `LotCreateSerializer`, `LotStatusSerializer` | ✅ Implemented |
| `backend/apps/quality/views.py` | Create | `LotListCreateView`, `LotDetailView`, `LotStatusView` with tenant+role guards | ✅ Implemented |
| `backend/apps/quality/permissions.py` | Create | `lot_can_write(membership)` helper; `LOT_WRITE_ROLES` constant | ✅ Implemented |
| `backend/apps/quality/urls.py` | Create | URL patterns wiring the three views | ✅ Implemented |
| `backend/config/urls.py` | Modify | Add `path("api/v1/lots/", include("apps.quality.urls"))` | ✅ Implemented |
| `frontend/lib/lots/types.ts` | Create | `LotStatus`, `Lot`, `CreateLotInput`, `UpdateLotInput` TypeScript types | ✅ Implemented |
| `frontend/lib/lots/api.ts` | Create | `listLots`, `createLot`, `updateLot`, `changeLotStatus` using `apiRequest` | ✅ Implemented |
| `frontend/hooks/use-lots.ts` | Create | `useLots()` hook — state + callbacks + memoized return | ✅ Implemented |
| `frontend/app/dashboard/lots/page.tsx` | Create | Dashboard lots page; renders table + "Nuevo Lote" dialog | ✅ Implemented |
| `frontend/components/quality-manager/lot-management.tsx` | Modify | Refactor: accept `useLots()` return instead of mock data | ✅ Implemented |
| `frontend/components/lots/lot-form.tsx` | Create | Shadcn Dialog form for lot creation | ✅ Implemented |
| `frontend/components/lots/lot-status-badge.tsx` | Create | Status badge with 4 states and semantic colors | ✅ Implemented |

---

## Interfaces / Contracts

### Python

#### `Lot` model fields

```python
class Lot(models.Model):
    class Status(models.TextChoices):
        PENDING    = "pending",    "Pendiente"
        IN_PROCESS = "in_process", "En proceso"
        APPROVED   = "approved",   "Aprobado"
        REJECTED   = "rejected",   "Rechazado"

    code         : CharField(max_length=30, blank=True)          # auto-gen if blank
    species      : CharField(max_length=100)
    origin       : CharField(max_length=150)
    entry_date   : DateField()
    status       : CharField(choices=Status, default=Status.PENDING, max_length=20)
    quantity_kg  : DecimalField(max_digits=10, decimal_places=2)
    tenant       : ForeignKey(TenantRegistry, on_delete=CASCADE)
    created_by   : ForeignKey(settings.AUTH_USER_MODEL, on_delete=SET_NULL, null=True)
    created_at   : DateTimeField(auto_now_add=True)
    updated_at   : DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("code", "tenant")
        ordering = ["-entry_date"]
```

#### `LotSerializer` (read)

```python
class LotSerializer(serializers.ModelSerializer):
    created_by_username: SerializerMethodField  # read-only

    class Meta:
        model = Lot
        fields = [
            "id", "code", "species", "origin", "entry_date",
            "status", "quantity_kg", "created_by_username",
            "created_at", "updated_at",
        ]
```

#### `LotCreateSerializer` (write)

```python
class LotCreateSerializer(serializers.Serializer):
    code         : CharField(required=False, allow_blank=True, max_length=30)
    species      : CharField(max_length=100)
    origin       : CharField(max_length=150)
    entry_date   : DateField()
    quantity_kg  : DecimalField(max_digits=10, decimal_places=2)

    def validate_code(self, value: str) -> str:
        # If provided, check unique_together against context["tenant"]
        tenant = self.context["tenant"]
        if value and Lot.objects.filter(code=value, tenant=tenant).exists():
            raise serializers.ValidationError("Este código ya existe para el tenant.")
        return value

    def create(self, validated_data) -> Lot:
        # saves with tenant + created_by from context
```

#### `LotStatusSerializer`

```python
ALLOWED_TRANSITIONS = {
    "pending":    {"in_process", "rejected"},
    "in_process": {"approved", "rejected"},
    "approved":   set(),   # terminal
    "rejected":   set(),   # terminal
}

class LotStatusSerializer(serializers.Serializer):
    status: ChoiceField(choices=Lot.Status.choices)

    def validate_status(self, value: str) -> str:
        current = self.context["lot"].status
        if value not in ALLOWED_TRANSITIONS.get(current, set()):
            raise serializers.ValidationError(
                f"Transición no permitida: {current} → {value}"
            )
        return value
```

---

### TypeScript

#### `LotStatus` type union

```typescript
export type LotStatus = "pending" | "in_process" | "approved" | "rejected"
```

#### `Lot` interface

```typescript
export interface Lot {
  id: number
  code: string
  species: string
  origin: string
  entry_date: string        // ISO date "YYYY-MM-DD"
  status: LotStatus
  quantity_kg: string       // DRF DecimalField serializes as string
  created_by_username: string | null
  created_at: string
  updated_at: string
}
```

#### `CreateLotInput` interface

```typescript
export interface CreateLotInput {
  code?: string
  species: string
  origin: string
  entry_date: string
  quantity_kg: number
}
```

#### `UpdateLotInput` interface

```typescript
export interface UpdateLotInput {
  species?: string
  origin?: string
  entry_date?: string
  quantity_kg?: number
}
```

#### `useLots()` return type

```typescript
interface UseLotsReturn {
  lots: Lot[]
  isLoading: boolean
  error: string
  refresh: () => Promise<void>
  createLot: (input: CreateLotInput) => Promise<Lot>
  updateLot: (id: number, input: UpdateLotInput) => Promise<Lot>
  changeLotStatus: (id: number, status: LotStatus) => Promise<Lot>
}
```

---

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit (Python) | `LotCreateSerializer.validate_code()` duplicate detection | `pytest` with `Lot` factory; assert `ValidationError` on duplicate |
| Unit (Python) | `LotStatusSerializer.validate_status()` all allowed + blocked transitions | Parametrized test for each `(current, next)` pair |
| Unit (Python) | `Lot.save()` code auto-generation format `LOT-{year}-{seq}` | Create lot without code; assert pattern match |
| Unit (Python) | `lot_can_write(membership)` role guard | Pass memberships with each role; assert True/False |
| Integration (Python) | `GET /api/v1/lots/` tenant isolation | Create lots for tenant A and B; assert tenant A token sees only tenant A lots |
| Integration (Python) | `POST /api/v1/lots/` creates lot + returns 201 | Authenticated request with valid payload |
| Integration (Python) | `POST /api/v1/lots/{id}/status/` valid + invalid transitions | Assert 200 on valid, 400 on blocked transition |
| Integration (Python) | Unauthenticated request returns 401 | No token on `GET /api/v1/lots/` |
| Unit (TS) | `useLots()` sets lots on mount | `@testing-library/react` renderHook; mock `apiRequest` |
| Unit (TS) | `LotStatusBadge` renders correct color per status | Snapshot or class assertion for each 4 statuses |
| E2E | Create lot flow browser → DB | Playwright: fill form → submit → assert row in table |

> Note: automated tests are addressed in a separate change per the proposal's Out of Scope. This table defines the strategy for that future change.

---

## Migration / Rollout

Migration `0002_add_lot.py` must:
1. `DeleteModel("QualityPlaceholder")` (no production data; placeholder only)
2. `CreateModel("Lot")` with all fields and `unique_together`

Rollback: `python manage.py migrate quality 0001` restores `QualityPlaceholder`.

No feature flags required — the `/api/v1/lots/` URL prefix is new, existing endpoints are unaffected.

---

## Open Questions

- [x] **`TENANT_SCOPED_MODEL_LABELS` env var**: ✅ **Resolved** — Confirmed shared-DB (`default`) architecture. `quality.lot` is **not** added to `TENANT_SCOPED_MODEL_LABELS`. `Lot` uses a `tenant` FK on the global DB, identical to the `QualityPlaceholder` it replaced. No custom DB router needed.
- [x] **`AuthContext` readiness**: ✅ **Resolved** — Used `getToken()` from `lib/auth/token.ts` as an interim solution inside `useLots()`. This avoids a hard dependency on a potentially incomplete `AuthContext` while keeping the hook functional. Migration to `AuthContext` can be done in a follow-up change.
- [x] **Lot code sequence scope**: ✅ **Resolved** — Accepted `Lot.objects.filter(tenant=self.tenant, entry_date__year=year).count() + 1` as the MVP counter strategy (minor race risk). The `unique_together = ("code", "tenant")` DB constraint acts as the safety net: concurrent inserts that produce the same code will result in an `IntegrityError`, which the view catches and returns as HTTP 400. A dedicated sequence table is deferred to a future change.
