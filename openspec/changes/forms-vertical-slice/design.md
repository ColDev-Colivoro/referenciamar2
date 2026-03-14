# Design: forms-vertical-slice

**Change**: forms-vertical-slice  
**Version**: 1.0

---

## Architecture Decisions

### ADR-01 — Models in existing `apps.quality`

**Decision**: Add `QualityForm` and `FormField` to `backend/apps/quality/models.py` rather than creating a new Django app.

**Rationale**: The `Lot` model already lives in `apps.quality`. Forms are quality-control artifacts directly coupled to lots. A separate app would require cross-app FKs and extra wiring with no benefit at current scale.

---

### ADR-02 — Nested URL routing under lots

**Decision**: Mount form routes under `lots/<lot_id>/forms/`.

**Rationale**: Forms are lot-scoped resources. Nesting the route encodes the ownership relationship, eliminates the need for a redundant `lot_id` body field, and mirrors REST conventions for sub-resources.

```
GET    /api/v1/lots/{lot_id}/forms/                → list
POST   /api/v1/lots/{lot_id}/forms/                → create
GET    /api/v1/lots/{lot_id}/forms/{form_id}/      → detail
PATCH  /api/v1/lots/{lot_id}/forms/{form_id}/status/ → status transition
```

---

### ADR-03 — Single-POST nested field creation

**Decision**: `QualityFormCreateSerializer` accepts a `fields` array and creates all `FormField` rows inside `transaction.atomic()` via `FormField.objects.bulk_create()`.

**Rationale**: Avoids a multi-step API (create form, then POST each field) which is fragile and harder to test. Atomic write ensures no orphan form with missing fields.

```python
def create(self, validated_data):
    fields_data = validated_data.pop("fields", [])
    with transaction.atomic():
        form = QualityForm.objects.create(**validated_data)
        FormField.objects.bulk_create([
            FormField(quality_form=form, **f) for f in fields_data
        ])
    return form
```

---

### ADR-04 — Status machine enforced in serializer

**Decision**: `QualityFormStatusSerializer.validate()` checks allowed transitions before saving.

**Rationale**: Keeps business logic out of the view (thin view pattern already established by Lot). Centralizes the transition table in one place.

```
ALLOWED_TRANSITIONS = {
    "draft":     {"submitted"},
    "submitted": {"approved", "rejected"},
    "approved":  set(),
    "rejected":  set(),
}
```

---

### ADR-05 — Approve/Reject role check in view

**Decision**: Role check (`quality_manager`, `manager`, `tenant_admin`, `global_admin`) is performed in `FormStatusView.patch()` before calling the serializer, consistent with how `lot_can_write` works in `LotStatusView`.

---

## File Changes

| File | Type | Description | Status |
|------|------|-------------|--------|
| `backend/apps/quality/models.py` | MODIFY | Add `QualityForm`, `FormField` | ✅ Implemented |
| `backend/apps/quality/migrations/0003_add_quality_form.py` | CREATE | Migration for new models | ✅ Implemented |
| `backend/apps/quality/serializers.py` | MODIFY | Add `FormFieldSerializer`, `QualityFormSerializer`, `QualityFormCreateSerializer`, `QualityFormStatusSerializer` | ✅ Implemented |
| `backend/apps/quality/views.py` | MODIFY | Add `FormListCreateView`, `FormDetailView`, `FormStatusView`; helper `_get_form_or_404` | ✅ Implemented |
| `backend/apps/quality/urls.py` | MODIFY | Include form routes under `<int:lot_id>/forms/` | ✅ Implemented |
| `backend/apps/quality/tests/test_forms.py` | CREATE | Backend unit + integration tests | ✅ Implemented |
| `frontend/lib/forms/types.ts` | CREATE | TypeScript types | ✅ Implemented |
| `frontend/lib/forms/api.ts` | CREATE | API client functions | ✅ Implemented |
| `frontend/hooks/use-forms.ts` | CREATE | `useForms(lotId)` React hook | ✅ Implemented |
| `frontend/components/forms/form-status-badge.tsx` | CREATE | Status badge component | ✅ Implemented |
| `frontend/app/dashboard/lots/[id]/forms/page.tsx` | CREATE | Forms per lot page | ✅ Implemented |

---

## Data Model

```
QualityForm
├── id            PK
├── tenant        FK → core.TenantRegistry (CASCADE)
├── lot           FK → quality.Lot (CASCADE)
├── form_type     CharField(50)  TextChoices
├── status        CharField(20)  TextChoices  default="draft"
├── filled_by     FK → AUTH_USER_MODEL (SET_NULL, null)
├── submitted_at  DateTimeField (null)
├── created_at    DateTimeField (auto_now_add)
└── updated_at    DateTimeField (auto_now)

FormField
├── id            PK
├── quality_form  FK → QualityForm (CASCADE)
├── field_name    CharField(100)
├── field_type    CharField(20)  choices: text/number/boolean/select
├── value         TextField (blank=True)
├── unit          CharField(30)  blank=True
└── ordering      PositiveIntegerField default=0
```

**`form_type` TextChoices**:

```python
class FormType(models.TextChoices):
    RECEPCION_MATERIA_PRIMA = "recepcion_materia_prima", "Recepción de Materia Prima"
    CONTROL_ORGANOLEPTICO   = "control_organoleptico",   "Control Organoléptico"
    CONTROL_TEMPERATURA     = "control_temperatura",     "Control de Temperatura"
    CONTROL_PESO            = "control_peso",            "Control de Peso"
```

---

## API Sequence: Create Form

```
Client → POST /api/v1/lots/{lot_id}/forms/
         {form_type, fields: [{field_name, field_type, value, unit, ordering}]}

FormListCreateView.post()
  └─ get_request_membership()           → membership or 401
  └─ _get_lot_or_404(lot_id, tenant)    → lot or 404
  └─ QualityFormCreateSerializer.is_valid()
       └─ validate form_type
       └─ validate fields[]
  └─ serializer.save(tenant, lot, filled_by)
       └─ transaction.atomic()
            ├─ QualityForm.objects.create(...)
            └─ FormField.objects.bulk_create([...])
  └─ log_audit_event("form.create", ...)
  └─ 201 QualityFormSerializer(form).data
```

## API Sequence: Status Transition

```
Client → PATCH /api/v1/lots/{lot_id}/forms/{form_id}/status/
         {status: "submitted" | "approved" | "rejected"}

FormStatusView.patch()
  └─ get_request_membership()
  └─ _get_lot_or_404()
  └─ _get_form_or_404(form_id, lot)
  └─ if status in {"approved","rejected"}:
       check role in APPROVE_ROLES or 403
  └─ QualityFormStatusSerializer(data, context={"form": form}).is_valid()
       └─ validate transition in ALLOWED_TRANSITIONS
       └─ if submitted: validate all field values non-empty
  └─ form.status = new_status
  └─ if submitted: form.submitted_at = now()
  └─ form.save(update_fields=[...])
  └─ log_audit_event(f"form.{action}", ...)
  └─ 200 QualityFormSerializer(form).data
```

---

## TypeScript Interfaces

```typescript
export type FormType =
  | "recepcion_materia_prima"
  | "control_organoleptico"
  | "control_temperatura"
  | "control_peso"

export type FormStatus = "draft" | "submitted" | "approved" | "rejected"

export interface FormField {
  id: number
  field_name: string
  field_type: "text" | "number" | "boolean" | "select"
  value: string
  unit: string
  ordering: number
}

export interface QualityForm {
  id: number
  lot: number
  form_type: FormType
  status: FormStatus
  filled_by_username: string | null
  submitted_at: string | null
  created_at: string
  updated_at: string
  fields: FormField[]
}

export interface CreateFormFieldInput {
  field_name: string
  field_type: "text" | "number" | "boolean" | "select"
  value: string
  unit?: string
  ordering?: number
}

export interface CreateFormInput {
  form_type: FormType
  fields: CreateFormFieldInput[]
}
```

---

## Constants

```typescript
export const FORM_TYPE_LABELS: Record<FormType, string> = {
  recepcion_materia_prima: "Recepción de Materia Prima",
  control_organoleptico:   "Control Organoléptico",
  control_temperatura:     "Control de Temperatura",
  control_peso:            "Control de Peso",
}

export const FORM_STATUS_LABELS: Record<FormStatus, string> = {
  draft:     "Borrador",
  submitted: "Enviado",
  approved:  "Aprobado",
  rejected:  "Rechazado",
}

export const APPROVE_ROLES = new Set([
  "quality_manager", "manager", "tenant_admin", "global_admin",
])
```

---

## Audit Events

| Event | Trigger | Metadata |
|-------|---------|----------|
| `form.create` | POST creates form | `resource_type`, `resource_id`, `form_type`, `lot_id` |
| `form.submit` | status → submitted | `resource_type`, `resource_id`, `lot_id` |
| `form.approve` | status → approved | `resource_type`, `resource_id`, `lot_id` |
| `form.reject` | status → rejected | `resource_type`, `resource_id`, `lot_id` |
