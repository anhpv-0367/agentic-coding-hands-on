# Feature Specification: Awards Information Page

**Frame ID**: `313:8436`
**Frame Name**: `Hệ thống giải` (Awards Information)
**Screen ID**: `zFYDgyj_pD`
**File Key**: `9ypp4enmFmdK3YAFJLIu6C`
**Figma Link**: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/zFYDgyj_pD
**Canvas Size**: `1440 × 6410 px` (desktop)
**Created**: 2026-04-21
**Status**: Draft

---

## Overview

The **Awards Information page** (`/awards`) is the authenticated detail page that presents every SAA 2025 award category with full explanation, value, and quantity. It is reached by:

1. Clicking any of the 6 **award cards** on the Homepage (with a hash anchor like `/awards#top-talent` that auto-scrolls to the selected card).
2. Clicking the **"ABOUT AWARDS"** CTA in the Homepage hero.
3. Clicking **"Awards Information"** in the header or footer nav.

The page is purely informational — no user input, no forms, no submissions. It exists to communicate the full picture of what the ceremony is celebrating: who can win, what the categories are for, how many slots exist, and what the prize money is.

### Layout at a glance

- **Header** (reused, `selectedNav="awards"`)
- **Hero keyvisual** — full-width Root Further artwork (reuse of Homepage asset, different crop)
- **Section title** — caption "Sun* Annual Awards 2025" + horizontal divider + gold h1 "Hệ thống giải thưởng SAA 2025"
- **Main 2-column block** (the meat):
  - **Left (178 px)** — sticky/static Menu list with 6 nav items. Active item highlighted with gold underline + gold text; clicking scrolls to that section with a smooth offset that accounts for the fixed header.
  - **Right (853 px)** — vertical stack of 6 **award information cards** (Top Talent, Top Project, Top Project Leader, Best Manager, Signature 2025 – Creator, MVP). Each card is the SAA 2025 official spec for that category. **Cards alternate layout**: odd cards (1, 3, 5) have the picture on the LEFT and content on the RIGHT; even cards (2, 4, 6) have content on the LEFT and picture on the RIGHT — see `design-style.md §Award Card` for exact Figma node refs.
- **Sun\* Kudos promo** (reused, same as Homepage D1)
- **Footer** (reused, `selectedNav="awards"`)

### Relation to Homepage

The Award **cards** on the Homepage link here via `/awards#<slug>`. This page reuses:
- `<Header>` + `<Footer>` components (with `selectedNav="awards"`)
- `<HeroBackdrop>` component with a new `variant="awards"` (artwork-only, no countdown, no CTA, no event info) — see `design-style.md §Hero keyvisual`
- `<KudosPromo>` component
- Design tokens from `globals.css` (no new brand colors; only a couple of new typography tokens — see `design-style.md`)

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 – Browse All 6 Award Categories (Priority: P1) 🎯 MVP

An authenticated SAA visitor wants to understand the full awards catalog: what each category rewards, how many winners each category has, and the prize value per winner.

**Why this priority**: This page's reason for existing. Without it, users can't find prize amounts or criteria.

**Independent Test**: Log in, navigate to `/awards`. Within 3 seconds verify (a) the page title "Hệ thống giải thưởng SAA 2025" is visible, (b) 6 award cards render in order (Top Talent → Top Project → Top Project Leader → Best Manager → Signature 2025 – Creator → MVP), (c) each card shows picture + title + description + "Số lượng giải thưởng: N Đơn vị/Cá nhân/Tập thể" + "Giá trị giải thưởng: X VNĐ cho mỗi giải thưởng".

**Acceptance Scenarios**:

1. **Given** user is logged in, **When** they visit `/awards`, **Then** the page renders the title block + 6 cards + sidebar nav + Sun\* Kudos promo + footer.
2. **Given** the page is open, **When** user reads card 1, **Then** Top Talent shows `Số lượng giải thưởng: 10 Cá nhân` and `Giá trị giải thưởng: 7.000.000 VNĐ cho mỗi giải thưởng`, each row prefixed by its icon (Diamond for quantity, License for value).
3. **Given** the page is open, **When** user reads card 5 (Signature 2025 - Creator), **Then** they see the combined unit `Cá nhân hoặc tập thể` for quantity `01`, followed by TWO prize rows separated by a horizontal divider + the word `Hoặc`: row 1 `5.000.000 VNĐ cho giải cá nhân`, row 2 `8.000.000 VNĐ cho giải tập thể`.
4. **Given** any card, **When** the description is long, **Then** it wraps using `text-align: justify` and full line-height (no truncation — unlike Homepage card descriptions which are 2-line clamped).

---

### User Story 2 – Deep-link to a Specific Award (Priority: P1)

A user clicks a card on the Homepage OR shares a URL like `/awards#top-talent` with a colleague. On load, the browser auto-scrolls to that specific card's section, and the sidebar nav marks that item as active.

**Why this priority**: The Homepage's 6 award cards are designed to link into this page via hash; the navigation only makes sense if the hash lands the user at the right card.

**Independent Test**: Visit `/awards#best-manager` directly → the page renders with the "Best Manager" card in view and the sidebar "Best Manager" item highlighted gold.

**Acceptance Scenarios**:

1. **Given** URL `/awards#top-talent`, **When** the page loads, **Then** the browser scrolls so the Top Talent card is in the upper part of the viewport (below the fixed 80 px header), and the sidebar "Top Talent" item is the active state (gold underline + gold text).
2. **Given** URL `/awards` (no hash), **When** the page loads, **Then** the view starts at the top (hero keyvisual) and the first sidebar item (Top Talent) is active by default.
3. **Given** the user is reading card 3, **When** they click the sidebar "MVP" item, **Then** the page smoothly scrolls to the MVP card and the active state moves to MVP. URL updates to `/awards#mvp`.
4. **Given** URL `/awards#unknown-slug`, **When** the page loads, **Then** the page renders normally with no scroll jump and the first sidebar item is active (invalid hash is ignored).
5. **Given** any card is in the viewport, **When** the user scrolls, **Then** the sidebar active state tracks whichever card occupies the reading position (IntersectionObserver-based).
6. **Given** `prefers-reduced-motion: reduce`, **When** a sidebar item is clicked, **Then** the scroll is instant (no animated smooth scroll).

---

### User Story 3 – Sidebar Navigation (Priority: P2)

The left-hand Menu list lets the user jump between award categories without scrolling manually.

**Why this priority**: Nice-to-have for UX; the page still works without it (user can scroll), but it speeds up navigation for a ~6000 px tall page.

**Independent Test**: Open `/awards`, click each of the 6 sidebar items in order, verify each click scrolls to the matching card and the active state updates.

**Acceptance Scenarios**:

1. **Given** the sidebar, **When** user hovers a non-active item, **Then** the item's text color lightens (hover state — color lerp or underline preview).
2. **Given** the sidebar, **When** user clicks an item, **Then** the page scrolls to the matching card (smooth unless reduced-motion) and the URL updates to `#<slug>`.
3. **Given** the user scrolls manually past a card boundary, **When** the next card enters the viewport, **Then** the sidebar active state updates automatically (IntersectionObserver or scroll-spy).
4. **Given** keyboard navigation, **When** the user tabs through sidebar items, **Then** each item is focusable with a visible focus outline (`2px solid #FFEA9E`), and Enter/Space activates the scroll.
5. **Given** the user is on mobile (<1024px), **When** the page renders, **Then** the sidebar is HIDDEN and the page is a single column (cards stack full-width) — no horizontal layout attempt on narrow viewports.

---

### User Story 4 – Promo & Navigation Chrome (Priority: P2)

Header, footer, Sun\* Kudos promo, and the "Tiêu chuẩn chung" link behave consistently with the Homepage.

**Why this priority**: Chrome continuity. Reuses existing components; minimal new work.

**Independent Test**: Navigate to `/awards`. Confirm header shows "Awards Information" in the selected state (gold text + underline + gold text-shadow), footer also marks "Awards Information" as selected, Sun\* Kudos "Chi tiết" button navigates to `/kudos`.

**Acceptance Scenarios**:

1. **Given** user is on `/awards`, **When** they look at the header nav, **Then** "Awards Information" is the selected item (gold underline + gold text-shadow glow).
2. **Given** the user clicks the Sun\* Kudos "Chi tiết" CTA, **Then** the browser navigates to `/kudos`.
3. **Given** footer, **When** rendered, **Then** 4 footer links show (About SAA 2025, Awards Information, Sun\* Kudos, Tiêu chuẩn chung); "Awards Information" is in the selected state.

---

### Edge Cases

- **Hash mismatch**: `/awards#nonexistent` → page renders, no scroll, first item active.
- **Unauthenticated access**: middleware redirects to `/login?returnTo=%2Fawards` (covered by existing middleware).
- **Slow connection**: award picture images show dark placeholder with gold border (`border: 0.955px solid #FFEA9E`) — no layout shift.
- **Long descriptions (all cards are fully justified text)**: never clipped; cards grow vertically to fit.
- **Viewport width 320–767 px**: sidebar hidden, cards stacked full-width, picture scales down.
- **Back button behavior**: user clicks card A → sidebar uses `pushState("#a")`; clicks card B → `pushState("#b")`; presses Back → URL hash returns to `#a` and page scrolls back to card A (via `hashchange` listener). Passive scroll-spy uses `replaceState` so the back button is not polluted by scrolling.
- **Clicking the already-active sidebar item**: no-op visually; the browser still receives a `pushState` call so the hash round-trips (no scroll animation played if the target is already in view).
- **Language switch mid-view**: user toggles locale via header `VN/EN` → page re-renders with translated strings; currency formatting is recomputed via `Intl.NumberFormat(locale)` so `7.000.000 VNĐ` (VN) becomes `7,000,000 VND` (EN).
- **Right-to-left (RTL)**: not in scope.

---

## UI/UX Requirements *(from Figma)*

Visual specs live in **`design-style.md`** — this section references that document for pixel-level details.

### Screen Components

| Component | Ref | Description | Interactions |
|-----------|-----|-------------|--------------|
| Header | shared (`/components/layout/Header.tsx`) | Fixed top bar, `variant="full"`, `selectedNav="awards"` | Reused from Homepage |
| Hero Keyvisual | 3 (`313:8437`) | Full-width artwork `1440 × 547`, ROOT FURTHER logo `338 × 150` at x=144,y=184 | Static |
| Title block | A (`313:8453`) | Caption + 1 px divider + h1 "Hệ thống giải thưởng SAA 2025" | Static |
| Main 2-col | B (`313:8458`) | `flex-row` container `1152 × 4833`, `gap: 80 px; justify-content: flex-start; align-items: flex-start` | — |
| Sidebar Menu | C (`313:8459`) | Column, 178 wide, gap 16 px, 6 items | Hover + click + scroll-spy |
| Nav item (×6) | C.1–C.6 (`313:8460`–`313:8465`) | Padding 16 px, `MM_MEDIA_Target` 24×24 gold icon + label 16/700 Montserrat (`--text-body-strong`) | See States below |
| Cards column | D list (`313:8466`) | Column, 853 wide, gap 80 px, 6 cards | — |
| Award card (×6) | D.1–D.6 (`313:8467`, `8468`, `8469`, `8470`, `8471`, `8510`) | Picture (336×336) + Content (477 wide); layout **alternates** — odd (D.1/D.3/D.5) Picture-left `Frame 506`; even (D.2/D.4/D.6) Picture-right `Frame 507` | Static read-only |
| Picture | `I313:8467;214:2525` etc. | 336×336 image with gold 0.955 px border, 24 px radius, drop+glow shadow, `mix-blend-mode: screen` | Static |
| Content block | `I313:8467;214:2526` etc. | Flex col, gap 32 px, `backdrop-filter: blur(32px)`, 16 px radius; rows: **Title** (Target icon + h2), **Description** (justified p), **Quantity** (Diamond icon + label + value + unit), **Value** (License icon + label + amount + suffix) | Static |
| Sun\* Kudos promo | D1 (`335:12023`) | Reused from Homepage | "Chi tiết" → `/kudos` |
| Footer | shared | `variant="full"`, `selectedNav="awards"` | Reused |

### Navigation Flow

- **Entry**:
  - `/awards` direct URL or `/awards#<slug>`.
  - Homepage hero "ABOUT AWARDS" CTA → `/awards`.
  - Homepage award cards → `/awards#<slug>`.
  - Header or Footer "Awards Information" link → `/awards`.
- **Exit**:
  - Sun\* Kudos "Chi tiết" → `/kudos`.
  - Any header or footer nav → respective route.
  - SAA logo → `/`.
  - Profile "Sign out" → `/login`.

### Visual Requirements

- **Responsive breakpoints**: Mobile <768, Tablet 768–1023, Desktop ≥1024. On mobile + tablet, the sidebar is hidden and cards stack full-width. See `design-style.md` §Responsive Specifications.
- **Animations**:
  - Smooth scroll on sidebar click (disabled under `prefers-reduced-motion`).
  - Sidebar hover transition 150 ms ease-out.
  - No hover animation on cards themselves (read-only informational content).
- **Accessibility**:
  - `<h1>` = "Hệ thống giải thưởng SAA 2025" (one h1 per page).
  - `<h2>` = each of the 6 award category titles ("Top Talent", …).
  - Sidebar uses `<nav aria-label="Danh mục giải thưởng">` (localized via `awards.sidebar.aria_label`) wrapping an `<ol>` of 6 links; `aria-current="location"` on the active item (anchor-navigation semantic).
  - Active scroll-spy announcement: the sidebar wraps each item in a `<a href="#<slug>">` — standard href anchors are keyboard-accessible out of the box.
  - Focus visible on all interactive elements (2 px gold outline, 2 px offset).
  - Skip-link "Skip to main content" (reused from Homepage) lands on `<main id="main-content">` wrapping the title + 2-col block.
  - Color contrast: `#FFEA9E` on `#00101A` = 12.6:1 ✅; `#FFFFFF` on `#00101A` = 19.3:1 ✅.
  - Images have `alt` describing the award (e.g., `"Top Talent award badge"`).
  - Reduced-motion honored.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST render the Awards page at protected route `/awards` — authenticated users only; middleware redirect applies.
- **FR-002**: System MUST render 6 award cards in the fixed order: Top Talent, Top Project, Top Project Leader, Best Manager, Signature 2025 – Creator, MVP. The layout MUST alternate per card index: odd (1, 3, 5) picture-left; even (2, 4, 6) picture-right.
- **FR-003**: Each card MUST display four rows stacked vertically inside the content block: (1) **Title** — `MM_MEDIA_Target` gold icon + award name (`<h2>`); (2) **Description** — justified multi-paragraph text; (3) **Quantity** — `MM_MEDIA_Diamond` gold icon + label "Số lượng giải thưởng:" + numeric quantity + unit (`Cá nhân` | `Tập thể` | `Cá nhân hoặc tập thể`); (4) **Value** — `MM_MEDIA_License` gold icon + label "Giá trị giải thưởng:" + formatted amount `X.XXX.XXX VNĐ` + suffix `cho mỗi giải thưởng`.
- **FR-003a (Signature exception)**: For card 5 (Signature 2025 – Creator), the Value row MUST be **two stacked rows** separated by a horizontal divider line + the literal text `Hoặc`: row A `5.000.000 VNĐ cho giải cá nhân`, row B `8.000.000 VNĐ cho giải tập thể`. The quantity unit is `Cá nhân hoặc tập thể` (single combined label); quantity value is `01`.
- **FR-004**: Sidebar nav MUST display 6 items in the same order as the cards, each with icon (`MM_MEDIA_Target` 24×24 gold `#FFEA9E`) + label (`--text-body-strong` 16/700).
- **FR-005**: Clicking a sidebar item MUST scroll the matching card into view with an offset of `80px + 24px = 104px` from the top of the viewport (accounting for the fixed header + a visual gap). Respect `prefers-reduced-motion: reduce`.
- **FR-006**: URL hash MUST update (a) via `history.pushState` on explicit sidebar click (so browser Back/Forward step through user navigations), and (b) via `history.replaceState` on passive scroll-spy activation (so scrolling doesn't pollute history). Implementations using `<a href="#slug">` + `preventDefault` + `pushState` satisfy this.
- **FR-007**: On page load with `#<slug>`, the page MUST scroll to the matching card and mark the sidebar as active.
- **FR-008**: On page load without a hash OR with an unknown hash, the first sidebar item (Top Talent) MUST be active by default.
- **FR-009**: Scroll-spy MUST use `IntersectionObserver` to track which card is centered in the viewport and update the active sidebar item accordingly.
- **FR-010**: On viewports < 1024 px, the sidebar MUST be hidden and cards stack full-width.
- **FR-011**: All user-visible text MUST be rendered via `next-intl` — no hard-coded strings.
- **FR-012**: The page MUST include the Sun\* Kudos promo and the shared Header + Footer.
- **FR-013**: Currency values MUST be formatted with thousands separator using `Intl.NumberFormat` in the active locale (VN uses `.` as separator, EN uses `,`). Currency suffix is `VNĐ` in VN and `VND` in EN.

### Technical Requirements

- **TR-001 (Performance)**: LCP ≤ 2.5s. Hero keyvisual uses `<Image priority>`. The 6 award images use `loading="lazy"` (below-the-fold).
- **TR-002 (Accessibility)**: 0 axe-core WCAG 2.1 AA violations.
- **TR-003 (i18n completeness)**: 100% of new strings (`awards.*` namespace) exist in both `vi.json` and `en.json`; CI parity check extends to this namespace.
- **TR-004 (SEO/metadata)**: `<title>` and `<meta description>` locale-aware via `generateMetadata` + `getTranslations("awards.metadata")`.
- **TR-005 (Scroll-spy perf)**: the `IntersectionObserver` MUST use `rootMargin: "-80px 0px -50% 0px"` so the active card is whichever one is in the upper half of the viewport (below the header).

### Key Entities

- **AwardCategoryDetail** — `type AwardCategoryDetail = { slug: AwardSlug; title: Record<Locale,string>; description: Record<Locale,string>; imageUrl: string; quantity: number; unit: "individual"|"team"|"individual_or_team"; prizeValueVnd: number | { individual: number; team: number }; prizeValueSuffix: "per_award"|"per_individual_award"|"per_team_award" }`. Per constitution, all TS type declarations use `type`, not `interface`. Extends the lighter `AwardCategory` used on the Homepage.

### Environment Variables

No new env vars. Reuses `NEXT_PUBLIC_EVENT_DATE` context indirectly via shared components; the page itself doesn't read any env.

### State Management

**Local (Awards page client component)**:

| State | Type | Purpose |
|-------|------|---------|
| `activeSlug` | `AwardSlug` | Sidebar active item, driven by IntersectionObserver + sidebar click |

**Global**: none beyond existing Supabase session + `NEXT_LOCALE` cookie.

**No SWR, no fetch.** All award content is static: long-form localized strings live in `src/i18n/messages/{vi,en}.json` under `awards.categories.<slug>.*`; numeric data (quantity, value) lives in `src/lib/data/awards-details.ts` as a typed constant map. Same pattern as Homepage's award grid — no backend endpoint is consulted.

**Loading / error states**:

| Scenario | UI |
|----------|----|
| First render | All 6 cards render synchronously from i18n |
| Hash invalid | Silent — default to first item |
| Image fails to load | Gold-bordered placeholder (inherits `border: 0.955px solid #FFEA9E`) |
| Reduced motion | Instant scroll, no animation |

---

## Data Requirements

### i18n Keys — `awards.*`

Namespace: `awards`. Extends Homepage's `homepage.awards.categories.*` which already has 6 entries × {title, description}. For THIS page we add long-form content and metadata:

| Key | VN | EN |
|-----|-----|-----|
| `awards.page.caption` | Sun\* annual awards 2025 | Sun\* Annual Awards 2025 |
| `awards.page.title` | Hệ thống giải thưởng SAA 2025 | Awards system — SAA 2025 |
| `awards.metadata.title` | Hệ thống giải thưởng — Sun\* Annual Awards 2025 | Awards System — Sun\* Annual Awards 2025 |
| `awards.metadata.description` | Tìm hiểu 6 hạng mục giải thưởng Sun\* Annual Awards 2025 — Top Talent, Top Project, Top Project Leader, Best Manager, Signature 2025 - Creator, MVP. | Discover the 6 SAA 2025 award categories — Top Talent, Top Project, Top Project Leader, Best Manager, Signature 2025 - Creator, MVP. |
| `awards.sidebar.aria_label` | Danh mục giải thưởng | Award categories |
| `awards.card.quantity_label` | Số lượng giải thưởng: | Number of awards: |
| `awards.card.value_label` | Giá trị giải thưởng: | Award value: |
| `awards.card.value_suffix_per_award` | cho mỗi giải thưởng | per award |
| `awards.card.value_suffix_per_individual` | cho giải cá nhân | per individual award |
| `awards.card.value_suffix_per_team` | cho giải tập thể | per team award |
| `awards.card.unit.individual` | Cá nhân | Individual |
| `awards.card.unit.team` | Tập thể | Team |
| `awards.card.unit.individual_or_team` | Cá nhân hoặc tập thể | Individual or team |
| `awards.card.signature_separator` | Hoặc | Or |
| `awards.currency.vnd` | VNĐ | VND |

#### Per-category long descriptions (new for this page)

Each category gets a `awards.categories.<slug>.long_description` key (multi-paragraph Vietnamese text visible as justified body on the card). For MVP, these are placeholder strings to be authored by the content team; the i18n parity test still enforces key presence. Initial placeholders below.

| Key | VN (draft) |
|-----|-----|
| `awards.categories.top_talent.long_description` | Giải Top Talent dành cho những cá nhân xuất sắc nhất Sun\* — người đã tạo ra dấu ấn vượt trội trong chuyên môn, cam kết tinh thần một-Sun\*, và truyền cảm hứng cho đồng nghiệp trên hành trình "Root Further". … |
| `awards.categories.top_talent.quantity` | 10 |
| `awards.categories.top_talent.unit` | Cá nhân |
| `awards.categories.top_talent.value` | 7000000 (stored as number; rendered with Intl) |
| `awards.categories.top_talent.value_mode` | `"per_award"` (literal: `cho mỗi giải thưởng`) |
| `awards.categories.top_project.*` | quantity `02`, unit `Tập thể`, value `15000000`, suffix `per_award` |
| `awards.categories.top_project_leader.*` | quantity `03`, unit `Cá nhân`, value `7000000`, suffix `per_award` |
| `awards.categories.best_manager.*` | quantity `01`, unit `Cá nhân`, value `10000000`, suffix `per_award` |
| `awards.categories.signature_2025_creator.*` | quantity `01`, unit `Cá nhân hoặc tập thể`, **two tiers**: `value_individual: 5000000` (suffix `per_individual`), `value_team: 8000000` (suffix `per_team`), separator literal `Hoặc` with horizontal divider line between the two rows |
| `awards.categories.mvp.*` | quantity `01`, unit `Cá nhân`, value `15000000`, suffix `per_award` |

> **Note**: quantity, unit, value are numeric/enum data — NOT plain strings. They can live in a TypeScript constants file (`src/lib/data/awards-details.ts`) separate from the i18n JSON, with labels rendered via i18n. This keeps the data + presentation concerns clean.

### Dynamic Data Fields (MVP sources)

| Field | Type | Source | Display |
|-------|------|--------|---------|
| Active slug | `AwardSlug` | URL hash + scroll-spy | Sidebar highlight, scroll position |
| Card quantity | `number` | Static `AWARDS_DETAILS` map | 2-digit display (zero-padded optional) |
| Card value | `number` | Static map | `Intl.NumberFormat(locale).format(value)` + `VNĐ`/`VND` |
| Card description | string | i18n key per locale | Paragraph, justified |

---

## API Dependencies

None. Fully static page. No backend calls beyond Supabase Auth (handled by middleware).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: `/awards#top-talent` loads and scrolls to the correct card within 1.5 s on 4G (measured p95).
- **SC-002**: 100% of visible strings respect the active locale (automated Playwright check with Vietnamese-diacritic regex).
- **SC-003**: Axe-core reports 0 WCAG 2.1 AA violations.
- **SC-004**: Lighthouse LCP ≤ 2.5 s, CLS ≤ 0.1.
- **SC-005**: Sidebar active state tracks scroll within 200 ms of a card entering the viewport's upper half (manual timing).
- **SC-006**: All 6 award cards render the exact quantity + value + unit per `design-style.md` Table "Per-award content" — no hardcoded strings.

---

## Out of Scope

- **Editing / admin**: no UI for admins to change award titles, descriptions, or values from this page. Any change is a code/i18n edit + redeploy.
- **Winner announcements**: this page is pre-ceremony only. Post-ceremony winner list belongs on a separate page.
- **Nominations / submissions**: voting and nomination UIs are separate.
- **Downloading / printing**: no "Download PDF" or "Print" action.
- **Mobile hamburger nav**: the sidebar is hidden on mobile; no separate mobile TOC.

---

## Dependencies

- [x] `constitution.md` reviewed.
- [x] Homepage specs shipped — provides `<Header>`, `<Footer>`, `<HeroBackdrop>`, `<KudosPromo>`, shared design tokens, i18n infrastructure.
- [ ] **Assets** — reuse Homepage's 6 award images from `public/assets/homepage/images/awards/*`, reuse ROOT FURTHER logo asset. Download 3 icons from Figma if not already in `public/assets/icons/`:
  - `MM_MEDIA_Target` 24×24 (used on sidebar item and each card's title row)
  - `MM_MEDIA_Diamond` 24×24 (card quantity row)
  - `MM_MEDIA_License` 24×24 (card value row)
- [ ] i18n keys — add `awards.*` namespace (16 shared keys incl. `signature_separator`, `value_suffix_per_individual`, `value_suffix_per_team`; + per-category long descriptions & metadata).
- [ ] Content team — authoritative long descriptions for each of the 6 categories.

---

## Resolved Decisions (2026-04-21)

All previously open questions have been confirmed by the product owner:

1. **Alternating card layout** — ✅ intentional. Odd cards (1/3/5) Picture-LEFT; even (2/4/6) Picture-RIGHT. FR-002 stands as-is.
2. **Sticky sidebar on desktop** — ✅ confirmed. Sidebar uses `position: sticky; top: 104px` on viewports ≥ 1024 px.
3. **Inter-row divider opacity** — ✅ `#FFEA9E` at 20% opacity (as specified in design-style.md).
4. **Mobile alternation** — ✅ **preserved** on viewports < 1024 px. Cards stack vertically; alternation is expressed as **picture-top / content-bottom on odd cards** and **content-top / picture-bottom on even cards**. (NOT dropped.)
5. **Tablet breakpoint** — 1024 px cutoff for showing/hiding the sidebar (matches Homepage convention).

---

## Notes

- **Heavy reuse**: ~80% of this page is composition of existing Homepage components. The only genuinely new work is the Menu list (sidebar) + the Award info card.
- **Scroll-spy complexity**: IntersectionObserver is straightforward but make sure `rootMargin` is tuned so the "active" card is whichever one the user is currently reading, not whichever one is just barely visible.
- **i18n data strategy**: long descriptions go in i18n JSON (translatable). Numeric data (quantity, value) goes in a TypeScript constants file imported by the card component. Currency formatting uses `Intl.NumberFormat` with the locale fetched via `useLocale()` / `getLocale()`.
- **The page is long (~6000 px)**: ensure the `main` wrapper has `min-height: 100vh` and the `<Footer>` sits at the natural end, not floating. The Homepage pattern already handles this.
