# Feature Specification: Homepage SAA 2025

**Frame ID**: `2167:9026`
**Frame Name**: `Homepage SAA`
**Screen ID**: `i87tDx10uM`
**File Key**: `9ypp4enmFmdK3YAFJLIu6C`
**Figma Link**: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/i87tDx10uM
**Created**: 2026-04-21
**Status**: Draft

---

## Overview

The **Homepage** is the authenticated landing page for the **Sun* Annual Awards 2025 (SAA 2025)** web application, reached after a successful Google OAuth login. It serves three simultaneous purposes:

1. **Build anticipation** — a full-bleed keyvisual with a small "ROOT FURTHER" brand logo, a live countdown to the ceremony, event info, and two CTAs.
2. **Introduce the campaign theme** — a second, prominent "ROOT FURTHER" display block (two large image assets, "ROOT" + "FURTHER") anchoring a three-paragraph description of the campaign's spirit.
3. **Introduce the award categories** — a grid of six award cards (Top Talent, Top Project, Top Project Leader, Best Manager, Signature 2025 – Creator, MVP) linking to detail pages.
4. **Promote Sun\* Kudos** — a parallel recognition movement running alongside SAA, promoted with a dedicated card linking to its own page.

The page is fully bilingual (Vietnamese default, English optional) via the header language selector — **every user-visible text, including dynamic data from the backend, must be localizable**. The screen also exposes persistent chrome (header with navigation, notification, profile, language; footer with four links; floating widget action button) shared with the rest of the authenticated app.

Reached from `/` (root route) when a user session is present. Unauthenticated users hitting `/` are redirected to `/login` by the existing middleware.

### Brand-text rendering decision

The "ROOT FURTHER" brand phrase is rendered as **pre-exported image assets** (from Figma), not as live text:
- **Small hero logo** (`MM_MEDIA_Root Further Logo`, Figma node `2788:12911`) — single combined image shown in the hero block next to the countdown.
- **Large display** — two separate images `MM_MEDIA_Root Text` (`3204:10155`) + `MM_MEDIA_Further Text` (`3204:10154`) shown side-by-side above the description paragraph.

This is deliberate: the typography uses a custom drawn wordmark that isn't available as a web font. Implementation MUST preserve this — **do not attempt to recreate ROOT FURTHER as live text**. Alt text and visually-hidden `<h1>` strategy described in §UI/UX Requirements §Accessibility.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 – Countdown & Hero Awareness (Priority: P1) 🎯 MVP

A logged-in user lands on the homepage and immediately sees the "ROOT FURTHER" branding, the current countdown to the event, and the two primary CTAs (About Awards / About Kudos). The countdown updates at least once per minute without a manual refresh.

**Why this priority**: This is the primary purpose of the homepage — communicate the event's theme and when it's happening. Every other section supplements this. Without it, the page has no reason to exist.

**Independent Test**: Log in, land on `/`. Within 3 seconds, verify (a) the "ROOT FURTHER" hero title is visible, (b) three countdown tiles (DAYS/HOURS/MINUTES) render with 2-digit zero-padded numbers matching the wall-clock difference to the configured event datetime, (c) both CTA buttons are visible and clickable, (d) after 60 seconds the MINUTES tile has decreased by 1.

**Acceptance Scenarios**:

1. **Given** a user is logged in, **When** they visit `/`, **Then** the hero section shows the small "ROOT FURTHER" brand image, "Coming soon" sub-label, and a countdown with DAYS/HOURS/MINUTES tiles reflecting the time remaining until `NEXT_PUBLIC_EVENT_DATE`; below the hero the large "ROOT" + "FURTHER" image pair is visible above the description paragraphs.
2. **Given** the page has been open for ≥60 seconds, **When** a minute boundary passes, **Then** the MINUTES tile decrements by 1 (and cascades DAYS/HOURS at hour/day boundaries) without a full page reload.
3. **Given** `NEXT_PUBLIC_EVENT_DATE` is in the past, **When** the page renders, **Then** all three tiles show `00`, the "Coming soon" label is hidden, and countdown does not continue to count down.
4. **Given** the user clicks "ABOUT AWARDS", **Then** the browser navigates to the Awards Information page (route TBD; likely `/awards`).
5. **Given** the user clicks "ABOUT KUDOS", **Then** the browser navigates to the Sun* Kudos page (route TBD; likely `/kudos`).
6. **Given** `prefers-reduced-motion: reduce` is set, **When** the countdown updates, **Then** no flip/scale animation plays (the number simply replaces), but the update frequency is unchanged.

---

### User Story 2 – Language Selection Affects Every Text (Priority: P1)

A user toggles the language selector between **VN** and **EN** in the header; **all** user-visible text on the page — including dynamic event info (time/location), award titles/descriptions, and the Sun* Kudos body copy — switches to the chosen language. Choice persists across page reloads and navigation.

**Why this priority**: The user explicitly flagged i18n as a focus. The Login screen already supports language switching; the homepage, with dozens of translatable strings and dynamic content, must not silently leak Vietnamese strings when EN is selected. If we ship incomplete i18n here, the product looks broken.

**Independent Test**: Load `/` in VN. Scan the page — note every visible string. Click language selector → EN. Verify every one of those strings changes to its English equivalent. Reload the page — the language preference persists. No string is shown as a missing-key placeholder.

**Acceptance Scenarios**:

1. **Given** the language cookie is `vi` or unset, **When** the homepage loads, **Then** every text listed in §Data Requirements §i18n Keys renders in Vietnamese.
2. **Given** user opens the language menu and selects **EN**, **When** the page re-renders, **Then** every text in §i18n Keys renders in English; the header flag changes from VN to US; cookie `NEXT_LOCALE=en` is persisted for 1 year.
3. **Given** content is driven by i18n JSON in MVP (award titles/descriptions, Sun\* Kudos body, event location), **When** the locale changes, **Then** the component picks the key matching the current locale — never a hard-coded fallback. *(When a dynamic API is introduced later, it MUST return `{vi, en}` pairs; this AC still applies.)*
4. **Given** EN is selected and an i18n key is missing from `en.json`, **When** the page renders in development, **Then** the missing key is logged to the console; in production, a safe Vietnamese fallback is shown (configurable per namespace).
5. **Given** EN is selected, **When** the user navigates to a detail page (Awards Information, Sun* Kudos) and returns, **Then** EN is still active.
6. **Given** the event datetime renders as "18h30" in VN, **When** EN is selected, **Then** it renders as "6:30 PM" (locale-aware time formatting via `Intl.DateTimeFormat`).
7. **Given** number formatting is required (none currently on this screen, but the countdown digits), **When** the locale changes, **Then** numerals remain Arabic (0-9) for both locales — the Digital Numbers font has no localized glyph set.

---

### User Story 3 – Award Categories Grid (Priority: P2)

A user scrolls to the "Hệ thống giải thưởng" / "Awards system" section and sees six award category cards, each with an image, title, short description, and a "Chi tiết" link that jumps to the detail page anchored at the category's slug.

**Why this priority**: Core content of the event. However, the homepage still delivers value without this section (the hero + countdown alone communicate the event). Makes this P2 rather than P1.

**Independent Test**: Scroll to the Awards section. Verify 6 cards render in a 3-column grid on desktop (2-column on tablet/mobile). Click the first card's "Chi tiết" link. Verify navigation to `/awards#top-talent` (or the equivalent slug).

**Acceptance Scenarios**:

1. **Given** the Awards section is in viewport, **When** it renders, **Then** 6 cards are visible with their respective images, titles, and descriptions, in this order: Top Talent, Top Project, Top Project Leader, Best Manager, Signature 2025 – Creator, MVP.
2. **Given** a card's description is longer than the allocated 2-line slot, **When** it renders, **Then** the description is truncated with an ellipsis (`…`) at the end of the second line.
3. **Given** the user hovers over a card, **When** the pointer enters the card bounds, **Then** the card lifts slightly (`transform: translateY(-2px)`) and the gold glow around the image intensifies (`box-shadow: 0 0 12px #FAE287`).
4. **Given** the user clicks anywhere on the card (image, title, or "Chi tiết"), **Then** navigation routes to `/awards#<slug>` where slug is one of `top-talent`, `top-project`, `top-project-leader`, `best-manager`, `signature-2025-creator`, `mvp`.
5. **Given** the viewport is <1024px, **When** the grid renders, **Then** the layout switches to 2 columns; <768px uses 2 columns with reduced card width.
6. **Given** i18n is EN, **When** the cards render, **Then** titles and descriptions are in English (e.g. "Top Talent" stays English proper-noun-like; descriptions fully translated).

---

### User Story 4 – Sun\* Kudos Promo (Priority: P2)

The user reaches the Sun* Kudos promo card (a wide banner with title, label, description, media, and a "Chi tiết" button) and can click through to the Sun* Kudos landing page.

**Why this priority**: Sun\* Kudos is a parallel campaign — important for the organization, but not the primary SAA event. Independent from awards.

**Independent Test**: Scroll below the awards grid. Verify the Sun* Kudos card renders (1224×500 on desktop) with label "Phong trào ghi nhận", display title "Sun* Kudos" (left), decorative "KUDOS" wordmark (right-side, faded), body copy, and a "Chi tiết" gold button. Click the button → `/kudos`.

**Acceptance Scenarios**:

1. **Given** the Sun* Kudos section is in viewport, **When** it renders, **Then** it shows the label, title "Sun* Kudos" (brand name — unchanged across locales), body paragraph (translated), "KUDOS" decorative wordmark, and "Chi tiết" gold button.
2. **Given** the user clicks "Chi tiết", **Then** the browser navigates to `/kudos`.
3. **Given** viewport <1024px, **Then** the media stacks below the content.

---

### User Story 5 – Global Chrome (Header, Footer, Widget) (Priority: P2)

Header with full nav, footer with duplicate nav + copyright, and a floating Widget button are available on every section of the homepage and behave identically to how they're specified for the rest of the authenticated app.

**Why this priority**: Global chrome is shared across authenticated routes. Implementing it here makes every subsequent page cheaper. But it isn't itself the "homepage value".

**Independent Test**: On `/`, verify:
  - Header stays fixed during scroll and maintains its glass backdrop (`backdrop-filter: blur`).
  - "About SAA 2025" link shows the "selected" state (gold underline + text-shadow glow).
  - Notification bell shows a red dot when `unread > 0` (MVP: stub returns 0 → no dot).
  - Profile icon opens a dropdown on click with "Profile", "Sign out" (and "Admin Dashboard" if `user.app_metadata.role === 'admin'`).
  - Footer renders bottom-of-page with the logo, **four** nav links (About SAA 2025, Awards Information, Sun* Kudos, Tiêu chuẩn chung), and the copyright.
  - Widget button stays fixed in bottom-right of viewport during scroll and has `aria-disabled="true"` (MVP: click is a silent no-op).

**Acceptance Scenarios**:

1. **Given** the user scrolls past 200px, **When** they look at the top of the viewport, **Then** the header is still fully visible with `backdrop-filter: blur` applied to the `rgba(16,20,23,0.8)` background.
2. **Given** the user clicks the SAA logo, **Then** the page scrolls to top (smooth scroll respecting reduced-motion).
3. **Given** the user is on `/`, **When** they look at the header nav, **Then** "About SAA 2025" is rendered in the "selected" visual state (gold text, 1px bottom underline `#FFEA9E`, gold text-shadow).
4. **Given** the user clicks "Awards Information", **Then** navigation routes to `/awards` and the "Awards Information" link on the destination becomes the selected one.
5. **Given** the user clicks the profile icon, **Then** a dropdown menu appears with "Profile", "Sign out" (and "Admin Dashboard" if `user.role === 'admin'`).
6. **Given** the user clicks "Sign out", **Then** Supabase session is cleared and the user is redirected to `/login`.
7. **Given** the user clicks the Widget button in MVP, **Then** nothing happens (silent no-op); `aria-disabled="true"` announces the state to assistive tech. When future quick-actions are defined, this becomes a menu trigger without any visual-design change.

---

### User Story 6 – Unauthenticated Redirect (Priority: P3)

An unauthenticated visitor hitting `/` is redirected to `/login?returnTo=%2F`.

**Why this priority**: Already covered by the existing middleware built for the Login screen (`middleware.ts`). Homepage only needs to inherit it — no new code.

**Independent Test**: Open an incognito window, visit `/`. Verify redirect to `/login?returnTo=%2F`.

**Acceptance Scenarios**:

1. **Given** no Supabase session cookie, **When** user visits `/`, **Then** they are redirected to `/login?returnTo=%2F`.
2. **Given** the user logs in on that Login page, **When** the OAuth callback completes, **Then** they are redirected back to `/`.

---

### Edge Cases

- **Event datetime misconfigured** (not a valid ISO 8601): countdown renders `--` and a development-only warning; production falls back to hiding the hero countdown entirely (show only small ROOT FURTHER logo + CTAs).
- **Award list count**: the i18n file MUST contain exactly 6 category entries. If fewer are provided (content-team mistake), render only the available ones and log a dev warning. *(Not applicable when content comes from a future backend — this edge case is about static-content authoring.)*
- **Profile menu missing `user.app_metadata.role`**: omit the "Admin Dashboard" option silently (don't crash).
- **User toggles language mid-countdown**: countdown values do not reset; only labels ("DAYS" → "DAYS", "Coming soon") change.
- **Tab title**: locale-aware via `generateMetadata` — uses i18n key `metadata.title` (VN: "Trang chủ — Sun\* Annual Awards 2025"; EN: "Home — Sun\* Annual Awards 2025"). See TR-007.
- **Slow image load**: award card images MUST have an explicit placeholder (dark rectangle with border `#FFEA9E`) to prevent layout shift. Use Next.js `<Image>` `placeholder="blur"` or a solid dark BlurDataURL.
- **Missing user avatar** (`user.avatar_url === null`): render the default profile icon (`icon-user.svg`) instead of an `<img>`; no broken-image indicator.
- **Long display name**: `user.display_name` in the profile dropdown MUST truncate with ellipsis at ~24 chars to fit the menu width.
- **Offline**: Homepage is fully static in MVP (i18n + env var + Supabase session cached in cookies). Should render identically offline if the service worker caches assets. No explicit offline UI required for MVP; document that the page MAY render stale session data if offline.
- **Keyboard nav**: Tab order must follow DOM order (Skip-link → Logo → About SAA 2025 → Awards Information → Sun\* Kudos → Notification → Language → Profile → ABOUT AWARDS → ABOUT KUDOS → each of 6 award cards (picture + Chi tiết separately? — treat the card as ONE tab stop) → Sunkudos Chi tiết → Footer links (4) → Widget button). Verify with `Tab` + `Shift+Tab`.
- **Countdown tab hidden**: when `document.visibilityState === 'hidden'`, pause the interval. Resume immediately on `visibilitychange` back to visible and re-compute from wall clock (don't trust the in-memory counter).
- **Right-to-left (RTL)**: not in scope — project only supports VN + EN (both LTR).

---

## UI/UX Requirements *(from Figma)*

Visual specs live in **`design-style.md`** — this section references that document for pixel-level details.

### Screen Components

| Component | Ref | Description | Interactions |
|-----------|-----|-------------|--------------|
| Header | A1 (`2167:9091`) | Fixed top bar with logo + 3 nav links + notification + language + profile | Sticky; blur backdrop; nav links hover/selected/normal; notification bell shows red dot when `unread>0` |
| Hero Keyvisual bg | 3.5 (`2167:9027`) | Full-bleed decorative image ("wave/roots") + gradient overlay ("Cover") | Static visual backdrop |
| Hero content block | Frame 487 inside `2167:9030` | Small "ROOT FURTHER" image (`2788:12911`) + countdown (B1) + event info (B2) + CTA pair (B3) | Stacked above the hero background |
| Countdown | B1 (`2167:9035`) | 3 tiles (Days/Hours/Minutes); each tile has 2 separate single-digit glass sub-tiles + a unit label | Auto-updates every minute (client-side); hides "Coming soon" after target; each sub-tile renders ONE digit |
| Event info | B2 (`2167:9053`) | Two rows — Time (label + value) and Location (label + value) — plus broadcast note | No interaction |
| CTA pair | B3 | "ABOUT AWARDS" (primary gold, Figma shows hover state) + "ABOUT KUDOS" (secondary outline, Figma shows normal). Per the design spec, hovering the secondary swaps it to the primary styling | Click → navigate |
| ROOT FURTHER display | Frame 486 + B4 (`5001:14827`) | Two large image tokens ("ROOT" + "FURTHER") as a display block, followed by 3-paragraph description | Static; images have alt text |
| Awards section header | C1 (`2167:9069`) | Caption "Sun* annual awards 2025" + display title "Hệ thống giải thưởng" + short description | Static |
| Award grid | C2 (`5005:14974`) | 3×2 grid of 6 award cards; order: Top Talent, Top Project, Top Project Leader, Best Manager, Signature 2025 - Creator, MVP | Each card clickable (hover lift+glow); navigates to `/awards#<slug>` |
| Sunkudos promo | D1 (`3390:10349`) | Horizontal card: label + title + body + CTA (left) + media background + decorative "KUDOS" wordmark (right) | "Chi tiết" click → `/kudos` |
| Widget button | 6 (`5022:15169`) | Floating pill in bottom-right; **left icon** (pencil) + **center text "/"** (Montserrat 24/700, NOT an icon) + **right icon** (SAA Kudos logo) | Click → opens quick-action menu (placeholder for MVP) |
| Footer | 7 (`5001:14800`) | Logo + **4** nav links (About SAA 2025, Awards Information, Sun* Kudos, **Tiêu chuẩn chung** / Standards) + copyright | Same nav behavior as header; "Tiêu chuẩn chung" is a new target screen (not yet specified) |

### Navigation Flow

- **Entry**:
  - From `/login` after successful Google OAuth (primary).
  - Direct URL `/` while authenticated.
  - Click SAA logo from any authenticated page.
- **Exit**:
  - Click "ABOUT AWARDS" / "Awards Information" / card / "Chi tiết" → `/awards` (with optional hash `#<slug>`).
  - Click "ABOUT KUDOS" / "Sun* Kudos" / Sunkudos "Chi tiết" → `/kudos`.
  - Click profile → "Sign out" → `/login`.
  - Click language selector — no navigation; only re-renders.

### Visual Requirements

- **Responsive breakpoints**: Mobile <768px, Tablet 768–1023px, Desktop ≥1024px (see `design-style.md` §Responsive Specifications).
- **Animations**:
  - Hover transitions ≤250ms (cards, buttons).
  - Countdown does NOT animate digits by default (MVP); optional "flip" animation gated behind `prefers-reduced-motion`.
  - Gold-glow shadows static (no pulsing — would look noisy).
- **Accessibility**:
  - WCAG AA contrast — verify `#FFFFFF` body text at all opacity levels.
  - All interactive elements have ≥44×44 px hit area (header icons at 40×40 are below — enlarge clickable wrapper to 48×48).
  - **Heading hierarchy** (because "ROOT FURTHER" is rendered as images, use a visually-hidden semantic heading):
    - `<h1>` with `sr-only` class containing text "ROOT FURTHER — Sun* Annual Awards 2025" (or the i18n equivalent); the `<img>` for the large ROOT + FURTHER wordmark receives `alt=""` (decorative — the h1 carries semantics).
    - Small hero logo image: `alt="ROOT FURTHER"` (since there is no accompanying text).
    - `<h2>` for each major section: "Hệ thống giải thưởng" (Awards), "Sun* Kudos" (promo card).
    - `<h3>` per award card title ("Top Talent", etc.).
  - Countdown tiles: each tile is an ARIA live region `aria-live="polite"` with `aria-atomic="true"` announcing e.g. "14 days remaining".
  - "Coming soon" label is decorative — not in reading order.
  - Keyboard: focus visible on all interactive elements; visible outline `2px solid #FFEA9E; outline-offset: 2px`.
  - Reduced motion: honor `prefers-reduced-motion: reduce` for all transitions (see `design-style.md`).
  - Skip-link: "Skip to main content" (VN: "Bỏ qua, đến nội dung chính" — i18n key `common.skip_to_main`) — visually hidden but focusable on Tab. Target is `<main id="main-content">` wrapping the hero content block + all sections below the header.
  - **Award card tab-stop model**: each card is a **single focusable `<a href="/awards#<slug>">`** wrapping the picture, title, description, and "Chi tiết" text. One tab stop per card, not four. The "Chi tiết" span is decorative (styled to look like a link but inherits the parent `<a>` click). This avoids four redundant tab stops per card and matches the Figma "all three clickable regions go to the same target" behavior.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST render the homepage at `/` only for authenticated users; unauthenticated users MUST be redirected to `/login?returnTo=%2F`.
- **FR-002**: System MUST display a countdown with DAYS / HOURS / MINUTES tiles based on `NEXT_PUBLIC_EVENT_DATE` (ISO 8601) compared to current wall time.
- **FR-003**: System MUST zero-pad countdown digits to 2 characters (e.g. `07`, not `7`).
- **FR-004**: System MUST update the countdown at least once per minute on the client; MUST re-sync against wall clock when the tab becomes visible after being backgrounded.
- **FR-005**: System MUST hide the "Coming soon" label and freeze tiles at `00` once `NEXT_PUBLIC_EVENT_DATE` is passed.
- **FR-006**: System MUST expose two CTAs in the hero: "ABOUT AWARDS" → `/awards`, "ABOUT KUDOS" → `/kudos`.
- **FR-007**: System MUST render 6 award cards in the order: Top Talent, Top Project, Top Project Leader, Best Manager, Signature 2025 – Creator, MVP.
- **FR-008**: Each award card MUST link to `/awards#<slug>`, scrolling the destination page to the anchored detail section.
- **FR-009**: System MUST render a Sun* Kudos promo card with a "Chi tiết" CTA linking to `/kudos`.
- **FR-010**: System MUST render the global header (logo + 3 nav links + notification + language + profile) as a fixed element, with "About SAA 2025" shown in the selected state.
- **FR-011**: System MUST render a footer with logo + **4** nav links (About SAA 2025, Awards Information, Sun* Kudos, Tiêu chuẩn chung) + copyright. Route mapping:
  - "About SAA 2025" → `/` (**the Homepage IS the About SAA 2025 page** — clicking this link on the Homepage scrolls to top; Header's A1.2 shows selected state).
  - "Awards Information" → `/awards`.
  - "Sun* Kudos" → `/kudos`.
  - "Tiêu chuẩn chung" → MVP visual placeholder, no navigation (`<a href="#" aria-disabled="true" onClick={e => e.preventDefault()}>`). Swap to `<Link href="/standards">` when Standards screen ships.
- **FR-012**: System MUST render the floating Widget button for visual fidelity. In MVP the click handler is a silent no-op (`aria-disabled="true"` to communicate state to assistive tech while preserving tab order); no menu opens. When quick-action content is defined in a future release, the stub becomes a real menu trigger without changing surrounding layout.
- **FR-013**: All user-visible text on the page MUST be rendered via `next-intl` `useTranslations` / `getTranslations`. No hard-coded VN/EN strings in JSX.
- **FR-014**: Switching language via the header selector MUST persist the choice in the `NEXT_LOCALE` cookie (1-year max-age) and trigger a re-render without a full page reload.
- **FR-015**: Time values displayed in user-facing copy (e.g. "18h30") MUST be formatted using `Intl.DateTimeFormat` in the current locale; date strings MUST similarly use locale-aware formatters.
- **FR-016**: Click on the profile avatar MUST open a menu with "Profile" (→ `/profile`), "Sign out" (clears Supabase session → `/login`), and "Admin Dashboard" (→ `/admin`) only if `user.role === 'admin'`.
- **FR-017**: The header MUST indicate unread notifications via a red dot on the bell icon when `unread_count > 0`. In MVP the notifications service always returns `0`, so the dot is never shown. Click on the bell in MVP is a silent no-op with `aria-disabled="true"` (no panel to open yet — will become a panel trigger when the notifications feature is built).
- **FR-018**: System MUST NOT render a UI state that includes a missing i18n key; missing keys in production MUST fall back to the default-locale value (VN).
- **FR-019**: "ROOT FURTHER" MUST be rendered using pre-exported image assets (see §Overview §Brand-text rendering decision). It MUST NOT be recreated as live text. Assets required: `root-further-hero-logo.png` (small combined), `root-text.png` + `further-text.png` (large split pair).
- **FR-020**: The description below the ROOT FURTHER display block MUST render as 3 separate paragraphs (`<p>` elements), matching the Figma structure, using keys `hero.description_p1/p2/p3`.
- **FR-021**: The Widget floating button internal content MUST render: **pencil-icon** + **text "/"** (Montserrat 24/700, color `#00101A`) + **SAA/Kudos logo icon**. The "/" is live text, not part of an icon asset.
- **FR-022**: Countdown sub-tile structure — each of DAYS/HOURS/MINUTES MUST render as TWO adjacent single-digit glass tiles (per Figma node tree `Group 5` + `Group 4`), not one dual-digit block. Each sub-tile is `51.2 × 81.92` px, gap between the pair per the design-style.md. This preserves the decorative tile-border-per-digit aesthetic.

### Technical Requirements

- **TR-001 (Performance)**: Largest Contentful Paint (LCP) ≤ 2.5s on a 4G connection — hero image MUST be `priority` in Next.js `<Image>` and use `.webp` + responsive `srcset`.
- **TR-002 (Accessibility)**: Zero axe-core WCAG 2.1 AA violations on initial render (automated in Playwright tests).
- **TR-003 (i18n completeness)**: 100% of strings defined in `vi.json` MUST have matching keys in `en.json`. A CI check MUST fail if keys differ.
- **TR-004 (SEO)**: `<title>` and `<meta name="description">` MUST be locale-aware via Next.js `generateMetadata` and read from i18n messages.
- **TR-005 (Security)**: Award/Sun* Kudos content fetched from APIs MUST be sanitized — never dangerously-set HTML from backend responses directly.
- **TR-006 (Testing)**: Unit tests for `<Countdown />` computation at boundary cases (target in past, target exactly now, target 1 second in future).
- **TR-007 (Locale-aware metadata)**: Next.js App Router `generateMetadata` MUST call `next-intl`'s `getTranslations({ locale })` to produce `<title>`, `<meta name="description">`, `<meta property="og:title">`, and `<meta property="og:description">` in the active locale. Keys defined under `homepage.metadata.*`. The `<html lang="...">` attribute MUST also reflect the active locale (`vi` or `en`).

### Key Entities *(if feature involves data)*

- **AwardCategory** — `{ slug: string; title: { vi: string; en: string }; description: { vi: string; en: string }; image_url: string; order: number }`
- **EventConfig** — `{ event_datetime: ISO8601; location: { vi: string; en: string }; broadcast_channel: string }`
- **User** — `{ id: UUID; email: string; display_name: string; avatar_url: string | null; role: 'user' | 'admin' }` (from Supabase Auth)
- **NotificationSummary** — `{ unread_count: number; last_updated: ISO8601 }`

### State Management

**Local component state** (within Homepage and its sub-components):

| Component | State | Type | Purpose |
|-----------|-------|------|---------|
| `<Countdown />` | `remaining` | `{ days, hours, minutes }` | Current countdown values; updated by setInterval + visibilitychange sync |
| `<Countdown />` | `isPast` | `boolean` | Whether target datetime has passed (freezes tiles at 00, hides "Coming soon") |
| `<LanguageSelector />` | `isOpen` | `boolean` | Dropdown open/closed (reused from Login) |
| `<ProfileMenu />` | `isOpen` | `boolean` | Dropdown open/closed |
| `<NotificationPanel />` | `isOpen` | `boolean` | Panel open/closed (out of scope for MVP; stub closed) |
| ~~`<WidgetMenu />`~~ | — | — | *Removed — MVP has no menu; Widget button is a silent-no-op button* |

**Global / cross-screen state** (MVP):

| Source | Value | Persistence | Consumer |
|--------|-------|-------------|----------|
| `NEXT_LOCALE` cookie | `'vi' \| 'en'` | 1-year max-age; written by LanguageSelector | `next-intl` on every render |
| Supabase session | `User` object | Supabase SDK (httpOnly cookies); refreshed by middleware | RSC `<Page />`, `<ProfileMenu />` |
| i18n messages | `vi.json` / `en.json` | static imports via `next-intl` | all text + award category data |
| `NEXT_PUBLIC_EVENT_DATE` | ISO 8601 string | env var (baked at build) | `<Countdown />` |

> **No SWR / fetch layer needed in MVP** — all data is either static or comes from the Supabase session. SWR will be introduced when the first real API endpoint is wired (notifications is the most likely candidate).

**Loading states**:

| Data | Loading UI | Error UI | Empty UI |
|------|-----------|----------|----------|
| Supabase session (server) | Middleware blocks render until resolved | Middleware redirects to `/login` on failure | N/A — presence is enforced by middleware |
| Countdown target | Render tiles at `--` for <1 frame then swap to computed values | Hide countdown block; log warning in dev | N/A |
| Award cards (static) | N/A — rendered synchronously from i18n | N/A | N/A (6 categories always present) |
| Notifications (stubbed) | N/A — synchronous constant | N/A | Bell without dot |

**Error states**:
- Invalid session → `middleware.ts` redirects to `/login` (already implemented).
- Invalid `NEXT_PUBLIC_EVENT_DATE` → countdown component renders `--` tiles and logs a console error in dev; production silently hides the countdown block while keeping CTAs visible.
- Missing i18n key → dev mode logs to console; production falls back to VN value (per FR-018).

---

## Data Requirements

### i18n Keys *(exhaustive — required for TR-003 enforcement)*

Namespace root: `homepage`. Additional cross-screen namespaces: `common`, `nav`, `footer`.

#### `nav.*` (shared with other screens)

| Key | VN | EN |
|-----|-----|-----|
| `nav.about_saa` | About SAA 2025 | About SAA 2025 |
| `nav.awards_info` | Awards Information | Awards Information |
| `nav.sunkudos` | Sun* Kudos | Sun* Kudos |
| `nav.standards` | Tiêu chuẩn chung | Common Standards |
| `nav.notifications_aria` | Thông báo | Notifications |
| `nav.profile_aria` | Tài khoản | Account |
| `nav.logo_aria` | Về trang chủ Sun* Annual Awards 2025 | Go to Sun* Annual Awards 2025 home |
| `nav.sr_h1` | ROOT FURTHER — Sun* Annual Awards 2025 | ROOT FURTHER — Sun* Annual Awards 2025 |

> Brand names ("Sun\* Kudos", "Sun* Annual Awards", "ROOT FURTHER") are **not translated** — they're identical in both locales.

#### `homepage.hero.*`

| Key | VN | EN |
|-----|-----|-----|
| `hero.title` | ROOT FURTHER | ROOT FURTHER |
| `hero.coming_soon` | Coming soon | Coming soon |
| `hero.countdown.days` | DAYS | DAYS |
| `hero.countdown.hours` | HOURS | HOURS |
| `hero.countdown.minutes` | MINUTES | MINUTES |
| `hero.event_time_label` | Thời gian: | Time: |
| `hero.event_location_label` | Địa điểm: | Location: |
| `hero.event_location_value` | Nhà hát nghệ thuật quân đội | Army Arts Theatre |
| `hero.event_broadcast_note` | Tường thuật trực tiếp tại Group Facebook Sun* Family | Live broadcast on Sun\* Family Facebook Group |
| `hero.cta_about_awards` | ABOUT AWARDS | ABOUT AWARDS |
| `hero.cta_about_kudos` | ABOUT KUDOS | ABOUT KUDOS |
| `hero.description_p1` | *(DRAFT — awaiting final content team copy)* "Dòng chảy thời gian của Sun\* Annual Awards một lần nữa khởi động, nối tiếp hành trình ghi nhận và vinh danh đã làm nên văn hoá Sun\*." | *(DRAFT)* "The rhythm of Sun\* Annual Awards begins again, continuing the journey of recognition and celebration that defines Sun\* culture." |
| `hero.description_p2` | *(DRAFT)* "Năm 2025, chúng ta cùng ROOT FURTHER — đi sâu hơn vào gốc rễ giá trị, vươn xa hơn với những con người dám tiến bước." | *(DRAFT)* "In 2025 we ROOT FURTHER — deeper into the values at our core, further with the people who dare to move forward." |
| `hero.description_p3` | *(DRAFT)* "Hành trình của bạn — lời ghi nhận của đồng nghiệp — câu chuyện của Sun\*. Hãy cùng đếm ngược đến đêm hội." | *(DRAFT)* "Your journey — your peers' recognition — Sun\*'s story. Let's count down to the celebration night." |
| `hero.root_further_alt` | Logo ROOT FURTHER — chủ đề Sun* Annual Awards 2025 | ROOT FURTHER logo — Sun\* Annual Awards 2025 theme |
| `hero.countdown.aria_label` | Đếm ngược sự kiện: còn {days} ngày, {hours} giờ, {minutes} phút | Event countdown: {days} days, {hours} hours, {minutes} minutes remaining |

#### `homepage.awards.*`

| Key | VN | EN |
|-----|-----|-----|
| `awards.caption` | Sun* annual awards 2025 | Sun\* Annual Awards 2025 |
| `awards.title` | Hệ thống giải thưởng | Awards system |
| `awards.description` | Các hạng mục sẽ được trao giải theo TOP những người xuất sắc nhất. | The categories are awarded based on the TOP outstanding individuals. |
| `awards.details_cta` | Chi tiết | View details |
| `awards.categories.top_talent.title` | Top Talent | Top Talent |
| `awards.categories.top_talent.description` | Vinh danh top cá nhân xuất sắc trên mọi phương diện | Honours the top individuals excelling on every dimension |
| `awards.categories.top_project.title` | Top Project | Top Project |
| `awards.categories.top_project.description` | Vinh danh top dự án xuất sắc, tạo giá trị nổi bật cho khách hàng và Sun\* | Honours the top projects delivering outstanding value to customers and Sun\* |
| `awards.categories.top_project_leader.title` | Top Project Leader | Top Project Leader |
| `awards.categories.top_project_leader.description` | Vinh danh những người lãnh đạo dự án dẫn dắt đội ngũ vượt qua thử thách | Honours project leaders who guide their teams through tough challenges |
| `awards.categories.best_manager.title` | Best Manager | Best Manager |
| `awards.categories.best_manager.description` | Vinh danh các quản lý xuất sắc trong phát triển con người và tổ chức | Honours exceptional managers who grow people and the organisation |
| `awards.categories.signature_2025_creator.title` | Signature 2025 - Creator | Signature 2025 - Creator |
| `awards.categories.signature_2025_creator.description` | Vinh danh cá nhân tạo ra dấu ấn sáng tạo đặc trưng trong năm 2025 | Honours the creators whose signature work defined 2025 |
| `awards.categories.mvp.title` | MVP (Most Valuable Person) | MVP (Most Valuable Person) |
| `awards.categories.mvp.description` | Vinh danh cá nhân có đóng góp giá trị nhất cho Sun\* trong năm | Honours the single most valuable contributor to Sun\* this year |

> **MVP decision**: award titles and descriptions are **static in `vi.json`/`en.json`**. No `GET /api/awards/categories` endpoint in MVP. Descriptions above are initial placeholders authored for this spec — content team should review & refine before ship. Titles (proper nouns) are unchanged across locales.

#### `homepage.kudos.*`

| Key | VN | EN |
|-----|-----|-----|
| `kudos.label` | Phong trào ghi nhận | Recognition movement |
| `kudos.title` | Sun* Kudos | Sun\* Kudos |
| `kudos.body` | "ĐIỂM MỚI CỦA SAA 2025 — Hoạt động ghi nhận và cảm ơn đồng nghiệp — lần đầu tiên được diễn ra dành cho tất cả Sunner. Hoạt động sẽ được triển khai vào tháng 11/2025, khuyến khích người Sun\* chia sẻ những lời ghi nhận, cảm ơn đồng nghiệp trên hệ thống do BTC công bố. Đây sẽ là chất liệu để Hội đồng Heads tham khảo trong quá trình lựa chọn người đạt giải." | "NEW FOR SAA 2025 — A peer recognition and appreciation program — running for the first time, open to every Sunner. Starting November 2025, Sun\* people are encouraged to share recognition and thanks for their colleagues on the platform announced by the Organising Committee. These entries will serve as reference material for the Heads Council when selecting award recipients." |
| `kudos.cta` | Chi tiết | Learn more |
| `kudos.wordmark` | KUDOS | KUDOS |

#### `homepage.widget.*`

| Key | VN | EN |
|-----|-----|-----|
| `widget.button_aria` | Mở menu hành động nhanh | Open quick-actions menu |

#### `footer.*`

| Key | VN | EN |
|-----|-----|-----|
| `footer.copyright` | Bản quyền thuộc về Sun* © 2025 | © 2025 Sun\*. All rights reserved. |
| `footer.nav.about_saa` | About SAA 2025 | About SAA 2025 |
| `footer.nav.awards_info` | Awards Information | Awards Information |
| `footer.nav.sunkudos` | Sun* Kudos | Sun\* Kudos |
| `footer.nav.standards` | Tiêu chuẩn chung | Common Standards |

#### `common.*`

| Key | VN | EN |
|-----|-----|-----|
| `common.locale_name` | Tiếng Việt | English |
| `common.locale_short` | VN | EN |
| `common.locale_selector_aria` | Chọn ngôn ngữ | Choose language |
| `common.sign_out` | Đăng xuất | Sign out |
| `common.profile` | Hồ sơ | Profile |
| `common.admin_dashboard` | Bảng điều khiển Admin | Admin dashboard |
| `common.skip_to_main` | Bỏ qua, đến nội dung chính | Skip to main content |

#### `homepage.metadata.*` *(locale-aware `<title>` and `<meta description>` via Next.js `generateMetadata`)*

| Key | VN | EN |
|-----|-----|-----|
| `metadata.title` | Trang chủ — Sun* Annual Awards 2025 | Home — Sun\* Annual Awards 2025 |
| `metadata.description` | Giải thưởng thường niên Sun* 2025 — ROOT FURTHER. Đếm ngược đến đêm trao giải và khám phá hệ thống giải thưởng. | Sun\* Annual Awards 2025 — ROOT FURTHER. Count down to ceremony night and explore the award categories. |
| `metadata.og_title` | Sun* Annual Awards 2025 — ROOT FURTHER | Sun\* Annual Awards 2025 — ROOT FURTHER |
| `metadata.og_description` | Cùng đếm ngược đến SAA 2025. | Count down to SAA 2025 with us. |

### Dynamic Data Fields (MVP sources)

| Field | Type | MVP Source | Display |
|-------|------|------------|---------|
| `event_datetime` | ISO 8601 | `NEXT_PUBLIC_EVENT_DATE` env var | Countdown values |
| `event.time_display` | string | derived via `Intl.DateTimeFormat` from `NEXT_PUBLIC_EVENT_DATE` | "18h30" (VN) / "6:30 PM" (EN) |
| `event.location` | string | i18n key `homepage.hero.event_location_value` | Event info block |
| `user.display_name` | string | Supabase session | Profile dropdown |
| `user.avatar_url` | string\|null | Supabase session | Profile icon image |
| `user.role` | `'user'\|'admin'` | Supabase `app_metadata.role` | Conditionally show "Admin Dashboard" option |
| `notifications.unread_count` | integer | **stubbed = 0 in MVP** (service returns constant) | Bell renders without dot |
| `awards.categories[]` | `AwardCategory[]` | static `homepage.awards.categories.*` i18n keys | Award grid |

---

## API Dependencies

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/api/event/config` | GET | Return event datetime, location, broadcast info (localizable) | **NOT USED in MVP** — resolved via `NEXT_PUBLIC_EVENT_DATE` env var and i18n keys |
| `/api/awards/categories` | GET | Return list of 6 categories with localized title/description and image URLs | **NOT USED in MVP** — resolved via static i18n keys `homepage.awards.categories.*` |
| `/api/notifications/summary` | GET | Return `{ unread_count }` for current user | **STUBBED in MVP** — client service always returns `{ unread_count: 0 }`; wrapped so real endpoint drops in later |
| Supabase Auth | — | `supabase.auth.getUser()` server-side and `supabase.auth.signOut()` for logout | Exists (from Login) |

> For MVP, the Homepage is a **static authenticated page** — no backend API calls beyond Supabase Auth. This keeps the initial ship fast and eliminates backend as a gate. All three predicted endpoints remain listed so the service-layer wrapper pattern is established early; when a real backend is ready, only the service implementation changes, not component code.

### Predicted response shapes *(reference only — not implemented in MVP)*

The shapes below document the *target contracts* for a future backend integration. MVP does not call these endpoints (see §API Dependencies above for the MVP source of each field). Keeping them here so the service-layer wrappers can be typed against these contracts today and swap implementations later without touching call sites.

**`GET /api/event/config`**
```json
{
  "event_datetime": "2026-06-15T18:30:00+07:00",
  "location": { "vi": "Nhà hát nghệ thuật quân đội", "en": "Army Arts Theatre" },
  "broadcast_channel": { "vi": "Group Facebook Sun* Family", "en": "Sun* Family Facebook Group" }
}
```

**`GET /api/awards/categories`**
```json
[
  {
    "slug": "top-talent",
    "order": 1,
    "title": { "vi": "Top Talent", "en": "Top Talent" },
    "description": { "vi": "Vinh danh…", "en": "Honours…" },
    "image_url": "/assets/homepage/awards/top-talent.png"
  },
  { "...": "5 more entries" }
]
```

**`GET /api/notifications/summary`**
```json
{ "unread_count": 3, "last_updated": "2026-04-21T10:00:00Z" }
```

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Authenticated users successfully reach `/` in ≤500ms after OAuth callback (measured p95).
- **SC-002**: Countdown accurately reflects remaining time to event within **60 seconds** of wall clock (matching the per-minute update cadence; audited by automated test that advances system time and asserts tile values).
- **SC-003**: 100% of visible strings respect the active locale — verified by a Playwright test that loads the page in VN then EN and asserts no Vietnamese characters remain in DOM text when EN is active (regex: `[ĂÂĐÊÔƠƯăâđêôơư]`).
- **SC-004**: Axe-core reports 0 WCAG 2.1 AA violations on initial render.
- **SC-005**: Lighthouse LCP ≤2.5s on throttled 4G; CLS ≤0.1.
- **SC-006**: ≥ 90% of logged-in users click through at least one of: CTAs, award cards, Sun* Kudos card within their first session (analytics KPI — instrumentation out of scope for MVP).

---

## Out of Scope

- **Quick-action widget menu content**: for MVP, the Widget button is rendered for visual fidelity but click is a silent no-op (`aria-disabled="true"`). Action set to be defined in a later release.
- **Dynamic event config API** (`GET /api/event/config`) — resolved via `NEXT_PUBLIC_EVENT_DATE` env var for MVP.
- **Dynamic awards API** (`GET /api/awards/categories`) — award categories are static in i18n JSON for MVP.
- **Real notifications endpoint** — MVP stubs `{ unread_count: 0 }`; bell always renders without dot.
- **Awards detail page (`/awards`)**: separate screen — only the link target is mentioned here.
- **Sun* Kudos detail page (`/kudos`)**: separate screen.
- **Profile / Admin Dashboard pages**: separate screens — linked from the profile dropdown but not implemented here.
- **Analytics / event tracking**: instrumentation is a post-MVP concern.
- **Server-side rendering of dynamic data**: MVP may hydrate these on the client; SSR is an optimization, not a requirement.
- **Push/real-time notifications**: the unread badge is read from a poll-based endpoint; websockets are out of scope.
- **Dark/light theme toggle**: the design is fully dark-themed; no light mode is specified.

---

## Dependencies

- [x] Constitution document exists (`.momorph/constitution.md`)
- [x] Login screen shipped — provides `<Header>`, `<Footer>`, `<Icon>`, `<LanguageSelector>`, middleware, and Supabase clients reusable here. Note: `<Header>` needs generalization to accept `selectedNav`; `<Footer>` needs extension to 4 nav links.
- [ ] Awards detail page spec (`/awards`) — target of hero CTA and award cards.
- [ ] Sun* Kudos detail page spec (`/kudos`) — target of hero CTA and kudos promo.
- [ ] Profile / Admin pages (or placeholders) — target of profile dropdown items.
- [ ] "Tiêu chuẩn chung" (Common Standards) page spec (`/standards` — route TBD) — target of footer 4th link (Figma item 7.5).
- [ ] "Dropdown-profile" frame spec (Figma `721:5223`) — linked from A1.8 click; defines profile menu internals.
- [ ] Backend APIs — `event/config`, `awards/categories`, `notifications/summary` (MVP can stub).
- [ ] Assets — ROOT FURTHER image exports (small hero logo, large ROOT + FURTHER split), 6 award thumbnails, Kudos background, wave keyvisual, Kudos wordmark (SVG or PNG).
- [ ] Fonts — "Digital Numbers" (`.woff2`) for countdown digits. **SVN-Gotham "KUDOS" wordmark SHOULD be exported as an SVG/PNG image instead of a web font** — SVN-Gotham is a commercial/Vietnamese-community font with licensing concerns for web hosting; the wordmark is purely decorative, appearing in exactly one place (Sunkudos card).

---

## Open Questions

Resolved during review (2026-04-21) unless marked **OPEN**.

1. **"Tiêu chuẩn chung" target screen** — **RESOLVED**: internal page, to be specified later. For MVP, render the footer link as plain HTML text (no `href` / no `<a>` wrapping, OR `<a href="#">` with `aria-disabled="true"` and `onClick={e => e.preventDefault()}`) so it matches the visual design without pointing at a non-existent route. Styling matches the other footer nav buttons (normal state). Switch to `<Link href="/standards">` once the Standards screen is designed.
2. **Admin Dashboard role source** — **RESOLVED**: read `user.app_metadata.role === 'admin'` via Supabase session. Confirmed with product owner.
3. **Event datetime source** — **RESOLVED**: use `NEXT_PUBLIC_EVENT_DATE` environment variable (ISO 8601). No `GET /api/event/config` endpoint — event config is baked at build time. See FR-002.
4. **Award categories source** — **RESOLVED**: static in `vi.json`/`en.json` under `homepage.awards.categories.*`. No `GET /api/awards/categories` endpoint for MVP.
5. **Notifications endpoint** — **RESOLVED**: MVP stub returning `{ unread_count: 0 }`. Bell renders without dot. Endpoint pattern retained so a real backend drops in later without UI changes.
6. **Sun\* Kudos body (EN)** — **RESOLVED**: English translation authored below and committed to `en.json`:
   > "NEW FOR SAA 2025 — A peer recognition and appreciation program — running for the first time, open to every Sunner. Starting November 2025, Sun\* people are encouraged to share recognition and thanks for their colleagues on the platform announced by the Organising Committee. These entries will serve as reference material for the Heads Council when selecting award recipients."
7. **Widget quick-action menu** — **RESOLVED**: no actions in MVP. The Widget button is still rendered for visual fidelity but clicking it does nothing (disabled state OR silent no-op — prefer silent no-op with `aria-disabled="true"` to preserve tab order). May be removed entirely from MVP scope if preferred — see FR-012 ambiguity; recommend **stub, not remove**, to preserve visual design.
8. **Tab-title & SEO metadata i18n** — **RESOLVED**: wire Next.js App Router `generateMetadata` with `next-intl` `getTranslations` so `<title>` and `<meta description>` are locale-aware. See TR-007 (added below).
9. **"ROOT FURTHER" hero image text** — **RESOLVED**: rendered as pre-exported image assets. No attempt to recreate as live text.

---

## Notes

- **I18n is a first-class concern**, per the user's explicit emphasis. Do NOT ship the homepage if any string is hardcoded or any key is missing in one of the locale files. A single missing EN translation visible as Vietnamese in the EN UI is a ship-blocker.
- The existing Login screen already wires `next-intl` with `NEXT_LOCALE` cookie + `localePrefix: "never"` (no URL segment). Reuse that setup — the homepage inherits it automatically.
- The header/footer nav will be re-used on `/awards` and `/kudos`. Before starting homepage work, ensure the `<Header>` component from Login is generalized to accept a `selectedNav` prop (currently it only renders the logo + language).
- The Widget button behavior is intentionally minimal in MVP — it renders for visual fidelity but clicking is a silent no-op (`aria-disabled="true"`). When quick-actions are defined, the existing markup becomes a `<button aria-haspopup="menu">` trigger; no surrounding layout changes.
- Countdown correctness under daylight-saving-time transitions: the project operates in `Asia/Ho_Chi_Minh` (UTC+7, no DST), so this is a non-issue. But if EN users in DST zones view the page, `Intl.DateTimeFormat` will still render the event time correctly because `event_datetime` carries the offset.
- Consider extracting the countdown as a standalone `<Countdown target={...}>` component now — future pages (e.g. award nomination countdowns) will reuse it.
