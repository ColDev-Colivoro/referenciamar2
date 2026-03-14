# Proposal: Users, Roles & Permissions — ColdevConAC

## Intent

El backend ya tiene los modelos `Role` y `UserMembership`, los endpoints CRUD y los serializers.
El frontend tiene `lib/users/api.ts`, `lib/users/types.ts` y el componente `UserManagement`.

**El problema**: ninguna de las piezas está conectada de forma verificable ni operativa:

1. **Sin roles en base de datos** — `Role` table está vacía. Sin seed, cualquier creación de usuario falla en `validate_role_id`.
2. **Sin endpoint DELETE / deactivate** — solo existe PATCH `is_active=false`, pero sin ruta explícita de baja.
3. **Frontend sin hook** — `user-management.tsx` llama la API directamente sin estado centralizado ni manejo de errores consistente.
4. **Frontend con lógica duplicada** — `user-management.tsx` tiene `roleLabels` y `roleBadgeStyles` hardcodeados; ya existe `lib/auth/roles.ts` con esa lógica.
5. **Sin tests** — los endpoints de usuarios no tienen cobertura pytest.
6. **`membership_can_manage_users` incompleto** — solo chequea `role.code`, no el array `permissions`.

Este change cierra esas brechas y deja el módulo de usuarios/roles **operativo y verificable**.

---

## Scope

### In Scope

- Management command `seed_roles` — crea los 6 roles canónicos con sus permisos en la DB
- Endpoint `DELETE /api/v1/users/{id}/` — baja lógica (sets `is_active=False`) con audit log
- Endpoint `GET /api/v1/users/{id}/` — detalle de una membresía
- `services.py` — ampliar `membership_can_manage_users` para considerar también `permissions` array
- `useUsers()` hook en frontend — estado centralizado para la lista de usuarios + CRUD
- `user-management.tsx` — refactorizar para usar `useUsers()` y `getRolePresentation()` de `lib/auth/roles.ts` (eliminar duplicados)
- Tests pytest — cobertura de los endpoints `GET /users/`, `POST /users/`, `PATCH /users/{id}/`, `DELETE /users/{id}/`, `GET /users/roles/`

### Out of Scope

- Cambio del modelo `User` (custom user model — futuro)
- Gestión de contraseña del propio usuario (`/me/password`)
- Invitaciones por email
- Roles dinámicos creables por tenant (los roles son globales por ahora)
- Permisos granulares por objeto (row-level security)
- UI de administración de roles (solo lectura de roles existentes)
- Paginación de la lista de usuarios (MVP)

---

## Approach

### Backend
1. **Seed**: `management/commands/seed_roles.py` — idempotente, crea/actualiza los 6 roles con sus `permissions` array canónico.
2. **Nuevo endpoint DELETE**: `UserMembershipDetailView.delete()` — soft-delete (`is_active=False`) + audit log.
3. **Nuevo endpoint GET detail**: `UserMembershipDetailView.get()` — retorna una membresía por ID.
4. **`membership_can_manage_users`**: ampliar para chequear también `permissions` del rol, no solo `code`.

### Frontend
5. **`useUsers()` hook**: `frontend/hooks/use-users.ts` — encapsula `listUsers()`, `listRoles()`, `createUser()`, `updateMembership()` con estado `loading/error`.
6. **`user-management.tsx` refactor**: eliminar `roleLabels` y `roleBadgeStyles` hardcodeados; usar `getRolePresentation()` de `lib/auth/roles.ts`; consumir `useUsers()`.

### Tests
7. **`backend/tests/test_users.py`**: 7 tests cubriendo list, create (valid/invalid), detail, patch, delete, roles endpoint.

---

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `backend/apps/users/management/commands/seed_roles.py` | New | Management command idempotente — seed de 6 roles canónicos |
| `backend/apps/users/views.py` | Modified | Agregar `get()` y `delete()` a `UserMembershipDetailView` |
| `backend/apps/users/services.py` | Modified | Ampliar `membership_can_manage_users` con permissions check |
| `backend/tests/test_users.py` | New | 7 tests pytest para endpoints de usuarios |
| `frontend/hooks/use-users.ts` | New | Hook React para estado CRUD de usuarios |
| `frontend/components/manager/user-management.tsx` | Modified | Usar `useUsers()` y `getRolePresentation()`, eliminar duplicados |

---

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| `seed_roles` sobrescribe permisos personalizados en producción | Low | El comando es idempotente con `update_or_create`; producción aún no tiene datos reales |
| Soft-delete marca `is_active=False` pero no revoca token activo del usuario | Low | El token se valida contra `is_active` en `get_request_membership` — ya filtra membresías inactivas |
| Refactor de `user-management.tsx` rompe comportamiento UI | Low | El componente usa la misma API; solo cambia el origen del estado y los labels |
| Tests requieren roles en DB (seed) | Low | `conftest.py` crea roles vía fixtures, no depende del seed command |

---

## Rollback Plan

1. Revertir cambios en `views.py` y `services.py`
2. Eliminar `seed_roles.py`
3. Eliminar `use-users.ts`
4. Revertir `user-management.tsx` con `git checkout`
5. No hay migraciones nuevas — sin impacto en schema

---

## Dependencies

- `auth-drf-token` — **completado** ✅ (token auth operativo, `get_request_membership` usa tenant context)
- PostgreSQL activo (para smoke test manual y ejecución de `seed_roles`)

---

## Success Criteria

- [ ] `python manage.py seed_roles` crea los 6 roles sin error; segunda ejecución es idempotente
- [ ] `GET /api/v1/users/` con token de `tenant_admin` → 200 con lista de membresías del tenant
- [ ] `POST /api/v1/users/` con datos válidos → 201, usuario creado en DB con membresía activa
- [ ] `GET /api/v1/users/{id}/` → 200 con detalle de membresía
- [ ] `PATCH /api/v1/users/{id}/` → 200, rol o estado actualizados
- [ ] `DELETE /api/v1/users/{id}/` → 204, membresía marcada `is_active=False`
- [ ] `GET /api/v1/users/` con token de `monitor` → 403
- [ ] `GET /api/v1/users/roles/` con token válido → 200 con lista de roles
- [ ] Tests pytest: 7/7 passed
- [ ] Frontend `UserManagement` carga y muestra usuarios reales del backend (smoke test)
- [ ] No hay `roleLabels` ni `roleBadgeStyles` duplicados en `user-management.tsx`
