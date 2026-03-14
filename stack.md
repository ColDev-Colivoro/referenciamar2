# ColdevConAC - Tech Stack Detallado

## 🎯 Decisiones de Stack

**Principio**: Tecnologías maduras, comunidades activas, con ventajas claras para nuestro dominio.

---

## Frontend Stack

### Framework: Next.js 15.2.4

**Por qué Next.js**:
- ✅ App Router (modern routing, server components)
- ✅ Built-in API routes (can prototype backend routes)
- ✅ Image optimization (auto WebP, lazy loading)
- ✅ Incremental Static Regeneration (ISR) for reports
- ✅ Vercel deployment (1-click, no DevOps pain)
- ✅ TypeScript first-class support

**Alternativas consideradas**:
- Vite + React: Too low-level for our needs
- Nuxt: Our team knows React better
- Remix: Good but smaller ecosystem

**Version**: `15.2.4` (Latest stable as of 2026)

### React: 19

**Novedades importantes**:
- Hooks stable (our main pattern)
- Suspense for data fetching
- Transitions for non-urgent updates
- use() hook for promises

**Patterns we use**:
```typescript
// Custom hook for data fetching
export function useLots(tenantId: string) {
  const [lots, setLots] = useState([]);
  useEffect(() => {
    fetch(`/api/lots/?tenant=${tenantId}`)
      .then(r => r.json())
      .then(setLots);
  }, [tenantId]);
  return lots;
}

// Context for auth state
const AuthContext = createContext();
export function AuthProvider({children}) {
  const [user, setUser] = useState(null);
  return <AuthContext.Provider value={{user, setUser}}>{children}</AuthContext.Provider>;
}
```

### TypeScript 5

**Strict mode enabled**: `strict: true` in tsconfig.json

**Benefits**:
- Catch type errors at compile time
- IDE autocomplete (better DX)
- Self-documenting code

**Examples**:
```typescript
// API response type
interface Lot {
  id: number;
  date: string;
  species: "Anchoveta" | "Jurel" | "Caballa";
  weight: number;
  status: "pending" | "verified" | "rejected";
}

// Form component
interface QualityFormProps {
  lotId: number;
  onSubmit: (result: QualityResult) => Promise<void>;
}

export function QualityForm({lotId, onSubmit}: QualityFormProps) {
  // TypeScript ensures correct prop types
}
```

### Styling: Tailwind CSS 3.4.17

**Why Tailwind**:
- ✅ Utility-first (rapid development)
- ✅ Small bundle size (tree-shaking)
- ✅ Dark mode built-in
- ✅ Responsive design (mobile-first)
- ✅ Performance (no CSS-in-JS runtime)

**Theme Configuration**:
```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        sidebar: "hsl(var(--sidebar))",
        primary: "hsl(var(--primary))",
        accent: "hsl(var(--accent))",
      },
    },
  },
};
```

**CSS Variables for Dark Mode**:
```css
/* globals.css - Light theme */
:root {
  --background: 210 40% 96.1%;
  --primary: 0 0% 9%;
}

/* Dark theme */
.dark {
  --background: 222.2 84% 4.9%;
  --primary: 0 0% 98%;
}
```

### UI Library: shadcn/ui

**What is shadcn/ui**:
- Copy-paste component library (not npm)
- Built on Radix UI (headless, accessible)
- Fully customizable (you own the code)
- No breaking updates (you control versions)

**Components we use**:
- Button, Input, Label, Form
- Dialog, AlertDialog, Popover
- Select, Dropdown, Command
- Card, Container, Sidebar
- Table, DataTable
- Tabs, Accordion
- Toast/Sonner

**Example**:
```typescript
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  return (
    <div className="space-y-4">
      <Input type="email" placeholder="Email" />
      <Button>Sign In</Button>
    </div>
  );
}
```

### Icons: Lucide React

**Why Lucide**:
- ✅ 400+ SVG icons
- ✅ Consistent design
- ✅ Tree-shakeable (only used icons in bundle)
- ✅ Customizable (size, color, stroke)

**Usage**:
```typescript
import { Eye, Download, Trash2 } from "lucide-react";

export function LotActions({lotId}) {
  return (
    <>
      <Eye /> {/* View */}
      <Download /> {/* Export */}
      <Trash2 /> {/* Delete */}
    </>
  );
}
```

### Forms: React Hook Form + Zod

**Architecture**:
- React Hook Form: Minimal, performant form state
- Zod: Type-safe schema validation

**Why this combo**:
- ✅ No re-renders for every field change
- ✅ Frontend validation (fast feedback)
- ✅ Type-safe (TypeScript + Zod schemas)
- ✅ Backend mirrors same schemas

**Example**:
```typescript
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";

// Define schema
const LotSchema = z.object({
  species: z.enum(["Anchoveta", "Jurel", "Caballa"]),
  weight: z.number().min(1).max(10000),
  date: z.string().datetime(),
});

// Type inference from schema
type LotForm = z.infer<typeof LotSchema>;

export function NewLotForm() {
  const {register, handleSubmit, formState: {errors}} = useForm<LotForm>({
    resolver: zodResolver(LotSchema),
  });

  return (
    <form onSubmit={handleSubmit(async (data) => {
      // data is typed as LotForm
      const res = await fetch("/api/lots/", {
        method: "POST",
        body: JSON.stringify(data),
      });
    })}>
      <input {...register("species")} />
      {errors.species && <span>{errors.species.message}</span>}
    </form>
  );
}
```

### Charts: Recharts

**For quality reports and trends**:
```typescript
import {LineChart, Line, XAxis, YAxis} from "recharts";

export function QualityTrend({data}) {
  return (
    <LineChart data={data}>
      <XAxis dataKey="date" />
      <YAxis />
      <Line type="monotone" dataKey="passRate" stroke="#8884d8" />
    </LineChart>
  );
}
```

### State Management: React Context API

**Why we don't use Redux/Zustand**:
- Small to medium app
- Context API sufficient for auth + UI state
- Redux adds complexity we don't need

**Patterns**:
```typescript
// Auth context
export const AuthContext = createContext<{
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
} | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}

// Usage in components
export function Dashboard() {
  const {user} = useAuth();
  return <h1>Welcome, {user?.name}</h1>;
}
```

### Testing: Jest + React Testing Library

**Unit tests**:
```typescript
// __tests__/components/Button.test.tsx
import {render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {Button} from "@/components/Button";

test("Button renders and is clickable", async () => {
  const handleClick = jest.fn();
  render(<Button onClick={handleClick}>Click me</Button>);
  
  await userEvent.click(screen.getByText("Click me"));
  expect(handleClick).toHaveBeenCalled();
});
```

**E2E tests**: Playwright
```typescript
// e2e/login.spec.ts
import {test, expect} from "@playwright/test";

test("User can login", async ({page}) => {
  await page.goto("http://localhost:3000/login");
  await page.fill('input[name="email"]', "test@example.com");
  await page.fill('input[name="password"]', "password123");
  await page.click("button:has-text('Sign In')");
  
  await expect(page).toHaveURL("/dashboard");
});
```

---

## Backend Stack

### Framework: Django 5.1+

**Why Django**:
- ✅ Batteries included (admin, migrations, ORM)
- ✅ Security-first (CSRF, SQL injection prevention)
- ✅ Mature (20+ years, production-proven)
- ✅ ORM powerful (complex queries, relationships)
- ✅ Signal system (audit logging, hooks)

**Version**: 5.1+ (latest LTS)

### API: Django REST Framework 3.15+

**Serializers** (data validation + transformation):
```python
from rest_framework import serializers
from .models import Lot

class LotSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lot
        fields = ["id", "date", "species", "weight", "status"]
        read_only_fields = ["id", "status"]
    
    def validate_weight(self, value):
        if value < 1 or value > 10000:
            raise serializers.ValidationError("Invalid weight")
        return value
```

**ViewSets** (CRUD + logic):
```python
from rest_framework.viewsets import ModelViewSet

class LotViewSet(ModelViewSet):
    serializer_class = LotSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Only return lots for this tenant
        return Lot.objects.filter(tenant_id=self.request.tenant_id)
    
    def perform_create(self, serializer):
        # Auto-assign tenant when creating
        serializer.save(tenant_id=self.request.tenant_id)
```

### Database: PostgreSQL 15+

**Why PostgreSQL**:
- ✅ Strong data integrity (constraints, transactions)
- ✅ JSONB for flexible schemas
- ✅ Full-text search
- ✅ Partial indexes (optimization)
- ✅ Open source, widely supported

**Version**: 15+ (modern features)

**Driver**: psycopg 3.2+
```python
# settings.py
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": "coldev_global",
        "USER": "postgres",
        "PASSWORD": os.getenv("DB_PASSWORD"),
        "HOST": os.getenv("DB_HOST"),
        "PORT": 5432,
        "ATOMIC_REQUESTS": True,  # Transaction per request
    }
}
```

### Authentication: JWT (djangorestframework-simplejwt)

**Why JWT**:
- ✅ Stateless (no session storage needed)
- ✅ Scalable (works with multiple servers)
- ✅ Mobile-friendly (token in header)
- ✅ Industry standard

**Implementation**:
```python
# settings.py
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=1),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ALGORITHM": "HS256",
    "SIGNING_KEY": settings.SECRET_KEY,
}

# views.py
from rest_framework_simplejwt.views import TokenObtainPairView

class LoginView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        # Add custom data to token
        response.data["user_id"] = request.user.id
        response.data["tenant_id"] = request.user.tenant_id
        return response
```

### Multitenancy: Custom db_router

**Pattern**:
```python
# utils/db_router.py
class TenantRouter:
    def db_for_read(self, model, **hints):
        if "tenant_id" in hints:
            return f"tenant_{hints['tenant_id']}"
        return "default"
    
    def db_for_write(self, model, **hints):
        if "tenant_id" in hints:
            return f"tenant_{hints['tenant_id']}"
        return "default"

# settings.py
DATABASE_ROUTERS = ["utils.db_router.TenantRouter"]

# Usage
from django.db import router
db = router.db_for_write(Lot, tenant_id=user.tenant_id)
Lot.objects.using(db).create(...)
```

### Testing: pytest + pytest-django

**Example unit test**:
```python
import pytest
from django.contrib.auth.models import User
from apps.quality.models import Lot

@pytest.mark.django_db
class TestLotCreation:
    def test_create_lot(self):
        user = User.objects.create_user("test@example.com", "password")
        lot = Lot.objects.create(
            tenant_id=user.tenant_id,
            date="2026-03-14",
            species="Anchoveta",
            weight=500,
        )
        assert lot.id is not None
        assert lot.status == "pending"
```

**Integration test**:
```python
@pytest.mark.django_db
def test_quality_api_endpoint(client, user):
    client.force_login(user)
    response = client.post(
        "/api/quality/results/",
        {
            "lot_id": 123,
            "pass": True,
        },
        content_type="application/json",
    )
    assert response.status_code == 201
    assert response.data["status"] == "verified"
```

---

## Infrastructure & DevOps

### Version Control: GitHub

```bash
# Workflow
git checkout -b feature/quality-validation
git commit -m "Add quality validation logic"
git push origin feature/quality-validation
# Create PR
# After review & tests: merge
```

### CI/CD: GitHub Actions

**Example workflow**:
```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: "3.11"
      - run: pip install -r requirements/test.txt
      - run: pytest --cov=apps/
      - run: npm install && npm run test
```

### Containerization: Docker

**Backend Dockerfile**:
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements/production.txt .
RUN pip install -r production.txt

COPY . .
EXPOSE 8000
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000"]
```

**Frontend Dockerfile**:
```dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package.json* pnpm-lock.yaml* ./
RUN npm install

COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY package.json .
EXPOSE 3000
CMD ["npm", "start"]
```

### Deployment

**Frontend**: Netlify (automatic from GitHub)
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = ".next"
[build.environment]
  NODE_VERSION = "18"
```

**Backend**: Railway or Fly.io
```toml
# fly.toml
[app]
  primary_region = "iad"
  [env]
    DATABASE_URL = "..."
    SECRET_KEY = "..."
[[services]]
  protocol = "tcp"
  internal_port = 8000
  external_port = 80
```

---

## Summary Table

| Layer | Technology | Version | Why |
|-------|-----------|---------|-----|
| **Frontend** | Next.js | 15.2.4 | Modern, SSR, built-in optimization |
| | React | 19 | Hooks, Suspense, modern patterns |
| | TypeScript | 5 | Type safety |
| | Tailwind CSS | 3.4.17 | Utility-first, rapid development |
| | shadcn/ui | Latest | Accessible, customizable components |
| **Backend** | Django | 5.1+ | Batteries included, security-first |
| | DRF | 3.15+ | REST API, serializers |
| | PostgreSQL | 15+ | Strong integrity, powerful |
| **DevOps** | Docker | Latest | Containerization |
| | GitHub Actions | Native | CI/CD |
| | Netlify | Latest | Frontend hosting |
| | Railway/Fly.io | Latest | Backend hosting |

---

**Last Updated**: 2026-03-14  
**Version**: 1.0
