# Spec: Quality Control Forms — Frontend

**Change**: forms-vertical-slice  
**Domain**: frontend-forms  
**Version**: 1.0

---

## Requirements

### REQ-FE-01 — `useForms(lotId)` Hook

The system **MUST** provide a React hook `useForms(lotId: number)` that:

- Fetches forms for the given `lotId` on mount and on explicit refresh
- Exposes: `forms`, `isLoading`, `error`, `createForm`, `submitForm`, `refresh`
- `createForm(input: CreateFormInput): Promise<QualityForm>` calls `POST /api/v1/lots/{lotId}/forms/`
- `submitForm(formId: number): Promise<QualityForm>` calls `PATCH /api/v1/lots/{lotId}/forms/{formId}/status/` with `{status: "submitted"}`
- On success, the `forms` array **MUST** update without requiring a full page reload

#### Scenarios

**Scenario FE-01-A: Hook loads forms on mount**

```
Given a lotId is passed to useForms()
When the component mounts
Then isLoading is true initially
And forms is populated with the API response when loading completes
And error is null on success
```

**Scenario FE-01-B: createForm updates local state**

```
Given useForms(lotId) is mounted and forms has 0 items
When createForm({ form_type: "control_temperatura", fields: [...] }) is called
Then the new form is appended to forms without requiring a full page reload
```

---

### REQ-FE-02 — Form List Display

The `forms/page.tsx` page **MUST**:

- Show a table/list of all forms for the current lot
- Each row **MUST** display: `form_type` (human label), `status` badge, `filled_by` username, `submitted_at` (formatted or "—")
- Show "No hay formularios" empty state when the list is empty
- Show a spinner while `isLoading` is true
- Show an error message when `error` is non-null

#### Scenarios

**Scenario FE-02-A: Populated form list**

```
Given useForms returns 3 forms
When the page renders
Then a table with 3 rows is visible
And each row shows form_type label, status badge, filled_by, submitted_at
```

**Scenario FE-02-B: Empty state**

```
Given useForms returns an empty array
When the page renders
Then "No hay formularios" text is displayed
And no table rows are rendered
```

---

### REQ-FE-03 — Create Form Modal

A create form modal **MUST**:

- Allow the user to select `form_type` from the predefined list (human-readable labels in Spanish)
- Render a set of fields appropriate to the selected type
- Enforce client-side required validation: all fields with `field_type !== "boolean"` must have non-empty `value` before submit is enabled
- Call `createForm(input)` on submission
- Show loading state on the submit button during the API call
- Close on success; display inline error on API failure

#### Scenarios

**Scenario FE-03-A: Successful form creation**

```
Given the user opens the create modal and selects form_type="control_temperatura"
And fills all required field values
When the user clicks "Guardar"
Then createForm() is called with correct payload
And the modal closes on success
And the new form appears in the list
```

**Scenario FE-03-B: Client-side validation blocks empty submit**

```
Given the user opens the create modal and selects a form_type
And leaves at least one required field empty
When the user clicks "Guardar"
Then createForm() is NOT called
And a validation error is shown inline
```

---

### REQ-FE-04 — Form Status Badge

A `FormStatusBadge` component **MUST** render a colored pill badge for each status value:

| Status | Color |
|--------|-------|
| `draft` | gray |
| `submitted` | blue |
| `approved` | green |
| `rejected` | red |

The component **MUST** accept a `status: FormStatus` prop and render the Spanish label:

| Status | Label |
|--------|-------|
| `draft` | Borrador |
| `submitted` | Enviado |
| `approved` | Aprobado |
| `rejected` | Rechazado |

#### Scenarios

**Scenario FE-04-A: Badge renders correct color per status**

```
Given FormStatusBadge receives status="approved"
When rendered
Then a green-colored pill with text "Aprobado" is displayed
```

**Scenario FE-04-B: Badge renders all four statuses without error**

```
Given each of [draft, submitted, approved, rejected] is passed to FormStatusBadge
When rendered
Then each renders without throwing and shows the correct Spanish label and color
```

---

### REQ-FE-05 — Authorization-Aware UI

The forms page **MUST**:

- Show "Aprobar" and "Rechazar" buttons only when the current session user has role in `{quality_manager, manager, tenant_admin, global_admin}`
- Show "Enviar" button for any authenticated user (no role restriction)
- Hide action buttons entirely when the form is already in `approved` or `rejected` status

#### Scenarios

**Scenario FE-05-A: quality_manager sees approve/reject buttons**

```
Given the session user has role="quality_manager"
And a form with status="submitted" is displayed
When the page renders
Then "Aprobar" and "Rechazar" buttons are visible
```

**Scenario FE-05-B: inspector does not see approve/reject buttons**

```
Given the session user has role="inspector"
And a form with status="submitted" is displayed
When the page renders
Then "Aprobar" and "Rechazar" buttons are NOT rendered
And "Enviar" button is visible if the form is in draft status
```
