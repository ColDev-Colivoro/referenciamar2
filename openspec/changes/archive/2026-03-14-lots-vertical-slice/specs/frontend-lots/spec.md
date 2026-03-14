# Frontend Lots UI Specification

## Purpose

Define the behavior of the Lot management UI for ColdevConAC. This spec covers the
`useLots` data hook, lot list display, lot creation form, status badge component,
and authorization-aware rendering — all wired to the real `/api/v1/lots/` API.

The existing `lot-management.tsx` mock (with hardcoded statuses `active`,
`processing`, `completed`, `on-hold`) MUST be refactored to use the canonical domain
statuses: `pending`, `in_process`, `approved`, `rejected`.

---

## Requirements

### Requirement: useLots() Hook

The system MUST provide a `useLots()` hook (at `frontend/hooks/useLots.ts`) that
encapsulates all communication with the `/api/v1/lots/` API.

The hook MUST expose:
- `lots` — the current array of lot objects (empty array while loading)
- `isLoading` — boolean; `true` while a fetch is in flight
- `error` — string or `null`; set when the API returns a non-2xx response
- `createLot(data)` — sends `POST /api/v1/lots/` and refreshes the lot list on success
- `updateLot(id, data)` — sends `PATCH /api/v1/lots/{id}/` and refreshes on success
- `changeLotStatus(id, status)` — sends `PATCH /api/v1/lots/{id}/status/` and
  refreshes on success

The hook MUST include the DRF auth token from `AuthContext` in every request via the
`Authorization: Token <key>` header.

The hook SHOULD return `error` as a human-readable string derived from the API
response body when available.

#### Scenario: Hook loads lots on mount

- GIVEN the user is authenticated and the hook is rendered inside a component
- WHEN the component mounts
- THEN `isLoading` is `true` during the fetch
- AND once the fetch resolves, `isLoading` becomes `false`
- AND `lots` is populated with the data returned by the API

#### Scenario: Hook exposes error when API fails

- GIVEN the API returns HTTP 500 or a network error occurs
- WHEN `useLots()` performs the initial fetch
- THEN `isLoading` becomes `false`
- AND `error` is set to a non-null string
- AND `lots` remains an empty array

#### Scenario: createLot refreshes the list on success

- GIVEN the hook is mounted and `lots` has 3 items
- WHEN `createLot({species: "Salmon", origin: "Chiloé", entry_date: "2024-06-01", quantity_kg: 200})` is called
- THEN a `POST /api/v1/lots/` request is sent with the auth token
- AND after the API responds with HTTP 201, the lot list is refreshed
- AND `lots` now contains 4 items

#### Scenario: createLot sets error on validation failure

- GIVEN the API returns HTTP 400 with a field error
- WHEN `createLot({species: ""})` is called with an invalid body
- THEN `error` is set to a non-null string describing the problem
- AND `lots` is not modified

---

### Requirement: Lot List Display

The system MUST display all lots returned by `useLots()` in a tabular layout with
the following columns: **Código**, **Especie**, **Origen**, **Fecha Entrada**,
**Cantidad (Kg)**, **Estado**.

The system MUST show a loading indicator while `isLoading` is `true`.

The system MUST show an error message when `error` is non-null.

The system MUST show an empty-state message when `lots` is an empty array and
`isLoading` is `false`.

#### Scenario: Lots are displayed once loaded

- GIVEN `useLots()` returns 4 lots with no error
- WHEN the Lot List component renders
- THEN a table row is shown for each of the 4 lots
- AND each row displays `code`, `species`, `origin`, `entry_date`, `quantity_kg`,
  and the `LotStatusBadge`

#### Scenario: Loading state shows indicator

- GIVEN `useLots()` has `isLoading: true`
- WHEN the Lot List component renders
- THEN a visual loading indicator is displayed
- AND no lot rows are rendered

#### Scenario: Empty state is shown when no lots exist

- GIVEN `useLots()` returns an empty array with `isLoading: false` and no error
- WHEN the Lot List component renders
- THEN an empty-state message is displayed (e.g., "No hay lotes registrados")

---

### Requirement: Create Lot Form

The system MUST provide a form (inside a Shadcn `Dialog` modal) for creating a new
lot. The form MUST contain the following fields:
`code` (optional), `species` (required), `origin` (required),
`entry_date` (required, date picker), `quantity_kg` (required, numeric).

The system MUST validate required fields client-side before submitting.

The system MUST call `useLots().createLot(data)` on form submit.

The system MUST close the modal and refresh the list on successful creation.

The system MUST display a field-level error message for each validation failure
returned by the API.

#### Scenario: Valid form submission creates a lot

- GIVEN the Create Lot modal is open
- AND all required fields are filled with valid values
- WHEN the user submits the form
- THEN `createLot(data)` is called with the form values
- AND the modal closes on success
- AND the new lot appears in the lot list without a full page reload

#### Scenario: Missing required field prevents submission

- GIVEN the Create Lot modal is open
- AND `species` is left empty
- WHEN the user attempts to submit the form
- THEN the form does NOT call `createLot`
- AND an inline error message is displayed next to the `species` field

#### Scenario: API validation error displays field errors

- GIVEN the form is submitted with valid client-side data
- AND the API returns HTTP 400 with `{code: ["Este código ya existe."]} `
- WHEN the error response is received
- THEN the modal remains open
- AND the error message "Este código ya existe." is displayed next to the `code` field

---

### Requirement: Status Badge

The system MUST provide a `LotStatusBadge` component (at
`frontend/components/lots/LotStatusBadge.tsx`) that renders a color-coded badge
based on the lot's `status` value.

The color mapping MUST be:
- `pending` → yellow (`bg-yellow-100 text-yellow-700`)
- `in_process` → blue (`bg-blue-100 text-blue-700`)
- `approved` → green (`bg-green-100 text-green-700` / `bg-emerald-100 text-emerald-700`)
- `rejected` → red (`bg-red-100 text-red-700`)

The badge MUST display a human-readable Spanish label for each status:
`pending` → "Pendiente", `in_process` → "En Proceso",
`approved` → "Aprobado", `rejected` → "Rechazado".

The component MUST NOT use the legacy mock statuses (`active`, `processing`,
`completed`, `on-hold`).

#### Scenario: Badge renders correct color for each status

- GIVEN a `LotStatusBadge` is rendered with `status="pending"`
- THEN the badge has yellow styling and displays "Pendiente"

- GIVEN a `LotStatusBadge` is rendered with `status="in_process"`
- THEN the badge has blue styling and displays "En Proceso"

- GIVEN a `LotStatusBadge` is rendered with `status="approved"`
- THEN the badge has green styling and displays "Aprobado"

- GIVEN a `LotStatusBadge` is rendered with `status="rejected"`
- THEN the badge has red styling and displays "Rechazado"

#### Scenario: Badge handles unknown status gracefully

- GIVEN a `LotStatusBadge` is rendered with an unrecognized status value
- THEN the badge renders with neutral gray styling
- AND does NOT throw a runtime error

---

### Requirement: Authorization-aware UI

The system MUST hide the "Nuevo Lote" button and Create Lot form from users whose
role does not permit lot creation.

Write-capable roles MUST be: `manager`, `tenant_admin`, `global_admin`,
`quality_manager`.

Read-only roles (`monitor`, `production_supervisor`) MUST NOT see any create or
update controls.

The system MUST derive the user's role from `AuthContext` (the same context that
provides the auth token).

The system MUST NOT rely on API 403 responses alone as the mechanism for hiding UI
elements — the check MUST happen before rendering.

#### Scenario: Manager sees the create button

- GIVEN a user with role `manager` is authenticated
- WHEN the Lots page renders
- THEN the "Nuevo Lote" button is visible
- AND the Create Lot modal can be opened

#### Scenario: Monitor does not see write controls

- GIVEN a user with role `monitor` is authenticated
- WHEN the Lots page renders
- THEN the "Nuevo Lote" button is NOT rendered
- AND there is no way to open the Create Lot form

#### Scenario: UI respects role from AuthContext without additional API call

- GIVEN the AuthContext provides `{role: "production_supervisor"}`
- WHEN the Lots page renders
- THEN write controls are hidden immediately
- AND no additional authorization API call is made
