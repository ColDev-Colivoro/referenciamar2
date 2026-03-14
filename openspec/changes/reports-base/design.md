# Design: reports-base

**Change**: reports-base  
**Status**: approved  
**Version**: 1.0

---

## Architecture Overview

No new database models are required. The feature is purely read-only aggregation over existing `Lot`, `QualityForm`, and `AuditEvent` tables.

A new thin Django app `apps/reports` is created with:
- No models
- Four APIViews
- One URL file

This keeps reporting logic isolated from `apps/quality` and `apps/audit`, following the same app-per-domain pattern already in the project.

---

## Key Decisions

### Decision 1: New `apps.reports` module (not adding to `apps/quality/`)

**Rationale**: Reporting is a separate concern from quality form CRUD. As reporting grows (additional endpoints, caching, permissions), it benefits from its own namespace. The cost (one new directory, one entry in `INSTALLED_APPS`) is minimal.

### Decision 2: All views use `get_request_membership` + `IsAuthenticated`

**Rationale**: Consistent with existing `apps/quality` and `apps/audit` view patterns. `get_request_membership` handles tenant resolution and active-membership check in one call. Views returning 403 when membership is `None` or inactive aligns with the established convention.

### Decision 3: Dashboard endpoint computes aggregations inline (no caching)

**Rationale**: At the scale of a single-tenant fishing QC platform, ORM aggregation queries are sub-millisecond. Introducing Redis or Django cache now is premature. The decision can be revisited if query time exceeds 200ms under load.

### Decision 4: Single `getDashboardStats()` call for dashboard page

**Rationale**: Four separate API calls (one per summary) would add latency and complexity to the frontend. A single `/api/v1/reports/dashboard/` endpoint returns everything needed for the dashboard page in one HTTP round-trip.

### Decision 5: `StatsCards` is purely presentational

**Rationale**: Decouples data-fetching from rendering. `useReports()` owns the network layer; `StatsCards` owns the UI. This makes the component easy to test, reuse, and mock.

---

## File Changes

### Backend

| File | Type | Description |
|------|------|-------------|
| `backend/apps/reports/__init__.py` | New | Empty — marks directory as Python package |
| `backend/apps/reports/apps.py` | New | `ReportsConfig(AppConfig)` with `name = "apps.reports"` |
| `backend/apps/reports/views.py` | New | Four `APIView` subclasses |
| `backend/apps/reports/urls.py` | New | URL patterns for four endpoints |
| `backend/config/urls.py` | Modified | `include("apps.reports.urls", namespace="reports")` at `/api/v1/reports/` |
| `backend/config/settings/base.py` | Modified | Add `"apps.reports"` to `INSTALLED_APPS` |
| `backend/tests/test_reports.py` | New | 6 test cases |

### Frontend

| File | Type | Description |
|------|------|-------------|
| `frontend/lib/reports/types.ts` | New | TypeScript interfaces |
| `frontend/lib/reports/api.ts` | New | `getDashboardStats()` fetch function |
| `frontend/hooks/use-reports.ts` | New | `useReports()` React hook |
| `frontend/components/dashboard/stats-cards.tsx` | New | Presentational 4-card component |

---

## Python Interfaces (Backend)

```python
# apps/reports/views.py — sketch of each view's get() logic

# LotSummaryView
from django.db.models import Count, Q
from datetime import date

def get_lot_summary(tenant):
    today = date.today()
    qs = Lot.objects.filter(tenant=tenant)
    return {
        "total": qs.count(),
        "this_month": qs.filter(
            entry_date__year=today.year,
            entry_date__month=today.month
        ).count(),
        "by_status": {
            "pending":    qs.filter(status="pending").count(),
            "in_process": qs.filter(status="in_process").count(),
            "approved":   qs.filter(status="approved").count(),
            "rejected":   qs.filter(status="rejected").count(),
        },
    }

# FormSummaryView
def get_form_summary(tenant):
    qs = QualityForm.objects.filter(tenant=tenant)
    by_type = {}
    for ft in QualityForm.FormType.values:
        by_type[ft] = qs.filter(form_type=ft).count()
    return {
        "total": qs.count(),
        "by_type": by_type,
        "by_status": {
            "draft":     qs.filter(status="draft").count(),
            "submitted": qs.filter(status="submitted").count(),
            "approved":  qs.filter(status="approved").count(),
            "rejected":  qs.filter(status="rejected").count(),
        },
    }

# ActivityView
def get_recent_activity(tenant):
    events = AuditEvent.objects.filter(tenant=tenant).select_related("actor")[:20]
    return [
        {
            "id": e.id,
            "action": e.action,
            "level": e.level,
            "actor": e.actor.username if e.actor else None,
            "created_at": e.created_at.isoformat(),
            "metadata": e.metadata,
        }
        for e in events
    ]

# DashboardView — combines all three
def get(self, request):
    membership = get_request_membership(request)
    if not membership:
        return Response({"detail": "No membership."}, status=403)
    tenant = membership.tenant
    return Response({
        "lot_summary":       get_lot_summary(tenant),
        "form_summary":      get_form_summary(tenant),
        "recent_activity":   get_recent_activity(tenant),
    })
```

---

## TypeScript Interfaces (Frontend)

```typescript
// frontend/lib/reports/types.ts

export interface LotByStatus {
  pending: number;
  in_process: number;
  approved: number;
  rejected: number;
}

export interface LotSummary {
  total: number;
  this_month: number;
  by_status: LotByStatus;
}

export interface FormByStatus {
  draft: number;
  submitted: number;
  approved: number;
  rejected: number;
}

export interface FormSummary {
  total: number;
  by_type: Record<string, number>;
  by_status: FormByStatus;
}

export interface ActivityEvent {
  id: number;
  action: string;
  level: string;
  actor: string | null;
  created_at: string;
  metadata: Record<string, unknown>;
}

export interface DashboardStats {
  lot_summary: LotSummary;
  form_summary: FormSummary;
  recent_activity: ActivityEvent[];
}
```

---

## URL Layout

```
/api/v1/reports/lots/summary/     → LotSummaryView   (GET)
/api/v1/reports/forms/summary/    → FormSummaryView  (GET)
/api/v1/reports/activity/         → ActivityView     (GET)
/api/v1/reports/dashboard/        → DashboardView    (GET)
```

---

## Test Plan (6 tests)

| # | Test | Assertion |
|---|------|-----------|
| 1 | `test_lot_summary_counts` | Correct `total`, `by_status`, `this_month` values |
| 2 | `test_lot_summary_unauthenticated` | Returns HTTP 401 |
| 3 | `test_form_summary_counts` | Correct `total`, `by_type`, `by_status` values |
| 4 | `test_activity_feed_limit` | Returns at most 20 items even when 25 exist |
| 5 | `test_dashboard_all_sections_present` | Response has `lot_summary`, `form_summary`, `recent_activity` keys |
| 6 | `test_cross_tenant_isolation` | Tenant A user cannot see Tenant B data |
