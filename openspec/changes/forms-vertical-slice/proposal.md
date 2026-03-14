# Proposal: forms-vertical-slice

## Intent

Quality control forms allow inspectors to attach structured inspection data to a Lot.
Each Lot can have multiple forms (e.g., "Recepción de Materia Prima", "Control Organoléptico").
Forms have a type, a set of field responses, a result (passed/failed/conditional), and are linked
to a Lot and a Tenant.

---

## Scope In

- **`QualityForm` model** (linked to Lot + Tenant): `form_type`, `lot`, `status` (draft / submitted / approved / rejected), `filled_by`, `submitted_at`
- **`FormField` model** (child of `QualityForm`): `field_name`, `field_type` (text / number / boolean / select), `value`, `unit`, `ordering`
- **CRUD API**: list, create, get detail, submit (status change), approve / reject
- **Form types** — predefined set:
  - `recepcion_materia_prima`
  - `control_organoleptico`
  - `control_temperatura`
  - `control_peso`
- **Frontend**: form list per lot, create/fill form, submit form, status badge
- **Backend tests**

---

## Scope Out

- Dynamic form builder (drag-and-drop)
- PDF export
- Custom form templates per tenant
- Form versioning

---

## Approach

Follow the exact same pattern as Lot:
- Models in `apps/quality` (same Django app)
- `APIView` style views with `TokenAuthentication`
- Serializers with nested `FormField` inline write
- Tenant-scoped querysets via `get_request_membership`
- `FormField` created inline: single `POST` creates `QualityForm` + all `FormField` rows atomically

---

## Affected Areas

| File | Change |
|------|--------|
| `backend/apps/quality/models.py` | Add `QualityForm` + `FormField` models |
| `backend/apps/quality/migrations/0003_add_quality_form.py` | New migration |
| `backend/apps/quality/serializers.py` | Add `FormFieldSerializer`, `QualityFormSerializer`, `QualityFormCreateSerializer`, `QualityFormStatusSerializer` |
| `backend/apps/quality/views.py` | Add `FormListCreateView`, `FormDetailView`, `FormStatusView` |
| `backend/apps/quality/urls.py` | Add form routes nested under `<lot_id>/forms/` |
| `frontend/lib/forms/types.ts` | `QualityForm`, `FormField`, `FormType`, `FormStatus`, `CreateFormInput` |
| `frontend/lib/forms/api.ts` | `listForms`, `createForm`, `getForm`, `submitForm` |
| `frontend/hooks/use-forms.ts` | `useForms(lotId)` hook |
| `frontend/components/forms/form-status-badge.tsx` | Status badge component |
| `frontend/app/dashboard/lots/[id]/forms/page.tsx` | Forms per lot page |

---

## Risks

| Risk | Mitigation |
|------|-----------|
| Nested create (form + fields in one POST) requires careful serializer logic | Write `create()` that calls `FormField.objects.bulk_create()` inside a `transaction.atomic()` |
| `form_type` enum must be extensible in future | Use `TextChoices` with known values; allow unknown via open `CharField` with `choices` soft validation |
| Status machine needs guarding against invalid transitions | Validate in `QualityFormStatusSerializer.validate()` before save |

---

## Rollback

1. Delete migration `0003_add_quality_form`
2. Remove `QualityForm` and `FormField` classes from `models.py`
3. Remove view/serializer additions from `views.py` and `serializers.py`
4. Remove routes from `urls.py`
5. Delete `frontend/lib/forms/`, `frontend/hooks/use-forms.ts`, `frontend/components/forms/`, `frontend/app/dashboard/lots/[id]/forms/`

---

## Success Criteria

- [ ] `QualityForm` + `FormField` models pass `manage.py check`
- [ ] `POST /api/v1/lots/{lot_id}/forms/` creates a form with nested fields atomically
- [ ] `GET /api/v1/lots/{lot_id}/forms/` returns forms scoped to lot + tenant
- [ ] `GET /api/v1/lots/{lot_id}/forms/{form_id}/` returns single form with fields
- [ ] Status transitions enforced: `draft → submitted → approved / rejected`
- [ ] Only `quality_manager`, `manager`, `tenant_admin`, `global_admin` can approve/reject
- [ ] Any authenticated tenant member can create/submit
- [ ] All backend tests pass
- [ ] Audit events logged: `form.create`, `form.submit`, `form.approve`, `form.reject`
