# Design: Auth DRF Token — ColdevConAC

## Technical Approach

Introduce `rest_framework.authtoken` as a thin layer on top of the existing session-based
auth. The goal is minimal disruption: the Django `LoginView` already validates credentials,
checks tenant membership, and logs audit events — we only add token generation and return it
in the response. The frontend already has the full auth scaffolding (`apiRequest`, `login()`,
`useSession`, `logout`); we extend it to persist the token and inject the `Authorization`
header automatically.

No business logic moves. No models change. `TenantContextMiddleware` is untouched.

---

## Architecture Decisions

### Decision: Keep `login()` / `logout()` in existing views (don't replace with DRF generics)

**Choice**: Extend `LoginView.post()` and `LogoutView.post()` with token lines  
**Alternatives considered**: Replace with `ObtainAuthToken` from DRF; use `knox`  
**Rationale**: `LoginView` already has tenant check, membership lookup, and audit logging. Replacing it with a generic view would lose all that. Adding 2–3 lines for token generation is far safer.

### Decision: Keep `SessionAuthentication` alongside `TokenAuthentication`

**Choice**: Add `TokenAuthentication` as the **first** class in `DEFAULT_AUTHENTICATION_CLASSES`; keep `SessionAuthentication` second  
**Alternatives considered**: Remove `SessionAuthentication` entirely; use only token  
**Rationale**: Django Admin requires `SessionAuthentication`. Keeping both means Admin continues to work. DRF tries each class in order and stops at the first match. **Order matters for error responses**: DRF uses the first class to decide between 401 and 403 — placing `TokenAuthentication` first means API clients (SPA, mobile) get semantically correct 401s. `SessionAuthentication` for unsafe methods (POST/PUT/PATCH/DELETE) requires a valid CSRF token; since the frontend is cross-origin and the primary consumer is the SPA, this is not an issue for token-authenticated requests. If session auth is used cross-origin (e.g., from Django Admin), `CORS_ALLOW_CREDENTIALS=True` and `SESSION_COOKIE_SAMESITE=None` are required — but that is out of scope for Phase 1.

### Decision: Token storage in `localStorage` via a dedicated `lib/auth/token.ts` module

**Choice**: New `lib/auth/token.ts` with `getToken()`, `setToken()`, `clearToken()`  
**Alternatives considered**: `sessionStorage` (lost on tab close); httpOnly cookie (requires backend changes); Zustand store (overkill for Phase 1)  
**Rationale**: `localStorage` persists across refreshes and tabs. It's acceptable risk for an MVP. The module isolates the storage key so switching to httpOnly cookie in Phase 2 only requires changing this one file.

### Decision: Inject `Authorization` header in the existing `apiRequest` function

**Choice**: Modify `lib/api/client.ts` to read `getToken()` and add the header when a token is present  
**Alternatives considered**: Axios interceptors; React context provider injecting headers  
**Rationale**: The project already uses `apiRequest` for all calls. One injection point = guaranteed coverage with no per-call changes. Keeps the fetch-based approach (no new dependency).

### Decision: `useSession` refreshes from `/api/v1/auth/me/` (unchanged)

**Choice**: Leave `useSession` hook as-is; the `SessionView` backend endpoint will work with token auth once `TokenAuthentication` is in the auth classes  
**Alternatives considered**: Re-hydrate session from localStorage only (no network call); store full user in localStorage  
**Rationale**: The `SessionView` call validates the token is still valid server-side. Avoids stale session state. No code change needed since `apiRequest` will automatically inject the token.

### Decision: `LoginResponse.accessToken` becomes the token field (non-optional)

**Choice**: Update `types.ts` to make `accessToken: string` required; backend returns it on every successful login  
**Alternatives considered**: New field `token`; keep both `accessToken` and `refreshToken` optional  
**Rationale**: `accessToken` is already defined in `LoginResponse` as optional. Making it required is a minimal type change. `refreshToken` stays optional (Phase 2 concern).

---

## Data Flow

### Login Flow

```
Browser                Frontend                      Backend
  │                       │                              │
  │  submit form          │                              │
  ├──────────────────────>│                              │
  │                       │  POST /api/v1/auth/login/    │
  │                       ├─────────────────────────────>│
  │                       │                              │  LoginSerializer.validate()
  │                       │                              │  ├─ resolve_tenant()
  │                       │                              │  ├─ authenticate(user, password)
  │                       │                              │  └─ check UserMembership
  │                       │                              │
  │                       │                              │  Token.objects.get_or_create(user)
  │                       │                              │  login(request, user)  [session for admin]
  │                       │                              │  log_audit_event()
  │                       │                              │
  │                       │  200 {accessToken, user,     │
  │                       │       tenant, permissions}   │
  │                       │<─────────────────────────────│
  │                       │                              │
  │                       │  setToken(accessToken)       │
  │                       │  [localStorage]              │
  │                       │                              │
  │  redirect to role     │                              │
  │<──────────────────────│                              │
```

### Authenticated API Request Flow

```
Component                apiRequest()                  Backend
  │                          │                             │
  │  apiRequest("/api/...")   │                             │
  ├─────────────────────────>│                             │
  │                          │  getToken() → "abc123"      │
  │                          │                             │
  │                          │  fetch(url, {               │
  │                          │    headers: {               │
  │                          │      Authorization:         │
  │                          │      "Token abc123"         │
  │                          │    }                        │
  │                          │  })                         │
  │                          ├────────────────────────────>│
  │                          │                             │  TokenAuthentication resolves user
  │                          │                             │  TenantContextMiddleware resolves tenant
  │                          │                             │  view executes with request.user
  │                          │  200 { data }               │
  │                          │<────────────────────────────│
  │  data                    │                             │
  │<─────────────────────────│                             │
```

### Logout Flow

```
Component                Frontend                      Backend
  │                          │                             │
  │  logout()                │                             │
  ├─────────────────────────>│                             │
  │                          │  POST /api/v1/auth/logout/  │
  │                          │  Authorization: Token abc   │
  │                          ├────────────────────────────>│
  │                          │                             │  Token.objects.filter(user).delete()
  │                          │                             │  logout(request)
  │                          │                             │  log_audit_event()
  │                          │  204 No Content             │
  │                          │<────────────────────────────│
  │                          │                             │
  │                          │  clearToken() [localStorage]│
  │                          │  setSession(null)           │
  │                          │                             │
  │  redirect to /login      │                             │
  │<─────────────────────────│                             │
```

---

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `backend/config/settings/base.py` | Modify | Add `rest_framework.authtoken` to `INSTALLED_APPS`; add `TokenAuthentication` as first class in `DEFAULT_AUTHENTICATION_CLASSES`; add `Authorization` to `CORS_ALLOW_HEADERS` |
| `backend/apps/authentication/views.py` | Modify | `LoginView.post()`: add `Token.objects.get_or_create(user=user)` and include token in response. `LogoutView.post()`: delete token before `logout(request)` |
| `frontend/lib/auth/token.ts` | Create | `getToken()`, `setToken(token)`, `clearToken()` — wraps `localStorage` with key `coldevconac_token` |
| `frontend/lib/api/client.ts` | Modify | Read `getToken()` and inject `Authorization: Token <key>` when non-null |
| `frontend/lib/auth/types.ts` | Modify | Change `accessToken?: string` → `accessToken: string` (required) |
| `frontend/lib/auth/session.ts` | Modify | After successful `login()`, call `setToken(response.accessToken)` |
| `frontend/lib/auth/logout.ts` | Modify | After successful `logout()`, call `clearToken()` |
| `backend/tests/test_auth_token.py` | Create | pytest tests: login returns token, logout deletes token, protected endpoint 401/200 |

---

## Interfaces / Contracts

### Backend: Login Response (updated)

```python
# build_session_payload remains the same.
# LoginView.post() wraps it with the token:
{
  "accessToken": "9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b",
  "sessionMode": "hybrid",
  "user": {
    "id": "uuid",
    "fullName": "string",
    "role": "manager"
  },
  "tenant": {
    "id": "uuid",
    "slug": "string",
    "name": "string"
  },
  "permissions": ["string"]
}
```

### Backend: `LoginView.post()` diff (conceptual)

```python
# After membership check and login(request, user):

token, _ = Token.objects.get_or_create(user=user)

payload = build_session_payload(membership)
payload["accessToken"] = token.key

return Response(payload)
```

### Backend: `LogoutView.post()` diff (conceptual)

```python
# Before logout(request):
if request.user.is_authenticated:
    Token.objects.filter(user=request.user).delete()
    # ... existing audit log ...

logout(request)
request.session.flush()
return Response(status=status.HTTP_204_NO_CONTENT)
```

### Backend: `base.py` additions

```python
INSTALLED_APPS = [
    ...
    "rest_framework",
    "rest_framework.authtoken",   # ← ADD
    ...
]

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.TokenAuthentication",   # ← ADD first (SPA/API clients)
        "rest_framework.authentication.SessionAuthentication", # keep second (Django Admin)
    ],
    ...
}

# No CORS_ALLOW_HEADERS change needed:
# django-cors-headers includes "authorization" by default.
# (If running under Apache + mod_wsgi, add: WSGIPassAuthorization On)
```

### Frontend: `lib/auth/token.ts` (new file)

```typescript
const TOKEN_KEY = "coldevconac_token"

export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}
```

### Frontend: `lib/api/client.ts` diff (conceptual)

```typescript
import { getToken } from "@/lib/auth/token"

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken()
  const authHeader = token ? { Authorization: `Token ${token}` } : {}

  const response = await fetch(buildApiUrl(path), {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...authHeader,          // ← ADD
      ...(init?.headers ?? {}),
    },
  })
  // ... rest unchanged
}
```

### Frontend: `lib/auth/types.ts` diff

```typescript
export interface LoginResponse {
  accessToken: string          // ← was optional (accessToken?: string), now required
  refreshToken?: string        // remains optional (Phase 2)
  sessionMode: "cookie" | "hybrid"
  // ... rest unchanged
}
```

---

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit (backend) | `LoginView` returns token in response | `pytest` with `APIClient`, mock `Token.objects.get_or_create` |
| Unit (backend) | `LogoutView` deletes token | `pytest`: create token, call logout, assert token gone |
| Unit (backend) | `LogoutView` without auth returns 401 | `pytest` with no credentials |
| Integration (backend) | Protected endpoint returns 401 without token | `APIClient()` no credentials → 401 |
| Integration (backend) | Protected endpoint returns 200 with token | `APIClient().credentials(HTTP_AUTHORIZATION=...)` → 200 |
| Integration (backend) | Tenant isolation: token from tenant A, tenant B context → 403/empty | `pytest` with two tenants |
| Unit (frontend) | `getToken/setToken/clearToken` read/write localStorage | Jest: mock localStorage |
| Unit (frontend) | `apiRequest` injects header when token present | Jest: mock fetch, assert header |
| Unit (frontend) | `apiRequest` omits header when no token | Jest: mock fetch, assert no header |
| Unit (frontend) | `useSession` shows `isAuthenticated: false` after `clearToken` | React Testing Library |

---

## Migration / Rollout

**Migration required**: `python manage.py migrate` must be run after adding `rest_framework.authtoken`
to `INSTALLED_APPS`. This creates the `authtoken_token` table.

**No data migration**: Existing sessions and users are unaffected. The token table starts empty
and tokens are created on first login.

**Rollback**: `python manage.py migrate authtoken zero` drops the token table. Revert file changes
and session-based auth is restored exactly as before.

---

## Open Questions

~~[ ] Should `SessionView` (`GET /api/v1/auth/me/`) require token auth? Currently it works with
  session cookies for admin users. After this change it will also accept token — is that acceptable?~~  
✅ **Resolved**: Yes. `TokenAuthentication` first (correct 401 semantics for SPA), `SessionAuthentication` second (Admin). `GET /me/` is a safe method so CSRF is not required.

~~[ ] Should `CORS_ALLOW_HEADERS` use the `django-cors-headers` default list or explicit list?
  The project currently uses `CORS_ALLOWED_ORIGINS` only — need to confirm whether `Authorization`
  is blocked by the current CORS config or if `corsheaders` allows it by default.~~  
✅ **Resolved**: `django-cors-headers` includes `"authorization"` by default — no `CORS_ALLOW_HEADERS` override needed unless the project already overrides it (it does not). **Note**: CORS only controls browser-side permissions; if the project ever runs under Apache + mod_wsgi, `WSGIPassAuthorization On` must be set in the Apache config or the `Authorization` header will be stripped before reaching Django.

