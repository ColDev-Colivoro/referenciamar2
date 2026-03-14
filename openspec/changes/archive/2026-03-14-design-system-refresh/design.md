# Technical Design: design-system-refresh

## Overview

A token-first, phase-by-phase visual identity unification for ColdevConAC. All color decisions are encoded as CSS custom properties in `globals.css` and surfaced through Tailwind semantic aliases in `tailwind.config.ts`. No Shadcn/UI component primitives are replaced — only CSS variable values and class names in page/layout wrappers change.

---

## Architecture

### CSS Variable → Tailwind Mapping

```
globals.css (:root / .dark)          tailwind.config.ts (extend.colors)
─────────────────────────────        ──────────────────────────────────
--primary: 14 100% 57%           →   primary.DEFAULT: hsl(var(--primary))
--primary-dark: 11 80% 50%       →   primary.dark:    hsl(var(--primary-dark))
--primary-foreground: 0 0% 100%  →   primary.foreground: hsl(var(--primary-foreground))
--accent: 54 100% 62%            →   accent.DEFAULT:  hsl(var(--accent))
--background: 0 0% 10% (dark)    →   background:      hsl(var(--background))
--card: 0 0% 14% (dark)          →   card.DEFAULT:    hsl(var(--card))
--ring: 14 100% 57%              →   ring:            hsl(var(--ring))
```

Components MUST only reference the right-hand Tailwind classes. Raw hex values or HSL literals in JSX class strings are prohibited.

### Glass Card Architecture

The `.glass-card` utility in `globals.css` is the single source of truth for glass morphism. Two variants are needed:

| Variant | Context | Properties |
|---------|---------|------------|
| `.glass-card` (existing) | Dark mode general | `bg rgba(26,26,26,0.6)`, `backdrop-blur(12px)`, `border rgba(255,255,255,0.06)` |
| `.glass-card-brand` (new) | Login card dark | `bg rgba(255,87,34,0.05)`, `backdrop-blur(20px)`, `border rgba(255,255,255,0.12)` |
| Light fallback | `@supports` no backdrop-filter | `bg-white/95 border-orange-200/50` |

### Brand Gradient Utilities (new in globals.css)

```css
.brand-gradient-bg {
  /* dark: uses existing .dark body radial-gradient */
  background: linear-gradient(135deg, hsl(var(--background)) 0%, #2a1810 100%);
}
.brand-gradient-bg-light {
  background: linear-gradient(135deg, theme('colors.orange.50') 0%, theme('colors.amber.50') 100%);
}
```

---

## Key Decisions

### Decision 1: Semantic Token Everywhere, No Raw #ff5722

**Rationale**: Raw color values scattered across JSX are impossible to maintain when brand colors evolve. A single CSS variable change in `globals.css` propagates everywhere.

**Rule**: `bg-primary`, `text-primary`, `border-primary`, `ring-primary` in JSX. Never `bg-[#ff5722]` or `bg-orange-500` (which is a different shade).

### Decision 2: Login Page Gradient Strategy

| Mode | Outer wrapper | Card |
|------|--------------|------|
| Dark | `.dark body` radial-gradient already present; wrapper uses `bg-background` | `.glass-card-brand` (see above) |
| Light | `bg-gradient-to-br from-orange-50 to-amber-50` on wrapper | `bg-white/90 border-orange-200/50 backdrop-blur-sm shadow-2xl` |

**Rationale**: The dark background glow is defined globally in `.dark body` — the login wrapper only needs `bg-transparent` or `bg-background` in dark mode to let the body gradient show through.

### Decision 3: Navigation Bar Design

Replace `bg-gradient-to-r from-blue-700 to-cyan-600` with:
- **Dark mode**: `bg-[#1a1a1a] border-b border-white/10` (matches `--background` token, full bleed)
- **Light mode**: `bg-card border-b border-border` (clean white card with subtle border)
- **ColdevConAC wordmark**: `text-primary font-extrabold`
- **Waves icon container**: `bg-primary/10 text-primary` (soft orange tint)
- **Active nav accent**: `border-l-2 border-primary bg-primary/10` (left-border indicator)

**Rationale**: Dark `#1a1a1a` header is consistent with ColDevPOS reference and the existing `.dark` CSS tokens.

### Decision 4: Dashboard Card Color Replacement

Direct class substitution mapping (applied via find-replace per file):

| Old class | New class | Semantic meaning |
|-----------|-----------|-----------------|
| `text-blue-600` | `text-primary` | KPI metric value |
| `bg-blue-50` | `bg-primary/10` | Tinted card background |
| `border-blue-200` | `border-primary/20` | Card border |
| `text-blue-500` | `text-chart-1` | Secondary metric |
| `bg-blue-100` | `bg-primary/15` | Badge background |
| `from-blue-700 to-cyan-600` | `bg-background` + `border-b border-white/10` | Header gradient |
| `from-sky-50 to-blue-100` | brand gradient bg | Page background |

### Decision 5: Form Focus Ring

Shadcn/UI `Input` and `Select` components use `--ring` for focus. Since `--ring: 14 100% 57%` is already set in both `:root` and `.dark`, removing the hardcoded `focus:border-blue-` and `focus:ring-blue-` overrides from the `className` props in login-page and form components is sufficient. No Shadcn primitive changes needed.

### Decision 6: primary-dark Token Addition

A `--primary-dark: 11 80% 50%` token (≈ `#e64a19`) is added to both `:root` and `.dark`. This is used where orange appears as body text on a white/light background, where `#ff5722` on white yields ~3.0:1 (below AA for small text). `#e64a19` on white yields ~4.6:1 (passes AA).

**Tailwind mapping**: `primary: { dark: 'hsl(var(--primary-dark))' }` added to `extend.colors.primary`.

---

## Phase Breakdown

### Phase 1 — Design Tokens (`globals.css` + `tailwind.config.ts`)

**Files**:
- `frontend/app/globals.css`
- `frontend/tailwind.config.ts`

**Changes**:
1. Add `--primary-dark: 11 80% 50%` to both `:root` and `.dark`
2. Add `.brand-gradient-bg` and `.glass-card-brand` utilities to `@layer utilities`
3. Add `@supports not (backdrop-filter: blur(1px))` fallback inside `.glass-card` and `.glass-card-brand`
4. Add `primary: { dark: 'hsl(var(--primary-dark))' }` to `tailwind.config.ts`
5. Add `fontFamily: { sans: ['Iosevka', 'Inter', 'ui-sans-serif', 'system-ui'] }` to `extend`

**Verification**: `grep "primary-dark" frontend/app/globals.css` → at least 2 hits (`:root` + `.dark`)

---

### Phase 2 — Login Page (`app/page.tsx`, `components/pages/login-page.tsx`)

**Files**:
- `frontend/components/pages/login-page.tsx`

**Changes**:
1. Outer wrapper: `from-sky-50 to-blue-100` → `from-orange-50 to-amber-50` (light); add `dark:bg-background dark:from-transparent dark:to-transparent`
2. Card: `border-blue-200` → `border-orange-200/50`; add `dark:glass-card-brand`
3. Icon container: `from-blue-500 to-cyan-500` → `bg-primary`
4. Title: `text-blue-900` → `text-foreground dark:text-primary`
5. Input classNames: remove `border-blue-300 focus:border-blue-500 focus:ring-blue-500` (defer to CSS var `--ring`)
6. Info badge: `bg-blue-50 border-blue-200 text-blue-700` → `bg-orange-50 border-orange-200 text-orange-800 dark:bg-primary/10 dark:border-primary/20 dark:text-primary-foreground`
7. CTA button: `bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700` → `bg-primary hover:bg-primary/90 text-primary-foreground`

**Verification**: `grep "blue\|sky\|cyan" frontend/components/pages/login-page.tsx` → 0 results

---

### Phase 3 — Navigation & Layout (`components/layout/main-layout.tsx`)

**Files**:
- `frontend/components/layout/main-layout.tsx`

**Changes**:
1. Page wrapper: `from-sky-50 to-blue-100` → `bg-background`
2. Header Card: `from-blue-700 to-cyan-600 text-white` → `bg-[#1a1a1a] border-b border-white/10 text-foreground dark:text-foreground` (dark) / `bg-card border-b border-border` (light, handled via dark: prefix)
3. Icon container: `bg-white/20` → `bg-primary/20` with `text-primary`
4. Subtitle: `text-blue-100` → `text-muted-foreground`
5. Company info: `text-blue-200` → `text-muted-foreground`

**Verification**: `grep "blue\|sky\|cyan" frontend/components/layout/main-layout.tsx` → 0 results

---

### Phase 4 — Dashboard Pages (8 pages + stat-cards component)

**Files**:
- `frontend/components/dashboard/stats-cards.tsx` (and equivalents)
- `frontend/app/admin/page.tsx`
- `frontend/app/dashboard/page.tsx`
- `frontend/app/dashboard/supervisor/page.tsx`
- `frontend/app/dashboard/monitor/page.tsx`
- `frontend/app/dashboard/audit/page.tsx`
- `frontend/app/dashboard/manager/page.tsx`
- `frontend/app/dashboard/quality-manager/page.tsx`
- `frontend/app/dashboard/billing/page.tsx`

**Changes**: Apply substitution table from Decision 4 per file. Update badge variants to use `bg-primary/20 text-primary` or chart tokens.

**Verification**: `grep -r "bg-blue\|text-blue\|border-blue\|from-blue\|to-blue\|bg-sky\|text-sky" frontend/app/dashboard frontend/app/admin` → 0 results

---

### Phase 5 — Forms & Lots

**Files**:
- `frontend/components/forms/` (all form components)
- `frontend/components/lots/` (lot card, status badge)
- `frontend/app/dashboard/lots/page.tsx`
- `frontend/app/dashboard/lots/[id]/forms/page.tsx`

**Changes**:
1. Remove hardcoded `focus:border-blue-` and `focus:ring-blue-` from Input classNames
2. Submit buttons: `bg-blue-*` → `bg-primary text-primary-foreground`
3. Section headings: `text-blue-*` → `text-primary` or `text-foreground`
4. Status badges: define mapping (pending → amber, in-progress → primary/orange, completed → green, rejected → destructive)

---

### Phase 6 — Dark Mode Audit (all routes)

**Files**: All modified files above + any remaining components

**Process**:
1. Enable dark mode; open each of the 10 routes
2. For each route: check for invisible text, white-on-white, or missing contrast
3. Run final `grep -r "from-sky\|to-blue\|border-blue\|bg-blue\|text-blue" frontend/` → must be 0
4. Measure contrast ratios for: primary CTA on dark bg, body text on card, muted text on background
5. If any orange-on-light text fails 4.5:1, switch to `text-primary-dark` on that element

---

## Dependency Notes

- **Iosevka font**: Already imported via CDN in both `globals.css` (`@import`) and `app/layout.tsx` (`<link>`). No additional setup needed.
- **next-themes**: Already installed and wired (`ThemeProvider` in `layout.tsx`). Dark mode class strategy confirmed.
- **No new npm packages** required for any phase.
- **Shadcn/UI variants not touched**: `destructive`, `muted`, `secondary`, `popover` CSS vars remain unchanged. Only `--primary`, `--primary-dark`, `--ring`, and layout class names change.

---

## Rollback

Each phase is a separate commit. Per proposal: `git revert <first>..<last>` for full rollback, or cherry-pick individual phase revert. Tag `pre-design-system-refresh` created before Phase 1.
