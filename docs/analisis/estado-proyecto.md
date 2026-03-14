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
| Testing | 🟡 21 tests (auth+users) | 60% |
| Deployment | ⏳ Pendiente | 0% |

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
