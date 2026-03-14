# Design: Users, Roles & Permissions — ColdevConAC

## Technical Approach

The backend models (`Role`, `UserMembership`) and serializers are already complete and correct — no schema migrations are needed. The work closes six operational gaps: (1) a `seed_roles` management command populates the empty `Role` table idempotently; (2) `UserMembershipDetailView` gains `get()` and `delete()` methods to satisfy the GET-detail and soft-delete requirements; (3) `membership_can_manage_users` is extended to check the role's `permissions` array in addition to `role.code`; (4) a new `useUsers()` React hook centralises all user/role API state for the frontend; (5) `user-management.tsx` is refactored to consume `useUsers()` and `getRolePresentation()`, eliminating the duplicated `roleLabels`/`roleBadgeStyles` maps; (6) `backend/tests/test_users.py` provides pytest coverage for all five user endpoints. The frontend already calls the correct API functions in `lib/users/api.ts` — the hook wraps those functions without replacing them.

---

## Architecture Decisions

### Decision: `seed_roles` — management command vs fixture vs migration

**Choice**: Django management command (`backend/apps/users/management/commands/seed_roles.py`)  
**Alternatives considered**: (a) data migration inside `0002_seed_roles.py`; (b) JSON fixture loaded with `loaddata`  
**Rationale**: A management command is idempotent by design (`update_or_create`), can be re-run in production without touching the migration history, and does not block `migrate --run-syncdb` on CI. Fixtures lack idempotency guarantees and couple seed data to a specific Django serialisation format. A data migration cannot be safely re-run after deployment.

---

### Decision: DELETE endpoint — soft-delete vs hard-delete

**Choice**: Soft-delete — `DELETE /api/v1/users/{id}/` sets `is_active=False` and returns HTTP 204. The underlying Django `User` record is preserved.  
**Alternatives considered**: Hard-delete of `UserMembership`; hard-delete of both `User` and `UserMembership`  
**Rationale**: Spec explicitly requires the Django `User` to survive (re-activation path, audit trail). `get_request_membership` already filters `is_active=True`, so a deactivated membership immediately blocks access with no additional middleware. PATCH `is_active=False` remains valid; DELETE is a semantic convenience that also logs `users.deactivate` audit event (distinct from `users.update_membership`).

---

### Decision: `membership_can_manage_users` — role.code OR permissions array

**Choice**: OR-logic: allow if `role.code in ADMIN_ROLE_CODES` **or** if any element of `role.permissions` is in `MANAGE_USER_PERMISSIONS`.  
**Alternatives considered**: AND-logic (both must match); permissions-only check (drop code shortcut)  
**Rationale**: Spec requirement "User Management Authorization" explicitly states both conditions as OR. The existing `MANAGE_USER_PERMISSIONS` set already lives in `lib/auth/roles.ts` on the frontend; mirroring it as a constant on the backend keeps the two authorisation layers consistent. The `role` is already eagerly loaded via `select_related("role")` in `get_request_membership`, so no extra query is needed.

---

### Decision: `useUsers()` hook — internal state shape

**Choice**: Single `useState` per concern: `users: UserMembership[]`, `roles: Role[]`, `isLoading: boolean`, `error: string`. Mutations (`createUser`, `updateMembership`, `deactivateUser`) update local state optimistically-on-success (append / replace / filter). No external state manager (no Zustand, no Context).  
**Alternatives considered**: Single composite state object; React Query / SWR  
**Rationale**: The existing codebase (`user-management.tsx`) already uses raw `useState` — the hook is a direct extraction of that pattern without introducing new dependencies. The component is the only consumer of user state; a shared store is unnecessary. The hook's interface is dictated by the frontend spec (`useUsers` requirement).

---

### Decision: `user-management.tsx` refactor — eliminating duplicate labels

**Choice**: Delete `roleBadgeStyles` and `roleLabels` constants; replace `getRoleBadge(role)` with a call to `getRolePresentation(role.code)` from `lib/auth/roles.ts`. The component imports `getRolePresentation` and calls it inline.  
**Alternatives considered**: Keep local maps but import values from `roles.ts`; move presentation into a shared `RoleBadge` component  
**Rationale**: `getRolePresentation` already returns `{ label, color }` with the exact same values. A shared `RoleBadge` component is out of scope (no other consumer exists). Direct import is the minimal change and directly satisfies the spec requirement "Role Presentation Without Duplication".

---

## Data Flow

### Create User (backend)

```
POST /api/v1/users/
        │
        ▼
UserListCreateView.post()
        │
        ├─► get_request_membership(request)
        │       └─► resolve_tenant(request)  [HTTP_X_TENANT_SLUG header]
        │       └─► UserMembership.objects.filter(user, tenant, is_active=True)
        │
        ├─► membership_can_manage_users(membership)
        │       ├─► role.code in ADMIN_ROLE_CODES  → allow
        │       └─► role.permissions ∩ MANAGE_USER_PERMISSIONS → allow / 403
        │
        ├─► UserCreateSerializer.is_valid()
        │       ├─► validate_username  → 400 if duplicate
        │       └─► validate_role_id   → 400 if not found
        │
        ├─► UserCreateSerializer.save()  [atomic: User.create + Membership.create]
        │
        ├─► log_audit_event("users.create", tenant, actor, metadata)
        │
        └─► 201 UserMembershipSerializer(new_membership)
```

### Deactivate User (backend)

```
DELETE /api/v1/users/{membership_id}/
        │
        ▼
UserMembershipDetailView.delete()
        │
        ├─► get_request_membership(request)   [same as above]
        │
        ├─► membership_can_manage_users(membership)  → 403 if denied
        │
        ├─► UserMembership.objects.filter(id=membership_id, tenant=membership.tenant)
        │       └─► None → 404
        │
        ├─► target.is_active = False
        │   target.save(update_fields=["is_active", "updated_at"])
        │
        ├─► log_audit_event("users.deactivate", tenant, actor, metadata)
        │
        └─► 204 No Content
```

---

## File Changes

| File | Action | Description | Status |
|------|--------|-------------|--------|
| `backend/apps/users/management/__init__.py` | Create | Empty package init | ✅ |
| `backend/apps/users/management/commands/__init__.py` | Create | Empty package init | ✅ |
| `backend/apps/users/management/commands/seed_roles.py` | Create | Idempotent management command — creates/updates 6 canonical roles | ✅ |
| `backend/apps/users/views.py` | Modify | Add `get()` and `delete()` methods to `UserMembershipDetailView` | ✅ |
| `backend/apps/users/services.py` | Modify | Extend `membership_can_manage_users` to check `role.permissions` array | ✅ |
| `backend/tests/test_users.py` | Create | 7 pytest tests covering all user endpoints | ✅ |
| `frontend/lib/users/api.ts` | Modify | Add `deactivateUser(membershipId)` function | ✅ |
| `frontend/hooks/use-users.ts` | Create | `useUsers()` hook — centralised state for users/roles CRUD | ✅ |
| `frontend/components/manager/user-management.tsx` | Modify | Remove `roleBadgeStyles`/`roleLabels`; use `useUsers()` and `getRolePresentation()` | ✅ |

---

## Interfaces / Contracts

### `seed_roles` management command skeleton

```python
# backend/apps/users/management/commands/seed_roles.py

from django.core.management.base import BaseCommand

CANONICAL_ROLES: list[dict] = [
    {"code": "global_admin",          "name": "Administrador Global",   "permissions": [...]},
    {"code": "tenant_admin",          "name": "Administrador Tenant",   "permissions": [...]},
    {"code": "manager",               "name": "Gerente",                "permissions": [...]},
    {"code": "quality_manager",       "name": "Jefe de Calidad",        "permissions": [...]},
    {"code": "monitor",               "name": "Monitor",                "permissions": [...]},
    {"code": "production_supervisor", "name": "Jefe de Planta",         "permissions": [...]},
]

class Command(BaseCommand):
    help = "Seed canonical roles (idempotent)"

    def handle(self, *args, **options) -> None:
        # for role_def in CANONICAL_ROLES:
        #     Role.objects.update_or_create(code=role_def["code"], defaults={...})
        ...
```

---

### `UserMembershipDetailView.get()` and `.delete()`

```python
# backend/apps/users/views.py — additions to UserMembershipDetailView

def get(self, request, membership_id: int) -> Response:
    """
    Returns HTTP 200 with UserMembershipSerializer data,
    or HTTP 403 if caller cannot manage users,
    or HTTP 404 if membership_id not in caller's tenant.
    """
    ...

def delete(self, request, membership_id: int) -> Response:
    """
    Soft-deletes target membership (is_active=False).
    Logs audit event "users.deactivate".
    Returns HTTP 204 on success,
    HTTP 403 if caller cannot manage users,
    HTTP 404 if membership_id not in caller's tenant.
    """
    ...
```

---

### `membership_can_manage_users()` updated signature

```python
# backend/apps/users/services.py

ADMIN_ROLE_CODES = {"global_admin", "tenant_admin"}
MANAGE_USER_PERMISSIONS = {"users.manage", "users.write", "users.admin", "tenant.users.manage"}

def membership_can_manage_users(membership: UserMembership | None) -> bool:
    """
    Returns True if membership grants user-management authority.
    Checks role.code in ADMIN_ROLE_CODES OR any permission
    in role.permissions intersects MANAGE_USER_PERMISSIONS.
    """
    ...
```

---

### `deactivateUser` addition to `frontend/lib/users/api.ts`

```typescript
// frontend/lib/users/api.ts — new export

export function deactivateUser(membershipId: number): Promise<void>
```

---

### `useUsers()` hook interface

```typescript
// frontend/hooks/use-users.ts

import type { CreateUserInput, UpdateMembershipInput, UserMembership, Role } from "@/lib/users/types"

interface UseUsersState {
  users: UserMembership[]
  roles: Role[]
  isLoading: boolean
  error: string
}

interface UseUsersReturn extends UseUsersState {
  refresh: () => Promise<void>
  createUser: (input: CreateUserInput) => Promise<void>
  updateMembership: (membershipId: number, input: UpdateMembershipInput) => Promise<void>
  deactivateUser: (membershipId: number) => Promise<void>
}

export function useUsers(): UseUsersReturn
```

---

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit (pytest) | `membership_can_manage_users` — code-only, permission-only, none | Direct function call, no DB |
| Integration (pytest) | `GET /api/v1/users/` — 200 with list, 403 for monitor, 401 unauthenticated | `APIClient` + `authenticated_client` fixture; `admin_role` fixture with `tenant_admin` code |
| Integration (pytest) | `POST /api/v1/users/` — 201 valid, 400 duplicate username, 400 invalid role_id | `APIClient` + `authenticated_client` fixture |
| Integration (pytest) | `GET /api/v1/users/{id}/` — 200 own tenant, 404 cross-tenant | `membership_b` fixture for cross-tenant case |
| Integration (pytest) | `PATCH /api/v1/users/{id}/` — 200 role update, 400 invalid role, 404 cross-tenant | `UserMembershipUpdateSerializer` path |
| Integration (pytest) | `DELETE /api/v1/users/{id}/` — 204 soft-delete, 404 cross-tenant, DB `is_active=False` | Assert `UserMembership.objects.get(id=...).is_active == False` |
| Integration (pytest) | `GET /api/v1/users/roles/` — 200 list, 401 unauthenticated | Verify all 6 fields present |
| Frontend (manual smoke) | `UserManagement` loads users, creates user, role badge uses `getRolePresentation` | Run `next dev`, verify no `roleLabels` in source |

Fixtures used from `conftest.py`: `api_client`, `tenant`, `tenant_b`, `role`, `user`, `user_b`, `membership`, `membership_b`, `auth_token`, `authenticated_client`. Tests will add an `admin_role` fixture (`code="tenant_admin"`, `permissions=["users.manage"]`) and an `admin_membership` fixture locally in `test_users.py`.

---

## Migration / Rollout

No new database migrations are needed — `Role` and `UserMembership` tables already exist from `0001_initial.py`. The `seed_roles` management command must be executed once in each environment after deployment:

```
python manage.py seed_roles
```

No feature flags required. The new `DELETE` endpoint and updated `membership_can_manage_users` are fully backward-compatible with existing callers.

---

## Open Questions

- [ ] What permissions array should each canonical role carry? The proposal lists the 6 roles but does not enumerate their exact `permissions` strings. The `seed_roles` command needs this list before implementation. Proposed default: `global_admin` and `tenant_admin` get `["users.manage", "users.write", "users.admin", "tenant.users.manage"]`; `manager` gets `["users.write"]`; `quality_manager`, `monitor`, `production_supervisor` get `[]`.
- [ ] Should `DELETE /api/v1/users/{id}/` also be accessible via `PATCH is_active=false`? Currently PATCH already covers this. Design keeps both; DELETE is additive.
