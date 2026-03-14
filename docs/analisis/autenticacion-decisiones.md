# Autenticación — Decisiones técnicas

**Fecha decisión**: 2026-03-14  
**Estado**: Aprobado, pendiente de implementación

---

## Decisión adoptada

### Phase 1 (MVP): Django User model + DRF TokenAuthentication

**Librería**: `djangorestframework` (ya instalado)  
**Tiempo estimado**: 2-3 días  
**Estado**: ⏳ Pendiente

### Phase 2 (Production): Django User model + JWT

**Librería**: `djangorestframework-simplejwt`  
**Tiempo estimado**: 3-4 días después de Phase 1  
**Estado**: 📋 Planeado

---

## Por qué esta estrategia

### Por qué NO mantener Sessions

El proyecto actual usa `login(request, user)` + `request.session["tenant_id"]`.  
**Problema**: Django sessions funcionan bien para SSR pero NO para Next.js SPA:
- CORS + credentials = complejo
- Next.js no maneja cookies de sesión igual que un browser tradicional
- Mobile apps futuras: imposible

### Por qué Token primero, JWT después

| Factor | Token | JWT |
|--------|-------|-----|
| Tiempo | 2-3 días | 5-7 días |
| Complejidad | Baja | Media |
| MVP Q2 2026 | ✅ | ⚠️ |
| Production | ⚠️ | ✅ |
| Upgrade path | → JWT fácil | — |

Rápido al mercado + path claro a producción = decisión correcta.

---

## Phase 1: Implementación DRF Token

### Qué cambiar en backend

```python
# settings/base.py — agregar
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}

INSTALLED_APPS = [
    ...
    'rest_framework.authtoken',  # agregar
]
```

```python
# apps/authentication/views.py — modificar LoginView
from rest_framework.authtoken.models import Token

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        # validar credenciales (existente)
        # validar membresía tenant (existente)
        
        token, _ = Token.objects.get_or_create(user=user)
        
        return Response({
            "token": token.key,
            "user": { "id": ..., "fullName": ..., "role": ... },
            "tenant": { "id": ..., "slug": ..., "name": ... },
        })
```

```python
# Proteger endpoints
from rest_framework.permissions import IsAuthenticated

class LotListView(APIView):
    permission_classes = [IsAuthenticated]
    ...
```

### Qué cambiar en frontend

```typescript
// frontend/lib/auth.ts
const TOKEN_KEY = 'coldevconac_token'

export const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token)
export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const clearToken = () => localStorage.removeItem(TOKEN_KEY)
```

```typescript
// frontend/lib/api.ts — interceptor
const headers: HeadersInit = { 'Content-Type': 'application/json' }
const token = getToken()
if (token) headers['Authorization'] = `Token ${token}`
```

```typescript
// frontend/hooks/useAuth.ts
export function useAuth() {
  const [user, setUser] = useState(null)
  // login → llama /api/auth/login → guarda token → setUser
  // logout → clearToken → setUser(null)
}
```

---

## Phase 2: Migrar a JWT

Una vez Phase 1 estable, reemplazar Token por JWT:

```python
# pip install djangorestframework-simplejwt

# settings/base.py
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
}
```

```python
# LoginView devuelve access + refresh
return Response({
    "access": str(access_token),
    "refresh": str(refresh_token),
    "expires_in": 900,
    "user": {...},
    "tenant": {...},
})
```

---

## Relación con Multitenancy

El tenant ya se resuelve en `TenantContextMiddleware` via `resolve_tenant(request)`.  
El token (DRF Token o JWT) solo autentica **quién eres**; el tenant se sigue resolviendo desde session/header/dominio como hoy.

En JWT Phase 2: se puede incluir `tenant_id` en el payload para acelerar resolución.

---

## Archivos a crear/modificar

| Archivo | Acción |
|---------|--------|
| `backend/requirements/base.txt` | Agregar `djangorestframework-simplejwt` (Phase 2) |
| `backend/config/settings/base.py` | REST_FRAMEWORK + authtoken app |
| `backend/apps/authentication/views.py` | LoginView devuelve token |
| `frontend/lib/auth.ts` | Crear — token storage helpers |
| `frontend/lib/api.ts` | Modificar — agregar Authorization header |
| `frontend/hooks/useAuth.ts` | Crear — hook de autenticación |
| `backend/tests/test_auth.py` | Tests del flujo |
