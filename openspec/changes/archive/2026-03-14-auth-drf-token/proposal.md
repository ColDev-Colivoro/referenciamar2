# Proposal: Auth DRF Token — ColdevConAC

## Intent

El programa ColdevConAC usa autenticación basada en Django sessions, lo cual **bloquea el funcionamiento del frontend Next.js 15 (SPA)**. Las sesiones con cookies de Django no son aptas para Single Page Applications por complejidad CORS y para futuras apps mobile.

Esta propuesta resuelve el problema implementando **Django REST Framework TokenAuthentication** como Phase 1 (MVP rápido), con ruta clara hacia JWT en Phase 2.

Sin este cambio, ningún endpoint de la API puede ser consumido de forma segura desde el frontend.

---

## Scope

### In Scope

- Agregar `rest_framework.authtoken` a `INSTALLED_APPS`
- Configurar `TokenAuthentication` como clase de autenticación en DRF
- Modificar `LoginView` para generar y retornar token en respuesta JSON
- Crear `LogoutView` que elimina el token del usuario
- Crear `frontend/lib/auth.ts` — helpers para persistir token en localStorage
- Crear `frontend/lib/api.ts` — cliente HTTP con header `Authorization: Token`
- Crear `frontend/hooks/useAuth.ts` — hook React para login/logout/user state
- Proteger endpoints existentes con `IsAuthenticated`
- Tests de flujo completo: login → token → API call → logout

### Out of Scope

- JWT / refresh tokens (Phase 2, tarea separada)
- Token expiry (Phase 2)
- Token blacklist (Phase 2)
- 2FA (futuro)
- Custom User model (descartado por ahora)
- OAuth / SSO (futuro)
- Frontend routing protegido completo (Phase 3)

---

## Approach

Reutilizar el **Django User model nativo** y el sistema de auth existente. Solo agregar la capa de tokens:

1. **Backend**: Agregar `authtoken` app → `Token.objects.get_or_create(user=user)` en `LoginView` → response JSON `{token, user, tenant}`
2. **Frontend**: Guardar token en `localStorage` → Interceptor HTTP que agrega `Authorization: Token <key>` en cada request
3. **Testing**: Flujo end-to-end login → call → logout con pytest y Jest

El `TenantContextMiddleware` existente **no cambia** — sigue resolviendo tenant por headers/session. El token solo autentica *quién* eres; el tenant lo resuelve el middleware como hoy.

---

## Affected Areas

| Área | Impacto | Descripción |
|------|---------|-------------|
| `backend/config/settings/base.py` | Modificado | Agregar `authtoken` app + DRF config |
| `backend/apps/authentication/views.py` | Modificado | LoginView devuelve token, LogoutView borra token |
| `backend/apps/authentication/urls.py` | Modificado | Agregar ruta logout si no existe |
| `frontend/lib/auth.ts` | Nuevo | `setToken`, `getToken`, `clearToken` |
| `frontend/lib/api.ts` | Nuevo/Modificado | Función `apiFetch` con Authorization header |
| `frontend/hooks/useAuth.ts` | Nuevo | `useAuth()` hook — login, logout, user state |
| `backend/tests/test_auth_token.py` | Nuevo | Tests del flujo de token |
| `frontend/tests/auth.test.ts` | Nuevo | Tests del hook useAuth |

---

## Risks

| Riesgo | Probabilidad | Mitigación |
|--------|-------------|------------|
| Token en localStorage vulnerable a XSS | Media | Aceptable en MVP; migrar a httpOnly cookie en Phase 2 |
| Token sin expiración: acceso permanente si robado | Media | Logout elimina token de BD; mitigado parcialmente |
| CORS con header personalizado | Baja | `django-cors-headers` ya instalado; solo agregar `Authorization` a allowed headers |
| Conflicto con SessionAuth existente | Baja | SessionAuth sigue activo para admin Django; DRF Token para API |
| Tenant no resuelto en requests con token | Baja | Middleware actual resuelve tenant independiente del auth; testear explícitamente |

---

## Rollback Plan

1. Remover `rest_framework.authtoken` de `INSTALLED_APPS`
2. Revertir `LoginView` al estado original (sesión)
3. Eliminar `frontend/lib/auth.ts`, `api.ts`, `hooks/useAuth.ts`
4. `python manage.py migrate authtoken zero` (elimina tabla de tokens)

---

## Dependencies

- `djangorestframework >= 3.15` — ya instalado en `requirements/base.txt`
- `django-cors-headers >= 4.4` — ya instalado
- `rest_framework.authtoken` — incluido en DRF, sin pip extra

---

## Success Criteria

- [ ] `POST /api/auth/login` devuelve `{token, user, tenant}` con status 200
- [ ] `POST /api/auth/login` con credenciales incorrectas devuelve 400/401
- [ ] `POST /api/auth/logout` elimina el token y devuelve 204
- [ ] Endpoint protegido devuelve 401 sin token
- [ ] Endpoint protegido devuelve 200 con `Authorization: Token <key>`
- [ ] Tenant isolation respetado: request con token de tenant A no accede a datos de tenant B
- [ ] Frontend: login guarda token en localStorage
- [ ] Frontend: requests incluyen `Authorization: Token` automáticamente
- [ ] Frontend: logout limpia token y user state
- [ ] Tests backend: 90%+ cobertura del flujo auth
- [ ] Tests frontend: hook useAuth funciona en mocks
