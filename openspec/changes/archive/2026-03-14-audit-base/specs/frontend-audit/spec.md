# Frontend Audit Specification — ColdevConAC

## Purpose

Define the behavior of the Audit frontend module for ColdevConAC. This spec covers
the `useAudit()` hook for data fetching, the read-only Audit Log Table component,
the filter controls, and the authorization guard that restricts access to
`global_admin` and `tenant_admin` roles.

The Audit page is a read-only administrative view. It MUST NOT provide any
mutation interface. All data originates from `GET /api/v1/audit/`.

---

## Requirements

### Requirement: useAudit() Hook

The system MUST provide a `useAudit()` hook at `frontend/hooks/use-audit.ts` that
loads audit events from `GET /api/v1/audit/`.

The hook MUST expose the following interface:
- `events` — array of `AuditEvent` objects (empty array while loading or on error)
- `isLoading` — boolean, `true` while the request is in flight
- `error` — error object or `null`
- `refresh` — function that re-triggers the API call

The hook MUST accept an optional `params` object with filter keys: `action`,
`level`, `date_from`, `date_to`. Changing `params` MUST trigger a new API call.

The hook MUST include the authentication token from the session in the request.

#### Scenario: Hook loads events on mount

- GIVEN a `global_admin` user is authenticated
- AND the API returns a paginated response with 10 events
- WHEN the component using `useAudit()` mounts
- THEN `isLoading` is `true` initially
- AND after the request completes, `isLoading` is `false`
- AND `events` contains the 10 returned events
- AND `error` is `null`

#### Scenario: Hook exposes error state on API failure

- GIVEN the API call to `GET /api/v1/audit/` returns HTTP 500
- WHEN `useAudit()` is used in a component
- THEN `isLoading` becomes `false`
- AND `error` is a non-null error object
- AND `events` remains an empty array

#### Scenario: Changing filter params triggers a new API call

- GIVEN `useAudit()` has already fetched events with no filters
- WHEN `params` is updated to `{ action: "lots.create" }`
- THEN a new API call is made with `?action=lots.create` in the query string
- AND `events` is updated with the filtered results

#### Scenario: refresh() re-fetches data

- GIVEN `useAudit()` has loaded events
- WHEN `refresh()` is called
- THEN a new API call is triggered
- AND `events` is updated with the latest response

---

### Requirement: Audit Log Table

The system MUST provide an Audit Log Table component on
`frontend/app/dashboard/audit/page.tsx` that displays audit events in a tabular
format.

The table MUST include the following columns: `created_at` (formatted timestamp),
`actor_email`, `action`, `level`, `metadata` (collapsed or truncated).

The table MUST be paginated or vertically scrollable to handle large result sets.
The table MUST be read-only — no edit, delete, or status-change controls.

When `isLoading` is `true`, the table MUST display a loading skeleton or spinner.
When `events` is empty and `error` is `null`, the table MUST display an empty
state message.

#### Scenario: Table renders events with all required columns

- GIVEN `useAudit()` returns 5 events
- WHEN the Audit Log page renders
- THEN 5 rows are displayed in the table
- AND each row contains `created_at`, `actor_email`, `action`, `level`, and `metadata`
- AND no edit or delete controls are present

#### Scenario: Table shows loading state while data is fetching

- GIVEN `useAudit()` has `isLoading=true`
- WHEN the Audit Log page renders
- THEN a loading skeleton or spinner is visible
- AND no event rows are shown

#### Scenario: Table shows empty state when no events exist

- GIVEN `useAudit()` returns an empty `events` array and `error=null`
- WHEN the Audit Log page renders
- THEN an empty-state message is displayed
- AND no rows or error messages are shown

#### Scenario: Table shows error state on API failure

- GIVEN `useAudit()` has `error` set to a non-null value
- WHEN the Audit Log page renders
- THEN an error message is displayed to the user
- AND the table does not attempt to render rows

---

### Requirement: Filters

The system MUST provide filter controls on the Audit Log page that allow the user
to narrow events by: action type, level, date range (`date_from`, `date_to`).

Applying any filter MUST trigger a new API call via `useAudit(params)` with the
updated filter values.

Filter controls MUST be cleared/reset individually or all at once. Clearing a
filter MUST remove its query parameter from the next API call.

#### Scenario: Filtering by action type updates the displayed events

- GIVEN the Audit Log page is rendered with unfiltered events
- WHEN the user selects `"lots.create"` from the action filter
- THEN `useAudit` is called with `params={ action: "lots.create" }`
- AND the table displays only events with `action="lots.create"`

#### Scenario: Filtering by date range narrows results

- GIVEN the Audit Log page is rendered
- WHEN the user sets `date_from=2024-01-01` and `date_to=2024-06-30`
- THEN `useAudit` is called with `params={ date_from: "2024-01-01", date_to: "2024-06-30" }`
- AND the table displays only events within that date range

#### Scenario: Clearing a filter restores unfiltered results

- GIVEN the action filter is set to `"lots.create"` and the table shows filtered results
- WHEN the user clears the action filter
- THEN `useAudit` is called with no `action` parameter
- AND the table displays events of all action types

#### Scenario: Applying multiple filters compounds the query

- GIVEN the Audit Log page is rendered
- WHEN the user sets `level="warning"` and `date_from="2024-03-01"`
- THEN the API call includes both `?level=warning&date_from=2024-03-01`
- AND only events matching both criteria are shown

---

### Requirement: Authorization Guard

The Audit Log page MUST be accessible only to users with role `global_admin` or
`tenant_admin`. All other authenticated roles MUST be redirected to `/dashboard`
or shown an HTTP 403 / access-denied view.

The guard MUST run before any data fetching occurs. If the user's role is not
authorized, the API MUST NOT be called.

Unauthenticated users MUST be redirected to the login page.

#### Scenario: global_admin accesses the audit page

- GIVEN a user with role `global_admin` is authenticated
- WHEN they navigate to `/dashboard/audit`
- THEN the Audit Log page renders successfully
- AND `useAudit()` is called to fetch events

#### Scenario: tenant_admin accesses the audit page

- GIVEN a user with role `tenant_admin` is authenticated
- WHEN they navigate to `/dashboard/audit`
- THEN the Audit Log page renders successfully
- AND `useAudit()` is called to fetch events

#### Scenario: monitor role is redirected or shown 403

- GIVEN a user with role `monitor` is authenticated
- WHEN they navigate to `/dashboard/audit`
- THEN the user is redirected to `/dashboard` or sees an access-denied view
- AND `useAudit()` is NOT called

#### Scenario: manager role is redirected or shown 403

- GIVEN a user with role `manager` is authenticated
- WHEN they navigate to `/dashboard/audit`
- THEN the user is redirected to `/dashboard` or sees an access-denied view
- AND `useAudit()` is NOT called

#### Scenario: Unauthenticated user is redirected to login

- GIVEN the user has no active session
- WHEN they navigate to `/dashboard/audit`
- THEN the user is redirected to the login page
- AND `useAudit()` is NOT called
