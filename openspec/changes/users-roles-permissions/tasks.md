# Tasks: Users, Roles & Permissions — ColdevConAC

## Phase 1: Backend Foundation

- [x] 1.1 Create `backend/apps/users/management/__init__.py` — empty file to make `management/` a Python package. Done when `python -c "import apps.users.management"` raises no error.
- [x] 1.2 Create `backend/apps/users/management/commands/__init__.py` — empty file to make `commands/` a Python package. Done when Django discovers the command directory.
- [x] 1.3 Create `backend/apps/users/management/commands/seed_roles.py` — implement `Command.handle()` with `CANONICAL_ROLES` list (6 roles: `global_admin`, `tenant_admin`, `manager`, `quality_manager`, `monitor`, `production_supervisor`) using `Role.objects.update_or_create(code=..., defaults={...})`. Done when `python manage.py seed_roles` exits 0 and all 6 rows exist in `Role`; second run produces no duplicates.
- [x] 1.4 Modify `backend/apps/users/services.py` — add `MANAGE_USER_PERMISSIONS` constant (`{"users.manage", "users.write", "users.admin", "tenant.users.manage"}`), then rewrite `membership_can_manage_users` to return `True` if `role.code in ADMIN_ROLE_CODES` **or** `set(role.permissions) & MANAGE_USER_PERMISSIONS`. Done when a membership with `role.code="manager"` and `permissions=["users.manage"]` returns `True`, and a `monitor` with no permissions returns `False`.

## Phase 2: Backend API Completion

- [x] 2.1 Modify `backend/apps/users/views.py` — add `UserMembershipDetailView.get(self, request, membership_id)`: fetch `UserMembership` filtered by `id=membership_id` and `tenant=membership.tenant`, return 200 with `UserMembershipSerializer` data or 404 if not found, 403 if caller cannot manage users. Done when `GET /api/v1/users/{id}/` returns 200 for own tenant and 404 for a cross-tenant ID.
- [x] 2.2 Modify `backend/apps/users/views.py` — add `UserMembershipDetailView.delete(self, request, membership_id)`: fetch target membership, set `is_active=False`, call `target.save(update_fields=["is_active", "updated_at"])`, log `log_audit_event("users.deactivate", ...)`, return 204. Done when `DELETE /api/v1/users/{id}/` returns 204 and `UserMembership.objects.get(id=id).is_active == False`.
- [x] 2.3 Verify `backend/apps/users/urls.py` — confirm `UserMembershipDetailView` is wired to `<int:membership_id>/` pattern covering GET, PATCH, and DELETE. Done when all three HTTP methods route correctly without a 405.

## Phase 3: Frontend

- [x] 3.1 Modify `frontend/lib/users/api.ts` — add exported function `deactivateUser(membershipId: number): Promise<void>` that calls `DELETE /api/v1/users/{membershipId}/`. Done when the function is exported and TypeScript compilation passes with no errors.
- [x] 3.2 Create `frontend/hooks/use-users.ts` — implement `useUsers()` hook with state `{ users, roles, isLoading, error }` initialized by parallel `listUsers()` + `listRoles()` on mount. Expose `refresh()`, `createUser()`, `updateMembership()`, `deactivateUser()` with optimistic-on-success local state updates (append / replace / filter). Done when hook satisfies the `UseUsersReturn` interface in `design.md` and TypeScript compiles clean.
- [x] 3.3 Modify `frontend/components/manager/user-management.tsx` — replace direct API calls with `useUsers()` hook (remove raw `useState`/`useEffect` managing users and roles). Done when component uses `const { users, roles, isLoading, error, createUser, updateMembership, deactivateUser } = useUsers()`.
- [x] 3.4 Modify `frontend/components/manager/user-management.tsx` — delete `roleBadgeStyles` and `roleLabels` constants; replace `getRoleBadge(role)` with `getRolePresentation(role.code)` imported from `@/lib/auth/roles`. Done when `grep -n "roleLabels\|roleBadgeStyles"` returns no matches in the file.
- [x] 3.5 Modify `frontend/components/manager/user-management.tsx` — populate role `<select>` from `roles` returned by `useUsers()` instead of any hardcoded list. Done when the selector renders one `<option>` per role from the backend.
- [x] 3.6 Modify `frontend/components/manager/user-management.tsx` — add loading indicator while `isLoading` is `true` and error display when `error` is non-empty. Done when the component shows a spinner or skeleton during load and a visible error message on failure.

## Phase 4: Testing

- [x] 4.1 Create `backend/tests/test_users.py` — add local fixtures `admin_role` (code=`"tenant_admin"`, permissions=`["users.manage"]`) and `admin_membership` (user + tenant + admin_role). These fixtures must NOT conflict with the `role` fixture in `conftest.py`.
- [x] 4.2 In `backend/tests/test_users.py` — write test `test_list_users_as_admin`: `GET /api/v1/users/` with `authenticated_client` using admin_membership returns 200 and a non-empty list.
- [x] 4.3 In `backend/tests/test_users.py` — write test `test_list_users_forbidden_for_monitor`: `GET /api/v1/users/` with a `monitor` membership returns 403.
- [x] 4.4 In `backend/tests/test_users.py` — write test `test_create_user_valid`: `POST /api/v1/users/` with valid payload returns 201 and the response contains `is_active: true` and an audit event `users.create`.
- [x] 4.5 In `backend/tests/test_users.py` — write test `test_create_user_duplicate_username`: `POST /api/v1/users/` with an already-used `username` returns 400 and no new `UserMembership` is created.
- [x] 4.6 In `backend/tests/test_users.py` — write test `test_get_membership_detail_own_tenant`: `GET /api/v1/users/{membership.id}/` returns 200 with correct `id` in response.
- [x] 4.7 In `backend/tests/test_users.py` — write test `test_get_membership_detail_cross_tenant_returns_404`: `GET /api/v1/users/{membership_b.id}/` from tenant A context returns 404.
- [x] 4.8 In `backend/tests/test_users.py` — write test `test_delete_membership_soft_deletes`: `DELETE /api/v1/users/{membership.id}/` returns 204, `UserMembership.objects.get(id=...).is_active == False`, and the underlying `User` record still exists.
- [x] 4.9 In `backend/tests/test_users.py` — write test `test_list_roles_authenticated`: `GET /api/v1/users/roles/` with valid token returns 200 with a list where each item has `id`, `code`, `name`, `permissions` fields.
- [x] 4.10 In `backend/tests/test_users.py` — write test `test_membership_can_manage_users_via_permissions`: directly call `membership_can_manage_users` with a membership whose `role.code` is NOT in `ADMIN_ROLE_CODES` but `role.permissions = ["users.manage"]` — assert it returns `True`.

## Phase 5: Cleanup & Verification

- [ ] 5.1 Run `python manage.py seed_roles` in dev environment — verify output lists all 6 roles created/updated; run again and verify "already exists / updated" idempotency. Done when two consecutive runs exit 0 with no duplicate-key errors.
- [ ] 5.2 Run `pytest backend/tests/test_users.py -v` — all 10 tests must pass. Done when output shows `10 passed, 0 failed`.
- [ ] 5.3 Frontend smoke test: run `next dev`, navigate to user management page — verify users load, role badges display labels from `getRolePresentation`, create-user form populates roles from backend. Done when no `roleLabels`/`roleBadgeStyles` references remain and the UI works end-to-end.
- [ ] 5.4 Verify `backend/apps/users/services.py` has no leftover stubs — `MANAGE_USER_PERMISSIONS` is defined, `membership_can_manage_users` has OR-logic, no dead code from old implementation.
- [ ] 5.5 Update `openspec/changes/users-roles-permissions/design.md` — resolve Open Question about canonical role permissions array by documenting the final `permissions` values used in `seed_roles.py`.
