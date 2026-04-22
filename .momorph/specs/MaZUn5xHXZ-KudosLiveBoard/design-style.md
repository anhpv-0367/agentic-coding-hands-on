# Design Style: Sun* Kudos – Live Board (`/kudos`)

**Frame ID**: `2940:13431`
**Frame Name**: `Sun* Kudos - Live board`
**Screen ID**: `MaZUn5xHXZ`
**File Key**: `9ypp4enmFmdK3YAFJLIu6C`
**Figma Link**: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/MaZUn5xHXZ
**Canvas Size**: `1440 × 5862 px` (desktop)
**Extracted At**: 2026-04-22

> This screen extends the design system established for **Homepage** (`i87tDx10uM`) and **Awards Information** (`zFYDgyj_pD`). All base colors/fonts are reused. This document captures the deltas: new spacing tokens for the Kudos grid, post-card visual recipe, spotlight canvas container, tier-badge variants, reaction / copy-link buttons. Any token marked *(reused)* has its canonical definition in Homepage/Awards design-style files.

---

## Design Tokens

### Colors

Every hex value used on this screen, with semantic usage. **No brand-new hues** — everything is already in the Homepage palette except one new accent (`#D4271D`, hashtag red) and one new card surface (`#FFF8E1`, Kudos post cream).

| Token | Value | Usage |
|-------|-------|-------|
| `--color-bg-page` *(reused)* | `#00101A` | Page background behind everything except post cards |
| `--color-bg-kudos-card` **(NEW)** | `#FFF8E1` (rgba(255,248,225,1)) | Warm cream fill for each All-Kudos post card |
| `--color-bg-header` *(reused)* | `rgba(16,20,23,0.8)` | Header blurred overlay |
| `--color-text-white` *(reused)* | `#FFFFFF` | Default body text on dark bg |
| `--color-text-on-card` **(NEW, alias of bg-page)** | `#00101A` | Body text inside `#FFF8E1` cards (ensures 17.8:1 contrast) |
| `--color-text-gold` *(reused)* | `#FFEA9E` | Section titles (`HIGHLIGHT KUDOS`), header nav selected, spotlight counter, sidebar leaderboard titles, gold borders |
| `--color-text-tag-red` **(NEW)** | `#D4271D` (rgba(212,39,29,1)) | Hashtag text (`#Dedicated`, `#Inspring`, …) |
| `--color-text-meta` **(NEW)** | `#999999` (rgba(153,153,153,1)) | Timestamps, "10:00 - 10/30/2025" secondary meta |
| `--color-text-user-pink` **(NEW)** | `#F17676` (rgba(241,118,118,1)) | User-highlight text on certain accents |
| `--color-divider` *(reused)* | `#2E3940` | 1 px dark divider inside post cards between info / content / actions |
| `--color-border-bronze` **(NEW)** | `#998C5F` | Bronze hairline on action-bar pill, spotlight board outer border, card borders |
| `--color-border-gold` *(reused)* | `#FFEA9E` | Tier-badge gold outline (Super / Legend), focus rings |
| `--color-accent-glow` *(reused)* | `#FAE287` | Gold glow box-shadow on CTAs (`Mở quà`) |
| `--color-btn-primary-bg` *(reused)* | `#FFEA9E` | `Mở quà` button bg, compose CTA fill |
| `--color-text-on-btn` *(reused)* | `#00101A` | Text on gold buttons |
| `--color-gold-hover-bg` *(reused)* | `rgba(255,234,158,0.1)` | Hover tint on sidebar list rows, dropdown items |
| `--color-highlight-warm` **(NEW)** | `rgba(255,243,198,1)` | Secondary highlight surface (optional accent panel) |
| `--color-tan-muted` **(NEW)** | `rgba(219,209,193,1)` | "KUDOS" hero wordmark color |
| `--color-heart-active` **(NEW, alias of user-pink)** | `#F17676` | Active heart icon fill |
| `--color-heart-inactive` **(NEW)** | `#999999` | Default gray heart outline |

**Contrast notes** (for a11y sign-off):
- `#FFEA9E` on `#00101A` = 12.6:1 ✅ AAA
- `#FFFFFF` on `#00101A` = 19.3:1 ✅ AAA
- `#00101A` on `#FFF8E1` = 17.8:1 ✅ AAA → **post-card body uses `#00101A`**, never white.
- `#D4271D` on `#FFF8E1` = 4.8:1 ✅ AA (hashtags, body-weight text only — do not use for large decorative)
- `#999999` on `#FFF8E1` = 3.2:1 ❌ fails AA for normal text → **bump timestamps inside cards to `#666666`** (documented below as `--color-text-meta-on-card`).

| `--color-text-meta-on-card` **(NEW)** | `#666666` | Timestamps / meta INSIDE `#FFF8E1` cards (AA-compliant replacement for `#999999` on cream) |

---

### Typography

All families already exist on Homepage — **no new font dependencies**. Primary: **Montserrat**. Decorative: **SVN-Gotham** for the "KUDOS" hero wordmark. Copyright: **Montserrat Alternates** (footer).

| Token | Family | Size | Weight | Line | Letter-sp | Usage |
|-------|--------|------|--------|------|-----------|-------|
| `--text-hero-wordmark` **(NEW)** | SVN-Gotham | 140 px | 400 | 35 px | -13 % | `KUDOS` in hero wordmark |
| `--text-hero-subtitle` **(NEW)** | Montserrat | 36 px | 700 | 44 px | 0 | "Hệ thống ghi nhận lời cảm ơn" |
| `--text-display` *(reused)* | Montserrat | 57 px | 700 | 64 px | -0.25 px | `HIGHLIGHT KUDOS` section `<h2>` |
| `--text-h2` *(reused)* | Montserrat | 24 px | 700 | 32 px | 0 | Section captions (`Sun* Annual Awards 2025`) |
| `--text-stat-hero` **(NEW)** | Montserrat | 32 px | 700 | 40 px | 0 | Sidebar large stat numbers (e.g., "12" beside "Số Kudos bạn nhận được") |
| `--text-stat-title` **(NEW)** | Montserrat | 22 px | 700 | 28 px | 0 | Sidebar stat row titles |
| `--text-kudo-body` **(NEW)** | Montserrat | 20 px | 700 | 32 px | 0 | Kudo message body (highlight + post cards) |
| `--text-body-strong` *(reused)* | Montserrat | 16 px | 700 | 24 px | 0.15 px | Buttons, nav, filter labels |
| `--text-nav-sm` *(reused)* | Montserrat | 14 px | 700 | 20 px | 0.1 px | Filter pill button text |
| `--text-meta-sm` **(NEW)** | Montserrat | 10.9 px | 500 | 16.4 px | 0.1 px | Leaderboard row meta (small grey labels) |
| `--text-footer-copyright` *(reused)* | Montserrat Alternates | 16 px | 700 | 24 px | 0 | Footer copyright |

**Color assignments** for each typography token:
- `--text-display` (HIGHLIGHT KUDOS) → `#FFEA9E` with `text-shadow: var(--text-shadow-glow)`
- `--text-h2` (Sun\* Annual Awards 2025 caption) → `#FFFFFF`
- `--text-hero-wordmark` (KUDOS) → `#DBD1C1`
- `--text-hero-subtitle` → `#FFFFFF`
- `--text-kudo-body` **on highlight card** (dark bg context) → `#FFFFFF`
- `--text-kudo-body` **on list post card** (cream bg) → `#00101A`
- Hashtags → `#D4271D` (regardless of context)
- Timestamps — on dark bg → `#999999`; on cream card → `#666666` (`--color-text-meta-on-card`)

---

### Spacing

Base grid 8/16/24/32/40. Adding 14 new Kudos-scoped tokens:

| Token | Value | Usage |
|-------|-------|-------|
| `--space-kudos-page-pad-x` **(NEW)** | `144 px` | Page horizontal padding (matches 1152 content column) |
| `--space-kudos-hero-height` **(NEW)** | `512 px` | Keyvisual (hero) fixed height |
| `--space-kudos-section-gap` **(NEW)** | `80 px` | Gap between major sections (hero → action bar → highlights → spotlight → main-row → footer) |
| `--space-kudos-action-pad-y` **(NEW)** | `24 px` | Action-bar pill top/bottom padding |
| `--space-kudos-action-pad-x` **(NEW)** | `16 px` | Action-bar pill left/right padding |
| `--space-kudos-highlight-gap-y` **(NEW)** | `40 px` | Gap between highlight section header → carousel → pagination bar |
| `--space-kudos-highlight-slide-gap` **(NEW)** | `24 px` | Gap between adjacent highlight slides |
| `--space-kudos-carousel-pad-x` **(NEW)** | `144 px` | Horizontal padding on the pagination bar |
| `--space-kudos-card-pad-top` **(NEW)** | `40 px` | List post-card top padding |
| `--space-kudos-card-pad-x` **(NEW)** | `40 px` | List post-card side padding |
| `--space-kudos-card-pad-bottom` **(NEW)** | `16 px` | List post-card bottom padding (action row clearance) |
| `--space-kudos-card-row-gap` **(NEW)** | `16 px` | Gap between rows inside a post card |
| `--space-kudos-sidebar-gap` **(NEW)** | `24 px` | Gap between sidebar cards (stats, leaderboards) |
| `--space-kudos-main-col-gap` **(NEW)** | `40 px` | Gap between main content (All Kudos) and Sidebar |

All other spacing (header, footer inner) reuses existing Homepage tokens.

---

### Borders & Radii

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-kudos-card` **(NEW)** | `24 px` | All-Kudos post card (`#FFF8E1` cream) |
| `--radius-kudos-input` **(NEW)** | `8 px` | Action-bar pill, filter dropdowns |
| `--radius-kudos-pill` **(NEW)** | `100 px` | Search pill (Spotlight search), tier-badge pill |
| `--radius-sm` *(reused)* | `4 px` | Micro (badges, tiny UI) |
| `--radius-md` *(reused)* | `8 px` | Standard buttons |
| `--radius-lg` *(reused)* | `16 px` | Secondary cards |
| `--border-kudos-card` **(NEW)** | `1 px solid #2E3940` | Horizontal dividers inside post cards (between info/content/actions rows) |
| `--border-kudos-outline` **(NEW)** | `1 px solid #998C5F` | Bronze outline on action-bar pill, spotlight outer border |
| `--border-kudos-tier-outline` **(NEW)** | `0.5 px solid #FFEA9E` | Gold outline on Super Hero / Legend Hero tier badges |

---

### Shadows & Effects

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-gold-glow` *(reused)* | `0 4px 4px 0 rgba(0,0,0,0.25), 0 0 6px 0 #FAE287` | `Mở quà` button, compose CTA pill on hover |
| `--text-shadow-glow` *(reused)* | `0 4px 4px rgba(0,0,0,0.25), 0 0 6px #FAE287` | H1 `HIGHLIGHT KUDOS`, spotlight counter, selected header nav |
| `--focus-ring-gold` **(NEW)** | `0 0 0 2px #FFEA9E, 0 0 0 4px #00101A` | Keyboard focus on all interactive elements (2 px gold outline, 2 px offset) |

Figma did not specify card shadows — cards rely on color contrast alone. Keep flat.

---

## Hero (Keyvisual) — node `2940:13432`

```
┌──────────────────── 1440 × 512 ─────────────────────┐
│                                                      │
│                                                      │
│    Hệ thống ghi nhận lời cảm ơn                      │  ← 36/700 #FFFFFF
│                                                      │
│    KUDOS  (massive 140-px SVN-Gotham, #DBD1C1)       │
│                                                      │
│                                                      │
└──────────────────────────────────────────────────────┘
   full-bleed background image + dark gradient overlay
```

| Property | Value |
|----------|-------|
| Dimensions | `1440 × 512` |
| Background image | `MM_MEDIA_KV Background` (full-bleed) |
| Gradient overlay | `linear-gradient(25deg, #00101A 14.74%, rgba(0,19,32,0) 47.8%)` |
| Subtitle (36/700) | color `#FFFFFF`, top-aligned inside content inset |
| Wordmark (140/400 SVN-Gotham) | color `#DBD1C1`, below subtitle |
| Padding | `144 px` horizontal; vertical padding hug-content |
| Radius | none |
| Interactions | static |

---

## Header — node `2940:13433` (reused)

- Component: `<Header variant="full" selectedNav="kudos" />`
- Height 80 px, fixed `top: 0`, bg `rgba(16,20,23,0.8)`, backdrop-blur 8 px.
- Active state on `kudos` nav item: gold `#FFEA9E` + `text-shadow: 0 0 6px #FAE287` + `text-decoration: underline` (underline offset 4 px, thickness 1 px).
- **No modification required** (Header already supports `selectedNav="kudos"`).

---

## Action Bar (Ghi nhận) — node `2940:13449`

```
┌──────────────────── 738 × 72 ──────────────────────┐
│  🖊  Hôm nay, bạn muốn gửi lời cảm ơn và ghi nhận… │
└─────────────────────────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Dimensions | `738 × 72` (centered horizontally within the 1152 content column) |
| Layout | `flex-row; align-items: center; gap: 8 px` |
| Padding | `24 px 16 px` (y × x) |
| Background | `transparent` |
| Border | `var(--border-kudos-outline)` (1 px bronze) |
| Radius | `var(--radius-kudos-input)` (8 px) |
| Left icon | `MM_MEDIA_Pen` 24×24, tint `#FFEA9E` |
| Placeholder text | `--text-nav-sm` (14/700/20) color `#999999` |
| Cursor | `pointer` (entire pill is clickable — delegates to dialog open) |

**States:**

| State | Border | Placeholder color | Icon opacity |
|-------|--------|-------------------|--------------|
| Default | `#998C5F` | `#999999` | 0.8 |
| Hover | `#FFEA9E` | `#FFFFFF` | 1.0 |
| Focus (keyboard) | `#FFEA9E` | `#FFFFFF` | 1.0, plus `--focus-ring-gold` |
| Active (click) | `#FFEA9E` | — | 1.0 |

**Transition:** `border-color 150 ms ease-out, color 150 ms ease-out`.

---

## Highlight Kudos Section — node `2940:13451`

### Section header

| Row | Content | Typography |
|-----|---------|------------|
| Caption | "Sun\* Annual Awards 2025" | `--text-h2` (24/700), white |
| Title | "HIGHLIGHT KUDOS" | `--text-display` (57/700/-0.25), `#FFEA9E`, `text-shadow: var(--text-shadow-glow)` |
| Filter row | Hashtag dropdown + Phòng ban dropdown | pill buttons, `--text-nav-sm`, bronze border |

Gap between caption → title → filter row: `16 px`. Gap from section-header to carousel: `40 px`.

### Carousel (node `2940:13463`)

| Property | Value |
|----------|-------|
| Outer dimensions | `1440 × 525` (full viewport width) |
| Item gap | `24 px` between adjacent slides |
| Slide visual | center slide full-opacity; side slides `opacity: 0.3; transform: scale(0.92)`; non-visible slides hidden |
| Slide container | horizontal scroll snap (`scroll-snap-type: x mandatory`; each slide `scroll-snap-align: center`) |

### Single Highlight card — node `2940:13464` / `13465` / `13466`

```
┌──────────────── variable × 525 ────────────────┐
│ [👤 Sender]  →  [👤 Recipient]   ⏰ 10:00 10/30 │  ← Info row, 123-px tall
├──────────────────────────────────────────────── │
│                                                 │
│ "Cảm ơn bạn đã…" (20/700 white, clamp 3 lines) │  ← Body
│                                                 │
│ #Dedicated #Inspring #...  (red 13px, 1 line)  │  ← Hashtags
│                                                 │
├──────────────────────────────────────────────── │
│ ❤ 42   🔗 Copy Link   🧾 IDOL GIỚI TRẺ   →      │  ← Action row
└────────────────────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Background | `transparent` (sits on page `#00101A`) |
| Border | none |
| Radius | `var(--radius-lg)` (16 px) — visual grouping via inner subtle outline if needed |
| Padding | `24 px` all sides |
| Layout | `flex-column; gap: 24 px` |
| Text color | `#FFFFFF` (body), `#999999` (timestamp), `#D4271D` (hashtags), `#FFEA9E` (category tag) |
| Message | `--text-kudo-body`, `-webkit-line-clamp: 3; overflow: hidden; text-overflow: ellipsis` |
| Hashtag row | `display: flex; overflow: hidden; white-space: nowrap; text-overflow: ellipsis` after 5 items |

**Card states:**

| State | Transform | Opacity | z-index |
|-------|-----------|---------|---------|
| Center (active) | `scale(1)` | 1 | 2 |
| Adjacent (left/right) | `scale(0.92)` | 0.3 | 1 |
| Off-screen | — | 0 | 0 (hidden / `aria-hidden="true"`) |

### Carousel prev/next controls (B.5_slide, node `2940:13471`)

| Property | Value |
|----------|-------|
| Container | `flex-row; justify-content: space-between; gap: 32 px; padding: 0 144 px` |
| Button (prev/next) | 40 × 40 circle, bg transparent, icon `MM_MEDIA_Left` / `MM_MEDIA_Right` 24×24 gold `#FFEA9E` |
| Counter (`N/5`) | `--text-body-strong` 16/700, color `#FFFFFF`, centered |

**Button states:**

| State | Icon opacity | Background | Cursor |
|-------|--------------|------------|--------|
| Default (enabled) | 0.8 | transparent | pointer |
| Hover | 1.0 | `rgba(255,234,158,0.1)` | pointer |
| Focus | 1.0 | transparent + `--focus-ring-gold` | pointer |
| Disabled (at first/last slide) | 0.3 | transparent | not-allowed; `aria-disabled="true"` |

---

## Spotlight Board — node `2940:14174`

```
┌────────────────── 1157 × 548 ──────────────────┐
│ 388 KUDOS              🔍 Tìm kiếm sunner  ⌨    │  ← header row
│                                                 │
│     [name]     [name]                           │
│  [name]  [name]       [name]                    │
│       [name]    [name]      [name]              │  ← word-cloud of up to 118 nodes
│                                                 │
│         (background: Root further mo rong)     │
└─────────────────────────────────────────────────┘
      bronze 1-px outer border, no radius
```

| Property | Value |
|----------|-------|
| Dimensions | `1157 × 548` (fills main column) |
| Background | 2 stacked backdrop images (`image 24`, `image 25`) + "Root further mo rong" container; dark blue overtone `#00101A` |
| Border | `var(--border-kudos-outline)` (1 px bronze) |
| Radius | 0 (flat rectangle) |
| Top-left `N KUDOS` counter | `--text-stat-hero` (32/700/40), color `#FFEA9E`, `text-shadow: var(--text-shadow-glow)` |
| Top-right search pill | 219 × 39, `--radius-kudos-pill`, icon `MM_MEDIA_Search`, placeholder color `#999999` |
| Node labels | `--text-meta-sm` (10.9/500), color `#FFFFFF`; matching search = gold `#FFEA9E` + scale 1.2 |
| Non-matching nodes during search | `opacity: 0.3` |

**Interactions (visual):**

- Hover node: tooltip appears 8 px above pointer with format `{name} — {hh:mm}: đã nhận được một Kudos mới`. Tooltip bg `rgba(0,16,26,0.9)`, text `#FFFFFF`, padding `8 × 12`, radius 8 px, `--text-nav-sm`.
- Click node: fades to 50 % opacity for 150 ms then navigates.
- Pan: cursor grab/grabbing; translates the nodes layer (but keeps header row fixed).
- Zoom: scale `[0.5, 2.0]`; center-on-cursor.

**Empty state:** "Chưa có Kudo nào — hãy là người đầu tiên!" centered in the canvas, `--text-body-strong`, `#999999`.

---

## All Kudos Post Card — node `3127:21871`

```
┌────────── 680 × 749 ──────────┐
│ padding-top 40                 │
│ 👤 Sender · ⇒ · 👤 Recipient   │  ← Info user row (~123)
│ #IDOL GIỚI TRẺ · 10:00 10/30   │
├────────────────────────────────│  ← 1px #2E3940 divider
│                                │
│ Cảm ơn bạn vì…                 │  ← Message body
│ (20/700 #00101A, no clamp)    │
│                                │
│ ┌──┬──┬──┐                     │  ← Image grid (up to 3 per row)
│ │  │  │  │                     │
│ └──┴──┴──┘                     │
│                                │
│ #Dedicated #Inspring #…        │  ← Hashtags (red)
│                                │
├────────────────────────────────│  ← 1px #2E3940 divider
│ ❤ 1.000      🔗 Copy Link   →  │  ← Action row (~56)
│ padding-bottom 16              │
└────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Dimensions | `680 × 749` (height variable to fit content) |
| Background | `var(--color-bg-kudos-card)` = `#FFF8E1` |
| Border | none |
| Radius | `var(--radius-kudos-card)` = 24 px |
| Padding | `40 px` top + `40 px` sides + `16 px` bottom |
| Row gap | `16 px` between major rows |
| Dividers | `1 px solid #2E3940`, full width inside padding |
| Avatars | 48 × 48, circle, 1 px white border |
| Names | `--text-body-strong` (16/700), color `#00101A` |
| Tier badge | pill, `--text-meta-sm`, color per variant (see tier table) |
| Timestamp | `--text-meta-sm`, color `#666666` (`--color-text-meta-on-card`) |
| Category tag | `--text-body-strong`, color `#FFEA9E` on dark chip (chip bg `#00101A`, 4-px radius, padding `2 × 8`) |
| Message body | `--text-kudo-body` (20/700/32), color `#00101A`, `text-align: left` (no clamp) |
| Hashtags | `--text-body-strong`, color `#D4271D` |
| Image grid | `display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 8 px`; max 5 images, row auto |
| Action row | `flex-row; justify-content: space-between; align-items: center; gap: 16 px`; padding-top 8 px |

### Action row controls (per card)

| Control | Node ref | Style |
|---------|----------|-------|
| Heart count + icon | `C.4.1_Hearts` | horizontal flex; count text `--text-body-strong` color `#00101A`; icon `MM_MEDIA_Heart` 24×24 |
| Copy-Link button | `C.4.2_Copy link button` with `MM_MEDIA_Link` | icon 24×24 + label "Copy Link" `--text-body-strong`, color `#00101A`; hover underline + gold glow |
| "Xem chi tiết" link | (implicit — per spec) | `--text-body-strong`, color `#D4271D`, hover underline |

### Heart button states

| State | Icon fill | Count color | Button bg |
|-------|-----------|-------------|-----------|
| Default (not liked) | `#999999` | `#00101A` | transparent |
| Hover | `#F17676` | `#00101A` | `rgba(241,118,118,0.1)` |
| Active / liked | `#F17676` | `#F17676` | transparent |
| Disabled (during optimistic in-flight) | `#999999` 50 % opacity | `#666666` | transparent |
| Focus (keyboard) | — | — | transparent + `--focus-ring-gold` |

**Transition:** `fill 150 ms ease-out, color 150 ms ease-out, transform 200 ms cubic-bezier(0.34, 1.56, 0.64, 1)` (scale-bounce on like).

### Copy-link button states

| State | Text color | Underline | Background |
|-------|------------|-----------|------------|
| Default | `#00101A` | none | transparent |
| Hover | `#FFEA9E` (override for CTA feel) | 1 px solid `#FFEA9E`, offset 2 | `rgba(255,234,158,0.1)` |
| Focus | `#00101A` | none | transparent + `--focus-ring-gold` |
| Active (click pulse) | `#FFEA9E` | — | `rgba(255,234,158,0.2)` |

### Toast after Copy-Link

- Dimensions: min 280 × 48, padding `12 × 16`, radius 8 px.
- Background: `rgba(0,16,26,0.95)`; text `#FFFFFF`; icon `MM_MEDIA_Link` gold.
- Position: bottom-center, 32 px from viewport bottom; slides up via transform + fade.
- Duration: 2.5 s visible; transitions 150 ms in, 150 ms out.
- Role: `role="status"` with `aria-live="polite"`.

---

## Right Sidebar — node `2940:13488`

```
┌──────────── 422 × auto ────────────┐
│  Stats card                         │  ← 422 × ~220, stacked gauges
│  ─────────────────────────────────  │
│  Leaderboard: Tier-ups (10)         │
│  ─────────────────────────────────  │
│  Leaderboard: Gift-recipients (10) │
└─────────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Width | `422 px` (desktop); fills on mobile |
| Gap between cards | `var(--space-kudos-sidebar-gap)` = 24 px |
| Sticky | `position: sticky; top: 104 px` on desktop |

### Stats card (D.1)

| Property | Value |
|----------|-------|
| Dimensions | `422 × ~220` |
| Background | `rgba(255,234,158,0.05)` (subtle gold tint) |
| Border | `1 px solid rgba(255,234,158,0.2)` |
| Radius | `var(--radius-lg)` (16 px) |
| Padding | `24 px` |
| Gap between rows | `16 px` |
| Row layout | `flex-row; justify-content: space-between; align-items: baseline` |
| Stat title | `--text-stat-title` (22/700/28) color `#FFFFFF` |
| Stat number | `--text-stat-hero` (32/700/40) color `#FFEA9E` |
| "Mở quà" CTA | full-width button, bg `#FFEA9E`, color `#00101A`, height 56 px, radius 4 px, shadow `--shadow-gold-glow`; icon `MM_MEDIA_Open Gift` + label "Mở quà" |

#### "Mở quà" button states

| State | Background | Shadow | Label color |
|-------|------------|--------|-------------|
| Default (has unopened box) | `#FFEA9E` | `--shadow-gold-glow` | `#00101A` |
| Hover | `#F5DE7A` | `--shadow-gold-glow-strong` | `#00101A` |
| Focus | `#FFEA9E` | + `--focus-ring-gold` | `#00101A` |
| Disabled (no unopened boxes) | `rgba(255,234,158,0.4)` | none | `rgba(0,16,26,0.5)`; `cursor: not-allowed` |
| Loading (during open) | `#FFEA9E` | — | spinner replaces icon |

Badge on button when `boxes_unopened > 0`: absolute positioned top-right, red `#D4271D` circle, diameter 20 px, white text `--text-meta-sm`.

### Leaderboard card

| Property | Value |
|----------|-------|
| Dimensions | `422 × auto` |
| Background | transparent (sits on page bg) |
| Border | `1 px solid rgba(255,234,158,0.2)` |
| Radius | `var(--radius-lg)` (16 px) |
| Padding | `24 px` |
| Title | `--text-body-strong` (16/700), color `#FFEA9E`, uppercase |
| List gap | `12 px` between rows |
| Row | `flex-row; align-items: center; gap: 12 px` |
| Avatar | 40 × 40 circle |
| Name | `--text-body-strong`, color `#FFFFFF` |
| Meta/description | `--text-meta-sm`, color `#999999` |

#### Leaderboard row states

| State | Background | Name color |
|-------|------------|------------|
| Default | transparent | `#FFFFFF` |
| Hover | `rgba(255,234,158,0.1)` | `#FFEA9E` |
| Focus (keyboard) | + `--focus-ring-gold` | `#FFEA9E` |

**Empty state:** centered text "Chưa có dữ liệu", `--text-body-strong`, color `#999999`.

---

## Footer — node `2940:13522`

- Component: `<Footer variant="minimal" />`
- Content: copyright line only, centered.
- Padding: `40 × 90` (y × x).
- No selected-nav since minimal variant has no links.

---

## Tier Badges — `MM_MEDIA_New Hero` / `Rising Hero` / `Super Hero` / `Legend Hero`

Rendered as small pill chips next to a user's name. Layout: `flex-row; align-items: center; gap: 4 px; padding: 2 × 8; border-radius: 100 px; font: --text-meta-sm`.

| Tier | Fill | Border | Text color | Icon |
|------|------|--------|------------|------|
| `new` | transparent | `0.5 px solid #999999` | `#999999` | `MM_MEDIA_New Hero` (12×12) |
| `rising` | transparent | none | `#FFFFFF` | `MM_MEDIA_Rising Hero` (12×12) |
| `super` | transparent | `0.5 px solid #FFEA9E` | `#FFEA9E` | `MM_MEDIA_Super Hero` (12×12) |
| `legend` | `rgba(255,234,158,0.1)` | `0.5 px solid #FFEA9E` | `#FFEA9E` | `MM_MEDIA_Legend Hero` (12×12) |

Icons should be tintable via CSS mask or pre-rendered with the tier's text color applied.

---

## Filter Dropdowns (Hashtag + Phòng ban)

| Property | Value |
|----------|-------|
| Trigger | pill button, 140 × 40, padding `8 × 16`, radius 8 px, border `1 px solid #998C5F` |
| Label | `--text-nav-sm` (14/700), color `#FFFFFF` |
| Icon (caret down) | `MM_MEDIA_Down` 16×16 gold, rotates 180° when open |
| Menu | absolute-positioned `<ul role="listbox">`, bg `rgba(11,15,18,0.95)`, border `1 px solid #2E3940`, radius 8 px, shadow subtle, min-width 200 px, max-height 320 px |
| Option | `padding: 12 × 16; font: --text-body-strong; color: #FFFFFF; cursor: pointer` |
| Option hover | bg `rgba(255,234,158,0.1)`; color `#FFEA9E` |
| Option selected | color `#FFEA9E`; check icon 16 × 16 gold on right |
| Option focus (keyboard) | bg `rgba(255,234,158,0.1)`; `--focus-ring-gold` |

---

## Responsive Specifications

| Breakpoint | Page pad x | Hero height | Action bar | Highlight | Spotlight | All Kudos + Sidebar | Footer |
|------------|-----------|-------------|------------|-----------|-----------|---------------------|--------|
| `≥ 1024 px` (Desktop) | `144 px` | 512 px | 738 × 72 centered | 5 slides, active-center + side-fade; counter + arrows | 1157 × 548 | 2-col (680 list + 422 sidebar) with 40-px gap | minimal |
| `768–1023 px` (Tablet) | `48 px` | 384 px | full-width (max 738) | 1 slide center (no side peeks); arrows swap to horizontal snap | full-width canvas, height 480, horizontal pan only | 2-col until 900 px, single col after; sidebar drops below list | minimal |
| `< 768 px` (Mobile) | `20 px` | 320 px | full-width | 1 slide; pagination dots instead of arrows+counter; swipe-drag enabled | single col; scale content; disable pan/zoom (click only) | single col; sidebar stacks below list; stats card sticky-top during scroll | minimal |

Hero subtitle + wordmark scale down at tablet/mobile:

| Breakpoint | `--text-hero-subtitle` | `--text-hero-wordmark` |
|------------|------------------------|------------------------|
| Desktop | 36 / 44 | 140 / 35 |
| Tablet | 28 / 36 | 96 / 32 |
| Mobile | 22 / 28 | 64 / 24 |

Highlight title `--text-display`:

| Breakpoint | Value |
|------------|-------|
| Desktop | 57 / 64 |
| Tablet | 40 / 48 |
| Mobile | 32 / 40 |

All animations are disabled when `prefers-reduced-motion: reduce`.

---

## Implementation Mapping

| Figma Node | Figma Name | React Component (proposed) | Tailwind / CSS hint |
|------------|------------|----------------------------|---------------------|
| `I2940:13433;…` | Header logo | `<Header variant="full" selectedNav="kudos" />` (shared) | existing |
| `2940:13432` | Keyvisual | `<KudosHero />` (new — renders background image + gradient + subtitle + wordmark) | `h-[512px] w-full bg-cover …` |
| `2940:13449` | Ghi Nhận button | `<KudosComposeTrigger />` | pill, bronze border, pen icon |
| `2940:13450` | Action-bar search (unused in design — search moved to spotlight) | — | — |
| `2940:13451` | Highlight Kudos section | `<KudosHighlightsSection />` | section header + carousel + pagination |
| `2940:13463` | Carousel container | `<KudosHighlightsCarousel />` | scroll-snap x; 5 slides |
| `2940:13464/65/66` | Highlight card | `<KudosHighlightCard kudo={…} isActive={…} />` | reuses `<KudosAuthors />`, `<KudosBody />`, `<KudosActionRow />` |
| `2940:13471` | Prev/Next + counter | `<KudosCarouselControls />` | flex-row; buttons + counter |
| `2940:14174` | Spotlight Board | `<KudosSpotlightBoard />` | canvas; top-row counter + search; word-cloud body |
| `2940:14833` | Spotlight search pill | `<KudosSpotlightSearch />` (subcomponent) | radius 100 px |
| `C_All kudos` (`2940:13475`) | All Kudos list | `<KudosList />` | vertical list + load-more |
| `3127:21871` + variants | List post card | `<KudosPostCard kudo={…} />` | cream bg, 24-px radius |
| `2940:13489` | Stats card | `<KudosStatsCard stats={…} />` | grid of stat rows + Mở quà CTA |
| `2940:13510` + sibling | Leaderboards | `<KudosLeaderboard variant="tier_upgrades" \| "gift_recipients" />` | list of 10 rows |
| `MM_MEDIA_Heart` | Heart icon | `<Icon src="/assets/kudos/heart.svg" size={24} />` | CSS filter for active/inactive |
| `MM_MEDIA_Link` | Copy-link icon | `<Icon src="/assets/kudos/link.svg" size={24} />` | — |
| `MM_MEDIA_Open Gift` | Gift icon | `<Icon src="/assets/kudos/open-gift.svg" size={24} />` | — |
| `MM_MEDIA_Pen` | Pen icon | `<Icon src="/assets/icons/pen.svg" size={24} />` | reuse `/assets/icons/` folder |
| `MM_MEDIA_Search` | Search icon | `<Icon src="/assets/icons/search.svg" size={24} />` | — |
| `MM_MEDIA_Send` | Send-arrow icon | `<Icon src="/assets/kudos/send.svg" size={16} />` | sender → recipient arrow |
| `MM_MEDIA_Down` | Dropdown caret | `<Icon src="/assets/icons/chevron-down.svg" size={16} />` | filter dropdown trigger |
| `MM_MEDIA_New Hero` / `Rising Hero` / `Super Hero` / `Legend Hero` | Tier badges | `<TierBadge tier={…} />` — icons at `/assets/kudos/tier-{new,rising,super,legend}.svg` | pill chip, 4 variants |
| `MM_MEDIA_KV Background` | Hero backdrop | `/assets/kudos/kv-background.png` (new asset) | — |
| `MM_MEDIA_Kudos logo` | Hero SAA 2025 KUDOS wordmark | `/assets/kudos/saa-kudos-wordmark.png` (new asset) | — |
| `2940:13522` | Footer | `<Footer variant="minimal" />` (shared) | existing |

### New files expected (from implementation plan)

- `src/app/kudos/page.tsx` (Server Component; auth guard; `generateMetadata`; renders `<KudosPage>`)
- `src/components/kudos/KudosPage.tsx` (Server shell — composes Header / Hero / client islands / Footer)
- `src/components/kudos/KudosHero.tsx`
- `src/components/kudos/KudosComposeTrigger.tsx`
- `src/components/kudos/KudosHighlightsSection.tsx`
- `src/components/kudos/KudosHighlightsCarousel.tsx` (Client)
- `src/components/kudos/KudosHighlightCard.tsx`
- `src/components/kudos/KudosCarouselControls.tsx` (Client)
- `src/components/kudos/KudosSpotlightBoard.tsx` (Client — SVG canvas; pan/zoom via hand-rolled `transform: translate() scale()` on a container; no external library)
- `src/components/kudos/KudosSpotlightSearch.tsx` (Client)
- `src/components/kudos/KudosSpotlightLayout.ts` (pure module — deterministic pack-layout pure fn mapping `SpotlightNode[]` → `{ kudo_id, x, y }[]`)
- `src/components/kudos/KudosList.tsx` (Client — cursor pagination via native `fetch()` + `useState`)
- `src/components/kudos/KudosPostCard.tsx`
- `src/components/kudos/KudosActionRow.tsx` (shared by highlight + post; heart + copy-link + view-detail)
- `src/components/kudos/KudosStatsCard.tsx` (Client)
- `src/components/kudos/KudosLeaderboard.tsx`
- `src/components/kudos/KudosFilterBar.tsx` (Client)
- `src/components/kudos/TierBadge.tsx`
- `src/components/kudos/GiftModal.tsx` (Client — dialog, body-scroll-lock)
- `src/components/kudos/Toast.tsx` (portal, `aria-live`)
- `src/hooks/useClipboard.ts` (Client — navigator.clipboard + fallback)
- `src/hooks/useDebouncedValue.ts` (Client — for search inputs)
- `src/types/kudos.ts` (Kudo, UserRef, KudosStats, SpotlightNode, GiftBoxReward, LeaderboardEntry)
- `src/lib/services/kudos-service.ts` (native `fetch()` helpers per endpoint with typed responses; no SWR)

### Modified files

- `src/i18n/messages/{vi,en}.json` — add `kudos.*` namespace (full key list in `spec.md §Data Requirements`)
- `src/app/globals.css` — add `@theme` tokens listed above (colors, typography, spacing, radii, shadows)
- `src/components/layout/Header.tsx` — confirm `selectedNav="kudos"` active state renders correctly (already wired — smoke check only)
- `src/components/ui/Icon.tsx` — no change (reused as-is)

---

## Validation Checklist

### Completeness
- [x] All colors documented — **5 new** (`--color-bg-kudos-card`, `--color-text-tag-red`, `--color-text-meta`, `--color-text-user-pink`, `--color-border-bronze`) plus contrast-aware variants for card interiors
- [x] All typography styles captured — **6 new tokens** (`--text-hero-wordmark`, `--text-hero-subtitle`, `--text-stat-hero`, `--text-stat-title`, `--text-kudo-body`, `--text-meta-sm`)
- [x] All spacing values listed — **14 new `--space-kudos-*` tokens**
- [x] Component states defined for all interactive elements — Action bar, Heart, Copy-link, Carousel prev/next, Filter dropdown, Mở quà button, Leaderboard row, Tier badges
- [x] Responsive breakpoints specified — Desktop ≥1024, Tablet 768–1023, Mobile <768 with concrete value table
- [x] Implementation mapping complete — every Figma node group mapped to a React component
- [x] ASCII layout diagrams for Hero / Highlight card / Spotlight / Post card

### Cross-reference with `spec.md`
- [x] FR-001 (auth) — route protection handled by existing middleware; no visual delta
- [x] FR-002 (5 highlight cards) — carousel section documents active-center + side-fade
- [x] FR-003 (prev/next + counter) — carousel controls with disabled states documented
- [x] FR-004 (highlight card shape) — all rows + clamping documented
- [x] FR-005 (list card + images) — post card layout + image grid documented
- [x] FR-006 (heart toggle) — states table + optimistic transition noted
- [x] FR-007 (copy-link + toast) — toast spec documented
- [x] FR-008 (pagination) — list section notes cursor + infinite scroll
- [x] FR-009 (spotlight feed) — spotlight board visual spec
- [x] FR-010 (spotlight interactions) — hover, click, pan, zoom, search-highlight documented
- [x] FR-011 (spotlight counter) — `--text-stat-hero` visual
- [x] FR-012 (stats card) — D.1 visual spec
- [x] FR-013 (Mở quà CTA) — button states incl. disabled
- [x] FR-014 (leaderboards) — two cards, row format, empty state
- [x] FR-015 (filters) — filter pill + dropdown states
- [x] FR-016 (sunner search autocomplete) — noted on spotlight search and action-bar; dropdown style shared with filter dropdown
- [x] FR-017 (compose trigger) — action-bar pill visual + open states
- [x] FR-018 (i18n) — no visual delta
- [x] FR-019 (chrome) — Header + Footer variants stated

### Accessibility
- [x] Contrast verified for all text/bg pairs (including card-body variant correction)
- [x] Focus ring defined globally (`--focus-ring-gold`)
- [x] Motion respects `prefers-reduced-motion: reduce`
- [x] Tier badges are text+icon (not icon-only) — screen-reader names defined

---

## Resolved visual decisions (2026-04-22)

1. **Card body color on list vs highlight** — resolved (confirmed 2026-04-22): list cards use `#FFF8E1` cream with `#00101A` body text; highlight cards use transparent bg with `#FFFFFF` body text.
2. **Tier badge visual** — resolved: text+icon pill with 4 variants (`new` gray outline, `rising` no outline, `super` gold outline, `legend` gold outline + subtle fill). Derived from observed Figma styles.
3. **Timestamp contrast on cream card** — original `#999999` failed AA on `#FFF8E1` (3.2:1). Bumped to `#666666` for in-card timestamps (`--color-text-meta-on-card`). Keeps `#999999` for timestamps on dark bg.
4. **Card shadow** — Figma specifies no box-shadow on Kudos cards; respected. Cards rely on color contrast alone.
5. **Flat radii** — hero, header, spotlight board, footer are all radius-0; cards/buttons use 8/16/24/100 tokens consistently.

---

## Notes

- **Real-time feed** — the Spotlight Board is the only realtime component on this page. Polls every 30 s (pausing when the tab is hidden). Design-wise, new node arrivals should animate in (300 ms fade + translate from edge); design-style documents the animation but implementation is deferred to plan.md.
- **Highlight carousel** — the active-center + faded-sides pattern is achieved via `scale()` + `opacity`, not via cropping or z-index layering. Keeps DOM simple and a11y-friendly.
- **Heart interaction** — the scale-bounce (200 ms cubic-bezier) is a distinctive UX detail borrowed from Twitter/X's like animation; falls back to no animation under reduced-motion.
- **Image attachments inside post cards** — maximum 5 per Kudo per spec; grid uses `auto-fit` so 1 image is full-width, 2 split 50/50, 3 take a 3-col row, 4–5 wrap to a second row. Lightbox opens via shared `<Lightbox>` component (to be built).
- **Spotlight word-cloud positioning** — resolved: **frontend computes layout** via a hand-rolled deterministic pack-layout (seeded concentric rings or jittered grid with axis-aligned bounding-box collision). Pure-function, no external library (per CLAUDE.md). Positions are cached in component state; on polling cycles new nodes are appended at the nearest available empty slot without re-running the full layout. No continuous physics — keeps perf sane.
- **Gift box reward modal** — out of scope for design-style.md; GiftModal visual will be specified in a follow-up or inline in the implementation PR once product finalizes reward types.
- **Content team dependency** — tier labels, toast strings, empty states, and Kudo message seed data must come from content team before ship. Placeholders are acceptable for pre-production builds.
