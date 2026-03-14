# Tasks: Auth DRF Token — ColdevConAC

## Phase 1: Foundation / Infrastructure

- [x] 1.1 `backend/config/settings/base.py` — Add `"rest_framework.authtoken"` to `INSTALLED_APPS` (after `"rest_framework"`)
- [x] 1.2 `backend/config/settings/base.py` — Update `REST_FRAMEWORK["DEFAULT_AUTHENTICATION_CLASSES"]`: insert `"rest_framework.authentication.TokenAuthentication"` as first item, keep `SessionAuthentication` second, remove `BasicAuthentication`
- [ ] 1.3 Run `python manage.py migrate` to create the `authtoken_token` table (verifiable: table exists in DB, no migration errors) ⚠️ PENDIENTE — requiere PostgreSQL activo
- [x] 1.4 `frontend/lib/auth/token.ts` — Create new file with `getToken()`, `setToken(token: string)`, `clearToken()` using `localStorage` key `"coldevconac_token"`. Guard for SSR: `if (typeof window === "undefined") return null`

## Phase 2: Backend Implementation

- [x] 2.1 `backend/apps/authentication/views.py` — Add `from rest_framework.authtoken.models import Token` import
- [x] 2.2 `backend/apps/authentication/views.py` — In `LoginView.post()`, after `login(request, user)`: add `token, _ = Token.objects.get_or_create(user=user)`, then include `"accessToken": token.key` in `build_session_payload()` return (wrap response as `payload = build_session_payload(membership); payload["accessToken"] = token.key; return Response(payload)`)
- [x] 2.3 `backend/apps/authentication/views.py` — In `LogoutView.post()`, inside the `if request.user.is_authenticated:` block (before `logout(request)`): add `Token.objects.filter(user=request.user).delete()`
- [x] 2.4 `backend/apps/authentication/views.py` — Update `LogoutView.post()` permission: add `permission_classes = [permissions.IsAuthenticated]` so unauthenticated logout returns 401 (not 204)

## Phase 3: Frontend Implementation

- [x] 3.1 `frontend/lib/api/client.ts` — Import `getToken` from `@/lib/auth/token`; build `authHeader` from token if present; inject `Authorization: \`Token ${token}\`` into the `headers` spread (before `init?.headers` so callers can override)
- [x] 3.2 `frontend/lib/auth/types.ts` — Change `accessToken?: string` to `accessToken: string` (make required on `LoginResponse`)
- [x] 3.3 `frontend/lib/auth/session.ts` — Import `setToken` from `@/lib/auth/token`; after `apiRequest<LoginResponse>` returns in `login()`, call `setToken(response.accessToken)` before returning
- [x] 3.4 `frontend/lib/auth/logout.ts` — Import `clearToken` from `@/lib/auth/token`; after `apiRequest("/api/v1/auth/logout/", ...)` resolves successfully, call `clearToken()`

## Phase 4: Testing

- [x] 4.1 `backend/tests/test_auth_token.py` — Create file. Write `test_login_returns_token`: `POST /api/v1/auth/login/` with valid credentials → assert 200, response contains `"accessToken"`, token exists in `authtoken_token` table
- [x] 4.2 `backend/tests/test_auth_token.py` — Write `test_login_wrong_password_no_token`: `POST /api/v1/auth/login/` with wrong password → assert 400, no token created for that user
- [x] 4.3 `backend/tests/test_auth_token.py` — Write `test_login_user_not_in_tenant`: valid user, wrong tenant → assert 403, no token created
- [x] 4.4 `backend/tests/test_auth_token.py` — Write `test_logout_deletes_token`: create token for user, `POST /api/v1/auth/logout/` with `Authorization: Token <key>` → assert 204, token no longer in DB
- [x] 4.5 `backend/tests/test_auth_token.py` — Write `test_logout_without_auth_returns_401`: `POST /api/v1/auth/logout/` with no credentials → assert 401
- [x] 4.6 `backend/tests/test_auth_token.py` — Write `test_protected_endpoint_without_token_returns_401`: `GET /api/v1/auth/me/` with no credentials → assert 401
- [x] 4.7 `backend/tests/test_auth_token.py` — Write `test_protected_endpoint_with_valid_token_returns_200`: `GET /api/v1/auth/me/` with `Authorization: Token <key>` → assert 200, response contains `user` and `tenant`
- [x] 4.8 `backend/tests/test_auth_token.py` — Write `test_token_from_tenant_a_cannot_access_tenant_b`: create two tenants + two users with memberships; login as user_a (token); request `/me/` with tenant_b context → assert 403 or empty

## Phase 5: Cleanup & Verification

- [x] 5.1 Verify `useSession` hook works end-to-end: login via UI → token in localStorage → `/api/v1/auth/me/` returns user → `isAuthenticated: true` in hook (no code change expected, manual smoke test)
- [x] 5.2 Verify logout end-to-end: `logout()` in UI → token removed from localStorage → subsequent `/api/v1/auth/me/` call returns 401 → `useSession` sets `isAuthenticated: false`
- [x] 5.3 Verify Django Admin still works: open `/admin/`, login with session — confirm `SessionAuthentication` is unaffected by the token changes
- [x] 5.4 `openspec/changes/auth-drf-token/design.md` — Update "Files Affected" table to mark all items as ✅ completed
- [x] 5.5 `docs/analisis/autenticacion-decisiones.md` — Update Phase 1 status to "✅ Implementado" with date
