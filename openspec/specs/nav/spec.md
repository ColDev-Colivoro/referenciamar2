# Spec: Navigation Consolidation

## REQ-NAV-01 — Main Navigation links to all real pages with role-based visibility

The DashboardNav component MUST render links to `/dashboard/lots` (all roles), `/dashboard/audit` (global_admin and tenant_admin only), and `/dashboard/billing` (global_admin and tenant_admin only). Links MUST use the active pathname to highlight the current page.

### Scenario 1.1 — All-roles nav
Given a logged-in user with role `manager`,  
When the DashboardNav is rendered,  
Then the "Lotes" link is visible and "Auditoría"/"Facturación" are not rendered.

### Scenario 1.2 — Admin nav
Given a logged-in user with role `global_admin` or `tenant_admin`,  
When the DashboardNav is rendered,  
Then "Lotes", "Auditoría", and "Facturación" are all visible.

---

## REQ-NAV-02 — Dashboard Home shows StatsCards with real data

`/dashboard/page.tsx` MUST fetch dashboard stats via `useReports()` and render `<StatsCards stats={stats} />` once loaded. The page MUST show a loading state while fetching and an error message if the request fails.

### Scenario 2.1 — Stats loaded successfully
Given a valid session and working backend,  
When the user navigates to `/dashboard`,  
Then four stat cards are rendered with lot and form counts from the API.

### Scenario 2.2 — Stats loading state
Given a valid session and a slow backend,  
When the dashboard page is mounted,  
Then a loading indicator is shown until `isLoading` becomes false.

---

## REQ-NAV-03 — No nav item points to a 404 or mock page

Every link in DashboardNav MUST resolve to an existing `page.tsx` route. The forms page MUST include a back-link to `/dashboard/lots`.

### Scenario 3.1 — Forms breadcrumb
Given a user on `/dashboard/lots/42/forms`,  
When they click "← Volver a Lotes",  
Then they are navigated to `/dashboard/lots`.

### Scenario 3.2 — Nav links resolve
Given any rendered DashboardNav,  
When each link href is followed,  
Then a Next.js route file exists for that path (no 404).
