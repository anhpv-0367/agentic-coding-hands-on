# Implementation Plan: Awards Information (`/awards`)

**Frame**: `zFYDgyj_pD-Awards` (Figma `313:8436`)
**Date**: 2026-04-21
**Spec**: `spec.md`
**Design**: `design-style.md`

---

## Summary

Build a protected, static, i18n-driven `/awards` detail page that presents the 6 SAA 2025 award categories with picture + description + quantity + prize value. The page reuses ~80% of existing chrome (Header, Footer, HeroBackdrop, KudosPromo, SectionHeader) and adds four new building blocks: a scroll-spy **sidebar TOC**, an **alternating-layout info card**, a **client-side hash-scroll handler**, and a **static data map** for per-category quantity/prize. No backend calls — content is served entirely from `next-intl` messages + a TypeScript constants file.

Primary technical risks: scroll-spy correctness under sticky headers, alternating-card accessibility (keep reading order correct despite flex reversal), and content-block height collision when descriptions are short relative to the 336-px picture.

---

## Technical Context

**Language/Framework**: TypeScript 5.x (strict) / Next.js 16 App Router (Turbopack)
**Primary Dependencies**: React 19.2.4, next-intl v4, TailwindCSS v4 (CSS-first `@theme`), `@supabase/ssr`
**Database**: N/A (no backend calls from this page — Supabase Auth only at middleware)
**Testing**: Jest 30 + `@testing-library/react` (unit), Playwright + axe-playwright (E2E + a11y)
**State Management**: React local state (`useState`/`useReducer`) in a single client wrapper; `next-intl` handles i18n state; no SWR/Zustand/Redux
**API Style**: None consumed by this page

---

## Constitution Compliance Check

*GATE: Must pass before implementation can begin*

- [x] **Clean code & organization**: Components grouped under `src/components/awards/`; kebab-case files, PascalCase components; each with a single clear purpose.
- [x] **Platform-appropriate UI**: Tailwind v4 utility classes bound to `@theme` tokens in `globals.css`; no hardcoded colors/spacing/typography (two new typography tokens + 12 spacing tokens added via `@theme`).
- [x] **Test-first (TDD)**: Each user story has at least one failing test specified in tasks.md before implementation.
- [x] **Supabase Integration**: No new Supabase usage; existing middleware auth suffices.
- [x] **Security**: No new secrets; no user input; no XSS surface (all content is trusted i18n). The `<AwardsSidebar>` renders `<a href="#slug">` — slugs come from a closed enum, not user input.
- [x] **TypeScript `type`** (not `interface`) — declared in constitution addendum in CLAUDE.md.
- [x] **loglass-ui**: N/A. This project does not use loglass-ui; the addendum applies to a different repo. Verified by absence of `@loglass/ui` in `package.json`.

**Violations**: None.

---

## Architecture Decisions

### Frontend Approach

- **Component structure**: `src/components/awards/*` grouping, mirroring the existing `homepage/*` and `prelaunch/*` precedent in this project. Note: constitution §I says "feature-first folder structure", and this project's interpretation is `src/components/<feature>/` (not `src/features/<feature>/`) — a precedent set by Homepage and Prelaunch implementations. This plan follows that precedent.
- The route `src/app/awards/page.tsx` is a **Server Component** (auth check + `generateMetadata` + renders `<AwardsPage>`). `<AwardsPage>` is also a **Server Component** composing Header, Hero, Title, the awards main block, KudosPromo, Footer. Only one client island exists: `<AwardsMainClient>`, which owns `activeSlug` state and runs the scroll-spy + hash hooks. The 6 server-rendered `<AwardInfoCard>` elements are passed to `<AwardsMainClient>` via the `children` prop (standard RSC-client interop), so cards stay server-rendered and only the sidebar + effects code ship to the client.
- **Styling strategy**: Tailwind v4 utility classes. New tokens (`--text-award-value`, `--text-award-description`, `--space-awards-*`, etc.) added to `@theme` block in `globals.css`. Inline `style={{}}` only for dynamic values (none expected on this page).
- **Data fetching**: None. Static i18n strings + TypeScript constants map. Server-rendered HTML.
- **Scroll-spy target discovery**: `useScrollSpy()` inside `<AwardsMainClient>` finds card sections on mount via `document.querySelectorAll('[data-award-slug]')` — not via React refs — because the cards live in the `children` tree and aren't reachable via `useRef` from the client island. Each `<AwardInfoCard>` renders `<section id="{slug}" data-award-slug="{slug}">` so the observer can wire up.

### Backend Approach

- **API Design**: N/A
- **Data Access**: N/A
- **Validation**: N/A (no user input)

### Integration Points

- **Existing shared components** (verified in codebase on 2026-04-21):
  - `Header` (`src/components/layout/Header.tsx`) — already supports `selectedNav="awards"` (line 77: `state={selectedNav === "awards" ? "selected" : "normal"}`). **No modification needed.** Pass `selectedNav="awards"` from `<AwardsPage>`.
  - `Footer` (`src/components/layout/Footer.tsx`) — same; already supports `"awards"` at line 95. **No modification needed.**
  - `HeroBackdrop` (`src/components/homepage/HeroBackdrop.tsx`) — **extend**. Currently `variant: "homepage" | "prelaunch"` with a `VARIANT_TOKENS` map. Add a third variant `"awards"`: 547 px height, full-width artwork, **renders no children** (no countdown, no CTA, no event info — the Awards hero is purely decorative). Implementation: either split into `<HeroBackdrop variant="awards" />` with no `children` rendered, or make `children` optional and pass nothing.
  - `SectionHeader` (`src/components/ui/SectionHeader.tsx`) — **reuse as-is**. Accepts `caption`, `title`, `description?`, `headingLevel?`. The Awards title block maps directly: `<SectionHeader caption={t("page.caption")} title={t("page.title")} headingLevel="h1" />`. No `<AwardsTitle>` wrapper component is needed.
  - `KudosPromo` (`src/components/homepage/KudosPromo.tsx`) — reuse as-is.
  - `Icon` (`src/components/ui/Icon.tsx`) — reuse for 3 new MM_MEDIA icons.
- **Existing data** — the Homepage data layer is **unchanged** (see "Modified Files" for the authoritative decision):
  - `AWARD_CATEGORIES` (`src/lib/services/awards-categories.ts`) — keep narrow (`slug`, `i18nKey`, `imageUrl`, `order`). The `/awards` page reads from a **separate** `src/lib/data/awards-details.ts` that keys off the same `AwardSlug` but carries `quantity`, `unit`, `value`, `valueMode`. The Homepage awards grid never imports detail data.
  - `AwardCategory` type (`src/types/homepage.ts`) — **no change**. The new detail type `AwardCategoryDetail` lives in `src/types/awards.ts`.
  - i18n messages (`src/i18n/messages/{vi,en}.json`) — **extend**: add `awards.*` namespace (16 shared keys + metadata + 6 × `long_description`).

### State Management

| State | Scope | Source | Updater |
|-------|-------|--------|---------|
| `activeSlug` | `<AwardsMainClient>` local `useState` | URL hash on mount + `IntersectionObserver` callback + sidebar click | `setActiveSlug` |
| Locale | next-intl cookie | `NEXT_LOCALE` cookie | `LanguageSelector` in header |
| Auth session | Supabase cookie | middleware | session refresh |

No global store introduced.

### Navigation & History Strategy

| Trigger | History op | Rationale |
|---------|------------|-----------|
| Sidebar item click | `history.pushState(null, "", "#slug")` | Back button walks through user's navigation intents |
| Intersection-observer activation on scroll | `history.replaceState(null, "", "#slug")` | Don't pollute history with every pixel-scroll |
| `hashchange` event (Back/Forward) | read `location.hash`, scroll to matching card, update `activeSlug` | Synchronizes with browser navigation |
| Reduced-motion | `scrollIntoView({ behavior: "auto" })` | Skip animated scroll when user prefers |

---

## Project Structure

### Documentation (this feature)

```text
.momorph/specs/zFYDgyj_pD-Awards/
├── spec.md              # Feature specification (exists)
├── design-style.md      # Visual specs (exists)
├── plan.md              # This file
├── tasks.md             # Generated by /momorph.tasks
└── assets/
    └── frame.png        # Reference screenshot (exists)
```

### Source Code — New Files

| File | Purpose | Component kind |
|------|---------|----------------|
| `src/app/awards/page.tsx` | Route entry + `generateMetadata` + auth check | Server |
| `src/components/awards/AwardsPage.tsx` | Page shell: Header + Hero + Title + `<AwardsMainClient>` + KudosPromo + Footer | Server |
| `src/components/awards/AwardsMainClient.tsx` | Client island: sidebar + cards grid + scroll-spy orchestration | Client |
| `src/components/awards/AwardsSidebar.tsx` | Sticky sidebar `<nav>` + 6 items | Client (uses `activeSlug`) |
| `src/components/awards/AwardsSidebarItem.tsx` | Single nav `<a>` with icon + label + active/hover states | Client |
| `src/components/awards/AwardInfoCard.tsx` | Card wrapper — handles alternating `flex-row-reverse` via `index` | Server |
| `src/components/awards/AwardPicture.tsx` | 336×336 image with gold border + glow + `mix-blend-screen` | Server |
| `src/components/awards/AwardContent.tsx` | 4-row content block: title → desc → qty → value | Server |
| `src/components/awards/AwardTitleRow.tsx` | Target icon + `<h2>` | Server |
| `src/components/awards/AwardMetric.tsx` | Generic row: icon + label + value + (unit \| suffix) | Server |
| `src/components/awards/AwardValueDivider.tsx` | Signature-only "Hoặc" horizontal divider | Server |
| `src/components/awards/useScrollSpy.ts` | `IntersectionObserver` hook — returns `activeSlug` | Client hook |
| `src/components/awards/useHashScroll.ts` | Mount-time hash scroll + `hashchange` listener | Client hook |
| `src/lib/data/awards-details.ts` | Static map: `slug → { quantity, unit, value, valueMode }` | Module |
| `src/types/awards.ts` | `AwardSlug`, `AwardCategoryDetail`, `AwardUnit`, `AwardValueMode` types | Types |
| `src/lib/format/currency.ts` | `formatVnd(amount, locale)` helper using `Intl.NumberFormat` | Utility |
| `tests/unit/awards/AwardInfoCard.test.tsx` | Unit: renders title, desc, qty, value for Top Talent | Jest |
| `tests/unit/awards/AwardsSidebar.test.tsx` | Unit: active state, click scrolls, keyboard nav | Jest |
| `tests/unit/awards/formatCurrency.test.ts` | Unit: VN vs EN locale formatting | Jest |
| `tests/unit/awards/useScrollSpy.test.ts` | Unit: IntersectionObserver mock scenarios | Jest |
| `tests/e2e/awards.spec.ts` | E2E: deep-link `#top-talent`, scroll-spy, a11y (axe), reduced-motion | Playwright |

### Source Code — Modified Files

| File | Change |
|------|--------|
| `src/components/homepage/HeroBackdrop.tsx` | Add `"awards"` key to the `VARIANT_TOKENS` map (`height: 547px`, cropped hero artwork, no gradient overlay since no text is placed on top). Adjust `HeroBackdrop`'s signature to accept `variant: "homepage" \| "prelaunch" \| "awards"`; ensure awards variant renders zero children. |
| `src/app/globals.css` | Add `@theme` tokens: `--text-award-value` (36/700/44), `--text-award-description` (16/700 justified), `--space-awards-page-pad-x` (144px), `--space-awards-section-gap` (120px), `--space-awards-title-inner-gap` (16px), `--space-awards-2col-gap` (80px), `--space-awards-sidebar-gap` (16px), `--space-awards-sidebar-pad` (16px), `--space-awards-cards-gap` (80px), `--space-awards-card-gap-x` (40px), `--space-awards-card-content-gap` (32px), `--space-awards-card-content-pad` (32px), `--border-awards-divider-gold-alpha` (`#FFEA9E` @ 20%). |
| `src/i18n/messages/vi.json` | Add `awards.*` namespace: 16 shared keys (caption, title, metadata×2, sidebar.aria_label, card.*×8, currency.vnd) + 6 × `long_description` + per-category scaffolding. |
| `src/i18n/messages/en.json` | Mirror with English copy. |
| `jest.setup.ts` | Add polyfills/stubs for `IntersectionObserver` and `matchMedia` so `useScrollSpy` and reduced-motion branches are testable in jsdom. |
| **No-change files** (listed for clarity) | `src/components/layout/Header.tsx`, `src/components/layout/Footer.tsx` — already handle `selectedNav="awards"` (verified). `src/lib/services/awards-categories.ts` — stays narrow. `src/types/homepage.ts` — stays narrow. `middleware.ts` — `/awards` is already a protected route (not in `PUBLIC_PATHS`). |

### Dependencies

**No new npm packages.** The project already has `next-intl`, `@supabase/ssr`, Tailwind v4, Jest, and Playwright. IntersectionObserver is a browser API (no polyfill needed — baseline for all supported browsers).

---

## Implementation Strategy

### Phase 0 — Asset preparation

- Reuse existing award images from `public/assets/homepage/images/awards/*.{png,webp}` (already on disk from Homepage implementation). Confirm 6 files exist: top-talent, top-project, top-project-leader, best-manager, signature-2025-creator, mvp.
- Download 3 new icons via `mcp__momorph__get_media_files`:
  - `MM_MEDIA_Target` → `public/assets/icons/target.svg`
  - `MM_MEDIA_Diamond` → `public/assets/icons/diamond.svg`
  - `MM_MEDIA_License` → `public/assets/icons/license.svg`
- Reuse `MM_MEDIA_Root Further Logo` from Homepage.
- Reuse the existing hero artwork file (cropped via CSS `object-position` if needed for the 547 px band).

### Phase 1 — Foundation (non-blocking prerequisites)

1. Add types: `src/types/awards.ts` (AwardSlug enum, `AwardCategoryDetail`, `AwardUnit`, `AwardValueMode`).
2. Add static data: `src/lib/data/awards-details.ts` with all 6 categories' quantity/unit/value/valueMode.
3. Add currency helper: `src/lib/format/currency.ts` (`formatVnd(amount, locale)`).
4. Add Tailwind tokens to `@theme` in `globals.css`.
5. Extend `HeroBackdrop` with `variant="awards"`.
6. Add `awards.*` namespace to both `vi.json` and `en.json`.

### Phase 2 — User Story 1 (P1 MVP) — Browse all 6 cards

1. Scaffold `src/app/awards/page.tsx` (server component + `generateMetadata` + auth flow delegates to `<AwardsPage>`).
2. Scaffold `<AwardsPage>` shell: Header + HeroBackdrop + SectionHeader + main grid (non-interactive static version) + KudosPromo + Footer.
3. Build `<AwardInfoCard>` + `<AwardPicture>` + `<AwardContent>` + `<AwardTitleRow>` + `<AwardMetric>`.
4. Handle Signature exception: `<AwardValueDivider>` + dual value rows.
5. Verify server-rendered HTML matches 6 cards in the correct alternating layout.
6. Unit tests: `AwardInfoCard.test.tsx`, `formatCurrency.test.ts`.

### Phase 3 — User Story 2 (P1) — Deep-link via hash

1. Wrap the cards grid in `<AwardsMainClient>` (`"use client"`).
2. Implement `useHashScroll()` hook: on mount, read `location.hash`, match against slug enum, scroll target into view with 104 px offset (instant under reduced-motion).
3. Add `hashchange` listener to re-scroll when browser navigates.
4. Add `<section id="{slug}">` wrappers around each card.
5. Unit tests: `useScrollSpy.test.ts` stub (hash resolution only).
6. E2E test slice: `awards.spec.ts` → assert `/awards#best-manager` scrolls Best Manager into view.

### Phase 4 — User Story 3 (P2) — Sidebar + scroll-spy

1. Build `<AwardsSidebar>` + `<AwardsSidebarItem>` with Default/Hover/Focus/Selected states.
2. Implement `useScrollSpy()` hook: `IntersectionObserver` with `rootMargin: "-80px 0px -50% 0px"`; returns active slug.
3. Wire sidebar click → `pushState(#slug)` → smooth-scroll → `setActiveSlug`.
4. Wire scroll-spy callback → `replaceState(#slug)` → `setActiveSlug`.
5. Sticky positioning: `position: sticky; top: 104px` on desktop.
6. Hide sidebar on `< 1024 px` via Tailwind `hidden lg:flex`.
7. Unit tests: `AwardsSidebar.test.tsx` (active state, click behavior, keyboard).
8. E2E: scroll-spy tracks active state; reduced-motion scroll is instant.

### Phase 5 — User Story 4 (P2) — Chrome continuity verification

1. Confirm Header shows "Awards Information" in selected state on `/awards` (already wired at Header.tsx:77 — smoke check only).
2. Confirm Footer mirrors Header selection (Footer.tsx:95 — smoke check only).
3. Confirm Kudos promo "Chi tiết" navigates to `/kudos` (route may 404 until Kudos page ships — known gap, not a blocker).

### Phase 6 — Polish & accessibility

1. Run axe-playwright → 0 WCAG 2.1 AA violations.
2. Lighthouse: LCP ≤ 2.5 s, CLS ≤ 0.1. Use `<Image priority>` on hero; `loading="lazy"` on the 6 award pictures.
3. Verify i18n parity: both `vi.json` and `en.json` have matching keys. If an i18n parity CI check does not yet exist in this repo, add a minimal parity test in `tests/unit/i18n/parity.test.ts` (extend if it exists).
4. Verify reduced-motion honored across all scroll paths (sidebar click, hash mount, hashchange).
5. Manual QA against the `design-style.md §Validation Checklist`.

### Phase 7 — Quality gates (per CLAUDE.md)

Before marking any phase complete, run the mandated quality checks from `CLAUDE.md §Frontend Essential Commands`:

1. `cd frontend && pnpm typecheck` → 0 TypeScript errors.
2. `cd frontend && pnpm lint` → 0 lint violations.
3. `cd frontend && pnpm build` → production build succeeds.
4. `cd frontend && pnpm test` → all unit tests pass.
5. `cd frontend && pnpm test:e2e` → E2E + axe suite passes (runs Chromium headless; requires `pnpm dev` on port 3000 or Playwright's configured webserver).

### Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Scroll-spy active state flickers** on rapid scroll (multiple cards cross boundary simultaneously) | Medium | Low | `rootMargin: "-80px 0px -50% 0px"` intentionally makes only ONE card "active" (upper half); add 100 ms debounce if flicker observed |
| **Alternating flex-row-reverse breaks reading order** for screen readers | Low | High (a11y) | DOM order is always picture→content; `flex-row-reverse` only swaps visual order. Verify with Playwright + axe. |
| **Content block shorter than 336 px picture** (short description) creates dead whitespace | Medium | Low | `align-items: flex-start` on card root so content hugs its natural height; picture retains fixed 336. Empty space below content is page background. |
| **Sticky sidebar overlaps Header at exact scroll breakpoint** | Low | Medium | `top: 104px` = 80 (header) + 24 (breathing room); same offset used for scroll-into-view. Adjust in one place if header height changes. |
| **Hash change during reduced-motion → jarring instant jump** | Low | Low | Acceptable per WCAG; user explicitly requested no motion. |
| **Missing long_description content from content team at launch** | High (current status unknown) | Low | Placeholder strings in i18n JSON keep layout stable; content team can swap without code changes. |
| **Kudos `/kudos` destination not yet implemented** | High | Low | Out of scope for this plan; link will 404 until Kudos page ships. Will be resolved when Kudos spec runs. |
| **Alternating layout mobile regression** | Low | Medium | On `<1024 px`, card root switches to `flex-direction: column` and alternation is dropped (picture always on top). Unit + E2E test mobile breakpoint. |

### Estimated Complexity

- **Frontend**: Medium (11 new React components/hooks, extensive reuse of Homepage chrome)
- **Backend**: Zero
- **Testing**: Medium — **4 unit test suites** (`AwardInfoCard`, `AwardsSidebar`, `formatCurrency`, `useScrollSpy`) + **1 E2E spec** (`awards.spec.ts`) covering ≥ 8 scenarios incl. axe WCAG pass

---

## Integration Testing Strategy

### Test Scope

- [x] **Component/Module interactions**: sidebar ↔ useScrollSpy ↔ hash handler; cards ↔ static data map ↔ i18n
- [x] **External dependencies**: Supabase Auth middleware redirect (existing coverage)
- [ ] **Data layer**: N/A
- [x] **User workflows**: Deep-link → scroll; scroll → sidebar updates; sidebar click → scroll + URL update

### Test Categories

| Category | Applicable? | Key Scenarios |
|----------|-------------|---------------|
| UI ↔ Logic | Yes | Card renders correct quantity/value per slug; Signature shows 2 value rows |
| Service ↔ Service | No | — |
| App ↔ External API | No | — |
| App ↔ Data Layer | No | — |
| Cross-platform | Yes | Responsive breakpoints 320/768/1024/1440; reduced-motion honored |

### Test Environment

- **Environment type**: Jest jsdom (unit), Playwright headless Chromium (E2E), local `next dev` at port 3000.
- **Test data**: In-line fixtures + actual i18n files. No seeded DB.
- **Isolation**: Each test file owns its own setup; no shared mocks across files.

### Mocking Strategy

| Dependency | Strategy | Rationale |
|------------|----------|-----------|
| `next-intl` `useTranslations`/`getTranslations` | Mock in Jest with fixture messages | Deterministic string assertions |
| Supabase Auth | Mock client returning a fake authenticated user | Skip the OAuth dance in unit tests |
| `IntersectionObserver` | Stub in jest.setup.ts (not available in jsdom) | Required for scroll-spy unit tests |
| `matchMedia("(prefers-reduced-motion: reduce)")` | Stub in jest.setup.ts | Test reduced-motion branches |
| Real browser for E2E | No mocks | Exercise actual scroll + IntersectionObserver |

### Test Scenarios Outline

1. **Happy Path**
   - [ ] `/awards` renders 6 cards in order Top Talent → MVP.
   - [ ] Each card shows the correct quantity + value + unit + description.
   - [ ] Signature card has 2 value rows separated by "Hoặc".
   - [ ] Sidebar renders 6 items with Target icon.
   - [ ] `/awards#mvp` scrolls MVP into view; sidebar marks MVP active.

2. **Error Handling**
   - [ ] `/awards#nonexistent` → renders normally, first item active, no scroll jump.
   - [ ] Image fails to load → gold border placeholder visible, no CLS.
   - [ ] Unauthenticated `/awards` → redirect to `/login?returnTo=%2Fawards` (middleware existing behavior).

3. **Edge Cases**
   - [ ] `prefers-reduced-motion: reduce` → sidebar click scrolls instantly (no animation).
   - [ ] Viewport `<1024 px` → sidebar hidden, cards stack full-width (picture-top / content-bottom), picture 1:1 scaling.
   - [ ] Back button after 2 sidebar clicks walks back through the hashes (pushState intent).
   - [ ] Manual scroll updates URL via `replaceState` — pressing Back does NOT step through every scrolled position.
   - [ ] Clicking the already-active sidebar item is a no-op visually but still round-trips the hash (no scroll animation played if already in view).
   - [ ] Locale switch mid-view → currency re-formats (`7.000.000 VNĐ` ↔ `7,000,000 VND`); `formatVnd` receives locale as a parameter (not cached at module load).
   - [ ] Alternating card layout renders correct visual order (odd Pic-LEFT, even Pic-RIGHT) while DOM reading order always stays Picture → Content (screen-reader safety).
   - [ ] axe-playwright: 0 WCAG 2.1 AA violations.

### Tooling & Framework

- **Test framework**: Jest 30 + `@testing-library/react` (unit); Playwright + axe-playwright (E2E + a11y).
- **Supporting tools**: Next.js Jest plugin, jsdom polyfills for `IntersectionObserver` + `matchMedia`.
- **CI integration**: Existing pipeline runs `pnpm typecheck && pnpm lint && pnpm test && pnpm test:e2e`.

### Coverage Goals

| Area | Target | Priority |
|------|--------|----------|
| Core user flow (US1 browse) | 90%+ | High |
| Scroll-spy + hash logic (US2, US3) | 85%+ | High |
| Alternating layout visual correctness | Manual visual QA + 1 E2E snapshot | High |
| Responsive behavior | 75%+ | Medium |
| Error/edge scenarios | 70%+ | Medium |

---

## Dependencies & Prerequisites

### Required Before Start

- [x] `constitution.md` reviewed and understood.
- [x] `spec.md` approved (post-review, with 3 open questions to confirm — see §Open Questions).
- [x] `design-style.md` complete.
- [ ] `research.md` — **NOT created**; a single inventory report from Explore agent was sufficient given the heavy reuse of existing Homepage components. Folded directly into §Integration Points and §Project Structure below.
- [ ] API contracts — N/A.
- [ ] Database migrations — N/A.

### External Dependencies

- `mcp__momorph__get_media_files` access to download 3 icons from Figma.
- Content team deliverable: long-form Vietnamese + English descriptions for each of the 6 categories (can launch with placeholder strings; hot-swappable).

---

## Next Steps

After plan approval:

1. Run `/momorph.reviewplan` for a staff-engineer second pass.
2. Run `/momorph.tasks` to generate the ordered task breakdown (Phase 0 → Phase 6 → Tests).
3. Begin implementation following TDD: write failing tests → make them pass → refactor.

---

## Resolved Decisions (2026-04-21)

All previously open questions confirmed by product owner:

1. **Alternating card layout** — ✅ intentional. Odd cards (1/3/5) Picture-LEFT; even (2/4/6) Picture-RIGHT.
2. **Sticky sidebar** — ✅ `position: sticky; top: 104px` on desktop (≥ 1024 px).
3. **Inter-row divider opacity** — ✅ `#FFEA9E` at 20% opacity. CSS token name: `--border-awards-divider-gold-alpha`.
4. **Mobile alternation** — ✅ **preserved**. Below 1024 px, odd cards use `flex-direction: column` (picture-top) and even cards use `flex-direction: column-reverse` (picture-bottom). DOM order stays `<picture>` → `<content>` for a11y; only visual order shifts.

No open questions remain. Plan is ready for `/momorph.tasks`.

---

## Notes

- **Why split AwardCategory (homepage) vs AwardCategoryDetail (awards page)**: the Homepage grid uses a lean object (slug + title + image + teaser description). The `/awards` page needs quantity/value/long-description. Extending the Homepage type would couple Homepage render paths to detail data they don't need. A separate `awards-details.ts` map keeps concerns separated; both files key off the same `AwardSlug` enum.
- **Why a single client island rather than full-client page**: keeps Header, Hero, Title, Cards, Kudos, Footer as server-rendered HTML for best LCP and SEO. Only the sidebar + hash/scroll orchestration runs on the client.
- **Why pushState-on-click + replaceState-on-scroll**: user intent navigation (click) is a history entry; passive scrolling is not. This matches GitHub's `README.md` anchor behavior and is the accepted pattern.
- **Why `MM_MEDIA_Target` appears in two places** (sidebar items AND card titles): this is per the Figma file — both use the same target icon at 24×24 with gold fill. Document in `design-style.md` under "Icon assets" so future editors don't accidentally diverge them.
- **Why `querySelectorAll` instead of refs for scroll-spy**: server-rendered cards are passed as `children` to the client island and can't be reached via `useRef`. On mount, `useScrollSpy()` does a one-time `document.querySelectorAll('[data-award-slug]')` to collect `HTMLElement`s, then attaches the `IntersectionObserver`. This is the standard RSC-client interop pattern.

---

## Review Changelog (`/momorph.reviewplan` pass — 2026-04-21)

Applied in this review:
- **Fixed contradiction**: earlier draft said `<AwardsPage>` is a client component and `AWARD_CATEGORIES` would be extended. Corrected — `<AwardsPage>` is a Server Component; `AWARD_CATEGORIES` stays narrow and new detail data lives in `src/lib/data/awards-details.ts`.
- **Clarified RSC-client interop**: server-rendered cards are passed via the `children` prop into `<AwardsMainClient>`; scroll-spy discovers card nodes via `document.querySelectorAll('[data-award-slug]')` rather than refs.
- **Verified codebase**: confirmed Header/Footer already accept `selectedNav="awards"`; HeroBackdrop variants verified; `test:e2e` script + axe-playwright installed; 6 award images already on disk.
- **Expanded Modified Files** with exact `@theme` tokens to add, explicit `jest.setup.ts` additions for `IntersectionObserver` + `matchMedia` stubs.
- **Added test scenarios** for active-sidebar-item no-op, pushState vs replaceState history difference, locale-switch currency re-format, DOM-order a11y safety under `flex-row-reverse`.
- **Added Phase 7 quality gates** per CLAUDE.md (typecheck, lint, build, test, test:e2e).
- **Fixed test count** (3 → 4 unit suites).
- **Removed unused component references**: `<AwardsTitle>` (reusing `<SectionHeader>`); `<HashScrollOnMount>` (logic lives inside `useHashScroll.ts`).
