# Design Style: Awards Information (`/awards`)

**Frame ID**: `313:8436`
**Frame Name**: `Hệ thống giải` (Awards Information)
**Screen ID**: `zFYDgyj_pD`
**File Key**: `9ypp4enmFmdK3YAFJLIu6C`
**Figma Link**: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/zFYDgyj_pD
**Canvas Size**: `1440 × 6410 px` (desktop)
**Extracted At**: 2026-04-21

> This screen extends the design system established for the **Homepage** (`i87tDx10uM`). 95% of the tokens are reused. Only the deltas (new typography for award numerics, new spacing scale for the 2-col block, new component styles for sidebar-nav / award cards) are authored here. For every token below that is marked **"reuses Homepage"**, read the authoritative definition in `.momorph/specs/i87tDx10uM-Homepage/design-style.md`.

---

## Design Tokens

### Colors

**No new colors.** Every color used on this page comes from the Homepage palette:

| Token Used Here | Purpose On `/awards` |
|-----------------|----------------------|
| `--color-bg-page` `#00101A` | Page background |
| `--color-text-white` `#FFFFFF` | Body text, card descriptions, sidebar default |
| `--color-text-gold` `#FFEA9E` | H1 title, selected sidebar label, card titles |
| `--color-border-gold` `#FFEA9E` | Selected sidebar underline, award picture border |
| `--color-divider` `#2E3940` | 1 px horizontal divider under caption |
| `--color-accent-glow` `#FAE287` | Gold glow box-shadow on picture frames |
| `--color-shadow-soft` `#000000` @ 25% | Picture drop-shadow alpha |
| `--color-btn-primary-bg` `#FFEA9E` | Sun\* Kudos promo CTA (reused) |

See `Homepage/design-style.md §Colors` for hex values, opacities, and Figma traceability.

---

### Typography

Primary family: **Montserrat** (loaded). All families on this page already exist on Homepage — **no new font dependencies**.

| Token Name | Family | Size | Weight | Line Height | Letter Spacing | Usage |
|------------|--------|------|--------|-------------|----------------|-------|
| `--text-display` *(reused)* | Montserrat | 57px | 700 | 64px | -0.25px | H1 "Hệ thống giải thưởng SAA 2025" |
| `--text-h2` *(reused)* | Montserrat | 24px | 700 | 32px | 0 | Award card title ("Top Talent", …) |
| `--text-body-strong` *(reused)* | Montserrat | 16px | 700 | 24px | 0.15px | Caption "Sun\* annual awards 2025", sidebar label, Kudos body |
| **`--text-award-value`** **(NEW)** | Montserrat | 36px | 700 | 44px | 0 | Award card numerics: "Số lượng giải thưởng: 10 Cá nhân" / "Giá trị giải thưởng: 7.000.000 VNĐ …" |
| **`--text-award-description`** **(NEW)** | Montserrat | 16px | 700 | 24px | 0.15px | Long-form award description paragraph with `text-align: justify` |
| `--text-nav-sm` *(reused)* | Montserrat | 14px | 700 | 20px | 0.1px | Header nav |
| `--text-body-strong` *(reused)* | Montserrat | 16px | 700 | 24px | 0.15px | Sidebar nav item label (same size as body-strong) |

> `--text-award-description` has the same CSS values as `--text-body-strong` — it is aliased as a **separate token** only to make the "justified multi-paragraph description" intent self-documenting at the component level. Implementation may directly reuse `--text-body-strong` if preferred.

> The caption "Sun\* annual awards 2025" uses `--text-body-strong` (16/700). This matches the Homepage award-section caption (C1 node `2167:9045`).

#### Numeric-row visual weight

Award values (quantity and prize amount) use `--text-award-value` (36/700/44) — **1.5× larger than the award title** (24px) to emphasize the "how many winners / how much" information which is the primary reason users land on this page.

---

### Spacing

All values are absolute pixels from Figma at desktop 1440 px width.

| Token | Value | Usage |
|-------|-------|-------|
| `--space-page-pad-x-awards` | `144 px` | Page horizontal padding (larger than Homepage's 60 px — matches the 1152 px content column) |
| `--space-page-pad-top-awards` | `96 px` | Top padding between header bottom and hero keyvisual |
| `--space-section-gap-awards` | `120 px` | Vertical gap between major sections (hero → title, title → 2-col, 2-col → Kudos) |
| `--space-title-inner-gap` | `16 px` | Gap inside title block (caption → divider → h1) |
| `--space-2col-gap` | `80 px` | Gap between sidebar column and cards column |
| `--space-sidebar-gap` | `16 px` | Gap between sidebar items |
| `--space-sidebar-pad` | `16 px` | Padding inside each sidebar item |
| `--space-cards-gap` | `80 px` | Gap between consecutive award cards in the column |
| `--space-card-gap-x` | `40 px` | Gap between picture and content block inside a card |
| `--space-card-content-gap` | `32 px` | Vertical gap between rows inside a card's content block (title → desc → qty → value) |
| `--space-card-content-pad-y` | `32 px` | Top/bottom padding of content block |
| `--space-card-content-pad-x` | `32 px` | Left/right padding of content block |

All other spacing (header, footer, hero internal) **reuses Homepage** tokens.

---

### Borders & Radii

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-picture` | `24 px` | Award picture rounded corners |
| `--radius-content` | `16 px` | Award content block rounded corners |
| `--border-picture` | `0.955 px solid #FFEA9E` | Gold hairline around each award picture (exact Figma value, preserve decimal) |
| `--border-divider` | `1 px solid #2E3940` | Horizontal divider inside title block (between caption and h1) |
| `--border-sidebar-selected` | `1 px solid #FFEA9E` | Bottom border on selected sidebar item (gold underline) |

Card content block has **no border** — its backdrop-filter blur provides visual separation from the page.

---

### Shadows & Effects

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-picture` | `0 4px 4px 0 rgba(0,0,0,0.25), 0 0 6px 0 #FAE287` | Double shadow on every award picture: soft drop + warm gold halo |
| `--backdrop-content` | `blur(32 px)` | `backdrop-filter` on each award content block (frosted glass over page background) |
| `--mix-blend-picture` | `screen` | `mix-blend-mode: screen` on the picture `<img>` so its edges blend softly into the gold border/glow rather than hard-clipping |

Existing Homepage `--text-shadow-gold-glow` (`0 0 6px #FAE287`) is reused on:
- Selected sidebar item label (same recipe as selected header nav)
- H1 "Hệ thống giải thưởng SAA 2025" (same recipe as section display headlines on Homepage)

---

### Hero keyvisual

Reuses the Homepage hero artwork (**different crop, same image file**). The frame `313:8437` is a full-width image `1440 × 547` with the "ROOT FURTHER" logo absolutely positioned at `(x: 144, y: 184)` sized `338 × 150`.

The hero on this page **does NOT include**:
- Countdown tiles
- "Coming soon" label
- CTA pair (ABOUT AWARDS / ABOUT KUDOS)
- Event info block

It is a **pure keyvisual** — artwork + logo only — signaling "you are on an awards detail page".

---

## Component Style Details

### Header (reused from Homepage)

- Component: `<Header variant="full" selectedNav="awards" />`
- Visual tokens: no change.
- Active state on `awards` nav item: gold underline + `text-shadow: 0 0 6px #FAE287` (same recipe as `about` selected on Homepage).
- Node refs on this frame: `I313:8436;2167:9030` (logo), `I313:8436;2167:9033` (nav row).

### Section title block — Component A (node `313:8453`)

```
┌─────────────────────────────────────────────────────────┐
│ Sun* annual awards 2025                                  │  16/700  (#FFFFFF)
│ ───────────────────────────────────────────────────────  │  1 px divider (#2E3940)
│                                                          │
│ Hệ thống giải thưởng SAA 2025                           │  57/700 ls -0.25 (#FFEA9E)
│                                                          │     + text-shadow gold glow
└─────────────────────────────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Layout | `flex direction: column` |
| Gap (caption → divider → h1) | `16 px` |
| Divider width | full (100%) |
| Divider style | `1 px solid #2E3940` |
| Caption alignment | `text-align: left` (horizontally, caption occupies full width) |
| H1 alignment | `text-align: left` |
| Max width | `1152 px` (content column) |

**States:** None (static display).

---

### Sidebar Menu — Component C (node `313:8459`)

```
┌──── 178 px ────┐
│                │
│  🎯 Top Talent │  item 1 (selected state shown)
│  ─────────────  │  gold underline = selected
│                │
│  🎯 Top Project│  item 2
│                │
│  🎯 Top Project│  item 3
│     Leader     │
│                │
│  🎯 Best Manager│ item 4
│                │
│  🎯 Signature  │  item 5
│     2025 - …   │
│                │
│  🎯 MVP        │  item 6
│                │
└────────────────┘
     448 px tall
```

| Property | Value |
|----------|-------|
| Width | `178 px` (fixed) |
| Height | `448 px` (hugs 6 items × [item-height + 16 gap]) |
| Layout | `flex-direction: column; gap: 16 px` |
| Position (desktop ≥1024 px) | `position: sticky; top: 104 px` (recommended — see `spec.md` Open Question #1) |
| Background | transparent |
| Border | none on container |
| `<nav aria-label>` | "awards.sidebar.aria_label" i18n value |
| Node refs per item | C.1 `313:8460` · C.2 `313:8461` · C.3 `313:8462` · C.4 `313:8463` · C.5 `313:8464` · C.6 `313:8465` |

#### Sidebar item (generic C.x)

| Property | Value |
|----------|-------|
| Layout | `flex-direction: row; align-items: center; gap: 8 px` |
| Padding | `16 px` (all sides) |
| Icon | `MM_MEDIA_Target` 24 × 24, gold `#FFEA9E` fill |
| Label | `--text-body-strong` 16/700 Montserrat |
| Cursor | `pointer` |

**States table:**

| State | Text color | Text shadow | Underline | Icon opacity |
|-------|------------|-------------|-----------|--------------|
| Default | `#FFFFFF` | none | none | 0.7 |
| Hover | `#FFEA9E` | none | none | 1.0 |
| Focus (keyboard) | `#FFFFFF` | none | `2 px solid #FFEA9E` outline, offset 2 | 1.0 |
| Selected (active via hash / scroll-spy) | `#FFEA9E` | `0 0 6px #FAE287` | `1 px solid #FFEA9E` bottom border below label (inside padding, width = label width) | 1.0 |
| Selected + Hover | `#FFEA9E` | `0 0 6px #FAE287` | same | 1.0 |

`aria-current="true"` is applied to the selected anchor.

**Transition:** `color 150 ms ease-out, text-shadow 150 ms ease-out`.

---

### Main 2-col container — Component B (node `313:8458`)

| Property | Value |
|----------|-------|
| Width | `1152 px` (content column) |
| Height | `4833 px` (hugs cards stack) |
| Layout | `flex-direction: row; justify-content: flex-start; gap: 80 px` |
| Alignment | `align-items: flex-start` (sidebar top-aligned with first card) |

Child 1: Sidebar (C) — `178 × 448`
Gap: `80 px`
Child 2: Cards column (D) — `853 × 4833`

> Figma's auto-layout uses `justify-content: space-between` on a 1152 px container, producing a visible gap of `1152 - 178 - 853 = 121 px`. **Decision**: implementation uses `justify-content: flex-start; gap: 80 px` — sidebar + 80 gap + cards column = 1111 px, leaving `41 px` trailing whitespace on the right of the cards column. This matches Homepage's content rhythm and is simpler to reason about for scroll-spy targeting. Treat this as the **canonical** layout; `--space-2col-gap` = 80 px is the source of truth.

---

### Award Card — Component D.x (nodes `313:8467` through `313:8471` + `313:8510`)

> **CRITICAL — Alternating layout.** Cards alternate between two outer frames:
> - **Odd-index cards** (D.1 Top Talent, D.3 Top Project Leader, D.5 Signature 2025): outer is `Frame 506` — **Picture LEFT, Content RIGHT**.
> - **Even-index cards** (D.2 Top Project, D.4 Best Manager, D.6 MVP): outer is `Frame 507` — **Content LEFT, Picture RIGHT**.
>
> Internal picture + content dimensions, tokens, and row structure are identical across all 6 cards; only the row child-order (CSS `flex-direction: row` with reversed children, or `row-reverse`, or `order: 1/2`) differs.


```
┌──────────────── 853 px ────────────────┐
│                                          │
│  ┌─── 336 ───┐   ┌──── 477 px ────┐     │
│  │           │   │                 │     │
│  │           │   │  Top Talent    │ ← 24/700 #FFEA9E
│  │  picture  │ g │  ───────────── │
│  │  336×336  │ a │  Description…  │ ← 16/700 justified
│  │  gold     │ p │  Description…  │
│  │  border   │ 40│  …paragraph…   │
│  │  gold     │   │                 │
│  │  glow     │   │  Số lượng giải │ ← 36/700/44
│  │           │   │  thưởng: 10    │
│  │           │   │  Cá nhân       │
│  │           │   │                 │
│  │           │   │  Giá trị giải  │ ← 36/700/44
│  │           │   │  thưởng: 7.000 │
│  │           │   │  .000 VNĐ cho  │
│  │           │   │  mỗi giải thưởng│
│  └───────────┘   └─────────────────┘     │
│                                          │
└──────────────────────────────────────────┘
           total height: varies (≈ 400 px min)
```

**Card root (D.x):**

| Property | Value |
|----------|-------|
| Layout | `flex-direction: row; align-items: stretch` |
| Gap | `40 px` |
| Width | `853 px` |
| Height | `hug` (min ~400 px) |

**Picture (D.x.1):**

| Property | Value |
|----------|-------|
| Width × Height | `336 × 336` |
| Flex-shrink | `0` |
| Border-radius | `24 px` |
| Border | `0.955 px solid #FFEA9E` |
| Box-shadow | `0 4px 4px 0 rgba(0,0,0,0.25), 0 0 6px 0 #FAE287` |
| Background | image (per category, e.g. `top-talent.png`) |
| `<img>` mix-blend-mode | `screen` |
| Alt text | i18n key `awards.categories.<slug>.title` + " award badge" |

**Content block (D.x.2):**

| Property | Value |
|----------|-------|
| Layout | `flex-direction: column; align-items: flex-start; gap: 32 px` |
| Width | `477 px` (remainder of 853 - 336 - 40) |
| Padding | `32 px` (all sides) |
| Border-radius | `16 px` |
| Background | transparent |
| Backdrop-filter | `blur(32 px)` |
| No border | — |

Inside the content block (top → bottom). Each row except the description is introduced by a gold 24×24 icon:

1. **Title row** — horizontal flex: `MM_MEDIA_Target` 24×24 gold `#FFEA9E` + `<h2>` 24/700 Montserrat color `#FFEA9E`. Gap 8 px. Height ≈ 40 px.
2. **Description** — `<p>`, `--text-award-description` 16/700 justified, color `#FFFFFF`. Multi-paragraph supported.
3. **Horizontal separator rule** — `Rectangle 8` 1 px tall, full content-width, color derived from `--color-divider` at low opacity (Figma shows `rgba(255,234,158,0.20)` — a soft gold alpha). Between Description and Quantity.
4. **Quantity row** — horizontal flex: `MM_MEDIA_Diamond` 24×24 gold `#FFEA9E` + label "Số lượng giải thưởng:" (`--text-award-value` 36/700/44 white) on one line, then on the next line the numeric quantity (e.g. `10`) + unit label (e.g. `Cá nhân`). Vertical stack inside the row; both numeric + unit use `--text-award-value`.
5. **Horizontal separator rule** — `Rectangle 10` same style as rule above. Between Quantity and Value.
6. **Value row** — horizontal flex: `MM_MEDIA_License` 24×24 gold `#FFEA9E` + label "Giá trị giải thưởng:" (`--text-award-value` 36/700/44 white), then stacked below: formatted amount `7.000.000 VNĐ` + suffix text `cho mỗi giải thưởng`.

#### Signature 2025 – Creator (D.5 node `313:8471`) — **value section exception**

The Value section contains **two value rows** separated by a horizontal divider + the literal text `Hoặc` (i18n key `awards.card.signature_separator`):

```
┌ MM_MEDIA_License · Giá trị giải thưởng: ──────────┐
│                                                   │
│   5.000.000 VNĐ                                   │  ← row A (individual tier)
│   cho giải cá nhân                                │
│                                                   │
├────────────────── Hoặc ──────────────────────────┤  ← Frame 524: horizontal line + centered label
│                                                   │
│   MM_MEDIA_License · Giá trị giải thưởng:         │
│   8.000.000 VNĐ                                   │  ← row B (team tier)
│   cho giải tập thể                                │
└───────────────────────────────────────────────────┘
```

The "Hoặc" separator (Figma `Frame 524` = `Rectangle 11` 1 px horizontal line + `Hoặc` text centered on it). Both value rows have their own `MM_MEDIA_License` icon + "Giá trị giải thưởng:" label prefix. Quantity section for this card shows value `01` + combined unit `Cá nhân hoặc tập thể`.

**States:** None (static read-only card). No hover, no click, no focus. The card is not itself a link — clicking it does nothing; the only interactive elements on the card are text inside the description (currently none).

---

### Sun* Kudos promo — Component D1 (node `335:12023`)

Reused from Homepage D1. Identical markup, identical props. `selectedNav="awards"` on header doesn't affect the Kudos promo.

### Footer (reused from Homepage)

`<Footer variant="full" selectedNav="awards" />`. The "Awards Information" link is shown in the selected state.

---

## Layout Structure

```
  ┌───────────────────── 1440 ─────────────────────┐
  │  Header (80 px, fixed)                          │   ← reused
  │─────────────────────────────────────────────────│
  │  Hero keyvisual                                  │
  │  (ROOT FURTHER artwork + logo)                   │   frame 3 (313:8437)
  │  height 547 px                                    │
  │─────────────────────────────────────────────────│   gap 120 px
  │                                                   │
  │ ╔═════════ Title block A (1152 px wide) ════════╗│
  │ ║ Sun* annual awards 2025                       ║│
  │ ║ ─────────────────────────────────────────────  ║│
  │ ║ Hệ thống giải thưởng SAA 2025                 ║│
  │ ╚═══════════════════════════════════════════════╝│
  │                                                   │   gap 120 px
  │ ╔═════════ 2-col block B (1152 × 4833) ═════════╗│
  │ ║                                                 ║│
  │ ║ ┌ C ┐        ┌─────────── D ────────────┐     ║│
  │ ║ │178│  80px  │          853 wide         │     ║│
  │ ║ │   │  gap   │                            │     ║│
  │ ║ │   │        │  Card 1 (Top Talent) — Pic│C │  ║│  ← Pic LEFT, Content RIGHT
  │ ║ │   │        │                            │     ║│
  │ ║ │448│        │  gap 80 px                │     ║│
  │ ║ │   │        │                            │     ║│
  │ ║ │   │        │  Card 2 (Top Project) C │Pic│    ║│  ← Content LEFT, Pic RIGHT
  │ ║ │   │        │  Card 3 (Top Proj Leader) Pic│C│ ║│  ← Pic LEFT
  │ ║ │   │        │  Card 4 (Best Manager) C │Pic│  ║│  ← Pic RIGHT
  │ ║ │   │        │  Card 5 (Signature 2025) Pic│C│  ║│  ← Pic LEFT
  │ ║ │   │        │  Card 6 (MVP) C │Pic│         ║│  ← Pic RIGHT
  │ ║ └───┘        └───────────────────────────┘     ║│
  │ ╚═══════════════════════════════════════════════╝│
  │                                                   │   gap 120 px
  │  Sun* Kudos promo D1 (reused)                    │
  │                                                   │   gap 120 px
  │  Footer (reused)                                  │
  └───────────────────────────────────────────────────┘
  ↑                                                 ↑
  │← 144 px padding                 144 px padding →│
```

Total canvas height: **6410 px** (matches Figma).

---

## Responsive Specifications

| Breakpoint | Page padding (x) | Sidebar | Card layout | H1 size |
|------------|------------------|---------|-------------|---------|
| `≥ 1024 px` (Desktop) | `144 px` | Visible, sticky `top: 104 px`, 178 px wide | Row — odd cards (1/3/5) `flex-direction: row` (picture-left); even cards (2/4/6) `flex-direction: row-reverse` (picture-right) | 57 px |
| `768 – 1023 px` (Tablet) | `48 px` | **Hidden** | Column — odd cards `flex-direction: column` (picture-top); even cards `flex-direction: column-reverse` (picture-bottom) | 40 px |
| `< 768 px` (Mobile) | `20 px` | **Hidden** | Column — same alternation as tablet; numerics drop to 28/700/36 | 32 px |

**Alternation is preserved on all breakpoints** (confirmed 2026-04-21). The card outer container switches from `flex-direction: row | row-reverse` (desktop) to `column | column-reverse` (tablet/mobile) based on card index parity. DOM reading order always remains `<picture>` → `<content>` — only visual order shifts, keeping screen-reader output stable.

**Tablet/mobile notes:**
- Cards gap shrinks: `80 px → 48 px (tablet) → 32 px (mobile)`.
- Picture keeps `aspect-ratio: 1/1`; scales to `min(336px, 100%)`.
- Content block padding shrinks to `24 px` on mobile.
- Section gaps shrink: `120 px → 72 px (tablet) → 48 px (mobile)`.
- The main 2-col `flex-direction` switches to `column` at `< 1024 px` AND the sidebar is hidden via `display: none` (not just collapsed — the sidebar is pure navigation and scroll-to-section works via in-page scroll on mobile).

---

## Implementation Mapping

| Figma Node | Figma Name | React Component | Tailwind / CSS |
|------------|------------|-----------------|----------------|
| `I313:8436;2167:9030` | Header logo | `<Header>` (shared) | `var(--space-header-h)` |
| `313:8437` | Hero keyvisual | `<HeroBackdrop variant="awards">` (new variant — no countdown / no CTA) | `h-[547px] w-full bg-[url(/assets/homepage/hero.jpg)] bg-cover` + absolutely positioned ROOT FURTHER logo |
| `313:8453` | Title block A | `<AwardsTitle />` (new) | `flex flex-col gap-4 w-full max-w-[1152px] mx-auto` |
| `313:8454–5` | Caption | inside `<AwardsTitle />` | `text-base font-bold text-white` |
| divider | 1 px HR | inside `<AwardsTitle />` | `border-t border-[#2E3940]` |
| `313:8456` | H1 | inside `<AwardsTitle />` | `text-[57px] font-bold leading-[64px] tracking-[-0.25px] text-[#FFEA9E] drop-shadow-[0_0_6px_#FAE287]` |
| `313:8458` | 2-col block B | `<AwardsMain>` (new) | `flex flex-row gap-20 items-start w-full max-w-[1152px] mx-auto` (desktop); `flex-col gap-12` on `< 1024px` |
| `313:8459` | Sidebar C | `<AwardsSidebar activeSlug={…} />` (new) | `flex flex-col gap-4 w-[178px] sticky top-[104px]` |
| `313:8460–5` | Sidebar items C.1–C.6 | `<AwardsSidebarItem />` × 6 | `flex flex-row items-center gap-2 p-4 text-base font-bold` |
| `313:8466` | Cards column | (inline children of `<AwardsMain>`) | `flex flex-col gap-20 flex-1 max-w-[853px]` |
| `313:8467–71`, `313:8510` | Award cards D.1–D.6 | `<AwardInfoCard slug={…} index={…} />` × 6 — index drives alternation | `flex gap-10 items-stretch` + `flex-row-reverse` when `index % 2 === 1` (0-based: D.2/D.4/D.6) |
| `Frame 506` (D.1/D.3/D.5) | Picture-left layout wrapper | `<AwardInfoCard>` default | `flex-row` |
| `Frame 507` (D.2/D.4/D.6) | Picture-right layout wrapper | `<AwardInfoCard>` with `mirror` | `flex-row-reverse` |
| `I313:8467;214:2525` etc. | Picture | `<AwardPicture />` | `relative size-[336px] rounded-3xl border-[0.955px] border-[#FFEA9E] shadow-[0_4px_4px_0_rgba(0,0,0,.25),0_0_6px_0_#FAE287] shrink-0` with `<img class="mix-blend-screen rounded-3xl size-full object-cover" />` |
| `I313:8467;214:2526` etc. | Content block | `<AwardContent />` | `flex flex-col gap-8 p-8 rounded-2xl backdrop-blur-[32px] flex-1 min-w-0` |
| `MM_MEDIA_Target` + title | h2 row | `<AwardTitleRow icon title />` | `flex flex-row items-center gap-2 text-2xl font-bold text-[#FFEA9E]` |
| description | p | inside `<AwardContent />` | `text-base font-bold leading-6 tracking-[0.15px] text-justify text-white` |
| `Rectangle 8` / `Rectangle 10` | Inter-row rule | `<hr className="…" />` | `border-0 border-t border-[#FFEA9E]/20 w-full` |
| `MM_MEDIA_Diamond` + quantity | Quantity row | `<AwardMetric icon="diamond" label value unit />` | `flex flex-row items-start gap-2 text-[36px] font-bold leading-11 text-white` |
| `MM_MEDIA_License` + value | Value row | `<AwardMetric icon="license" label value suffix />` | same as quantity |
| `Frame 524` (Signature only) | "Hoặc" divider | `<AwardValueDivider />` | `flex items-center gap-2 w-full text-base font-bold text-white before:flex-1 before:h-px before:bg-[#FFEA9E]/20 after:flex-1 after:h-px after:bg-[#FFEA9E]/20` |
| `335:12023` | Kudos promo | `<KudosPromo />` (shared) | — |

### New files expected (from implementation plan)

- `src/components/awards/AwardsPage.tsx` (client wrapper handling scroll-spy + hash)
- `src/components/awards/AwardsTitle.tsx`
- `src/components/awards/AwardsMain.tsx`
- `src/components/awards/AwardsSidebar.tsx`
- `src/components/awards/AwardsSidebarItem.tsx`
- `src/components/awards/AwardInfoCard.tsx` (handles alternating layout via `index` prop / `flex-row-reverse`)
- `src/components/awards/AwardPicture.tsx`
- `src/components/awards/AwardContent.tsx`
- `src/components/awards/AwardTitleRow.tsx` (Target icon + h2)
- `src/components/awards/AwardMetric.tsx` (generic row: icon + label + value [+ unit | + suffix])
- `src/components/awards/AwardValueDivider.tsx` (Signature-only "Hoặc" line; receives label text via prop)
- `src/components/awards/useScrollSpy.ts` (IntersectionObserver hook)
- `src/lib/data/awards-details.ts` (static per-slug: `quantity`, `unit`, `value`, `mode`)
- `src/app/awards/page.tsx` (Server Component + `generateMetadata`)

### Modified files

- `src/components/homepage/HeroBackdrop.tsx` — add `variant="awards"` (new: no countdown, no CTA, 547 px height)
- `src/i18n/messages/vi.json` + `en.json` — add `awards.*` namespace
- `src/components/layout/Header.tsx` — ensure `selectedNav="awards"` active state matches "about" visual parity
- `src/components/layout/Footer.tsx` — ensure `selectedNav="awards"` active state

---

## Validation Checklist

### Completeness
- [x] All colors documented — all reused from Homepage; **0 new colors**.
- [x] All typography styles captured — **2 new tokens** (`--text-award-value`, `--text-award-description`); **0 new font families**.
- [x] All spacing values listed — **12 new `--space-*-awards-*` tokens**.
- [x] Component states defined — sidebar: Default / Hover / Focus / Selected / Selected+Hover documented. Cards are static (stateless).
- [x] Responsive breakpoints specified — Desktop ≥1024, Tablet 768–1023, Mobile <768, each with concrete value table.
- [x] Implementation mapping complete — every Figma node group mapped to a React component.
- [x] ASCII layout diagram accurate — reflects 1440 × 6410 canvas at desktop.

### Cross-reference with `spec.md`
- [x] FR-001 (auth) — no visual spec needed, covered by existing middleware.
- [x] FR-002 (6 cards fixed order + **alternating layout**) — layout diagram shows D.1–D.6 with Pic/Content side swap per index.
- [x] FR-003 (card content shape — Target/Diamond/License icons on 3 rows, horizontal rules between sections) — documented in "Award Card" section.
- [x] FR-003a (Signature exception with "Hoặc" divider) — documented with ASCII in "Award Card" Signature subsection.
- [x] FR-004 (sidebar 6 items + icon) — documented in "Sidebar Menu".
- [x] FR-005 (scroll offset 104 px) — matches sticky `top: 104 px` in Implementation Mapping.
- [x] FR-006 (URL hash update — pushState on click, replaceState on scroll-spy) — no visual impact.
- [x] FR-007/008 (default first item) — "Selected" state documented; default via JS.
- [x] FR-009 (IntersectionObserver) — no visual impact beyond sidebar state change.
- [x] FR-010 (<1024 hides sidebar) — responsive table shows sidebar hidden.
- [x] FR-011 (i18n) — no visual impact.
- [x] FR-012 (Kudos promo + Header + Footer) — all reused from Homepage.
- [x] FR-013 (locale currency formatting) — no visual spec; implementation via `Intl.NumberFormat`.
- [x] TR-001 (image priority/lazy) — no visual spec; implementation-level.
- [x] TR-002 (axe) — contrast values in Homepage spec confirm `#FFEA9E` on `#00101A` = 12.6:1 ✓.
- [x] TR-005 (rootMargin `-80px 0px -50% 0px`) — consistent with sticky header height 80.

---

## Resolved visual decisions (2026-04-21)

1. **Card vertical alignment** — `align-items: flex-start` on the card root; content block hugs its natural height; unused space below short content is page background (NOT extra padding).
2. **Sidebar sticky behavior** — ✅ `position: sticky; top: 104 px` on desktop.
3. **Mobile picture scale** — picture scales to `min(336px, 100%)` maintaining 1:1 aspect. No alternative mobile artwork required.
4. **Mobile alternating layout** — ✅ **preserved**. Odd cards use `flex-direction: column` (picture-top); even cards use `flex-direction: column-reverse` (picture-bottom). DOM order stays stable for a11y.
5. **Inter-row divider color** — ✅ `#FFEA9E` at 20% opacity. Token: `--border-awards-divider-gold-alpha`.
