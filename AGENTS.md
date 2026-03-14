# AGENTS.md — referenciamar2 / Coldev-CADC

## Visión del producto

Coldev-CADC debe evolucionar desde prototipo UI hacia una **plataforma real ColDev** para operación pesquera y control de calidad.

La personalidad del producto combina:
- **Portfolio**: identidad visual, narrativa moderna, marca ColDev.
- **ColDevPOS / programa inventario**: disciplina de producto real, modularidad, verificabilidad y foco operativo.

## Stack oficial

- **Proyecto frontend**: Next.js + TypeScript
- **Proyecto backend**: Django
- **Base de datos objetivo**: PostgreSQL
- **Enfoque**: multiplataforma
- **Arquitectura**: multitenant con aislamiento fuerte
- **Analítica futura**: preparada para integración con Power BI

## Principios rectores

1. **Producto real antes que demo**
2. **Una sola identidad ColDev**
3. **Backend-first para reglas de negocio**
4. **Multitenancy con aislamiento fuerte**
5. **Cada cambio relevante pasa por SDD**
6. **Nada crítico se entrega ocultando errores**

## Regla de trabajo general

- No agregar mocks nuevos como solución permanente.
- No dejar lógica crítica de negocio solo en frontend.
- Mantener frontend y backend como proyectos separados.
- No mezclar datos de tenants.
- No aprobar cambios importantes sin trazabilidad, validación y revisión contra specs.
- Todo cambio grande debe pasar por `/sdd-new`, `/sdd-continue`, `/sdd-apply`, `/sdd-verify`.

## Arquitectura objetivo

### 1) Modelo de plataforma

Coldev-CADC se diseña como una plataforma:
- **web-first**
- preparada para **móvil**
- preparada para futura superficie **desktop**

La lógica de negocio principal debe residir en **Django**, no en la interfaz.

### 1.1) Separación de proyectos

La solución debe mantenerse en **dos proyectos distintos**:

- `frontend/` → aplicación Next.js
- `backend/` → aplicación Django

No se debe mezclar lógica de dominio del backend dentro del proyecto frontend.
La comunicación entre ambos debe ocurrir mediante contratos/API explícitos.

### 1.2) Estructura objetivo inicial

```text
coldev-cadc/
  frontend/
    app/
    components/
    hooks/
    lib/
    public/
    styles/
    package.json
    next.config.mjs

  backend/
    manage.py
    config/
      settings/
      urls.py
      asgi.py
      wsgi.py
    apps/
      core/
      authentication/
      users/
      audit/
      quality/
    requirements/
    tests/
```

### 2) Multitenancy

La estrategia preferida es:

- **1 base global**
- **1 base de datos por tenant/cliente**

#### Base global
Debe contener solo información transversal y de orquestación:
- registro de tenants
- licencias, planes y estado comercial
- configuración global mínima
- mapeo de conexión hacia la base de cada tenant
- auditoría central mínima y metadatos operativos

#### Base por tenant
Debe contener la operación propia de cada cliente:
- usuarios del tenant
- roles y permisos scoped al tenant
- lotes
- formularios
- auditoría operativa
- reportes
- configuraciones internas
- histórico y trazabilidad del tenant

### 3) Regla de aislamiento de datos

- Ningún tenant puede consultar ni inferir datos de otro tenant.
- Toda request debe resolverse con **contexto de tenant explícito**.
- Toda consulta, comando o proceso batch debe validar tenant antes de operar.
- Los logs, exports, reportes y backups deben respetar el aislamiento.

### 4) Seguridad

- Autenticación real
- Autorización por roles/permisos y por tenant
- Auditoría de acciones sensibles
- Validación backend obligatoria
- Protección de endpoints y operaciones administrativas
- Separación entre administración global y operación de tenant

### 5) Backups y recuperación

- Cada tenant debe poder tener **respaldo independiente**
- Cada tenant debe poder tener **restore independiente**
- Un incidente en un tenant no debe comprometer a los demás
- Las decisiones de datos deben favorecer recuperabilidad antes que conveniencia rápida

### 6) Power BI y analítica

El modelo de datos debe diseñarse para:
- reporting operativo
- métricas históricas
- trazabilidad auditable
- futura explotación analítica vía Power BI

Se debe privilegiar:
- consistencia relacional
- claves claras
- timestamps confiables
- eventos auditables
- estructuras consultables sin ambigüedad

## Dominios iniciales

- auth
- tenants
- companies
- users
- roles-permissions
- lots
- forms
- audit
- reports
- billing/licensing

## Definición de “Done”

Un cambio importante se considera listo solo si:

- tiene objetivo y alcance claros
- respeta arquitectura multi-tenant
- no introduce fuga de datos entre clientes
- tiene validación backend
- tiene manejo de errores razonable
- tiene impacto revisado contra spec/diseño/tareas
- pasa verify del flujo SDD

## Orden recomendado de trabajo

1. Fundaciones de arquitectura y separación frontend/backend
2. Auth + tenant resolution
3. Usuarios, roles y permisos
4. Primer vertical slice real end-to-end
5. Auditoría y reporting base
6. Expansión por módulos

## Primera prioridad de producto

Antes de ampliar dashboards o vistas mock, consolidar:
- autenticación real
- resolución segura de tenant
- usuarios/roles reales
- separación frontend/backend
- auditoría mínima
- base de datos PostgreSQL alineada a Django

## Primer slice oficial

El primer vertical slice de Coldev-CADC es:

- **auth**
- **tenant resolution**
- **usuarios**
- **roles/permisos**

No se prioriza una demo vistosa; se prioriza una base correcta para la visión de producto.

## Uso de SDD

- `/sdd-explore` para explorar decisiones
- `/sdd-new` para iniciar cambios formales
- `/sdd-continue` para completar propuesta/spec/diseño/tareas
- `/sdd-apply` para implementación
- `/sdd-verify` para validación
- `/sdd-archive` para cierre

## Regla final

Si una decisión favorece velocidad pero pone en riesgo:
- aislamiento de tenants
- seguridad
- recuperabilidad
- coherencia del dominio

entonces **se prioriza seguridad, separación y mantenibilidad**.
