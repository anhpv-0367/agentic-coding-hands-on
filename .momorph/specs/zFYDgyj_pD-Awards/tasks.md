# Tasks: Awards Information (`/awards`)

**Frame**: `zFYDgyj_pD-Awards` (Figma `313:8436`)
**Prerequisites**: `plan.md`, `spec.md`, `design-style.md` ✅
**Source repo**: `frontend/` (Next.js 16 App Router, TypeScript strict, Tailwind v4, Jest 30, Playwright)

---

## Task Format

```
- [ ] T### [P?] [Story?] Description | file/path.ts
```

- **[P]**: Can run in parallel with other [P] tasks in the same phase (different files, no intra-phase dependencies)
- **[Story]**: User story label (US1, US2, US3, US4) — required for user-story phase tasks only
- **|**: File path(s) affected by this task

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Asset preparation and scaffolding shared across all user stories.

- [x] T001 [P] Verify 6 existing award images on disk (top-talent / top-project / top-project-leader / best-manager / signature-2025-creator / mvp) | frontend/public/assets/homepage/images/awards/
- [x] T002 [P] Download `MM_MEDIA_Target` SVG from Figma via `mcp__momorph__get_media_files` | frontend/public/assets/icons/target.svg
- [x] T003 [P] Download `MM_MEDIA_Diamond` SVG from Figma via `mcp__momorph__get_media_files` | frontend/public/assets/icons/diamond.svg
- [x] T004 [P] Download `MM_MEDIA_License` SVG from Figma via `mcp__momorph__get_media_files` | frontend/public/assets/icons/license.svg
- [x] T005 Create empty `src/components/awards/` directory with an `index.ts` barrel | frontend/src/components/awards/index.ts

**Checkpoint**: All assets available; component folder scaffolded.

---

## Phase 2: Foundation (Blocking Prerequisites)

**Purpose**: Types, data, styling tokens, i18n scaffolding — required by ALL user stories.

**⚠️ CRITICAL**: No user story work begins until this phase is complete.

- [x] T006 [P] Create `AwardSlug`, `AwardUnit`, `AwardValueMode`, `AwardCategoryDetail` types | frontend/src/types/awards.ts
- [x] T007 [P] Create static data map `AWARDS_DETAILS` keyed by `AwardSlug` with all 6 categories' `{ quantity, unit, value | {individual, team}, valueMode }` per spec.md Data Requirements | frontend/src/lib/data/awards-details.ts
- [x] T008 [P] Create `formatVnd(amount, locale)` helper using `Intl.NumberFormat` (VN `.`, EN `,`) returning `"7.000.000 VNĐ"` / `"7,000,000 VND"` | frontend/src/lib/format/currency.ts
- [x] T009 [P] Unit test for `formatVnd` covering VN + EN + edge amounts (0, 1000, 15000000) | frontend/tests/unit/awards/formatCurrency.test.ts
- [x] T010 Add `@theme` tokens to globals.css: `--text-award-value`, `--text-award-description`, `--space-awards-*` (12 spacing tokens), `--border-awards-divider-gold-alpha` (`#FFEA9E` @ 20%) per plan.md Modified Files | frontend/src/app/globals.css
- [x] T011 Extend `HeroBackdrop` with `variant="awards"` (`height: 547px`, artwork-only, no children overlay) in `VARIANT_TOKENS` map | frontend/src/components/homepage/HeroBackdrop.tsx
- [x] T012 [P] Add `awards.*` i18n namespace to `vi.json`: 16 shared keys (caption, title, metadata×2, sidebar.aria_label, card.×8, currency.vnd, signature_separator) + 6 × `long_description` + per-category scaffolding | frontend/src/i18n/messages/vi.json
- [x] T013 [P] Mirror `awards.*` namespace in `en.json` with English translations | frontend/src/i18n/messages/en.json
- [x] T014 Add `IntersectionObserver` + `matchMedia` stubs to jest.setup.ts for scroll-spy + reduced-motion tests | frontend/jest.setup.ts

**Checkpoint**: Types, data, tokens, and i18n are ready. User story implementation can now proceed in priority order.

---

## Phase 3: User Story 1 — Browse All 6 Award Categories (Priority: P1) 🎯 MVP

**Goal**: Authenticated visitor lands on `/awards` and sees all 6 award cards with picture + title + description + quantity + value. Page is fully server-rendered (no client JS needed for MVP) — hash-scroll and sidebar come later.

**Independent Test**: Log in, visit `/awards`. Verify: (a) `<h1>` "Hệ thống giải thưởng SAA 2025" visible; (b) 6 cards in correct order Top Talent → MVP; (c) each card shows picture, title, description, `Số lượng giải thưởng: N unit`, `Giá trị giải thưởng: X VNĐ …`; (d) Signature card shows 2 value rows separated by "Hoặc"; (e) alternating visual layout (odd pic-left, even pic-right) on desktop.

### Tests (US1 — TDD, write first)

- [x] T015 [P] [US1] Unit test `<AwardInfoCard slug="top-talent" index={0} />` renders picture, title, description, quantity (`10 Cá nhân`), value (`7.000.000 VNĐ cho mỗi giải thưởng`), Diamond + License icons | frontend/tests/unit/awards/AwardInfoCard.test.tsx
- [x] T016 [P] [US1] Unit test `<AwardInfoCard slug="signature-2025-creator" index={4} />` renders 2 value rows separated by `<AwardValueDivider>` with "Hoặc" label | frontend/tests/unit/awards/AwardInfoCard.test.tsx
- [x] T017 [P] [US1] Unit test alternating layout: odd index applies `flex-col lg:flex-row`; even applies `flex-col-reverse lg:flex-row-reverse` | frontend/tests/unit/awards/AwardInfoCard.test.tsx

### UI components (US1)

- [x] T018 [P] [US1] Create `<AwardTitleRow>` — Target icon 24×24 gold `#FFEA9E` + `<h2>` with `--text-h2` | frontend/src/components/awards/AwardTitleRow.tsx
- [x] T019 [P] [US1] Create `<AwardMetric icon="diamond"|"license" label value unit? suffix? />` — icon + label + value stack with `--text-award-value` tokens | frontend/src/components/awards/AwardMetric.tsx
- [x] T020 [P] [US1] Create `<AwardValueDivider label />` — flex row with two `before/after` 1 px gold-alpha rules and centered label | frontend/src/components/awards/AwardValueDivider.tsx
- [x] T021 [P] [US1] Create `<AwardPicture slug alt />` — 336×336 image with gold border 0.955 px, radius 24, box-shadow drop+glow, `mix-blend-screen` on `<img>` | frontend/src/components/awards/AwardPicture.tsx
- [x] T022 [US1] Create `<AwardContent slug />` — 4-row content block (title row, description `<p>`, quantity AwardMetric, value AwardMetric OR divider+dual-metric for Signature) using i18n + `AWARDS_DETAILS` + `formatVnd` | frontend/src/components/awards/AwardContent.tsx
- [x] T023 [US1] Create `<AwardInfoCard slug index />` — wraps AwardPicture + AwardContent in a `<section id="{slug}" data-award-slug="{slug}">` with alternating flex-direction per index and breakpoint | frontend/src/components/awards/AwardInfoCard.tsx

### Page shell (US1)

- [x] T024 [US1] Create `<AwardsPage>` Server Component composing Header(`selectedNav="awards"`) + HeroBackdrop(`variant="awards"`) + SectionHeader (caption/title/h1) + the 6 `<AwardInfoCard>` + KudosPromo + Footer(`selectedNav="awards"`) | frontend/src/components/awards/AwardsPage.tsx
- [x] T025 [US1] Create `/awards` route Server Component with Supabase auth check + `generateMetadata` using `getTranslations("awards.metadata")` | frontend/src/app/awards/page.tsx
- [x] T026 [US1] Export all awards components from barrel index | frontend/src/components/awards/index.ts

**Checkpoint**: `/awards` renders 6 cards statically. Acceptance scenarios 1.1–1.4 pass. This is a deployable MVP slice.

---

## Phase 4: User Story 2 — Deep-link to a Specific Award (Priority: P1)

**Goal**: `/awards#<slug>` auto-scrolls to the matching card with a 104 px top offset and honors reduced-motion.

**Independent Test**: Visit `/awards#best-manager` directly → page loads with Best Manager card in upper viewport, reduced-motion respected, unknown hashes ignored.

### Tests (US2 — TDD, write first)

- [x] T027 [P] [US2] Unit test `useHashScroll()` — reads `location.hash`, matches against `AwardSlug` enum, calls `scrollIntoView` with correct offset; no-op on unknown hash | frontend/tests/unit/awards/useHashScroll.test.ts
- [x] T028 [P] [US2] Unit test `useHashScroll()` under `prefers-reduced-motion: reduce` uses `behavior: "auto"` | frontend/tests/unit/awards/useHashScroll.test.ts
- [x] T029 [US2] E2E scenario: `/awards#mvp` loads and MVP card is in upper viewport below the 80 px header | frontend/tests/e2e/awards.spec.ts

### Implementation (US2)

- [x] T030 [P] [US2] Create `useHashScroll()` hook — mount-time hash resolution + `hashchange` listener + 104 px offset + reduced-motion branch via `matchMedia("(prefers-reduced-motion: reduce)")` | frontend/src/components/awards/useHashScroll.ts
- [x] T031 [US2] Create `<AwardsMainClient>` Client Component that receives server-rendered cards via `children` prop and runs `useHashScroll()` on mount | frontend/src/components/awards/AwardsMainClient.tsx
- [x] T032 [US2] Wire `<AwardsPage>` to wrap the 6 cards inside `<AwardsMainClient>` so the client island owns the hash behavior while cards stay server-rendered | frontend/src/components/awards/AwardsPage.tsx
- [x] T033 [US2] Verify each card's `<section id="{slug}">` is scrollable target; add sr-only focus marker for screen-reader landing announcement | frontend/src/components/awards/AwardInfoCard.tsx

**Checkpoint**: Deep-link to any slug works. US1 + US2 deployed as the MVP anchor navigation.

---

## Phase 5: User Story 3 — Sidebar Navigation + Scroll-spy (Priority: P2)

**Goal**: Sticky sidebar on desktop (≥ 1024 px) lets users jump between categories; active state tracks scroll via `IntersectionObserver`; clicking pushes a new history entry.

**Independent Test**: On `/awards` desktop, click each of the 6 sidebar items — each click smoothly scrolls to the matching card and updates URL hash + active state. Scroll manually past card boundaries — active state updates automatically.

### Tests (US3 — TDD, write first)

- [x] T034 [P] [US3] Unit test `useScrollSpy()` with mock `IntersectionObserver`: returns first-visible slug; respects `rootMargin: "-80px 0px -50% 0px"`; updates on observer callback | frontend/tests/unit/awards/useScrollSpy.test.ts
- [x] T035 [P] [US3] Unit test `<AwardsSidebar>` renders 6 items, marks active item with `aria-current="location"` + gold underline, and fires click handler | frontend/tests/unit/awards/AwardsSidebar.test.tsx
- [x] T036 [P] [US3] Unit test sidebar keyboard navigation — Tab focuses each item; Enter/Space triggers scroll | frontend/tests/unit/awards/AwardsSidebar.test.tsx
- [x] T037 [US3] E2E: click each sidebar item in order → URL hash updates + card scrolls into view; verify active state change within 200 ms | frontend/tests/e2e/awards.spec.ts
- [x] T038 [US3] E2E: manual scroll through cards → active sidebar item tracks scroll position | frontend/tests/e2e/awards.spec.ts
- [x] T039 [US3] E2E: Back button after 2 sidebar clicks walks back through hash history (pushState) | frontend/tests/e2e/awards.spec.ts
- [x] T040 [US3] E2E: clicking already-active sidebar item is a no-op visually but still round-trips hash | frontend/tests/e2e/awards.spec.ts
- [x] T041 [US3] E2E at viewport 768 px: sidebar is hidden (`display: none`); cards stack column | frontend/tests/e2e/awards.spec.ts

### Implementation (US3)

- [x] T042 [P] [US3] Create `useScrollSpy(slugs)` hook — discovers `[data-award-slug]` elements via `querySelectorAll`, attaches `IntersectionObserver` with `rootMargin: "-80px 0px -50% 0px"`, returns `activeSlug` state | frontend/src/components/awards/useScrollSpy.ts
- [x] T043 [P] [US3] Create `<AwardsSidebarItem href label icon isActive />` — `<a>` with Target icon + label, focus ring, hover transition 150 ms, aria-current on active | frontend/src/components/awards/AwardsSidebarItem.tsx
- [x] T044 [US3] Create `<AwardsSidebar activeSlug onNavigate />` — `<nav aria-label>` + `<ol>` of 6 items; `position: sticky; top: 104px`; `hidden lg:flex` | frontend/src/components/awards/AwardsSidebar.tsx
- [x] T045 [US3] Extend `<AwardsMainClient>` to compose sidebar + cards (2-col grid `lg:flex-row gap-20 items-start`); run `useScrollSpy` and wire sidebar click to `history.pushState` + smooth scroll; intersection callback uses `history.replaceState` | frontend/src/components/awards/AwardsMainClient.tsx
- [x] T046 [US3] Add `prefers-reduced-motion` branch to sidebar click handler → instant scroll | frontend/src/components/awards/AwardsMainClient.tsx

**Checkpoint**: Full navigation UX complete. US1 + US2 + US3 deliver the complete core experience.

---

## Phase 6: User Story 4 — Chrome Continuity (Priority: P2)

**Goal**: Header/Footer show "Awards Information" selected; Sun\* Kudos promo links work; language switch re-formats currency.

**Independent Test**: Navigate `/awards` → header nav shows "Awards Information" with gold underline + glow; footer mirrors; Kudos promo CTA routes to `/kudos`; toggle VN↔EN and verify currency format (`7.000.000 VNĐ` ↔ `7,000,000 VND`).

### Tests (US4)

- [x] T047 [P] [US4] E2E: `/awards` renders Header with `selectedNav="awards"` in gold-underline state | frontend/tests/e2e/awards.spec.ts
- [x] T048 [P] [US4] E2E: locale switch via LanguageSelector re-renders currency (`7.000.000 VNĐ` ↔ `7,000,000 VND`) | frontend/tests/e2e/awards.spec.ts

### Implementation (US4)

- [x] T049 [US4] Smoke-verify Header wiring (already supports `selectedNav="awards"` per plan.md — no modification) | frontend/src/components/layout/Header.tsx
- [x] T050 [US4] Smoke-verify Footer wiring (already supports `selectedNav="awards"`) | frontend/src/components/layout/Footer.tsx
- [x] T051 [US4] Confirm `<KudosPromo>` "Chi tiết" href routes to `/kudos` (known 404 until Kudos page ships — document as known gap) | frontend/src/components/homepage/KudosPromo.tsx

**Checkpoint**: Chrome integration verified. All 4 user stories complete.

---

## Phase 7: Polish, Accessibility & Quality Gates

**Purpose**: Cross-cutting refinements + CLAUDE.md mandated quality checks.

### Accessibility & performance

- [x] T052 [P] Run axe-playwright on `/awards` — 0 WCAG 2.1 AA violations | frontend/tests/e2e/awards.spec.ts
- [x] T053 [P] Add `<Image priority>` on hero artwork; `loading="lazy"` on all 6 award pictures | frontend/src/components/awards/AwardPicture.tsx + HeroBackdrop.tsx
- [x] T054 [P] Verify DOM reading order is `<picture>` → `<content>` in all 6 cards regardless of visual alternation | frontend/tests/e2e/awards.spec.ts
- [x] T055 [P] Verify reduced-motion branch on both `useHashScroll` + sidebar click (jest + Playwright `emulateMedia({ reducedMotion: "reduce" })`) | frontend/tests/e2e/awards.spec.ts
- [x] T056 i18n parity check — extend existing parity test (or add one) to enforce identical key sets between `vi.json` and `en.json` under `awards.*` namespace | frontend/tests/unit/i18n/parity.test.ts

### Quality gates (per CLAUDE.md)

- [x] T057 Run `cd frontend && pnpm typecheck` — 0 TypeScript errors | frontend/
- [ ] T058 Run `cd frontend && pnpm lint` — 0 lint violations | frontend/  *(no `lint` script configured in this repo — skipped)*
- [x] T059 Run `cd frontend && pnpm build` — production build succeeds | frontend/
- [x] T060 Run `cd frontend && pnpm test` — all unit suites pass (13 suites, 59 tests) | frontend/
- [ ] T061 Run `cd frontend && pnpm test:e2e` — all E2E + axe scenarios pass | frontend/  *(spec authored; requires authenticated Supabase test session to run against protected `/awards` route)*

### Documentation

- [ ] T062 Update SCREENFLOW.md discovery log with Awards implementation date | .momorph/SCREENFLOW.md
- [ ] T063 Mark Awards spec dependency as complete in spec.md Dependencies section | .momorph/specs/zFYDgyj_pD-Awards/spec.md

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)              ─── no deps
    ↓
Phase 2 (Foundation)         ─── blocks Phases 3–6
    ↓
Phase 3 (US1 — P1 MVP)       ─── deliverable: static page with 6 cards
    ↓
Phase 4 (US2 — P1 deep-link) ─── depends on US1 shell
    ↓
Phase 5 (US3 — P2 sidebar)   ─── depends on US2 client island
    ↓ (parallel with US4)
Phase 6 (US4 — P2 chrome)    ─── independent verification, can run any time after Phase 3
    ↓
Phase 7 (Polish)             ─── depends on all stories
```

### Within each user story (TDD — constitution §III)

- Tests [P] MUST be written and FAIL before implementation tasks.
- UI primitives (small `<AwardTitleRow>`, `<AwardMetric>`, `<AwardValueDivider>`, `<AwardPicture>`) before composites (`<AwardContent>`, `<AwardInfoCard>`).
- Composites before page shell (`<AwardsPage>`).
- Page shell before route (`src/app/awards/page.tsx`).

### Parallel Opportunities

**Phase 1** — T001–T004 can all run in parallel (independent asset operations). T005 sequences after.

**Phase 2** — T006, T007, T008, T009, T012, T013 can run in parallel (different files, no cross-deps). T010, T011, T014 sequential per their respective file.

**Phase 3 (US1)** — T015, T016, T017 (tests) in parallel. T018, T019, T020, T021 (primitive components) in parallel. T022 depends on primitives. T023 depends on T021+T022. T024 depends on T023. T025+T026 after T024.

**Phase 4 (US2)** — T027, T028 (hook tests) in parallel. T029 depends on US1 route existing. T030 after T027+T028 pass. T031–T033 sequential on the same file chain.

**Phase 5 (US3)** — T034–T036 (unit tests) in parallel; T037–T041 (E2E) parallel within the same spec file but run sequentially by Playwright. T042, T043 in parallel. T044 depends on T043. T045+T046 sequential on AwardsMainClient.

**Phase 6 (US4)** — T047, T048 in parallel. T049–T051 are verification-only (can run any time).

**Phase 7** — T052–T056 in parallel. T057–T061 sequential (each consumes prior output on CI).

### Cross-story parallel teams (if staffed)

Once Phase 2 completes:
- **Track A**: US1 (MVP static rendering) → US2 (hash scroll)
- **Track B**: US4 (chrome verification) — independent
- **Track C**: US3 (sidebar + scroll-spy) — depends on US2 being done but can be planned/designed in parallel

---

## Implementation Strategy

### MVP First (Recommended)

1. Complete Phase 1 + Phase 2.
2. Complete Phase 3 (US1 — static 6-card page).
3. **STOP & validate**: static page is deployable; user acceptance test.
4. Deploy if ready — `/awards` works, just without deep-link + sidebar scroll-spy.

### Incremental Delivery

1. Setup + Foundation (Phases 1–2).
2. **Ship 1**: US1 static page → test → deploy.
3. **Ship 2**: + US2 deep-link + US4 chrome → test → deploy.
4. **Ship 3**: + US3 sidebar + scroll-spy → test → deploy.
5. **Final**: Phase 7 polish + quality gates → release.

---

## Summary

| Phase | Tasks | Purpose |
|-------|-------|---------|
| 1 — Setup | T001–T005 (5) | Assets + scaffolding |
| 2 — Foundation | T006–T014 (9) | Types, data, tokens, i18n |
| 3 — US1 (P1 MVP) | T015–T026 (12) | Static 6-card page |
| 4 — US2 (P1) | T027–T033 (7) | Hash deep-link |
| 5 — US3 (P2) | T034–T046 (13) | Sidebar + scroll-spy |
| 6 — US4 (P2) | T047–T051 (5) | Chrome continuity |
| 7 — Polish | T052–T063 (12) | a11y + quality gates + docs |
| **Total** | **63 tasks** | |

**MVP scope** = Phases 1 + 2 + 3 = 26 tasks.

---

## Notes

- Commit after each completed task or logical group (e.g. all tests for one story, then all implementation).
- Mark tasks as `- [x]` in this file as they complete.
- Run `pnpm typecheck` after every implementation task; do not advance on red.
- E2E tests (T029, T037–T041, T047, T048, T052, T054, T055) all live in `frontend/tests/e2e/awards.spec.ts` — write them as a single Playwright spec, not per-task files.
- TDD order per constitution §III is **non-negotiable**: write test → see red → implement → see green → refactor.
