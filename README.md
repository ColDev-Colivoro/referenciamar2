# ColdevConAC: Plataforma de Operaciones Pesqueras

## 🎯 Descripción General

**ColdevConAC** es una plataforma web-first especializada en **control de calidad y operaciones pesqueras**. Evoluciona desde un prototipo UI hacia un sistema real, multitenant, auditable y escalable.

**Propósito**: Digitalizar y automatizar workflows de verificación de calidad en captura pesquera, desde el lote inicial hasta trazabilidad completa.

**Target**: Empresas pesqueras, cooperativas, plantas de procesamiento. Primeros clientes en Q2 2026.

---

## 📊 Estado del Proyecto

| Aspecto | Estado | Detalles |
|--------|--------|---------|
| **Arquitectura** | ✅ Definida | Frontend/backend separados, multitenancy diseñada |
| **Stack** | ✅ Elegido | Next.js 15 + Django 5.1 + PostgreSQL |
| **Auth** | 🟡 Planeada | JWT + multitenancy, en desarrollo |
| **BD** | 🟡 Configurada | PostgreSQL listo, migraciones pendientes |
| **API** | 🟡 En diseño | Contratos RESTful siendo definidos |
| **Frontend** | 🟡 Componentes | 40+ shadcn/ui listos, layouts en desarrollo |
| **Testing** | 🟡 Estructura | pytest/Jest configurados, tests iniciales |
| **Deployment** | ❌ No iniciado | CI/CD ready, staging/prod setup pendiente |
| **Documentación** | ✅ Avanzada | AGENTS.md, specs, arquitectura documentadas |

---

## 🏗️ Arquitectura

### Modelo de Multitenancy

**Decisión**: 1 BD global (tenants + config) + 1 BD por tenant (datos operativos)

**Ventaja**: Aislamiento garantizado, recuperabilidad independiente, compliance fácil

**Implementación**:
```
Global DB (coldev-global)
├─ Tenants (registro de clientes)
├─ Subscriptions (planes, facturación)
├─ Config (settings globales)
└─ GlobalAuditLog (accesos altos)

Per-Tenant DBs (coldev-tenant-{id})
├─ Users (usuarios del tenant)
├─ Roles/Permissions (RBAC)
├─ Lots (lotes de captura)
├─ QualityForms (formularios de control)
├─ CheckResults (resultados de verificación)
├─ AuditLog (quién hizo qué cuándo)
└─ Config (settings del tenant)
```

### Capas de Aplicación

```
┌─────────────────────────────────────┐
│   FRONTEND (Next.js 15)             │
│   ├─ Pages (App Router)             │
│   ├─ Components (shadcn/ui)         │
│   ├─ Hooks (data fetching, state)   │
│   └─ Styles (Tailwind + CSS vars)   │
└────────────┬────────────────────────┘
             │ HTTPS / API Contracts
             │
┌────────────▼────────────────────────┐
│   BACKEND (Django 5.1 / DRF)        │
│   ├─ Auth (JWT + tenant context)    │
│   ├─ Middleware (tenant injection)  │
│   ├─ Apps (core, auth, quality)     │
│   ├─ Models (ORM)                   │
│   ├─ Views/Serializers (API)        │
│   ├─ Business Logic (calculations)  │
│   └─ Signals (audit logging)        │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│   DATABASE LAYER                    │
│   ├─ Global DB (coldev-global)      │
│   ├─ db_router (route by tenant)    │
│   └─ Per-Tenant DBs                 │
└─────────────────────────────────────┘
```

### Flujo de Seguridad

```
1. Frontend Login
   └─> POST /api/auth/login {email, password}

2. Backend Validation
   ├─ Find User in Global DB
   ├─ Verify password (bcrypt)
   └─> Return JWT token {user_id, tenant_id, role}

3. Frontend Stores JWT
   └─> localStorage (or secure cookie)

4. Subsequent Requests
   ├─ Include Authorization header {JWT}
   └─> GET /api/lots/ with JWT

5. Backend Verification
   ├─ Validate JWT signature
   ├─ Extract tenant_id from JWT
   ├─ Inject into request context
   ├─ Route queries to correct DB
   └─> SELECT * FROM lots WHERE tenant_id = {extracted}

6. Guarantee
   └─ Impossible for User A to see Tenant B's data
```

---

## 📦 Stack Técnico

### Frontend

```yaml
Framework: Next.js 15.2.4
React: 19
Language: TypeScript 5
Styling:
  - Tailwind CSS 3.4.17
  - CSS Variables (light/dark mode)
  - shadcn/ui (Radix UI based)
  - Lucide React (icons)
Forms:
  - React Hook Form
  - Zod (validation)
State:
  - React Context API
  - Custom hooks
Utils:
  - next-themes (dark mode)
  - Sonner (toast notifications)
  - Recharts (charts)
Testing:
  - Jest
  - React Testing Library
  - Playwright (E2E)
Build:
  - Vite (local dev)
  - Next.js build (production)
```

### Backend

```yaml
Framework: Django 5.1+
API: Django REST Framework 3.15+
Language: Python 3.11+
Database:
  - PostgreSQL 15+
  - psycopg 3.2+ (async support)
ORM: Django ORM + SQLAlchemy (edge cases)
Auth:
  - JWT (djangorestframework-simplejwt)
  - Custom middleware (tenant injection)
Multitenancy:
  - Custom db_router
  - django-tenants (evaluate)
Testing:
  - pytest
  - pytest-django
  - pytest-cov
Monitoring:
  - Django logging
  - Sentry (error tracking)
  - Custom audit signals
```

### DevOps

```yaml
VCS: GitHub
CI/CD: GitHub Actions
Containerization: Docker
Frontend Hosting: Netlify
Backend Hosting: Railway / Fly.io
Database: PostgreSQL (managed)
Monitoring:
  - Sentry (errors)
  - Custom logging
Backups:
  - AWS S3 (encrypted)
  - Automated daily
```

---

## 📂 Estructura del Proyecto

```
coldevconac/
├── frontend/
│   ├── app/                 # Next.js App Router
│   │   ├── (auth)/         # Auth pages (login, signup)
│   │   ├── (app)/          # Authenticated pages
│   │   │   ├── dashboard/  # Home
│   │   │   ├── lots/       # Lot management
│   │   │   ├── quality/    # Quality forms
│   │   │   └── reports/    # Reporting
│   │   └── layout.tsx      # Root layout
│   ├── components/
│   │   ├── auth/           # Login, signup forms
│   │   ├── common/         # Navbar, sidebar, layout
│   │   ├── quality/        # Quality form components
│   │   ├── lots/           # Lot list, detail, forms
│   │   └── ui/             # Shadcn/ui wrappers
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities (API client, formatters)
│   ├── styles/             # Global CSS, theme
│   ├── public/             # Static assets
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── next.config.mjs
│   └── .env.local          # Local env vars
│
├── backend/
│   ├── manage.py
│   ├── config/
│   │   ├── settings/
│   │   │   ├── base.py
│   │   │   ├── local.py
│   │   │   └── production.py
│   │   ├── urls.py         # Main URLs
│   │   ├── wsgi.py
│   │   └── asgi.py
│   ├── apps/
│   │   ├── core/           # Tenant, subscription models
│   │   ├── authentication/ # Auth, JWT, user management
│   │   ├── users/          # User profiles, roles, permissions
│   │   ├── quality/        # Lots, forms, results, business logic
│   │   └── audit/          # Audit logging, compliance
│   ├── middleware/
│   │   └── tenant.py       # Tenant context injection
│   ├── utils/
│   │   ├── db_router.py    # Route to correct tenant DB
│   │   └── validators.py   # Business rule validators
│   ├── requirements/
│   │   ├── base.txt
│   │   ├── local.txt
│   │   └── production.txt
│   ├── tests/              # Integration + unit tests
│   ├── .env.example
│   └── .gitignore
│
├── docs/
│   ├── vision-producto.md
│   ├── requisitos-funcionales/
│   ├── arquitectura/        # Design docs
│   ├── base-datos/         # ER diagrams
│   ├── analisis/           # Analysis & research
│   └── API.md              # API documentation
│
├── .github/
│   ├── workflows/
│   │   ├── test.yml        # Run tests on PR
│   │   └── deploy.yml      # Deploy on merge
│   └── pull_request_template.md
│
├── .gitignore
├── AGENTS.md               # Product vision & principles
├── README.md               # This file
└── docker-compose.yml      # Local development
```

---

## 🚀 Getting Started

### Prerequisitos
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- Docker (optional, but recommended)

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements/local.txt

# Set up environment
cp .env.example .env
# Edit .env with your local database URL

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start server
python manage.py runserver
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install  # or pnpm install

# Set up environment
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL to http://localhost:8000

# Start dev server
npm run dev
```

**Frontend**: http://localhost:3000  
**Backend API**: http://localhost:8000  
**Django Admin**: http://localhost:8000/admin

---

## 🔐 Seguridad

### Principles

1. **Never trust the frontend** - All validation happens on backend
2. **Tenant isolation is sacred** - Every query validates tenant
3. **Secrets in env vars** - Never hardcode API keys, passwords
4. **HTTPS in production** - Always, non-negotiable
5. **Audit everything** - User actions are recorded with timestamp + context

### Implementation

- **Auth**: JWT tokens with refresh rotation
- **CORS**: Strict, frontend domain only
- **CSRF**: Django middleware enabled
- **SQL Injection**: Django ORM parameterizes queries
- **XSS**: React escapes by default, Content-Security-Policy headers
- **Rate limiting**: On auth endpoints (prevent brute force)
- **Password hashing**: bcrypt via Django

---

## 🧪 Testing

### Backend Tests

```bash
# Run all tests
pytest

# With coverage
pytest --cov=apps/ --cov-report=html

# Run specific test file
pytest apps/quality/tests/test_validation.py

# Run specific test
pytest apps/quality/tests/test_validation.py::test_quality_pass_fail
```

### Frontend Tests

```bash
# Run Jest tests
npm run test

# With coverage
npm run test:coverage

# E2E tests
npm run test:e2e
```

### Coverage Targets

- **Critical modules** (auth, quality logic): 85%+
- **Standard modules**: 70%+
- **UI components**: 60%+

---

## 📝 API Documentation

### Example Endpoints

#### Authentication

```bash
POST /api/auth/login
{
  "email": "operator@company.com",
  "password": "secure_password"
}
# Response: {token, user_id, tenant_id, role}
```

#### Quality Forms

```bash
GET /api/quality/lots/
# Response: [{id, date, species, weight, status, ...}]

POST /api/quality/lots/
{
  "date": "2026-03-14",
  "species": "Anchoveta",
  "weight": 500,
  "capture_zone": "Zone A"
}
# Response: {id, ...}

POST /api/quality/results/
{
  "lot_id": 123,
  "criteria": {
    "color": "PASS",
    "smell": "PASS",
    "texture": "REWORK"
  }
}
# Response: {result_id, decision: "REWORK", reason: "..."}
```

Full API documentation in `/docs/API.md`

---

## 🎯 Development Workflow

### 1. Feature Branch

```bash
git checkout -b feature/quality-rules-engine
```

### 2. Small Commits

```bash
git add apps/quality/logic.py
git commit -m "Add quality validation for anchoveta species"

git add tests/quality/test_validation.py
git commit -m "Test: validate anchoveta rules"
```

### 3. Tests Before Push

```bash
pytest --cov=apps/quality/
npm run test
```

### 4. Push & Create PR

```bash
git push origin feature/quality-rules-engine
# Create PR with clear description
```

### 5. Code Review

- Check architecture alignment
- Verify multitenancy correctness
- Ensure tests pass and cover new code
- Request changes if needed

### 6. Merge

```bash
# After approval
git checkout main
git merge --no-ff feature/quality-rules-engine
git push origin main
```

---

## 🔄 Deployment

### Staging

Automatic on every commit to `develop`:

```
1. Push to develop
2. GitHub Actions runs tests
3. If tests pass: Build Docker image
4. Deploy to staging
5. Smoke tests run
6. Ready for manual testing
```

### Production

Manual on tagged release:

```bash
# After final testing in staging
git checkout main
git tag -a v1.0.0 -m "Release v1.0.0: Initial launch"
git push origin main --tags
```

**GitHub Actions** will:
1. Build Docker images
2. Run tests
3. Deploy to production
4. Monitor for 24h
5. Keep rollback plan ready

---

## 📊 Monitoring

### Error Tracking
- Sentry captures exceptions in production
- Alerts on critical errors
- Stack traces + context logged

### Performance
- Response times tracked (target: <500ms P95)
- Database query profiling
- Frontend Core Web Vitals

### Audit
- All user actions logged with timestamp + context
- Exportable for compliance
- Immutable audit trail

---

## 🛣️ Roadmap

### Phase 1: Foundation (Now - March 2026)
- [x] Architecture defined
- [x] Stack chosen
- [ ] Auth implemented (70%)
- [ ] Quality form system (70%)
- [ ] Integration tests (50%)
- [ ] Staging deployment

### Phase 2: Polish (April 2026)
- [ ] Auth completed + security audit
- [ ] E2E tests for happy paths
- [ ] Performance optimization
- [ ] Operator documentation
- [ ] Customer onboarding flow

### Phase 3: Launch (May 2026)
- [ ] Production deployment
- [ ] Monitoring setup + alerting
- [ ] First customer onboarded
- [ ] Support infrastructure ready

---

## 📞 Contributing

This is a closed project (COLDEV internal), but principles apply if you're building:

1. **Read AGENTS.md** - Understand vision and principles
2. **Follow SDD for big changes** - Spec → Design → Implementation → Verify
3. **Write tests alongside code** - Not after
4. **Document your decisions** - Especially architectural
5. **Respect multitenancy** - Never assume a single tenant

---

## 📜 License & Attribution

**COLDEV - 2026**
Proprietary software. All rights reserved.

**Stack Attribution**:
- Built with [Next.js](https://nextjs.org/)
- Powered by [Django](https://www.djangoproject.com/)
- UI by [shadcn/ui](https://ui.shadcn.com/) + [Tailwind CSS](https://tailwindcss.com/)
- Database: [PostgreSQL](https://www.postgresql.org/)

---

**Last Updated**: 2026-03-14  
**Version**: 1.0 (MVP)  
**Maintainer**: José Colivoro (COLDEV)
