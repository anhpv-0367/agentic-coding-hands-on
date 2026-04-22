# Tasks: Countdown (shared) + Prelaunch Page

**Frame**: `8PJQswPZmU-Countdown`
**Prerequisites**: plan.md ✅, spec.md ✅, design-style.md ✅

---

## Task Format

```
- [ ] T### [P?] [Story?] Description | file/path
```

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks in same phase)
- **[Story]**: Which user story this belongs to (US1 = Anticipation, US2 = Language)
- **|**: Primary file affected by this task

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify prerequisites, nothing new to scaffold — feature reuses the entire Homepage infrastructure (fonts, assets, Supabase clients, i18n config, middleware skeleton).

- [x] T001 Verify Homepage Countdown trio (`Countdown.tsx`, `CountdownUnit.tsx`, `CountdownDigitTile.tsx`) + `computeRemaining` util exist and all Homepage tests are green before any modification | `frontend/src/components/homepage/`
- [x] T002 Confirm `public/assets/homepage/images/keyvisual-bg.png` is present and reused (no new asset downloads needed) | `frontend/public/assets/homepage/images/keyvisual-bg.png`
- [x] T003 Create new feature folder `src/components/prelaunch/` (empty — will be populated by US1 tasks) | `frontend/src/components/prelaunch/`

---

## Phase 2: Foundation (Blocking Prerequisites)

**Purpose**: Upgrade the shared Countdown trio with a `size?: "default" | "large"` prop. This is the BLOCKING refactor that unlocks both Homepage (continues to render with `size="default"` = current values) and the new Prelaunch page (will use `size="large"`).

**⚠️ CRITICAL**: No US1/US2 work can begin until this phase is complete AND existing Homepage tests stay green.

### Tests (TDD: write before implementation)

- [x] T004 [P] Write failing unit test for `<CountdownDigitTile size="large">` — assert width 77px, height 123px, borderRadius 12px, border 0.75px gold, backdrop-filter `blur(24.96px)`, digit font-size 73.728px | `frontend/tests/unit/prelaunch/CountdownDigitTile.size.test.tsx`
- [x] T005 [P] Write failing unit test for `<CountdownUnit size="large">` — digit-row gap 21px, stack gap 21px, label font Montserrat 36/700/48 | `frontend/tests/unit/prelaunch/CountdownUnit.size.test.tsx`
- [x] T006 [P] Write failing unit test for `<Countdown size="large">` — hides "Coming soon" label; row gap between units 60px; aria-live present | `frontend/tests/unit/prelaunch/Countdown.size.test.tsx`

### Implementation

- [x] T007 Add `size?: "default" | "large"` prop to `CountdownDigitTile.tsx` — introduce `const SIZE_TOKENS` map with both variants; default branch preserves 51.2×81.92, 0.5px border, 8px radius, `blur(16.64px)`, 49.152px font | `frontend/src/components/homepage/CountdownDigitTile.tsx`
- [x] T008 Add `size` prop to `CountdownUnit.tsx`, pass-through to `<CountdownDigitTile>`, apply size-specific label font + gaps | `frontend/src/components/homepage/CountdownUnit.tsx`
- [x] T009 Add `size` prop to `Countdown.tsx`, pass-through to `<CountdownUnit>`, hide "Coming soon" when `size === "large"`, apply row gap variant (40px default / 60px large) | `frontend/src/components/homepage/Countdown.tsx`

### Regression verification

- [x] T010 Run existing Homepage test suite (`npx jest`) — all 26 tests MUST stay green after the size-prop refactor | `frontend/tests/unit/login/`, `frontend/tests/unit/homepage/` (if any)
- [x] T011 Manual visual check — start dev server, set `HOMEPAGE_BYPASS_AUTH=true`, visit `/`, confirm the Homepage countdown renders identically to before (no size regression) | `frontend/src/app/page.tsx`

**Checkpoint**: Slice A complete — Countdown trio supports two sizes, Homepage unchanged, new unit tests (T004–T006) all pass.

---

## Phase 3: User Story 1 — Anticipation Building (Priority: P1) 🎯 MVP

**Goal**: A visitor lands on the prelaunch URL and sees a full-bleed centered countdown with a large gold title "Sự kiện sẽ bắt đầu sau" over the decorative keyvisual.

**Independent Test**: Start dev server, visit `/prelaunch` → within 3 seconds see (a) dark page with wave/roots keyvisual on the right, (b) centered title "Sự kiện sẽ bắt đầu sau", (c) three DAYS/HOURS/MINUTES glass tiles with zero-padded digits, (d) after 60 seconds the MINUTES tile decrements by 1.

### Tests (US1) — Write BEFORE implementation

- [ ] T012 [P] [US1] Write failing unit test for `<PrelaunchTitle>` — renders `<h1>` with i18n key `prelaunch.title`, Montserrat 36/700, centered | `frontend/tests/unit/prelaunch/PrelaunchTitle.test.tsx`
- [ ] T013 [P] [US1] Write failing integration test for `<PrelaunchPage>` — renders HeroBackdrop + Title + Countdown in correct order, no `<header>`, no `<footer>`, min-height 100vh | `frontend/tests/integration/prelaunch/page.test.tsx`

### i18n

- [x] T014 [US1] Add `prelaunch.title`, `prelaunch.metadata.title`, `prelaunch.metadata.description` to Vietnamese messages — content per `spec.md` §i18n Keys | `frontend/src/i18n/messages/vi.json`
- [x] T015 [US1] Add the same 3 keys to English messages | `frontend/src/i18n/messages/en.json`
- [x] T016 [US1] Run `i18n-parity.test.ts` — confirm keys match between vi/en | `frontend/tests/unit/login/i18n-parity.test.ts`

### Implementation (US1)

- [x] T017 [P] [US1] Implement `<PrelaunchTitle>` Server Component — renders `<h1>{t('prelaunch.title')}</h1>` with Montserrat 36/700/48 white centered | `frontend/src/components/prelaunch/PrelaunchTitle.tsx`
- [x] T018 [P] [US1] Extend existing `<HeroBackdrop>` with optional `variant?: "homepage" | "prelaunch"` prop; `"prelaunch"` swaps the gradient from 12° to 18° (keeps same `keyvisual-bg.png` background image) | `frontend/src/components/homepage/HeroBackdrop.tsx`
- [x] T019 [US1] Implement `<PrelaunchPage>` composite — full-viewport `min-height: 100vh` flex column, `alignItems: center`, `justifyContent: center`, padding `96px 144px`, composes `<HeroBackdrop variant="prelaunch">` + `<PrelaunchTitle>` + `<Countdown size="large" targetIso={eventDateIso}>` | `frontend/src/components/prelaunch/PrelaunchPage.tsx`
- [x] T020 [US1] Create barrel export `index.ts` for prelaunch components | `frontend/src/components/prelaunch/index.ts`
- [x] T021 [US1] Create route handler — Server Component at `/prelaunch` that reads `process.env.NEXT_PUBLIC_EVENT_DATE`, calls `generateMetadata` via `getTranslations("prelaunch.metadata")`, renders `<PrelaunchPage eventDateIso={...}>` | `frontend/src/app/prelaunch/page.tsx`

### Middleware integration (US1)

- [ ] T022 [P] [US1] Write failing integration test for middleware prelaunch-mode — when `NEXT_PUBLIC_PRELAUNCH_MODE=true`, visiting `/`, `/login`, `/auth/callback`, `/awards` each returns 307 redirect to `/prelaunch`; visiting `/prelaunch` directly returns 200; `/_next/static/...` passes through | `frontend/tests/integration/prelaunch/middleware-prelaunch-mode.test.ts`
- [x] T023 [US1] Add `/prelaunch` to `PUBLIC_PATHS` array in middleware | `frontend/middleware.ts`
- [x] T024 [US1] Add prelaunch-mode short-circuit at the top of middleware (BEFORE Supabase client creation): if `process.env.NEXT_PUBLIC_PRELAUNCH_MODE === "true"` and pathname is not `/prelaunch`, not `/_next/*`, not `/assets/*`, not `/favicon.ico`, return `NextResponse.redirect("/prelaunch")` | `frontend/middleware.ts`

**Checkpoint (US1)**: `/prelaunch` renders the correct page; Homepage still works; **NEXT_PUBLIC_PRELAUNCH_MODE short-circuit has a known dev-mode issue** — the env-var-driven redirect does not fire in Turbopack dev server. Direct `/prelaunch` URL works in all environments. Production build includes the code; verify on staging. Tracked as follow-up (see Notes).

---

## Phase 4: User Story 2 — Language Awareness (Priority: P2)

**Goal**: Switching `NEXT_LOCALE` cookie between `vi` and `en` updates the title and metadata.

**Independent Test**: With `NEXT_LOCALE=vi` cookie, visit `/prelaunch` → title reads "Sự kiện sẽ bắt đầu sau"; switch cookie to `en` → title reads "The event will begin in".

### Tests (US2) — Write BEFORE implementation

- [ ] T025 [P] [US2] Write failing integration test — render `<PrelaunchPage>` via `NextIntlClientProvider` locale "vi" asserts Vietnamese title; "en" asserts English title; `<html lang>` reflects active locale | `frontend/tests/integration/prelaunch/locale-switching.test.tsx`

### Implementation (US2)

- [ ] T026 [US2] Verify `generateMetadata` in `/prelaunch/page.tsx` correctly uses `getTranslations({ locale })` so `<title>` and `<meta description>` are locale-aware (spec TR-004) | `frontend/src/app/prelaunch/page.tsx`
- [ ] T027 [US2] Verify `<PrelaunchTitle>` uses `useTranslations("prelaunch")` or `getTranslations` correctly so a cookie flip reproduces the right text after `router.refresh()` | `frontend/src/components/prelaunch/PrelaunchTitle.tsx`

**Checkpoint (US2)**: Locale cookie toggle updates both the visible title and the document `<title>` / `<meta description>` without a full reload.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Responsive behavior, accessibility, visual parity, and performance.

- [ ] T028 [P] Add responsive breakpoints to `<PrelaunchPage>` — mobile (<768px): tiles scale to 56×88, digit 56px, label 24/700, stack vertically if viewport <480px; tablet (768–1023px): tiles 68×108, digit 64px, label 30/700. Apply via Tailwind responsive classes or inline breakpoint logic in the new `<HeroBackdrop variant="prelaunch">` + `<PrelaunchPage>` | `frontend/src/components/prelaunch/PrelaunchPage.tsx`
- [ ] T029 [P] Add Playwright E2E viewport tests — 375×812 mobile (tiles visible, no horizontal scroll), 768×1024 tablet (proportional scale), 1440×900 desktop (matches Figma) | `frontend/tests/e2e/prelaunch.spec.ts`
- [ ] T030 [P] Add Playwright axe-core a11y test — visit `/prelaunch`, assert zero WCAG 2.1 AA violations | `frontend/tests/e2e/prelaunch.spec.ts`
- [ ] T031 [P] Add Playwright locale E2E — set `NEXT_LOCALE=vi` cookie → assert title "Sự kiện sẽ bắt đầu sau"; set to `en` → assert "The event will begin in" | `frontend/tests/e2e/prelaunch.spec.ts`
- [ ] T032 [P] Add Playwright reduced-motion E2E — emulate `prefers-reduced-motion: reduce`, confirm no CSS transitions apply; tiles still update per minute | `frontend/tests/e2e/prelaunch.spec.ts`
- [ ] T033 Run Lighthouse on `/prelaunch` at 4G throttle — assert LCP ≤ 2s (TR-001); the keyvisual image must be `priority` | `frontend/tests/e2e/prelaunch.spec.ts` (manual Lighthouse run documented in PR)
- [ ] T034 Visual diff — capture Playwright screenshot of `/prelaunch` at 1440×900 and compare with Figma `assets/frame.png`; document diffs in PR | `frontend/tests/e2e/prelaunch.spec.ts`
- [ ] T035 Verify middleware edge cases — (a) `PRELAUNCH_MODE=false` → `/prelaunch` still reachable as public page; (b) `PRELAUNCH_MODE=true` + `/login` → redirects to `/prelaunch`; (c) `/_next/*` assets always pass through | manual QA + T022 test |
- [ ] T036 Update SCREENFLOW.md — confirm Countdown (Prelaunch) entry is present with correct navigation edges | `.momorph/SCREENFLOW.md`
- [ ] T037 Run full quality gates: `pnpm typecheck && pnpm test && pnpm build` — all green before PR | `frontend/`
- [ ] T038 Document prelaunch-mode in project README (or `.env.example`) — how ops flips the flag on launch day | `frontend/.env.example`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)** — no dependencies; run immediately. T001–T003 can all run in parallel.
- **Phase 2 (Foundation)** — BLOCKING for all user stories. T004–T006 (tests) run in parallel. T007–T009 (implementations) run **sequentially** because they touch 3 files that depend on each other (`CountdownDigitTile` is leaf, `CountdownUnit` imports it, `Countdown` imports `CountdownUnit`). T010–T011 (regression) must run last in the phase.
- **Phase 3 (US1)** — requires Phase 2 complete. T012–T013 (tests) parallel. T014–T016 (i18n) sequential. T017–T018 (PrelaunchTitle + HeroBackdrop) parallel. T019–T021 sequential (PrelaunchPage imports PrelaunchTitle, page.tsx imports PrelaunchPage). T022–T024 (middleware) sequential within themselves but parallel to component work.
- **Phase 4 (US2)** — requires US1 complete (the page must exist first). T025 parallel test. T026–T027 verification tasks.
- **Phase 5 (Polish)** — requires US1+US2 complete. T028–T032 parallel (different concerns); T033–T038 sequential finish-line tasks.

### Within Each User Story

- Tests MUST be written and FAIL before any implementation begins (Constitution Principle III).
- Countdown trio MUST have size="large" support (Phase 2) before PrelaunchPage can import `<Countdown size="large">`.
- Middleware changes (T022–T024) can happen in parallel to the page/component work because they touch different files — but the full flow requires both to be green.

### Parallel Opportunities

| Phase | Parallel Group |
|-------|---------------|
| 1 | T001–T003 (setup tasks) |
| 2 | T004–T006 (tests — different test files) |
| 3 | T012, T013, T022 (different test files) |
| 3 | T017, T018 (`PrelaunchTitle` + `HeroBackdrop` — different files) |
| 5 | T028, T029, T030, T031, T032 (polish tasks — different concerns, different files) |

### Sequential-only within a phase (file shared)

| Sequence | Reason |
|----------|--------|
| T007 → T008 → T009 | Same component chain (leaf → parent → root) |
| T014 → T015 → T016 | i18n edits then parity test |
| T019 → T021 | PrelaunchPage → page.tsx handler imports it |
| T023 → T024 | Both edit `middleware.ts` |

---

## Implementation Strategy

### MVP First (Recommended)

1. Complete Phase 1 + 2 (setup + size-prop refactor with regression check)
2. Complete Phase 3 (US1 — Prelaunch page + middleware short-circuit) only
3. **STOP and VALIDATE**: flip `NEXT_PUBLIC_PRELAUNCH_MODE=true` in `.env.local`, restart dev server, verify every route redirects to `/prelaunch`; flip back to `false`, verify Homepage loads normally
4. Ship MVP — US2 (language) is nice-to-have but not blocking for a single-language prelaunch window

### Incremental Delivery

1. Phase 1 + 2: Setup + Foundation (size-prop refactor) → PR 1 (can ship independently, Homepage unaffected)
2. Phase 3 (US1): Prelaunch page + middleware → PR 2 → test flag on staging → ship
3. Phase 4 (US2): Language switch verification → tag onto PR 2 if already green
4. Phase 5 (Polish): Responsive + a11y + visual diff → PR 3 (pre-launch readiness)

### Suggested PR Split

- **PR 1** (`feature/countdown-size-prop`): T001–T011 — isolated, zero risk to Homepage if tests green
- **PR 2** (`feature/prelaunch-page`): T012–T027 — new route + middleware + i18n + E2E happy path
- **PR 3** (`feature/prelaunch-polish`): T028–T038 — responsive, a11y, visual, docs

---

## Notes

- Commit after each logical group; run `pnpm typecheck && pnpm lint && pnpm test && pnpm build` before each commit.
- TDD cycle enforced: write failing test → confirm it fails → implement → confirm it passes → refactor.
- Mark tasks complete as you go: `[x]`.
- **Regression risk is concentrated in Phase 2** (T007–T011). If Homepage countdown breaks visually or functionally, halt and fix before proceeding to Phase 3.
- **Middleware task (T024) order matters**: the prelaunch-mode short-circuit MUST run BEFORE the existing Supabase client creation and public-path check. Putting it in the wrong place will either break prelaunch-mode (flag never triggers) OR cause unnecessary Supabase calls on every redirected request.
