# UI Design System Specification

## Purpose

Define a unified brand identity for ColdevConAC — Gestión de Calidad Pesquera. The system must express the Deep Orange (#ff5722) brand consistently across all surfaces: login, navigation, dashboards, forms, and dark mode. Every color decision must trace back to a CSS custom property defined in `globals.css` and exposed as a Tailwind semantic token.

---

## Requirements

### Requirement: Brand Color Token System

The system MUST define all colors as CSS custom properties under `:root` and `.dark` in `globals.css`. Components MUST consume semantic token classes (`bg-primary`, `text-primary`, `border-primary`) rather than raw Tailwind color classes (`bg-orange-500`, `text-[#ff5722]`). The token `--primary` MUST resolve to the Deep Orange hue (`14 100% 57%` in HSL) in both light and dark mode. A `--primary-dark` token (`11 80% 50%`, ≈ `#e64a19`) MUST be available for text-on-light-background contexts to ensure WCAG AA contrast.

#### Scenario: Developer reads primary color token

- GIVEN a developer opens `frontend/app/globals.css`
- WHEN they search for `--primary`
- THEN they see `--primary: 14 100% 57%;` in the `:root` block
- AND they see the same value preserved in the `.dark` block

#### Scenario: Component uses semantic token instead of raw color

- GIVEN any component file inside `frontend/components/`
- WHEN a developer searches for `bg-orange-`, `bg-[#ff5722]`, or `text-[#ff5722]`
- THEN zero matches are returned
- AND the same visual result is achieved via `bg-primary` or `text-primary`

#### Scenario: Primary-dark token available for text contrast

- GIVEN the `:root` block in `globals.css`
- WHEN a developer reads `--primary-dark`
- THEN they see `--primary-dark: 11 80% 50%;` (≈ #e64a19)
- AND `tailwind.config.ts` maps `primary.dark` to `hsl(var(--primary-dark))`

---

### Requirement: Login Page Brand Identity

The login page MUST display a brand-consistent background and card. The sky/blue gradient (`from-sky-50 to-blue-100`) MUST be replaced. In dark mode the background MUST use the dark brand gradient defined in `globals.css`. In light mode the background MUST use a warm orange-tinted gradient (`from-orange-50 to-amber-50`). The card MUST use a glass morphism treatment with brand border. The icon container MUST use the Deep Orange brand color. The CTA button MUST use `bg-primary`. The informational "Acceso real en construcción" badge MUST be styled with brand tokens (orange), not blue.

#### Scenario: Login page in dark mode renders brand background

- GIVEN a user opens the app in dark mode (`class="dark"` on `<html>`)
- WHEN the login page (`/`) is rendered
- THEN the page background shows the dark radial-gradient defined in `.dark body` (orange glow)
- AND no `from-sky-`, `to-blue-`, or `bg-blue-` classes are present in the page wrapper

#### Scenario: Login page in light mode renders warm gradient

- GIVEN a user opens the app in light mode
- WHEN the login page (`/`) is rendered
- THEN the outer wrapper uses `from-orange-50 to-amber-50` gradient or equivalent brand tokens
- AND the card uses `bg-white/90` with `border-orange-200/50`

#### Scenario: Glass card renders in dark mode

- GIVEN dark mode is active
- WHEN the login card is displayed
- THEN the card applies `bg-white/10 backdrop-blur-xl border-white/20` or the `.glass-card` utility
- AND the card content (inputs, labels) remains legible with sufficient contrast

#### Scenario: Brand icon on login page

- GIVEN the login page is rendered in any mode
- WHEN the icon container above the title is visible
- THEN it uses an orange gradient (`from-primary to-primary/80`) or `bg-primary` background
- AND the Waves icon inside is `text-white`

#### Scenario: CTA button uses primary token

- GIVEN the login page is rendered
- WHEN the "Iniciar Sesión" button is visible
- THEN the button has `bg-primary` (or equivalent `bg-[hsl(var(--primary))]`)
- AND no `from-blue-600`, `to-cyan-600`, or similar blue classes are present on the button

#### Scenario: Info badge uses brand orange

- GIVEN the "Acceso real en construcción" info section is shown
- WHEN rendered in any mode
- THEN the container uses orange/amber background token (e.g. `bg-orange-50`, `border-orange-200`)
- AND no `bg-blue-50`, `border-blue-200`, or `text-blue-` classes are present

#### Scenario: Backdrop blur not supported

- GIVEN a browser that does not support `backdrop-filter`
- WHEN the login card renders
- THEN the card falls back to a solid background (`bg-card` or `bg-white/95`) via `@supports` fallback
- AND the card remains fully readable

---

### Requirement: Navigation Brand Bar

The navigation header rendered by `MainLayout` MUST use the dark brand background (`bg-[#1a1a1a]` or `bg-background` in dark, `bg-card` in light) instead of the blue-to-cyan gradient. The ColdevConAC wordmark MUST render in Deep Orange. The Waves icon MUST be styled with the brand color. Action buttons (logout, notifications, menu) MUST use `hover:bg-white/20` or `hover:bg-primary/10` depending on mode.

#### Scenario: Navigation renders brand background in dark mode

- GIVEN an authenticated user views any dashboard page in dark mode
- WHEN the `MainLayout` header is rendered
- THEN the header card uses `bg-[#1a1a1a]` or `bg-background` (not `from-blue-700 to-cyan-600`)
- AND the ColdevConAC title text uses `text-primary` or resolves to Deep Orange

#### Scenario: Navigation renders in light mode

- GIVEN an authenticated user views any dashboard in light mode
- WHEN the `MainLayout` header is rendered
- THEN the header background uses a light brand-appropriate surface (`bg-card` or `bg-background`)
- AND the wordmark remains visible with adequate contrast

#### Scenario: No blue classes in navigation

- GIVEN the compiled navigation markup
- WHEN a developer runs `grep` for `blue-` classes in `main-layout.tsx`
- THEN zero matches are returned

---

### Requirement: Dashboard Card Consistency

All stat cards and KPI tiles on dashboard pages (admin, supervisor, monitor, audit, manager, quality-manager, billing, default) MUST use the brand token palette. Metric value text that previously used `text-blue-*` MUST use `text-primary` or a chart token. Badge variants indicating status MUST derive color from semantic tokens defined in `globals.css`. No hardcoded `blue-*`, `sky-*`, or `cyan-*` Tailwind classes MUST remain on dashboard pages.

#### Scenario: Stat card metric value uses brand token

- GIVEN a dashboard page is rendered
- WHEN a stat card displays a numeric KPI value
- THEN the value text uses `text-primary`, `text-chart-1`, or another brand-token class
- AND no `text-blue-`, `text-sky-`, or `text-cyan-` class is present on that element

#### Scenario: Dashboard badge uses semantic token

- GIVEN any status badge on a dashboard page
- WHEN the badge is rendered
- THEN the badge variant references a CSS-variable-backed color (e.g. `bg-primary/20 text-primary`)
- AND the badge color is visually distinct from `destructive` and `muted` variants

#### Scenario: Full dashboard blue-class grep returns zero

- GIVEN all 8 dashboard page files and their imported components
- WHEN a developer runs `grep -r "bg-blue\|text-blue\|border-blue\|from-blue\|to-blue\|bg-sky\|text-sky" frontend/app/dashboard`
- THEN the result is zero matches

---

### Requirement: Form and Lot Page Brand Styling

Form pages (lot-form, visual-inspection-form) and lot list/detail pages MUST use `ring-primary` for focus states, `bg-primary` for submit buttons, and brand-token section headings. Status badges (`lot-status-badge`, `form-status-badge`) MUST use a unified palette derived from CSS tokens. No focus ring MUST use a blue color class.

#### Scenario: Form input focus ring uses brand token

- GIVEN a user focuses any input on a form page
- WHEN the focus ring appears
- THEN the ring color is Deep Orange (matches `--ring: 14 100% 57%`)
- AND no `focus:border-blue-` or `focus:ring-blue-` class is present on the input element

#### Scenario: Submit button uses primary token

- GIVEN a user opens any lot or inspection form
- WHEN the submit/save button is visible
- THEN the button uses `bg-primary` with `text-primary-foreground`
- AND no `bg-blue-` class is present on the button

#### Scenario: Status badge unified palette

- GIVEN a lot list page with multiple status badges
- WHEN the badges render for statuses: pending, in-progress, completed, rejected
- THEN each badge uses a distinct color from the brand palette
- AND all badge colors originate from CSS variable tokens (not hardcoded hex or blue Tailwind classes)

---

### Requirement: Dark Mode WCAG Compliance

All text-on-background combinations MUST achieve a minimum contrast ratio of 4.5:1 (WCAG AA) in dark mode. Primary orange (`#ff5722`) on dark background (`#1a1a1a`) MUST be verified — if contrast is insufficient, `--primary-dark` (`#e64a19`) MUST be used for body text contexts. No white-on-white or invisible-text conditions MUST exist on any of the 10 application routes.

#### Scenario: Orange button label passes WCAG AA in dark mode

- GIVEN dark mode is active
- WHEN a primary button with `bg-primary text-white` is rendered
- THEN the contrast ratio between white text and the orange background is ≥ 4.5:1
- AND the button is visually distinguishable from the dark card background

#### Scenario: Primary text on dark background passes WCAG AA

- GIVEN dark mode is active and a component uses `text-primary` on `bg-background` (`#1a1a1a`)
- WHEN the contrast is measured
- THEN the ratio is ≥ 3:1 (WCAG AA for large/bold text) OR `text-primary-dark` is used instead for body-size text

#### Scenario: No invisible text in dark mode

- GIVEN dark mode is active across all 10 routes
- WHEN each page is visually reviewed
- THEN no text element renders with the same color as its immediate background
- AND no input placeholder is invisible against the input background

#### Scenario: Foreground text on card surfaces passes contrast

- GIVEN dark mode with `--card: 0 0% 14%` (#242424) and `--card-foreground: 0 0% 96%` (#f5f5f5)
- WHEN card body text is measured
- THEN the contrast ratio is ≥ 7:1 (well above WCAG AA)

#### Scenario: Glass card text legible on blurred background

- GIVEN the login page glass card in dark mode
- WHEN text inside the card is rendered over the blurred background
- THEN all text meets ≥ 4.5:1 contrast with the effective composite background
