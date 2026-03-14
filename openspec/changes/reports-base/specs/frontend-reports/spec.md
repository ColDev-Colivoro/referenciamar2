# Spec: Reports — Frontend

**Change**: reports-base  
**Domain**: frontend / reports  
**Version**: 1.0

---

## Requirements

### REQ-FR-01 — useReports() Hook

The system **MUST** provide a `useReports()` React hook in `frontend/hooks/use-reports.ts` that fetches `/api/v1/reports/dashboard/` and exposes the following interface:

```typescript
interface UseReportsResult {
  stats: DashboardStats | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}
```

The hook **MUST** call `getDashboardStats()` from `frontend/lib/reports/api.ts` on mount.  
The hook **MUST** set `isLoading: true` while the request is in flight and `isLoading: false` on completion.  
The hook **MUST** populate `error` with a human-readable message if the request fails; `stats` remains `null` on error.  
The hook **MUST** expose a `refresh()` function that re-triggers the fetch (useful for manual refresh buttons).  
The hook **MUST NOT** perform data fetching by itself — it **MUST** delegate to `getDashboardStats()`.

#### Scenario FR-01-A: Hook loads dashboard stats successfully

```
Given the API returns a valid DashboardStats response
When useReports() is called inside a React component
Then isLoading is true initially
And after the fetch completes, isLoading is false
And stats is populated with lot_summary, form_summary, recent_activity
And error is null
```

#### Scenario FR-01-B: Hook handles API error gracefully

```
Given the API returns HTTP 500
When useReports() is called
Then after the fetch completes, isLoading is false
And error is a non-empty string describing the failure
And stats remains null
```

---

### REQ-FR-02 — Stats Cards Component

The system **MUST** provide a `DashboardStats` presentational component in `frontend/components/dashboard/stats-cards.tsx` that renders **4 stat cards**:

| Card | Value Source | Label |
|------|-------------|-------|
| Total Lotes | `stats.lot_summary.total` | "Total Lotes" |
| Lotes Este Mes | `stats.lot_summary.this_month` | "Lotes Este Mes" |
| Formularios Enviados | `stats.form_summary.by_status.submitted` | "Formularios Enviados" |
| Formularios Aprobados | `stats.form_summary.by_status.approved` | "Formularios Aprobados" |

The component **MUST** accept `stats: DashboardStats` as a required prop.  
The component **MUST** be purely presentational — it **MUST NOT** fetch data or call any hooks internally.  
Each card **MUST** display a numeric value and a text label.  
When `stats` is loading (parent passes `null`), the component **MUST** render skeleton/placeholder cards (or the parent simply does not render the component).

#### Scenario FR-02-A: Stats cards render with valid data

```
Given stats = { lot_summary: { total: 10, this_month: 4, ... }, form_summary: { by_status: { submitted: 5, approved: 3, ... } }, ... }
When <StatsCards stats={stats} /> is rendered
Then 4 cards are visible
And the first card shows "10" with label "Total Lotes"
And the second card shows "4" with label "Lotes Este Mes"
And the third card shows "5" with label "Formularios Enviados"
And the fourth card shows "3" with label "Formularios Aprobados"
```

#### Scenario FR-02-B: Component does not fetch data

```
Given StatsCards is rendered with a static stats prop
Then no network requests are made by the component itself
And the component re-renders correctly when the stats prop changes
```

---

### REQ-FR-03 — Activity Feed Display

The system **MUST** provide UI to display the `recent_activity` array from the dashboard response. This can be embedded in the dashboard page or a sub-component.

Each activity item **MUST** display:
- `created_at` formatted as a human-readable local datetime
- `action` string (e.g., `lots.create`, `form.submit`)
- `actor` username (or "Sistema" if `null`)

The list **MUST** be ordered newest-first (matching the API response order).  
When `recent_activity` is empty, a "Sin actividad reciente" placeholder **MUST** be shown.

#### Scenario FR-03-A: Activity feed renders recent events

```
Given recent_activity contains 5 audit events
When the activity feed component is rendered with those events
Then 5 rows are displayed
And each row shows timestamp, action, and actor
And the most recent event appears first
```

#### Scenario FR-03-B: Empty activity feed shows placeholder

```
Given recent_activity is an empty array []
When the activity feed component is rendered
Then the text "Sin actividad reciente" is visible
And no event rows are rendered
```
