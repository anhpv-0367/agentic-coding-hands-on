# Tasks: Write Kudo Compose Dialog (`/kudos?compose=1`)

**Frame**: `ihQ26W78P2-KudosCompose` (Figma `520:11602` → modal `520:11647`)
**Prerequisites**: `spec.md`, `design-style.md`, `plan.md` ✅
**Source repo**: `frontend/` (Next.js 16 App Router, TypeScript strict, Tailwind v4, React 19, Jest 30, Playwright) + `supabase/` (1 new migration)

---

## Task Format

```
- [ ] T### [P?] [Story?] Description | file/path.ts
```

- **[P]**: Can run in parallel with other [P] tasks in the same phase (different files, no intra-phase dependencies)
- **[Story]**: User story label (US1…US9) — required for user-story phase tasks only
- **|**: File path(s) affected by this task

---

## Resolved Decisions (from spec.md)

- **D1**: Self-recipient blocked client + server (`/api/sunners` filters `auth.uid()`; POST 403).
- **D2**: Danh hiệu as chip on Live Board with `hashtags[0]` fallback.
- **D3**: Markdown text storage, no HTML sanitize dep.
- **D5**: DB-backed drafts via `kudo_drafts` table + 3 endpoints.
- **D7**: 2 new npm deps — `@uiw/react-md-editor` + `react-markdown`.
- **D8**: Backdrop dismiss triggers discard-confirm on dirty.
- **D9**: New token `--color-required-asterisk: #CF1322`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Asset preparation, deps, folder scaffolding.

- [ ] T001 Verify existing shared icons from earlier batches (`MM_MEDIA_Link`, `MM_MEDIA_Send`, `MM_MEDIA_Down`, `MM_MEDIA_Close Tiny`) are present at `public/assets/kudos/` + `public/assets/icons/` | frontend/public/assets/
- [ ] T002 [P] Download `MM_MEDIA_Bold` SVG via `mcp__momorph__get_media_files` (screenId=ihQ26W78P2) + tint to `currentColor` | frontend/public/assets/kudos/editor-bold.svg
- [ ] T003 [P] Download `MM_MEDIA_Italic` SVG + tint to `currentColor` | frontend/public/assets/kudos/editor-italic.svg
- [ ] T004 [P] Download `MM_MEDIA_Strikethrough` SVG + tint to `currentColor` | frontend/public/assets/kudos/editor-strike.svg
- [ ] T005 [P] Download `MM_MEDIA_Number List` SVG + tint to `currentColor` | frontend/public/assets/kudos/editor-list.svg
- [ ] T006 [P] Download `MM_MEDIA_Quote` SVG + tint to `currentColor` | frontend/public/assets/kudos/editor-quote.svg
- [ ] T007 [P] Download `MM_MEDIA_Plus` SVG + tint to `#FFEA9E` | frontend/public/assets/icons/plus.svg
- [ ] T008 [P] Download `MM_MEDIA_Close` (24 px, cancel button icon) + tint to `#00101A` | frontend/public/assets/kudos/close.svg
- [ ] T009 [P] Download `MM_MEDIA_Close Tiny` (10 px, thumbnail X-remove) + keep white fill (renders on red circle) | frontend/public/assets/kudos/close-tiny.svg
- [ ] T010 Install `@uiw/react-md-editor ^4.x` + `react-markdown ^10.x` via `npm install --save` | frontend/package.json
- [ ] T011 Document `NEXT_PUBLIC_COMMUNITY_STANDARDS_URL` optional env var in project README or `.env.local.example` (unset = link hidden per FR-014) | frontend/README.md or frontend/.env.local.example

**Checkpoint**: All 8 new assets on disk, 2 npm packages installed + reflected in `package-lock.json`, env var documented.

---

## Phase 2: Foundation (Blocking Prerequisites)

**Purpose**: Tokens, i18n, types, Zod, service, migration, Route Handlers, pure modules — required by ALL user stories.

**⚠️ CRITICAL**: No user story work begins until this phase is complete.

### Tokens + i18n

- [x] T012 Add Kudos Compose `@theme` tokens to `globals.css` — 5 new colors (`--color-bg-kudos-modal-backdrop`, `--color-bg-input`, `--color-required-asterisk`, `--color-btn-toolbar-active-bg`, `--color-bg-close-tiny`), 4 typography (`--text-kudos-compose-title`, `--text-kudos-compose-label`, `--text-kudos-compose-input`, `--text-required-asterisk`), 13 spacing (`--space-compose-*`), 6 radii/borders (`--radius-compose-*`, `--border-compose-*`), 1 shadow (`--shadow-compose-modal`) per design-style.md §Design Tokens | frontend/src/app/globals.css
- [x] T013 [P] Add `kudos.compose.*` i18n namespace to `vi.json` — ~55 keys per spec.md §i18n Keys | frontend/src/i18n/messages/vi.json
- [x] T014 [P] Mirror `kudos.compose.*` namespace in `en.json` with English translations | frontend/src/i18n/messages/en.json

### Supabase migration

- [x] T015 Author migration `20260422_06_kudos_compose_fields.sql` — ALTER `kudos` add `title text NOT NULL DEFAULT '' CHECK (char_length(title) <= 80)` + `is_anonymous boolean NOT NULL DEFAULT false`; UPDATE `kudo_to_json()` to include new fields + mask sender when `is_anonymous = true` + title fallback to `hashtags[1]` when empty (D2); CREATE `kudo_drafts(user_id uuid PK, payload jsonb NOT NULL CHECK (pg_column_size(payload) <= 65536), updated_at timestamptz NOT NULL DEFAULT now())` + RLS (SELECT/INSERT/UPDATE/DELETE all `user_id = auth.uid()`); CREATE trigger `touch_kudo_drafts_updated_at` | supabase/migrations/20260422_06_kudos_compose_fields.sql
- [ ] T016 Run `supabase db reset` locally to verify migration applies + RLS + trigger work end-to-end | supabase/

### Types + Zod + service (TDD — pure tests first)

- [ ] T017 [P] Unit test for `parseMentions(markdown): { text, mentions: string[] }` pure fn — extract `@[Name](user:uuid)` tokens and UUIDs; preserve text; malformed tokens return original string | frontend/tests/unit/kudos/mentions.test.ts
- [ ] T018 [P] Unit test for `stripInvalidMentions(markdown, validUuids: Set<string>): string` — replace invalid `user:uuid` links with plain text of the display name | frontend/tests/unit/kudos/mentions.test.ts
- [ ] T019 Implement `src/lib/kudos/mentions.ts` (parseMentions + stripInvalidMentions + serializeMention) to pass T017 + T018 | frontend/src/lib/kudos/mentions.ts
- [x] T020 Extend `src/types/kudos.ts` — add `title: string` + `is_anonymous: boolean` to `Kudo`; add `KudoDraft`, `ComposeFormState`, `DraftStatus = "idle"\|"saving"\|"saved"\|"error"\|"offline"\|"paused"` | frontend/src/types/kudos.ts
- [x] T021 Extend `src/lib/services/kudos-validation.ts` — `CreateKudoSchema` adds `title: z.string().min(1).max(80)` + `is_anonymous: z.boolean().default(false)`; `message` enforces markdown text 10–2000 chars; add `DraftPayloadSchema` (subset with all fields optional, payload size ≤64 KB validated at controller) | frontend/src/lib/services/kudos-validation.ts
- [x] T022 Extend `src/lib/services/kudos-service.ts` — update `createKudo(input: CreateKudoInput)` signature; add `getDraft()`, `putDraft(payload: DraftPayload)`, `deleteDraft()` typed helpers | frontend/src/lib/services/kudos-service.ts

### Backend Route Handlers (real Supabase)

- [x] T023 Create `GET/PUT/DELETE /api/kudos/drafts/me` Route Handler — GET returns `{ payload, updated_at } | null`; PUT upserts with Zod `DraftPayloadSchema` validation; DELETE is idempotent; all methods require `auth.getUser()` | frontend/src/app/api/kudos/drafts/me/route.ts
- [x] T024 Extend `POST /api/kudos` (title + is_anonymous + self-recipient 403; mention validation deferred to Phase 4) — validate `title` + `is_anonymous`; block self-recipient with 403 (`{ code: "self_recipient", … }`); validate each mention UUID exists via `SELECT id FROM profiles WHERE id = ANY($uuids)`; strip tokens with invalid UUIDs silently from `message` before insert | frontend/src/app/api/kudos/route.ts
- [x] T025 Update `GET /api/sunners` Route Handler — filter `auth.uid()` out of results server-side (so client list never shows self, per D1) | frontend/src/app/api/sunners/route.ts

### API integration tests (real Supabase mock)

- [ ] T026 [P] Integration test — `GET /api/kudos/drafts/me` returns 401 when unauthenticated; returns null when no draft; returns `{ payload, updated_at }` when draft exists | frontend/tests/integration/kudos/api-drafts.test.ts
- [ ] T027 [P] Integration test — `PUT /api/kudos/drafts/me` upserts; second PUT with different payload updates (not duplicates); validates Zod schema (400 on malformed) | frontend/tests/integration/kudos/api-drafts.test.ts
- [ ] T028 [P] Integration test — `DELETE /api/kudos/drafts/me` is idempotent (second call returns 200/204 even when no draft); returns 401 unauthenticated | frontend/tests/integration/kudos/api-drafts.test.ts
- [ ] T029 [P] Integration test — `POST /api/kudos` with `recipient_id === sender_id` returns 403 (`code: "self_recipient"`) | frontend/tests/integration/kudos/api-compose.test.ts
- [ ] T030 [P] Integration test — `POST /api/kudos` strips invalid mention UUIDs from message before insert; returns 201 with clean message | frontend/tests/integration/kudos/api-compose.test.ts
- [ ] T031 [P] Integration test — `GET /api/sunners` results never include `auth.uid()` | frontend/tests/integration/kudos/api-sunners.test.ts

### Generic hooks (TDD)

- [ ] T032 [P] Unit test `useAutocomplete(query, fetcher, delayMs)` — debounces; aborts previous request on new query; handles empty query (returns []) | frontend/tests/unit/kudos/useAutocomplete.test.ts
- [ ] T033 [P] Unit test `useDraftAutosave(formState, putFn, { debounceMs, maxFailures, backoffMs })` — debounced PUT; 3-fail backoff; `online`/`offline` events transition status; resume on reconnect | frontend/tests/unit/kudos/useDraftAutosave.test.ts
- [ ] T034 Implement `useAutocomplete` hook to pass T032 | frontend/src/hooks/useAutocomplete.ts
- [ ] T035 Implement `useDraftAutosave` hook to pass T033 | frontend/src/hooks/useDraftAutosave.ts

### Dialog API change (shared primitive)

- [ ] T036 Extend `<Dialog>` primitive with optional `onRequestClose?: (reason: "esc"|"backdrop"|"button") => boolean | Promise<boolean>` prop — returns `false` to veto close; existing callers unaffected | frontend/src/components/ui/Dialog.tsx
- [ ] T037 Extend `tests/unit/kudos/Dialog.test.tsx` with cases: `onRequestClose` returns `false` (close blocked); returns `true` (close proceeds); returns Promise resolving `false`/`true` | frontend/tests/unit/kudos/Dialog.test.tsx

**Checkpoint**: Tokens + i18n + migration applied; types/Zod/service extended; 3 new drafts endpoints + compose POST updates wired to Supabase; 6 API integration tests pass; 2 new hooks tested; Dialog vetoable close supported. User stories can proceed.

---

## Phase 3: User Story 1 + User Story 4 (P1) 🎯 MVP Slice

**Goal**: Authenticated Sunner opens dialog, fills Người nhận + Danh hiệu + plain-text message + 1 hashtag, submits. Dialog closes; Live Board refetches; new Kudo appears.

**Independent Test**: On `/kudos`, click "Ghi nhận" pill. Fill all required fields. Click "Gửi". Dialog closes. The new Kudo appears in the All Kudos list on next refresh. The Kudo's title chip shows the Danh hiệu (not the first hashtag).

### Tests (US1 + US4 — TDD)

- [x] T038 [P] [US1] Unit test `<KudosComposeDialog>` — opens when `?compose=1`; focus lands on Người nhận; submit disabled initially; submit enabled when required fields filled; submit calls `createKudo` with correct payload and closes on success | frontend/tests/unit/kudos/KudosComposeDialog.test.tsx
- [ ] T039 [P] [US1] Unit test `<RecipientPicker>` — 200 ms debounce before fetch; results render as listbox; selecting fills hidden `recipient_id`; suggestions never include current user; ArrowUp/Down/Enter keyboard nav; self-recipient attempt blocks submit with inline error | frontend/tests/unit/kudos/RecipientPicker.test.tsx
- [ ] T040 [P] [US4] Unit test `<KudoTitleInput>` — 80-char cap; counter updates; required validation ("Danh hiệu là bắt buộc" inline); `aria-invalid="true"` on empty submit | frontend/tests/unit/kudos/KudoTitleInput.test.tsx
- [ ] T041 [P] [US1] Unit test `<ComposeSubmitButton>` — renders loading spinner + "Đang gửi…" while `inFlight=true`; `aria-disabled="true"` when disabled; label swaps based on state | frontend/tests/unit/kudos/ComposeSubmitButton.test.tsx
- [ ] T042 [P] [US1] Unit test `<ComposeCancelButton>` — fires `onClick` handler; renders close icon + "Hủy" label; focus ring on keyboard focus | frontend/tests/unit/kudos/ComposeCancelButton.test.tsx

### Primitives (US1 + US4)

- [x] T043 [P] [US1] Create `<ComposeSubmitButton>` — gold pill (`#FFEA9E` bg, `#00101A` text, 8 px radius, 60 px height); Send icon; 5 states (default/hover/focus/disabled/loading) per design-style §H | frontend/src/components/kudos/ComposeSubmitButton.tsx
- [x] T044 [P] [US1] Create `<ComposeCancelButton>` — secondary bg `rgba(255,234,158,0.1)`, `#998C5F` border, 4 px radius, 60 px height; Close icon 24 × 24 | frontend/src/components/kudos/ComposeCancelButton.tsx
- [x] T045 [P] [US4] Create `<KudoTitleInput value onChange maxLength={80}>` — label "Danh hiệu *" with red asterisk; 514 × 56 input; 1 px bronze border, 8 px radius, 16 × 24 padding; helper text below; counter right-aligned | frontend/src/components/kudos/KudoTitleInput.tsx
- [x] T046 [P] [US1] Create `<RecipientPicker value onChange>` — uses `useAutocomplete` + `searchSunners` service; listbox pattern with `aria-activedescendant`; caret icon (chevron-down); filters out current user (client-side belt-and-suspenders); 4 input states (default/focus/error/disabled) | frontend/src/components/kudos/RecipientPicker.tsx

### Simplified hashtag (no typeahead yet — comes in US5/Phase 5)

- [x] T047 [US1] Create `<HashtagPicker>` (initial — no typeahead) — inline input + chip list + add button; 1-5 limit with "+ Hashtag" button hidden at 5; duplicate-block (shake anim); X-remove on each chip; no suggestions dropdown yet (added in Phase 5) | frontend/src/components/kudos/HashtagPicker.tsx

### Plain-textarea fallback editor (full MDEditor in Phase 4)

- [x] T048 [US1] Create `<MarkdownEditor>` placeholder — plain `<textarea>` with `min-h-[200px]`, 10–2000 char validation, bronze border, 0/0/8/8 radius; emits raw text to `onChange`. Phase 4 swaps this implementation to `@uiw/react-md-editor` — API surface stays identical | frontend/src/components/kudos/MarkdownEditor.tsx

### Anonymous checkbox + display masking (US1-adjacent, needed for submit payload)

- [x] T049 [P] [US1] Create `<AnonymousCheckbox checked onChange>` — 24 × 24 native checkbox styled with gold when checked; label "Gửi lời cám ơn và ghi nhận ẩn danh" (16/700 `#00101A` — contrast override from `#999999` per design-style note) | frontend/src/components/kudos/AnonymousCheckbox.tsx
- [x] T050 [P] [US1] Update `<KudoAuthors>` — when `kudo.is_anonymous` is true, render "Ẩn danh" + generic silhouette avatar; all tier badges and other metadata on the sender side are hidden; recipient side unchanged | frontend/src/components/kudos/KudoAuthors.tsx
- [ ] T051 [P] [US1] Extend `tests/unit/kudos/KudoAuthors.test.tsx` (or create) — verify anonymous render path; verify non-anonymous path unchanged | frontend/tests/unit/kudos/KudoAuthors.test.tsx

### Live Board card updates (US1)

- [x] T052 [P] [US1] Update `<KudosHighlightCard>` — swap chip source from `kudo.hashtags[0]` → `kudo.title || kudo.hashtags[0]` (fallback) | frontend/src/components/kudos/KudosHighlightCard.tsx
- [x] T053 [P] [US1] Update `<KudosPostCard>` (rendered title as heading above message) — same chip swap | frontend/src/components/kudos/KudosPostCard.tsx

### Compose dialog shell (US1)

- [x] T054 [US1] Create `<KudosComposeDialog>` (uses plain Dialog close; discard-confirm + standards link deferred) — wraps shared `<Dialog>` with `onRequestClose` (vetoable); composes primitives (RecipientPicker, KudoTitleInput, MarkdownEditor, HashtagPicker, AnonymousCheckbox, Submit+Cancel); manages `ComposeFormState` via `useReducer`; renders "Tiêu chuẩn cộng đồng" link (hidden when env unset); calls extended `createKudo` on submit; on success closes + fires success toast + Live Board refetch; on failure stays open + form-level banner | frontend/src/components/kudos/KudosComposeDialog.tsx
- [x] T055 [US1] Wire compose — modify `<KudosComposeTrigger>` to mount `<KudosComposeDialog>` (replacing `<KudosComposePlaceholder>`); URL `?compose=1` state via existing `useUrlState` stays unchanged | frontend/src/components/kudos/KudosComposeTrigger.tsx
- [x] T056 [US1] Update `src/components/kudos/index.ts` barrel exports — add all new compose components | frontend/src/components/kudos/index.ts

**Checkpoint**: `/kudos` → click Ghi nhận → fill → submit → Kudo appears on Live Board with correct title chip. US1 + US4 acceptance scenarios 1–5 pass. Deployable MVP slice.

---

## Phase 4: User Story 2 + User Story 3 + User Story 6 (P1)

**Goal**: Replace plain-textarea with real markdown editor; add `@mention` typeahead; add image upload.

**Independent Test**: In the dialog, click Bold → selected text becomes bold (**text**); type `@Hi` → mention popover appears; click one → markdown `@[Name](user:uuid)` inserted; click + Image → upload a JPG → thumbnail appears; submit includes the URL + markdown.

### Tests (US2 + US3 + US6 — TDD)

- [ ] T057 [P] [US3] Unit test `<MarkdownToolbar>` — each of 6 buttons fires the corresponding MDEditor command; active/disabled states render correctly; "Tiêu chuẩn cộng đồng" link visible only when `NEXT_PUBLIC_COMMUNITY_STANDARDS_URL` is set, with `target="_blank"` + `rel="noopener noreferrer"` | frontend/tests/unit/kudos/MarkdownToolbar.test.tsx
- [ ] T058 [P] [US2] Unit test `<MentionPopover>` — opens on `@` keystroke with 1+ char prefix; debounced 200 ms fetch; ArrowUp/Down/Enter keyboard nav; ESC closes; clicking suggestion inserts `@[Name](user:uuid)` markdown at cursor | frontend/tests/unit/kudos/MentionPopover.test.tsx
- [ ] T059 [P] [US6] Unit test `<ImageUploader>` — file picker accepts `image/jpeg|png|webp`; >5 MB rejected with inline error; 1-5 thumbnail limit; X-remove updates state; retry resumes upload; abort on unmount | frontend/tests/unit/kudos/ImageUploader.test.tsx
- [ ] T060 [P] Unit test `<KudoMarkdown>` — (a) plain text renders unchanged; (b) `<script>` in content renders as escaped text; (c) `user:<uuid>` link routes to `/users/<uuid>`; (d) `http://…` link opens external with `target="_blank" rel="noopener"`; (e) `javascript:alert(1)` scheme stripped | frontend/tests/unit/kudos/KudoMarkdown.test.tsx

### Rich-text editor (US3)

- [ ] T061 [US3] Replace `<MarkdownEditor>` internals — use `@uiw/react-md-editor` via `dynamic(() => import(...), { ssr: false })`; pass `hideToolbar={true}` + `preview="edit"` + `visibleDragbar={false}`; expose `commandApi` ref so `<MarkdownToolbar>` can call `executeCommand(commands.bold)` etc.; preserve 10-2000 char validation; attach `onPaste` handler that strips HTML via `event.preventDefault()` + `document.execCommand("insertText", false, event.clipboardData.getData("text/plain"))` | frontend/src/components/kudos/MarkdownEditor.tsx
- [ ] T062 [US3] Create `<MarkdownToolbar>` — 6 buttons + "Tiêu chuẩn cộng đồng" link; each button wires to MDEditor command via prop callback; border/radius per design-style §C (buttons share borders via per-button `border-right`); active state `rgba(255,234,158,0.2)` bg + gold icon | frontend/src/components/kudos/MarkdownToolbar.tsx

### @mention popover (US2)

- [ ] T063 [US2] Create `<MentionPopover>` — listens for `@` keystroke via editor onChange; detects `@<prefix>` pattern; computes caret position via hand-rolled mirrored-div technique (no new library); renders listbox with `/api/sunners` results; inserts markdown `@[Name](user:uuid)` token via `commandApi.executeCommand` on selection | frontend/src/components/kudos/MentionPopover.tsx
- [ ] T064 [US2] Integrate `<MentionPopover>` into `<MarkdownEditor>` — popover overlay with absolute positioning; keyboard events (ArrowUp/Down/Enter/Esc) routed to popover when open; document aria-relationship | frontend/src/components/kudos/MarkdownEditor.tsx

### Image upload (US6)

- [ ] T065 [US6] Create `<ImageUploader>` — 0–5 slot grid per design-style §F (thumbnails 80 × 80, 8 px radius, X-remove circle 16 × 16 red `#D4271D`); native file picker with MIME whitelist; per-slot reducer `{ queued | uploading | done | error }`; max 3 concurrent uploads (spec TR-007); `AbortController` per upload; `POST /api/uploads` integration via `uploadImage` service; retry button on error overlay; "+ Image" button hidden at 5; JSDoc: `// TODO: orphan-URL cleanup (out of MVP scope)` | frontend/src/components/kudos/ImageUploader.tsx

### Shared markdown renderer (Live Board read-path)

- [ ] T066 [US3] Create `<KudoMarkdown>` — wraps `react-markdown`; `disallowedElements={["img", "iframe", "script", "style"]}` + `skipHtml={true}`; custom `components.a` handles 3 schemes: `user:<uuid>` → profile link chip with gold-tint bg; `http(s)` → external link with `rel="noopener noreferrer" target="_blank"`; other schemes → plain text (link stripped); custom `components.ol`, `components.blockquote` apply project typography | frontend/src/components/kudos/KudoMarkdown.tsx
- [ ] T067 [US3] Update `<KudosHighlightCard>` — swap `<p>{kudo.message}</p>` → `<KudoMarkdown>{kudo.message}</KudoMarkdown>` | frontend/src/components/kudos/KudosHighlightCard.tsx
- [ ] T068 [US3] Update `<KudosPostCard>` — same markdown swap | frontend/src/components/kudos/KudosPostCard.tsx

### Integration test (full compose flow)

- [ ] T069 [US1, US2, US3, US6] Integration test `compose-flow.test.tsx` — open dialog → select recipient → type title → write message with bold + mention + image → add 2 hashtags → submit → verify payload shape → dialog closes + toast appears | frontend/tests/integration/kudos/compose-flow.test.tsx

**Checkpoint**: Rich markdown editor live; mentions + images functional; Live Board cards render markdown safely with XSS unit-test coverage. P1 user stories fully shipped.

---

## Phase 5: User Story 5 (P1) + User Story 7 + User Story 8 (P2)

**Goal**: Hashtag typeahead + 5-limit polish; anonymous checkbox wired; DB-backed draft auto-save with restored banner + discard-confirm dialog.

**Independent Test**: Typing in `+ Hashtag` input shows suggestions from `/api/kudos/filters`; 5-limit hides add; duplicate block shakes existing chip. Toggle anonymous → on submit Kudo shows as "Ẩn danh" on Live Board. Type content → wait 2 s → "Đã lưu nháp" indicator; reload `/kudos?compose=1` → form pre-populated + restored banner fades in/out. Hủy on dirty form → discard-confirm dialog; OK clears draft; Cancel keeps editing.

### Tests (US5, US7, US8 — TDD)

- [ ] T070 [P] [US5] Unit test `<HashtagPicker>` typeahead — fetches `/api/kudos/filters` on `+ Hashtag` click; debounced prefix match; ArrowUp/Down/Enter selects; duplicate rejected with shake anim (disabled under `prefers-reduced-motion`) | frontend/tests/unit/kudos/HashtagPicker.test.tsx
- [ ] T071 [P] [US7] Unit test `<AnonymousCheckbox>` payload behavior (integration) — checked → `formState.isAnonymous = true` → submit payload carries `is_anonymous: true` | frontend/tests/integration/kudos/compose-flow.test.tsx
- [ ] T072 [P] [US8] Unit test `<DraftStatusIndicator>` — 6 states render (idle hidden, saving with spinner, saved with fade-out, error persistent, offline, paused); typography `--text-nav-sm`; colors per design-style §H | frontend/tests/unit/kudos/DraftStatusIndicator.test.tsx
- [ ] T073 [P] [US8] Unit test `<DraftRestoredBanner>` — mounts when prop `visible=true`; auto-dismisses after 3 s; `role="status" aria-live="polite"` | frontend/tests/unit/kudos/DraftRestoredBanner.test.tsx
- [ ] T074 [P] [US8] Unit test `<DiscardConfirmDialog>` — nested `<Dialog>` with "Bỏ thay đổi?" title + 2 buttons ("Bỏ" + "Tiếp tục"); fires `onConfirm` / `onCancel`; ESC closes (maps to Cancel) | frontend/tests/unit/kudos/DiscardConfirmDialog.test.tsx

### Implementation (US5 — Hashtag typeahead)

- [ ] T075 [US5] Extend `<HashtagPicker>` — on `+ Hashtag` click, fetch `/api/kudos/filters` once (cache result for dialog lifetime); show dropdown listbox below input with filtered suggestions (case-insensitive); pressing Enter inserts either selected suggestion or the typed free-form string; hide add button at 5 chips; duplicate chip detection with 150 ms shake animation (no-op under reduced-motion) | frontend/src/components/kudos/HashtagPicker.tsx

### Implementation (US7 — Anonymous wiring)

- [ ] T076 [US7] Wire `<AnonymousCheckbox>` state into `<KudosComposeDialog>` reducer — `isAnonymous` flows into submit payload as `is_anonymous: boolean` (already in types/Zod from Phase 2) | frontend/src/components/kudos/KudosComposeDialog.tsx

### Implementation (US8 — Draft lifecycle)

- [ ] T077 [P] [US8] Create `<DraftStatusIndicator>` — inline status pill next to Gửi; 6 states per design-style §H draft-status table; `saved` state fades after 1.5 s | frontend/src/components/kudos/DraftStatusIndicator.tsx
- [ ] T078 [P] [US8] Create `<DraftRestoredBanner>` — absolute-positioned gold-tinted banner at top of modal; 3 s fade-in/out; `role="status"` + `aria-live="polite"`; auto-dismiss | frontend/src/components/kudos/DraftRestoredBanner.tsx
- [ ] T079 [P] [US8] Create `<DiscardConfirmDialog>` — nested `<Dialog>` (uses `onRequestClose` veto from Phase 2); title "Bỏ các thay đổi chưa lưu?"; 2 buttons "Bỏ" (primary gold) + "Tiếp tục" (secondary); ESC → cancel | frontend/src/components/kudos/DiscardConfirmDialog.tsx
- [ ] T080 [US8] Wire draft lifecycle into `<KudosComposeDialog>`:
  - On mount: `GET /api/kudos/drafts/me` → if payload → populate form + set `showRestoredBanner = true`.
  - On form change: `useDraftAutosave` debounced 2 s PUT; updates `draftStatus` state machine (idle → saving → saved → error/offline/paused).
  - On close attempt (Hủy/ESC/backdrop): if form dirty, show `<DiscardConfirmDialog>`; Cancel → keep open; Confirm → DELETE draft + close.
  - On submit success: DELETE draft + close + toast.
  | frontend/src/components/kudos/KudosComposeDialog.tsx

**Checkpoint**: Full feature parity with spec. All US1–US8 acceptance scenarios pass. Draft persists across page reload.

---

## Phase 6: User Story 9 (P1) — Accessibility & Quality Gates

**Purpose**: A11y audit, responsive verification, bundle-size gate, cross-cutting polish.

### Accessibility

- [ ] T081 [US9] E2E `tests/e2e/kudos.spec.ts` — extend with compose flow: click Ghi nhận → dialog mounts → first input focused → Tab cycles through all 12+ focusable elements (recipient input → title → toolbar 6 buttons → textarea → hashtag → image → anonymous → Hủy → Gửi) → Tab at last wraps to first; ESC triggers discard-confirm on dirty; submit success closes + list refreshes | frontend/tests/e2e/kudos.spec.ts
- [ ] T082 [US9] E2E — axe-playwright on `/kudos?compose=1` state — 0 WCAG 2.1 AA violations | frontend/tests/e2e/kudos.spec.ts
- [ ] T083 [US9] E2E — reduced-motion verification: `emulateMedia({ reducedMotion: "reduce" })` → no modal scale-in anim; no chip shake on duplicate hashtag; no banner fade; no heart scale-bounce on cards | frontend/tests/e2e/kudos.spec.ts

### Responsive

- [ ] T084 [US9] E2E — responsive desktop 1440 / tablet 768 / mobile 375; verify modal width breakpoints (752/680/100vw); footer button layout (horizontal/horizontal/stacked); toolbar wrap to 2 rows on mobile | frontend/tests/e2e/kudos.spec.ts

### i18n parity

- [ ] T085 Extend `tests/unit/i18n/parity.test.ts` to enforce `kudos.compose.*` namespace parity between `vi.json` and `en.json` | frontend/tests/unit/i18n/parity.test.ts

### Bundle-size gate

- [ ] T086 Run `pnpm build` → capture route chunk sizes → confirm `/kudos` Live Board chunk grew ≤40 KB gz (just `react-markdown`) and compose chunk ≤90 KB gz; if exceeded, audit via `@next/bundle-analyzer` for static imports of `@uiw/react-md-editor` into Live Board chunk | frontend/
- [ ] T087 Ensure `@uiw/react-md-editor` is only imported via `next/dynamic({ ssr: false })` inside `<MarkdownEditor>`; grep confirms no top-level static imports of it in any file under `src/components/kudos/` or `src/app/` | frontend/

### Cleanup

- [ ] T088 Delete `src/components/kudos/KudosComposePlaceholder.tsx` + remove barrel export + any leftover imports | frontend/src/components/kudos/
- [ ] T089 Update `.momorph/SCREENFLOW.md` — mark Write Kudo compose dialog as `implemented` in the screens table; add discovery-log entry with implementation date, task count, dependencies added | .momorph/SCREENFLOW.md

### Quality gates (per CLAUDE.md)

- [ ] T090 Run `cd frontend && pnpm typecheck` — 0 TypeScript errors | frontend/
- [ ] T091 Run `cd frontend && pnpm build` — production build succeeds; verify route table includes `/api/kudos/drafts/me` | frontend/
- [ ] T092 Run `cd frontend && pnpm test` — all unit + integration suites pass (~15 new suites + extensions) | frontend/
- [ ] T093 Run `cd frontend && pnpm test:e2e` — all E2E + axe scenarios pass (requires authenticated Supabase test session) | frontend/

**Checkpoint**: All user stories + polish + quality gates green. Feature ready to ship.

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup) ─── no deps
    ↓
Phase 2 (Foundation — tokens + i18n + types + Zod + service + migration + 3 drafts endpoints + compose POST update + sunners filter + 6 API tests + 2 hooks + Dialog API) ─── blocks ALL user stories
    ↓
Phase 3 (US1 MVP + US4 Danh hiệu) ─── deliverable: basic compose end-to-end with plain-textarea fallback
    ↓
Phase 4 (US2 mentions + US3 markdown editor + US6 images) ─── depends on Phase 3 dialog shell
    ↓
Phase 5 (US5 hashtag typeahead + US7 anonymous wire + US8 drafts) ─── depends on Phase 2 hooks + Phase 3 dialog
    ↓
Phase 6 (US9 a11y + polish + quality gates) ─── depends on all stories
```

### Within each user story (TDD — constitution §III)

- Tests [P] MUST be written and FAIL before implementation tasks.
- Primitives before composites.
- Composites before dialog shell wire.
- Route Handler stubs + hooks (Phase 2) must exist before client-side components fetch them.

### Parallel Opportunities

**Phase 1** — T002–T009 all `[P]` (independent asset downloads). T001 + T010 + T011 independent. T010 triggers `npm install` so T011 sequential after T010.

**Phase 2** — T013 + T014 `[P]` (i18n files). T017 + T018 `[P]` (mention tests). T026–T031 all `[P]` (API integration tests across different handler files). T032 + T033 `[P]` (hook tests). T012 + T015 sequential (migration needs `supabase db reset` after authoring).

**Phase 3 (US1+US4)** — T038–T042 test files all `[P]`. T043/T044/T045/T046 primitive components `[P]` (different files). T049/T050/T051 `[P]` (AnonymousCheckbox + KudoAuthors update + test). T052 + T053 `[P]` (two card files). T054 depends on all primitives. T055 + T056 wiring sequential on shared files.

**Phase 4** — T057–T060 tests `[P]`. T061–T066 sequential (editor → toolbar → mention → uploader → markdown renderer each build on the editor base).

**Phase 5 (US5+US7+US8)** — T070–T074 tests `[P]`. T077/T078/T079 `[P]` (3 separate new files). T075 + T076 + T080 sequential on shared components.

**Phase 6** — T081–T084 share `kudos.spec.ts` file (sequential by Playwright). T085 independent. T086–T088 polish sequential. T090–T093 quality gates sequential (each consumes prior output).

### Cross-story parallel teams (if staffed)

After Phase 2:
- **Track A**: US1 + US4 (Phase 3) — builds dialog shell + primitives.
- **Track B**: can start Phase 4 US6 image uploader after Phase 3 dialog exists (parallel with US2/US3 if staffed).
- **Track C**: US8 draft hooks can be exercised in isolation once `<KudosComposeDialog>` shell exists.

---

## Implementation Strategy

### MVP First (Recommended)

1. Complete Phase 1 (assets + deps + env var).
2. Complete Phase 2 (tokens + i18n + migration + backend + hooks + Dialog API).
3. Complete Phase 3 (US1 + US4 — basic compose end-to-end with plain textarea).
4. **STOP & validate** — test on `/kudos?compose=1` with a real user session; confirm a Kudo can be sent end-to-end.
5. Deploy if ready. P1 users get basic compose immediately; rich editor + mentions + images + drafts land in subsequent ships.

### Incremental Delivery

1. Setup + Foundation (Phases 1–2).
2. **Ship 1**: US1 + US4 basic compose + Live Board chip swap (Phase 3). Deployable today.
3. **Ship 2**: US2 mentions + US3 full markdown editor + US6 image upload + Live Board markdown render (Phase 4). P1 complete.
4. **Ship 3**: US5 hashtag typeahead + US7 anonymous + US8 draft persistence (Phase 5). P2 features.
5. **Final**: US9 polish + quality gates (Phase 6). Production release.

---

## Summary

| Phase | Tasks | Count | Purpose |
|-------|-------|-------|---------|
| 1 — Setup | T001–T011 | 11 | Assets + deps + env var |
| 2 — Foundation | T012–T037 | 26 | Tokens, i18n, types, Zod, service, migration, 3 drafts endpoints, POST `/api/kudos` extension, sunners filter, 6 API tests, 2 hooks, Dialog `onRequestClose` veto |
| 3 — US1 + US4 (P1 MVP) | T038–T056 | 19 | Basic compose + Danh hiệu + anonymous display masking + card chip swap |
| 4 — US2 + US3 + US6 (P1) | T057–T069 | 13 | Full markdown editor + mentions + image upload + KudoMarkdown shared renderer + Live Board read-path markdown |
| 5 — US5 + US7 + US8 (P1/P2) | T070–T080 | 11 | Hashtag typeahead + anonymous wire + DB-backed drafts with restored banner + discard-confirm |
| 6 — US9 (P1) + Polish | T081–T093 | 13 | E2E + axe + reduced-motion + responsive + i18n parity + bundle-size gate + typecheck/build/test/e2e gates |
| **Total** | T001–T093 | **93** | Full compose dialog implementation |

**MVP-basic-compose scope** = Phases 1 + 2 + 3 = 56 tasks.
**P1 ship** = Phases 1 + 2 + 3 + 4 + 6 partial (a11y + gates) = ~75 tasks.
**Full feature ship** = all phases = **93 tasks**.

---

## Notes

- Commit after each completed task or logical group.
- Mark tasks as `- [x]` in this file as they complete.
- Run `pnpm typecheck` after every implementation task; do not advance on red.
- E2E scenarios (T081–T084) share `frontend/tests/e2e/kudos.spec.ts` (extending the Live Board spec); Playwright runs them in file order.
- TDD order per constitution §III is **non-negotiable**: write test → see red → implement → see green → refactor.
- The 2 new npm deps (`@uiw/react-md-editor`, `react-markdown`) are installed in Phase 1 so every subsequent task can rely on them.
- **Editor library decision is reversible** — `<MarkdownEditor>` has a single import; swap libs in one place if `@uiw/react-md-editor` misbehaves.
- **Forward-compat**: Kudo rows with `title = ''` render the hashtags[0] fallback chip; plain-text legacy messages render fine through `react-markdown` (markdown is a superset). Migration safe to apply mid-deploy.
- **Phase 3 intentionally uses a plain textarea** — keeps MVP shippable without editor library integration risk. Phase 4 swaps the implementation at a single file (`MarkdownEditor.tsx`).
- **Draft persistence** is keyed by `user_id` PK — single active draft per user. Multi-draft is explicitly out of scope.
- **Phase 6 bundle-size gate** is a hard gate: budgets exceeded → investigate static-import leak before shipping.
