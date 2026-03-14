# Roadmap SDD recomendado para construir ordenado

## Principio

No debemos seguir con un solo cambio gigante para todo el frontend.
La construcción debe separarse en **SDDs pequeños, coherentes y dependientes entre sí**.

## SDD activo

### 1. `fundacion-producto-cdc`
**Objetivo**:
- auth híbrida
- tenant resolution
- usuarios y roles
- base backend/frontend mínima

**Estado**:
- en progreso
- debe cerrar la base real del acceso y seguridad

## Próximos SDDs recomendados

### 2. `frontend-shell-navegacion`
**Objetivo**:
- crear app shell autenticado
- sidebar por rol
- topbar consistente
- layout protegido reutilizable
- breadcrumbs base

**No incluye**:
- módulos de negocio grandes
- calidad completa
- operaciones completas

---

### 3. `frontend-admin-usuarios`
**Objetivo**:
- mover gestión de usuarios a rutas dedicadas
- separar resumen admin de mantenimiento de usuarios
- separar roles/permisos como sección propia
- dejar admin sin dashboards mezclados

**Dependencia**:
- `frontend-shell-navegacion`

---

### 4. `frontend-manager-secciones`
**Objetivo**:
- transformar la vista manager en secciones reales
- separar resumen, operación, reportes y auditoría
- mostrar u ocultar módulos según permisos reales

**Dependencia**:
- `frontend-shell-navegacion`

---

### 5. `frontend-quality-secciones`
**Objetivo**:
- crear sección de calidad
- formularios
- aprobaciones
- hallazgos / no conformidades
- tendencias

**Dependencia**:
- `frontend-shell-navegacion`

---

### 6. `frontend-operations-secciones`
**Objetivo**:
- recepción
- lotes
- producción
- despacho
- vistas operativas separadas

**Dependencia**:
- `frontend-shell-navegacion`
- avances backend por dominio

---

### 7. `frontend-home-por-rol`
**Objetivo**:
- definir landing inicial por rol
- dashboards pequeños y útiles
- tarjetas de acceso rápido
- estados vacíos y onboarding

**Dependencia**:
- shell y secciones base

---

### 8. `frontend-cleanup-legacy-web`
**Objetivo**:
- eliminar componentes heredados no web
- remover piezas mock ya reemplazadas
- corregir typecheck roto por código legacy
- estabilizar build frontend

**Dependencia**:
- shell base ya migrado

## Orden recomendado real

1. `fundacion-producto-cdc`
2. `frontend-shell-navegacion`
3. `frontend-admin-usuarios`
4. `frontend-manager-secciones`
5. `frontend-quality-secciones`
6. `frontend-operations-secciones`
7. `frontend-home-por-rol`
8. `frontend-cleanup-legacy-web`

## Regla de trabajo

Cada SDD debe:
- tocar un problema claro
- tener alcance pequeño o mediano
- dejar algo usable
- no mezclar shell + calidad + operaciones + analítica en el mismo cambio

## Regla UX

Toda nueva pantalla debe respetar:
- sidebar
- jerarquía por secciones
- tarjetas funcionales
- páginas dedicadas por módulo
- permisos por rol
- cero mezcla desordenada de widgets

## Nota

Esto permite construir Coldev-CADC como plataforma real y no como una colección de dashboards sueltos.
