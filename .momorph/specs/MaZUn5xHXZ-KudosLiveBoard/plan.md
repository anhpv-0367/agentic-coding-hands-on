# Implementation Plan: Sun* Kudos – Live Board (`/kudos`)

**Frame**: `MaZUn5xHXZ-KudosLiveBoard` (Figma `2940:13431`)
**Date**: 2026-04-22
**Spec**: `spec.md`
**Design**: `design-style.md`

---

## Summary

Build a protected, authenticated `/kudos` route that presents the Sun\* Kudos peer-recognition live board — 5-card HIGHLIGHT KUDOS carousel (7-day rolling window), interactive Spotlight Board word-cloud with pan/zoom and 30-second polling, cursor-paginated ALL KUDOS list (up to 5 attached images per post), plus a sticky right-side sidebar with personal stats, "Mở quà" gift-box CTA, and two 10-item leaderboards. The page reuses Header/Footer/Icon/SectionHeader from Homepage+Awards (~40 % chrome reuse) and adds 20+ new components, 6 typography tokens, 14 spacing tokens, and a full `kudos.*` i18n namespace.

**Key technical posture** (per `CLAUDE.md` + constitution): **no new npm packages**. Data-fetching uses native `fetch()` + React 19 Server Components for initial hydration + client islands with `useEffect`/`useState` for polling, filters, pagination, reactions. Spotlight layout is a hand-rolled deterministic pack-layout — no `d3-force`/`d3-zoom`. No `swr`, no `react-virtuoso`.

Primary technical risks: (a) Spotlight word-cloud layout correctness + perf with up to 118 animated nodes; (b) backend surface is large (13 endpoints) and not implemented — needs Next.js Route Handler stubs for MVP; (c) heart-toggle optimistic UX + 500 ms debounce + backend idempotency contract; (d) Tier assignment thresholds TBD by content team (placeholder provided).

---

## Technical Context

**Language/Framework**: TypeScript 5.x (strict) / Next.js 16 App Router (Turbopack) / React 19.2
**Primary Dependencies** (existing, no additions): `next-intl v4`, `@supabase/ssr`, TailwindCSS v4 (CSS-first `@theme`), `@testing-library/react`, `jest`, `@playwright/test`, `axe-playwright`
**Database**: PostgreSQL via Supabase — new tables required (see §Backend Approach). RLS policies required for every new table.
**Testing**: Jest 30 + `@testing-library/react` (unit), Playwright + axe-playwright (E2E + a11y), custom parity test for i18n namespaces.
**State Management**: React local state (`useState` / `useReducer`); no global store. `next-intl` for locale. Supabase session for auth. Polling via `setInterval` + `visibilityState` guard.
**API Style**: REST. Consumed via Next.js Route Handlers (`src/app/api/kudos/**`) that proxy to Supabase, OR — for MVP with backend not ready — Route Handlers return static JSON fixtures.

---

## Constitution Compliance Check

*GATE: Must pass before implementation can begin*

| Requirement | Constitution Rule | Status |
|-------------|-------------------|--------|
| Clean code & source organization (Principle I) | Feature-first folder `src/components/kudos/`; kebab-case files, PascalCase components, camelCase functions/hooks; single responsibility per component; no dead code | ✅ Compliant — follows existing `homepage/`, `awards/` precedent |
| Platform-appropriate UI (Principle II) | Tailwind utility classes bound to `@theme` tokens; no hardcoded colors/spacing/typography; 6 new typography tokens + 14 spacing tokens added via `@theme` in `globals.css` | ✅ Compliant |
| Test-first / TDD (Principle III) | Every user story gets at least one failing test before implementation; unit tests for components/hooks, integration tests for filter/pagination flows, E2E for critical paths + axe WCAG AA | ✅ Planned |
| Supabase integration (Principle IV) | Auth via existing `createClient` helper; all new tables (kudos, kudos_reactions, kudos_hashtags, user_stats, secret_boxes) get RLS policies; no raw SQL, no custom HTTP clients bypassing Supabase SDK | ✅ Planned — RLS policies will be defined per-table in migration |
| OWASP secure coding (Principle V) | Zod validation on `POST /api/kudos` + `POST /api/uploads`; no `localStorage` for session tokens (Supabase SSR handles httpOnly cookies); image upload validates MIME + size server-side; clipboard writeText sanitized (canonical URL only); `rel="noopener noreferrer"` where applicable | ✅ Planned |
| TypeScript `type` (not `interface`) | Per `CLAUDE.md` addendum | ✅ Compliant — all entity declarations use `type` |
| No new npm packages | Per `CLAUDE.md` "Do not add libraries to package.json" | ✅ Compliant — hand-rolled pack-layout, native fetch, no SWR/d3/virtuoso |

**Violations**: None.

---

## Architecture Decisions

### Frontend Approach

- **Component Structure**: Feature-first under `src/components/kudos/` (mirrors `src/components/awards/` + `src/components/homepage/` precedent). Atomic composition — small primitives (`TierBadge`, `KudoAvatarPair`, `KudoHashtags`) → molecules (`KudoActionRow`, `KudoAuthors`) → organisms (`KudosHighlightCard`, `KudosPostCard`, `KudosStatsCard`) → sections (`KudosHighlightsSection`, `KudosSpotlightBoard`, `KudosList`, `KudosSidebar`) → page shell (`KudosPage`, `KudosPageClient`).
- **RSC / Client split**: The route `src/app/kudos/page.tsx` is a **Server Component** (auth guard + `generateMetadata` + parallel fetch of initial data via native `fetch()` to Route Handlers + renders `<KudosPage>`). `<KudosPage>` is also server. The **single top-level client island** `<KudosPageClient>` hosts: carousel state, filters, pagination cursor, polling, reactions, toast queue, gift modal, compose dialog. Cards are server-rendered and passed as `children`; small client leaves (e.g., `<HeartButton>`, `<CopyLinkButton>`, `<FilterDropdown>`, `<KudosSpotlightBoard>`) are scoped to their interactive needs.
- **Styling**: Tailwind v4 utility classes bound to CSS variables in `globals.css @theme`. New tokens: 6 typography, 14 spacing, 5 colors, 3 radii, 3 borders, 1 focus-ring shadow — full list in `design-style.md`. Inline `style={{}}` only for dynamic values (e.g., spotlight node `{ x, y }` positions).
- **Data fetching**: Hybrid RSC + client. Server Component fetches initial data in parallel via native `fetch()` to internal Route Handlers. Client islands re-fetch on filter change, pagination load-more, spotlight poll, reaction toggle. No SWR, no React Query — just `useState`/`useEffect` + small typed service functions in `src/lib/services/kudos-service.ts`.
- **Polling**: `useEffect` + `setInterval(30_000)` + `document.visibilityState === "hidden"` guard pauses; `visibilitychange` event resumes. On 3 consecutive errors, pause + show "Kết nối lại…" indicator; resume on next user action or next success.
- **Spotlight layout**: Hand-rolled deterministic pack-layout in `src/components/kudos/kudosSpotlightLayout.ts` — pure function `layoutNodes(nodes: SpotlightNode[], canvasBounds): PlacedNode[]`. Algorithm: seeded concentric rings (innermost first = most recent) with radial jitter; AABB collision detection against previously placed nodes. Positions cached in component state; new nodes from poll appended at the nearest available empty slot without re-layout.
- **Pan/zoom**: CSS transform on the inner canvas container (`translate(x, y) scale(z)`); event handlers on the outer clipping container listen for `pointerdown`/`pointermove`/`wheel` and update state. Scale clamped `[0.5, 2.0]`. No external library.
- **Optimistic updates**: Heart toggle updates local state immediately, fires `POST`/`DELETE` in background, rolls back on error. 500 ms per-card debounce via `useRef<number | null>` timestamp check.
- **Clipboard**: `navigator.clipboard.writeText()` with permission-denied fallback showing a selectable `<input readOnly>` for manual copy. Extracted into `src/hooks/useClipboard.ts`.

### Backend Approach

**API Design**: REST endpoints exposed as Next.js Route Handlers under `src/app/api/kudos/**` and `src/app/api/users/**`. Each Route Handler validates input via Zod, authorizes via Supabase session, and proxies to Supabase queries (with RLS) or Supabase Storage (for uploads). 13 endpoints total (see spec §API Dependencies).

**Data Access**: Supabase SDK (`@supabase/ssr`). No raw SQL from Route Handlers — use `supabase.from("kudos").select(...)` pattern. For complex queries (e.g., highlights 7-day window with heart count), use Supabase Postgres views or RPC (stored procedures) to keep query logic DB-side.

**Database schema** (new tables, all with RLS):

| Table | Columns (essentials) | RLS |
|-------|---------------------|-----|
| `kudos` | `id uuid pk`, `sender_id uuid fk users`, `recipient_id uuid fk users`, `message text`, `hashtags text[]`, `created_at timestamptz default now()`, `heart_count int default 0` | SELECT: any authenticated user (`auth.uid() is not null`). INSERT: `sender_id = auth.uid()`. UPDATE/DELETE: owner only (sender). |
| `kudo_attachments` | `id uuid pk`, `kudo_id uuid fk`, `url text`, `order int` | Same as `kudos` |
| `kudo_reactions` | `id uuid pk`, `kudo_id uuid fk`, `user_id uuid fk`, `type text check (type in ('heart'))`, `created_at timestamptz`, unique `(kudo_id, user_id, type)` | SELECT: authenticated. INSERT/DELETE: `user_id = auth.uid()`. |
| `user_kudo_stats` (table refreshed via trigger) | `user_id uuid pk`, `received int`, `sent int`, `hearts int`, `tier text`, `boxes_opened int`, `boxes_unopened int` | SELECT: self only for the full row (`user_id = auth.uid()`). SELECT of `(user_id, tier)` only is allowed for everyone (used by Kudo card tier-badge rendering). |
| `tier_change_events` | `id uuid pk`, `user_id uuid fk`, `from_tier text`, `to_tier text`, `changed_at timestamptz default now()` | SELECT: authenticated (needed for tier-upgrades leaderboard). INSERT: internal only (trigger); never from client. |
| `secret_boxes` | `id uuid pk`, `user_id uuid fk`, `reward_kind text`, `reward_payload jsonb`, `opened_at timestamptz null`, `granted_at timestamptz default now()` | SELECT/UPDATE: `user_id = auth.uid()` only. INSERT internal only (trigger on tier change). |

**Derived queries**:
- `GET /api/kudos/highlights` → `SELECT * FROM kudos WHERE created_at >= now() - interval '7 days' ORDER BY heart_count DESC, created_at DESC LIMIT 5` (RPC)
- `GET /api/kudos/spotlight-feed` → `SELECT id as kudo_id, recipient_id, recipients.display_name, created_at as received_at FROM kudos JOIN users AS recipients ON recipients.id = kudos.recipient_id ORDER BY created_at DESC LIMIT 118` (plus total count)
- `GET /api/kudos/leaderboard/tier-upgrades` → joins `user_kudo_stats` + a `tier_change_events` table tracking tier transitions (added to migration plan: `tier_change_events(user_id, from_tier, to_tier, changed_at)` populated by the tier-advance trigger)
- `GET /api/kudos/filters` → `SELECT DISTINCT unnest(hashtags) FROM kudos` + `SELECT DISTINCT department FROM users`

**Tier computation**: Postgres trigger on `kudo_reactions INSERT/DELETE` updates `user_kudo_stats.hearts` and `received`; a separate trigger on `kudos INSERT` updates sender `.sent` and recipient `.received`. When `received` crosses a threshold (per D1: new 0–9, rising 10–29, super 30–99, legend 100+), `tier` advances and `boxes_unopened += 1` per D2.

**Image uploads**: `POST /api/uploads` accepts multipart (max 5 files, each ≤5 MB, JPG/PNG/WebP). Server validates MIME + size, generates UUID filename, uploads to Supabase Storage bucket `kudos-attachments` (public-read policy), returns `{ url }`. Frontend then includes `attachment_urls` array in `POST /api/kudos` payload.

**Validation**: Zod schemas per endpoint in `src/lib/services/kudos-validation.ts`. Share with frontend form validation to keep contracts consistent.

### Integration Points

- **Existing shared components** (verified in codebase as of 2026-04-22):
  - `Header` — already supports `selectedNav="kudos"` (Header.tsx line 77–84 renders the "Sun\* Kudos" NavLink with selected state). **No modification needed.**
  - `Footer` — already supports `variant="minimal"`. **No modification needed.**
  - `SectionHeader` — already supports optional `caption` (after Awards spec). **No modification needed.**
  - `Icon` — reused as-is for all Kudos icons (`size={N} alt="" aria-hidden` pattern consistent with existing usage).
  - `SkipLink` — include on the page for keyboard a11y.
- **Existing data/types**:
  - `UserRole` type in `src/types/homepage.ts` — reused for profile-menu logic (if admin-only features appear).
  - Supabase client initialization in `src/lib/supabase/server.ts` (RSC-side) and `src/lib/supabase/client.ts` (client-side) — reused.
- **New data layer**:
  - `src/types/kudos.ts` — `Kudo`, `UserRef`, `KudosStats`, `LeaderboardEntry`, `SpotlightNode`, `GiftBoxReward`, `KudoTier` (all `type` per constitution addendum).
  - `src/lib/services/kudos-service.ts` — typed fetchers for each of 13 endpoints.
  - `src/lib/services/kudos-validation.ts` — Zod schemas for POST/DELETE bodies and query params.
  - `src/lib/data/kudos-fixtures.ts` — static JSON fixtures for MVP when backend isn't ready (fed to Route Handlers).
- **i18n messages**: extend `src/i18n/messages/{vi,en}.json` with `kudos.*` namespace (45 keys).
- **Route protection**: existing `middleware.ts` already covers `/kudos` (not in `PUBLIC_PATHS`). **No change.**

### State Management

| State | Scope | Source | Updater |
|-------|-------|--------|---------|
| `highlights` | `<KudosHighlightsClient>` `useState` | initial from RSC + refetch on filter | filter apply, reaction optimistic |
| `currentSlide` | `<KudosHighlightsCarousel>` `useState` | default 0 | prev/next buttons |
| `allKudos` + `nextCursor` | `<KudosListClient>` `useState` | initial from RSC + appended on load-more | load-more button, filter reset |
| `spotlightNodes` + `spotlightTotal` | `<KudosSpotlightBoard>` `useState` | initial from RSC + merged via 30-s poll | `setInterval` tick |
| `spotlightSearchQuery` + `spotlightHighlight` | `<KudosSpotlightBoard>` `useState` | default `""` / empty Set | search input (debounced 200 ms) |
| `panZoom` (`{ x, y, scale }`) | `<KudosSpotlightBoard>` `useState` | default centered, scale 1 | pointer drag + wheel |
| `filters` (`{ hashtag, department }`) | `<KudosPageClient>` `useState` + URL sync | URL search params | filter dropdowns |
| `stats` | `<KudosStatsCard>` `useState` | initial from RSC | refetch after box open |
| `leaderboardTierUpgrades` + `leaderboardGiftRecipients` | `<KudosSidebar>` `useState` | initial from RSC | refetch on box open |
| `giftModalReward` | `<KudosSidebar>` `useState` | null → populated on Mở quà click | close modal button |
| `composeOpen` | URL `?compose=1` + `<KudosPageClient>` `useState` | URL search param | pill click / close dialog / back button |
| `toasts` | `<ToastProvider>` context + `useState` | empty array | copy-link / error / etc. |
| Locale | next-intl cookie | `NEXT_LOCALE` cookie | `LanguageSelector` (existing) |
| Auth session | Supabase cookie | middleware | session refresh |

No global store introduced.

### Navigation & History Strategy

| Trigger | History op | Rationale |
|---------|------------|-----------|
| Filter selection | `history.replaceState` with `?hashtag=&department=` | Preserve filter state across reload; don't pollute back history |
| Compose dialog open | `history.pushState` with `?compose=1` | Back button closes dialog without leaving page |
| Carousel prev/next | no history change | Ephemeral UI state |
| Spotlight pan/zoom | no history change | Ephemeral UI state |
| Reduced-motion | no animation path | Accessibility |
| `hashchange` / `popstate` | re-read URL state, close compose if `compose=1` removed | Keep URL and UI in sync |

### Data / RSC Flow

```mermaid
flowchart TD
    A["/kudos route (Server Component)"] --> B[Auth guard via Supabase SSR]
    B -->|unauthenticated| R[redirect /login?returnTo=%2Fkudos]
    B -->|authenticated| P[parallel fetch via native fetch()]
    P --> P1[highlights]
    P --> P2[all-kudos first page]
    P --> P3[spotlight-feed]
    P --> P4[stats/me]
    P --> P5[leaderboards x2]
    P --> P6[filters]
    P1 & P2 & P3 & P4 & P5 & P6 --> K[KudosPage server]
    K --> C[KudosPageClient]
    C --> HL[KudosHighlightsClient]
    C --> SP[KudosSpotlightBoard - 30s polling]
    C --> LS[KudosListClient - cursor pagination]
    C --> SB[KudosSidebar - stats + leaderboards]
    C --> CD[KudosComposeTrigger - ?compose=1]
```

---

## Project Structure

### Documentation (this feature)

```text
.momorph/specs/MaZUn5xHXZ-KudosLiveBoard/
├── spec.md              # Feature specification (exists)
├── design-style.md      # Visual specs (exists)
├── plan.md              # This file
├── tasks.md             # Generated by /momorph.tasks
└── assets/
    └── frame.png        # Reference screenshot (exists)
```

### Source Code — New Files

#### Frontend — Route + page shell

| File | Purpose | Kind |
|------|---------|------|
| `src/app/kudos/page.tsx` | Route entry: auth guard + `generateMetadata` + parallel RSC fetch + renders `<KudosPage>` | Server |
| `src/components/kudos/KudosPage.tsx` | Page shell: SkipLink + Header + Hero + `<KudosPageClient>` + Footer | Server |
| `src/components/kudos/KudosPageClient.tsx` | Top-level client island — filter state + compose dialog URL sync + toast provider | Client |

#### Frontend — Sections

| File | Purpose | Kind |
|------|---------|------|
| `src/components/kudos/KudosHero.tsx` | Keyvisual (background image + gradient + subtitle + wordmark) | Server |
| `src/components/kudos/KudosComposeTrigger.tsx` | 738×72 "Ghi nhận" pill; opens compose dialog via URL `?compose=1` | Client |
| `src/components/kudos/KudosHighlightsSection.tsx` | Section header + filter bar + carousel + pagination | Server wrapping client |
| `src/components/kudos/KudosHighlightsCarousel.tsx` | 5-card scroll-snap carousel with active-center + side-fade | Client |
| `src/components/kudos/KudosCarouselControls.tsx` | Prev/next buttons + `N/5` counter | Client |
| `src/components/kudos/KudosSpotlightBoard.tsx` | Word-cloud canvas + 388 KUDOS counter + search + pan/zoom + 30-s polling | Client |
| `src/components/kudos/KudosSpotlightSearch.tsx` | Pill search input for spotlight node filtering | Client |
| `src/components/kudos/KudosList.tsx` | Cursor-paginated All Kudos list with load-more | Client |
| `src/components/kudos/KudosSidebar.tsx` | Stats card + 2 leaderboards + gift modal container | Client |
| `src/components/kudos/KudosStatsCard.tsx` | Personal stats + "Mở quà" CTA | Client |
| `src/components/kudos/KudosLeaderboard.tsx` | Generic 10-row leaderboard component (variant prop) | Server |
| `src/components/kudos/KudosFilterBar.tsx` | Hashtag + Department dropdowns, URL-synced | Client |

#### Frontend — Cards + primitives

| File | Purpose | Kind |
|------|---------|------|
| `src/components/kudos/KudosHighlightCard.tsx` | Highlight carousel card (dark bg, white body, 3-line clamp) | Server |
| `src/components/kudos/KudosPostCard.tsx` | All Kudos list card (cream bg, full body, image grid) | Server |
| `src/components/kudos/KudoAuthors.tsx` | Sender/recipient avatar+name pair with send-arrow | Server |
| `src/components/kudos/KudoActionRow.tsx` | Heart + copy-link + view-detail row (used by both card types) | Client |
| `src/components/kudos/KudoHashtags.tsx` | Hashtag pill row with optional 1-line clamp | Server |
| `src/components/kudos/KudoImageGrid.tsx` | Up to 5 images; click opens lightbox | Client |
| `src/components/kudos/TierBadge.tsx` | Pill with 4 variants (new/rising/super/legend) | Server |
| `src/components/kudos/HeartButton.tsx` | Heart icon + count with optimistic toggle | Client |
| `src/components/kudos/CopyLinkButton.tsx` | Copy-link CTA with toast feedback | Client |
| `src/components/kudos/FilterDropdown.tsx` | Generic accessible dropdown (listbox pattern) — may be lifted out of kudos/ later | Client |
| `src/components/kudos/GiftModal.tsx` | Reward dialog — Kudos-specific content; uses shared `<Dialog>` primitive | Client |
| `src/components/kudos/KudosSkeleton.tsx` | Loading shimmer for Highlights + List + Spotlight + Sidebar sections | Server |
| `src/components/kudos/index.ts` | Barrel export | Module |

#### Frontend — Shared UI primitives (placed under `src/components/ui/` for cross-feature reuse)

| File | Purpose | Kind |
|------|---------|------|
| `src/components/ui/Dialog.tsx` | Generic modal dialog with `role="dialog"` + focus-trap + body-scroll-lock + ESC-to-close; consumed by `GiftModal` + future compose dialog | Client |
| `src/components/ui/Toast.tsx` + `ToastProvider.tsx` | Portal-based toast system with `role="status"` + `aria-live="polite"` | Client |
| `src/components/ui/Lightbox.tsx` | Full-screen image viewer (scoped focus-trap, ESC, body-scroll-lock) | Client |

#### Frontend — Hooks + utilities

| File | Purpose | Kind |
|------|---------|------|
| `src/hooks/useClipboard.ts` | `navigator.clipboard.writeText` + permission-denied fallback | Client hook |
| `src/hooks/useDebouncedValue.ts` | Generic `(value, delay) → debouncedValue` | Client hook |
| `src/hooks/usePolling.ts` | `(fetcher, ms)` with `visibilitychange` guard + error backoff | Client hook |
| `src/hooks/useIntersection.ts` | Observes an element for load-more trigger | Client hook |
| `src/hooks/useUrlState.ts` | Sync state `<->` URL search params | Client hook |

#### Frontend — Data layer

| File | Purpose | Kind |
|------|---------|------|
| `src/types/kudos.ts` | All Kudos-related types (Kudo, UserRef, KudosStats, LeaderboardEntry, SpotlightNode, GiftBoxReward, KudoTier) | Types |
| `src/lib/services/kudos-service.ts` | Typed `fetch()` helpers for each of 13 endpoints | Module |
| `src/lib/services/kudos-validation.ts` | Zod schemas for request bodies / query params | Module |
| `src/lib/data/kudos-fixtures.ts` | Static JSON fixtures for MVP (5 highlights, 20 posts, 118 spotlight nodes, stats, leaderboards) | Module |
| `src/lib/kudos/tier.ts` | Pure `computeTier(received: number): KudoTier` | Module |
| `src/lib/kudos/spotlight-layout.ts` | Pure `layoutNodes(nodes: SpotlightNode[], bounds): PlacedNode[]` — hand-rolled pack layout (seeded concentric rings + AABB collision) | Module |

#### Backend — API route handlers

| File | Endpoint | Kind |
|------|----------|------|
| `src/app/api/kudos/highlights/route.ts` | `GET /api/kudos/highlights` | Route Handler |
| `src/app/api/kudos/route.ts` | `GET /api/kudos` (paginated) + `POST /api/kudos` (create) | Route Handler |
| `src/app/api/kudos/[id]/route.ts` | `GET /api/kudos/:id` | Route Handler |
| `src/app/api/kudos/[id]/reactions/route.ts` | `POST / DELETE /api/kudos/:id/reactions` | Route Handler |
| `src/app/api/kudos/spotlight-feed/route.ts` | `GET /api/kudos/spotlight-feed` | Route Handler |
| `src/app/api/kudos/stats/me/route.ts` | `GET /api/kudos/stats/me` | Route Handler |
| `src/app/api/kudos/leaderboard/tier-upgrades/route.ts` | `GET …` | Route Handler |
| `src/app/api/kudos/leaderboard/gift-recipients/route.ts` | `GET …` | Route Handler |
| `src/app/api/kudos/filters/route.ts` | `GET /api/kudos/filters` | Route Handler |
| `src/app/api/sunners/route.ts` | `GET /api/sunners?search=` | Route Handler |
| `src/app/api/uploads/route.ts` | `POST /api/uploads` (multipart) | Route Handler |
| `src/app/api/users/me/boxes/next/open/route.ts` | `POST …` | Route Handler |

#### Database — Supabase migrations

> ⚠️ **Note**: `supabase/migrations/` directory does not exist yet (verified 2026-04-22). First migration creates the folder. Files use Supabase's `YYYYMMDDHHMMSS_name.sql` timestamp convention (e.g., `20260422120000_kudos_tables.sql`).

| File | Purpose |
|------|---------|
| `supabase/migrations/<ts>_kudos_tables.sql` | `kudos`, `kudo_attachments`, `kudo_reactions` tables + RLS (SELECT any-auth; INSERT self; DELETE owner) |
| `supabase/migrations/<ts>_user_stats.sql` | `user_kudo_stats` table + triggers for tier advancement + box grant on upgrade |
| `supabase/migrations/<ts>_secret_boxes.sql` | `secret_boxes` table + RLS (self-only) |
| `supabase/migrations/<ts>_kudos_functions.sql` | RPC/PL-pgSQL: `get_kudos_highlights_7d()`, `update_user_stats_on_kudo()` (trigger fn), `update_user_stats_on_reaction()` (trigger fn), `open_next_box()` (returns reward + marks opened) |
| `supabase/migrations/<ts>_kudos_storage.sql` | Storage bucket `kudos-attachments` + access policy (public-read, auth-write) |
| `supabase/seeds/common/kudos_demo.sql` | **Optional** seed data for local dev — 50 sample Kudos, 10 users with varied tiers |

#### Tests

| File | Coverage |
|------|----------|
| `tests/unit/kudos/KudosHighlightCard.test.tsx` | Card renders sender/recipient/message/clamp/hashtags/actions |
| `tests/unit/kudos/KudosPostCard.test.tsx` | Post card with images grid + no-clamp body |
| `tests/unit/kudos/HeartButton.test.tsx` | Optimistic toggle + rollback on error + 500 ms debounce |
| `tests/unit/kudos/CopyLinkButton.test.tsx` | Clipboard write + toast + permission-denied fallback |
| `tests/unit/kudos/KudosHighlightsCarousel.test.tsx` | Slide index + disabled arrows at bounds + counter |
| `tests/unit/kudos/KudosList.test.tsx` | Load-more trigger at 200 px + empty state + no-more state |
| `tests/unit/kudos/kudosSpotlightLayout.test.ts` | Deterministic output for same input + no overlaps + within bounds |
| `tests/unit/kudos/usePolling.test.ts` | `visibilitychange` pause + error backoff + reduce interval |
| `tests/unit/kudos/TierBadge.test.tsx` | 4 variants render correct text + styling |
| `tests/unit/kudos/KudosStatsCard.test.tsx` | Mở quà enabled/disabled by `boxes_unopened` |
| `tests/unit/kudos/formatters.test.ts` | Relative time formatting for tooltip |
| `tests/unit/kudos/useClipboard.test.ts` | success / permission-denied paths |
| `tests/unit/kudos/KudoImageGrid.test.tsx` | 1/2/3/4/5 image grid layouts + onError fallback |
| `tests/unit/kudos/Lightbox.test.tsx` | Open/close + ESC + focus-trap + body-scroll-lock |
| `tests/unit/kudos/Dialog.test.tsx` | Focus-trap cycles; Escape closes; backdrop click closes |
| `tests/unit/kudos/Toast.test.tsx` | Auto-dismiss after duration + aria-live announcement |
| `tests/unit/i18n/parity.test.ts` | Extend existing to enforce `kudos.*` namespace parity |
| `tests/integration/kudos/filter-flow.test.tsx` | Select filter → both highlights + list refetch + counter reset |
| `tests/integration/kudos/compose-flow.test.tsx` | Click pill → dialog opens → URL updates |
| `tests/integration/kudos/reaction-flow.test.tsx` | Heart toggle → POST → rollback on 500 |
| `tests/e2e/kudos.spec.ts` | Critical paths: hash-less load, filter, load-more, spotlight pan/zoom, heart, copy-link, compose open, mở quà, axe WCAG AA, reduced-motion |

### Source Code — Modified Files

| File | Change |
|------|--------|
| `src/app/globals.css` | Add `@theme` tokens: 5 new colors, 6 new typography, 14 new spacing, 3 new radii, 3 new borders, 1 focus-ring shadow (full list in `design-style.md §Design Tokens`) |
| `src/i18n/messages/vi.json` | Add `kudos.*` namespace (45 keys) |
| `src/i18n/messages/en.json` | Mirror with English copy |
| `jest.setup.ts` | Ensure `IntersectionObserver` + `matchMedia` stubs cover polling, load-more, reduced-motion tests (likely already present from Awards work) |
| **No-change files** (listed for clarity) | `src/components/layout/Header.tsx` (already supports `selectedNav="kudos"`); `src/components/layout/Footer.tsx` (already supports `variant="minimal"`); `src/components/ui/SectionHeader.tsx` (already has optional `caption`); `src/components/ui/Icon.tsx`; `middleware.ts` (already protects `/kudos`) |

### Dependencies

**One new dependency — `zod`** (approved 2026-04-22 by product owner as justified exception to CLAUDE.md's "no new libraries" rule; constitution Principle V explicitly names Zod for web validation).

All other planned behavior uses existing deps: React 19, Next.js 16 App Router, `next-intl`, `@supabase/ssr`, Tailwind v4, Jest, Playwright, `axe-playwright`.

| Package | Version | Purpose | Justification |
|---------|---------|---------|---------------|
| `zod` | `^3.x` | Request body + query-param validation in Route Handlers (POST /api/kudos, POST /api/uploads, POST /api/kudos/:id/reactions) | Constitution Principle V mandates input validation; Zod is already named as the preferred tool in the constitution |

---

## Implementation Strategy

### Phase Breakdown (6 phases, vertical slices where possible)

**Phase 0 — Asset preparation**
- Download **11 new assets** from Figma `MaZUn5xHXZ` via `mcp__momorph__get_media_files` (list in spec §Dependencies → Assets):
  1. `MM_MEDIA_Heart` → `public/assets/kudos/heart.svg` (default gray; tint to red via CSS filter on active)
  2. `MM_MEDIA_Link` → `public/assets/kudos/link.svg`
  3. `MM_MEDIA_Open Gift` → `public/assets/kudos/open-gift.svg`
  4. `MM_MEDIA_Send` → `public/assets/kudos/send.svg`
  5. `MM_MEDIA_Pen` → `public/assets/icons/pen.svg` *(verify if already downloaded in Awards batch)*
  6. `MM_MEDIA_Search` → `public/assets/icons/search.svg` *(verify)*
  7. `MM_MEDIA_Down` → `public/assets/icons/chevron-down.svg`
  8–11. `MM_MEDIA_{New,Rising,Super,Legend} Hero` → `public/assets/kudos/tier-{new,rising,super,legend}.svg`
  12. `MM_MEDIA_Kudos logo` → `public/assets/kudos/saa-kudos-wordmark.png`
  13. `MM_MEDIA_KV Background` → `public/assets/kudos/kv-background.png`
- Total: 13 file outputs (4 icons in `icons/`, 4 tier badges + 3 action icons + wordmark + backdrop in `kudos/`).
- For SVGs with `fill="white"` from Figma (like Awards' target/diamond/license), tint to `fill="#FFEA9E"` directly in the file (constitution: no CSS color hardcodes in components, but static asset tinting is acceptable).
- Verify file sizes + dimensions; commit.

**Phase 1 — Foundation (blocks all feature work)**
1. Create `src/types/kudos.ts` (all entity types).
2. Add `kudos.*` namespace to `vi.json` + `en.json` (45 keys).
3. Add `@theme` tokens to `globals.css` (colors / typography / spacing / radii / shadow).
4. Create `src/lib/data/kudos-fixtures.ts` (static fixture JSON for all 13 endpoints).
5. Create Route Handler stubs for all 13 endpoints — initially return fixture data; wire real Supabase later. Each handler validates auth + (for writes) input via Zod.
6. Create `src/lib/services/kudos-service.ts` (typed fetchers per endpoint).
7. Create `src/lib/services/kudos-validation.ts` (Zod schemas).
8. Create `src/lib/kudos/tier.ts` + `src/components/kudos/kudosSpotlightLayout.ts` (pure modules, TDD-first).
9. Add unit tests for `tier`, `spotlight-layout`, `formatters`.

**Phase 2 — User Story 1 (P1): Browse Highlights**
Vertical slice — end-to-end for the Highlight carousel:
1. Write failing tests: `KudosHighlightCard.test.tsx`, `KudosHighlightsCarousel.test.tsx`.
2. Build primitives: `TierBadge`, `KudoAvatarPair`, `KudoAuthors`, `KudoHashtags`.
3. Build `KudosHighlightCard` (dark bg, white body, 3-line clamp, 5-hashtag clamp).
4. Build `KudosHighlightsCarousel` + `KudosCarouselControls` (scroll-snap + active-center + side-fade + prev/next + disabled states).
5. Build `KudosHighlightsSection` (section header + carousel) — consume server-fetched highlights.
6. Wire into `KudosPage` (server shell) + `/kudos` route.
7. Pass Phase 1 typecheck/tests/build.

**Phase 3 — User Story 2 + 3 (P1): Reactions, Copy-link, All Kudos List**
1. TDD: `HeartButton.test`, `CopyLinkButton.test`, `KudosList.test`, integration test `reaction-flow`.
2. Implement `HeartButton` (optimistic + debounce + rollback).
3. Implement `CopyLinkButton` + `useClipboard` hook + `Toast` + `ToastProvider`.
4. Implement `KudoActionRow` (composes heart + copy-link + view-detail).
5. Implement `KudoImageGrid` + `Lightbox` (with `onError` fallback to "Đang tải…" placeholder + retry-on-click, per spec edge case).
6. Implement `KudosPostCard` (cream bg, full body, image grid, action row).
7. Implement `KudosList` (load-more via `useIntersection` + cursor pagination).
8. Wire into `KudosPage`.
9. Pass tests; run axe-playwright smoke.

**Phase 4 — User Story 4 (P2): Spotlight Board**
1. TDD: `kudosSpotlightLayout.test` (already in Phase 1); `KudosSpotlightBoard.test` (mock layout fn, verify render + hover tooltip + click navigate).
2. Implement `KudosSpotlightSearch`.
3. Implement `KudosSpotlightBoard` with:
   - Initial layout on mount via `layoutNodes`
   - `usePolling(30000)` hook for spotlight refresh
   - CSS-transform pan/zoom (pointer events + wheel + scale clamp)
   - Hover tooltip + click-to-detail nav
   - Search-highlight mode (gold-scale matching nodes, fade non-matches)
   - `prefers-reduced-motion` respected for node-arrival animations
4. Integration test: poll tick updates counter + new nodes appended.

**Phase 5 — User Story 5 + 6 (P2): Sidebar + Filters + Compose trigger**
1. TDD: `KudosStatsCard.test`, `KudosLeaderboard.test`, `FilterDropdown.test`, `filter-flow.test` integration, `compose-flow.test` integration.
2. Implement `FilterDropdown` (accessible listbox pattern).
3. Implement `KudosFilterBar` (URL-synced filter state via `useUrlState`).
4. Implement `KudosStatsCard` + `KudosLeaderboard` + `GiftModal`.
5. Implement `KudosSidebar` composing stats + 2 leaderboards + gift modal.
6. Implement `KudosComposeTrigger` (URL `?compose=1` toggle) + a **placeholder `KudosComposePlaceholder` dialog** — mounts when `?compose=1` is set; body is a minimal `<Dialog>` with the string "Compose form — coming soon" and a close button. This makes US7 scenarios testable (dialog mounts, URL syncs, back-button closes) without blocking on the full compose spec. Placeholder will be replaced when the compose feature ships.
7. Wire filter bar above carousel + into list refetch logic.

**Phase 6 — US7 + US8 + Polish + Quality Gates**
1. Smoke-verify Header/Footer chrome (already compliant — just visual QA).
2. Add `generateMetadata` + metadata i18n keys.
3. E2E `tests/e2e/kudos.spec.ts`:
   - Desktop + tablet + mobile viewports
   - Deep-link `/kudos?compose=1` opens dialog placeholder
   - Filter + pagination + reactions + copy-link happy paths
   - Spotlight pan/zoom + search highlight
   - Reduced-motion branch (`emulateMedia({ reducedMotion: "reduce" })`)
   - Axe-core WCAG 2.1 AA: 0 violations
4. i18n parity test extended to cover `kudos.*`.
5. Lighthouse pass: LCP ≤ 2.5 s on desktop 1440 px; CLS ≤ 0.1.
6. Manual QA against `design-style.md §Validation Checklist`.
7. **Quality gates (per CLAUDE.md §Frontend Essential Commands)**:
   - `cd frontend && pnpm typecheck` → 0 errors
   - `cd frontend && pnpm lint` → 0 violations *(note: no `lint` script currently in package.json — document as pre-existing gap)*
   - `cd frontend && pnpm build` → success
   - `cd frontend && pnpm test` → all pass
   - `cd frontend && pnpm test:e2e` → all pass + axe 0 violations

### Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Spotlight layout produces overlaps** on 118 nodes at certain viewport sizes | Medium | Medium | Unit test `kudosSpotlightLayout` with 118-node fixture; AABB collision guaranteed by design; if overlaps occur at small viewports, cap visible nodes to `min(118, viewportCapacity)` |
| **Polling rate too aggressive** on slow connections / mobile data | Low | Low | 30 s polling with `visibilitychange` guard + 3-fail backoff; `useSWR`-style stale-while-revalidate not applicable but initial RSC fetch means users see data before first poll |
| **Pan/zoom event handlers leak** or interfere with page scroll | Medium | Medium | Use `pointer-events: none` on non-interactive canvas layers; capture pointer on canvas outer; `touch-action: none` on zoomable container; test on touch devices |
| **Backend endpoints not ready for MVP** | High | High | Phase 1 builds fixture-backed Route Handlers; frontend implements against stable contract; backend swap is a drop-in replacement of handler body |
| **`zod` not already installed** | Low | Low | Verify in Phase 0; if missing, request approval for a single justified addition; fallback is hand-rolled validation but less safe |
| **Tier thresholds change late** | Medium | Low | Thresholds live in `src/lib/kudos/tier.ts` as a single constant — change-one-file risk |
| **Image upload bucket RLS misconfigured** | Medium | High | Write integration test: authenticated user can upload their own, cannot delete others'; manual QA with Supabase dashboard; peer review migration SQL |
| **Heart race condition** (rapid click) | Medium | Low | 500 ms per-card debounce; backend unique constraint `(kudo_id, user_id, type)` on `kudo_reactions`; duplicate inserts ignored |
| **Clipboard permission denied on Safari** | Medium | Low | Fallback UI with selectable `<input>`; documented in spec edge cases |
| **i18n keys drift** between VN and EN | Low | Medium | Parity test extended + runs in CI |
| **Spotlight pan/zoom loses focus ring** | Low | Medium (a11y) | Keyboard nav via arrow keys moves `aria-activedescendant` on nodes; tested with axe |
| **Performance at 1000+ All Kudos posts** | Medium | Medium | Out of MVP scope; documented as post-launch virtualization work |

### Estimated Complexity

- **Frontend**: High (25+ new components, 5 custom hooks, 2 pure modules, polling + pan/zoom + clipboard + lightbox + dialog, full i18n, full a11y + reduced-motion support)
- **Backend**: High (13 Route Handlers, 5 migration files, 4 RPCs/triggers, Storage bucket + RLS, Zod validation)
- **Testing**: High (12 unit suites + 3 integration + 1 comprehensive E2E incl. axe; parity test; layout determinism test)

---

## Integration Testing Strategy

### Test Scope

- [x] **Component/Module interactions**: highlight carousel ↔ filter bar; list ↔ pagination cursor; spotlight ↔ polling; heart button ↔ reactions API ↔ optimistic state; compose trigger ↔ URL
- [x] **External dependencies**: Supabase SDK (auth + storage + DB); `navigator.clipboard`; `IntersectionObserver`; `matchMedia`
- [x] **Data layer**: 13 Route Handlers proxying to Supabase with RLS; fixture fallback for MVP
- [x] **User workflows**: Filter apply → both sections refetch; reaction toggle → counter updates; load-more → append without duplicates; compose dialog deep-link

### Test Categories

| Category | Applicable? | Key Scenarios |
|----------|-------------|---------------|
| UI ↔ Logic | Yes | Carousel prev/next + disabled states; filter state drives fetches; load-more appends |
| Service ↔ Service | Yes | Route Handler → Supabase (with RLS); uploads → storage → kudos create |
| App ↔ External API | Yes | Supabase auth session refresh; clipboard API permission flow |
| App ↔ Data Layer | Yes | Pagination cursor correctness; reaction idempotency; box-open once-per-box |
| Cross-platform | Yes | Responsive 320/768/1024/1440; reduced-motion; touch vs pointer events for pan/zoom |

### Test Environment

- **Environment type**: Jest jsdom (unit + integration), Playwright headless Chromium + Firefox + WebKit (E2E), local `next dev` at port 3000 with seeded Supabase local dev (`supabase start`).
- **Test data**: Inline fixtures + seeded local Supabase rows. No staging DB dependency.
- **Isolation**: Each test owns its own Supabase schema snapshot via `supabase db reset` between E2E runs; unit tests mock at service-layer boundary.

### Mocking Strategy

| Dependency | Strategy | Rationale |
|------------|----------|-----------|
| `next-intl` | Mock with fixture messages (existing Awards pattern) | Deterministic string assertions |
| Supabase client in unit | Mock the 13 service functions | Unit tests assert component behavior given data |
| Supabase client in integration | Seeded local Supabase | Exercise RLS + triggers |
| `IntersectionObserver` + `matchMedia` | Stub in `jest.setup.ts` | jsdom doesn't implement |
| `navigator.clipboard.writeText` | `jest.fn()` replacement + reject variant for fallback path | Can't write to real clipboard in jsdom |
| `setInterval` for polling | `jest.useFakeTimers()` + `jest.advanceTimersByTime(30_000)` | Deterministic polling tests |
| Pan/zoom pointer events | `fireEvent.pointerDown/Move/Up` + `wheel` | Testing Library supports pointer events |
| Real browser for E2E | No mocks | Exercise actual polling + pan + pointer |

### Test Scenarios Outline

1. **Happy path**
   - [ ] `/kudos` loads; Highlight carousel renders 5 cards; All Kudos page 1 (10 cards) renders; Spotlight counter shows non-zero; sidebar stats render.
   - [ ] Heart toggle increments + persists on reload.
   - [ ] Copy-link writes canonical URL + toast.
   - [ ] Filter Hashtag → both sections refetch + carousel resets to 1/N.
   - [ ] Scroll to bottom of list → next page fetched.
   - [ ] Spotlight polling tick → counter increments.

2. **Error handling**
   - [ ] Highlight fetch fails → error card + retry.
   - [ ] Reaction POST 500 → optimistic rollback + toast.
   - [ ] Clipboard permission denied → fallback UI.
   - [ ] Upload 413 → inline row error + other uploads preserved.
   - [ ] Spotlight 3 failing polls → pause + "Kết nối lại…" indicator.
   - [ ] Unauthenticated `/kudos` → redirect to `/login?returnTo=%2Fkudos`.

3. **Edge cases**
   - [ ] Empty highlights (filter with 0 results) → empty-state message + hidden arrows/counter.
   - [ ] 0 All Kudos → empty illustration.
   - [ ] `boxes_unopened === 0` → Mở quà disabled.
   - [ ] `prefers-reduced-motion: reduce` → no node-arrival animation, no scale-bounce on heart.
   - [ ] Viewport 375 px (mobile) → sidebar stacks below list; highlights 1-up swipe; spotlight single-col.
   - [ ] Back button after `?compose=1` → closes dialog.
   - [ ] i18n switch mid-view → re-render with new strings; stats numbers unchanged.

### Tooling & Framework

- **Test framework**: Jest 30 + `@testing-library/react` (unit + integration); Playwright + axe-playwright (E2E + a11y).
- **Supporting tools**: Next.js Jest plugin; jsdom polyfills; Supabase CLI for local DB reset.
- **CI integration**: Existing pipeline (`pnpm typecheck && pnpm test && pnpm test:e2e`) extended to run new suites. Parity test + layout determinism test run in unit stage.

### Coverage Goals

| Area | Target | Priority |
|------|--------|----------|
| US1 Highlight browse | 90 %+ | High |
| US2 Reactions + copy-link | 90 %+ | High |
| US3 All Kudos pagination | 85 %+ | High |
| US4 Spotlight interactions | 80 %+ | Medium |
| US5 Stats + gift box | 80 %+ | Medium |
| US6 Filters | 80 %+ | Medium |
| Spotlight layout determinism | 100 % (pure fn) | High |
| Tier computation | 100 % (pure fn) | High |
| Responsive behavior | 75 %+ | Medium |

---

## Dependencies & Prerequisites

### Required Before Start

- [x] `constitution.md` reviewed and understood.
- [x] `spec.md` approved — 10 Resolved Decisions folded in.
- [x] `design-style.md` complete.
- [ ] `research.md` — **NOT created**. Heavy pattern reuse from Homepage + Awards already documented in §Integration Points; no separate research doc needed.
- [ ] Backend: 13 endpoints either stubbed via Route Handler fixtures (MVP path) or scheduled for backend team.
- [ ] Database migrations: 5 migration files planned (above); needs DBA review before apply.
- [ ] `zod` presence verified in `package.json` (used by Route Handler validation).

### External Dependencies

- `mcp__momorph__get_media_files` access for Phase 0 asset downloads (10 new assets).
- Supabase local dev (`supabase start`) for integration tests.
- Supabase Storage bucket `kudos-attachments` creation (migration).
- Content team deliverables: tier thresholds final values (placeholder ok for MVP); toast copy; empty-state copy.

---

## Next Steps

After plan approval:

1. Run `/momorph.reviewplan` for a staff-engineer second pass.
2. Run `/momorph.tasks` to generate the ordered task breakdown (Phase 0 → Phase 6 → Tests).
3. Verify `zod` is in `package.json` before Phase 1 begins.
4. Begin implementation following TDD order: failing test → implementation → green.

---

## Notes

- **Heavy reuse**: Header + Footer + SectionHeader + Icon + design-token plumbing carry over from Homepage/Awards. The hero in Kudos is simpler than the Homepage hero (no countdown, no CTAs) and does **not** use `HeroBackdrop` — we build a dedicated `KudosHero` to keep concerns clean (unlike Awards which initially tried to add an `awards` variant to `HeroBackdrop` and then removed it).
- **Client-heavy page**: unlike Awards (fully static SSR), Kudos has 4 concurrent client islands doing independent work (carousel, list, spotlight polling, sidebar). The top-level `KudosPageClient` owns only cross-cutting state (filters, toasts, compose URL) — each island owns its local state.
- **Polling vs push**: Per D7 we use 30-s polling. If backend later adds SSE, the `usePolling` hook becomes a `useSseStream` swap at the data-layer without touching UI code.
- **Spotlight layout purity**: the layout fn is a pure deterministic module — takes `nodes + bounds`, returns `{ kudo_id, x, y }[]`. Easy to unit-test; stable across renders; new poll results are appended (not re-laid-out) to avoid visual jitter.
- **Backend parity**: frontend Route Handlers + fixtures let the frontend ship before backend. When backend is ready, each handler becomes a thin wrapper over Supabase queries without changing the public contract.
- **Emoji reactions** (P3): the `POST /api/kudos/:id/reactions` endpoint is designed to accept `{ type: "heart" | "emoji_<name>" }` so adding emoji later is a UI + i18n change only.
- **Gift box reward modal** (visual-scope deferred): the plan includes `GiftModal` as a component but its visual spec is not in `design-style.md` — will be refined during Phase 5 from live dev iteration or a follow-up design-style patch.
- **Kudo compose dialog** (separate screen): this plan implements only the trigger (`KudosComposeTrigger` + URL sync). The dialog content is a separate spec and will be its own `MaZUn5xHXZ-compose` feature.
- **Accessibility critical**: Spotlight Board is the highest-risk component. Plan explicitly budgets for keyboard nav (arrow keys cycle nodes) + `aria-describedby` tooltips + reduced-motion. E2E must include axe with 0 violations.

---

## Resolved Decisions (2026-04-22)

- **D-plan-1. `zod` addition**: ✅ approved — add `zod` to `package.json` as a justified exception. Used for Route Handler request/query validation.
- **D-plan-2. Backend path**: ✅ **build Supabase backend immediately** (not fixtures-first). Phase 2 now includes real Supabase migrations, RLS, triggers, storage bucket, and Route Handlers that call Supabase. No fixtures-based intermediate ship.

## Remaining Open Questions (non-blocking)

**Scope (can start Phase 1 without these):**
- Q3. **GiftModal visual**. `design-style.md` does not specify the reward modal's visual layout. Plan assumes minimal spec (icon + title + value + close) iterated in Phase 5.
- Q4. **Kudos detail page** (`/kudos/<id>`). Copy-link + spotlight-click target. Treated as separate spec; copy-link will land on a 404 until that page ships. Is 404 acceptable for MVP, or should we stub a minimal placeholder route?
- Q5. **User profile page** (`/users/<id>`). Avatar/name clicks. Same question as Q4.

**Architecture (optimizations — can defer):**
- Q6. **Spotlight polling cadence on mobile**. Plan hardcodes 30 s. Reduce to 60 s on `navigator.connection.saveData === true`? Post-MVP tuning.

---

## Review Changelog (`/momorph.reviewplan` pass — 2026-04-22)

Applied in this review pass:
- **Coverage check**: cross-referenced all 8 user stories + 13 API endpoints + 13 design-style components. All covered by phases.
- **File location fix**: moved `kudosSpotlightLayout.ts` → `src/lib/kudos/spotlight-layout.ts` for consistency with `src/lib/kudos/tier.ts` (both pure modules).
- **UI primitive placement**: `Dialog`, `Toast`, `Lightbox` moved from `src/components/kudos/` to `src/components/ui/` — they're cross-feature primitives (Dialog will be reused by future compose dialog; Toast is cross-feature; Lightbox is a general image viewer).
- **Added missing components**: `KudosSkeleton.tsx`, `Dialog.tsx` (shared), 4 new unit test files (`KudoImageGrid`, `Lightbox`, `Dialog`, `Toast`).
- **Asset count fix**: 10 → 11 (13 file outputs once path splits are counted); explicit Pen + Search verification note for Awards-batch reuse.
- **Migration folder**: flagged that `supabase/migrations/` doesn't exist yet — first migration creates it; Supabase timestamp convention `YYYYMMDDHHMMSS_name.sql` specified.
- **New DB table**: `tier_change_events` added (needed by tier-upgrades leaderboard); tier-advance trigger populates it + grants secret box in same transaction.
- **Compose placeholder**: explicit `KudosComposePlaceholder` dialog mandated for US7 testability without blocking on full compose spec.
- **Image error handling**: `onError` fallback to "Đang tải…" placeholder explicit in Phase 3 (spec edge case).
- **RLS refinement**: `user_kudo_stats` split — full row self-only; `(user_id, tier)` projection readable by any authenticated (needed for tier-badge rendering on Kudo cards).
- **Open Questions section added**: 6 questions surfaced for product + architecture alignment. Q1 (zod) and Q2 (backend readiness) are Phase-1 blockers.
