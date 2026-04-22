# Feature Specification: Write Kudo Compose Dialog

**Frame ID**: `520:11602`
**Frame Name**: `Viết Kudo`
**Screen ID**: `ihQ26W78P2`
**File Key**: `9ypp4enmFmdK3YAFJLIu6C`
**Figma Link**: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/ihQ26W78P2
**Canvas Size**: `1440 × 1024 px` (modal overlay over Live Board)
**Created**: 2026-04-22
**Status**: Draft

---

## Overview

The **Write Kudo Compose Dialog** is a modal dialog that overlays the Kudos Live Board (`/kudos`) and lets a Sunner compose and submit a new Kudo. It replaces the placeholder `KudosComposePlaceholder` shipped with the Live Board feature and extends the existing `POST /api/kudos` contract with two new fields: `title` (Danh hiệu) and `is_anonymous`.

### Why it exists

- The Live Board is a read-focused surface (browse highlights, react, browse feed). Without a send path the loop is incomplete.
- "Ghi nhận" is the prominent primary CTA on `/kudos` and already opens a placeholder — this spec replaces the placeholder with the real compose form.
- The dialog introduces the concept of **Danh hiệu** (a short recognition title, e.g. "Người truyền động lực cho tôi") which becomes the visible heading on every Kudo card.

### Layout at a glance

Centered 752 × 1012 modal with a dark-navy backdrop (80 % opacity). 40 px padding, 24 px radius, warm cream fill (`#FFF8E1`). 32 px gap between sections (top to bottom):

1. **Title** — "Gửi lời cám ơn và ghi nhận đến đồng đội" (32 / 700).
2. **Người nhận** *(required)* — autocomplete search input with caret.
3. **Danh hiệu** *(required)* — short-title input with helper ("Ví dụ: Người truyền động lực cho tôi" + "Danh hiệu sẽ hiển thị làm tiêu đề của Kudos của bạn.").
4. **Rich-text toolbar** — Bold, Italic, Strikethrough, Ordered list, Link, Quote + right-aligned "Tiêu chuẩn cộng đồng" text-link.
5. **Message textarea** *(required)* — placeholder "Hãy gửi gắm lời cám ơn và ghi nhận đến đồng đội tại đây nhé!"; helper "Bạn có thể '@' + tên để nhắc tới đồng nghiệp khác".
6. **Hashtag** *(required)* — chip group with "+ Hashtag" button; 1–5 tags.
7. **Image** *(optional)* — up to 5 thumbnails with X-remove + "+ Image" add slot (hidden when 5).
8. **Gửi lời cám ơn và ghi nhận ẩn danh** — anonymous checkbox.
9. **Footer** — "Hủy" (secondary) + "Gửi" (primary gold pill, disabled while invalid).

### Relation to other screens

- **Entry**: `/kudos?compose=1` triggered by "Ghi nhận" pill on Kudos Live Board (`MaZUn5xHXZ`).
- **Exit**: Hủy / ESC / backdrop click → remove `?compose=1` from URL; Gửi success → `POST /api/kudos` → dialog closes + Live Board list/highlights/spotlight refetch.
- **Schema addendum** on `MaZUn5xHXZ-KudosLiveBoard`:
  - `ALTER TABLE public.kudos ADD COLUMN title text NOT NULL DEFAULT '';`
  - `ALTER TABLE public.kudos ADD COLUMN is_anonymous boolean NOT NULL DEFAULT false;`
  - `kudo_to_json()` RPC extended with both fields.
  - Live Board card components swap `hashtags[0]`-as-category chip → `kudo.title` (with graceful fallback when empty).
  - When `is_anonymous = true`, Live Board masks sender avatar/name as "Ẩn danh".

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 – Basic Compose & Submit (Priority: P1) 🎯 MVP

An authenticated Sunner opens the compose dialog, fills in recipient + title + message + at least one hashtag, and submits.

**Why this priority**: This is the minimum end-to-end loop — without it, the Kudos feature is read-only.

**Independent Test**: Log in, on `/kudos` click "Ghi nhận". Dialog mounts; fill all required fields; click "Gửi". Dialog closes, new Kudo appears in the All Kudos list within one refresh cycle.

**Acceptance Scenarios**:

1. **Given** authenticated user on `/kudos`, **When** they click "Ghi nhận", **Then** URL updates to `/kudos?compose=1`, modal mounts with focus on the Người nhận input, backdrop is visible, body scroll is locked.
2. **Given** the dialog is open and all required fields are empty, **When** user inspects the "Gửi" button, **Then** it is disabled (`aria-disabled="true"`, opacity 0.5).
3. **Given** user fills recipient (via autocomplete), title, message (10+ chars), and 1+ hashtag, **When** all validations pass, **Then** "Gửi" becomes enabled.
4. **Given** all required fields valid, **When** user clicks "Gửi", **Then** client calls `POST /api/kudos` with `{ recipient_id, title, message, hashtags, attachment_urls, is_anonymous }`, shows a loading spinner on the button, on success: dialog closes (URL reverts to `/kudos`), Live Board highlights/list/spotlight refetch, and a success toast appears ("Đã gửi Kudo!").
5. **Given** the server returns 4xx/5xx, **When** the response resolves, **Then** the dialog stays open, the button re-enables, and an inline form-level error message is shown.

---

### User Story 2 – Recipient Autocomplete (Priority: P1)

The Người nhận field supports live autocomplete against `/api/sunners?search=`. Typing a partial name filters; clicking an entry selects that recipient.

**Independent Test**: Open dialog, type 2+ chars in Người nhận → suggestion dropdown appears; click one → recipient is selected (name displayed in input, hidden recipient_id stored).

**Acceptance Scenarios**:

1. **Given** dialog open, **When** user types in Người nhận, **Then** input is debounced 200 ms, then a `GET /api/sunners?search=<q>&limit=10` is issued; results render in a listbox below the input.
2. **Given** suggestions are visible, **When** user clicks (or Enter on) an entry, **Then** input fills with the display name, `recipient_id` is captured in hidden state, dropdown closes.
3. **Given** user types and no matches return, **When** results resolve empty, **Then** listbox shows "Không tìm thấy Sunner phù hợp".
4. **Given** user selects themselves (`user.id === auth.uid()`), **When** they try to submit, **Then** form-level validation blocks submit with "Không thể gửi Kudo cho chính mình".
5. **Given** user presses ArrowDown/ArrowUp in the listbox, **Then** focus cycles through suggestions; Enter selects current.

---

### User Story 3 – Rich-text Editor with Mentions (Priority: P1)

The message textarea supports a limited rich-text toolbar (Bold, Italic, Strikethrough, Ordered list, Link, Quote) and `@` mentions (typeahead over the same `/api/sunners` endpoint).

**Why this priority**: Message is the emotional core of a Kudo. Rich-text + mentions make it expressive and socially connected.

**Independent Test**: Select text → click Bold → `**text**` wrapping (or equivalent HTML); type `@Hi` → mention popover lists matching Sunners; click one → insert as chip.

**Acceptance Scenarios**:

1. **Given** user types content and selects a word, **When** they click Bold (B), **Then** the selection becomes bold. Repeat click toggles off. Italic, Strikethrough, Ordered list, Link, Quote behave analogously.
2. **Given** user clicks Link, **When** the browser prompts for URL (`prompt()` or modal), **Then** the URL wraps the selection as an anchor; empty input cancels.
3. **Given** user types `@` followed by 1+ chars, **When** debounce triggers, **Then** a mention popover appears anchored to the cursor listing matching Sunners; selecting one inserts `@{name}` as a styled mention chip with hidden `user_id` reference.
4. **Given** user types `Esc` while mention popover open, **Then** popover closes without inserting.
5. **Given** content exceeds 2000 chars, **When** user keeps typing, **Then** input is capped and a character-count indicator flashes red.
6. **Given** reduced-motion, **When** editor commands fire, **Then** no scroll-bounce / transitions — instant.
7. **Given** "Tiêu chuẩn cộng đồng" link is clicked, **Then** opens target URL in a new tab (`target="_blank" rel="noopener"`).

---

### User Story 4 – Danh Hiệu (Title) Field (Priority: P1)

A short title that represents the Kudo (shown as the category/headline chip on Live Board cards).

**Independent Test**: Type a title; on successful submit, the new Kudo on the Live Board displays the title chip above the message body.

**Acceptance Scenarios**:

1. **Given** dialog open, **When** user types in Danh hiệu, **Then** input accepts 1–80 characters; helper text stays visible.
2. **Given** user clears the Danh hiệu field and tries to submit, **Then** form validation shows "Danh hiệu là bắt buộc" inline under the field.
3. **Given** user enters 80 chars exactly, **Then** submit succeeds.
4. **Given** user enters 81+ chars, **Then** input caps at 80, or inline error "Tối đa 80 ký tự".

---

### User Story 5 – Hashtag Picker (Priority: P1)

User adds 1–5 hashtags via a chip picker. Tags are free-form (per live-board D3 decision) with typeahead suggestions from the existing `/api/kudos/filters` endpoint's `hashtags` array.

**Independent Test**: Click "+ Hashtag" → input appears → type and press Enter → chip is added. Click X on chip → chip removed. Try to add a 6th → button hidden and "Đã đạt giới hạn 5" helper shown.

**Acceptance Scenarios**:

1. **Given** 0 chips, **When** user clicks "+ Hashtag", **Then** an inline text input mounts; typing shows debounced suggestions from `/api/kudos/filters` matching the query prefix (case-insensitive).
2. **Given** the input has text and user presses Enter (or clicks a suggestion), **Then** a chip is added; input clears; stays in input mode for quick successive adds.
3. **Given** 5 chips exist, **Then** the "+ Hashtag" button is hidden; input is disabled; helper shows "Tối đa 5".
4. **Given** user clicks X on a chip, **Then** the chip is removed and the "+ Hashtag" button reappears if count drops below 5.
5. **Given** user tries to add a duplicate hashtag, **Then** input clears without adding and a subtle shake animation plays on the existing chip (disabled under reduced-motion).
6. **Given** 0 chips and user tries to submit, **Then** form-level error "Thêm ít nhất 1 hashtag" is shown.

---

### User Story 6 – Image Upload (Priority: P2)

Up to 5 images can be attached. Files are uploaded immediately via `POST /api/uploads` and the returned URLs are collected for the final `POST /api/kudos` payload.

**Independent Test**: Click "+ Image" → file picker opens → pick a JPG < 5 MB → thumbnail appears with X-remove. Add 5 → add button disappears. Remove one → add button returns.

**Acceptance Scenarios**:

1. **Given** 0–4 thumbnails, **When** user clicks "+ Image", **Then** native file picker opens with `accept="image/jpeg,image/png,image/webp"`.
2. **Given** user selects a valid image, **When** picker closes, **Then** thumbnail appears immediately with a loading overlay; `POST /api/uploads` fires; on success the URL is appended to `attachment_urls`; loading overlay removed.
3. **Given** a file exceeds 5 MB or has disallowed MIME, **When** it's selected, **Then** thumbnail shows error overlay "Ảnh quá lớn (>5 MB)" / "Định dạng không hỗ trợ" with retry / remove options; no upload call fires.
4. **Given** upload fails (500), **When** the response resolves, **Then** the thumbnail row shows "Thử lại" button; other thumbnails + form state are preserved.
5. **Given** user clicks X on a thumbnail, **Then** that URL is removed from `attachment_urls` state; if the image was still uploading, the request is aborted.
6. **Given** 5 thumbnails present, **Then** the "+ Image" button is hidden.

---

### User Story 7 – Anonymous Mode (Priority: P2)

A checkbox allows the sender to send the Kudo anonymously. The backend still records the real `sender_id` (for moderation + rate-limit) but the Live Board masks sender info.

**Independent Test**: Check "Gửi ẩn danh" → submit → the resulting Kudo on Live Board shows "Ẩn danh" + blank avatar in the sender position.

**Acceptance Scenarios**:

1. **Given** checkbox unchecked (default), **When** user submits, **Then** `POST /api/kudos` payload has `is_anonymous: false`.
2. **Given** checkbox checked, **When** user submits, **Then** payload has `is_anonymous: true`; success toast hints "Đã gửi ẩn danh".
3. **Given** Live Board renders a Kudo with `is_anonymous: true`, **Then** sender avatar is replaced with a generic mask icon and sender name shows "Ẩn danh" (i18n string).
4. **Given** anonymous Kudo is filtered by the recipient's department in the sidebar, **Then** only recipient's department is used for filtering (sender side contributes nothing anonymous).
5. **Given** user receives a Kudo `is_anonymous: true`, **When** they open the detail page, **Then** sender is still masked.

---

### User Story 8 – Form Persistence & Cancel Recovery (Priority: P2)

If the user accidentally closes the dialog, unsaved input is not silently lost. Two behaviors supported: (a) confirm before close, (b) draft auto-save to localStorage.

**Independent Test**: Start filling the form; close dialog via Hủy or ESC — a confirm dialog asks "Bỏ thay đổi?"; OK closes and clears; Cancel keeps dialog open. If Confirm, reopening shows empty form. Or: draft restored from localStorage on reopen.

**Acceptance Scenarios**:

1. **Given** user has typed content (any required field non-empty), **When** they trigger close (Hủy / ESC / backdrop), **Then** a confirm alert "Bỏ các thay đổi chưa lưu?" appears with [Bỏ] / [Tiếp tục] actions.
2. **Given** user clicks [Bỏ], **Then** dialog closes, URL reverts; form state clears.
3. **Given** user clicks [Tiếp tục], **Then** confirm dismisses; dialog stays open.
4. **Given** form is empty, **When** user closes, **Then** no confirm — closes directly.
5. **Given** user reloads the page while dialog is open with draft content, **When** dialog reopens from URL `?compose=1`, **Then** draft is NOT auto-restored for MVP (explicit open questions Q5 — defer localStorage draft to P3).

---

### User Story 9 – Accessibility & Keyboard Flow (Priority: P1)

The dialog is fully keyboard-operable; screen readers announce the modal; focus is trapped until close.

**Independent Test**: Open dialog with keyboard (Enter on "Ghi nhận"); Tab cycles through recipient → title → toolbar buttons → textarea → hashtag → image → anonymous → Hủy → Gửi; Tab at last → cycles back to recipient. ESC closes.

**Acceptance Scenarios**:

1. **Given** dialog mounts, **When** focus initializes, **Then** Người nhận input receives focus; page scroll is locked; `role="dialog"` + `aria-modal="true"` + `aria-labelledby` point to the title.
2. **Given** user presses Tab from the Gửi button, **Then** focus wraps to the recipient input (focus trap).
3. **Given** user presses Shift+Tab from recipient, **Then** focus wraps to Gửi.
4. **Given** user presses ESC, **Then** close confirmation flow runs (see US8).
5. **Given** required-field validation fails on submit, **Then** first invalid field is focused and `aria-invalid="true"` + `aria-describedby` connects to the inline error message.
6. **Given** toast appears after submit success, **Then** toast has `role="status"` + `aria-live="polite"`.

---

### Edge Cases

- **Server rejects recipient** (e.g. user deactivated): surface 403 as form-level error "Người nhận không hợp lệ".
- **Duplicate submit** (double-click Gửi): button is locked by `inFlight` ref immediately on click; second click is no-op.
- **Network loss during upload**: show per-thumbnail retry; form is not blocked (user can submit without that image).
- **Image upload succeeds but POST /api/kudos fails**: uploaded URLs remain (orphaned in storage); on retry they are re-submitted. MVP accepts this small leak; cleanup is a backend cron job (out of scope).
- **User switches locale mid-compose**: input content preserved; only static labels re-render.
- **Responsive <768 px**: modal becomes full-screen (no rounded corners); inner padding shrinks; toolbar buttons wrap to 2 rows.
- **Responsive 768–1023 px**: modal max-width 680 px; padding 32 px.
- **RTL**: not in scope.
- **Editor paste**: Plain-text paste by default (`preventDefault` + `document.execCommand('insertText')`) to avoid styled content from external sources; attribute-safe HTML allowed from editor's own buttons.
- **XSS via markdown**: content is plain markdown text; `react-markdown` renders with raw HTML disabled by default; URL schemes restricted to `http`/`https`/`user:`. No HTML sanitization dependency required (D3).

---

## UI/UX Requirements *(from Figma)*

Visual specs live in **`design-style.md`** — this section references that document for pixel-level details.

### Screen Components

| Component | Ref | Description | Interactions |
|-----------|-----|-------------|--------------|
| Backdrop mask | `520:11646` | `1440 × 1024` dark-navy 80% overlay | Click → close flow |
| Modal shell | `520:11647` | 752 × 1012 cream card, radius 24 | Focus trap + ESC close |
| Title | `I520:11647;520:9870` | "Gửi lời cám ơn và ghi nhận đến đồng đội" | Static |
| Người nhận | `I520:11647;520:9871` | Required autocomplete | Typeahead + select |
| Danh hiệu | `I520:11647;1688:10448` | Required short-title input | Free-type, 80-char cap |
| Toolbar | `I520:11647;520:9877` | 6 formatting buttons + "Tiêu chuẩn cộng đồng" link | Click each = toggle/prompt |
| Textarea | `I520:11647;520:9886` | Required 10–2000 char rich-text | `@` mentions |
| Helper | `I520:11647;520:9887` | "Bạn có thể '@' + tên…" | Static |
| Hashtag group | `I520:11647;520:9890` | Required 1–5 chips | Add/remove |
| Image uploader | `I520:11647;520:9896` | Optional 0–5 thumbnails | Add/remove/retry |
| Anonymous | `I520:11647;520:14099` | Boolean checkbox | Toggle |
| Footer | `I520:11647;520:9905` | Hủy + Gửi | Cancel / submit |

### Navigation Flow

- **Entry**: `/kudos?compose=1` (pushState) — triggered by clicking the "Ghi nhận" pill on Live Board.
- **Exit**:
  - Hủy button click → close-confirm flow (if dirty) → remove `?compose=1`.
  - ESC keypress → same flow.
  - Backdrop click → same flow.
  - Back-button (browser) → closes dialog naturally via `popstate` listener (already wired in Live Board's `useUrlState`).
  - Gửi success → dialog closes + Live Board refetch.

### Visual Requirements

- **Responsive breakpoints**: Mobile <768 (full-screen modal), Tablet 768–1023 (680 max-width + smaller padding), Desktop ≥1024 (752 fixed width).
- **Animations**:
  - Modal entry: 250 ms fade + scale from 0.96 to 1.
  - Backdrop fade: 200 ms.
  - Chip add: 150 ms scale-in.
  - Thumbnail upload overlay: pulse.
  - Gửi button loading: spinner replaces icon.
  - All disabled when `prefers-reduced-motion: reduce`.
- **Accessibility**:
  - `role="dialog"` + `aria-modal="true"` + `aria-labelledby` (title) + optional `aria-describedby`.
  - Focus trap with initial focus on first input.
  - ESC closes (with dirty-confirm if applicable).
  - Each required field has `aria-required="true"`; invalid adds `aria-invalid="true"` + `aria-describedby` → inline error.
  - Autocomplete listbox: `<ul role="listbox">` + `<li role="option" aria-selected=…>`.
  - Rich-text toolbar buttons: `aria-pressed={active}` + `aria-label="Bold"` etc.
  - Mention popover: similar listbox pattern + `aria-activedescendant`.
  - Anonymous checkbox: native `<input type="checkbox">` with label.
  - Submit button disabled uses `aria-disabled="true"` (not `disabled` attribute so screen readers still announce it).
  - Toast success: `role="status"` + `aria-live="polite"`.
  - Contrast: warm cream `#FFF8E1` + `#00101A` body text = 17.8:1 ✅ AAA; gold `#FFEA9E` + `#00101A` = 12.6:1 ✅ AAA; required asterisk `#CF1322` (Figma extracted) + `#FFF8E1` ≈ 6.4:1 ✅ AA.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Dialog MUST open from `/kudos?compose=1` (triggered by "Ghi nhận" pill); URL push on open, pop on close.
- **FR-002**: Dialog MUST trap focus; ESC / backdrop / Hủy MUST trigger the close-confirm flow (dirty-state only).
- **FR-003**: Người nhận MUST use `/api/sunners?search=<q>&limit=10` with 200 ms debounce; selection stores `recipient_id`.
- **FR-004**: Danh hiệu MUST be a plain text input, 1–80 chars, required.
- **FR-005**: Message textarea MUST support Bold, Italic, Strikethrough, Ordered list, Link, Quote via a markdown editor (`@uiw/react-md-editor`). Stored content is **raw markdown text**, 10–2000 characters.
- **FR-006**: `@mention` typeahead MUST use `/api/sunners?search=` and insert the selected user as markdown `@[{display_name}](user:{uuid})`. Server validates each `user:<uuid>` target exists; invalid mentions are silently stripped on submit (per spec §Edge Cases).
- **FR-007**: Hashtag MUST accept 1–5 free-form tags via an inline input with typeahead suggestions from `/api/kudos/filters` `hashtags`. Each tag 1–32 chars matching `[\p{L}\p{N}_ -]+`.
- **FR-008**: Image upload MUST use `POST /api/uploads` per file; MIME whitelist `image/jpeg|png|webp`; ≤ 5 MB; ≤ 5 files.
- **FR-009**: Anonymous checkbox MUST append `is_anonymous: true|false` to the submit payload.
- **FR-010**: Submit MUST call `POST /api/kudos` with `{ recipient_id, title, message, hashtags, attachment_urls, is_anonymous }`; on success dialog closes; Live Board caches invalidated.
- **FR-011**: Submit button MUST be disabled while any required field is invalid OR an upload is in-flight; disabled state is `aria-disabled="true"` (not `disabled` attribute).
- **FR-012**: On submit failure the dialog STAYS open; inline + toast errors surface; content NOT lost.
- **FR-013**: All user-visible strings MUST use `next-intl` under new `kudos.compose.*` namespace.
- **FR-014**: "Tiêu chuẩn cộng đồng" link MUST open external URL in a new tab with `rel="noopener"`. The URL is an env-var config (`NEXT_PUBLIC_COMMUNITY_STANDARDS_URL`) — if empty, hide the link.
- **FR-015 (drafts on mount)**: On dialog open, the client MUST call `GET /api/kudos/drafts/me`. If a draft exists, form state is pre-populated with its contents + a subtle "Bản nháp được khôi phục" indicator banner shown at the top of the modal for 3 s.
- **FR-016 (auto-save)**: On any form-field change, a debounced 2-second timer MUST fire `PUT /api/kudos/drafts/me` with the current form state. The button shows a small "Đã lưu nháp" status indicator next to Gửi for 1.5 s after each successful save.
- **FR-017 (draft cleanup)**: On successful `POST /api/kudos`, the client MUST call `DELETE /api/kudos/drafts/me`. On user-confirmed discard (US8), the same DELETE fires before closing.
- **FR-018 (draft isolation)**: The drafts table is keyed by `user_id`. RLS MUST enforce: SELECT/UPDATE/INSERT/DELETE only when `user_id = auth.uid()`. No cross-user leaks.

### Technical Requirements

- **TR-001 (Performance)**: Dialog mount ≤ 100 ms after click (no lazy-load of editor bundle at the expense of perceived latency).
- **TR-002 (Accessibility)**: 0 axe-core WCAG 2.1 AA violations. Focus trap verified via Playwright.
- **TR-003 (i18n)**: `kudos.compose.*` namespace enforced in CI parity test.
- **TR-004 (Validation)**: All validation mirrored client (Zod in browser) + server (same `CreateKudoSchema` extended).
- **TR-005 (XSS via markdown)**: Raw HTML IS disabled in `react-markdown` (the default). User content is stored as markdown text; the renderer converts to a safe element tree. `a[href]` targets are URL-validated (`http`/`https` only; no `javascript:` schemes). Mention targets `user:<uuid>` are routed to an in-app profile URL, never user-supplied HTML.
- **TR-006 (Optimistic UX)**: Submit button shows spinner within 50 ms of click; no full-dialog blocking overlay.
- **TR-007 (Upload concurrency)**: Parallel uploads up to 3 concurrent; subsequent files queue.
- **TR-008 (Cleanup)**: On unmount while uploads in-flight, all abort controllers fire.

### Key Entities

- **ComposeFormState** — `type ComposeFormState = { recipient: UserRef | null; title: string; messageMarkdown: string; hashtags: string[]; attachmentUrls: string[]; uploadsInFlight: Record<string, AbortController>; isAnonymous: boolean; errors: Record<string, string>; submitInFlight: boolean; draftStatus: "idle" | "saving" | "saved" | "error" }`.
- **KudoDraft** (DB entity, wrapping `ComposeFormState` payload) — `type KudoDraft = { user_id: string (uuid); payload: Omit<ComposeFormState, "uploadsInFlight" | "errors" | "submitInFlight" | "draftStatus">; updated_at: string }`.
- **Kudo schema update** — existing `Kudo` type extends with:
  - `title: string` — the Danh hiệu headline (max 80 chars).
  - `is_anonymous: boolean` — whether sender should be masked on display.
  - `message: string` — CHANGED semantics: now raw markdown text (not HTML). Live Board read-path uses `react-markdown` to render; serialized `@[name](user:uuid)` mentions become profile links.

### Environment Variables

- `NEXT_PUBLIC_COMMUNITY_STANDARDS_URL` (new) — target for the "Tiêu chuẩn cộng đồng" link. If empty/undefined, the link is hidden.

### State Management

**Local (dialog component)**:

| State | Type | Purpose |
|-------|------|---------|
| `recipient` | `UserRef \| null` | Selected recipient |
| `recipientQuery` | `string` | Debounced input for autocomplete |
| `recipientSuggestions` | `UserRef[]` | Autocomplete results |
| `title` | `string` | Danh hiệu value |
| `messageHtml` | `string` | Sanitized rich-text HTML |
| `hashtagInput` | `string` | Current "+ Hashtag" input text |
| `hashtags` | `string[]` | Added chips |
| `attachmentUrls` | `string[]` | Uploaded image URLs |
| `uploadsInFlight` | `Map<string, { controller, status }>` | Per-upload state |
| `isAnonymous` | `boolean` | Anonymous toggle |
| `errors` | `Record<string, string>` | Per-field error messages |
| `submitInFlight` | `boolean` | Prevents double-submit |
| `composeOpen` | via URL `?compose=1` + `useUrlState` | Dialog open state |
| `toasts` | `Toast[]` | Ephemeral notifications (shared provider) |

**Global**: Supabase session + `NEXT_LOCALE` cookie (existing).

**Loading / error states**:

| Scenario | UI |
|----------|----|
| Autocomplete fetching | Inline spinner in input right side |
| Upload in-flight | Loading overlay on thumbnail |
| Upload failed | Error overlay + "Thử lại" button on thumbnail |
| Submit in-flight | Gửi shows spinner; all inputs remain editable but button disabled |
| Submit error | Inline form-level banner (red) + button re-enabled |
| Network offline | Inline banner "Mất kết nối — Kudo sẽ gửi khi online" (submit button disabled) |

---

## Data Requirements

### i18n Keys — `kudos.compose.*` (new)

| Key | VN | EN |
|-----|-----|-----|
| `kudos.compose.title` | Gửi lời cám ơn và ghi nhận đến đồng đội | Send a Kudo to a teammate |
| `kudos.compose.recipient.label` | Người nhận | Recipient |
| `kudos.compose.recipient.placeholder` | Tìm kiếm | Search |
| `kudos.compose.recipient.empty` | Không tìm thấy Sunner phù hợp | No matching Sunners |
| `kudos.compose.recipient.required` | Người nhận là bắt buộc | Recipient is required |
| `kudos.compose.recipient.self_not_allowed` | Không thể gửi Kudo cho chính mình | Can't send a Kudo to yourself |
| `kudos.compose.title_field.label` | Danh hiệu | Title |
| `kudos.compose.title_field.placeholder` | Dành tặng một danh hiệu cho đồng đội | Give your teammate a title |
| `kudos.compose.title_field.hint` | Ví dụ: Người truyền động lực cho tôi. Danh hiệu sẽ hiển thị làm tiêu đề của Kudos của bạn. | e.g. My motivator. This title appears as the headline of your Kudo. |
| `kudos.compose.title_field.required` | Danh hiệu là bắt buộc | Title is required |
| `kudos.compose.title_field.max_length` | Tối đa 80 ký tự | Max 80 characters |
| `kudos.compose.message.placeholder` | Hãy gửi gắm lời cám ơn và ghi nhận đến đồng đội tại đây nhé! | Write your message here… |
| `kudos.compose.message.hint` | Bạn có thể "@" + tên để nhắc tới đồng nghiệp khác | You can use @ + name to mention a colleague |
| `kudos.compose.message.min_length` | Tối thiểu 10 ký tự | Minimum 10 characters |
| `kudos.compose.message.max_length` | Tối đa 2000 ký tự | Maximum 2000 characters |
| `kudos.compose.message.required` | Nội dung là bắt buộc | Message is required |
| `kudos.compose.toolbar.bold` | In đậm | Bold |
| `kudos.compose.toolbar.italic` | In nghiêng | Italic |
| `kudos.compose.toolbar.strike` | Gạch ngang | Strikethrough |
| `kudos.compose.toolbar.list` | Danh sách đánh số | Numbered list |
| `kudos.compose.toolbar.link` | Chèn liên kết | Insert link |
| `kudos.compose.toolbar.quote` | Trích dẫn | Quote |
| `kudos.compose.toolbar.link_prompt` | Nhập URL | Enter URL |
| `kudos.compose.standards_link` | Tiêu chuẩn cộng đồng | Community standards |
| `kudos.compose.hashtag.label` | Hashtag | Hashtag |
| `kudos.compose.hashtag.add` | Hashtag | Hashtag |
| `kudos.compose.hashtag.max_hint` | Tối đa 5 | Max 5 |
| `kudos.compose.hashtag.required` | Thêm ít nhất 1 hashtag | Add at least 1 hashtag |
| `kudos.compose.hashtag.duplicate` | Hashtag đã tồn tại | Hashtag already added |
| `kudos.compose.hashtag.placeholder` | Nhập hashtag và nhấn Enter | Type a tag and press Enter |
| `kudos.compose.image.label` | Image | Image |
| `kudos.compose.image.add` | Image | Image |
| `kudos.compose.image.max_hint` | Tối đa 5 | Max 5 |
| `kudos.compose.image.too_large` | Ảnh quá lớn (>5 MB) | File too large (>5 MB) |
| `kudos.compose.image.unsupported` | Định dạng không hỗ trợ | Unsupported format |
| `kudos.compose.image.upload_failed` | Tải ảnh lên thất bại | Upload failed |
| `kudos.compose.image.retry` | Thử lại | Retry |
| `kudos.compose.image.remove_aria` | Xoá ảnh | Remove image |
| `kudos.compose.anonymous.label` | Gửi lời cám ơn và ghi nhận ẩn danh | Send this Kudo anonymously |
| `kudos.compose.anonymous_display_name` | Ẩn danh | Anonymous |
| `kudos.compose.cancel` | Hủy | Cancel |
| `kudos.compose.submit` | Gửi | Send |
| `kudos.compose.submitting` | Đang gửi… | Sending… |
| `kudos.compose.success_toast` | Đã gửi Kudo! | Kudo sent! |
| `kudos.compose.success_anonymous_toast` | Đã gửi ẩn danh | Sent anonymously |
| `kudos.compose.error_generic` | Đã có lỗi xảy ra. Vui lòng thử lại. | Something went wrong. Please try again. |
| `kudos.compose.offline` | Mất kết nối — Kudo sẽ gửi khi online | Offline — will send when reconnected |
| `kudos.compose.discard_confirm_title` | Bỏ các thay đổi chưa lưu? | Discard unsaved changes? |
| `kudos.compose.discard_confirm_body` | Thay đổi của bạn sẽ không được lưu. | Your edits will not be saved. |
| `kudos.compose.discard_confirm_ok` | Bỏ | Discard |
| `kudos.compose.discard_confirm_cancel` | Tiếp tục | Keep editing |
| `kudos.compose.open_aria` | Mở dialog gửi lời cảm ơn | Open Kudo compose dialog |
| `kudos.compose.draft_restored` | Bản nháp đã được khôi phục | Draft restored |
| `kudos.compose.draft_saving` | Đang lưu nháp… | Saving draft… |
| `kudos.compose.draft_saved` | Đã lưu nháp | Draft saved |
| `kudos.compose.draft_save_error` | Không thể lưu nháp | Couldn't save draft |

### Dynamic Data Fields

| Field | Type | Source | Display / Behavior |
|-------|------|--------|--------------------|
| recipient | `UserRef` | User select from autocomplete | Filled input, pill-like display of selected |
| recipientSuggestions | `UserRef[]` | `GET /api/sunners?search=` | Listbox below input |
| title | `string` (1–80) | User input | Plain text field |
| messageHtml | `string` (sanitized HTML, 10–2000 raw-text chars) | User input via rich-text editor | Rendered into textarea / contenteditable |
| hashtagSuggestions | `string[]` | `GET /api/kudos/filters` | Dropdown below inline hashtag input |
| hashtags | `string[]` (1–5) | Added by user | Chip list |
| attachmentUrls | `string[]` (0–5) | `POST /api/uploads` per file | Thumbnails with X-remove |
| isAnonymous | `boolean` | Checkbox | Controls payload flag |

---

## API Dependencies

See `#API Endpoints Summary` in `.momorph/SCREENFLOW.md`. Consumed endpoints (all require Supabase session):

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/api/sunners?search=` | GET | Recipient autocomplete + `@mention` typeahead (filters out `auth.uid()` per D1) | **existing (filter added)** |
| `/api/kudos/filters` | GET | Hashtag typeahead suggestions (reuses existing endpoint — `hashtags` array) | **existing** |
| `/api/uploads` | POST | Image upload (multipart, one file per request) | **existing** |
| `/api/kudos` | POST | Create Kudo | **existing (payload extended with `title` + `is_anonymous` + markdown `message`)** |
| `/api/kudos/drafts/me` | GET | Read the current user's active draft. Returns `{ payload, updated_at } \| null` | **NEW** |
| `/api/kudos/drafts/me` | PUT | Upsert the current user's draft. Body: `{ payload: ComposeFormState }` | **NEW** |
| `/api/kudos/drafts/me` | DELETE | Delete the current user's draft (on submit success or explicit discard) | **NEW** |

### Extended `POST /api/kudos` payload

```ts
{
  recipient_id: string (uuid);
  title: string (1-80);                    // NEW
  message: string (10-2000 markdown text); // NOW markdown (was HTML in earlier draft)
  hashtags: string[] (1-5);
  attachment_urls: string[] (0-5);
  is_anonymous: boolean;                   // NEW
}
```

Server Zod schema (`CreateKudoSchema`) extends with `title` + `is_anonymous`. `message` is raw text; no HTML parsing / sanitization step needed. Both new fields have safe defaults in the DB migration so existing Live Board clients continue to read unchanged rows.

### Backend schema addendum

```sql
-- supabase/migrations/<ts>_kudos_compose_fields.sql
BEGIN;

-- Part 1: extend kudos with title + is_anonymous (D2 + anonymous flag)
ALTER TABLE public.kudos
  ADD COLUMN title text NOT NULL DEFAULT ''
    CHECK (char_length(title) <= 80),
  ADD COLUMN is_anonymous boolean NOT NULL DEFAULT false;

-- Part 2: update kudo_to_json() RPC to include new fields + mask sender when anonymous
CREATE OR REPLACE FUNCTION public.kudo_to_json(k public.kudos)
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  me uuid := auth.uid();
  sender_profile jsonb;
  recipient_profile jsonb;
  attachments jsonb;
  liked_by_me boolean;
BEGIN
  IF k.is_anonymous THEN
    sender_profile := jsonb_build_object(
      'id', null,
      'display_name', 'Ẩn danh',
      'avatar_url', null,
      'tier', 'new',
      'department', null
    );
  ELSE
    -- existing sender_profile build …
  END IF;
  -- …recipient_profile, attachments, liked_by_me, return jsonb incl. title + is_anonymous fields…
END;
$$;

-- Part 3: kudo_drafts — one active draft per user (D5)
CREATE TABLE IF NOT EXISTS public.kudo_drafts (
  user_id    uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  payload    jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.kudo_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY kudo_drafts_select_self
  ON public.kudo_drafts FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY kudo_drafts_insert_self
  ON public.kudo_drafts FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY kudo_drafts_update_self
  ON public.kudo_drafts FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY kudo_drafts_delete_self
  ON public.kudo_drafts FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Auto-update updated_at on upsert
CREATE OR REPLACE FUNCTION public.touch_kudo_drafts_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS kudo_drafts_touch_updated_at ON public.kudo_drafts;
CREATE TRIGGER kudo_drafts_touch_updated_at
  BEFORE UPDATE ON public.kudo_drafts
  FOR EACH ROW EXECUTE FUNCTION public.touch_kudo_drafts_updated_at();

COMMIT;
```

Error codes follow project convention: 400 validation, 401 auth, 403 self-target, 409 duplicate, 413 upload too large, 5xx generic.

---

## Success Criteria *(mandatory)*

- **SC-001**: Dialog opens + renders within 100 ms of "Ghi nhận" click (p95).
- **SC-002**: 100 % of visible strings respect the active locale (automated Playwright check).
- **SC-003**: Axe-core reports 0 WCAG 2.1 AA violations.
- **SC-004**: Full compose submit round-trip ≤ 1.5 s on 4G (p95), excluding image upload time.
- **SC-005**: Focus trap verified: pressing Tab from the last focusable element returns to the first, and Shift+Tab from the first returns to the last.
- **SC-006**: Form state (including drafts) never leaks to another user's session (no localStorage draft for MVP).
- **SC-007**: After successful submit, new Kudo appears on the Live Board list within one refresh cycle (≤ 1 s).

---

## Out of Scope

- **Scheduled / draft Kudos**: MVP submits immediately only.
- **Inline recipient avatar preview** beyond the selected name.
- **Image editing / cropping tools**: raw upload only.
- **GIF / video attachments**: P3 follow-up.
- **Emoji picker**: P3 follow-up (OS-level emoji keyboard suffices for MVP).
- **Advanced rich-text features**: tables, code blocks, checkbox lists — NOT supported.
- **Clipboard paste-HTML**: plain-text paste only.
- **RTL**: not in scope.
- **localStorage draft auto-restore**: moot — draft persistence is DB-backed per D5, not localStorage.
- **Multiple drafts per user**: only one active draft per user (simplest model). Multi-draft is a future enhancement.

---

## Dependencies

- [x] `constitution.md` reviewed.
- [x] Homepage + Awards + Kudos Live Board specs shipped.
- [ ] **Backend migration** (`<ts>_kudos_compose_fields.sql`) — adds `title`, `is_anonymous`, `kudo_drafts` table + RLS + trigger. Must ship with the frontend change.
- [ ] **`/api/kudos/filters` response** — confirm response includes `hashtags: string[]` (yes, already there).
- [ ] **Shared primitives** — reuse `<Dialog>`, `<Toast>`, `<ToastProvider>`, `<Lightbox>` from `src/components/ui/` (existing, from Live Board work).
- [ ] **Env var**: `NEXT_PUBLIC_COMMUNITY_STANDARDS_URL` (optional — link is hidden when empty).
- [ ] **New npm deps (2)** — `@uiw/react-md-editor ^4.x` + `react-markdown ^10.x`. Approved per D7 as justified deps.
- [ ] **Live Board read-path migration** — swap `<p>{kudo.message}</p>` → `<ReactMarkdown …>{kudo.message}</ReactMarkdown>` in `KudosHighlightCard` + `KudosPostCard`. Safe for legacy plain-text messages (markdown is superset).
- [ ] **Assets** — download from Figma `ihQ26W78P2`:
  - `MM_MEDIA_Bold`, `MM_MEDIA_Italic`, `MM_MEDIA_Strikethrough`, `MM_MEDIA_Number List`, `MM_MEDIA_Link` (reuse from `public/assets/kudos/`), `MM_MEDIA_Quote` — 5 new icon files
  - `MM_MEDIA_Close` (Hủy icon) — 1 new (distinct from `Close Tiny` on thumbnails)
  - `MM_MEDIA_Close Tiny` (thumbnail X) — 1 new
  - `MM_MEDIA_Plus` (chip + image add) — 1 new (possibly reusable from other design if present)
  - `MM_MEDIA_Send` — existing at `/assets/kudos/send.svg`
  - `MM_MEDIA_Down` — existing at `/assets/icons/chevron-down.svg`
- [ ] **i18n** — add `kudos.compose.*` namespace to both `vi.json` and `en.json`.
- [ ] **Content team** — confirm tone of all new strings; confirm whether anonymous sender shows as "Ẩn danh" or a generated pseudonym.

---

## Resolved Decisions (2026-04-22)

**Business Logic:**
- **D1. Self-recipient**: belt-and-suspenders — `/api/sunners` filters out `auth.uid()` client-side AND `POST /api/kudos` returns 403 when `recipient_id === sender_id`.
- **D2. Danh hiệu on Live Board**: confirmed — chip shows `kudo.title`; falls back to `hashtags[0]` when title is empty (legacy rows).
- **D3. Content storage format**: **Markdown text**, not HTML. Message persisted as raw UTF-8 markdown (≤ 2000 chars), enforced by Zod + DB `CHECK` constraint. **No HTML sanitize dependency required** — `react-markdown` renders with raw-HTML disabled (default), so no `<script>`/`<iframe>` risk. DB just stores the text.
- **D4. Tiêu chuẩn cộng đồng URL**: deferred — `NEXT_PUBLIC_COMMUNITY_STANDARDS_URL` env var; link hidden when unset.

**Technical:**
- **D5. Draft persistence**: **DB-backed** via new table `kudo_drafts(user_id PK, payload jsonb, updated_at)` — one active draft per user. Auto-save debounced at 2 s on form change; fetched on dialog mount; deleted on submit success or explicit discard.
- **D6. Mention storage format**: **Markdown inline syntax** — `@[Display Name](user:<uuid>)`. A custom `react-markdown` renderer maps these to a styled `<a>` linking to the user's profile. Server validates each mention UUID on insert.
- **D7. Markdown libraries — approved additions**:
  - `@uiw/react-md-editor ^4.x` (~45 KB gz) — compose dialog editor (includes Bold/Italic/Strike/List/Link/Quote toolbar out-of-the-box).
  - `react-markdown ^10.x` (~35 KB gz) — renders stored markdown on Live Board cards + Kudo detail page.
  - Same justification bar as `zod` — a library-level decision for user-content authoring that the hand-roll alternative cannot match on safety + UX.

**Design / Visual:**
- **D8. Backdrop dismiss**: dirty-state → discard-confirm; clean-state → close directly. Parity with Hủy / ESC.
- **D9. Required-asterisk color**: approved — new token `--color-required-asterisk: #CF1322`.

No remaining open questions — spec is ready for `/momorph.plan`.

---

## Notes

- **Scope discipline**: the compose dialog is a single modal, single screen. No nested dialogs (mention popover is inline). No multi-step wizard.
- **Reuse heavy**: `<Dialog>`, `<Toast>`, `<ToastProvider>` from `src/components/ui/`; `FilterDropdown`/autocomplete pattern from Live Board; uploads/service/validation layers already built.
- **Backend forward-compat**: `title` defaults to `''` and `is_anonymous` to `false` — all existing Live Board reads continue to work. A `COALESCE(NULLIF(k.title, ''), k.hashtags[1])` fallback in `kudo_to_json()` renders `hashtags[0]` for legacy rows.
- **Emoji reactions still P3** per Live Board spec — not related to compose flow.
- **Markdown-first content model** (per D3): `Kudo.message` is raw markdown. Read-path on Live Board changes from plain string → `react-markdown` render. This is a shared concern — the Live Board `KudosHighlightCard` + `KudosPostCard` components must swap their `<p>{message}</p>` for `<ReactMarkdown components={{...}}>{message}</ReactMarkdown>` with the mention renderer. Migration path: existing plain-text messages render as-is (markdown is a superset of plain text for practical purposes here).
- **Library budget**: compose dialog bundle ≤ 80 KB gz (45 KB editor + 10 KB compose code + room for react-markdown if co-loaded). Live Board bundle adds `react-markdown` (~35 KB gz).
- **Draft size limit**: enforce `pg_column_size(payload) <= 64 KB` via a DB `CHECK` constraint (prevents abuse via huge pasted content). Validated client-side too.
- **Autosave backoff**: if `PUT /api/kudos/drafts/me` fails 3 consecutive times, pause autosave and show "Không thể lưu nháp — sẽ thử lại sau" banner; retry on next form change after 30 s cooldown.
