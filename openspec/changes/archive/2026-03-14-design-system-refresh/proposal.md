# Proposal: Design System Refresh

## Intent

The ColdevConAC frontend has a fragmented visual identity: the login page uses a blue/sky gradient
(`from-sky-50 to-blue-100`, `border-blue-200`) while the declared brand primary colour is Deep Orange
(`#ff5722`). Design tokens ARE partially defined in `app/globals.css` as HSL CSS variables, but they
are not consistently consumed by pages and components. This creates a disconnect between the brand
identity of **ColdevConAC — Gestión de Calidad Pesquera** and what users see every time they open
the app.

This change unifies brand identity across all pages by:
1. Hardening the token definitions in `globals.css`.
2. Replacing every hardcoded blue/sky class with orange-brand equivalents.
3. Ensuring dark mode surfaces use the correct dark tokens, not arbitrary grays.

## Scope

### In Scope
- Establish final design tokens in `frontend/app/globals.css` (primary, accent, background, card, font stack, glass effect)
- Redesign login page (`frontend/app/page.tsx` + `frontend/components/auth/`) — remove blue gradient, apply orange brand + glass card
- Navigation brand bar (`frontend/components/layout/`) — logo colour, active-link indicator, mobile drawer
- Dashboard cards and stat tiles across all dashboard pages (admin, supervisor, monitor, audit, manager, quality-manager, billing)
- Lots and form pages (`frontend/app/dashboard/lots/`, `frontend/app/dashboard/lots/[id]/forms`)
- Dark mode consistency: verify CSS variable overrides under `.dark` class match `#1a1a1a` / `#242424` tokens
- Typography: declare Iosevka + Inter fallback in `globals.css` and `tailwind.config`

### Out of Scope
- Backend changes of any kind
- Replacing Shadcn/UI component primitives (Radix behaviour is untouched)
- Adding new pages or routes
- Animation / motion system
- Responsive breakpoint audit (separate concern)

## Approach

**Phase-by-phase token-first strategy** — each phase is independently committable and verifiable:

| Phase | Focus | Key action |
|-------|-------|------------|
| 1 — Tokens | `globals.css` + `tailwind.config` | Define all HSL vars; expose `primary`, `primary-dark`, `accent`, `background`, `card`, `glass` layers; add Iosevka font |
| 2 — Login | `app/page.tsx`, `components/auth/` | Replace sky gradient with `bg-background` + glass card; use `text-primary` for CTA button |
| 3 — Navigation | `components/layout/` | Update logo tint, active-link border/bg, mobile hamburger icon to `primary` |
| 4 — Dashboards | `components/dashboard/`, `components/pages/` | Replace hardcoded blue badge/card classes with token utilities |
| 5 — Forms & Lots | `components/forms/`, `components/lots/`, `app/dashboard/lots/` | Focus ring, submit button, section headings |
| 6 — Dark Mode audit | All above | Validate `.dark` overrides; ensure no white-on-white or invisible text; WCAG AA pass |

All phases stay inside the existing Shadcn/UI component tree — CSS variables are updated, not the component JSX structure.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `frontend/app/globals.css` | Modified | Master token definition: HSL vars for primary (`20 100% 54%`), accent, backgrounds, glass, font |
| `frontend/tailwind.config.ts` | Modified | Extend `fontFamily` with Iosevka; ensure `primary` / `accent` map to CSS vars |
| `frontend/app/layout.tsx` | Modified | Add Iosevka `next/font` or Google Font import if not present |
| `frontend/app/page.tsx` | Modified | Remove `from-sky-50 to-blue-100` gradient; apply brand background + glass card |
| `frontend/components/auth/` | Modified | Login form card, input focus rings, submit button — orange brand |
| `frontend/components/layout/` | Modified | Navbar/sidebar logo colour, active-link highlight, mobile drawer |
| `frontend/components/dashboard/` | Modified | Stat cards, KPI tiles, section headers — replace blue tokens |
| `frontend/components/pages/` | Modified | Per-role page wrappers that may carry leftover blue classes |
| `frontend/app/admin/page.tsx` | Modified | Admin dashboard page-level blue remnants |
| `frontend/app/dashboard/page.tsx` | Modified | Default dashboard page |
| `frontend/app/dashboard/supervisor/page.tsx` | Modified | Supervisor role page |
| `frontend/app/dashboard/monitor/page.tsx` | Modified | Monitor role page |
| `frontend/app/dashboard/audit/page.tsx` | Modified | Audit role page |
| `frontend/app/dashboard/manager/page.tsx` | Modified | Manager role page |
| `frontend/app/dashboard/quality-manager/page.tsx` | Modified | Quality-manager role page |
| `frontend/app/dashboard/billing/page.tsx` | Modified | Billing role page |
| `frontend/app/dashboard/lots/page.tsx` | Modified | Lots list page |
| `frontend/app/dashboard/lots/[id]/forms/page.tsx` | Modified | Lot forms page |
| `frontend/components/forms/` | Modified | Form section headings, focus rings, submit/cancel buttons |
| `frontend/components/lots/` | Modified | Lot card, status badge colours |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Low colour contrast with orange on white (WCAG AA failure) | Medium | Use `primary-dark` (`#e64a19`) for text-on-white contexts; validate with Colour Contrast Analyser before merging |
| Shadcn/UI button variant overrides lost after `shadcn` CLI re-run | Low | Tokens live in CSS variables → CLI updates components, not variables; verified by reviewing update flow |
| Iosevka font not loading in prod (self-hosted vs CDN) | Low | Provide Inter as fallback; test with font devtools network throttling |
| Regression in existing Shadcn components (e.g., `destructive`, `secondary` variants) | Medium | Only touch `--primary` and `--accent` CSS vars; other semantic vars (`--destructive`, `--muted`) remain unchanged |
| Dark mode: orange on `#1a1a1a` might feel too saturated | Low | Use `primary-dark` (`#e64a19`) in dark contexts; smoke-test in dark mode on each phase |
| Glass effect (`backdrop-blur`) not supported on all browsers | Low | Already used in modern-only context (Next.js 15 app); add `@supports` fallback with solid card bg |

## Rollback Plan

Each phase is a separate commit. To revert the entire change:

```bash
git revert <first-phase-commit>..<last-phase-commit>
```

To revert a single phase, cherry-pick the revert of that specific commit. Because all changes are
CSS-variable-driven (no structural JSX changes), reverting `globals.css` to the previous token
values will immediately restore the old visual appearance without touching component logic.

A pre-change snapshot tag will be created before Phase 1:

```bash
git tag pre-design-system-refresh
```

## Dependencies

- Iosevka font availability (Google Fonts or local `public/fonts/`) — confirm source before Phase 1
- `next-themes` already installed (confirmed in stack) — dark mode toggling is already wired
- No new npm packages required

## Success Criteria

- [ ] `frontend/app/globals.css` defines all 7 brand tokens as HSL CSS variables under both `:root` and `.dark`
- [ ] Login page (`/`) shows no `sky-*` or `blue-*` Tailwind classes; background uses brand tokens
- [ ] Navigation brand mark renders in Deep Orange (`#ff5722`) in both light and dark modes
- [ ] All 8 dashboard pages (admin, supervisor, monitor, audit, manager, quality-manager, billing, default) have no hardcoded `blue-*` colour classes
- [ ] Lots and form pages use `primary` token for action buttons and focus rings
- [ ] WCAG AA contrast ratio ≥ 4.5:1 verified for primary text / button label combinations
- [ ] Dark mode: background surfaces use `#1a1a1a` / `#242424`; no visible white-on-white or missing text
- [ ] `grep -r "from-sky\|to-blue\|border-blue\|bg-blue\|text-blue" frontend/` returns 0 results (excluding test fixtures)
- [ ] Existing Shadcn `destructive`, `muted`, `secondary` variant colours are visually unchanged
