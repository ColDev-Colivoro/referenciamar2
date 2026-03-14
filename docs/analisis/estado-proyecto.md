# Estado del proyecto — ColdevConAC

**Fecha**: 2026-03-14  
**Versión**: Post-sesión análisis inicial

---

## Nombre oficial

```
ColdevConAC
```

Antes se llamaba `coldev-cadc`. Renombrado en esta sesión.

---

## Stack

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Frontend | Next.js | 15 |
| UI | shadcn/ui + Tailwind | v4 |
| Backend | Django + DRF | 5.1 / 3.15 |
| Base de datos | PostgreSQL | latest |
| DevOps | Docker + GitHub Actions | — |

---

## Estado de implementación

| Módulo | Estado | % |
|--------|--------|---|
| Multitenancy (backend) | ✅ Implementado | 80% |
| Auth (sessions) | ✅ Funciona | 50% |
| Auth (token/JWT) | ✅ Implementado | 100% |
| APIs REST | ✅ Users/Roles implementado | 70% |
| Frontend UI | ✅ Componentes | 60% |
| Frontend Auth Context | ⏳ Pendiente | 0% |
| Users/Roles API | ✅ Implementado | 100% |
| **Quality / Lots** | ✅ Vertical slice completo | **40%** |
| **Quality / Forms** | ✅ Vertical slice completo | **70%** |
| **Audit** | ✅ Módulo base operacional | **70%** |
| **Reports** | ✅ Módulo base operacional | **50%** |
| Testing | 🟡 71 tests (auth+users+lots+audit+forms+reports) | 75% |
| Deployment | ⏳ Pendiente | 0% |

### Audit — detalle

| Componente | Estado |
|------------|--------|
| `AuditEvent` model + migration | ✅ pre-existing |
| `log_audit_event` helper | ✅ pre-existing |
| `GET /api/v1/audit/` endpoint | ✅ implemented |
| Quality retrofit: lots.create / lots.update / lots.change_status logged | ✅ implemented |
| Frontend audit page `/dashboard/audit/` | ✅ implemented |
| Tests (8/8 passing) | ✅ |
| Pendiente: export, retention, alerts | ⏳ |

### Quality / Lots — detalle

| Componente | Estado |
|------------|--------|
| `Lot` model + migration (`0002_add_lot`) | ✅ |
| API endpoints: list, create, detail, update, status | ✅ |
| Frontend hook `useLots()` | ✅ |
| Frontend page `/dashboard/lots/` | ✅ |
| `LotStatusBadge` component | ✅ |
| `LotForm` dialog component | ✅ |
| Backend tests (13/13 passing) | ✅ |

### Quality / Forms — detalle

| Componente | Estado |
|------------|--------|
| `QualityForm` + `FormField` models + migration | ✅ |
| API: list, create, detail, status change | ✅ |
| Frontend hook `useForms(lotId)` | ✅ |
| Frontend page `/dashboard/lots/[id]/forms/` | ✅ |
| `FormStatusBadge` component | ✅ |
| Backend tests (10/10 passing) | ✅ |
| Audit: form.create, form.submitted, form.approved, form.rejected | ✅ |
| Total tests: 71 passing (65 previos + 6 reports) | ✅ |
| Pendiente: export PDF, templates dinámicos | ⏳ |

### Reports — detalle

| Componente | Estado |
|------------|--------|
| GET /api/v1/reports/dashboard/ | ✅ |
| GET /api/v1/reports/lots/summary/ | ✅ |
| GET /api/v1/reports/forms/summary/ | ✅ |
| GET /api/v1/reports/activity/ | ✅ |
| Frontend useReports() hook | ✅ |
| Frontend StatsCards component | ✅ |
| Tests: 6/6 passing | ✅ |
| Pendiente: CSV export, charts, historical trends | ⏳ |

---

## Design System

Ver: `docs/analisis/design-system-coldevconac.md`

**Resumen**:
- Primary: `#ff5722` (ColDev orange)
- Accent: `#ffeb3b` (ColDev yellow)
- Background dark: `#1a1a1a`
- Fuente: Iosevka
- Efectos: glass-card, hover-lift, hero-fade-in, gradiente body
- defaultTheme: dark

---

## Autenticación

Ver: `docs/analisis/autenticacion-decisiones.md`

**Decisión**:
- Phase 1: Django User model + DRF Token (MVP, 2-3 días)
- Phase 2: Django User model + JWT (Production, 3-4 días)

**NO usar**: Sessions (bloquea Next.js SPA), Custom User model (ahora)

---

## Roadmap ejecutivo

| Semana | Objetivo |
|--------|----------|
| 1 | JWT/Token + API Contracts + Auth Context frontend |
| 2 | Migrations + User APIs + Lot APIs |
| 3 | Quality Control APIs |
| 4 | Testing 80%+ |
| 5-6 | Reports + Deployment |

**Target launch**: Q2 2026

---

## Top 5 pendientes críticos

1. **DRF Token Auth** — bloquea todo frontend (2-3 días)
2. **API Contracts** — alinea frontend/backend (2 días)
3. **Auth Context React** — login funcional en Next.js (3 días)
4. **Database Migrations** — schema en BD real (2 días)
5. **Core APIs** — Users, Lots, Quality (10-15 días)

---

## Documentos del proyecto

```
docs/
├── analisis/
│   ├── design-system-coldevconac.md   ← Design tokens y efectos
│   ├── autenticacion-decisiones.md    ← Auth strategy
│   ├── frontend-referencia.md         ← Frontend patterns
│   └── estado-proyecto.md             ← Este archivo
├── arquitectura/
│   ├── arquitectura-inicial.md
│   ├── backend-apps-modelos-propuestos.md
│   ├── frontend-shell-flujo-usuario.md
│   └── roadmap-sdds-frontend.md
├── requisitos-funcionales/
│   └── requisitos-funcionales-borrador.md
└── README.md
```
