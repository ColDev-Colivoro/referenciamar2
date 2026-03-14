# Spec: Quality Control Forms — Backend

**Change**: forms-vertical-slice  
**Domain**: quality / forms  
**Version**: 1.0

---

## Requirements

### REQ-F-01 — QualityForm Model

The system **MUST** persist a `QualityForm` entity with the following fields:

| Field | Type | Constraints |
|-------|------|------------|
| `id` | auto PK | — |
| `tenant` | FK → `core.TenantRegistry` | CASCADE, not null |
| `lot` | FK → `quality.Lot` | CASCADE, not null |
| `form_type` | `CharField(max_length=50)` | `TextChoices`, see valid values |
| `status` | `CharField(max_length=20)` | `TextChoices`: draft / submitted / approved / rejected; default `draft` |
| `filled_by` | FK → `AUTH_USER_MODEL` | SET_NULL, nullable |
| `submitted_at` | `DateTimeField` | nullable, blank |
| `created_at` | `DateTimeField` | auto_now_add |
| `updated_at` | `DateTimeField` | auto_now |

Valid `form_type` values: `recepcion_materia_prima`, `control_organoleptico`, `control_temperatura`, `control_peso`.

The status machine **MUST** enforce: `draft → submitted → approved` and `draft → submitted → rejected`. Direct transitions to `approved`/`rejected` from `draft` are **PROHIBITED**.

#### Scenarios

**Scenario F-01-A: Create QualityForm with valid data**

```
Given a valid Lot and Tenant exist
When a QualityForm is created with form_type="recepcion_materia_prima" and status="draft"
Then the record is persisted with submitted_at=null and created_at set automatically
```

**Scenario F-01-B: Invalid status transition is rejected**

```
Given a QualityForm with status="draft"
When a PATCH attempts to set status="approved" directly (skipping submitted)
Then the serializer returns HTTP 400 with a transition error message
```

---

### REQ-F-02 — FormField Model

The system **MUST** persist `FormField` entities as children of `QualityForm` with the following fields:

| Field | Type | Constraints |
|-------|------|------------|
| `id` | auto PK | — |
| `quality_form` | FK → `QualityForm` | CASCADE, not null |
| `field_name` | `CharField(max_length=100)` | not blank |
| `field_type` | `CharField(max_length=20)` | choices: text / number / boolean / select |
| `value` | `TextField` | blank allowed (not on submit) |
| `unit` | `CharField(max_length=30)` | optional, blank=True |
| `ordering` | `PositiveIntegerField` | default 0 |

On **submit** (status `draft → submitted`), all `FormField.value` entries **MUST** be non-empty; otherwise HTTP 400 is returned.

#### Scenarios

**Scenario F-02-A: FormField created inline with QualityForm**

```
Given a POST body with "fields": [{"field_name": "temperatura", "field_type": "number", "value": "3.5", "unit": "°C", "ordering": 1}]
When the endpoint creates the QualityForm
Then FormField rows are created atomically within the same transaction
And rollback occurs if any field is invalid
```

**Scenario F-02-B: Submit blocked when fields have empty values**

```
Given a QualityForm in status="draft" with a FormField where value=""
When a PATCH sets status="submitted"
Then HTTP 400 is returned with detail listing which fields are empty
```

---

### REQ-F-03 — List Forms per Lot

`GET /api/v1/lots/{lot_id}/forms/`

- **MUST** require `TokenAuthentication` + `IsAuthenticated`
- **MUST** filter by `lot_id` AND `tenant` (from membership)
- **MUST** return 401 if no membership; 404 if lot not found or belongs to another tenant
- **MUST** return empty list (not 404) when lot has no forms
- Response **MUST** include nested `fields` array

#### Scenarios

**Scenario F-03-A: List forms for existing lot**

```
Given an authenticated user with valid membership
And a Lot belonging to that tenant has 2 QualityForms
When GET /api/v1/lots/{lot_id}/forms/
Then HTTP 200 is returned with a list of 2 form objects each containing a "fields" array
```

**Scenario F-03-B: List forms for lot of another tenant returns 404**

```
Given an authenticated user belonging to Tenant A
And a Lot belonging to Tenant B
When GET /api/v1/lots/{lot_id}/forms/ using the Tenant B lot_id
Then HTTP 404 is returned
```

---

### REQ-F-04 — Create Form

`POST /api/v1/lots/{lot_id}/forms/`

- **MUST** create `QualityForm` + all `FormField` rows in a single `transaction.atomic()` block
- `form_type` **MUST** be one of the valid TextChoices values
- The referenced `lot` **MUST** belong to the request's tenant
- Initial `status` is always `draft` (client cannot set status on creation)
- **MUST** log audit event `form.create`
- **MUST** return HTTP 201 with full form + fields representation

#### Scenarios

**Scenario F-04-A: Successful form creation**

```
Given an authenticated user with valid membership
And a valid Lot belonging to the same tenant
When POST /api/v1/lots/{lot_id}/forms/ with valid form_type and fields array
Then HTTP 201 is returned
And QualityForm.status == "draft"
And FormField rows are persisted
And audit event "form.create" is logged
```

**Scenario F-04-B: Creation with invalid form_type is rejected**

```
Given an authenticated user with valid membership
When POST /api/v1/lots/{lot_id}/forms/ with form_type="unknown_type"
Then HTTP 400 is returned with a form_type validation error
```

---

### REQ-F-05 — Get Form Detail

`GET /api/v1/lots/{lot_id}/forms/{form_id}/`

- **MUST** return HTTP 200 with full form + fields if found within tenant scope
- **MUST** return HTTP 404 if `form_id` does not exist, belongs to another lot, or belongs to another tenant

#### Scenarios

**Scenario F-05-A: Get existing form**

```
Given a QualityForm with id=42 belonging to the correct lot and tenant
When GET /api/v1/lots/{lot_id}/forms/42/
Then HTTP 200 is returned with the form object including "fields" list
```

**Scenario F-05-B: Get form from wrong lot returns 404**

```
Given a QualityForm belonging to Lot A
When GET /api/v1/lots/{lot_b_id}/forms/{form_id}/ (wrong lot in URL)
Then HTTP 404 is returned
```

---

### REQ-F-06 — Submit Form

`PATCH /api/v1/lots/{lot_id}/forms/{form_id}/status/` with `{"status": "submitted"}`

- Transition **MUST** only allow `draft → submitted`
- All `FormField.value` entries **MUST** be non-empty before transition is accepted
- **MUST** set `submitted_at = now()` on success
- **MUST** log audit event `form.submit`
- Any authenticated tenant member **MAY** submit (no elevated role required)

#### Scenarios

**Scenario F-06-A: Successful draft → submitted transition**

```
Given a QualityForm in status="draft" with all fields having non-empty values
When PATCH status/ {"status": "submitted"} by any authenticated tenant member
Then HTTP 200 is returned with status="submitted" and submitted_at is set
And audit event "form.submit" is logged
```

**Scenario F-06-B: Submit with empty field values is rejected**

```
Given a QualityForm in status="draft" with at least one FormField.value=""
When PATCH status/ {"status": "submitted"}
Then HTTP 400 is returned listing the empty fields
```

---

### REQ-F-07 — Approve / Reject Form

`PATCH /api/v1/lots/{lot_id}/forms/{form_id}/status/` with `{"status": "approved"}` or `{"status": "rejected"}`

- Transition **MUST** only allow `submitted → approved` or `submitted → rejected`
- **MUST** require role in `{quality_manager, manager, tenant_admin, global_admin}`
- **MUST** log audit event `form.approve` or `form.reject` respectively

#### Scenarios

**Scenario F-07-A: quality_manager approves submitted form**

```
Given a QualityForm in status="submitted"
And the requesting user has role="quality_manager"
When PATCH status/ {"status": "approved"}
Then HTTP 200 is returned with status="approved"
And audit event "form.approve" is logged
```

**Scenario F-07-B: Inspector role cannot approve**

```
Given a QualityForm in status="submitted"
And the requesting user has role="inspector"
When PATCH status/ {"status": "approved"}
Then HTTP 403 is returned
```

---

### REQ-F-08 — Form Authorization

- Any active tenant member (any role) **MAY** call `GET` and `POST` on the forms list
- Any active tenant member **MAY** call `PATCH status/` with `{"status": "submitted"}`
- Only roles `quality_manager`, `manager`, `tenant_admin`, `global_admin` **MAY** call `PATCH status/` with `{"status": "approved" | "rejected"}`
- Cross-tenant access **MUST** return 404 (not 403) to avoid information leakage

#### Scenarios

**Scenario F-08-A: Inspector can list and create forms**

```
Given a user with role="inspector" and valid membership
When GET /api/v1/lots/{lot_id}/forms/
Then HTTP 200 is returned (no 403)
```

**Scenario F-08-B: Cross-tenant form access is opaque**

```
Given User A in Tenant A attempts to access a form from Tenant B
When GET /api/v1/lots/{lot_id}/forms/{form_id}/ where lot belongs to Tenant B
Then HTTP 404 is returned (not 403)
```
