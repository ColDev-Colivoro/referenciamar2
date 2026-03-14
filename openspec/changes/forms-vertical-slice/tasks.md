# Tasks: forms-vertical-slice

**Change**: forms-vertical-slice  
**Version**: 1.0

---

## Phase 1 — Models + Migration

### 1.1 Add `QualityForm` model to `apps/quality/models.py`

- Add `FormType(TextChoices)` inner class with 4 values: `recepcion_materia_prima`, `control_organoleptico`, `control_temperatura`, `control_peso`
- Add `FormStatus(TextChoices)` inner class: `draft`, `submitted`, `approved`, `rejected`
- Add `QualityForm` model with all fields per REQ-F-01: tenant FK, lot FK, form_type, status default=draft, filled_by FK, submitted_at nullable, created_at, updated_at
- Add `Meta.ordering = ["-created_at"]` and `__str__`

### 1.2 Add `FormField` model to `apps/quality/models.py`

- Add `FieldType(TextChoices)` inner class: `text`, `number`, `boolean`, `select`
- Add `FormField` model with all fields per REQ-F-02: quality_form FK CASCADE, field_name, field_type, value TextField blank=True, unit blank=True, ordering default=0
- Add `Meta.ordering = ["ordering"]`

### 1.3 Register models in `apps/quality/admin.py`

- Register `QualityForm` with `StackedInline` for `FormField`
- Use `list_display = ["id", "form_type", "status", "lot", "tenant", "created_at"]`

### 1.4 Generate and verify migration

- Run `python manage.py makemigrations quality --name 0003_add_quality_form`
- Run `python manage.py migrate --run-syncdb` in test DB
- Verify `python manage.py check` returns no errors

---

## Phase 2 — API

### 2.1 Add `FormFieldSerializer` to `serializers.py`

- Fields: `id` (read_only), `field_name`, `field_type`, `value`, `unit`, `ordering`
- Add `validate_field_type` to enforce choices

### 2.2 Add `QualityFormSerializer` (read) to `serializers.py`

- Fields: `id`, `lot`, `form_type`, `status`, `filled_by_username` (SerializerMethodField), `submitted_at`, `created_at`, `updated_at`, `fields` (nested `FormFieldSerializer(many=True)`)

### 2.3 Add `QualityFormCreateSerializer` (write) to `serializers.py`

- Writable fields: `form_type`, `fields` (list of `FormFieldSerializer`)
- `validate_form_type`: validate against `FormType` choices
- `create()`: pop `fields`, call `transaction.atomic()`, `QualityForm.objects.create()`, `FormField.objects.bulk_create()`
- Accept `tenant`, `lot`, `filled_by` from serializer `context`

### 2.4 Add `QualityFormStatusSerializer` to `serializers.py`

- Single field: `status`
- `validate()`: check `ALLOWED_TRANSITIONS[current_status]` contains new status; if transitioning to `submitted`, verify all `FormField.value` are non-empty (list offending `field_name`s in error)

### 2.5 Add helper `_get_form_or_404(form_id, lot)` to `views.py`

- `QualityForm.objects.get(pk=form_id, lot=lot)` — returns None on DoesNotExist

### 2.6 Add `FormListCreateView` to `views.py`

- `GET`: get membership → get lot → filter `QualityForm.objects.filter(lot=lot, tenant=tenant).prefetch_related("fields")` → serialize + 200
- `POST`: get membership → get lot → validate `QualityFormCreateSerializer` → save with context → log `form.create` → 201

### 2.7 Add `FormDetailView` to `views.py`

- `GET`: get membership → get lot → `_get_form_or_404` → serialize + 200 or 404

### 2.8 Add `FormStatusView` to `views.py`

- `PATCH`: get membership → get lot → get form → if new status in `{approved, rejected}` check `APPROVE_ROLES` → validate `QualityFormStatusSerializer` → save status + submitted_at if submitted → log audit event → 200

### 2.9 Wire routes in `urls.py`

- Add include block:
  ```python
  path("<int:lot_id>/forms/", FormListCreateView.as_view(), name="form-list-create"),
  path("<int:lot_id>/forms/<int:form_id>/", FormDetailView.as_view(), name="form-detail"),
  path("<int:lot_id>/forms/<int:form_id>/status/", FormStatusView.as_view(), name="form-status"),
  ```

---

## Phase 3 — Frontend

### 3.1 Create `frontend/lib/forms/types.ts`

- Export: `FormType` union, `FormStatus` union, `FormField`, `QualityForm`, `CreateFormFieldInput`, `CreateFormInput`
- Export constants: `FORM_TYPE_LABELS`, `FORM_STATUS_LABELS`, `APPROVE_ROLES`

### 3.2 Create `frontend/lib/forms/api.ts`

- `listForms(lotId): Promise<QualityForm[]>` — GET `/api/v1/lots/{lotId}/forms/`
- `createForm(lotId, input): Promise<QualityForm>` — POST `/api/v1/lots/{lotId}/forms/`
- `getForm(lotId, formId): Promise<QualityForm>` — GET `/api/v1/lots/{lotId}/forms/{formId}/`
- `changeFormStatus(lotId, formId, status): Promise<QualityForm>` — PATCH `/api/v1/lots/{lotId}/forms/{formId}/status/`
- Follow same fetch pattern as `frontend/lib/lots/api.ts` (reuse token from session)

### 3.3 Create `frontend/hooks/use-forms.ts`

- `useForms(lotId: number)` hook
- State: `forms`, `isLoading`, `error`
- Expose: `refresh`, `createForm(input)`, `submitForm(formId)`
- `createForm` appends optimistically to state; rolls back on error
- Follow exact same pattern as `useLotsHook` (useState + useEffect + useCallback)

### 3.4 Create `frontend/components/forms/form-status-badge.tsx`

- Props: `status: FormStatus`
- Map status → Tailwind color classes + label from `FORM_STATUS_LABELS`
- Reuse same pill style as `LotStatusBadge` (`rounded-full px-2 py-0.5 text-xs font-medium`)

### 3.5 Create `frontend/app/dashboard/lots/[id]/forms/page.tsx`

- `"use client"` page
- Read `lotId` from `params.id`
- Use `useForms(lotId)` and `useSession()`
- Render: header with lot code, "Nuevo Formulario" button (any auth user), table with columns [Tipo, Estado, Responsable, Enviado, Acciones]
- Acciones column: "Enviar" button (draft only, any user); "Aprobar"/"Rechazar" buttons (submitted only, `APPROVE_ROLES`)
- Integrate `FormStatusBadge`
- Empty / loading / error states following `LotsPage` pattern

---

## Phase 4 — Tests

### 4.1 Test `QualityForm` model creation and `__str__`

- File: `backend/apps/quality/tests/test_forms.py`
- Test: create form → `__str__` returns expected string, `status` defaults to `draft`, `submitted_at` is null

### 4.2 Test `FormField` model creation

- Create form + 3 fields with different `field_type` values
- Assert `FormField.objects.filter(quality_form=form).count() == 3`
- Assert ordering by `ordering` field

### 4.3 Test `POST /api/v1/lots/{lot_id}/forms/` — success

- Create tenant, lot, user, token
- POST valid payload with `form_type` and `fields` array
- Assert HTTP 201, `QualityForm.objects.count() == 1`, `FormField.objects.count() == n`
- Assert audit event `form.create` logged

### 4.4 Test `POST /api/v1/lots/{lot_id}/forms/` — invalid form_type

- POST with `form_type="garbage"` → assert HTTP 400

### 4.5 Test `GET /api/v1/lots/{lot_id}/forms/` — list scoped to tenant

- Create 2 forms for tenant A, 1 for tenant B
- GET as tenant A user → assert 2 results

### 4.6 Test `GET /api/v1/lots/{lot_id}/forms/{form_id}/` — detail

- GET existing form → 200 with `fields` array
- GET form from wrong lot → 404

### 4.7 Test `PATCH status/` — draft → submitted

- POST form with all field values filled
- PATCH `{status: "submitted"}` → assert 200, `submitted_at` not null
- Assert audit event `form.submit` logged

### 4.8 Test `PATCH status/` — submit blocked when fields empty

- POST form with `value: ""`
- PATCH `{status: "submitted"}` → assert HTTP 400

### 4.9 Test `PATCH status/` — approve by quality_manager

- PATCH `{status: "approved"}` as quality_manager → 200
- PATCH `{status: "approved"}` as inspector → 403
- Assert audit event `form.approve` logged on success

### 4.10 Test invalid status transitions

- `draft → approved` → 400
- `draft → rejected` → 400
- `approved → submitted` → 400

---

## Phase 5 — Docs

### 5.1 Update `AGENTS.md` forms domain entry

- Confirm `forms` domain entry in the domains list already references `apps/quality` models
- Add a one-line note: "QualityForm + FormField — see `openspec/changes/forms-vertical-slice/`"

### 5.2 Update `README.md` API section

- Add table row for forms endpoints under the Quality section:
  - `GET/POST /api/v1/lots/{lot_id}/forms/`
  - `GET /api/v1/lots/{lot_id}/forms/{form_id}/`
  - `PATCH /api/v1/lots/{lot_id}/forms/{form_id}/status/`

### 5.3 Archive change to `openspec/changes/archive/`

- After all tasks complete and tests pass, move `openspec/changes/forms-vertical-slice/` to `openspec/changes/archive/forms-vertical-slice/`
- Sync delta specs to `openspec/specs/forms/` and `openspec/specs/frontend-forms/`
