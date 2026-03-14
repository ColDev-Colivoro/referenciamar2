# Design System — ColdevConAC

**Fuente de verdad**: Design tokens y convenciones visuales del programa.  
**Ref**: ColDevPOS + coldev-landing (misma marca ColDev)

---

## Nombre oficial del programa

```
ColdevConAC
```

- Nombre técnico: `coldevconac`
- Nombre en package.json: `coldevconac-frontend`
- Título en metadata: `ColdevConAC`

---

## Brand Colors

| Token | Hex | Uso |
|-------|-----|-----|
| `--color-brand` | `#ff5722` | Primary, botones, links, ring, hover |
| `--color-brand-dark` | `#1a1a1a` | Background oscuro base |
| `--color-accent` | `#ffeb3b` | Accent, highlights, chart-2 |
| `--color-surface` | `#242424` | Cards, popovers (dark mode) |
| `--color-surface-hover` | `#2f2f2f` | Secondary, hover states |
| `--color-border` | `#2d2d30` | Borders (dark mode) |
| `--color-text-primary` | `#f5f5f5` | Foreground (dark) |
| `--color-text-secondary` | `#a1a1aa` | Muted foreground |

### CSS Variables → shadcn/ui mapping

```css
/* Dark mode */
--background:   0 0% 10%          /* #1a1a1a */
--foreground:   0 0% 96%          /* #f5f5f5 */
--card:         0 0% 14%          /* #242424 */
--primary:      14 100% 57%       /* #ff5722 orange */
--primary-foreground: 0 0% 100%   /* white */
--accent:       54 100% 62%       /* #ffeb3b yellow */
--accent-foreground: 0 0% 9%      /* dark text on yellow */
--secondary:    0 0% 18%          /* #2f2f2f */
--muted-foreground: 240 4% 65%    /* #a1a1aa */
--border:       270 2% 18%        /* #2d2d30 */
--ring:         14 100% 57%       /* orange focus ring */
--sidebar-primary: 14 100% 57%    /* orange sidebar accent */

/* Light mode */
--background:   0 0% 97%          /* near white */
--primary:      14 100% 57%       /* orange (same) */
--accent:       54 100% 62%       /* yellow (same) */
```

---

## Fuente

```
Font stack:
  'Iosevka', 'Cascadia Mono', 'Fira Code', 'Consolas', ui-sans-serif, system-ui, sans-serif

CDN:
  https://cdn.jsdelivr.net/npm/iosevka-webfonts@6.0.0/iosevka/iosevka.css

En layout.tsx: cargado via <link> en <head>
```

---

## Tema por defecto

```
defaultTheme: "dark"
```

Consistente con ColDevPOS y coldev-landing.

---

## Efectos y utilidades CSS

### `.glass-card`
```css
background: rgba(26, 26, 26, 0.6);
backdrop-filter: blur(12px);
border: 1px solid rgba(255, 255, 255, 0.06);
```

### `.hover-lift`
```css
transition: transform 0.2s ease, box-shadow 0.2s ease;
/* hover: */ transform: translateY(-2px);
            box-shadow: 0 12px 40px -12px rgba(255, 87, 34, 0.25);
```

### `.hero-fade-in`
```css
opacity: 0;
animation: heroFadeIn 0.6s ease-out forwards;
/* keyframe: */ from { opacity:0; transform: translateY(12px); }
                to   { opacity:1; transform: translateY(0); }
/* delays: */ -delay-1: 0.1s  -delay-2: 0.2s  -delay-3: 0.35s
```

### Gradiente de fondo (dark mode body)
```css
background-image:
  radial-gradient(1200px 500px at -5% -10%, rgba(255,87,34,0.18), transparent 60%),
  radial-gradient(900px 400px at 110% 0%, rgba(255,235,59,0.08), transparent 55%);
```

### `::selection`
```css
background-color: rgba(255, 87, 34, 0.3);
color: #fff;
```

---

## Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `frontend/app/globals.css` | Design tokens ColDev, efectos, Iosevka import |
| `frontend/styles/globals.css` | Re-exporta app/globals.css |
| `frontend/app/layout.tsx` | Nombre ColdevConAC, link Iosevka, defaultTheme dark |
| `frontend/package.json` | name: coldevconac-frontend |

---

## Referencias de donde se tomó

- `ColdevPos- Completo/coldev-landing/src/styles/global.css`
- `ColdevPos- Completo/programa inventario/src/index.css`

Ambos usan exactamente los mismos tokens de brand.
