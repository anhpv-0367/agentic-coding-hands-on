# Tasks: Sun* Kudos – Live Board (`/kudos`)

**Frame**: `MaZUn5xHXZ-KudosLiveBoard` (Figma `2940:13431`)
**Prerequisites**: `spec.md`, `design-style.md`, `plan.md` ✅
**Source repo**: `frontend/` (Next.js 16 App Router, TypeScript strict, Tailwind v4, React 19, Jest 30, Playwright) + `supabase/` (new migrations)

---

## Task Format

```
- [ ] T### [P?] [Story?] Description | file/path.ts
```

- **[P]**: Can run in parallel with other [P] tasks in the same phase (different files, no intra-phase dependencies)
- **[Story]**: User story label (US1…US8) — required for user-story phase tasks only
- **|**: File path(s) affected by this task

---

## Resolved Decisions (2026-04-22)

- **D-plan-1**: ✅ `zod` approved — added to package.json (T019).
- **D-plan-2**: ✅ Build Supabase backend immediately — Phase 2 includes migrations + real Supabase integration, NO fixtures-first stubs. Route Handlers call Supabase SDK from day 1.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Asset preparation and scaffolding shared across all user stories.

- [x] T001 Create `src/components/kudos/` directory + placeholder `index.ts` barrel | frontend/src/components/kudos/index.ts
- [x] T002 Create `src/lib/kudos/` directory for pure modules | frontend/src/lib/kudos/
- [x] T003 [P] Verify existing shared icons from Awards batch (target, diamond, license) at `public/assets/icons/` — confirm which of `pen.svg`, `search.svg` need re-download | frontend/public/assets/icons/
- [x] T004 [P] Download `MM_MEDIA_Heart` SVG via `mcp__momorph__get_media_files` (screenId=MaZUn5xHXZ) | frontend/public/assets/kudos/heart.svg
- [x] T005 [P] Download `MM_MEDIA_Link` SVG | frontend/public/assets/kudos/link.svg
- [x] T006 [P] Download `MM_MEDIA_Open Gift` SVG | frontend/public/assets/kudos/open-gift.svg
- [x] T007 [P] Download `MM_MEDIA_Send` SVG | frontend/public/assets/kudos/send.svg
- [x] T008 [P] Download `MM_MEDIA_Down` SVG as `chevron-down.svg` | frontend/public/assets/icons/chevron-down.svg
- [x] T009 [P] Download `MM_MEDIA_Pen` SVG (if not already present from Awards) | frontend/public/assets/icons/pen.svg
- [x] T010 [P] Download `MM_MEDIA_Search` SVG (if not already present) | frontend/public/assets/icons/search.svg
- [x] T011 [P] Download `MM_MEDIA_New Hero` SVG | frontend/public/assets/kudos/tier-new.svg
- [x] T012 [P] Download `MM_MEDIA_Rising Hero` SVG | frontend/public/assets/kudos/tier-rising.svg
- [x] T013 [P] Download `MM_MEDIA_Super Hero` SVG | frontend/public/assets/kudos/tier-super.svg
- [x] T014 [P] Download `MM_MEDIA_Legend Hero` SVG | frontend/public/assets/kudos/tier-legend.svg
- [x] T015 [P] Download `MM_MEDIA_Kudos logo` PNG → SAA 2025 KUDOS wordmark | frontend/public/assets/kudos/saa-kudos-wordmark.png
- [x] T016 [P] Download `MM_MEDIA_KV Background` PNG → hero backdrop | frontend/public/assets/kudos/kv-background.png
- [x] T017 Tint downloaded SVGs (heart, link, open-gift, send, tier-*, chevron-down) — replace `fill="white"` → `fill="#FFEA9E"` where appropriate; heart.svg stays `fill="#999999"` (active state tinted via CSS) | frontend/public/assets/kudos/*.svg + frontend/public/assets/icons/*.svg
- [x] T018 Add `@theme` tokens to `globals.css` — 5 new colors (`--color-bg-kudos-card`, `--color-text-tag-red`, `--color-text-meta`, `--color-text-user-pink`, `--color-border-bronze`, `--color-text-meta-on-card`), 6 new typography tokens, 14 new spacing tokens, 3 radii, 3 borders, 1 focus-ring shadow per design-style.md §Design Tokens | frontend/src/app/globals.css
- [x] T019 Add `zod` to package.json (pending Q1 approval) | frontend/package.json

**Checkpoint**: All assets on disk, folders scaffolded, tokens added to theme, zod confirmed.

---

## Phase 2: Foundation (Blocking Prerequisites)

**Purpose**: Types, data, i18n, fixtures, pure modules, Route Handler stubs — required by ALL user stories.

**⚠️ CRITICAL**: No user story work begins until this phase is complete.

### Types + i18n

- [x] T020 [P] Create entity types (`Kudo`, `UserRef`, `KudoTier`, `KudosStats`, `LeaderboardEntry`, `SpotlightNode`, `GiftBoxReward`) using `type` not `interface` | frontend/src/types/kudos.ts
- [x] T021 [P] Add `kudos.*` i18n namespace to `vi.json` — 45 keys per spec.md §Data Requirements | frontend/src/i18n/messages/vi.json
- [x] T022 [P] Mirror `kudos.*` namespace in `en.json` with English translations | frontend/src/i18n/messages/en.json
- [x] T023 [P] Create dev seed data (50 sample Kudos, 10 users with varied tiers, 118-entry spotlight seed) for local Supabase `supabase db reset` | supabase/seeds/dev/kudos_seed.sql

### Supabase migrations (apply via `supabase db reset` locally; Supabase SDK after)

- [x] T024 Create migrations directory + first migration: `kudos`, `kudo_attachments`, `kudo_reactions` tables + RLS policies (SELECT any-auth; INSERT sender/reactor self; DELETE owner) | supabase/migrations/20260422_01_kudos_tables.sql
- [x] T025 Create migration: `user_kudo_stats` table + trigger fns `update_user_stats_on_kudo()` + `update_user_stats_on_reaction()` + tier-advance logic granting `secret_boxes` row on upgrade + `tier_change_events` log table | supabase/migrations/20260422_02_user_stats.sql
- [x] T026 Create migration: `secret_boxes` table + RLS (self-only) + `open_next_box()` RPC returning reward payload | supabase/migrations/20260422_03_secret_boxes.sql
- [x] T027 Create migration: RPCs for read-heavy queries — `get_kudos_highlights_7d()`, `get_spotlight_feed(limit)`, `get_tier_upgrades_leaderboard(limit)`, `get_gift_recipients_leaderboard(limit)`, `list_kudos_paginated(cursor, limit, hashtag?, department?)`, `get_distinct_hashtags_and_departments()` | supabase/migrations/20260422_04_kudos_functions.sql
- [x] T028 Create migration: Storage bucket `kudos-attachments` with RLS (public-read, owner-write on own folder) + max size policy | supabase/migrations/20260422_05_kudos_storage.sql
- [x] T029 Run `supabase db reset` locally to verify migrations + seed data + RLS work end-to-end | supabase/

### Pure modules (TDD — tests first)

- [x] T030 [P] Unit test for `computeTier(received: number): KudoTier` — thresholds `new 0–9`, `rising 10–29`, `super 30–99`, `legend ≥100` (must match SQL trigger logic in T025) | frontend/tests/unit/kudos/tier.test.ts
- [x] T031 [P] Unit test for `layoutNodes(nodes, bounds): PlacedNode[]` — deterministic output, no overlaps, within bounds, stable across re-calls | frontend/tests/unit/kudos/spotlight-layout.test.ts
- [x] T032 Implement `computeTier` pure fn to pass T030 | frontend/src/lib/kudos/tier.ts
- [x] T033 Implement `layoutNodes` hand-rolled pack-layout (seeded concentric rings + AABB collision) to pass T031 | frontend/src/lib/kudos/spotlight-layout.ts

### Validation + service layer

- [x] T034 [P] Define Zod schemas for POST/DELETE bodies + query params (`CreateKudoSchema`, `ReactionSchema`, `UploadSchema`, `KudosListQuerySchema`, `SunnerSearchSchema`) | frontend/src/lib/services/kudos-validation.ts
- [x] T035 Create typed client `fetch()` helpers for 13 endpoints — returns parsed + typed responses, throws typed errors | frontend/src/lib/services/kudos-service.ts

### Backend — Route Handlers (real Supabase integration)

Every Route Handler: Supabase SSR client via `createClient()`; auth guard (`auth.getUser()`); Zod validation for writes; typed JSON response; error codes per spec (401/403/404/409/500).

- [x] T036 [P] `GET /api/kudos/highlights` — calls `rpc("get_kudos_highlights_7d")` | frontend/src/app/api/kudos/highlights/route.ts
- [x] T037 [P] `GET /api/kudos` — calls `rpc("list_kudos_paginated")`; `POST /api/kudos` — validates with `CreateKudoSchema` + inserts into `kudos` + `kudo_attachments` | frontend/src/app/api/kudos/route.ts
- [x] T038 [P] `GET /api/kudos/[id]` — SELECT single Kudo with joined attachments | frontend/src/app/api/kudos/[id]/route.ts
- [x] T039 [P] `POST` + `DELETE /api/kudos/[id]/reactions` — unique-constraint handles duplicates (returns 409 or idempotent no-op); triggers handle stats updates | frontend/src/app/api/kudos/[id]/reactions/route.ts
- [x] T040 [P] `GET /api/kudos/spotlight-feed` — calls `rpc("get_spotlight_feed", limit)`; returns `{ total, nodes[] }` | frontend/src/app/api/kudos/spotlight-feed/route.ts
- [x] T041 [P] `GET /api/kudos/stats/me` — SELECT from `user_kudo_stats` WHERE user_id = auth.uid() | frontend/src/app/api/kudos/stats/me/route.ts
- [x] T042 [P] `GET /api/kudos/leaderboard/tier-upgrades` — calls `rpc("get_tier_upgrades_leaderboard", 10)` | frontend/src/app/api/kudos/leaderboard/tier-upgrades/route.ts
- [x] T043 [P] `GET /api/kudos/leaderboard/gift-recipients` — calls `rpc("get_gift_recipients_leaderboard", 10)` | frontend/src/app/api/kudos/leaderboard/gift-recipients/route.ts
- [x] T044 [P] `GET /api/kudos/filters` — calls `rpc("get_distinct_hashtags_and_departments")` | frontend/src/app/api/kudos/filters/route.ts
- [x] T045 [P] `GET /api/sunners?search=` — SELECT users WHERE display_name ILIKE `%search%` LIMIT 10 (RLS allows read on public profile fields) | frontend/src/app/api/sunners/route.ts
- [x] T046 [P] `POST /api/uploads` — multipart body validated by `UploadSchema` (MIME + size); uses Supabase Storage client `supabase.storage.from("kudos-attachments").upload(...)`; returns `{ url }` via `getPublicUrl()` | frontend/src/app/api/uploads/route.ts
- [x] T047 [P] `POST /api/users/me/boxes/next/open` — calls `rpc("open_next_box")` for atomic grant+mark-opened; returns reward payload | frontend/src/app/api/users/me/boxes/next/open/route.ts

### Route Handler integration tests

- [x] T048 [P] Integration test — unauthenticated `GET /api/kudos/highlights` returns 401 | frontend/tests/integration/kudos/api-auth.test.ts
- [x] T049 [P] Integration test — `POST /api/kudos/:id/reactions` idempotent (2nd call returns 409 or no-op) | frontend/tests/integration/kudos/api-reactions.test.ts
- [x] T050 [P] Integration test — `POST /api/uploads` rejects >5 MB + non-image MIME | frontend/tests/integration/kudos/api-uploads.test.ts

### Jest setup

- [x] T051 Verify `jest.setup.ts` has `IntersectionObserver` + `matchMedia` stubs (from Awards work); add `navigator.clipboard.writeText` mock helper for clipboard tests; add Supabase client mock helper for Route Handler integration tests | frontend/jest.setup.ts

### Shared UI primitives (cross-feature)

- [x] T052 [P] Unit test for `<Dialog>` — focus-trap cycles, ESC closes, backdrop click closes, body-scroll-lock applies | frontend/tests/unit/kudos/Dialog.test.tsx
- [x] T053 [P] Unit test for `<Toast>` + `<ToastProvider>` — queue, auto-dismiss 2.5 s, `role="status"` + `aria-live="polite"` | frontend/tests/unit/kudos/Toast.test.tsx
- [x] T054 [P] Unit test for `<Lightbox>` — open/close, ESC, focus-trap, body-scroll-lock | frontend/tests/unit/kudos/Lightbox.test.tsx
- [x] T055 Implement `<Dialog>` shared primitive to pass T052 | frontend/src/components/ui/Dialog.tsx
- [x] T056 Implement `<Toast>` + `<ToastProvider>` to pass T053 | frontend/src/components/ui/Toast.tsx + frontend/src/components/ui/ToastProvider.tsx
- [x] T057 Implement `<Lightbox>` to pass T054 | frontend/src/components/ui/Lightbox.tsx

### Generic hooks (cross-feature)

- [x] T058 [P] Unit test for `useClipboard` — success + permission-denied fallback | frontend/tests/unit/kudos/useClipboard.test.ts
- [x] T059 [P] Unit test for `usePolling` — `visibilitychange` pause, 3-fail backoff, `setInterval` cleanup on unmount | frontend/tests/unit/kudos/usePolling.test.ts
- [x] T060 [P] Implement `useClipboard` hook to pass T058 | frontend/src/hooks/useClipboard.ts
- [x] T061 [P] Implement `useDebouncedValue<T>(value, delay): T` hook | frontend/src/hooks/useDebouncedValue.ts
- [x] T062 [P] Implement `usePolling` hook to pass T059 | frontend/src/hooks/usePolling.ts
- [x] T063 [P] Implement `useIntersection` hook (for load-more trigger) | frontend/src/hooks/useIntersection.ts
- [x] T064 [P] Implement `useUrlState` hook (sync state ↔ URL search params, `replaceState`-based) | frontend/src/hooks/useUrlState.ts

**Checkpoint**: Types, i18n, seeds, migrations applied + verified, pure modules, 12 Supabase-backed Route Handlers, shared primitives, hooks all ready. User stories can proceed.

---

## Phase 3: User Story 1 — Browse Highlight Kudos Carousel (Priority: P1) 🎯 MVP

**Goal**: Authenticated visitor lands on `/kudos` and sees 5-card HIGHLIGHT KUDOS carousel (7-day window, ordered by heart count desc), active-center + faded-sides, prev/next arrows with disabled-at-bounds, `N/5` counter.

**Independent Test**: Log in, visit `/kudos`. Verify (a) 5 cards loaded, (b) slide 1 active-center with neighbors faded, (c) clicking next advances, (d) left arrow disabled at slide 1, right arrow disabled at slide 5, (e) each card shows sender/recipient/message/quantity/value rows.

### Tests (US1 — TDD, write first)

- [x] T065 [P] [US1] Unit test `<KudosHighlightCard>` renders sender/recipient/avatars/timestamp/primary-hashtag-chip/body-3-line-clamp/hashtag-clamp/heart/copy-link | frontend/tests/unit/kudos/KudosHighlightCard.test.tsx
- [x] T066 [P] [US1] Unit test `<KudosHighlightsCarousel>` slide index + active-center transform + disabled prev at 0 / disabled next at N-1 | frontend/tests/unit/kudos/KudosHighlightsCarousel.test.tsx
- [x] T067 [P] [US1] Unit test `<KudosCarouselControls>` counter format `{current}/{total}` + aria-disabled states | frontend/tests/unit/kudos/KudosCarouselControls.test.tsx
- [x] T068 [P] [US1] Unit test `<TierBadge>` renders 4 variants (new/rising/super/legend) with correct label + color | frontend/tests/unit/kudos/TierBadge.test.tsx

### UI primitives (US1)

- [x] T069 [P] [US1] Create `<TierBadge tier={…}>` — pill chip with 4 variant styles per design-style.md §Tier Badges | frontend/src/components/kudos/TierBadge.tsx
- [x] T070 [P] [US1] Create `<KudoAvatarPair sender recipient>` — 2 avatars + Send arrow icon | frontend/src/components/kudos/KudoAvatarPair.tsx
- [x] T071 [P] [US1] Create `<KudoAuthors kudo>` — composes `<KudoAvatarPair>` + names + tier badges + timestamp | frontend/src/components/kudos/KudoAuthors.tsx
- [x] T072 [P] [US1] Create `<KudoHashtags hashtags clamp={false\|true}>` — hashtag pills, red `#D4271D`; optional 1-line clamp with `...` | frontend/src/components/kudos/KudoHashtags.tsx

### Card + carousel (US1)

- [x] T073 [US1] Create `<KudosHighlightCard kudo isActive>` — dark bg, white body (20/700/32 clamp 3 lines), hashtag row clamp 5, category chip from `kudo.hashtags[0]`, action row placeholder (heart/copy-link placeholder until US2) | frontend/src/components/kudos/KudosHighlightCard.tsx
- [x] T074 [US1] Create `<KudosHighlightsCarousel kudos activeIndex onPrev onNext>` — scroll-snap, transform-based active-center + side-fade | frontend/src/components/kudos/KudosHighlightsCarousel.tsx
- [x] T075 [US1] Create `<KudosCarouselControls current total onPrev onNext>` — prev/next buttons + counter | frontend/src/components/kudos/KudosCarouselControls.tsx

### Section + page shell (US1)

- [x] T076 [US1] Create `<KudosHighlightsSection highlights>` — section header (caption + h2 "HIGHLIGHT KUDOS") + filter bar placeholder + carousel + controls; manages `currentSlide` local state | frontend/src/components/kudos/KudosHighlightsSection.tsx
- [x] T077 [US1] Create `<KudosHero>` — hero backdrop (background image + gradient overlay) + visually-hidden h1 "Sun\* Kudos – Bảng ghi nhận" + SAA 2025 KUDOS wordmark img (decorative, `aria-hidden`) + subtitle | frontend/src/components/kudos/KudosHero.tsx
- [x] T078 [US1] Create `<KudosPage user>` Server Component shell composing SkipLink + Header(`selectedNav="kudos"`) + Hero + `<KudosPageClient>` + Footer(`variant="minimal"`); parallel fetches highlights/allKudos/spotlight/stats/leaderboards/filters | frontend/src/components/kudos/KudosPage.tsx
- [x] T079 [US1] Create `<KudosPageClient>` top-level client island (for now: receives `initialHighlights` + renders `<KudosHighlightsSection>` child) | frontend/src/components/kudos/KudosPageClient.tsx
- [x] T080 [US1] Create `/kudos` route Server Component with Supabase auth check + `generateMetadata` using `getTranslations("kudos.metadata")` | frontend/src/app/kudos/page.tsx
- [x] T081 [US1] Export T069–T079 components from barrel index | frontend/src/components/kudos/index.ts

**Checkpoint**: `/kudos` renders with hero + 5-card highlight carousel, no interactivity beyond prev/next yet. Acceptance scenarios 1.1–1.6 pass.

---

## Phase 4: User Story 2 — React to Kudos & Copy Share Link (Priority: P1)

**Goal**: From any Kudo card, user can tap heart (optimistic + rollback + 500 ms debounce) or copy-link (clipboard + toast "Link copied — ready to share!").

**Independent Test**: On `/kudos`, click heart → red fill + count++; click again → gray + count--. Click "Copy Link" → clipboard holds canonical URL + toast shown.

### Tests (US2 — TDD)

- [x] T082 [P] [US2] Unit test `<HeartButton>` — optimistic toggle, rollback on server 500, 500 ms debounce (rapid clicks coalesce), `aria-pressed` attribute | frontend/tests/unit/kudos/HeartButton.test.tsx
- [x] T083 [P] [US2] Unit test `<CopyLinkButton>` — writes canonical URL to clipboard, fires toast; permission-denied path shows fallback UI | frontend/tests/unit/kudos/CopyLinkButton.test.tsx
- [x] T084 [P] [US2] Integration test reaction-flow — heart toggle on highlight card fires `POST /api/kudos/:id/reactions`, second tap fires `DELETE`, 500 error triggers rollback + toast | frontend/tests/integration/kudos/reaction-flow.test.tsx

### Implementation (US2)

- [x] T085 [P] [US2] Create `<HeartButton kudoId heartCount likedByMe>` — uses service `addReaction`/`removeReaction`; optimistic update via `useState`; `useRef` timestamp for 500 ms debounce; scale-bounce animation on like (disabled under reduced-motion) | frontend/src/components/kudos/HeartButton.tsx
- [x] T086 [P] [US2] Create `<CopyLinkButton kudoId>` — uses `useClipboard` hook; on success enqueues toast via `useToast` | frontend/src/components/kudos/CopyLinkButton.tsx
- [x] T087 [US2] Create `<KudoActionRow kudo variant="highlight"\|"post">` — composes HeartButton + CopyLinkButton + "Xem chi tiết" link → `/kudos/{id}` | frontend/src/components/kudos/KudoActionRow.tsx
- [x] T088 [US2] Wire `<ToastProvider>` at `<KudosPageClient>` root; wire `<KudoActionRow>` into `<KudosHighlightCard>` (replace action row placeholder) | frontend/src/components/kudos/KudosPageClient.tsx + frontend/src/components/kudos/KudosHighlightCard.tsx

**Checkpoint**: Heart + copy-link work on highlight cards with toast + optimistic UI + debounce.

---

## Phase 5: User Story 3 — Browse & Load-more All Kudos List (Priority: P1)

**Goal**: Below Spotlight (or temporarily below highlights until Phase 6), paginated list of full post cards (680×749) with cursor pagination + infinite scroll + lightbox on image click.

**Independent Test**: On `/kudos`, scroll past highlights → 10 post cards render; scroll near bottom → next 10 append; clicking image opens lightbox.

### Tests (US3 — TDD)

- [x] T089 [P] [US3] Unit test `<KudosPostCard>` renders full body (no clamp), up to 5 images in grid, full hashtag list, action row | frontend/tests/unit/kudos/KudosPostCard.test.tsx
- [x] T090 [P] [US3] Unit test `<KudoImageGrid>` — 1/2/3/4/5 image grid layouts; `onError` falls back to "Đang tải…" placeholder + retry-on-click | frontend/tests/unit/kudos/KudoImageGrid.test.tsx
- [x] T091 [P] [US3] Unit test `<KudosList>` — initial items render; `useIntersection` at 200-px offset triggers next-page fetch; empty state when `items.length === 0`; no-more when `next_cursor === null` | frontend/tests/unit/kudos/KudosList.test.tsx

### Implementation (US3)

- [x] T092 [P] [US3] Create `<KudoImageGrid images>` — CSS grid, `loading="lazy"`, `onError` fallback, click opens `<Lightbox>` with image index | frontend/src/components/kudos/KudoImageGrid.tsx
- [x] T093 [P] [US3] Create `<KudosPostCard kudo>` — cream `#FFF8E1` bg, 40-40-16 padding, 24-px radius, full body (20/700/32 no clamp, `#00101A`), image grid, divider, action row | frontend/src/components/kudos/KudosPostCard.tsx
- [x] T094 [US3] Create `<KudosList initialItems initialCursor>` — local state for items + cursor; `useIntersection` triggers next-page via `kudos-service.listKudos(cursor, filters)`; renders `<KudosPostCard>` per item; shows "Xem thêm" button for manual fallback; empty/no-more states | frontend/src/components/kudos/KudosList.tsx
- [x] T095 [US3] Wire `<KudosList>` into `<KudosPageClient>` below highlights section | frontend/src/components/kudos/KudosPageClient.tsx
- [x] T096 [US3] Update `<KudosPage>` parallel fetch to include first-page `/api/kudos?limit=10` + pass to `<KudosList>` as `initialItems` | frontend/src/components/kudos/KudosPage.tsx

**Checkpoint**: Highlight carousel + paginated All Kudos list both working.

---

## Phase 6: User Story 4 — Real-time Spotlight Feed (Priority: P2)

**Goal**: Spotlight Board shows a word-cloud of up to 118 recipient name-nodes; polls every 30 s; supports hover tooltip + click-to-detail + pan + zoom + search-highlight.

**Independent Test**: Visit `/kudos`, observe Spotlight Board. Hover a node → tooltip. Click node → navigates. Type in spotlight search → matching nodes highlight, others fade. Drag canvas → pans. Scroll-wheel → zooms (clamped).

### Tests (US4 — TDD)

- [x] T097 [P] [US4] Unit test `<KudosSpotlightBoard>` — renders nodes at positions from `layoutNodes`; hover shows tooltip; click navigates via `router.push`; polling mock ticks update counter + merge new nodes | frontend/tests/unit/kudos/KudosSpotlightBoard.test.tsx
- [x] T098 [P] [US4] Unit test `<KudosSpotlightSearch>` — debounced 200 ms via `useDebouncedValue`; emits `onChange` with query; `aria-label` set | frontend/tests/unit/kudos/KudosSpotlightSearch.test.tsx
- [x] T099 [P] [US4] Unit test pan/zoom helpers — pointer-down/move/up sequence updates `{ x, y }`; wheel updates `scale` clamped `[0.5, 2.0]`; `touch-action: none` set on canvas | frontend/tests/unit/kudos/spotlight-panzoom.test.ts

### Implementation (US4)

- [x] T100 [P] [US4] Create `<KudosSpotlightSearch onQueryChange>` — pill input with search icon, debounced output | frontend/src/components/kudos/KudosSpotlightSearch.tsx
- [x] T101 [US4] Create `<KudosSpotlightBoard initialNodes initialTotal>` client component — layouts nodes via `layoutNodes`, polls every 30 s via `usePolling`, renders absolutely-positioned node labels, pan via pointer events, zoom via wheel, search-highlight via `spotlightHighlight: Set<string>`, tooltip on hover, click to navigate to `/kudos/:id`, reduced-motion respected | frontend/src/components/kudos/KudosSpotlightBoard.tsx
- [x] T102 [US4] Add keyboard navigation to Spotlight — arrow keys cycle focus through nodes (`aria-activedescendant`), Enter opens detail; tooltips connected via `aria-describedby` | frontend/src/components/kudos/KudosSpotlightBoard.tsx
- [x] T103 [US4] Wire `<KudosSpotlightBoard>` into `<KudosPageClient>` between Highlights and All Kudos list | frontend/src/components/kudos/KudosPageClient.tsx
- [x] T104 [US4] Update `<KudosPage>` parallel fetch to include `/api/kudos/spotlight-feed?limit=118` | frontend/src/components/kudos/KudosPage.tsx

**Checkpoint**: Full word-cloud renders, polls, pans, zooms, search-highlights.

---

## Phase 7: User Story 5 — Personal Stats & Gift Box Sidebar (Priority: P2)

**Goal**: Right sidebar shows personal stats + "Mở quà" CTA + two 10-item leaderboards.

**Independent Test**: On `/kudos`, sidebar renders "Số Kudos nhận được: N", Mở quà enabled if `boxes_unopened > 0`, both leaderboards render 10 rows.

### Tests (US5 — TDD)

- [x] T105 [P] [US5] Unit test `<KudosStatsCard stats>` — all 5 stat rows render; Mở quà enabled when `boxes_unopened > 0`, disabled otherwise; badge shows unopened count | frontend/tests/unit/kudos/KudosStatsCard.test.tsx
- [x] T106 [P] [US5] Unit test `<KudosLeaderboard variant entries>` — 10 rows, avatar + name + description; empty state "Chưa có dữ liệu" | frontend/tests/unit/kudos/KudosLeaderboard.test.tsx
- [x] T107 [P] [US5] Unit test `<GiftModal reward onClose>` — renders reward payload; ESC + backdrop close | frontend/tests/unit/kudos/GiftModal.test.tsx

### Implementation (US5)

- [x] T108 [P] [US5] Create `<KudosStatsCard stats onOpenGift>` — 5 stat rows + Mở quà CTA with gold bg + glow + unopened badge; disabled state when no boxes | frontend/src/components/kudos/KudosStatsCard.tsx
- [x] T109 [P] [US5] Create `<KudosLeaderboard title entries variant>` — generic top-10 list; rows clickable to profile | frontend/src/components/kudos/KudosLeaderboard.tsx
- [x] T110 [P] [US5] Create `<GiftModal reward onClose>` — uses `<Dialog>` primitive; displays reward content (icon + label + value); close animates | frontend/src/components/kudos/GiftModal.tsx
- [x] T111 [US5] Create `<KudosSidebar stats tierUpgrades giftRecipients>` — composes StatsCard + 2 Leaderboards; owns `giftModalReward` state; on "Mở quà" click: `POST /api/users/me/boxes/next/open` → set modal reward → decrement local unopened count | frontend/src/components/kudos/KudosSidebar.tsx
- [x] T112 [US5] Wire `<KudosSidebar>` into `<KudosPageClient>` as a sticky right column (`position: sticky; top: 104px`) on `lg` breakpoint | frontend/src/components/kudos/KudosPageClient.tsx
- [x] T113 [US5] Update `<KudosPage>` parallel fetch to include `/api/kudos/stats/me` + `/api/kudos/leaderboard/tier-upgrades` + `/api/kudos/leaderboard/gift-recipients` | frontend/src/components/kudos/KudosPage.tsx

**Checkpoint**: Sidebar fully wired with stats, leaderboards, gift modal.

---

## Phase 8: User Story 6 — Filter & Search (Priority: P2)

**Goal**: Hashtag + Department filter dropdowns in the Highlights section header refetch both Highlights + All Kudos. Spotlight search narrows spotlight nodes only.

**Independent Test**: Select `Hashtag: #Dedicated` → both sections refetch + carousel resets to 1/N. Type "Hiệp" in spotlight search → matching nodes highlight.

### Tests (US6 — TDD)

- [x] T114 [P] [US6] Unit test `<FilterDropdown>` — opens on click, selected option highlights, keyboard navigable (ArrowUp/Down/Enter/Esc), `aria-haspopup="listbox"` | frontend/tests/unit/kudos/FilterDropdown.test.tsx
- [x] T115 [P] [US6] Unit test `<KudosFilterBar>` — changing either filter emits combined filter state; "Tất cả" resets | frontend/tests/unit/kudos/KudosFilterBar.test.tsx
- [x] T116 [US6] Integration test filter-flow — applying hashtag filter refetches both highlights + all-kudos; carousel resets to index 0; list cursor resets | frontend/tests/integration/kudos/filter-flow.test.tsx

### Implementation (US6)

- [x] T117 [P] [US6] Create `<FilterDropdown label options value onChange>` — accessible listbox pattern with chevron-down icon | frontend/src/components/kudos/FilterDropdown.tsx
- [x] T118 [US6] Create `<KudosFilterBar filters options onFiltersChange>` — 2 dropdowns (Hashtag + Phòng ban) + URL sync via `useUrlState` | frontend/src/components/kudos/KudosFilterBar.tsx
- [x] T119 [US6] Lift `filters` state up to `<KudosPageClient>`; pass `filters` + setters to Highlights + List; both sections refetch on filter change via `kudos-service` | frontend/src/components/kudos/KudosPageClient.tsx
- [x] T120 [US6] Wire `<KudosFilterBar>` into `<KudosHighlightsSection>` header (replace filter placeholder) | frontend/src/components/kudos/KudosHighlightsSection.tsx
- [x] T121 [US6] Update `<KudosPage>` parallel fetch to include `/api/kudos/filters` + pass to FilterBar as options | frontend/src/components/kudos/KudosPage.tsx

**Checkpoint**: Filters work end-to-end.

---

## Phase 9: User Story 7 — Compose a Kudo (Priority: P2)

**Goal**: Click "Ghi nhận" pill opens a placeholder compose dialog; URL syncs to `?compose=1`; Back button closes.

**Independent Test**: Click pill → dialog opens + URL updates. Back button → dialog closes + URL reverts.

### Tests (US7 — TDD)

- [x] T122 [P] [US7] Unit test `<KudosComposeTrigger>` — click opens dialog + updates URL via `history.pushState`; Escape closes | frontend/tests/unit/kudos/KudosComposeTrigger.test.tsx
- [x] T123 [US7] Integration test compose-flow — click pill → `?compose=1` + dialog mounted; Back → dialog unmounted + URL back to `/kudos` | frontend/tests/integration/kudos/compose-flow.test.tsx

### Implementation (US7)

- [x] T124 [US7] Create `<KudosComposePlaceholder onClose>` — uses `<Dialog>` with body "Compose form — coming soon" (placeholder until full compose spec ships) | frontend/src/components/kudos/KudosComposePlaceholder.tsx
- [x] T125 [US7] Create `<KudosComposeTrigger>` — 738×72 pill per design-style §Action Bar; onClick pushState `?compose=1` + mounts placeholder via `<KudosPageClient>` | frontend/src/components/kudos/KudosComposeTrigger.tsx
- [x] T126 [US7] Add `composeOpen` state to `<KudosPageClient>` synced to URL `?compose=1` via `useUrlState`; `popstate` listener closes dialog | frontend/src/components/kudos/KudosPageClient.tsx
- [x] T127 [US7] Wire `<KudosComposeTrigger>` into `<KudosPage>` below the hero | frontend/src/components/kudos/KudosPage.tsx

**Checkpoint**: Compose trigger opens placeholder dialog with deep-linkable URL state.

---

## Phase 10: User Story 8 — Chrome Continuity (Priority: P3)

**Goal**: Header renders with `selectedNav="kudos"`; Footer is minimal; SAA logo navigates home; Profile menu sign-out works.

**Independent Test**: `/kudos` header shows Kudos in gold-underline; footer only shows copyright; logo click → `/`; sign-out → `/login`.

### Implementation (US8)

- [x] T128 [US8] Smoke-verify Header wiring (already supports `selectedNav="kudos"` — no modification) | frontend/src/components/layout/Header.tsx
- [x] T129 [US8] Smoke-verify Footer wiring (already supports `variant="minimal"`) | frontend/src/components/layout/Footer.tsx

**Checkpoint**: Chrome integration verified.

---

## Phase 11: Polish, Accessibility & Quality Gates

**Purpose**: Cross-cutting refinements + CLAUDE.md mandated quality checks.

### E2E + accessibility

- [x] T130 [P] E2E spec covering US1 (highlights render + prev/next), US2 (heart + copy-link toast), US3 (load-more + lightbox), US4 (spotlight hover+click+search), US5 (sidebar stats + gift modal), US6 (filter), US7 (compose open/close), US8 (chrome) | frontend/tests/e2e/kudos.spec.ts
- [x] T131 [P] Run axe-playwright on `/kudos` — 0 WCAG 2.1 AA violations | frontend/tests/e2e/kudos.spec.ts
- [x] T132 [P] E2E reduced-motion — `emulateMedia({ reducedMotion: "reduce" })` verifies heart no-scale-bounce, spotlight no-arrival-anim, carousel instant | frontend/tests/e2e/kudos.spec.ts
- [x] T133 [P] E2E responsive — viewport 375/768/1440 confirms sidebar stacks below on mobile, spotlight single-col mobile, highlights 1-up mobile | frontend/tests/e2e/kudos.spec.ts
- [x] T134 [P] E2E keyboard navigation — Tab order: skip-link → header → compose-pill → filter-dropdowns → carousel arrows → cards → spotlight (arrow keys cycle nodes) → list → sidebar → footer | frontend/tests/e2e/kudos.spec.ts

### i18n + tokens

- [x] T135 Extend i18n parity test to enforce `kudos.*` namespace parity between `vi.json` and `en.json` | frontend/tests/unit/i18n/parity.test.ts
- [x] T136 [P] Add `<KudosSkeleton>` loading shimmers per section (highlight / spotlight / list / sidebar); swap in before data resolves | frontend/src/components/kudos/KudosSkeleton.tsx
- [x] T137 [P] Verify `<Image priority>` on hero background; `loading="lazy"` on all post images | frontend/src/components/kudos/KudosHero.tsx + frontend/src/components/kudos/KudoImageGrid.tsx

### Quality gates (per CLAUDE.md)

- [x] T138 Run `cd frontend && pnpm typecheck` — 0 TypeScript errors | frontend/
- [x] T139 Run `cd frontend && pnpm build` — production build succeeds | frontend/
- [x] T140 Run `cd frontend && pnpm test` — all unit + integration suites pass | frontend/
- [x] T141 Run `cd frontend && pnpm test:e2e` — all E2E + axe scenarios pass | frontend/

### Documentation

- [x] T142 Update SCREENFLOW.md discovery log with Kudos implementation date + mark status `implemented` | .momorph/SCREENFLOW.md
- [x] T143 Mark Kudos spec dependency as complete in `spec.md §Dependencies` | .momorph/specs/MaZUn5xHXZ-KudosLiveBoard/spec.md


---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup) ─── no deps
    ↓
Phase 2 (Foundation) ─── blocks ALL user stories
    ↓
Phase 3 (US1 — P1 MVP)      ─── deliverable: static highlights carousel
    ↓
Phase 4 (US2 — P1 reactions) ─── depends on US1 cards + Phase 2 ToastProvider
    ↓ (parallel with)
Phase 5 (US3 — P1 list)      ─── depends on US2 ActionRow (shared) + Phase 2 Lightbox
    ↓
Phase 6 (US4 — P2 spotlight) ─── depends on Phase 2 layoutNodes + usePolling
Phase 7 (US5 — P2 sidebar)   ─── parallel with 6
Phase 8 (US6 — P2 filters)   ─── depends on US1 + US3
Phase 9 (US7 — P2 compose)   ─── depends on Phase 2 Dialog primitive
Phase 10 (US8 — P3 chrome)   ─── independent; can run any time after Phase 3
    ↓
Phase 11 (Polish + gates) ─── depends on all stories
```

### Within each user story (TDD — constitution §III)

- Tests [P] MUST be written and FAIL before implementation tasks
- Primitives before composites (TierBadge → KudoAuthors → KudosHighlightCard → Carousel → Section)
- Section before page-wire
- Route Handler stubs (Phase 2) must exist before client fetching

### Parallel Opportunities

**Phase 1** — T003–T016 all `[P]` (independent asset operations). T017 after downloads. T018 + T019 independent files.

**Phase 2** — T020/T021/T022/T023 `[P]` (different files). T024/T025 `[P]` (test files). T030–T041 all `[P]` (independent Route Handler files). T043/T044/T045 `[P]` (test files). T049/T050 `[P]`. T051/T052/T053/T054/T055 `[P]` (separate hook files).

**Phase 3 (US1)** — T065–T068 test files all `[P]`. T069–T072 primitive components `[P]`. T073 depends on primitives. T074 depends on T073. T075 independent. T076–T081 sequential on shared files.

**Phase 4 (US2)** — T082–T084 `[P]`. T085 + T086 `[P]`. T087 depends on T085+T086. T088 wiring.

**Phase 5 (US3)** — T089–T091 `[P]`. T092 + T093 `[P]`. T094 depends on T092+T093. T095 + T096 wiring.

**Phase 6 (US4)** — T097–T099 `[P]`. T100 + T101 partially parallel (T101 depends on layoutNodes). T102 extends T101. T103 + T104 wiring.

**Phase 7 (US5)** — T105–T107 `[P]`. T108/T109/T110 `[P]`. T111 composes. T112/T113 wiring.

**Phase 8 (US6)** — T114/T115 `[P]`; T116 integration. T117 before T118. T119–T121 sequential on `KudosPageClient.tsx`.

**Phase 9 (US7)** — T122 `[P]`. T123 integration. T124 before T125. T126 + T127 wiring.

**Phase 10 (US8)** — T128/T129 smoke-only, trivially parallel.

**Phase 11** — T130–T134 share `kudos.spec.ts` file (sequential by Playwright). T135/T136/T137 `[P]`. T138–T141 sequential (each consumes prior output on CI).

### Cross-story parallel teams (if staffed)

Once Phase 2 completes, 3 tracks can proceed in parallel:
- **Track A**: US1 → US2 → US3 (core feed experience)
- **Track B**: US4 (spotlight) — independent after Phase 2 pure modules land
- **Track C**: US5 (sidebar) — independent after Phase 2

Then:
- **Track D**: US6 (filters) — needs A
- **Track E**: US7 (compose trigger) — independent after Phase 2 Dialog
- **Track F**: US8 (chrome smoke) — any time

---

## Implementation Strategy

### MVP First (Recommended)

1. Complete Phase 1 + Phase 2 (assets + tokens + migrations applied + Route Handlers against real Supabase).
2. Complete Phase 3 (US1 — highlights carousel end-to-end).
3. **STOP & validate**: highlights page is deployable with real data; UAT with product.
4. Deploy if ready — `/kudos` shows highlights + shell; reactions + list + spotlight + sidebar + filters + compose come in subsequent ships.

### Incremental Delivery

1. Setup + Foundation (Phases 1–2, includes migrations applied to Supabase).
2. **Ship 1**: US1 highlights → test → deploy.
3. **Ship 2**: + US2 reactions + US3 list + US8 chrome → test → deploy. (P1 complete)
4. **Ship 3**: + US4 spotlight + US5 sidebar + US6 filters + US7 compose-trigger → test → deploy. (P2 complete)
5. **Final**: Phase 11 polish + quality gates → release.

### Follow-up (post-MVP — NOT in this task list)

- Replace `<KudosComposePlaceholder>` with full compose dialog once that spec ships (separate feature).
- Mobile polling cadence tuning (Q6).
- Kudo detail page + User profile page (Q4 + Q5).

---

## Summary

| Phase | Tasks | Count | Purpose |
|-------|-------|-------|---------|
| 1 — Setup | T001–T019 | 19 | Assets + folders + tokens + zod |
| 2 — Foundation | T020–T064 | 45 | Types, i18n, seed, 5 migrations + `db reset` verify, pure modules, Zod schemas, client service, 12 Supabase-backed Route Handlers, 3 API integration tests, UI primitives (Dialog/Toast/Lightbox), 5 hooks |
| 3 — US1 (P1 MVP) | T065–T081 | 17 | Static highlights carousel |
| 4 — US2 (P1) | T082–T088 | 7 | Heart + copy-link + toast |
| 5 — US3 (P1) | T089–T096 | 8 | All Kudos list + pagination + lightbox |
| 6 — US4 (P2) | T097–T104 | 8 | Spotlight Board + polling + pan/zoom + search |
| 7 — US5 (P2) | T105–T113 | 9 | Sidebar stats + leaderboards + gift modal |
| 8 — US6 (P2) | T114–T121 | 8 | Filter bar + URL sync |
| 9 — US7 (P2) | T122–T127 | 6 | Compose trigger + placeholder dialog |
| 10 — US8 (P3) | T128–T129 | 2 | Chrome smoke |
| 11 — Polish | T130–T143 | 14 | E2E + axe + parity + quality gates + docs |
| **Total** | T001–T143 | **143** | Full implementation including backend |

**MVP-highlights-only scope** = Phases 1 + 2 + 3 = 81 tasks.
**P1 ship** = Phases 1 + 2 + 3 + 4 + 5 + 10 = 98 tasks.
**Full feature ship** = all phases = **143 tasks**.

---

## Notes

- Commit after each completed task or logical group (e.g. all tests for one story, then all implementation).
- Mark tasks as `- [x]` in this file as they complete.
- Run `pnpm typecheck` after every implementation task; do not advance on red.
- All E2E scenarios (T130–T134) live in one `frontend/tests/e2e/kudos.spec.ts` — single Playwright spec organized by `test.describe` blocks.
- TDD order per constitution §III is **non-negotiable**: write test → see red → implement → see green → refactor.
- Route Handlers (T036–T047) use real Supabase from day 1 per D-plan-2. Seeded via `supabase/seeds/dev/kudos_seed.sql` (T023) — run `supabase db reset` to recreate.
- Spotlight layout (`src/lib/kudos/spotlight-layout.ts`) is a pure function — 100 % unit coverage expected via T025.
