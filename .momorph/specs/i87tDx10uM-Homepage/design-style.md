# Design Style: Homepage SAA 2025

**Frame ID**: `2167:9026`
**Frame Name**: `Homepage SAA`
**Screen ID**: `i87tDx10uM`
**File Key**: `9ypp4enmFmdK3YAFJLIu6C`
**Figma Link**: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/i87tDx10uM
**Canvas Size**: `1512 × 4480 px` (desktop)
**Extracted At**: 2026-04-21

---

## Design Tokens

### Colors

Values taken verbatim from Figma; internal CSS variable names preserved for traceability.

| Token Name | Hex | Opacity | Figma var | Usage |
|------------|-----|---------|-----------|-------|
| `--color-bg-page` | `#00101A` | 100% | — | Page background, gradient start |
| `--color-bg-header` | `#101417` | 80% | — | Sticky header background (`rgba(16,20,23,0.8)`) |
| `--color-bg-sunkudos-media` | `#0F0F0F` | 100% | — | Sunkudos card media backdrop |
| `--color-btn-primary-bg` | `#FFEA9E` | 100% | `--Details-Text-Primary-1` | Gold filled buttons (About Awards, Widget, Sunkudos Chi tiết) |
| `--color-btn-secondary-bg` | `#FFEA9E` | 10% | `--Details-SecondaryButton-Normal` | Outline buttons (About Kudos), footer nav btn |
| `--color-accent-glow` | `#FAE287` | 100% | — | Gold glow in box-shadow / text-shadow |
| `--color-accent-warm` | `#DBD1C1` | 100% | — | Decorative "KUDOS" wordmark |
| `--color-text-white` | `#FFFFFF` | 100% | `--Details-Text-Secondary-1` | Body / nav / labels (default text) |
| `--color-text-gold` | `#FFEA9E` | 100% | `--Details-Text-Primary-1` | Section headings, selected nav, card titles |
| `--color-text-on-btn` | `#00101A` | 100% | — | Text on gold buttons |
| `--color-border-subtle` | `#998C5F` | 100% | `--Details-Border` | Profile icon border, secondary button border |
| `--color-border-gold` | `#FFEA9E` | 100% | `--Details-Text-Primary-1` | Selected nav underline, countdown tile border |
| `--color-divider` | `#2E3940` | 100% | `--Details-Divider` | Footer top border, section dividers |
| `--color-status-notification` | `#D4271D` | 100% | — | Unread notification badge dot |
| `--color-shadow-soft` | `#000000` | 25% | — | Drop-shadow alpha channel |

#### Cover gradient (hero overlay, node `2167:9029`)

```css
background: linear-gradient(
  12deg,
  #00101A 23.7%,
  rgba(0,18,29,0.46) 38.34%,
  rgba(0,19,32,0) 48.92%
);
```

#### Countdown tile backdrop (inside B1.3.* `Rectangle 1`)

```css
background: linear-gradient(180deg, #FFFFFF 0%, rgba(255,255,255,0.10) 100%);
opacity: 0.5;
backdrop-filter: blur(16.64px);
```

---

### Typography

Primary family: **Montserrat** (already loaded in project from Login screen setup).
Secondary family: **Montserrat Alternates** (footer copyright — already loaded).
Display family (digits): **Digital Numbers** *(new dependency — see §Icon/Font Specs)*.
Decorative wordmark (Figma uses): **SVN-Gotham** — **DO NOT load as a web font**; see §Icon / Font Specifications. The "KUDOS" wordmark appears only once on the page and MUST be rendered as an image asset (SVG or PNG) exported from Figma to avoid font-licensing concerns. The size/weight/letter-spacing below document the *appearance* of that image asset, not a live text rendering.

| Token Name | Family | Size | Weight | Line Height | Letter Spacing | Usage |
|------------|--------|------|--------|-------------|----------------|-------|
| `--text-display` | Montserrat | 57px | 700 | 64px | -0.25px | Section display headlines ("Hệ thống giải thưởng", "Sun* Kudos") |
| `--text-h2` | Montserrat | 24px | 700 | 32px | 0 | Sub-headings ("Coming soon", countdown labels, "Phong trào ghi nhận", Widget button label) |
| `--text-h3` | Montserrat | 24px | 400 | 32px | 0 | Award card titles |
| `--text-cta-large` | Montserrat | 22px | 700 | 28px | 0 | About Awards / About Kudos CTA labels |
| `--text-body-strong` | Montserrat | 16px | 700 | 24px | 0.15px | Nav links, body strong, Sunkudos body, footer copy |
| `--text-body` | Montserrat | 16px | 400 | 24px | 0.5px | Award card descriptions, event info |
| `--text-button-link` | Montserrat | 16px | 500 | 24px | 0.15px | "Chi tiết" text-link button on cards |
| `--text-nav-sm` | Montserrat | 14px | 700 | 20px | 0.1px | Header nav (default/hover states) |
| `--text-countdown` | Digital Numbers | 49.152px | 400 | 1 (em) | 0 | Countdown digits (DD/HH/MM) |
| `--text-footer-copy` | Montserrat Alternates | 16px | 700 | 24px | 0 | Footer copyright |
| ~~`--text-kudos-wordmark`~~ | ~~SVN-Gotham~~ | ~~96.158px~~ | ~~400~~ | ~~24.04px~~ | ~~-13%~~ | *Not a live-text token — exported as `kudos-wordmark.svg`. Values retained for reference if the asset is ever regenerated.* |

> Note: letter-spacing values like `0.1px`, `0.15px`, `0.5px` are Figma-absolute (px). Convert to relative if preferred: `0.15px ÷ 16px ≈ 0.0094em`.

---

### Spacing

Unique pixel values observed in padding and auto-layout gaps.

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Tight gaps (nav btn internal, card text stack, countdown digit↔label) |
| `--space-2` | 8px | CTA button internal, event-info lines, countdown row |
| `--space-3` | 10px | Header logo wrap, Sunkudos outer |
| `--space-4` | 14px | Countdown tile internal (digit-group↔label) |
| `--space-5` | 16px | Countdown outer, Awards header internal, nav-button padding, CTA padding-y |
| `--space-6` | 24px | Award card stack, CTA padding-x, Sunkudos body gap |
| `--space-7` | 32px | Sunkudos content vertical |
| `--space-8` | 40px | Countdown tiles row, CTA pair, footer inner |
| `--space-9` | 80px | Section vertical rhythm (Awards header ↔ grid, footer inner) |
| `--space-10` | 120px | Major section separator on main canvas |
| `--pad-header-x` | 144px | Header horizontal padding (desktop) |
| `--pad-header-y` | 12px | Header vertical padding |
| `--pad-footer-x` | 90px | Footer horizontal padding |
| `--pad-footer-y` | 40px | Footer vertical padding |
| `--pad-content-x` | 144px | Main content wrapper padding-x |
| `--pad-content-y` | 96px | Main content wrapper padding-y |

---

### Border & Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 4px | Header hover-state nav button, Profile icon button, Notification inner, Sunkudos Chi tiết button |
| `--radius-md` | 8px | CTA buttons, countdown tile rectangle, hero wrapper frame |
| `--radius-lg` | 16px | Sunkudos media background card |
| `--radius-pill` | 100px | Widget floating button |
| `--border-thin` | 0.5px | Countdown tile border |
| `--border-default` | 1px | Profile icon border, About Kudos outline CTA, footer top border, selected-nav underline |
| `--border-award` | 0.955px | Award picture inner frame (quirky Figma value; round to 1px in impl) |

### Shadows / Effects

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-gold-glow` | `0 4px 4px 0 rgba(0,0,0,0.25), 0 0 6px 0 #FAE287` | Widget button, Award picture frames |
| `--text-shadow-glow` | `0 4px 4px rgba(0,0,0,0.25), 0 0 6px #FAE287` | Selected nav link (A1.2), footer nav hover |
| `--backdrop-blur-tile` | `blur(16.64px)` | Countdown digit glass tile |

### Z-index layers

A consistent layering schema to prevent overlap bugs:

| Token | Value | Element |
|-------|-------|---------|
| `--z-hero-bg` | `1` | Hero keyvisual background + Cover gradient |
| `--z-content` | `2` | Main content wrapper ("Bìa") and its children |
| `--z-widget` | `40` | Floating Widget button |
| `--z-header` | `50` | Fixed header |
| `--z-dropdown` | `60` | Profile menu, Language menu (MUST sit above header) |
| `--z-skip-link` | `70` | Skip-link (only visible when focused; must be above everything) |
| `--z-modal` | `80` | Reserved for future modals/dialogs |

---

## Layout Specifications

### Top-level canvas (desktop 1512 wide)

| Region | Size | Position | Notes |
|--------|------|----------|-------|
| Page root | `1512 × 4480` | static | `background-color: #00101A` |
| Header (A1) | `1512 × 80` | `position: fixed; top:0` | z-index 50, backdrop glass |
| Hero Keyvisual (3.5) | `1512 × 1392` | `position: absolute; top:0; z-index:1` | image + gradient cover |
| Main content wrapper ("Bìa" 2167:9030) | `~1224` centered | `padding: 96px 144px` | stack gap 120px |
| Widget button (6) | `105 × 64` | `position: absolute; top:830px; right:19px` | floating |
| Footer (7) | `1512 × auto` | flow end | `padding: 40px 90px`, top-border `1px #2E3940` |

### Section vertical flow (after hero)

```
┌─ Hero Keyvisual (1512 × 1392) ───────────────────────────┐
│  ROOT FURTHER title + countdown + event info + CTA pair  │
└───────────────────────────────────────────────────────────┘
          │ 120px gap (auto-layout)
┌─ ROOT FURTHER description (B4) ───────────────────────────┐
│  Multi-line paragraph (wraps to container width)          │
└───────────────────────────────────────────────────────────┘
          │ 120px gap
┌─ Awards section ─────────────────────────────────────────┐
│  C1 Header (caption + display title + description)        │
│     │ 80px gap                                            │
│  C2 Award list (3 × 2 grid, card 336×504, gap 24/24)      │
└───────────────────────────────────────────────────────────┘
          │ 120px gap
┌─ Sunkudos promo (D1, 1224 × 500) ─────────────────────────┐
│  Left: label + title + body + CTA.  Right: media + wordmark │
└───────────────────────────────────────────────────────────┘
          │ 120px gap
┌─ Footer (7) ──────────────────────────────────────────────┐
│  Logo      Nav  Nav  Nav            Copyright              │
└───────────────────────────────────────────────────────────┘
```

### Award grid (C2)

```
┌─ 1224px wide ─────────────────────────────────────────────┐
│ ┌─ 336×504 ─┐  ┌─ 336×504 ─┐  ┌─ 336×504 ─┐               │
│ │  picture  │  │  picture  │  │  picture  │               │
│ │  title    │  │  title    │  │  title    │               │
│ │  desc     │  │  desc     │  │  desc     │               │
│ │  [Chi tiết]│ │  [Chi tiết]│ │  [Chi tiết]│              │
│ └───────────┘  └───────────┘  └───────────┘               │
│           gap: 24px col, 24px row                         │
│ ┌───────────┐  ┌───────────┐  ┌───────────┐               │
│ │    …      │  │    …      │  │    …      │               │
│ └───────────┘  └───────────┘  └───────────┘               │
└───────────────────────────────────────────────────────────┘
```

---

## Component Style Details

### A1 — Header (`2167:9091`)

| Property | Value |
|----------|-------|
| **Node ID** | `2167:9091` |
| Position | `fixed; top:0; left:0; right:0; z-index:50` |
| Size | `1512 × 80` |
| Padding | `12px 144px` |
| Layout | `flex row; align-items:center; justify-content:space-between` |
| Background | `rgba(16,20,23,0.8)` |
| Children gap | `238px` (logo group ↔ right cluster) |

Children:
- **A1.1 Logo**: 64×60, clickable → scrolls to top.
- **Nav group**: 3 text links ("About SAA 2025" selected, "Awards Information", "Sun* Kudos"). Padding 16px, gap 4px.
- **Right cluster**: language button A1.7 ("VN"), notification A1.6 (bell + red dot), profile A1.8 (40×40 icon).

#### Nav link states (A1.2/A1.3/A1.5)

| State | Typography | Background | Border |
|-------|-----------|------------|--------|
| Normal | 14/700/20 `#FFFFFF` tracking 0.1px | transparent | none |
| Hover | same | `#FFEA9E @ 10%` | radius 4px |
| Selected | same; `text-shadow: var(--text-shadow-glow)`; color `#FFEA9E` | transparent | `1px solid #FFEA9E` on bottom edge |

### 3.5 — Hero Keyvisual background (`2167:9027`)

Pure decorative background; does NOT contain the foreground content (that lives in sibling "Bìa" frame).

| Property | Value |
|----------|-------|
| **Node ID** | `2167:9027` |
| Size | `1512 × 1392` |
| Background | image (`MM_MEDIA_Keyvisual BG`, node `2167:9028`) `cover no-repeat`; overlay gradient (Cover `2167:9029`) — see §Cover gradient above |

### Hero content block (`Frame 487` inside `Bìa 2167:9030`)

Foreground content stacked over the keyvisual background.

| Property | Value |
|----------|-------|
| Layout | flex column, gap `40px` |
| Small hero logo (`Frame 482` → `2788:12911 MM_MEDIA_Root Further Logo`) | pre-rendered image — size per Figma (approximately 240×120 on desktop); use `<Icon>` component with `alt={t('hero.root_further_alt')}` |
| Countdown block | B1 (see §B1.3.*) |
| Event info | B2 (see below) |
| CTA pair | B3 (see B3.1/B3.2 below) |

### ROOT FURTHER display block (`Frame 486` inside `Bìa 2167:9030`)

Large decorative text-as-images above the description. **Two separate image assets** side-by-side:

| Property | Value |
|----------|-------|
| Layout | Group 434 — two images side by side |
| Left image (`3204:10155 MM_MEDIA_Root Text`) | pre-rendered "ROOT" wordmark image |
| Right image (`3204:10154 MM_MEDIA_Further Text`) | pre-rendered "FURTHER" wordmark image |
| Accessibility | Parent receives an `sr-only` `<h1>` with `t('nav.sr_h1')`; both `<img>` elements have `alt=""` (decorative) — the h1 carries semantics |
| B4 content | 3 sibling `<p>` elements using i18n keys `hero.description_p1/p2/p3`; each is Montserrat 16/400/24/0.5, `#FFFFFF` |

### B1.3.1/2/3 — Countdown tile (per-unit frame)

Each DAYS/HOURS/MINUTES unit is a **column** stacking:
1. A **horizontal digit row** (two separate single-digit sub-tiles).
2. A **unit label** beneath.

Per-digit rendering is intentional — the design treats each digit as its own glass chip, so zero-padded values like `07` produce two adjacent chips.

| Property | Value |
|----------|-------|
| Outer tile | `116 × 128`, flex col, gap `14px` |
| Digit row (Frame 485) | flex row, gap per Figma (≈4–6px); contains two sub-tiles |
| Single sub-tile (Group 5 / Group 4) | `51.2 × 81.92` px |
| Sub-tile background | `linear-gradient(180deg, #FFFFFF 0%, rgba(255,255,255,0.10) 100%)`, `opacity: 0.5`, `backdrop-filter: blur(16.64px)` |
| Sub-tile border | `0.5px solid #FFEA9E` |
| Sub-tile radius | `8px` |
| Digit glyph | Digital Numbers, 49.152px / 400, `#FFFFFF`, centered |
| Label ("DAYS"/"HOURS"/"MINUTES") | Montserrat 24 / 700 / 32, `#FFFFFF` |

**Implementation note**: render each digit by splitting the zero-padded 2-char string (`"07".split("") → ["0","7"]`) and mapping each char to one sub-tile. When the value crosses a boundary (e.g. 10 → 9), both sub-tiles update in the same tick.

### B3.1 — About Awards CTA (primary, hover state)

| Property | Value |
|----------|-------|
| **Node ID** | `2167:9063` |
| Size | `276 × 60` |
| Padding | `16px 24px` |
| Gap | `8px` (icon ↔ label) |
| Background | `#FFEA9E` |
| Border | none |
| Radius | `8px` |
| Label | Montserrat 22/700/28, `#00101A` |
| Icon | small chevron/arrow on right, inherits text color |

**States:**
| State | Changes |
|-------|---------|
| Default | As above |
| Hover | slight scale or shadow emphasis (reuse `--shadow-gold-glow`) |
| Active | background `#F5DE7A` (fallback) |
| Focus | outline `2px solid #FFEA9E; outline-offset:2px` |
| Disabled | `opacity: 0.5; cursor: not-allowed` |

### B3.2 — About Kudos CTA (secondary outline)

| Property | Value |
|----------|-------|
| **Node ID** | `2167:9064` |
| Padding | `16px 24px` |
| Gap | `8px` |
| Background | `rgba(255,234,158,0.10)` |
| Border | `1px solid #998C5F` |
| Radius | `8px` |
| Label | Montserrat 22/700/28, `#FFFFFF` |

**States:**
| State | Changes |
|-------|---------|
| Default | As above (outline) |
| Hover | swap to B3.1 style (bg `#FFEA9E`, text `#00101A`) |
| Active | bg `#F5DE7A`, text `#00101A` |
| Focus | outline `2px solid #FFEA9E; outline-offset: 2px` |
| Disabled | `opacity: 0.5; cursor: not-allowed` |

### A1.6 — Notification button (`I2167:9091;186:2101`)

| Property | Value |
|----------|-------|
| Size | 40×40 (clickable wrapper ≥48×48 for a11y hit-target) |
| Padding | 10px (icon-only button) |
| Background | transparent |
| Radius | 4px |
| Icon | `icon-bell.svg` 24×24 `#FFFFFF` |
| Badge dot | 8×8 `#D4271D` circle, absolute top-right, visible only when `unread > 0` |

**States:**
| State | Changes |
|-------|---------|
| Default (MVP) | transparent bg; `aria-disabled="true"` (no panel to open yet) |
| Hover | bg `rgba(255,234,158,0.10)` (still clickable visually; cursor can be default pointer) |
| Active | bg `rgba(255,234,158,0.15)` |
| Focus | outline `2px solid #FFEA9E` |
| Unread (future — when notifications backend exists) | red 8×8 `#D4271D` circle absolute positioned top-right (`top:-2px; right:-2px`); button becomes a panel trigger (`aria-haspopup="dialog"`, remove `aria-disabled`) |

### A1.8 — Profile avatar button (`I2167:9091;186:1597`)

| Property | Value |
|----------|-------|
| Size | 40×40 (clickable wrapper ≥48×48 for a11y hit-target) |
| Padding | 10px |
| Background | transparent |
| Border | `1px solid #998C5F` |
| Radius | 4px |
| Content | either `<img>` of `user.avatar_url` (circular crop) or fallback `icon-user.svg` 24×24 |

**States:**
| State | Changes |
|-------|---------|
| Default | As above |
| Hover | border `#FFEA9E` |
| Active | bg `rgba(255,234,158,0.10)` |
| Focus | outline `2px solid #FFEA9E` |
| Menu-open (`aria-expanded=true`) | same as hover + retain on blur until menu closes |

### C1 — Awards section header (`2167:9069`)

Stack (gap 16px):
- Caption: "Sun* annual awards 2025" — Montserrat 24/700/32, `#FFFFFF`, letter-spacing 0.
- Display title: "Hệ thống giải thưởng" — Montserrat 57/700/64/-0.25px, `#FFEA9E`.
- Description: "Các hạng mục sẽ được trao giải theo TOP những người xuất sắc nhất." — Montserrat 16/400/24/0.5, `#FFFFFF`.

### C2.1 — Award card (`2167:9075`)

| Property | Value |
|----------|-------|
| **Node ID** | `2167:9075` (identical structure for C2.2–C2.6) |
| Size | `336 × 504` |
| Layout | flex column, gap `24px` |

Children:
- **Picture (C2.1.1)**: 336×336 square, `border: 0.955px solid #FFEA9E`, `border-radius` inherited from media, `box-shadow: 0 4px 4px rgba(0,0,0,0.25), 0 0 6px #FAE287`, `mix-blend-mode: screen`.
- **Text stack (Frame 490)**: 336×144, col, gap 4px.
  - **Title (C2.1.2)**: Montserrat 24/400/32, `#FFEA9E`.
  - **Description (C2.1.3)**: Montserrat 16/400/24/0.5, `#FFFFFF`, max 2 lines + ellipsis.
  - **Button (C2.1.4)** "Chi tiết": 88×56, padding `16px 0`, gap 4px, label Montserrat 16/500/24/0.15, `#FFFFFF`, no background, no radius.

**States:**
| State | Changes |
|-------|---------|
| Hover | lift `transform: translateY(-2px)`; intensify glow (`0 0 12px #FAE287`) |
| Focus | outline `2px solid #FFEA9E` on picture |

### D1 — Sunkudos card (`3390:10349`)

| Property | Value |
|----------|-------|
| Size | `1224 × 500` |
| Layout | flex row (content left, media right), gap per Figma |
| Media background | `#0F0F0F`, `border-radius: 16px`, image inside |
| Decorative wordmark ("KUDOS") | Exported image `kudos-wordmark.svg` — reference appearance: SVN-Gotham 96.158/400, `#DBD1C1`, letter-spacing -13%. DO NOT load SVN-Gotham as a web font. |

Content (D2):
- Label: "Phong trào ghi nhận" — Montserrat 24/700/32, `#FFFFFF`.
- Title: "Sun* Kudos" — Montserrat 57/700/64/-0.25, `#FFEA9E`.
- Body: ~3-line paragraph — Montserrat 16/700/24/0.5, `#FFFFFF`.
- **D2.1 Button "Chi tiết"**: 127×56, padding 16px, gap 8px, radius 4px, bg `#FFEA9E`, label Montserrat 16/700/24/0.15, `#00101A`.

### 6 — Widget floating button (`5022:15169`)

| Property | Value |
|----------|-------|
| Position | `fixed; bottom:24px; right:19px` (from top:830px on 1080-tall viewport) |
| Size | 106×64 inner |
| Padding | 16px |
| Gap | 8px |
| Background | `#FFEA9E` |
| Radius | `100px` (pill) |
| Shadow | `--shadow-gold-glow` |

Internal flex-row (left → right):
1. **Pencil icon** (`MM_MEDIA_Pen`) — 24×24, uses `<Icon>` component.
2. **Text "/"** — **live text**, Montserrat 24 / 700 / 32, color `#00101A`. This is NOT an icon.
3. **SAA/Kudos logo** (`MM_MEDIA_Kudos Logo`) — 24×24, uses `<Icon>` component.

**States:**
| State | Changes |
|-------|---------|
| Default (MVP) | As above; `aria-disabled="true"`, click handler is no-op |
| Hover (MVP) | subtle scale `transform: scale(1.03)` + intensified `--shadow-gold-glow` |
| Focus | outline `2px solid #FFEA9E; outline-offset: 2px` |
| Future (with menu) | replace `aria-disabled` with `aria-haspopup="menu"` + `aria-expanded`; otherwise identical |

### 7 — Footer (`5001:14800`)

| Property | Value |
|----------|-------|
| Size | `1512 × auto` |
| Padding | `40px 90px` |
| Layout | flex row, align-center, justify-space-between |
| Border-top | `1px solid #2E3940` |
| Nav inner (Frame 488) | 971×64, gap 80px |
| Nav button | 193×56, padding 16px, gap 4px, radius 0, bg `rgba(255,234,158,0.10)`, label Montserrat 16/700/24/0.15, `#FFFFFF` |
| Copyright | Montserrat Alternates 16/700/24, `#FFFFFF` |

**Four** nav buttons (per Figma node tree):
1. `7.2_Button-IC` — "About SAA 2025" (→ `/` — same route as Homepage; selected state on this page)
2. `7.3_Button-IC` — "Awards Information" (→ `/awards`)
3. `7.4_Button-IC` — "Sun* Kudos" (→ `/kudos`)
4. `7.5_Button-IC` — "Tiêu chuẩn chung" / "Common Standards" — **MVP: visual placeholder only, no navigation**. Render identically to other footer nav buttons (normal state) but with `aria-disabled="true"` and suppressed click. Target route (`/standards`) will be wired when the Standards screen is specified.

**State variants** (same rules as header nav): normal / hover (bg `rgba(255,234,158,0.10)`) / selected (1px gold underline + text-shadow glow). On the homepage itself, "About SAA 2025" is the selected footer link.

---

## Responsive Specifications

### Breakpoints

| Name | Min | Max | Canvas width |
|------|-----|-----|--------------|
| Mobile | 0 | 767 | design at 375 |
| Tablet | 768 | 1023 | design at 768 |
| Desktop | 1024 | ∞ | design at 1440 |

> Figma shows only the desktop variant. Responsive rules below are derived from Sun*/SAA design conventions, the Login screen breakpoint decisions, and the component-level `nameTrans` notes (e.g., "grid 2 cột trên mobile/tablet, 3 cột trên desktop").

### Mobile (<768px)

| Component | Changes |
|-----------|---------|
| Header padding-x | `16px` |
| Main content padding-x | `24px` |
| Main content padding-y | `64px` |
| Section gap | `64px` |
| Hero title | `40px/44px` |
| Section display title | `32px/40px` |
| Countdown tile | scale to `72 × 88` |
| Countdown digit | `28px` |
| CTA pair | stack vertical, button `width: 100%` |
| Award grid | `2 columns`, card `auto × 420` |
| Sunkudos card | stack column (content over media) |
| Footer | stack column, gap 24px |
| Widget button | `bottom: 16px; right: 16px` |

### Tablet (768–1023px)

| Component | Changes |
|-----------|---------|
| Header padding-x | `48px` |
| Main content padding-x | `48px` |
| Section gap | `80px` |
| Hero title | `48px/52px` (scale between mobile 40 and desktop 57) |
| Countdown tile | scale to `96 × 112`, digit `36px` |
| CTA pair | stay horizontal but allow wrap if container <680px |
| Award grid | `2 columns`, card width ~320 |
| Sunkudos card | row layout, reduced vertical padding |
| Widget button | `bottom: 20px; right: 20px` |

*Values not listed here inherit from Desktop.*

### Desktop (≥1024px)

| Component | Changes |
|-----------|---------|
| Main content | `max-width: 1224px; margin: 0 auto` (design at 1512 with 144px side padding → content ≈ 1224) |
| Award grid | `3 columns`, card `336 × 504` fixed |
| All values above match Figma desktop spec |

### Reduced motion (`prefers-reduced-motion: reduce`)

All transitions (hover scale, gold-glow shadow transitions, countdown digit animations) become instant. Countdown **value** still updates — only decorative animations are suppressed.

---

## Icon / Font Specifications

| Icon / Asset | Size | Source | Usage |
|--------------|------|--------|-------|
| `icon-bell.svg` | 24×24 | Figma node export | Header notification button |
| `icon-user.svg` | 24×24 | Figma export | Header profile avatar placeholder |
| `icon-chevron-right.svg` | 20×20 | Figma export | CTA buttons (About Awards / Kudos) right arrow |
| `icon-arrow-right.svg` | 16×16 | Figma export | "Chi tiết" link arrow |
| `icon-pencil.svg` | 24×24 | Figma export (`MM_MEDIA_Pen`) | Widget button left icon |
| `icon-kudos-logo.svg` | 24×24 | Figma export (`MM_MEDIA_Kudos Logo`) | Widget button right icon |
| `icon-notification-dot.svg` | 8×8 | inline CSS circle `#D4271D` | Unread notification indicator |
| `flag-vn.svg`, `flag-us.svg`, `chevron-down.svg` | 24×24 | reused from Login | Language selector |
| **Image**: `root-further-hero-logo.png` | ≈240×120 | Figma export (`2788:12911 MM_MEDIA_Root Further Logo`) | Small ROOT FURTHER logo in hero block |
| **Image**: `root-text.png` | large (split pair) | Figma export (`3204:10155 MM_MEDIA_Root Text`) | Left half of large ROOT FURTHER display |
| **Image**: `further-text.png` | large (split pair) | Figma export (`3204:10154 MM_MEDIA_Further Text`) | Right half of large ROOT FURTHER display |
| **Image**: `keyvisual-bg.png` | 1512×1392 | Figma export (`2167:9028 MM_MEDIA_Keyvisual BG`) | Hero keyvisual full-bleed background |
| **Image**: `award-top-talent.png` etc. (6 files) | 336×336 each | Figma export (`MM_MEDIA_Top Talent`, `Top Project`, `Top Project Leader`, `Best Manager`, `Signature 2025 Creator`, `MVP`) | Award card thumbnails |
| **Image**: `kudos-background.png` | 1120×500 | Figma export (`MM_MEDIA_Kudos Background`) | Sunkudos card media |
| **Image**: `kudos-wordmark.svg` | 310×67 | Figma export (`MM_MEDIA_Logo/Kudos` → `KUDOS` text) | Decorative "KUDOS" watermark inside Sunkudos card — **exported as image, NOT rendered with SVN-Gotham font** (license/hosting concern) |
| Font: **Digital Numbers** | — | `public/assets/fonts/DigitalNumbers-Regular.woff2` | Countdown digits only (via `next/font/local`) |
| ~~Font: SVN-Gotham~~ | — | — | **Replaced by image asset** (see `kudos-wordmark.svg` above) |

> **Constraint (Constitution)**: ALL icons and images MUST be rendered through the existing `<Icon>` component (`src/components/ui/Icon.tsx`).
> The `<Icon>` component currently renders `<img>`; for SVG-only icons consider inline SVG or `<Image>` from Next.js for large raster assets (ROOT/FURTHER text, keyvisual background, award thumbnails). The existing `<Icon>` wrapper is still required — extend it if needed to support Next.js `<Image>` internally, rather than bypassing it.

---

## Animation & Transitions

| Element | Property | Duration | Easing | Trigger |
|---------|----------|----------|--------|---------|
| Nav link | background, text-shadow | 150ms | ease-out | Hover |
| CTA button | background, transform | 200ms | ease-out | Hover |
| Award card | transform, box-shadow | 250ms | ease-out | Hover |
| Countdown digit | (no transition by default; number flip optional) | 300ms | ease-in-out | Value change |
| Dropdown menus (lang, profile) | opacity, transform | 150ms | ease-out | Open/close |
| Widget button | transform (subtle scale) | 200ms | ease-out | Hover |

---

## Implementation Mapping

| Design Element | Figma Node | Tailwind / CSS Strategy | React Component |
|----------------|-----------|-------------------------|-----------------|
| Header | `2167:9091` | `fixed top-0 ... bg-[#101417]/80 backdrop-blur` | `<Header selectedNav="about-saa">` (generalized from Login) |
| Nav link (selected/hover/normal) | A1.2/A1.3/A1.5 | CSS-in-JS per state; selected = 1px underline + `--text-shadow-glow` | `<NavLink href state="selected\|default" />` |
| Language selector | A1.7 | reuse | `<LanguageSelector />` (from Login) |
| Notification bell | A1.6 | Tailwind `relative` + absolute-positioned 8×8 dot when unread | `<NotificationButton unreadCount={n} />` |
| Profile avatar | A1.8 | `rounded-sm border ...`; opens `<ProfileMenu />` | `<ProfileAvatar onClick />` + `<ProfileMenu isOpen />` |
| Hero Keyvisual bg + overlay | `2167:9027` / `2167:9029` | `absolute inset-0` image + overlay gradient | `<HeroBackdrop />` |
| Hero small logo | `2788:12911` (image) | `<Icon>` wrapping `<img>` | used inside `<HeroSection />` |
| Countdown | B1 / B1.3.* | CSS grid for 3 unit-frames × 2 sub-tiles | `<Countdown target={ISO} />` + `<CountdownUnit label digits />` + `<CountdownDigitTile char />` |
| Event info | B2 | two rows: label + value; broadcast note below | `<EventInfo time location broadcastNote />` |
| CTA pair | B3 | two `<Button>` with variant="primary"/"outline" | `<CtaButton variant>` |
| ROOT FURTHER display (big) | Frame 486 + `3204:10155`/`3204:10154` | two adjacent `<Image>` elements + `sr-only` `<h1>` | `<RootFurtherDisplay />` (contains sr-only h1) |
| Description paragraphs | B4 (`5001:14827`) | 3 stacked `<p>` | `<HeroDescription />` (renders 3 keys) |
| Awards section header | C1 | stacked text (caption + h2 + p) | `<SectionHeader caption title description />` |
| Award card | C2.1 (×6) | grid cell | `<AwardCard slug title description imageUrl />` |
| Sunkudos promo | D1 | 2-col row with media + content | `<KudosPromo />` |
| Kudos wordmark | `I3390:10349;329:2949` | `<Icon>` with exported image | used inside `<KudosPromo />` |
| Widget button | `5022:15169` | `fixed bottom-6 right-5 rounded-full` pill | `<WidgetButton />` — internal: `<Icon>` + text "/" + `<Icon>` |
| Footer | `5001:14800` | generalize Login footer to 4 nav links | `<Footer selectedNav variant="main" />` |

---

## Notes

- **Design tokens extend Login**: the Login screen already defined `--color-bg-page`, `--color-btn-login-bg` (= `--color-btn-primary-bg`), `--color-text-white`, `--color-text-on-btn`, `--color-footer-border` (= `--color-divider`). Reuse those tokens; add the new Homepage-specific ones listed above (gold-glow, accent-warm, secondary-bg-10%, text-gold, etc.).
- **New font dependency**: only "Digital Numbers" (`.woff2`) for countdown digits. Load via `next/font/local` for no-layout-shift. Fallback: `"Courier New", monospace`. The "KUDOS" wordmark is exported as an SVG/PNG image and does NOT require a font import.
- **Gold-glow shadow is critical**: it appears on cards, widget button, and selected nav text. Consistency here makes or breaks the "premium" feel.
- **`mix-blend-mode: screen`** on award pictures composites them over the dark background; without it the images appear washed out.
- **Accessibility**: ensure 4.5:1 contrast — `#FFEA9E` on `#00101A` = 12.6:1 ✅; `#FFFFFF @ 70% opacity` body text → verify contrast post-opacity.
- **Countdown correctness**: tiles must render 2-digit zero-padded values; hide the "Coming soon" label after target datetime; frozen state shows `00` across all tiles.
- **I18n**: all user-visible text must go through `next-intl`. See `spec.md` §Data Requirements for the i18n key inventory.
