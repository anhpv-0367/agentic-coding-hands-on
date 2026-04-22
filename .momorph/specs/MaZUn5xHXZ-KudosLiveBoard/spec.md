# Feature Specification: Sun* Kudos – Live Board

**Frame ID**: `2940:13431`
**Frame Name**: `Sun* Kudos - Live board`
**Screen ID**: `MaZUn5xHXZ`
**File Key**: `9ypp4enmFmdK3YAFJLIu6C`
**Figma Link**: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/MaZUn5xHXZ
**Canvas Size**: `1440 × 5862 px` (desktop)
**Created**: 2026-04-22
**Status**: Draft

---

## Overview

The **Sun\* Kudos – Live Board** (`/kudos`) is an authenticated peer-recognition showcase for SAA 2025. It is the public-facing activity hub where Sunners can:

- Browse the 5 most-liked Kudos of the last 7 days ("HIGHLIGHT KUDOS" carousel).
- Watch recent activity flow in the real-time **Spotlight Board** (a word-cloud/diagram of up to 118 recipient name-nodes with pan/zoom, refreshed every 30 s).
- Scroll the **All Kudos** paginated feed of full-length Kudo posts.
- See their personal stats (received / sent / hearts / gift boxes) and the top-10 latest-rising / latest-gifted Sunners in the right sidebar.
- Open a compose dialog to send a new Kudo via the "Ghi nhận" action bar.

The page is read-heavy and reactive: users can like Kudos, copy share-links, open gift boxes, filter by hashtag or department, search a specific Sunner, and navigate to individual Kudos detail pages.

### Layout at a glance

1. **Header** (reused, `selectedNav="kudos"`)
2. **Keyvisual (Hero)** — dark artwork with "SAA 2025 KUDOS" branding and page subtitle "Hệ thống ghi nhận lời cảm ơn" (no countdown, no CTAs).
3. **Action bar** — 738 × 72 pill "Ghi nhận" text input (placeholder "Hôm nay, bạn muốn gửi lời cảm ơn và ghi nhận đến ai?") which opens the Send-Kudo dialog.
4. **Highlight Kudos** section — `Sun* Annual Awards 2025` caption + `HIGHLIGHT KUDOS` h1 + 2 filter dropdowns (Hashtag, Phòng ban) + 5-card carousel with active-center / faded-sides + prev/next controls + `N/5` page counter.
5. **Spotlight Board** — 1157 × 548 bordered panel with `388 KUDOS` counter, search-sunner pill, word-cloud of recipient names laid over the "Root further mo rong" backdrop, plus pan/zoom.
6. **Main content row** — left column: **All Kudos** paginated list (680-wide post cards). Right column: **Sidebar (422 × 933)** with personal stats card + `Mở quà` CTA + two 10-item leaderboards (`10 SUNNER CÓ SỰ THĂNG HẠNG MỚI NHẤT`, `10 SUNNER NHẬN QUÀ MỚI NHẤT`).
7. **Footer** (reused, minimal — copyright only, consistent with Awards page).

### Relation to other screens

- Reused from Homepage: `<Header>`, `<Footer>`, design tokens.
- Entry points: Homepage "ABOUT KUDOS" CTA, Homepage Sun\* Kudos promo "Chi tiết", Header/Footer "Sun\* Kudos" nav, Awards page Sun\* Kudos promo "Chi tiết", direct `/kudos` URL.
- Exits: "Ghi nhận" → Send-Kudo dialog (target screen TBD); sender/recipient avatar click → Profile (target screen TBD); per-card "Xem chi tiết" → Kudos detail (target screen TBD); SAA logo → `/`; Header nav → respective routes; Sign out → `/login`.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 – Browse Highlight Kudos Carousel (Priority: P1) 🎯 MVP

An authenticated Sunner opens `/kudos` and immediately sees the 5 most-liked Kudos of the event rotating in the **HIGHLIGHT KUDOS** carousel. One card is visually "active" in the center; the two adjacent cards are faded. Prev/next arrows and a `N/5` counter navigate.

**Why this priority**: This is the primary "hero" content of the live board — without it, the page has no centerpiece.

**Independent Test**: Log in, visit `/kudos`. Verify (a) 5 total Kudos loaded into the carousel, (b) slide 1 of 5 is shown active-center with its neighbors faded, (c) clicking the next arrow advances to slide 2 and updates the counter to `2/5`, (d) the left arrow is disabled at slide 1 and the right arrow is disabled at slide 5.

**Acceptance Scenarios**:

1. **Given** user is logged in and Kudos highlights exist, **When** they visit `/kudos`, **Then** the HIGHLIGHT KUDOS section renders 5 cards in order of heart count desc; card at index 0 is active-center; left arrow is disabled.
2. **Given** the carousel is at slide 3, **When** user clicks the next arrow, **Then** the carousel animates forward, card at index 3 becomes active, counter updates to `4/5`, left arrow enabled, right arrow enabled.
3. **Given** the carousel is at slide 5, **When** user clicks the next arrow, **Then** nothing happens (arrow disabled, cursor not-allowed, `aria-disabled="true"`).
4. **Given** the user applies a hashtag filter that returns 0 highlights, **When** the filter is applied, **Then** the carousel shows an empty state ("Chưa có kudo phù hợp") and both arrows + counter are hidden.
5. **Given** a highlight card's message is longer than 3 lines, **When** the card is rendered, **Then** the message truncates to 3 lines with an ellipsis (`text-overflow: ellipsis`).
6. **Given** a highlight card has more than 5 hashtags, **When** the card is rendered, **Then** only 5 are shown on the first line and the rest truncate with `...`.

---

### User Story 2 – React to Kudos & Copy Share Link (Priority: P1)

From either the Highlight carousel or the All Kudos list, a Sunner can like (heart-tap) or copy the share link of any Kudo without leaving the page.

**Why this priority**: Reactions are the core social signal of the live board (heart counts drive Highlight ranking). Share-links enable off-platform distribution. Both are required for the page to be "live".

**Independent Test**: On `/kudos`, click the heart on any Kudo card → heart turns red, count increments by 1, and the change persists on reload. Click "Copy Link" → clipboard contains the canonical kudos URL and a toast "Link copied — ready to share!" appears.

**Acceptance Scenarios**:

1. **Given** a Kudo card with `heart_count=42` and not yet liked by me, **When** I click the heart, **Then** the heart fills red, count becomes `43`, and `POST /api/kudos/:id/reactions` is called with `{ type: "heart" }`. On success the UI state is persisted; on error the optimistic update is rolled back and a toast shows the error.
2. **Given** a Kudo I already liked, **When** I click the heart again, **Then** the heart returns to gray, count decrements by 1, and `DELETE /api/kudos/:id/reactions` is called.
3. **Given** a Kudo card, **When** I click "Copy Link", **Then** the canonical URL (`https://<domain>/kudos/<kudo_id>`) is written to `navigator.clipboard` and a toast "Link copied — ready to share!" appears for ~3 s.
4. **Given** the browser denies clipboard permission, **When** I click "Copy Link", **Then** a fallback UI opens (prompt/selection-friendly URL display) so the user can manually copy.
5. **Given** I am offline, **When** I click the heart, **Then** the optimistic UI update happens, the request is retried on reconnect (via `navigator.onLine`), and the toast shows "Đang chờ kết nối…".

---

### User Story 3 – Browse & Load-more All Kudos List (Priority: P1)

Below the Spotlight Board, a paginated list of full-length Kudo posts (680 × 749 cards) lets users catch up on the entire event feed. Default page size 10; infinite scroll / "Load more" button at the bottom.

**Why this priority**: The All Kudos list is the canonical feed — without it, only 5 highlights + the spotlight abstraction exist. Users need to browse the full archive.

**Independent Test**: Visit `/kudos`, scroll past the spotlight → All Kudos list renders 10 cards. Scrolling to the bottom triggers the next page (or pressing Load more). Total entries eventually load.

**Acceptance Scenarios**:

1. **Given** `/kudos` is loaded, **When** the All Kudos section becomes visible, **Then** the first page (default 10 entries) is fetched from `GET /api/kudos?cursor=&limit=10`.
2. **Given** 10 entries are shown, **When** the user scrolls within 200 px of the bottom of the list, **Then** the next cursor is requested; a loading spinner replaces the Load-more button while fetching.
3. **Given** the API returns `{ next_cursor: null }`, **When** the request resolves, **Then** "Đã hiển thị tất cả" is shown in place of the Load-more button.
4. **Given** the API returns 0 entries, **When** the initial load resolves, **Then** the empty state illustration + message "Chưa có kudo nào" is shown.
5. **Given** a Kudo post has 5 attached images, **When** the card renders, **Then** images are shown in a responsive grid (up to 3 per row). Clicking any image opens a full-screen lightbox.
6. **Given** a Kudo post body exceeds the visible card height, **When** the card renders, **Then** the body expands to its natural height (no 3-line clamp on list posts; clamp is highlights-only).

---

### User Story 4 – Real-time Spotlight Feed (Priority: P2)

The Spotlight Board shows a live word-cloud of 118 recipient names with their most recent activity overlaid. New Kudos arrivals animate into the cloud; clicking a name opens its latest Kudo; hovering reveals a tooltip with the recipient name + receive-time.

**Why this priority**: This is the "live" differentiator — but the page works without it (static snapshot at page-load is acceptable fallback for MVP).

**Independent Test**: Visit `/kudos`, observe the Spotlight panel — names are scattered with pan/zoom, the "388 KUDOS" total updates when a new Kudo lands, hover shows a tooltip, click navigates to that Kudo's detail page.

**Acceptance Scenarios**:

1. **Given** the page is loaded, **When** the Spotlight Board mounts, **Then** it fetches `GET /api/kudos/spotlight-feed?limit=118` and renders the names as interactive nodes within the "Root further mo rong" canvas.
2. **Given** a node is hovered, **When** the pointer enters, **Then** a tooltip appears with format `"<recipient_name> — <time>: <event_summary>"` (e.g., "Nguyễn Bá Chức — 08:30 PM: đã nhận được một Kudos mới").
3. **Given** a node is clicked, **When** the click fires, **Then** the browser navigates to the detail page of that recipient's most recent Kudo (`/kudos/<kudo_id>`).
4. **Given** the feed is polling, **When** a new Kudo arrives on the backend, **Then** the next poll (every 30 s) surfaces it — the counter increments from `388` to `389`, and a new node animates into the cloud.
5. **Given** the user uses the spotlight-scoped search input "Tìm kiếm sunner", **When** they type a name, **Then** matching nodes in the cloud are highlighted and non-matching nodes fade to 30% opacity.
6. **Given** the user drags the canvas, **When** they pan, **Then** the cloud translates under the pointer; pinch/scroll-wheel zooms within `[0.5, 2.0]` scale bounds.
7. **Given** `prefers-reduced-motion: reduce`, **When** new nodes arrive, **Then** they appear instantly without animation.

---

### User Story 5 – Personal Stats & Gift Box Sidebar (Priority: P2)

The right sidebar shows the logged-in user's personal Kudos stats (Số Kudos nhận / gửi, tổng tim, số secret box đã/chưa mở) and a "Mở quà" CTA. When the user has an unopened gift, clicking opens a reward modal. Below the stats are two 10-item leaderboards: latest tier-upgrades and latest gift recipients.

**Why this priority**: Gamification + personal reinforcement. Enhances engagement but page still works without it.

**Independent Test**: Visit `/kudos` → sidebar renders my stats (e.g., "Số Kudos bạn nhận được: 12"). If I have unopened boxes, the "Mở quà" button is enabled and shows a badge. Clicking opens the reward modal.

**Acceptance Scenarios**:

1. **Given** I am authenticated, **When** `/kudos` loads, **Then** `GET /api/kudos/stats/me` returns `{ received, sent, hearts, boxes_opened, boxes_unopened, tier }` and the sidebar renders each value.
2. **Given** `boxes_unopened > 0`, **When** the sidebar renders, **Then** "Mở quà" button is enabled with gold glow, and `boxes_unopened` is shown as a numeric badge.
3. **Given** `boxes_unopened === 0`, **When** the sidebar renders, **Then** "Mở quà" button is disabled (`aria-disabled="true"`, opacity 0.5).
4. **Given** I click "Mở quà" with an unopened box, **When** the request resolves, **Then** `POST /api/users/me/boxes/next/open` returns the reward payload and a modal dialog displays the reward with animation. `boxes_opened` increments and `boxes_unopened` decrements in local state.
5. **Given** the top-10 leaderboards mount, **When** `GET /api/kudos/leaderboard/tier-upgrades?limit=10` and `GET /api/kudos/leaderboard/gift-recipients?limit=10` resolve, **Then** both lists render with avatar + name + description.
6. **Given** a leaderboard entry is clicked (avatar or name), **When** the click fires, **Then** the browser navigates to that user's profile page.
7. **Given** either leaderboard returns 0 entries, **When** the list resolves, **Then** "Chưa có dữ liệu" is shown in place.

---

### User Story 6 – Filter & Search (Priority: P2)

Users can (a) filter the Highlight carousel + All Kudos list by hashtag and/or department, and (b) search the Spotlight Board by Sunner name.

**Why this priority**: Discovery helpers — useful but not blocking for MVP read-only experience.

**Independent Test**: Apply `Hashtag: #Dedicated` → Highlight carousel + All Kudos list narrow to posts carrying that hashtag; the counter resets to `1/N` where N is the new filtered count. Typing "Hiệp" in the Spotlight search → Spotlight nodes matching "Hiệp" highlight and others fade.

**Acceptance Scenarios**:

1. **Given** the filter dropdowns render, **When** clicked, **Then** each shows a list of all available options (hashtags / departments) fetched from `GET /api/kudos/filters` at page-load.
2. **Given** the user selects a hashtag, **When** the selection applies, **Then** both the Highlight carousel and the All Kudos list refresh with `?hashtag=<selected>` appended; carousel resets to slide 1; list resets to cursor null.
3. **Given** the user selects both a hashtag and a department, **When** filters apply, **Then** the refreshed queries carry both filter params (AND semantics).
4. **Given** the Spotlight search input receives text, **When** the user types, **Then** matching recipient nodes scale up + gold highlight; non-matches fade to 30% opacity. Debounced at 200 ms.
5. **Given** the user clears all filters, **When** filters empty, **Then** both sections refetch with no filter params.

---

### User Story 7 – Compose a Kudo (Priority: P2)

Clicking the "Ghi nhận" pill opens a dialog/modal where the user can recipient-search, choose a hashtag, type a message, attach images, then submit.

**Why this priority**: Sending Kudos is the origination side of the loop — important but the live board can exist read-only.

**Independent Test**: Click the "Ghi nhận" pill on `/kudos` → compose dialog opens. Fill all required fields → submit → new Kudo appears in the All Kudos list + Spotlight feed within 1 poll-cycle.

**Acceptance Scenarios**:

1. **Given** I click the "Ghi nhận" pill, **When** the click fires, **Then** a modal dialog mounts (scope: separate screen/modal `MaZUn5xHXZ`-adjacent — specified separately). The URL updates to `/kudos?compose=1` (or similar) so the state is deep-linkable.
2. **Given** the compose dialog is open, **When** I select a recipient, pick a hashtag, type a message (min 10 chars), optionally attach ≤5 images, and click "Gửi", **Then** `POST /api/kudos` submits the payload, the dialog closes on success, and the All Kudos list + spotlight feed refreshes.
3. **Given** I attempt to submit without required fields, **When** validation fails, **Then** each invalid field shows an inline error and the submit button stays disabled.
4. **Given** the recipient search input receives text, **When** I type, **Then** `GET /api/sunners?search=<q>&limit=10` autocompletes matches.
5. **Given** submission fails (e.g. network error), **When** the error is caught, **Then** an inline dialog error toast shows and the user's draft is preserved.

> The full compose dialog UX belongs to a separate spec (screen TBD). This spec captures only the entry point ("Ghi nhận" pill) and its integration contract.

---

### User Story 8 – Chrome Continuity (Priority: P3)

Header and Footer render consistently with the rest of SAA 2025: Header shows "Sun\* Kudos" as the selected nav item (gold underline + glow), Footer is minimal (copyright only, matching the Awards page convention).

**Independent Test**: On `/kudos`, the header nav "Sun\* Kudos" is gold with underline + text-shadow glow; footer only shows "Bản quyền thuộc về Sun\* © 2025".

**Acceptance Scenarios**:

1. **Given** `/kudos` loads, **When** the header renders, **Then** the Sun\* Kudos nav item is in the selected state.
2. **Given** `/kudos` loads, **When** the footer renders, **Then** only the copyright line appears (Footer `variant="minimal"`).
3. **Given** the user clicks the SAA logo in the header, **When** the click fires, **Then** the browser navigates to `/`.
4. **Given** the user clicks Profile → Sign out, **When** sign-out completes, **Then** the browser navigates to `/login`.

---

### Edge Cases

- **Unauthenticated access**: middleware redirects to `/login?returnTo=%2Fkudos`.
- **Slow connection**: show skeleton shimmers for Highlight cards, Spotlight canvas, All Kudos list cards, and sidebar stats until each section resolves.
- **Spotlight feed polling backoff**: if 3 consecutive poll requests fail, pause polling and show a subtle "Kết nối lại…" indicator; resume on next success or user action.
- **Concurrent heart toggles**: debounce heart toggles at 500 ms per card to prevent rapid spam; backend idempotency key = `(user_id, kudo_id, type)`.
- **Viewport width 320–767 px (mobile)**: sidebar collapses below the All Kudos list (stacked single column); Spotlight board becomes horizontally scrollable with reduced canvas height; Highlight carousel shows 1 card at a time (no side-fade).
- **Viewport 768–1023 px (tablet)**: 2-column layout (main content + sidebar ~320 px); Highlight shows 1 center card (no side peeks); Spotlight board fills full width; All Kudos card stays ≤680 px wide.
- **Back button behavior**: compose-dialog open state is in URL (`?compose=1`) so Back closes the dialog rather than leaving the page. Carousel slide and spotlight pan/zoom state is ephemeral (not in URL).
- **i18n mid-view**: locale toggle re-renders all visible strings; numeric counts stay stable (already locale-free); dates/times re-format through `Intl.DateTimeFormat`.
- **Image load fails (e.g. server storage unreachable, broken URL)**: per-card image slot falls back to a "Đang tải…" placeholder + retry-on-click. Image element uses `onError` handler to swap to placeholder.
- **Image upload fails** (during compose): inline error on the upload row; the already-typed message + other uploaded images are preserved; failed row shows "Thử lại" button.
- **Right-to-left (RTL)**: not in scope.

---

## UI/UX Requirements *(from Figma)*

Visual specs live in **`design-style.md`** — this section references that document for pixel-level details.

### Screen Components

| Component | Ref | Description | Interactions |
|-----------|-----|-------------|--------------|
| Header | shared (`/components/layout/Header.tsx`) | Fixed top bar, `variant="full"`, `selectedNav="kudos"` | Reused |
| Keyvisual | `2940:13432` | Full-width 1440×512 artwork + SAA 2025 KUDOS wordmark + subtitle | Static |
| Action bar (Ghi nhận) | `2940:13449` | 738×72 pill input "Hôm nay, bạn muốn gửi lời cảm ơn…" | Click → open compose dialog |
| Section header (Highlight) | inside `2940:13451` | Caption + h1 + 2 filter dropdowns | Dropdowns on click |
| Highlight carousel | `2940:13463` | 5 cards with active-center / faded-sides | Prev/next, heart, copy-link, view detail |
| Carousel controls | `2940:13471` | Prev button + `N/5` counter + next button | Prev/next |
| Spotlight Board | `2940:14174` | 1157×548 word-cloud of 118 recipient names + 388 KUDOS counter + search + pan/zoom | Hover tooltip, click node, pan, zoom, search highlight |
| All Kudos list | under `C_All kudos` (`2940:13475`) | Vertical list of 680×749 post cards | Scroll, load-more, heart, copy-link, view detail, open image lightbox |
| Sidebar stats | `D.1` (`2940:13489`) | Personal Kudos stats + Mở quà | Open gift modal |
| Sidebar leaderboards | `D.3` (`2940:13510`) + sibling | Top-10 tier-upgrades + top-10 gift-recipients | Avatar/name click → profile |
| Footer | shared | `variant="minimal"` (copyright only) | Static |

### Navigation Flow

- **Entry**: direct `/kudos` URL, Homepage "ABOUT KUDOS" CTA, Homepage Sun\* Kudos promo, Header/Footer "Sun\* Kudos" link, Awards page Sun\* Kudos promo.
- **Exit**:
  - Compose dialog (from "Ghi nhận") — internal modal, not a route change beyond `?compose=1`.
  - Per-card "Xem chi tiết" → `/kudos/<kudo_id>`.
  - Spotlight node click → `/kudos/<kudo_id>`.
  - Avatar/name click → `/users/<user_id>` (profile screen TBD).
  - Header SAA logo → `/`.
  - Header nav → respective route.
  - Profile menu → `/profile`, `/admin`, or `/login` on sign-out.

### Visual Requirements

- **Responsive breakpoints**: Mobile <768, Tablet 768–1023, Desktop ≥1024. See `design-style.md` §Responsive.
- **Animations**:
  - Carousel slide transition: 300 ms ease-out.
  - Heart tap: 200 ms scale-bounce.
  - Toast "Link copied": fade-in 150 ms, hold 2.5 s, fade-out 150 ms.
  - Gift modal entry: 250 ms scale + fade.
  - Spotlight node arrival: 300 ms fade+translate.
  - All animations disabled when `prefers-reduced-motion: reduce`.
- **Accessibility**:
  - **Page heading hierarchy**: exactly one `<h1>` per page. Options: (a) visually-hidden `<h1>Sun* Kudos – Bảng ghi nhận</h1>` inside the hero for SEO + screen-readers, with `HIGHLIGHT KUDOS` demoted to `<h2>`; OR (b) `HIGHLIGHT KUDOS` is the visible `<h1>` and the hero subtitle "Hệ thống ghi nhận lời cảm ơn" is plain styled text. **Chosen: option (a)** — keeps the hero visually decorative while preserving landmark structure. The hero SAA 2025 KUDOS wordmark is an `<img alt="" aria-hidden="true">` (pure decoration).
  - Section headings: `<h2>` for "HIGHLIGHT KUDOS", `<h2>` for "ALL KUDOS", `<h2>` for each sidebar card title (Stats, Tier-upgrades, Gift-recipients), `<h2>` for "Spotlight Board" (visually-hidden label).
  - All interactive controls are native `<button>` / `<a>` elements with `aria-label` where visual text is missing (e.g., prev/next arrows).
  - Active carousel slide has `aria-current="true"`; non-active slides have `aria-hidden="true"` when inert.
  - Heart button has `aria-pressed={liked}` and `aria-label="Thả tim cho Kudo của <recipient_name>"`.
  - Copy-link button: `aria-label="Sao chép link Kudo"`; toast is announced via `role="status"` + `aria-live="polite"`.
  - Spotlight board: node-canvas is keyboard-navigable (arrow keys cycle through nodes, Enter opens detail). Tooltips are connected via `aria-describedby`.
  - Filter dropdowns: `<button aria-haspopup="listbox" aria-expanded=…>` with `<ul role="listbox">` and `<li role="option" aria-selected=…>`.
  - Focus ring: `2 px solid #FFEA9E` offset 2 on all interactive elements.
  - Color contrast: `#FFEA9E` on `#0B0F12` = 12.6:1 ✅; `#FFFFFF` on `#FFF8E1` card bg ≈ not compliant — **use `#0B0F12` (page bg color) for card text** (contrast 17.8:1 ✅). Design-style.md documents this resolution.
  - `aria-current="location"` on header nav when on `/kudos`.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST render the Kudos page at protected route `/kudos` — authenticated users only; existing middleware redirect applies.
- **FR-002**: System MUST render the 5 highlight Kudos (rolling 7-day window; ordered by `heart_count DESC, created_at DESC`) from `GET /api/kudos/highlights` in a carousel with active-center / faded-sides visual.
- **FR-003**: Carousel MUST support prev/next arrow navigation; left arrow disabled at index 0, right arrow disabled at index 4. Counter MUST display `<current>/5`.
- **FR-004**: Each highlight card MUST show: sender (avatar, name, tier badge), send-arrow icon, recipient (avatar, name, tier badge), timestamp, primary hashtag chip (rendered as the "category tag" slot — first hashtag in the array), message body (clamped to 3 lines with ellipsis), remaining hashtags (clamped to 1 line with `...`), heart count + heart-toggle button, copy-link button, "Xem chi tiết" link.
- **FR-005**: Each All Kudos list post card MUST show the same fields as highlights PLUS attached image gallery (up to 5 images in a responsive grid). Message body and hashtag list are NOT clamped in the list view.
- **FR-006**: Heart toggle MUST optimistically update the UI and call `POST /api/kudos/:id/reactions` (type `heart`) on like and `DELETE /api/kudos/:id/reactions` on unlike. On error the optimistic update MUST be rolled back and a toast displayed.
- **FR-007**: Copy-link MUST call `navigator.clipboard.writeText(<canonical_url>)` and display a toast "Link copied — ready to share!" for 2.5 s. Canonical URL format: `<origin>/kudos/<kudo_id>`.
- **FR-008**: All Kudos list MUST paginate using cursor pagination (`GET /api/kudos?cursor=&limit=10`). Next page fetch MUST trigger when the user scrolls within 200 px of the bottom of the list OR clicks "Load more".
- **FR-009**: Spotlight Board MUST render a canvas of up to 118 recipient name-nodes from `GET /api/kudos/spotlight-feed?limit=118`. The backend returns `{ kudo_id, recipient, received_at }` per node; **the frontend computes layout positions** via a hand-rolled deterministic pack-layout (seeded concentric rings or jittered grid with axis-aligned bounding-box collision checks). No new npm library — implementation uses only vanilla TS + existing project dependencies. Positions are cached in component state across polls; new nodes are inserted at the nearest available empty slot.
- **FR-010**: Spotlight Board MUST support hover-tooltips (name + relative time + event summary), click-to-detail navigation, pan + zoom (scale range `[0.5, 2.0]`), and a search-highlight mode where matching nodes scale + gold-highlight and non-matches fade to 30% opacity.
- **FR-011**: Spotlight counter "N KUDOS" MUST reflect the backend total. It MUST update on each poll cycle (30 s) without a full page reload.
- **FR-012**: Sidebar personal stats MUST render `received`, `sent`, `hearts`, `boxes_opened`, `boxes_unopened` from `GET /api/kudos/stats/me`.
- **FR-013**: "Mở quà" button MUST be enabled iff `boxes_unopened > 0`. Click calls `POST /api/users/me/boxes/next/open`; response opens a reward modal.
- **FR-014**: Two leaderboards MUST render from `GET /api/kudos/leaderboard/tier-upgrades?limit=10` and `GET /api/kudos/leaderboard/gift-recipients?limit=10`. Each row: avatar + name + description/meta.
- **FR-015**: Highlight + All Kudos MUST support filtering by `hashtag` (free-form, derived from distinct observed hashtags) and `department` (closed enum, backend-supplied). Filter dropdowns MUST populate from `GET /api/kudos/filters`. Applied filters MUST refetch both sections and reset pagination.
- **FR-016**: Both search inputs (header action bar + spotlight) MUST autocomplete Sunners via `GET /api/sunners?search=<q>&limit=10` with a 200 ms debounce.
- **FR-017**: "Ghi nhận" pill MUST open the compose-kudo dialog. URL MUST reflect open state (e.g., `?compose=1`). Dialog submission MUST call `POST /api/kudos` with `{ recipient_id, hashtags: string[], message, attachment_urls: string[] }`. Image attachments are uploaded server-side (no CDN) via `POST /api/uploads` (multipart) before the main `POST /api/kudos` call; the returned URLs are included in the Kudo payload. Limits: JPG/PNG/WebP; ≤5 MB per image; ≤5 images per Kudo.
- **FR-018**: All user-visible strings MUST be rendered via `next-intl` under the `kudos.*` namespace. No hardcoded strings.
- **FR-019**: The page MUST render with shared `<Header variant="full" selectedNav="kudos" />` and `<Footer variant="minimal" />`.

### Technical Requirements

- **TR-001 (Performance)**: LCP ≤ 2.5 s (hero artwork + first highlight card). All Kudos list uses lazy image loading (native `loading="lazy"`). Virtualization is NOT planned for MVP (no new library) — if perf degrades past ~50 items, revisit with a lightweight hand-rolled IntersectionObserver windowing helper.
- **TR-002 (Accessibility)**: 0 axe-core WCAG 2.1 AA violations on the default view.
- **TR-003 (i18n completeness)**: 100 % of new strings (`kudos.*` namespace) exist in both `vi.json` and `en.json`; CI parity check enforces this.
- **TR-004 (SEO/metadata)**: `<title>` + `<meta description>` locale-aware via `generateMetadata` + `getTranslations("kudos.metadata")`.
- **TR-005 (Real-time)**: Spotlight feed polling interval = 30 s; on `visibilitychange → hidden` polling pauses; resumes on `visible`. MVP uses polling only (no SSE / WebSocket).
- **TR-006 (Rate limiting)**: Heart toggle is debounced at 500 ms per-card; backend enforces idempotency via `(user_id, kudo_id, type)` uniqueness.
- **TR-007 (Optimistic updates)**: Heart toggles and copy-link do not block user input; UI updates immediately and reconciles on server response.
- **TR-008 (Image attachments)**: Per-card images use `<img loading="lazy" decoding="async">`. Lightbox uses body-scroll-lock + focus-trap.

### Key Entities

- **Kudo** — `type Kudo = { id: string; sender: UserRef; recipient: UserRef; message: string; hashtags: string[]; created_at: string; heart_count: number; liked_by_me: boolean; attachment_urls: string[]; share_url: string }`. The first element of `hashtags` is rendered as the visual category chip; all elements are included in the hashtag list.
- **UserRef** — `type UserRef = { id: string; display_name: string; avatar_url: string; tier: "new" | "rising" | "super" | "legend"; department?: string }`.
- **KudosStats** — `type KudosStats = { received: number; sent: number; hearts: number; boxes_opened: number; boxes_unopened: number; tier: UserTier }`. `tier` is computed backend-side from `received` against threshold table (see Resolved Decisions D1). `boxes_unopened` increments by 1 each time `tier` advances (D2).
- **LeaderboardEntry** — `type LeaderboardEntry = { user: UserRef; description: string; rank: number; meta?: string }`.
- **SpotlightNode** — `type SpotlightNode = { kudo_id: string; recipient: UserRef; received_at: string }`. Backend does NOT supply `{ x, y }`; frontend computes layout at mount.
- **GiftBoxReward** — `type GiftBoxReward = { id: string; kind: "points" | "badge" | "coupon" | …; label: string; value?: number; image_url?: string }`.

### Environment Variables

No new env vars at MVP. Predicted later: `NEXT_PUBLIC_KUDOS_POLL_MS` (default 30000).

### State Management

**Local (Kudos page client islands)**:

| State | Type | Purpose |
|-------|------|---------|
| `highlights` | `Kudo[]` (len ≤ 5) | Carousel items |
| `currentSlide` | `number` | Active carousel index |
| `allKudos` | `Kudo[]` | Paginated list |
| `nextCursor` | `string \| null` | All Kudos pagination cursor |
| `allKudosLoading` | `boolean` | List fetch in-flight |
| `spotlightNodes` | `SpotlightNode[]` | Word-cloud nodes |
| `spotlightTotal` | `number` | "N KUDOS" counter |
| `spotlightSearchQuery` | `string` | Spotlight search input value |
| `spotlightHighlight` | `Set<string>` | Ids matching search |
| `filters` | `{ hashtag?: string; department?: string }` | Applied filters |
| `filterOptions` | `{ hashtags: string[]; departments: string[] }` | Dropdown options |
| `stats` | `KudosStats` | Personal stats card |
| `leaderboardTierUpgrades` | `LeaderboardEntry[]` | Top-10 tier-upgrade list |
| `leaderboardGiftRecipients` | `LeaderboardEntry[]` | Top-10 gift-recipient list |
| `giftModalReward` | `GiftBoxReward \| null` | Open-gift modal payload |
| `composeOpen` | `boolean` | Compose dialog open state (synced to URL `?compose=1`) |
| `toasts` | `Toast[]` | Ephemeral notifications (copy-link, errors) |

**Global**: Supabase session + `NEXT_LOCALE` cookie (existing).

**Data fetching strategy**: **no new data-fetching library** (per CLAUDE.md: do not add packages). Hybrid RSC + client fetch:

- **Server Component** (`src/app/kudos/page.tsx`) fetches initial data in parallel (highlights, first-page All Kudos, stats, leaderboards, spotlight snapshot) via native `fetch()` and passes to client components as props.
- **Client islands** own: carousel slide index, filters, load-more cursor, spotlight polling, reactions, toast queue, compose dialog state.
- **Polling** for spotlight implemented with `useEffect` + `setInterval(30_000)` + `document.visibilityState` guard + manual `fetch()`; results merged into local state (new node IDs appended, counter updated).
- **Filters** trigger client-side `fetch()` against the same endpoints with query params; current results are replaced optimistically with a skeleton while the new page resolves.
- **Mock layer**: CLAUDE.md references `pnpm run dev:msw` but MSW is not currently installed in this repo. For MVP, if the backend endpoints are not ready, stub via **Next.js Route Handlers** (`src/app/api/kudos/**`) returning static JSON fixtures. No new npm dependency.

**Loading / error states**:

| Scenario | UI |
|----------|----|
| First render | Skeleton shimmer per section (Highlight, Spotlight, All Kudos, Sidebar) |
| Highlight fetch error | Error card with retry button in place of carousel |
| All Kudos fetch error on initial load | Error card with retry button |
| All Kudos fetch error on subsequent page | Inline error toast + "Thử lại" button replacing the loader |
| Spotlight fetch error | Panel shows "Không tải được bảng Spotlight" + retry |
| Stats fetch error | Sidebar stats show "—" in each slot + retry icon |
| Reaction POST error | Rollback optimistic update + toast |
| Gift box open error | Toast error; button stays enabled |

---

## Data Requirements

### i18n Keys — `kudos.*` (new)

Namespace: `kudos`. All strings live in `src/i18n/messages/{vi,en}.json`.

| Key | VN | EN |
|-----|-----|-----|
| `kudos.metadata.title` | Sun\* Kudos — Sun\* Annual Awards 2025 | Sun\* Kudos — Sun\* Annual Awards 2025 |
| `kudos.metadata.description` | Bảng Kudos trực tiếp của Sun\* Annual Awards 2025 — khám phá, thả tim và ghi nhận đồng nghiệp. | Live Sun\* Kudos board for SAA 2025 — explore, react, and recognise colleagues. |
| `kudos.page.hero_subtitle` | Hệ thống ghi nhận lời cảm ơn | Recognition and appreciation system |
| `kudos.page.hero_wordmark` | SAA 2025 KUDOS | SAA 2025 KUDOS |
| `kudos.action_bar.placeholder` | Hôm nay, bạn muốn gửi lời cảm ơn và ghi nhận đến ai? | Who would you like to thank or recognise today? |
| `kudos.highlight.caption` | Sun\* Annual Awards 2025 | Sun\* Annual Awards 2025 |
| `kudos.highlight.title` | HIGHLIGHT KUDOS | HIGHLIGHT KUDOS |
| `kudos.highlight.counter` | `{current}/{total}` | `{current}/{total}` |
| `kudos.highlight.prev_aria` | Kudo trước | Previous Kudo |
| `kudos.highlight.next_aria` | Kudo tiếp theo | Next Kudo |
| `kudos.highlight.empty` | Chưa có Kudo phù hợp. | No matching Kudos yet. |
| `kudos.filter.hashtag` | Hashtag | Hashtag |
| `kudos.filter.department` | Phòng ban | Department |
| `kudos.filter.all` | Tất cả | All |
| `kudos.spotlight.title` | `{total} KUDOS` | `{total} KUDOS` |
| `kudos.spotlight.search_placeholder` | Tìm kiếm sunner | Search Sunner |
| `kudos.spotlight.tooltip` | `{name} — {time}: đã nhận được một Kudos` | `{name} — {time}: received a Kudo` |
| `kudos.all.section_title` | ALL KUDOS | ALL KUDOS |
| `kudos.all.load_more` | Xem thêm | Load more |
| `kudos.all.no_more` | Đã hiển thị tất cả | All loaded |
| `kudos.all.empty` | Chưa có Kudo nào. | No Kudos yet. |
| `kudos.post.view_detail` | Xem chi tiết | View detail |
| `kudos.post.heart_count` | `{count}` | `{count}` |
| `kudos.post.copy_link` | Copy Link | Copy Link |
| `kudos.post.copy_success_toast` | Link copied — ready to share! | Link copied — ready to share! |
| `kudos.post.copy_error_toast` | Không thể sao chép. Thử lại sau. | Could not copy. Try again. |
| `kudos.post.attached_images_count` | `{count} ảnh` | `{count} images` |
| `kudos.post.liked_aria` | Đã thả tim, bấm để bỏ tim | Liked — click to unlike |
| `kudos.post.unliked_aria` | Thả tim cho Kudo này | Like this Kudo |
| `kudos.sidebar.stats_title` | Thống kê của bạn | Your stats |
| `kudos.sidebar.stats_received` | Số Kudos bạn nhận được | Kudos you received |
| `kudos.sidebar.stats_sent` | Số Kudos bạn đã gửi | Kudos you sent |
| `kudos.sidebar.stats_hearts` | Tổng lượt thả tim | Total hearts |
| `kudos.sidebar.stats_boxes_opened` | Secret box đã mở | Secret boxes opened |
| `kudos.sidebar.stats_boxes_unopened` | Secret box chưa mở | Secret boxes unopened |
| `kudos.sidebar.open_gift` | Mở quà | Open gift |
| `kudos.sidebar.open_gift_disabled` | Chưa có quà nào để mở | No gifts to open yet |
| `kudos.sidebar.leaderboard_tier_upgrades` | 10 SUNNER CÓ SỰ THĂNG HẠNG MỚI NHẤT | 10 most recent tier upgrades |
| `kudos.sidebar.leaderboard_gift_recipients` | 10 SUNNER NHẬN QUÀ MỚI NHẤT | 10 most recent gift recipients |
| `kudos.sidebar.empty` | Chưa có dữ liệu | No data yet |
| `kudos.compose.open_aria` | Mở dialog gửi lời cảm ơn | Open Kudo compose dialog |
| `kudos.user.tier.new` | New Hero | New Hero |
| `kudos.user.tier.rising` | Rising Hero | Rising Hero |
| `kudos.user.tier.super` | Super Hero | Super Hero |
| `kudos.user.tier.legend` | Legend Hero | Legend Hero |

### Dynamic Data Fields

| Field | Type | Source | Display |
|-------|------|--------|---------|
| highlight Kudos | `Kudo[]` | `GET /api/kudos/highlights` | Carousel cards |
| All Kudos page | `{ items: Kudo[]; next_cursor: string\|null }` | `GET /api/kudos?cursor=&limit=` | List cards + pagination |
| spotlight feed | `{ total: number; nodes: SpotlightNode[] }` | `GET /api/kudos/spotlight-feed?limit=118` | Word-cloud + counter |
| stats | `KudosStats` | `GET /api/kudos/stats/me` | Sidebar stats |
| leaderboard tier-upgrades | `LeaderboardEntry[]` | `GET /api/kudos/leaderboard/tier-upgrades?limit=10` | Sidebar list |
| leaderboard gift-recipients | `LeaderboardEntry[]` | `GET /api/kudos/leaderboard/gift-recipients?limit=10` | Sidebar list |
| filter options | `{ hashtags: string[]; departments: string[] }` | `GET /api/kudos/filters` | Dropdown options |
| sunner search autocomplete | `UserRef[]` | `GET /api/sunners?search=&limit=10` | Autocomplete dropdown |

---

## API Dependencies

See `#API Endpoints Summary` in `.momorph/SCREENFLOW.md` for the canonical list. Consumed endpoints (all require Supabase session):

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/kudos/highlights` | GET | 5 highlight Kudos |
| `/api/kudos` | GET | Paginated All Kudos; `?cursor=&limit=&hashtag=&department=` |
| `/api/kudos/spotlight-feed` | GET | Up to 118 spotlight nodes + total; `?since=<ts>` for incremental polling |
| `/api/kudos/:id` | GET | Single Kudo detail (for share-link landing & spotlight click) |
| `/api/kudos/:id/reactions` | POST / DELETE | Add/remove heart reaction |
| `/api/kudos/filters` | GET | Distinct hashtags + departments for dropdowns |
| `/api/kudos/stats/me` | GET | Personal stats |
| `/api/kudos/leaderboard/tier-upgrades` | GET | Top-10 most-recent tier upgrades |
| `/api/kudos/leaderboard/gift-recipients` | GET | Top-10 most-recent gift recipients |
| `/api/users/me/boxes/next/open` | POST | Open the next unopened secret box; returns reward |
| `/api/sunners` | GET | Autocomplete search by name; `?search=&limit=` |
| `/api/uploads` | POST | Multipart image upload (from compose dialog); returns `{ url }` — JPG/PNG/WebP, ≤5 MB, ≤5 files |
| `/api/kudos` | POST | Create a Kudo (invoked from compose dialog) |

Error codes follow the project convention: 401 → force sign-out; 403 → show access denied toast; 404 → empty state for the scoped resource; 409 → conflict message (duplicate reaction, already-opened box); 5xx → generic retry toast.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: `/kudos` first-load renders the Highlight carousel, Spotlight Board, All Kudos list page 1, sidebar stats within 2.5 s on 4G (p95).
- **SC-002**: 100 % of visible strings respect the active locale (automated Playwright check).
- **SC-003**: Axe-core reports 0 WCAG 2.1 AA violations.
- **SC-004**: Lighthouse LCP ≤ 2.5 s, CLS ≤ 0.1 on desktop 1440 px.
- **SC-005**: Heart toggle round-trip (optimistic + server confirm) completes within 500 ms (p95); rollback on error is visible within 1 s.
- **SC-006**: Spotlight polling updates the counter within 1 cycle (30 s) of a new Kudo being created.
- **SC-007**: Copy-link CTA writes to clipboard and displays toast within 200 ms of click on 90 %+ of supported browsers (Chrome, Edge, Safari, Firefox — latest 2 versions).
- **SC-008**: All Kudos list infinite scroll fetches the next page without visible frame drop on a mid-tier laptop.

---

## Out of Scope

- **Compose dialog internals**: covered by a separate spec (Kudos Compose screen — TBD).
- **Individual Kudo detail page**: covered by a separate spec (Kudos Detail — TBD).
- **User profile page**: covered by a separate spec (Profile — TBD).
- **Admin moderation**: hiding, editing, or deleting Kudos by admins is not in this MVP. No moderation UI on this page.
- **Reactions beyond heart**: emoji reactions are visible in the design (`B.4.4_Action` has an emoji button row) but **not specified in this MVP** — the MVP ships heart only. Emoji reactions are a P3 follow-up (see §Notes).
- **Mobile hamburger nav**: header mobile menu is reused from existing Header component; not redesigned.
- **RTL support**: not in scope.

---

## Dependencies

- [x] `constitution.md` reviewed.
- [x] Homepage specs shipped — provides `<Header>`, `<Footer>`, shared design tokens.
- [x] Awards Information specs shipped — provides `SectionHeader` (optional `caption`) and minimal-footer convention.
- [ ] **Backend APIs** — 13 endpoints need backend implementation (see `#API Dependencies`). MVP can stub via Next.js route handlers returning static JSON fixtures if backend isn't ready.
- [ ] **Assets** (Figma `MaZUn5xHXZ`). Reuse Header + Footer assets + icons from `/assets/icons/` (target/diamond/license from Awards). **New downloads required**:
  - `MM_MEDIA_Heart` → `/assets/kudos/heart.svg`
  - `MM_MEDIA_Link` → `/assets/kudos/link.svg`
  - `MM_MEDIA_Open Gift` → `/assets/kudos/open-gift.svg`
  - `MM_MEDIA_Send` → `/assets/kudos/send.svg`
  - `MM_MEDIA_Pen` → `/assets/icons/pen.svg` *(may already exist — verify from Awards `/assets/icons/` download batch)*
  - `MM_MEDIA_Search` → `/assets/icons/search.svg` *(may already exist)*
  - `MM_MEDIA_Down` → `/assets/icons/chevron-down.svg` *(dropdown caret)*
  - `MM_MEDIA_New Hero`, `MM_MEDIA_Rising Hero`, `MM_MEDIA_Super Hero`, `MM_MEDIA_Legend Hero` → `/assets/kudos/tier-{new,rising,super,legend}.svg` (4 files)
  - `MM_MEDIA_Kudos logo` → `/assets/kudos/saa-kudos-wordmark.png` (SAA 2025 KUDOS hero wordmark)
  - `MM_MEDIA_KV Background` → `/assets/kudos/kv-background.png` (hero backdrop image)
  - Sample recipient avatars — reuse existing user avatar pattern (Supabase-hosted)
- [ ] **i18n keys** — add `kudos.*` namespace to both `vi.json` and `en.json`.
- [ ] **Content team** — authoritative Vietnamese + English strings, especially for tier badge labels, edge-case empty states, toasts.

---

## Resolved Decisions (2026-04-22)

All previous open questions confirmed by product owner:

**Business Logic:**
- **D1. Tier assignment** — pure `received_count` thresholds. Backend computes tier from count; frontend reads `tier` field as-is. Concrete thresholds TBD by content team (placeholder: `new 0–9`, `rising 10–29`, `super 30–99`, `legend ≥100`).
- **D2. Gift box trigger** — one secret box is granted **per tier upgrade**. Each time a user crosses a tier threshold, `boxes_unopened` increments by 1 (backend-enforced).
- **D3. Categories = hashtags** — the "category tag" slot shown in Figma (e.g. `IDOL GIỚI TRẺ`) is just another **free-form hashtag**. No closed enum. Data model: a single `hashtags: string[]` array per Kudo — the first element may be rendered as the visual category chip. Filter dropdown populates from distinct observed hashtags. Department filter remains a separate, closed enum (backend-supplied).
- **D4. Highlight window** — `HIGHLIGHT KUDOS` is a rolling **7-day window**. Backend query: `WHERE created_at >= now() - interval '7 days' ORDER BY heart_count DESC LIMIT 5`.

**Design / Visual:**
- **D5. Spotlight positioning** — **frontend computes layout**. Backend only supplies `{ kudo_id, recipient, received_at }` per node; the frontend runs a hand-rolled deterministic pack-layout on mount (seeded concentric rings or jittered grid with AABB collision) to produce node `{ x, y }`. **No external library** (per CLAUDE.md: do not add packages). No backend position schema.
- **D6. Highlight card background** — keep as currently specified (transparent/dark-bg with white body text). No cream fill on highlight cards.

**Technical:**
- **D7. Real-time transport** — **polling every 30 s** for MVP (was 15 s in draft; updated per product). `visibilitychange → hidden` pauses polling; `visible` resumes. No SSE / WebSocket.
- **D8. Emoji reactions** — **P3 follow-up**, out of MVP scope. Heart is the only reaction in MVP.
- **D9. Image upload** — MVP is a web-only application with **no CDN**; compose uploads images directly to the Supabase-hosted storage bucket (server-side), which returns URLs that are stored in `attachment_urls[]`. Frontend uses a multipart `POST /api/uploads` endpoint (or Supabase storage client) and receives the URL synchronously. Allowed formats: JPG/PNG/WebP; max 5 MB/image; max 5 images/Kudo.
- **D10. Share URL format** — canonical `/kudos/<kudo_id>` (UUID-based). Copy-link produces `${origin}/kudos/${kudo_id}`.

---

## Notes

- **Heavy reuse**: Header + Footer + design tokens carry over from Homepage/Awards. The only genuinely new chrome is the Keyvisual variant (simpler than Homepage hero) and the minimal footer (already shipped).
- **Client-heavy page**: unlike Awards (fully static server-rendered), Kudos is mostly client-fetched — 13 distinct endpoints total (9 GET + POST/DELETE reactions + POST uploads + POST create Kudo + POST box-open). Hybrid RSC + client-island pattern: the route's Server Component fetches initial data in parallel, then passes to client components for interactivity + polling.
- **Accessibility critical**: the Spotlight Board is the most accessibility-risky component (canvas-like word-cloud with pan/zoom). A keyboard-accessible navigation path (arrow-keys over nodes) is required.
- **Performance**: the All Kudos list cards include up to 5 images each — native `loading="lazy"` on `<img>` is non-negotiable to hit the LCP budget. Virtualization is out of MVP scope (CLAUDE.md forbids adding packages). If perf degrades past ~50 items post-launch, revisit with a hand-rolled IntersectionObserver windowing helper.
- **Gamification layer**: secret boxes, tier badges, leaderboards are decoration on top of the core social feed. The spec treats them as independent features so they can be toggled off if scope pressure arises.
- **Emoji reactions**: visible in Figma (`B.4.4_Action` emoji button row in highlight cards) but deferred to P3 to keep MVP tight. When added, use the same `POST /api/kudos/:id/reactions` endpoint with `{ type: "emoji_<name>" }`.
