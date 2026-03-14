# Tasks: design-system-refresh

## Phase 1: Design Tokens (`globals.css` + `tailwind.config.ts`)

- [x] 1.1 Add `--primary-dark: 11 80% 50%` to both `:root` and `.dark` blocks in `globals.css`
- [x] 1.2 Add `.brand-gradient-bg` (dark: `#1a1a1a → #2a1810`) and `.brand-gradient-bg-light` (`orange-50 → amber-50`) utilities to `@layer utilities` in `globals.css`
- [x] 1.3 Add `.glass-card-brand` utility (`bg rgba(255,87,34,0.05)`, `backdrop-blur(20px)`, `border rgba(255,255,255,0.12)`) to `@layer utilities` in `globals.css`
- [x] 1.4 Add `@supports not (backdrop-filter: blur(1px))` solid-background fallback inside `.glass-card` and `.glass-card-brand`
- [x] 1.5 Add `primary: { dark: 'hsl(var(--primary-dark))' }` entry to `extend.colors.primary` in `tailwind.config.ts`
- [x] 1.6 Add `fontFamily: { sans: ['Iosevka', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'] }` to `theme.extend` in `tailwind.config.ts`

## Phase 2: Login Page

- [x] 2.1 Outer wrapper: replace `from-sky-50 to-blue-100` with `from-orange-50 to-amber-50` + add `dark:bg-background dark:bg-none` overrides in `login-page.tsx`
- [x] 2.2 Card: replace `border-blue-200` with `border-orange-200/50`; add `dark:glass-card-brand` (or inline dark glass classes) in `login-page.tsx`
- [x] 2.3 Icon container: replace `from-blue-500 to-cyan-500` gradient with `bg-primary` in `login-page.tsx`
- [x] 2.4 Title: replace `text-blue-900` with `text-foreground dark:text-primary` in `login-page.tsx`
- [x] 2.5 Remove `border-blue-300 focus:border-blue-500 focus:ring-blue-500` from all three Input `className` props (username, password, company select) — let `--ring` CSS var handle focus
- [x] 2.6 Info badge: replace `bg-blue-50 border-blue-200 text-blue-700/text-blue-800` with `bg-orange-50 border-orange-200 text-orange-800 dark:bg-primary/10 dark:border-primary/20 dark:text-primary` in `login-page.tsx`
- [x] 2.7 CTA button: replace `bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700` with `bg-primary hover:bg-primary/90 text-primary-foreground` in `login-page.tsx`
- [x] 2.8 Verify: `grep "blue\|sky\|cyan" frontend/components/pages/login-page.tsx` returns 0 matches

## Phase 3: Navigation & Layout

- [x] 3.1 Page wrapper: replace `from-sky-50 to-blue-100` with `bg-background` in `main-layout.tsx`
- [x] 3.2 Header Card: replace `bg-gradient-to-r from-blue-700 to-cyan-600 text-white` with `bg-[#1a1a1a] border-b border-white/10` (dark-first; add `light:bg-card light:border-border` via `dark:` prefix inversion) in `main-layout.tsx`
- [x] 3.3 Waves icon container: replace `bg-white/20` with `bg-primary/20`; make icon `text-primary` in `main-layout.tsx`
- [x] 3.4 Subtitle "Gestión de Calidad Pesquera": replace `text-blue-100 opacity-90` with `text-muted-foreground` in `main-layout.tsx`
- [x] 3.5 Company info row: replace `text-blue-200` with `text-muted-foreground` in `main-layout.tsx`
- [x] 3.6 Verify: `grep "blue\|sky\|cyan" frontend/components/layout/main-layout.tsx` returns 0 matches

## Phase 4: Dashboard Pages (8 pages)

- [x] 4.1 `stats-cards.tsx` (or equivalent stat card component): replace all `text-blue-*`, `bg-blue-*`, `border-blue-*` with brand token equivalents (`text-primary`, `bg-primary/10`, `border-primary/20`)
- [x] 4.2 `frontend/app/admin/page.tsx`: apply substitution table (blue → brand tokens), update any page-wrapper gradient
- [x] 4.3 `frontend/app/dashboard/page.tsx`: same substitution
- [x] 4.4 `frontend/app/dashboard/supervisor/page.tsx`: same substitution
- [x] 4.5 `frontend/app/dashboard/monitor/page.tsx`: same substitution
- [x] 4.6 `frontend/app/dashboard/audit/page.tsx`: same substitution
- [x] 4.7 `frontend/app/dashboard/manager/page.tsx`: same substitution
- [x] 4.8 `frontend/app/dashboard/quality-manager/page.tsx`: same substitution
- [x] 4.9 `frontend/app/dashboard/billing/page.tsx`: same substitution
- [x] 4.10 Update badge variants on all dashboard pages: `bg-blue-*/text-blue-*` → `bg-primary/20 text-primary` (or chart token for secondary badges)
- [x] 4.11 Update recharts color props on any chart component: replace blue hex literals with `hsl(var(--chart-1))` through `hsl(var(--chart-5))`
- [x] 4.12 Verify: `grep -r "bg-blue\|text-blue\|border-blue\|from-blue\|to-blue\|bg-sky\|text-sky\|to-cyan\|from-cyan" frontend/app/dashboard frontend/app/admin` returns 0 matches

## Phase 5: Forms & Tables

- [x] 5.1 All form `Input` components in `frontend/components/forms/`: remove `focus:border-blue-` and `focus:ring-blue-` overrides from `className` props
- [x] 5.2 All table components: add zebra stripe with `even:bg-primary/5` (or `even:bg-muted`) replacing any `even:bg-blue-*`
- [x] 5.3 `lot-form.tsx`: submit button → `bg-primary text-primary-foreground`; section headings → `text-primary` or `text-foreground`
- [x] 5.4 `visual-inspection-form.tsx` (and any other form): same submit button and heading treatment
- [x] 5.5 `lot-status-badge.tsx` + `form-status-badge.tsx`: define unified token-backed palette — pending: `bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400`, in-progress: `bg-primary/15 text-primary`, completed: `bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400`, rejected: `bg-destructive/15 text-destructive`
- [x] 5.6 `frontend/app/dashboard/lots/page.tsx` and `lots/[id]/forms/page.tsx`: replace any remaining `blue-*` classes

## Phase 6: Dark Mode Audit

- [x] 6.1 Enable dark mode; manually open all 10 routes (/, /admin, /dashboard, /dashboard/supervisor, /dashboard/monitor, /dashboard/audit, /dashboard/manager, /dashboard/quality-manager, /dashboard/billing, /dashboard/lots) and screenshot for visual review
- [x] 6.2 WCAG AA check: measure contrast of `#ff5722` (primary) on `#1a1a1a` (background) and on `#242424` (card) — if < 4.5:1 for small text, switch those instances to `text-primary-dark` (`#e64a19`)
- [x] 6.3 WCAG AA check: measure white (`#ffffff`) on `#ff5722` (primary button) — must be ≥ 4.5:1
- [x] 6.4 Verify no invisible/white-on-white text on any dark mode route — fix any found
- [x] 6.5 Final grep: `grep -r "from-sky\|to-blue\|border-blue\|bg-blue\|text-blue\|from-blue\|to-cyan\|bg-cyan\|text-sky" frontend/` → must return 0 results (excluding any test fixtures or comments)
- [x] 6.6 Verify Shadcn `destructive`, `muted`, `secondary` badge/button variants are visually unchanged in both modes
