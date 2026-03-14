# Technical Design: nav-consolidation

## Architecture Decision

**No new layout wrapping.** Existing role-specific pages (manager, monitor, etc.) already embed `MainLayout` inside their page component. Adding a Next.js `dashboard/layout.tsx` would double-wrap them. Instead, we add a `DashboardNav` component that standalone pages import directly.

## Files to Create

### `frontend/components/layout/dashboard-nav.tsx`
- `"use client"` component
- Imports `useSession`, `usePathname`, `Link`
- Admin-only links hidden for non-admin roles (check `session.user.role`)
- Tailwind horizontal bar, active link highlighted with `font-semibold underline`

### `frontend/app/dashboard/page.tsx`
- `"use client"` component
- Wraps with `MainLayout` (same pattern as `manager-page.tsx`)
- Uses `useReports()` → renders `<StatsCards stats={stats} />` when loaded
- Shows spinner while loading, error div on failure

## Files to Modify

### `frontend/app/dashboard/lots/page.tsx`
- Add `import { DashboardNav } from "@/components/layout/dashboard-nav"` 
- Prepend `<DashboardNav />` inside the outermost `<div>`

### `frontend/app/dashboard/audit/page.tsx`
- Same as lots — add `DashboardNav` at top

### `frontend/app/dashboard/billing/page.tsx`
- Same as lots — add `DashboardNav` at top

### `frontend/app/dashboard/lots/[id]/forms/page.tsx`
- Add `import Link from "next/link"`
- Add `<Link href="/dashboard/lots">← Volver a Lotes</Link>` before the header div

## Role Check Pattern
Uses the same `Set`-based pattern already present in each page:
```ts
const ADMIN_ROLES = new Set(["global_admin", "tenant_admin"])
const isAdmin = session ? ADMIN_ROLES.has(session.user.role) : false
```
