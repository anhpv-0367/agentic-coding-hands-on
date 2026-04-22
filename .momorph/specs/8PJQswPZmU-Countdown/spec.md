# Feature Specification: Countdown – Prelaunch Page

**Frame ID**: `2268:35127`
**Frame Name**: `Countdown - Prelaunch page`
**Screen ID**: `8PJQswPZmU`
**File Key**: `9ypp4enmFmdK3YAFJLIu6C`
**Figma Link**: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/8PJQswPZmU
**Canvas Size**: `1512 × 1077 px`
**Created**: 2026-04-21
**Status**: Draft

---

## Overview

The countdown is used in **two places** in the app and MUST share the same underlying logic:

1. **Inline on the Homepage** (already shipped) — an embedded section inside the hero with a small "Coming soon" label and compact tiles (51 × 82 px, 49.152 px digits, 24 px labels).
2. **Standalone `/prelaunch` page** (this spec) — a full-bleed public page with a large centered title and large tiles (77 × 123 px, 73.728 px digits, 36 px labels), which replaces the normal authenticated app during the pre-launch window.

**Both places MUST drive off the same pure computation (`computeRemaining(target, now)`)** and the same React components (`<Countdown />`, `<CountdownUnit />`, `<CountdownDigitTile />`) — the only difference between the two presentations is a `size` prop variant (`"default"` for Homepage, `"large"` for Prelaunch). This guarantees the two views cannot drift out of sync: if the logic is wrong in one place, it's wrong in both, and a single fix addresses both.

### What this spec covers

This document specifies the **standalone `/prelaunch` page** — its layout, visual specs, i18n, and the middleware integration that short-circuits the app to this page during the pre-launch window. The countdown logic itself is already implemented on the Homepage; this spec documents the additional `size` variant and the page-level wrapper needed.

### Key visual differences (Prelaunch vs Homepage countdown)

- **Tile size ~1.5×** larger (77 × 123 vs 51 × 82)
- **Digit font ~1.5×** larger (73.728 px vs 49.152 px)
- **Unit label ~1.5×** larger (36 / 700 vs 24 / 700)
- **No "Coming soon" sub-label** — replaced with a full-width title: "Sự kiện sẽ bắt đầu sau" ("The event will begin in")
- **No CTAs, no event info, no header, no footer** — pure countdown display
- **Backdrop blur ~1.5×** (24.96 px vs 16.64 px) and **tile radius ~1.5×** (12 px vs 8 px)

### Activation

Reached either:
- Via feature flag (`NEXT_PUBLIC_PRELAUNCH_MODE=true`) that redirects every non-public route to this page, OR
- As a dedicated route `/prelaunch` reachable regardless of flag state (useful for sharing a preview URL or internal QA).

Admin controls prelaunch mode by **changing the env var and redeploying** (MVP). Once the flag is flipped off on launch day, the Homepage (authenticated) becomes the default landing page again.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Anticipation Building (Priority: P1) 🎯 MVP

A visitor — whether internal (Sunner) or external — lands on the app before the event has launched, and sees a clean, branded countdown that communicates "the event is coming in {days} days, {hours} hours, {minutes} minutes".

**Why this priority**: This page's entire reason for existing is to build anticipation and avoid exposing the unfinished internal app to early visitors. Without it, visitors either see a 404 or an in-progress app.

**Independent Test**: Visit the configured prelaunch URL / enable the feature flag and hit `/`. Within 3 seconds, verify: (a) dark page with decorative root-ish keyvisual on the right half, (b) centered title "Sự kiện sẽ bắt đầu sau", (c) three pairs of glass digit tiles showing remaining DAYS / HOURS / MINUTES, (d) after 60 seconds the MINUTES value has decremented by 1.

**Acceptance Scenarios**:

1. **Given** the feature flag is ON and the event datetime is in the future, **When** any visitor (logged-in or not) navigates to any public route, **Then** they are served the Countdown page showing the remaining time in DAYS / HOURS / MINUTES.
2. **Given** the countdown is running, **When** 60 seconds pass, **Then** the MINUTES digits update; when that crosses `00`, HOURS decrements; when HOURS crosses `00`, DAYS decrements.
3. **Given** `NEXT_PUBLIC_EVENT_DATE` is invalid or missing, **When** the page loads, **Then** all tiles render `--` and a development-only warning is logged; production falls back to showing `00 00 00`.
4. **Given** the event datetime has passed, **When** the page renders, **Then** all tiles show `00`, and the feature flag should be removed by the admin (the page does not auto-redirect — redirect logic belongs to the admin's responsibility).
5. **Given** `prefers-reduced-motion: reduce` is set, **When** the digits update, **Then** no flip/scale animation plays — the number simply replaces.

---

### User Story 2 - Language Awareness (Priority: P2)

The title "Sự kiện sẽ bắt đầu sau" is localizable between Vietnamese and English — the cookie-based locale from the main app is respected.

**Why this priority**: The main app is bilingual; the prelaunch page should be consistent.

**Independent Test**: Visit the prelaunch page with `NEXT_LOCALE=vi` — title reads "Sự kiện sẽ bắt đầu sau". Switch cookie to `en` — title reads "The event will begin in".

**Acceptance Scenarios**:

1. **Given** cookie `NEXT_LOCALE=vi`, **When** the page loads, **Then** the title reads "Sự kiện sẽ bắt đầu sau" and unit labels read `DAYS` / `HOURS` / `MINUTES` (unit label i18n keys render identically in VN and EN by design).
2. **Given** cookie `NEXT_LOCALE=en`, **When** the page loads, **Then** the title reads "The event will begin in".
3. **Given** no locale cookie is set, **When** the page loads, **Then** the title uses the default locale (`vi`).

---

### Edge Cases

- **Event datetime misconfigured** (invalid ISO 8601 or missing): countdown renders `--` tiles in dev mode + console warning; in production tiles show `00` (same as post-event state).
- **Event datetime already passed**: all tiles show `00`; the title **`prelaunch.title`** continues to render as-is (we do NOT change or hide the title — that's the admin's cue to disable the feature flag). **Open Q3 captures whether post-event should auto-redirect.**
- **Tab backgrounded** for 5+ min: countdown pauses interval and re-syncs from wall clock on `visibilitychange` back to visible.
- **Extremely large day count (> 99)**: tiles show `99` (capped at 2 digits per FR-003). Acceptable because prelaunch mode is only used within days/weeks of the event.
- **Authenticated user accesses prelaunch route**: same treatment — everyone sees the countdown, regardless of session. Session cookies are ignored on this page.
- **Direct URL `/prelaunch` while flag is OFF**: page still renders normally — it's a valid public route with its own content, regardless of flag state. The flag only affects whether OTHER routes redirect here, not whether this route is reachable.
- **User-agent with `prefers-reduced-motion: reduce`**: digit character changes happen instantly (no flip/animate by default anyway, so no extra work required).
- **Skip-link / keyboard nav**: no interactive elements exist; skip-link is not needed; the page is purely informational.
- **RTL**: out of scope (project only supports VN + EN, both LTR).

---

## UI/UX Requirements *(from Figma)*

Visual specs live in **`design-style.md`** — this section references that document for pixel-level details.

### Screen Components

| Component | Ref | Description | Interactions |
|-----------|-----|-------------|--------------|
| Background image | `2268:35129` | `MM_MEDIA_BG Image` — decorative "roots / waves" image, same asset family as Homepage keyvisual, scaled to cover the full 1512 × 1077 frame | Static |
| Gradient overlay | `2268:35130` | `Cover` — `linear-gradient(18deg, #00101A 15.48%, rgba(0,18,29,0.46) 52.13%, rgba(0,19,32,0) 63.41%)` | Static |
| Content wrapper | `2268:35131` (Bìa) | Centered column, padding `96px 144px`, gap `120px`, `alignItems: center`, `justifyContent: center` | Static |
| Countdown section (`Countdown time`) | `2268:35136` | Column: title + Time frame, gap `24px`, `alignItems: center` | Static |
| Title text | `2268:35137` | "Sự kiện sẽ bắt đầu sau" / "The event will begin in" — Montserrat 36 / 700 / 48, `#FFFFFF`, centered | Static |
| Time frame | `2268:35138` | Row of three units, gap `60px`, `alignItems: center` | Static |
| Days unit | `2268:35139` (`1_Days`) | Column: two digit tiles (row, gap 21px) + `DAYS` label, gap `21px`, `alignItems: flex-start` | Auto-updates every minute |
| Hours unit | `2268:35144` (`2_Hours`) | Same structure as Days, label `HOURS` | Auto-updates every minute |
| Minutes unit | `2268:35149` (`3_Minutes`) | Same structure, label `MINUTES` | Auto-updates every minute |
| Digit tile | (`Group 5` / `Group 4` per unit) | `77 × 123` glass tile with gold border, rounded corners `12px`, backdrop blur `24.96px`, gradient fill `linear-gradient(180deg, #FFF 0%, rgba(255,255,255,0.10) 100%)`, opacity `0.5` | Shows one digit character (0-9) |
| Digit glyph | (`2` TEXT inside each Group) | Digital Numbers font, `73.728px / 400`, `#FFFFFF` | Value changes over time |
| Unit label | `DAYS` / `HOURS` / `MINUTES` TEXT | Montserrat `36 / 700 / 48`, `#FFFFFF`, left-aligned within unit | Static |

### Navigation Flow

- **Entry**: Any public route OR dedicated `/prelaunch` URL when the feature flag is active.
- **Exit**: No user-initiated exit. Admin disables the flag; visitors then re-navigate and see the real app.

### Visual Requirements

- **Responsive breakpoints**: Mobile <768px, Tablet 768–1023px, Desktop ≥1024px. See `design-style.md` §Responsive Specifications.
- **Animations**:
  - Digits do not flip/animate in MVP (no transitions on character change).
  - Reduced-motion honored via the existing global `@media (prefers-reduced-motion)` reset.
- **Accessibility**:
  - WCAG AA contrast on #FFFFFF text over the dark+gradient backdrop.
  - Whole countdown wrapped in a single `aria-live="polite"` region on the outer content frame, `aria-atomic="true"`, announcing the current remaining time. **Reuses the existing Homepage aria key** `homepage.hero.countdown.aria_label` (VN: "Đếm ngược sự kiện: còn {days} ngày, {hours} giờ, {minutes} phút") — the announcement is semantically the same on both surfaces, so a separate Prelaunch aria key is not introduced.
  - Unit labels (`DAYS`/`HOURS`/`MINUTES`) are plain text and participate in the live announcement.
  - No interactive elements → no tab stops required.
  - `<html lang>` reflects active locale.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST render the Countdown page at a dedicated route (recommended: `/prelaunch`) AND MAY also short-circuit other routes via a feature flag (`NEXT_PUBLIC_PRELAUNCH_MODE=true`) that causes `middleware.ts` to redirect every public request to the prelaunch page.
- **FR-002**: Countdown MUST read its target datetime from `NEXT_PUBLIC_EVENT_DATE` (ISO 8601) — same env var used by the Homepage.
- **FR-003**: Each of DAYS / HOURS / MINUTES MUST render as TWO adjacent single-digit glass tiles, zero-padded (`07`, not `7`). Days tile caps at `99` (2-digit).
- **FR-004**: Countdown MUST update once per minute on the client; MUST re-sync from wall clock on `visibilitychange` to visible.
- **FR-005**: When target datetime is in the past or invalid, tiles render `00` (or `--` in dev mode for invalid).
- **FR-006**: Title text MUST be rendered via `next-intl` — key `prelaunch.title` (VN: "Sự kiện sẽ bắt đầu sau", EN: "The event will begin in").
- **FR-007**: Page MUST NOT render the Header or Footer layout components (this is a pure landing variant).
- **FR-008**: Page MUST NOT attempt any authentication or session check. It is public.
- **FR-009** (shared-component contract): the countdown on Homepage and the countdown on Prelaunch MUST be rendered by the **same** `<Countdown />` / `<CountdownUnit />` / `<CountdownDigitTile />` React components, with a **single** underlying `computeRemaining(target, now)` pure function. Add an optional `size?: "default" | "large"` prop (default `"default"` = Homepage sizing, `"large"` = Prelaunch sizing). This means:
  - One bug fix in `computeRemaining` or the visibilitychange/interval logic automatically benefits both surfaces.
  - Unit tests that already cover Homepage boundary cases (past / exactly-now / 1s / 30d) also cover Prelaunch — no duplicate tests needed for the logic.
  - Visual regression is limited to size-specific token values (tile dimensions, font size, label size, blur radius, border width, radius) — enumerated in `design-style.md` §Implementation Mapping.
- **FR-010**: Layout MUST center the countdown vertically and horizontally within the viewport; on very small viewports (<480px), the tile row MAY wrap or the three units MAY stack vertically to fit.
- **FR-011**: All user-visible text goes through `next-intl`; no hard-coded VN/EN strings.

### Technical Requirements

- **TR-001 (Performance)**: LCP ≤ 2s. The backdrop image is the LCP element — load with `<Image priority>`.
- **TR-002 (Accessibility)**: Zero axe-core WCAG 2.1 AA violations.
- **TR-003 (i18n)**: `prelaunch.title` key exists in both `vi.json` and `en.json`; the i18n parity test covers it.
- **TR-004 (SEO)**: `<title>` and `<meta description>` are locale-aware via `generateMetadata`. Use keys `prelaunch.metadata.*`.
- **TR-005 (Public page + prelaunch mode)**: The page MUST NOT require authentication. `middleware.ts` MUST:
  1. Add `/prelaunch` to the `PUBLIC_PATHS` array alongside `/login` and `/auth/callback` (always-public regardless of flag).
  2. When `process.env.NEXT_PUBLIC_PRELAUNCH_MODE === "true"`, redirect EVERY request to `/prelaunch` *except* requests to `/prelaunch` itself, Next.js internals (`_next/*`), public assets (`/assets/*`), and `favicon.ico`. **This includes `/login` and `/auth/callback`** — during prelaunch mode nobody can authenticate. The admin's escape hatch is changing the env var and redeploying (per Q4 resolution), not logging in.
  3. When the flag is `"false"` or unset, the middleware behaves as today: `/prelaunch` remains reachable as a plain public page, and `/login`/`/auth/callback` stay public, and all other routes require a session.
- **TR-006 (Testing)**: Reuse Countdown unit tests; add one integration test for the page-level render (all three tiles visible + title renders + locale toggle).

### Key Entities *(if feature involves data)*

- **EventConfig** — `{ event_datetime: ISO8601 }` — shared with Homepage; sourced from `NEXT_PUBLIC_EVENT_DATE`.
- **CountdownValues** — reused: `{ days, hours, minutes, isPast }`.

### Environment Variables

| Var | Required? | Purpose |
|-----|-----------|---------|
| `NEXT_PUBLIC_EVENT_DATE` | Yes | Target datetime in ISO 8601 (e.g. `2026-06-15T18:30:00+07:00`). Reused from Homepage. |
| `NEXT_PUBLIC_PRELAUNCH_MODE` | No (default `false`) | If `"true"`, `middleware.ts` redirects every non-`/prelaunch` public request to `/prelaunch`. Otherwise the app behaves normally and `/prelaunch` is simply reachable as a dedicated URL. |

### State Management

**Local state:**

| Component | State | Type | Purpose |
|-----------|-------|------|---------|
| `<Countdown size="large">` | `remaining` | `{ days, hours, minutes, isPast }` | Same as Homepage — setInterval + visibilitychange resync |
| Page | (none) | — | Purely static wrapper |

**Global / cross-page state (MVP):**

| Source | Value | Consumer |
|--------|-------|----------|
| `NEXT_PUBLIC_EVENT_DATE` env var | ISO 8601 string | `<Countdown />` |
| `NEXT_PUBLIC_PRELAUNCH_MODE` env var | `"true" | "false"` | `middleware.ts` |
| `NEXT_LOCALE` cookie | `"vi" | "en"` | `next-intl` → page render |

No SWR, no fetch, no Supabase session on this page.

**Loading / error / empty states:**

| Scenario | UI state |
|----------|----------|
| First render (target valid) | Tiles paint at computed values within 1 frame; no skeleton |
| `NEXT_PUBLIC_EVENT_DATE` missing / invalid | Tiles render `00`; dev-mode console warning `"Invalid NEXT_PUBLIC_EVENT_DATE"` |
| Event past | Tiles frozen at `00`; title unchanged |
| Missing i18n key | Fallback to VN (per next-intl default); dev console warning |

---

## Data Requirements

*(This page has no user inputs — no forms, no interactive fields. The only data consumed is the target datetime from an env var and the locale cookie. The sections below enumerate i18n strings and dynamic values.)*

### i18n Keys

Namespace: `prelaunch` (new). Two new keys only; everything else is reused from the Homepage namespace to keep the countdown DRY.

**New keys:**

| Key | VN | EN |
|-----|-----|-----|
| `prelaunch.title` | Sự kiện sẽ bắt đầu sau | The event will begin in |
| `prelaunch.metadata.title` | Sự kiện sẽ bắt đầu sau — Sun* Annual Awards 2025 | Coming soon — Sun\* Annual Awards 2025 |
| `prelaunch.metadata.description` | Đếm ngược đến Sun* Annual Awards 2025. | Count down to Sun\* Annual Awards 2025. |

**Reused from Homepage namespace (no new keys, no edits):**

| Key | Purpose on Prelaunch page |
|-----|---------------------------|
| `homepage.hero.countdown.days` | `DAYS` unit label (identical text in VN/EN) |
| `homepage.hero.countdown.hours` | `HOURS` unit label |
| `homepage.hero.countdown.minutes` | `MINUTES` unit label |
| `homepage.hero.countdown.aria_label` | `aria-live` announcement (the live region wraps the shared `<Countdown>` component, which already references this key internally) |

> These labels are TRANSLATED i18n keys that happen to render identical text in VN and EN (`DAYS`, `HOURS`, `MINUTES`) — they are not locale-invariant strings hardcoded in JSX. The i18n parity test (TR-003) still verifies they exist in both `vi.json` and `en.json`.

> **Naming-convention note**: `prelaunch.title` uses flat `.title` rather than the nested `homepage.hero.title` pattern because the Prelaunch namespace is shallow (only 3 keys). If the Prelaunch page grows, consider `prelaunch.hero.title`, `prelaunch.metadata.*` — but for MVP, flat is fine.

### Dynamic Data Fields

| Field | Type | Source | Display |
|-------|------|--------|---------|
| `event_datetime` | ISO 8601 | `NEXT_PUBLIC_EVENT_DATE` env var | Countdown values |

---

## API Dependencies

None. This page makes no backend calls.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Page first paint ≤ 1.5s on 4G throttled.
- **SC-002**: Countdown reflects remaining time within 60 seconds of wall clock.
- **SC-003**: 100% of visible strings respect the active locale (no Vietnamese diacritics leak when EN cookie is active — same regex check as SC-003 on Homepage).
- **SC-004**: Axe-core reports 0 WCAG 2.1 AA violations.

---

## Out of Scope

- **Email capture / "notify me" form**: MVP shows the countdown only. A future version could add an email sign-up.
- **Social sharing buttons**: not in scope.
- **Mobile-specific redesign**: responsive scaling only, no separate mobile layout.
- **Multiple concurrent countdowns**: a single target datetime is enough.
- **Authenticated variant** (e.g., showing the user's name): out of scope. Page is purely public.

---

## Dependencies

- [x] `NEXT_PUBLIC_EVENT_DATE` env var available (already set for Homepage).
- [x] `<Countdown />` + `<CountdownUnit />` + `<CountdownDigitTile />` components from Homepage.
- [ ] **Shared-component upgrade** (blocking, affects Homepage): add `size?: "default" | "large"` prop to the three components at `src/components/homepage/Countdown.tsx`, `CountdownUnit.tsx`, `CountdownDigitTile.tsx` — the Homepage's current callers don't pass it and continue to use `"default"`. Verify Homepage countdown still renders identically after the change (existing Homepage tests must remain green).
- [ ] `middleware.ts` — add `/prelaunch` to `PUBLIC_PATHS`; add `NEXT_PUBLIC_PRELAUNCH_MODE === "true"` short-circuit (see TR-005).
- [ ] `src/app/prelaunch/page.tsx` — new Next.js route handler rendering the full page (imports `<PrelaunchPage />`).
- [ ] `src/components/prelaunch/PrelaunchPage.tsx` — new feature-first component housing the layout (BG + gradient + centered title + `<Countdown size="large" />`).
- [ ] `src/components/prelaunch/index.ts` — barrel export.
- [ ] `src/i18n/messages/vi.json` + `en.json` — add `prelaunch.*` namespace (3 keys each).
- [ ] *(Optional)* `src/app/prelaunch/layout.tsx` — if metadata isolation is needed; otherwise page-level `generateMetadata` is sufficient.

---

## Open Questions

All resolved (2026-04-21):

1. **Scope — countdown appears in TWO places**: Homepage inline + Prelaunch standalone. **RESOLVED**: single source of truth via shared components with a `size` prop variant; any logic fix applies to both surfaces. Documented upfront in §Overview.
2. **Route path** — **RESOLVED**: `/prelaunch`. Reachable regardless of flag state (works both as a short-circuit target AND a direct URL).
3. **Post-event behaviour** — **RESOLVED**: show `00 00 00` (frozen tiles); admin manually disables the flag — no auto-redirect.
4. **Admin control** — **RESOLVED**: change the `NEXT_PUBLIC_PRELAUNCH_MODE` env var and redeploy. No admin UI in MVP.

---

## Notes

- **Reuse the Homepage countdown components**. Do NOT build new ones. Add a `size` prop with `"default"` (51×82 tile, 49.152px digit, 24px label) vs `"large"` (77×123 tile, 73.728px digit, 36px label). The visual DNA is the same — only scale differs.
- **The gradient overlay** on this page is at `18deg` instead of Homepage's `12deg` — slight difference; reproduce exactly for pixel match.
- **Background image** reuses the same "wave/roots" asset from the Homepage (`keyvisual-bg.png`) — no need to export a new asset, just adjust positioning.
- **Single `aria-live` region** on the outer content frame — same pattern as Homepage countdown.
- **Consider i18n namespace**: put the countdown-specific keys under `prelaunch.*` rather than polluting `homepage.*`, even though they share Countdown components.
