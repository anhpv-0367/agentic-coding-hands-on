# Tasks: Login Screen

**Frame**: `GzbNeVGJHz-Login`
**Prerequisites**: plan.md ✅, spec.md ✅, design-style.md ✅

---

## Task Format

```
- [ ] T### [P?] [Story?] Description | file/path
```

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks in same phase)
- **[Story]**: Which user story this belongs to (US1, US2, US3)
- **|**: Primary file affected by this task

---

## Phase 1: Setup

**Purpose**: Download assets and scaffold the project — no feature work until this is done

- [x] T001 Download SAA logo from Figma (node `I662:14391;178:1033;178:1030`) | `public/assets/login/logos/saa-logo.png`
- [x] T002 [P] Download wave background from Figma (node `2939:9548`) | `public/assets/login/images/wave-background.png`
- [x] T003 [P] Download VN flag SVG from Figma (node `I662:14391;186:1696;186:1821;186:1709`) | `public/assets/login/icons/flag-vn.svg`
- [x] T004 [P] Download chevron-down SVG from Figma (node `I662:14391;186:1696;186:1821;186:1441`) | `public/assets/login/icons/chevron-down.svg`
- [x] T005 [P] Download Google logo SVG from Figma (node `I662:14426;186:1766`) | `public/assets/login/icons/google-logo.svg`
- [x] T006 [P] Obtain US flag SVG (custom SVG, public domain) | `public/assets/login/icons/flag-us.svg`
- [x] T007 Resolve "ROOT FURTHER" logo: rendered as PNG via Figma image API (node `662:14395`) | `public/assets/login/logos/root-further.png`
- [x] T008 Scaffold Next.js project: `npx create-next-app@latest . --typescript --tailwind --app --src-dir` | `src/`
- [x] T009 Install runtime dependencies: `@supabase/ssr @supabase/supabase-js next-intl` | `package.json`
- [x] T010 Install test dependencies: `jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @playwright/test ts-jest ts-node` | `package.json`

---

## Phase 2: Foundation (Blocking Prerequisites)

**Purpose**: Core infrastructure required by ALL user stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T011 Fix env var names in `.env.example`: rename to `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (client-safe); keep `SUPABASE_SECRET_KEY` without prefix (server-only); copy to `.env.local` and fill in values | `.env.example`
- [x] T012 [P] Create Supabase browser client singleton (`createBrowserClient`) | `src/lib/supabase/client.ts`
- [x] T013 [P] Create Supabase server client (`createServerClient` with Next.js cookie store from `next/headers`) | `src/lib/supabase/server.ts`
- [x] T014 [P] Create Jest config for Next.js + TypeScript and setup file (import `@testing-library/jest-dom`, mock `next/navigation`) | `jest.config.ts`, `jest.setup.ts`
- [x] T015 [P] Configure next-intl: locales (`["vi","en"]`), defaultLocale (`"vi"`), and `getRequestConfig` | `src/i18n/config.ts`, `src/i18n/request.ts`
- [x] T016 [P] Configure next-intl plugin wrapping Next.js config | `next.config.ts`
- [x] T017 Seed i18n message files with all translatable strings: tagline (2 lines), button label, error messages (`errors.auth_failed`, `errors.service_unavailable`), ARIA labels (login button, language selector) | `src/i18n/messages/vi.json`, `src/i18n/messages/en.json`
- [x] T018 [P] Define all design tokens in TailwindCSS v4 `@theme` block: 9 color tokens, 5 typography tokens, 10 spacing tokens, 3 border/radius tokens — exact values from `design-style.md` Design Tokens section | `src/app/globals.css`
- [x] T019 [P] Create Icon component: `type IconProps = { src: string; size: number; alt: string; className?: string; style?: CSSProperties }` — renders `<img>` with fixed width/height and enforced `alt`; ALL icons/logos MUST use this component | `src/components/ui/Icon.tsx`
- [x] T020 Create `middleware.ts`: compose `next-intl/middleware` (locale detection + cookie write) with Supabase `updateSession` (session refresh); protect all routes except `/login` and `/auth/callback`; on unauthenticated access redirect to `/login?returnTo=<encoded-path>`; chain responses by copying Set-Cookie headers from Supabase response onto the intl response | `middleware.ts`

**Checkpoint**: Foundation complete — user story phases can begin

---

## Phase 3: User Story 1 — Google OAuth Login (Priority: P1) 🎯 MVP

**Goal**: Unauthenticated user can click "LOGIN With Google", complete OAuth flow, and land on the home page. Authenticated users are redirected away from `/login`.

**Independent Test**: Navigate to `/login` while logged out → see full login page → click "LOGIN With Google" → browser redirects to Google OAuth consent screen → after consent → redirect to `/`.

### Tests (US1) — Write BEFORE implementation (TDD: Red → Green → Refactor)

- [x] T021 [P] [US1] Write failing unit tests for LoginButton: renders button with correct ARIA label, click calls `signInWithOAuth` with correct params, button is disabled during loading, error prop renders `<p role="alert">` below button | `tests/unit/login/LoginButton.test.tsx`
- [x] T022 [P] [US1] Write failing integration tests for auth callback: valid `code` param → session exchanged → redirect to `/`; missing `code` → redirect to `/login?error=auth_failed`; `error` param in URL → redirect to `/login?error=auth_failed` | `tests/integration/login/auth-callback.test.ts`

### Implementation (US1)

- [x] T023 [P] [US1] Implement OAuth PKCE callback route handler | `src/app/auth/callback/route.ts`
- [x] T024 [P] [US1] Implement LoginButton client component | `src/components/auth/LoginButton.tsx`
- [x] T025 [P] [US1] Implement Header layout component | `src/components/layout/Header.tsx`
- [x] T026 [P] [US1] Implement Footer layout component | `src/components/layout/Footer.tsx`
- [x] T027 [US1] Implement root layout with Montserrat fonts + NextIntlClientProvider | `src/app/layout.tsx`
- [x] T028 [US1] Implement root page with auth redirect | `src/app/page.tsx`
- [x] T029 [US1] Implement login page with full visual layout | `src/app/(auth)/login/page.tsx`

**Checkpoint**: User Story 1 complete — navigate to `/login`, OAuth button visible, clicking initiates Google OAuth redirect

---

## Phase 4: User Story 2 — Language Selection (Priority: P2)

**Goal**: User can open the language dropdown in the header, select VN or EN, see the correct flag and label update, and have the preference persist across page reloads.

**Independent Test**: On `/login`, click the language selector → dropdown opens with VN and EN options → select EN → flag changes to US flag and label changes to "EN" → refresh page → EN is still selected.

### Tests (US2) — Write BEFORE implementation (TDD)

- [x] T030 [US2] Write failing unit tests for LanguageSelector | `tests/unit/login/LanguageSelector.test.tsx`

### Implementation (US2)

- [x] T031 [US2] Implement LanguageSelector client component | `src/components/layout/LanguageSelector.tsx`
- [x] T032 [US2] Wire `<LanguageSelector />` into Header | `src/components/layout/Header.tsx`
- [x] T033 [US2] Verify i18n message keys match consumption | `src/i18n/messages/vi.json`, `src/i18n/messages/en.json`

**Checkpoint**: User Stories 1 & 2 complete — language toggle works and persists

---

## Phase 5: User Story 3 — Unauthenticated Route Protection (Priority: P3)

**Goal**: Unauthenticated users accessing any protected route are redirected to `/login?returnTo=<original-path>`. After login, they are returned to the original route. Authenticated users cannot access `/login`.

**Independent Test**: Navigate to `/dashboard` while logged out → redirected to `/login?returnTo=%2Fdashboard` → log in → redirected to `/dashboard`.

### Tests (US3) — Write BEFORE implementation (TDD)

- [x] T034 [P] [US3] Write integration tests for middleware (5 scenarios) | `tests/integration/login/middleware.test.ts`
- [x] T035 [P] [US3] Extend auth-callback tests with returnTo and open-redirect scenarios | `tests/integration/login/auth-callback.test.ts`

### Verification (US3)

- [ ] T036 [US3] Verify middleware redirects unauthenticated access (manual — requires running dev server)
- [ ] T037 [US3] Verify returnTo redirect after successful login (manual)
- [ ] T038 [US3] Verify authenticated user visiting /login is redirected to / (manual)

**Checkpoint**: All three user stories complete — auth flow, language selection, and route protection working

---

## Phase 6: Polish & Accessibility

**Purpose**: Responsive layout, reduced-motion support, and accessibility compliance

- [x] T039 [P] Add `@media (prefers-reduced-motion: reduce)` block: set `transition: none` for login button opacity/bg and language dropdown animations | `src/app/globals.css`
- [x] T040 [P] Add responsive Tailwind classes: mobile (`<768px`) — header `px-4`, content `px-6 pt-20 pb-12`, ROOT FURTHER `max-w-[280px] w-full`, tagline `text-base leading-7`, button `w-full`, footer `px-4 py-6`; tablet (`768–1023px`) — header `md:px-12`, ROOT FURTHER `md:w-[360px]` | `src/app/(auth)/login/page.tsx`, `src/components/layout/Header.tsx`, `src/components/layout/Footer.tsx`
- [x] T041 [P] Add Playwright viewport tests: 375×812 (mobile) — login button is full-width; 768×1024 (tablet) — ROOT FURTHER width ≤360px; 1440×1024 (desktop) — layout matches design | `tests/e2e/login.spec.ts`
- [x] T042 [P] Add axe-core accessibility test: run `checkA11y` on `/login` — zero violations at WCAG AA level | `tests/e2e/login.spec.ts`
- [ ] T043 Verify Tab key navigation order: SAA Logo → LanguageSelector → LoginButton (follow DOM order)
- [ ] T044 Verify Enter/Space activates LoginButton (triggers OAuth) and LanguageSelector (opens dropdown)
- [x] T045 Verify focus returns to LoginButton after OAuth error: add `useEffect` in LoginButton that calls `buttonRef.current?.focus()` when `error` prop becomes non-null | `src/components/auth/LoginButton.tsx`
- [x] T046 Complete E2E test suite: happy path (mocked OAuth → redirect to `/`), error path (`?error=auth_failed` → error message shown), already-authenticated redirect (`/login` → `/`) | `tests/e2e/login.spec.ts`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately; T001–T007 (asset downloads) can all run in parallel; T008 (scaffold) must complete before T009–T010
- **Phase 2 (Foundation)**: Requires Phase 1 complete — BLOCKS all user stories; T012–T016, T018–T019 can run in parallel after T011 (env vars); T017 (messages) depends on T015 (intl config)
- **Phase 3 (US1)**: Requires Phase 2 complete; T021–T022 (tests) written first; T023–T026 can run in parallel; T027 depends on scaffold+fonts; T028 depends on server Supabase client (T013); T029 depends on T025, T026 (Header, Footer)
- **Phase 4 (US2)**: Requires Phase 3 complete (Header slot exists); T031 depends on T030 (test first)
- **Phase 5 (US3)**: Requires Phase 2 complete (middleware exists from T020); T034–T035 (tests) written first before any verification
- **Phase 6 (Polish)**: Requires Phases 3–5 complete; T039–T042 can run in parallel

### Within Each User Story

- Tests MUST be written and FAIL before any implementation begins (Constitution Principle III)
- Icon component (T019) must exist before any `<Icon>` usage in Phase 3+
- Middleware (T020) must be complete before US3 tests make sense

### Parallel Opportunities

| Phase | Parallel Group |
|-------|---------------|
| 1 | T001–T007 (all asset downloads) |
| 1 | T009–T010 (dependency installs, after T008) |
| 2 | T012–T016, T018–T019 (after T011) |
| 3 | T021–T022 (write tests simultaneously) |
| 3 | T023–T026 (independent component files) |
| 5 | T034–T035 (write both test files simultaneously) |
| 6 | T039–T042 (independent CSS/test files) |

---

## Implementation Strategy

### MVP First (Recommended)

1. Complete Phase 1 + 2 (setup + foundation)
2. Complete Phase 3 (US1 — Google OAuth login) only
3. **STOP and VALIDATE**: Navigate to `/login`, click button, complete OAuth, verify redirect to `/`
4. Ship US1 if deadline requires minimal viable auth

### Incremental Delivery

1. Phase 1 + 2: Setup + Foundation
2. Phase 3 (US1): Google OAuth → test → validate → commit
3. Phase 4 (US2): Language selector → test → validate → commit
4. Phase 5 (US3): Route protection → test → validate → commit
5. Phase 6: Polish + accessibility → run axe-core → commit

---

## Notes

- Commit after each phase (or each logical group within a phase); run `pnpm typecheck && pnpm lint` before each commit
- TDD cycle enforced: write failing test → confirm it fails → implement → confirm it passes → refactor
- "ROOT FURTHER" asset (T007) must be resolved before T029 (login page) can be finalized — if unavailable as SVG, fall back to styled display text with identified font
- Mark tasks complete as you go: `[x]`
- US flag source must be documented in a comment in `flag-us.svg` or in a `public/assets/login/ATTRIBUTION.md` file
