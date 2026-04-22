# Design Style: Countdown – Prelaunch Page

**Frame ID**: `2268:35127`
**Frame Name**: `Countdown - Prelaunch page`
**Screen ID**: `8PJQswPZmU`
**File Key**: `9ypp4enmFmdK3YAFJLIu6C`
**Figma Link**: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/8PJQswPZmU
**Canvas Size**: `1512 × 1077 px` (desktop)
**Extracted At**: 2026-04-21

---

## Design Tokens

### Colors

All tokens are **reused from the Homepage** (`specs/i87tDx10uM-Homepage/design-style.md`) — no new colors introduced by this screen.

| Token | Hex | Usage on this page |
|-------|-----|--------------------|
| `--color-bg-page` | `#00101A` | Page root background |
| `--color-border-gold` | `#FFEA9E` | Digit tile border (0.75px) |
| `--color-text-white` | `#FFFFFF` | Title, digit glyph, unit labels |
| `--color-accent-glow` | `#FAE287` | (not used on this page — no glow shadow) |

#### Cover gradient (hero overlay, node `2268:35130`)

```css
background: linear-gradient(
  18deg,
  #00101A 15.48%,
  rgba(0, 18, 29, 0.46) 52.13%,
  rgba(0, 19, 32, 0) 63.41%
);
```

> Note: this gradient is at **18deg** (vs Homepage's 12deg) — slightly more vertical tilt. Use the exact angle for pixel match.

#### Digit tile backdrop

```css
background: linear-gradient(180deg, #FFFFFF 0%, rgba(255, 255, 255, 0.10) 100%);
opacity: 0.5;
backdrop-filter: blur(24.96px);
-webkit-backdrop-filter: blur(24.96px);
```

> Homepage uses `blur(16.64px)` — this prelaunch page uses `blur(24.96px)` (1.5×), matching the 1.5× larger tile size.

---

### Typography

Primary family: **Montserrat** (already loaded).
Digit family: **Digital Numbers** *(reused from Homepage config; see Homepage design-style.md §Typography)*.

| Token | Family | Size | Weight | Line Height | Letter Spacing | Usage on this page |
|-------|--------|------|--------|-------------|----------------|--------------------|
| `--text-prelaunch-title` | Montserrat | 36px | 700 | 48px | 0 | Title "Sự kiện sẽ bắt đầu sau" |
| `--text-prelaunch-unit` | Montserrat | 36px | 700 | 48px | 0 | DAYS / HOURS / MINUTES unit labels |
| `--text-prelaunch-digit` | Digital Numbers | 73.728px | 400 | 1 em | 0 | Digit glyphs (0-9) inside tiles |

> **Relation to Homepage**: Homepage countdown uses `24 / 700 / 32` labels and `49.152 / 400` digits. This prelaunch page scales both by ~1.5× (36 / 700 / 48 labels, 73.728 / 400 digits).

---

### Spacing

| Token | Value | Usage on this page |
|-------|-------|--------------------|
| `--space-4` | 21px | Gap between each digit tile (within a unit's digit row) and gap between digit row and unit label |
| `--space-6` | 24px | Gap between title and Time frame inside `Countdown time` (node `2268:35136`) |
| `--space-7` | 60px | Gap between DAYS / HOURS / MINUTES unit frames |
| `--pad-content-x` | 144px | Wrapper `Bìa` horizontal padding |
| `--pad-content-y` | 96px | Wrapper `Bìa` vertical padding |
| `--spacing-section-gap` | 120px | Wrapper `Bìa` internal gap (only 1 child so not visually impactful) |

---

### Border & Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--border-thin-gold` | 0.75px solid `#FFEA9E` | Digit tile border (slightly thicker than Homepage's 0.5px) |
| `--radius-lg-alt` | 12px | Digit tile radius (Homepage uses 8px) |

### Shadows / Effects

None on this page. The gold-glow box-shadow that appears on the Homepage's award cards and widget button is **absent** here.

### Component States

*The page contains no interactive elements (no buttons, no links, no inputs). Therefore no hover / focus / active / disabled / error states are defined. Digit tiles update their rendered character over time, but this is a data-driven content change, not a UI state change.*

### Z-index layers

Reused from Homepage tokens. Only two layers used:

| Token | Value | Element |
|-------|-------|---------|
| `--z-hero-bg` | 1 | BG image + Cover gradient (both `zIndex: 1` per Figma) |
| `--z-content` | 2 | `Bìa` wrapper containing the countdown |

---

## Layout Specifications

### Top-level canvas (desktop 1512 wide)

| Region | Size | Position | Notes |
|--------|------|----------|-------|
| Page root | `1512 × 1077` | static | `background-color: #00101A` |
| BG Image | `1512 × 1077` | `position: absolute; top:0; left:0` | `url(...) lightgray -142px -789.753px / 109.392% 216.017% no-repeat` — the asset is shifted up-left and scaled 109% × 216% so only a portion is visible (the wave pattern on the right half) |
| Cover gradient | `1512 × 1077` | `position: absolute; top:0` | 18deg gradient |
| Bìa content wrapper | `1512 × 456` | `position: absolute` (per Figma) | `flex; column; padding 96px 144px; gap 120px; alignItems: center; justifyContent: center` |
| Countdown content | `1512 × 264` | inside Bìa | `flex; column; gap 24px; alignItems: center` |

### Countdown content hierarchy

```
Bìa (1512 × 456, padding 96/144, centered)
└── Frame 487 (1512 × 264, column, gap 60)  [only 1 child active]
    └── Frame 523 (1512 × 264, column, gap 24, alignItems: center)
        └── Countdown time (1512 × 264, column, gap 24, alignItems: center)
            ├── Title "Sự kiện sẽ bắt đầu sau" (1512 × 48, Montserrat 36/700, centered)
            └── Time (644 × 192, row, gap 60, alignItems: center)
                ├── 1_Days (175 × 192, column, gap 21)
                │   ├── Frame 485 (175 × 123, row, gap 21): two 77×123 digit tiles
                │   └── DAYS label (103 × 48, Montserrat 36/700)
                ├── 2_Hours (175 × 192, same structure)
                └── 3_Minutes (175 × 192, same structure)
```

### ASCII layout

```
┌─ Countdown page (1512 × 1077) ─────────────────────────────────────────┐
│ ░░░░░ BG image (wave/roots) + Cover gradient (18deg dark → transparent)│
│                                                                         │
│                   ╔═══════════════════════════════════╗                 │
│                   ║   Sự kiện sẽ bắt đầu sau          ║ ← 36/700 title  │
│                   ║                                   ║                 │
│                   ║  ┌──┐ ┌──┐   ┌──┐ ┌──┐   ┌──┐ ┌──┐  ║              │
│                   ║  │00│ │  │   │05│ │  │   │20│ │  │  ║ ← 77×123     │
│                   ║  └──┘ └──┘   └──┘ └──┘   └──┘ └──┘  ║    tiles     │
│                   ║                                   ║                 │
│                   ║  DAYS         HOURS        MINUTES ║ ← 36/700 labels│
│                   ╚═══════════════════════════════════╝                 │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Component Style Details

### Page root (`2268:35127`)

| Property | Value |
|----------|-------|
| Size | `1512 × 1077` |
| Background | `#00101A` |
| No padding — children are absolute-positioned over the full canvas |

### BG Image (`2268:35129`)

| Property | Value |
|----------|-------|
| Position | `absolute; top: 0; left: 0` |
| Size | `1512 × 1077` |
| Background | `url(keyvisual-bg.png) lightgray -142px -789.753px / 109.392% 216.017% no-repeat` |
| z-index | 1 |

### Cover gradient (`2268:35130`)

| Property | Value |
|----------|-------|
| Position | `absolute; top: 0; left: 0` |
| Size | `1512 × 1077` |
| Background | `linear-gradient(18deg, #00101A 15.48%, rgba(0,18,29,0.46) 52.13%, rgba(0,19,32,0) 63.41%)` |
| z-index | 1 (same as BG — painted later in DOM order) |

### Content wrapper `Bìa` (`2268:35131`)

| Property | Value |
|----------|-------|
| Size | `1512 × 456` (Figma) — in implementation, use `min-height: 100vh` with flex centering so the block is vertically/horizontally centered in the viewport |
| Padding | `96px 144px` |
| Layout | flex column, `alignItems: center; justifyContent: center; gap: 120px` |
| z-index | `2` (content layer, above BG at z=1) |

> **Implementation note**: Figma shows `position: absolute` because it's the only stacked element at its depth — in CSS we use a normal flex container with `min-height: 100vh; align-items: center; justify-content: center` so the countdown stays centered on any viewport, with the BG image + gradient painted beneath via `position: absolute; inset: 0`.

### Countdown time (`2268:35136`)

| Property | Value |
|----------|-------|
| Size | `1512 × 264` |
| Layout | flex column, `alignItems: center; justifyContent: center; gap: 24px` |

### Title text (`2268:35137`)

| Property | Value |
|----------|-------|
| Size | `1512 × 48` (full-width, centered) |
| Font | Montserrat 36 / 700 / 48 / 0 |
| Color | `#FFFFFF` |
| `text-align` | `center` |
| Content | "Sự kiện sẽ bắt đầu sau" (VN) / "The event will begin in" (EN) |

### Time frame (`2268:35138`)

| Property | Value |
|----------|-------|
| Size | `644 × 192` |
| Layout | flex row, `alignItems: center; justifyContent: flex-start; gap: 60px` |
| Children | three units: 1_Days, 2_Hours, 3_Minutes |

### Unit frame (`2268:35139` / `2268:35144` / `2268:35149`)

| Property | Value |
|----------|-------|
| Size | `175 × 192` each |
| Layout | flex column, `alignItems: flex-start; justifyContent: center; gap: 21px` |

### Digit row (Frame 485, inside each unit)

| Property | Value |
|----------|-------|
| Size | `175 × 123` |
| Layout | flex row, `alignItems: center; justifyContent: flex-start; gap: 21px` |
| Children | two digit tiles (Group 5 + Group 4) |

### Digit tile (`Group 5` / `Group 4`) — each one cell of the pair

| Property | Value |
|----------|-------|
| Outer wrapper | `77 × 123` |
| Inner Rectangle 1 | `76.8 × 122.88` (slightly smaller than wrapper) |
| Border | `0.75px solid #FFEA9E` |
| Border radius | `12px` |
| Background | `linear-gradient(180deg, #FFFFFF 0%, rgba(255,255,255,0.10) 100%)` |
| Opacity | `0.5` |
| Backdrop filter | `blur(24.96px)` + `-webkit-backdrop-filter: blur(24.96px)` |
| Digit glyph | `59 × 95` centered — Digital Numbers `73.728px / 400`, `#FFFFFF`, `text-align: left`, `letter-spacing: 0%` |

### Unit label (DAYS / HOURS / MINUTES)

| Property | Value |
|----------|-------|
| Font | Montserrat `36 / 700 / 48 / 0` |
| Color | `#FFFFFF` |
| `text-align` | `left` |
| DAYS width | 103px (natural) |
| HOURS width | 138px |
| MINUTES width | 173px |

---

## Responsive Specifications

### Breakpoints

Reused from Homepage:

| Name | Min | Max |
|------|-----|-----|
| Mobile | 0 | 767 |
| Tablet | 768 | 1023 |
| Desktop | 1024 | ∞ |

> Figma only shows desktop. Responsive behaviour below is derived from the 1.5× scaling factor relative to the Homepage countdown (which has mobile / tablet specs).

### Mobile (<768px)

| Component | Changes |
|-----------|---------|
| Bìa padding | `48px 24px` |
| Title font | `24px / 32px` |
| Time frame | wrap: three units stack vertically, gap `32px`; OR keep in row if viewport ≥480px with reduced unit width |
| Digit tile | scale to `56 × 88`, border `0.5px`, radius `8px` |
| Digit font | `56px` |
| Unit label | `24 / 700 / 32` |

### Tablet (768–1023px)

| Component | Changes |
|-----------|---------|
| Bìa padding | `72px 48px` |
| Title font | `30px / 40px` |
| Time frame | row, gap `40px` |
| Digit tile | `68 × 108` |
| Digit font | `64px` |
| Unit label | `30 / 700 / 40` |

### Desktop (≥1024px)

All values above match Figma desktop spec (77 × 123 tiles, 73.728 digits, 36px labels).

### Reduced motion

Reused global reset — no transitions on digit value change by default, so no extra handling needed.

---

## Icon / Font Specifications

| Asset | Source | Usage |
|-------|--------|-------|
| `public/assets/homepage/images/keyvisual-bg.png` | Reused from Homepage | BG image (shifted with negative offset + scale 109% × 216% per spec) |
| Digital Numbers font | `public/assets/homepage/fonts/DigitalNumbers-Regular.woff2` (or CSS fallback `Courier New, monospace` until font file is licensed) | Digit glyphs |

No new assets required for this screen.

---

## Animation & Transitions

None in MVP. Digits update instantly. No hover states (no interactive elements on this page).

---

## Implementation Mapping

| Design Element | Figma Node | Tailwind / CSS Strategy | React Component / File Path |
|----------------|-----------|-------------------------|-----------------------------|
| Route handler | — | — | `src/app/prelaunch/page.tsx` — Server Component; calls `generateMetadata`; renders `<PrelaunchPage />` |
| Page wrapper | `2268:35127` | `relative min-h-screen overflow-hidden` + bg `#00101A` | `src/components/prelaunch/PrelaunchPage.tsx` |
| Background image + overlay | `2268:35129` / `2268:35130` | `absolute inset-0` image + gradient overlay | `<HeroBackdrop variant="prelaunch">` — extend existing `src/components/homepage/HeroBackdrop.tsx` with optional `variant` prop (keyvisual only, different 18° gradient) |
| Centered wrapper | `2268:35131` | `flex flex-col items-center justify-center px-36 py-24 min-h-screen` | inline in `<PrelaunchPage />` |
| Title | `2268:35137` | Montserrat 36/700/48 centered `<h1>` | `<PrelaunchTitle />` in `src/components/prelaunch/PrelaunchTitle.tsx` — reads i18n key `prelaunch.title` |
| Countdown (shared) | `2268:35136` / `2268:35138` | flex column gap-6 + flex row gap-[60px] | `<Countdown size="large" targetIso={...} />` — same file `src/components/homepage/Countdown.tsx`, new `size` prop (see FR-009). `size="default"` = Homepage; `size="large"` = Prelaunch |
| Unit (shared) | `2268:35139/9144/9149` | flex col gap-[21px] (large) / gap-[14px] (default) | `<CountdownUnit size="large" />` in `src/components/homepage/CountdownUnit.tsx` |
| Digit tile (shared) | `Group 5` / `Group 4` | 77×123 (large) / 51×82 (default) glass tile | `<CountdownDigitTile size="large" />` in `src/components/homepage/CountdownDigitTile.tsx` |
| i18n | — | — | `src/i18n/messages/vi.json` + `en.json` — new `prelaunch.*` namespace (title, metadata); reuses `homepage.hero.countdown.*` |

---

## Notes

- **Reuse everything from Homepage countdown.** The only new things are: (1) a `size` prop variant on `<Countdown>` / `<CountdownUnit>` / `<CountdownDigitTile>`, (2) a new `<PrelaunchPage />` component at `src/app/prelaunch/page.tsx` (or short-circuit logic in `middleware.ts`), (3) new i18n keys under `prelaunch.*`.
- **Do NOT render Header or Footer** on this page. The `<PrelaunchPage />` is minimal.
- **Ignore Supabase session** on this route — it's public. Middleware must whitelist `/prelaunch`.
- **Accessibility: one `aria-live="polite"` on `<Countdown>`** — already implemented on the Homepage variant; carry over.
- **Gradient angle is 18deg** (vs 12deg on Homepage). Reproduce exactly — it's a small but visible difference.
- **Backdrop blur is 24.96px** (vs 16.64px on Homepage). Also 1.5× — keeps the relative weight consistent with the tile size jump.
- **`<html lang>` must reflect active locale** — same `generateMetadata` + `getTranslations` pattern as Homepage.
