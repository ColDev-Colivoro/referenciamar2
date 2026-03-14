# Change Proposal: nav-consolidation

## Intent
Wire all real pages (`/dashboard/lots`, `/dashboard/audit`, `/dashboard/billing`, `/dashboard/lots/[id]/forms`) into the application navigation so users can reach them without typing URLs.

## Scope
- **DashboardNav component** — horizontal nav bar added to all standalone dashboard pages; role-aware visibility.
- **Dashboard home page** — create `/dashboard/page.tsx` that renders `<StatsCards>` with live data via `useReports()`.
- **Breadcrumb** — add "← Volver a Lotes" back-link to forms page.

## Out of scope
- Full sidebar/drawer redesign.
- Redesigning existing role-specific pages (manager, monitor, supervisor, quality-manager).
- Any backend changes.

## Affected files
- `frontend/components/layout/dashboard-nav.tsx` (new)
- `frontend/app/dashboard/page.tsx` (new)
- `frontend/app/dashboard/lots/page.tsx` (add nav)
- `frontend/app/dashboard/audit/page.tsx` (add nav)
- `frontend/app/dashboard/billing/page.tsx` (add nav)
- `frontend/app/dashboard/lots/[id]/forms/page.tsx` (add breadcrumb)
