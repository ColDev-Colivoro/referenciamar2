# Frontend Billing Specification — ColdevConAC

## Purpose

Define the behavior of the billing frontend slice for ColdevConAC. This spec covers the
`useSubscription()` hook, the `PlanBadge` component, and the read-only
`/dashboard/billing/` page.

---

## Requirements

### Requirement: useSubscription() Hook

The system MUST provide a `useSubscription()` hook in
`frontend/hooks/use-subscription.ts` that fetches `GET /api/v1/billing/subscription/`
and exposes the result to consuming components.

The hook MUST expose: `subscription` (the full subscription object or `null`),
`plan` (the nested plan object or `null`), `isLoading` (boolean), `error` (string or `null`),
and `refresh` (function to re-fetch manually).

The hook MUST follow the same `useState + useCallback + useEffect + useMemo` pattern
used by `useLots()` and `useAudit()` in the project.

When the API returns HTTP 404, `subscription` MUST be `null` and `error` MUST be `null`
(a tenant without a subscription is a valid state, not an application error).

When the API returns HTTP 403 or 401, `error` MUST be set to a human-readable message.

#### Scenario: hook returns subscription data on success

- GIVEN the API returns HTTP 200 with a valid subscription object
- WHEN `useSubscription()` is mounted in a component
- THEN `isLoading` transitions from `true` to `false`
- AND `subscription` is populated with the API response
- AND `plan` equals `subscription.plan`
- AND `error` is `null`

#### Scenario: hook handles 404 gracefully

- GIVEN the API returns HTTP 404
- WHEN `useSubscription()` is mounted
- THEN `isLoading` transitions to `false`
- AND `subscription` is `null`
- AND `error` is `null` (not an error state — tenant simply has no subscription)

---

### Requirement: PlanBadge Component

The system MUST provide a `PlanBadge` component in
`frontend/components/billing/plan-badge.tsx` that renders a color-coded badge
indicating the plan tier.

Color mapping MUST be:
- `starter` → gray (`bg-gray-100 text-gray-700`)
- `professional` → blue (`bg-blue-100 text-blue-700`)
- `enterprise` → gold/amber (`bg-amber-100 text-amber-700`)
- Any unknown code → gray (fallback)

The component MUST accept a `planCode` prop (string) and an optional `planName` prop
(string, defaults to displaying the `planCode` if not provided).

The component MUST NOT perform any data fetching — it is purely presentational.

#### Scenario: renders professional badge with correct color

- GIVEN `<PlanBadge planCode="professional" planName="Professional" />`
- THEN the rendered element has CSS classes `bg-blue-100` and `text-blue-700`
- AND the visible text is `"Professional"`

#### Scenario: unknown plan code falls back to gray

- GIVEN `<PlanBadge planCode="legacy_custom" />`
- THEN the rendered element has CSS classes `bg-gray-100` and `text-gray-700`
- AND the visible text is `"legacy_custom"`

---

### Requirement: Billing Dashboard Page

The system MUST provide a read-only billing page at `/dashboard/billing/` implemented
as a Next.js client component at `frontend/app/dashboard/billing/page.tsx`.

On mount, the page MUST verify the authenticated user's role. If the role is neither
`global_admin` nor `tenant_admin`, the page MUST redirect to `/dashboard` immediately.

When a subscription exists, the page MUST display:
- Current plan name with a `PlanBadge`
- Subscription status (active / trial / expired / suspended)
- `max_users` limit from the plan
- `max_lots_per_month` limit from the plan
- `expires_at` (formatted date, or "No expiry" if null)
- `trial_ends_at` (formatted date, only shown when status is `trial`)

When no subscription exists (subscription is `null`), the page MUST display a
`"No active subscription. Contact your administrator."` message instead of a table.

The page MUST show a loading skeleton while `isLoading` is `true`.
The page MUST show an error message if `error` is set.
The page MUST NOT contain any edit, upgrade, or payment controls (read-only).

#### Scenario: tenant_admin sees active subscription details

- GIVEN the user has role `tenant_admin`
- AND the tenant has an active `professional` subscription expiring `2026-12-31`
- WHEN the user navigates to `/dashboard/billing/`
- THEN the page renders without redirect
- AND the plan name "Professional" is visible with a blue badge
- AND the status "active" is visible
- AND `expires_at` shows `"2026-12-31"` (or locale-formatted equivalent)
- AND no upgrade/payment buttons are present

#### Scenario: monitor role is redirected

- GIVEN the user has role `monitor`
- WHEN the user navigates to `/dashboard/billing/`
- THEN the page redirects to `/dashboard`
- AND no billing information is rendered

#### Scenario: tenant has no subscription

- GIVEN the user has role `tenant_admin`
- AND the tenant has no subscription
- WHEN the user navigates to `/dashboard/billing/`
- THEN the page renders the message
  `"No active subscription. Contact your administrator."`
- AND no plan details or limits are rendered
