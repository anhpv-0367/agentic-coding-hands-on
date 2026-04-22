# Implementation Plan: Countdown (shared) + Prelaunch Page

**Frame**: `8PJQswPZmU-Countdown` (Figma `2268:35127` – "Countdown - Prelaunch page")
**Date**: 2026-04-21
**Spec**: `specs/8PJQswPZmU-Countdown/spec.md`
**Design-style**: `specs/8PJQswPZmU-Countdown/design-style.md`

---

## Summary

This feature has **two deliverables on one shared foundation**:

1. **Shared-component upgrade** — extend the already-shipped `<Countdown />`, `<CountdownUnit />`, `<CountdownDigitTile />` components at `src/components/homepage/` with an optional `size?: "default" | "large"` prop. This is a small, backwards-compatible refactor: existing Homepage callers don't pass `size` and keep their current visual. The `"large"` variant scales tile / digit / label / blur / border / radius ~1.5× per `design-style.md`.

2. **New Prelaunch page** (`/prelaunch`) — a public, no-header, no-footer standalone page that centers the shared Countdown at `size="large"` over a full-bleed keyvisual background with a gradient overlay and a centered title "Sự kiện sẽ bắt đầu sau". Activated either via direct URL OR a new env-var short-circuit `NEXT_PUBLIC_PRELAUNCH_MODE=true` in `middleware.ts`.

**No new dependencies, no new backend, no new fonts.** Reuses the Homepage keyvisual image, Digital Numbers font fallback chain, i18n infrastructure, and Supabase clients (even though this page doesn't authenticate).

---

## Technical Context

**Language/Framework**: TypeScript 5.x / Next.js 16 (App Router, `--src-dir`)
**Primary Dependencies**: React 19, TailwindCSS v4, next-intl v4, `@supabase/ssr` (only used by middleware to skip this route). **No new packages added.**
**Database**: N/A — page makes zero backend calls.
**Testing**: Jest 30 + `@testing-library/react` 16 (unit/integration); Playwright 1.x + `axe-playwright` 2.x (E2E).
**State Management**: React `useState` + `useEffect` (existing Countdown). No SWR, no session.
**API Style**: N/A.

---

## Constitution Compliance Check

*GATE: Must pass before implementation can begin*

| Rule | Status | Notes |
|------|--------|-------|
| I. Feature-first folder structure | ✅ | New `src/components/prelaunch/` folder; new `src/app/prelaunch/page.tsx` |
| I. Naming conventions | ✅ | Component files PascalCase (matches Homepage pattern); i18n keys match existing snake_case-under-dots pattern |
| II. Design tokens centralized | ✅ | No new CSS tokens needed — all values derive from existing Homepage `@theme` tokens (tile blur gets a `--backdrop-blur-tile-lg` variant, optional) |
| II. TailwindCSS + tokens (no hardcoded colors) | ✅ | Prelaunch page uses existing `--color-bg-page`, `--color-text-gold`, etc. |
| III. TDD (test-first) | ✅ | Unit tests already exist for Countdown pure logic; add new tests for size prop + new Prelaunch page integration test |
| IV. Supabase SDK | ✅ | Middleware keeps existing Supabase client singleton; Prelaunch page itself does NOT call Supabase |
| IV. RLS | N/A | No database access |
| V. Input validation | ✅ | Only boundary is `NEXT_PUBLIC_EVENT_DATE` + `NEXT_PUBLIC_PRELAUNCH_MODE` — validated via `Number.isFinite(Date.parse(...))` and strict string compare `=== "true"` |
| V. Secrets | ✅ | `NEXT_PUBLIC_*` prefix is intentional; no secrets exposed |
| CLAUDE.md: `type` not `interface` | ✅ | All new type declarations use `type` |
| CLAUDE.md: No new runtime libraries | ✅ | Zero new packages |
| CLAUDE.md: `<Icon>` for all images | ✅ | Background image and gradient rendered via `<HeroBackdrop variant="prelaunch">` (extended existing component); no raw `<img>` outside Icon |

**Violations**: None. One caveat: the Prelaunch page continues the existing mixed inline-style + Tailwind-responsive pattern used by Homepage (documented caveat in Homepage plan).

---

## Architecture Decisions

### Frontend Approach

- **Shared component contract** — the Countdown trio (`Countdown`, `CountdownUnit`, `CountdownDigitTile`) gets an optional `size?: "default" | "large"` prop. Default value preserves existing Homepage behavior. The `size` prop drives:
  - **`CountdownDigitTile`**: width/height (51.2×81.92 vs 77×123), border width (0.5px vs 0.75px), radius (8px vs 12px), backdrop-blur (16.64px vs 24.96px), digit font-size (49.152px vs 73.728px).
  - **`CountdownUnit`**: digit-row gap (4px vs 21px), stack gap (14px vs 21px), label font (24/700/32 vs 36/700/48).
  - **`Countdown`**: row gap between units (40px vs 60px), "Coming soon" label presence (`size="default"` only — hidden on `size="large"` because Prelaunch uses its own page-level title instead).
- **`<PrelaunchPage />` composition** — a pure Server Component that composes:
  1. `<HeroBackdrop variant="prelaunch">` — extended existing component with a `variant` prop that selects the gradient angle (12° Homepage vs 18° Prelaunch).
  2. `<PrelaunchTitle />` — renders `t('prelaunch.title')` as centered `<h1>` (36px/700).
  3. `<Countdown size="large" targetIso={NEXT_PUBLIC_EVENT_DATE} />` — the shared component at the large variant.
- **Route handler** — `src/app/prelaunch/page.tsx` is a Server Component that reads `NEXT_PUBLIC_EVENT_DATE`, calls `generateMetadata` for locale-aware `<title>` + `<meta description>`, and renders `<PrelaunchPage />`. Does NOT call `supabase.auth.getUser()` — page is public.
- **i18n strategy** — new namespace `prelaunch.*` with 3 keys (`title`, `metadata.title`, `metadata.description`). Unit labels (`DAYS/HOURS/MINUTES`) + aria-live key continue to be sourced from `homepage.hero.countdown.*` — the shared Countdown component references these internally regardless of `size`.
- **No global state, no SWR, no fetch.** Purely static wrapper + client-side interval for the countdown.

### Middleware changes

- Add `/prelaunch` to `PUBLIC_PATHS`.
- Add a pre-check: `if (process.env.NEXT_PUBLIC_PRELAUNCH_MODE === "true" && pathname !== "/prelaunch" && !pathname.startsWith("/_next") && !pathname.startsWith("/assets") && pathname !== "/favicon.ico") return NextResponse.redirect(new URL("/prelaunch", request.url));`
- This check must run **before** the Supabase session lookup, both to short-circuit expensive auth calls AND to ensure `/login` / `/auth/callback` also redirect during prelaunch mode (per TR-005 clarification in spec).

### Integration Points

- **Existing services reused**:
  - `src/lib/utils/countdown.ts` (`computeRemaining`, `msUntilNextMinute`) — no changes.
  - `src/components/homepage/{Countdown,CountdownUnit,CountdownDigitTile}.tsx` — extended with `size` prop.
  - `src/components/homepage/HeroBackdrop.tsx` — extended with `variant` prop (or keep separate `<PrelaunchBackdrop>` if cleaner; decide during implementation).
  - `src/i18n/messages/{vi,en}.json` — add `prelaunch.*` namespace (3 keys × 2 locales = 6 strings).
  - `middleware.ts` — 1 new pre-check and 1 PUBLIC_PATHS addition.
- **Shared components leveraged**: same Countdown trio drives both Homepage and Prelaunch — this is the whole point of the feature.
- **Asset pipeline**: reuses `public/assets/homepage/images/keyvisual-bg.png`. No new assets.

---

## Project Structure

### Documentation (this feature)

```text
.momorph/specs/8PJQswPZmU-Countdown/
├── spec.md              # Feature specification
├── design-style.md      # Design tokens + component specs
├── plan.md              # This file
├── tasks.md             # (next step: /momorph.tasks)
└── assets/
    └── frame.png        # Figma reference (1512×1077)
```

### Source Code (affected areas)

```text
frontend/
├── src/
│   ├── app/
│   │   └── prelaunch/
│   │       └── page.tsx                       # NEW — Server Component, generateMetadata, renders <PrelaunchPage />
│   ├── components/
│   │   ├── homepage/
│   │   │   ├── Countdown.tsx                   # MODIFIED — add size prop + conditional "Coming soon" visibility
│   │   │   ├── CountdownUnit.tsx               # MODIFIED — add size prop + token switch
│   │   │   ├── CountdownDigitTile.tsx          # MODIFIED — add size prop + dimension/border/blur/font-size switch
│   │   │   └── HeroBackdrop.tsx                # MODIFIED — add optional variant="prelaunch" prop (18° gradient)
│   │   └── prelaunch/                          # NEW folder — feature-first
│   │       ├── PrelaunchPage.tsx               # NEW — composes backdrop + title + large countdown
│   │       ├── PrelaunchTitle.tsx              # NEW — centered h1 using t('prelaunch.title')
│   │       └── index.ts                        # NEW — barrel export
│   ├── i18n/
│   │   └── messages/
│   │       ├── vi.json                          # MODIFIED — add prelaunch.* namespace
│   │       └── en.json                          # MODIFIED — mirror prelaunch.* keys
│   └── app/globals.css                          # OPTIONAL modification — add `--backdrop-blur-tile-lg: 24.96px` if tokens preferred over inline values
├── middleware.ts                                 # MODIFIED — add /prelaunch public path + PRELAUNCH_MODE short-circuit
├── tests/
│   ├── unit/
│   │   └── prelaunch/                           # NEW folder
│   │       ├── CountdownDigitTile.size.test.tsx # NEW — size="default" vs "large" snapshot/dimensions
│   │       ├── CountdownUnit.size.test.tsx      # NEW — label font size + gap adjustments
│   │       └── PrelaunchTitle.test.tsx          # NEW — reads i18n key, correct heading level
│   ├── integration/
│   │   └── prelaunch/
│   │       ├── page.test.tsx                    # NEW — /prelaunch renders title + countdown + does NOT render header/footer
│   │       └── middleware-prelaunch-mode.test.ts# NEW — when NEXT_PUBLIC_PRELAUNCH_MODE=true, every non-public path redirects to /prelaunch
│   └── e2e/
│       └── prelaunch.spec.ts                    # NEW — axe a11y + VN/EN locale switch + visual at 3 viewports
└── package.json                                 # UNCHANGED (no new deps)
```

### Dependencies

**No new runtime or dev dependencies.**

| Package | Purpose | Status |
|---------|---------|--------|
| All existing | next-intl, next/font, react, next | Already installed |
| Existing fonts (Montserrat, Digital Numbers fallback) | Title + digits | Already loaded by `layout.tsx` |

---

## Implementation Strategy

### Overall Approach

**Two vertical slices in strict order**, each TDD'd:

1. **Slice A — Shared component `size` prop** (BLOCKING): upgrade `<Countdown>` / `<CountdownUnit>` / `<CountdownDigitTile>` trio with a `size?: "default" | "large"` prop. Verify existing Homepage still renders identically. All existing Homepage tests MUST pass after this change.
2. **Slice B — Prelaunch page**: once Slice A ships, compose the new `/prelaunch` page, update middleware, add i18n keys, write integration + E2E tests.

Slice B cannot start until Slice A is green. Within each slice, TDD: test → red → minimum impl → green → refactor.

### Phase Breakdown

#### Phase 0 — Research & Setup

1. **Re-read the Homepage `Countdown.tsx`** to confirm the current shape and identify which inline values to swap with size-conditional values.
2. Decide whether to introduce a new CSS token `--backdrop-blur-tile-lg: 24.96px` in `globals.css` or keep the value inline inside `CountdownDigitTile.tsx`. *(Plan: keep inline — single call site, no benefit from tokenising.)*
3. No asset downloads needed (all reused from Homepage Phase 0).

**Exit criteria**: the 3 source files to modify are identified; the new file tree is created (empty).

#### Phase 1 — Slice A: shared component `size` prop (foundation)

Tests first, per component. For each, write failing test → minimum impl → green.

1. **`CountdownDigitTile.test.tsx`** — assert that `<CountdownDigitTile char="5" size="large" />` renders with `width: 77px`, `height: 123px`, `borderRadius: 12px`, border `0.75px`, backdrop-blur `24.96px`, digit font-size `73.728px`. Default (`size` omitted) keeps 51.2×81.92, 0.5px, 8px, 16.64px, 49.152px.
2. **`CountdownUnit.test.tsx`** — `size="large"` renders digit-row gap `21px`, stack gap `21px`, label font `36 / 700 / 48`. Default keeps current values.
3. **`Countdown.test.tsx`** — `size="large"` hides the "Coming soon" label (Prelaunch has its own title). Units row gap changes to `60px`. Default keeps 40px and shows "Coming soon".
4. **Implementation** — add `size` prop with TypeScript discriminated-union style OR simple `"default" | "large"` literal. Use a small `const TOKENS = { default: {...}, large: {...} }` map inside each file to centralise per-size values; easier to extend later.
5. **Regression check** — run the existing Homepage countdown tests AND the Homepage E2E; both must stay green.

**Exit criteria**: 3 new size tests green; all existing Countdown tests green; Homepage visual unchanged at `/` when HOMEPAGE_BYPASS_AUTH=true.

#### Phase 2 — Slice B-1: i18n keys

1. Add `prelaunch.title`, `prelaunch.metadata.title`, `prelaunch.metadata.description` to `vi.json` + `en.json` (content already authored in `spec.md` §i18n Keys).
2. Run the existing `i18n-parity.test.ts` to verify key-set equality.

**Exit criteria**: i18n parity test still green; the 3 new keys exist in both locales.

#### Phase 3 — Slice B-2: new components

1. **`PrelaunchTitle.tsx`** — simple Server Component rendering `<h1>t('prelaunch.title')</h1>` with Montserrat 36/700/48 centered.
2. **`HeroBackdrop.tsx`** modification — add optional `variant?: "homepage" | "prelaunch"` prop; `"homepage"` keeps current 12° gradient, `"prelaunch"` uses 18° gradient. Both use the same `keyvisual-bg.png` asset.
3. **`PrelaunchPage.tsx`** — composes `<HeroBackdrop variant="prelaunch">` + `<PrelaunchTitle />` + `<Countdown size="large" targetIso={...} />` inside a `<main>` with `min-height: 100vh; flex col; items-center; justify-center; padding: 96px 144px`.
4. **Tests** — `PrelaunchTitle.test.tsx` (renders i18n, correct tag); `PrelaunchPage.test.tsx` (renders all three children in correct order).

**Exit criteria**: unit tests for 3 new files green; components render in isolation.

#### Phase 4 — Slice B-3: route handler + metadata

1. `src/app/prelaunch/page.tsx` — Server Component; `generateMetadata` using `getTranslations("prelaunch.metadata")`; reads `process.env.NEXT_PUBLIC_EVENT_DATE`; renders `<PrelaunchPage eventDateIso={...} />`.
2. No auth check, no session lookup. Purely public.
3. Test: `tests/integration/prelaunch/page.test.tsx` — mounts the page with a mocked env var, asserts: (a) title present, (b) countdown tiles present, (c) no `<header>`, no `<footer>` in output.

**Exit criteria**: integration test green; dev-server visit to `/prelaunch` renders the page correctly without auth.

#### Phase 5 — Slice B-4: middleware integration

1. Add `/prelaunch` to `PUBLIC_PATHS`.
2. Add pre-check at the top of the `middleware` function (before the Supabase client creation):
   ```ts
   const prelaunchMode = process.env.NEXT_PUBLIC_PRELAUNCH_MODE === "true";
   const isAsset = pathname.startsWith("/_next") ||
     pathname.startsWith("/assets") ||
     pathname === "/favicon.ico";
   if (prelaunchMode && pathname !== "/prelaunch" && !isAsset) {
     return NextResponse.redirect(new URL("/prelaunch", request.url));
   }
   ```
3. Test: `tests/integration/prelaunch/middleware-prelaunch-mode.test.ts` — with env flag set, visiting `/`, `/login`, `/awards` all return 307 redirect to `/prelaunch`; `/prelaunch` itself returns 200; `/_next/static/foo.js` passes through.

**Exit criteria**: middleware test green; flipping `NEXT_PUBLIC_PRELAUNCH_MODE=true` in `.env.local` and restarting dev server → all routes redirect to `/prelaunch`.

#### Phase 6 — Polish

1. **Playwright E2E** (`tests/e2e/prelaunch.spec.ts`):
   - Viewport 375×812 — tiles visible, title readable, no horizontal scroll.
   - Viewport 768×1024 — scale down proportionally.
   - Viewport 1440×900 — matches Figma.
   - Axe: zero WCAG 2.1 AA violations.
   - Locale toggle: set `NEXT_LOCALE=vi`, assert VN title; set `NEXT_LOCALE=en`, assert EN title.
2. **Visual check** — navigate to `/prelaunch` in Playwright, take screenshot, compare with `assets/frame.png`.
3. **Lighthouse performance** — LCP ≤ 2s (TR-001).

**Exit criteria**: all E2E tests green; axe reports 0 violations; Lighthouse LCP ≤ 2s.

### Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Adding `size` prop breaks Homepage countdown visually | Med | High (regression) | Existing Homepage tests + manual visual check at `/` after Slice A; `size` defaults to `"default"` so Homepage callers remain unchanged |
| Middleware pre-check interferes with Supabase cookies | Low | Med | Short-circuit runs BEFORE Supabase client creation — no cookies are touched on the redirect response; existing Supabase auth-callback flow is unaffected because prelaunch flag is expected OFF during auth testing |
| `NEXT_PUBLIC_PRELAUNCH_MODE` treated as truthy for any non-empty string | Low | Low | Strict `=== "true"` comparison (documented in TR-005); "false", "", "1", "yes" all evaluate to OFF |
| Users who bookmark `/prelaunch` hit it after flag is flipped off | Low | Low | Page still renders as a standalone public page — acceptable behavior (spec explicitly allows this per Edge Cases) |
| `HeroBackdrop` variant complication — hard to keep both 12° and 18° gradients clean | Med | Low | If it gets messy, split into two separate components (`HomepageBackdrop` + `PrelaunchBackdrop`). Tiny duplication, clearer code |
| 18° gradient looks wrong on narrow viewports | Low | Low | Gradient is a simple CSS declaration — if issues arise, it's a 1-value fix |
| `next-intl` doesn't find `prelaunch.*` namespace | Low | Low | i18n parity test catches this immediately |

### Estimated Complexity

- **Frontend**: **Low-Medium** — 3 file modifications (size prop), 3 new small components, 1 middleware edit. Mostly boilerplate + tests.
- **Backend**: **None**.
- **Testing**: **Low** — most countdown logic already tested on Homepage; new tests are additive.

---

## Integration Testing Strategy

### Test Scope

- [x] **Component/Module interactions**: `<Countdown size="large">` wrapped by `<PrelaunchPage />` wrapped by `/prelaunch/page.tsx`.
- [x] **External dependencies**: none for the page itself; middleware integration.
- [ ] **Data layer**: N/A.
- [x] **User workflows**: prelaunch-mode toggle (env change) forces ALL routes → `/prelaunch`.

### Test Categories

| Category | Applicable? | Key Scenarios |
|----------|-------------|---------------|
| UI ↔ Logic | Yes | Countdown interval + visibilitychange at size="large" |
| Service ↔ Service | No | — |
| App ↔ External API | No | — |
| App ↔ Data Layer | No | — |
| Cross-platform | Yes | Responsive at 375/768/1440 viewports |

### Test Environment

- Jest fake timers for countdown tests (reused from Homepage).
- Playwright with a real dev server; middleware test uses Next.js `NextRequest` / `NextResponse` mocks.
- No Supabase needed for any new test (page is public).

### Mocking Strategy

| Dependency | Strategy | Rationale |
|------------|----------|-----------|
| `NEXT_PUBLIC_EVENT_DATE` | Set to `now + 30 days` in unit tests | Deterministic countdown values |
| `NEXT_PUBLIC_PRELAUNCH_MODE` | Toggled in middleware test with `jest.replaceProperty(process.env, ...)` | Isolate flag behavior |
| `next-intl` | Real `NextIntlClientProvider` in integration; mocked `useTranslations` in unit tests | Match Homepage test pattern |
| Supabase | Not touched — prelaunch page never calls Supabase | N/A |

### Test Scenarios Outline

1. **Happy Path**
   - [ ] `/prelaunch` renders title "Sự kiện sẽ bắt đầu sau" + 3 countdown units.
   - [ ] Switching `NEXT_LOCALE` cookie to `en` re-renders title as "The event will begin in".
   - [ ] Homepage countdown still renders identically after Slice A (regression).

2. **Error Handling**
   - [ ] Invalid `NEXT_PUBLIC_EVENT_DATE` → tiles render `00 00 00`.
   - [ ] Past event datetime → tiles render `00 00 00`; title unchanged.
   - [ ] Missing `prelaunch.*` key in `en.json` → dev warning; fallback to VN.

3. **Edge Cases**
   - [ ] `NEXT_PUBLIC_PRELAUNCH_MODE=true` + visit `/login` → redirect to `/prelaunch` (307).
   - [ ] `NEXT_PUBLIC_PRELAUNCH_MODE=false` + visit `/prelaunch` directly → 200, page renders normally.
   - [ ] `/prelaunch?returnTo=/awards` → query string ignored, page renders (no auth, no redirect).
   - [ ] Tab hidden for 2 min then visible → countdown re-syncs from wall clock.
   - [ ] Axe-core reports 0 WCAG 2.1 AA violations.

### Tooling & Framework

- **Test framework**: Jest 30 + RTL 16 (unit/integration); Playwright 1.x + axe-playwright 2.x (E2E).
- **Supporting tools**: `jest.useFakeTimers()` for countdown interval; Next.js `NextRequest`/`NextResponse` mocks for middleware.
- **CI integration**: `yarn test && yarn test:e2e` — unchanged from Homepage setup.

### Coverage Goals

| Area | Target | Priority |
|------|--------|----------|
| Size prop variants (3 components × 2 sizes) | 100% | High |
| PrelaunchPage + PrelaunchTitle rendering | ≥90% | High |
| Middleware prelaunch-mode short-circuit | 100% | High |
| i18n parity (prelaunch keys match vi↔en) | 100% | High |
| E2E axe + viewport + locale | Pass all | High |

---

## Dependencies & Prerequisites

### Required Before Start

- [x] `constitution.md` reviewed.
- [x] `spec.md` approved (0 open questions).
- [x] `design-style.md` approved (all tokens concrete).
- [x] Homepage countdown trio shipped and tested.
- [ ] Confirm with team: value for `NEXT_PUBLIC_PRELAUNCH_MODE` in production (default `false`, flip to `true` during the pre-launch window).

### External Dependencies

None. Fully internal feature.

### Related Screens

- **Homepage** (`i87tDx10uM`) — shared Countdown component; Slice A modifies its component files.
- No other screens touched.

---

## Git & Delivery Workflow

- **Branch**: `feature/countdown-prelaunch` off `main`. Optionally split into two sequential PRs:
  - `feature/countdown-size-prop` (Slice A) — merged first, isolated from Prelaunch page.
  - `feature/prelaunch-page` (Slice B) — depends on Slice A.
- **Commits**: atomic per component (e.g. "feat: add size prop to CountdownDigitTile", "test: add size variant tests", "feat: new prelaunch page route", "feat: middleware prelaunch-mode short-circuit").
- **Pre-commit quality gates**: `pnpm typecheck && pnpm lint && pnpm test && pnpm build` — must all pass.
- **Merge policy**: squash to `main`.
- **No `--no-verify`, no force push.**

---

## Next Steps

After plan approval:

1. **Run** `/momorph.tasks` to generate the ordered task list (`tasks.md`) with parallel markers and file-path references.
2. **Review** tasks for parallelization opportunities — within Slice A, the 3 size prop tests can run in parallel; within Slice B, PrelaunchTitle and middleware edits are independent.
3. **Begin** implementation: Slice A (Phase 0 → 1) first, strict TDD. Slice B (Phase 2 → 6) second.

---

## Open Questions

All spec-level questions are resolved. Remaining planning-level items:

- [ ] **Token vs inline for `--backdrop-blur-tile-lg`** — default: inline (single call site). If design team later wants to reuse the value elsewhere, tokenise.
- [ ] **One vs two backdrop components** — default: extend existing `<HeroBackdrop>` with `variant` prop. If implementation gets hairy, split into two. Decide at Phase 3.
- [ ] **Production default for `NEXT_PUBLIC_PRELAUNCH_MODE`** — confirm with ops: probably `false` in all non-prelaunch windows, flipped to `true` only during the actual pre-launch period. Document in the project README.

---

## Notes

- **The plan is deliberately small** — this feature is ~8 file changes total, ~200 lines of new code, ~400 lines of new tests. Don't over-engineer.
- **TDD is non-negotiable** for Slice A because it's a regression-risky change to the Homepage. For Slice B, TDD helps catch the "page renders without header/footer" assertion quickly.
- **Middleware pre-check placement matters** — it MUST run BEFORE `supabase.auth.getUser()` to avoid unnecessary network calls + to ensure `/login` also redirects during prelaunch mode. Put it immediately after the `PUBLIC_PATHS` / `isPublicPath` computation.
- **Don't add auth to `/prelaunch`** — it's public by design. Keep it that way even if tempted to show the user's name or similar.
- **Visual regression for Homepage after Slice A is the #1 risk.** Manually navigate to `/` with `HOMEPAGE_BYPASS_AUTH=true` after every change to the Countdown trio, and compare the countdown block against the existing Homepage screenshot.
