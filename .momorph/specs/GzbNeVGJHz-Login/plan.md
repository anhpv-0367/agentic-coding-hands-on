# Implementation Plan: Login Screen

**Frame**: `GzbNeVGJHz-Login`
**Date**: 2026-04-20
**Spec**: `specs/GzbNeVGJHz-Login/spec.md`

---

## Summary

Build the Login screen for SAA 2025 — a single-page Google OAuth entry point. The page renders a full-bleed design (wave background, gradient overlays, "ROOT FURTHER" branding, tagline, and a "LOGIN With Google" CTA) backed by Supabase Auth. A language selector (VN/EN) in the header drives bilingual i18n via `next-intl`. Middleware guards all protected routes and stores a `returnTo` parameter for post-login redirection.

This is a **greenfield project** — the Next.js app does not yet exist. The `supabase/` directory with `config.toml` (Google OAuth enabled) is already in the repo.

---

## Technical Context

**Language/Framework**: TypeScript / Next.js 14+ (App Router)
**Primary Dependencies**: TailwindCSS v4, `@supabase/ssr`, `next-intl`
**Database**: Supabase (auth only — no custom tables for this screen)
**Testing**: Jest + React Testing Library (unit/integration), Playwright (E2E)
**State Management**: React hooks (local) + next-intl context (locale)
**API Style**: Supabase Auth SDK (no custom REST endpoints)

---

## Constitution Compliance Check

*GATE: Must pass before implementation can begin*

- [x] **Principle I** — Clean Code: kebab-case filenames, PascalCase components, camelCase hooks; feature-first folders; no dead code
- [x] **Principle II** — UI Standards: TailwindCSS with CSS variables only; zero hardcoded colors/spacing in components; tokens in `globals.css`
- [x] **Principle III** — TDD: failing tests written BEFORE implementation for every user story; Red → Green → Refactor cycle enforced
- [x] **Principle IV** — Supabase Integration: auth exclusively via `supabase.auth`; no raw fetch to Google APIs; singleton client; no direct SQL
- [x] **Principle V** — OWASP: no session tokens in `localStorage` (Supabase cookie-based); no secrets in client bundles (`NEXT_PUBLIC_` only for non-secret keys); `returnTo` validated as same-origin before redirect; no sensitive data in logs
- [x] **Quality Gates**: TypeScript strict mode; zero lint violations; all tests pass; production build succeeds before commit

**Violations**: None

---

## Architecture Decisions

### Frontend Approach

- **Component Structure**: Feature-first. Auth components under `src/components/auth/`, shared layout under `src/components/layout/`.
- **Styling Strategy**: TailwindCSS v4 (CSS-first config — no `tailwind.config.js`; design tokens defined in `@theme` block inside `src/app/globals.css`). All components use Tailwind utility classes referencing CSS variables — zero hardcoded color/spacing values (Constitution Principle II + frontend.md guideline).
- **Data Fetching**: Server Components for session check on page load (`supabase/server.ts`). Client Component only for the interactive button and language selector.
- **Auth pattern**: PKCE flow via `@supabase/ssr`. Browser client initiates `signInWithOAuth`; Next.js Route Handler at `/auth/callback` exchanges the code for a session.

### Backend Approach

- **No custom backend** — authentication is 100% via Supabase Auth SDK.
- `/auth/callback` is a Next.js Route Handler (not an API route in the traditional sense).
- `middleware.ts` protects all routes and enforces `returnTo` redirect.

### Integration Points

- **Supabase local** (`supabase/config.toml`): Google OAuth already enabled via env vars `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`. `skip_nonce_check = false` — ensure Google Cloud Console credentials match local `redirect_uri`.
- **next-intl**: Locale stored in cookie (`NEXT_LOCALE`). Middleware reads it and provides locale to all Server Components.
- **Shared**: `Header` and `Footer` are layout components reused across all screens.

---

## Asset Inventory

Assets available from Figma media API (must be downloaded in Phase 0):

| Figma Node ID | File Type | Target Path | Description |
|---------------|-----------|-------------|-------------|
| `I662:14391;178:1033;178:1030` | .png | `public/assets/login/logos/saa-logo.png` | SAA logo (header) |
| `2939:9548` | .png | `public/assets/login/images/wave-background.png` | Abstract wave background |
| `I662:14391;186:1696;186:1821;186:1709` | .svg | `public/assets/login/icons/flag-vn.svg` | Vietnamese flag |
| `I662:14391;186:1696;186:1821;186:1441` | .svg | `public/assets/login/icons/chevron-down.svg` | Dropdown chevron |
| `I662:14426;186:1766` | .svg | `public/assets/login/icons/google-logo.svg` | Google "G" icon |

⚠️ **"ROOT FURTHER" logo** (`mms_B.1_Key Visual`, 451×200px) is **NOT** in the Figma media API. It is rendered as large display typography in the design screenshot. Two options:
- **Option A** (preferred): Export as SVG from Figma manually → `public/assets/login/logos/root-further.svg`
- **Option B**: Identify the font (appears to be a display serif with custom letterforms) and render as styled `<h1>`.

**Decision required before Phase 2 begins.** Plan assumes Option A (SVG export).

---

## Project Structure

### Documentation (this feature)

```
.momorph/specs/GzbNeVGJHz-Login/
├── spec.md              ✅ Feature specification
├── design-style.md      ✅ Design specifications
├── plan.md              ✅ This file
└── tasks.md             📋 Next step (generate with /momorph.tasks)
```

### Source Code

> `create-next-app --src-dir` places all app code under `src/`. `middleware.ts` stays at the project root (Next.js requirement).

```
src/
├── app/                                  # Next.js App Router (--src-dir)
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx                 # Login page (RSC — session check + redirect)
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts                 # OAuth PKCE callback Route Handler
│   ├── globals.css                      # Design tokens (CSS vars) + Tailwind directives + font import
│   ├── layout.tsx                       # Root layout: font vars, NextIntlClientProvider, <html lang>
│   └── page.tsx                         # Root page: redirect authenticated → stays, unauthenticated → /login
├── components/
│   ├── layout/
│   │   ├── Header.tsx                   # Fixed header: SAA logo + LanguageSelector
│   │   ├── Footer.tsx                   # Copyright bar with top border
│   │   └── LanguageSelector.tsx         # VN/EN dropdown (Client Component)
│   ├── auth/
│   │   └── LoginButton.tsx              # "LOGIN With Google" CTA (Client Component)
│   └── ui/
│       └── Icon.tsx                     # Icon wrapper: renders <img> for SVG/PNG assets; enforces size + alt
├── lib/
│   └── supabase/
│       ├── client.ts                    # Browser Supabase singleton (createBrowserClient)
│       └── server.ts                    # Server/RSC client (createServerClient + cookie store)
└── i18n/
    ├── config.ts                        # next-intl: locales=["vi","en"], defaultLocale="vi"
    ├── request.ts                       # getRequestConfig — loads messages per locale
    └── messages/
        ├── vi.json                      # Vietnamese strings (tagline, button, errors, a11y labels)
        └── en.json                      # English strings

middleware.ts                            # Project root: next-intl locale routing + Supabase session refresh
next.config.ts                           # withNextIntl plugin wrapping Next.js config
playwright.config.ts                     # Playwright E2E config (baseURL, browser, test dir)

public/
└── assets/
    └── login/
        ├── images/
        │   └── wave-background.png      # Node: 2939:9548
        ├── logos/
        │   ├── saa-logo.png             # Node: I662:14391;178:1033;178:1030
        │   └── root-further.svg         # ⚠️ requires manual Figma SVG export
        └── icons/
            ├── flag-vn.svg              # Node: I662:14391;186:1696;186:1821;186:1709
            ├── flag-us.svg              # Standard asset (not in Figma) — e.g. flagcdn.com/us.svg
            ├── chevron-down.svg         # Node: I662:14391;186:1696;186:1821;186:1441
            └── google-logo.svg          # Node: I662:14426;186:1766

jest.config.ts                           # Jest config for Next.js + TypeScript
jest.setup.ts                            # jest-dom setup + global mocks

tests/
├── unit/
│   └── login/
│       ├── LoginButton.test.tsx         # US1: render, click, loading state, error display
│       └── LanguageSelector.test.tsx    # US2: open/close, select, flag change, cookie persist
├── integration/
│   └── login/
│       ├── auth-callback.test.ts        # US1: code exchange, returnTo redirect, error redirect
│       └── middleware.test.ts           # US3: unauthenticated redirect, returnTo param, auth bypass
└── e2e/
    └── login.spec.ts                    # Full OAuth flow + language switch + protected route
```

### Dependencies to Install

| Package | Purpose |
|---------|---------|
| `@supabase/ssr` | Supabase Auth with cookie-based sessions for Next.js |
| `@supabase/supabase-js` | Supabase JS client |
| `next-intl` | i18n with App Router support |
| `@testing-library/react` | Unit test utilities |
| `@testing-library/jest-dom` | DOM matchers for Jest |
| `@testing-library/user-event` | Realistic user interaction simulation |
| `jest` + `jest-environment-jsdom` | Test runner for unit/integration |
| `@playwright/test` | E2E testing |
| `ts-jest` or `@swc/jest` | TypeScript transformer for Jest |
| `@axe-core/playwright` | Automated accessibility testing in E2E |

---

## Implementation Strategy

### Phase 0: Asset Preparation

*Pre-condition for all UI work*

- [ ] Download all 5 Figma media assets to `public/assets/login/` (use `mcp__momorph__get_media_file` per node ID)
- [ ] Obtain US flag SVG (standard asset — use a public SVG source or Figma equivalent)
- [ ] Resolve "ROOT FURTHER": attempt SVG export from Figma; if unavailable, identify display font
- [ ] Verify all assets render correctly at intended dimensions

### Phase 1: Foundation

*Sets up the entire infrastructure before any feature work*

- [ ] Scaffold Next.js project: `npx create-next-app@latest . --typescript --tailwind --app --src-dir`
- [ ] Install dependencies: `@supabase/ssr @supabase/supabase-js next-intl`
- [ ] Install test dependencies: `jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @playwright/test`
- [ ] Create `jest.config.ts` (Next.js + TypeScript preset) and `jest.setup.ts` (import `@testing-library/jest-dom`, mock `next/navigation`)
- [ ] **Fix env var names**: rename `.env.example` keys to `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (required for Next.js client-side access); keep `SUPABASE_SECRET_KEY` server-only (no `NEXT_PUBLIC_` prefix); copy to `.env.local` and fill in values
- [ ] Create Supabase browser client `src/lib/supabase/client.ts` (singleton, `createBrowserClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)`)
- [ ] Create Supabase server client `src/lib/supabase/server.ts` (`createServerClient` with Next.js cookie store from `next/headers`)
- [ ] **Load fonts via `next/font/google`**: in `src/app/layout.tsx` import `Montserrat` and `Montserrat_Alternates` from `'next/font/google'` with `weight: ['700']`, `subsets: ['latin']`; apply `.className` to `<body>` (not `<html>`). Do NOT use `@import url()` — `next/font` self-hosts and eliminates layout shift.
- [ ] **Define design tokens** in `src/app/globals.css` using TailwindCSS v4 `@theme` block: 9 color tokens (`--color-*`), 5 typography tokens, 10 spacing tokens, 3 border/radius tokens — exact values from `design-style.md` Design Tokens section. No `tailwind.config.js` needed with v4.
- [ ] **Create Icon component** `src/components/ui/Icon.tsx` — `type IconProps = { src: string; size: number; alt: string; className?: string }` — renders `<img>` with fixed width/height and enforced `alt`. All flags, chevron, Google logo, and SAA logo MUST use this component (per design-style.md constraint).
- [ ] Configure next-intl: `src/i18n/config.ts` (locales, defaultLocale), `src/i18n/request.ts` (getRequestConfig), `next.config.ts` (withNextIntl plugin)
- [ ] Seed `vi.json` and `en.json` with all translatable strings: tagline (2 lines), button label, error messages (auth_failed, service_unavailable), ARIA labels (login button, language selector)
- [ ] Create `middleware.ts` at project root: compose `next-intl/middleware` (locale detection + cookie write) with Supabase session refresh (`updateSession`); protect all routes except `/login`, `/auth/callback`; on unauthenticated access to protected route, redirect to `/login?returnTo=<encoded-path>`

### Phase 2: Core Auth Flow (US1 — P1) 🔴 TDD

*Write failing tests first. Do not implement until test exists.*

- [ ] **[TEST]** Write `LoginButton.test.tsx`: renders button, click triggers `signInWithOAuth`, loading state disables button, error displays below button
- [ ] **[TEST]** Write `auth-callback.test.ts`: valid code → session created → redirect; missing code → redirect to `/login?error=...`
- [ ] **[IMPL]** `src/app/auth/callback/route.ts` — GET handler: read `code` and `returnTo` from searchParams; call `supabase.auth.exchangeCodeForSession(code)`; validate `returnTo` is same-origin (starts with `/`, not `//`); on success redirect to `returnTo ?? '/'`; on error/missing code redirect to `/login?error=auth_failed`
- [ ] **[IMPL]** `src/app/(auth)/login/page.tsx` — RSC: check session via server Supabase client (`getUser()`); if session exists `redirect('/')`; read `?error` query param and pass to client; render full-page layout: background wave (`<div>` with inline style for `background-position: -440px -217.975px / 159.763% 133.371%`), left gradient overlay (`<div className="absolute inset-0">`), bottom gradient overlay, `<Header>`, content section (`mms_B_Bìa` with ROOT FURTHER image + tagline + `<LoginButton error={errorParam} />`), `<Footer>`
- [ ] **[IMPL]** `src/app/layout.tsx` — root layout: `<html lang={locale}>`, load Montserrat + Montserrat Alternates via Google Fonts `<link>`, wrap children in `<NextIntlClientProvider>`
- [ ] **[IMPL]** `src/app/page.tsx` — RSC: call server Supabase client `getUser()`; if no session → `redirect('/login')`; if authenticated → render a minimal placeholder (e.g., `<p>Welcome</p>`) sufficient to confirm redirect works. Full dashboard UI is out of scope for this screen.
- [ ] **[IMPL]** `src/components/auth/LoginButton.tsx` — `'use client'`; `isLoading` state; on click call `supabase.auth.signInWithOAuth({ provider: 'google', redirectTo: \`${origin}/auth/callback\` })`; set `isLoading=true` immediately; render `<button>` with `aria-label="Login with Google"`, `disabled={isLoading}`, `opacity-[0.7]` + `cursor-not-allowed` when loading; inside button: label text + `<Icon src="/assets/login/icons/google-logo.svg" size={24} alt="Google" />`; receive `error` prop and render `<p role="alert">` below with translated error string
- [ ] **[IMPL]** `src/components/layout/Header.tsx` — `position: fixed; top: 0; z-index: 50`; flex row space-between; left: `<Icon src="/assets/login/logos/saa-logo.png" size={52} alt="Sun* Annual Awards 2025" />`; right: `<LanguageSelector />`; `background: rgba(11,15,18,0.8)`; `padding: 12px 144px`
- [ ] **[IMPL]** `src/components/layout/Footer.tsx` — `border-top: 1px solid #2E3940`; flex center; copyright text; Montserrat Alternates 700 16px
- [ ] Verify: navigate to `/login` while unauthenticated → see login page with correct fonts, background, gradients; click button → redirects to Google OAuth

### Phase 3: Language Selector (US2 — P2) 🔴 TDD

*Write failing tests first.*

- [ ] **[TEST]** Write `LanguageSelector.test.tsx`: renders VN flag + "VN" by default; clicking opens dropdown; selecting EN changes flag and label; locale persists after page reload (cookie check)
- [ ] **[IMPL]** `src/components/layout/LanguageSelector.tsx` — `'use client'`; `isOpen` state; trigger `<button>`: `<Icon>` for flag + locale label + `<Icon>` for chevron; dropdown panel (`position: absolute; top: 100%; right: 0`): two option `<button>` rows — VN (flag + "VN") and EN (flag + "EN"), each using `<Icon>` for flag; on select call `router.replace(pathname, { locale: newLocale })` via next-intl `useRouter`; `aria-label="Select language"`, `aria-expanded={isOpen}`, `role="listbox"` on panel; keyboard: Escape closes, Enter/Space selects; click outside closes via `useEffect` + `document.addEventListener('mousedown')`
- [ ] Wire `<LanguageSelector>` into `src/components/layout/Header.tsx`
- [ ] Strings for tagline, button label, and error messages were already seeded in Phase 1 — verify keys match what `LoginButton` and the login page consume
- [ ] Verify: switch to EN → UI text changes to English and US flag shown; refresh → state persists

### Phase 4: Route Protection (US3 — P3) 🔴 TDD

- [ ] **[TEST]** Write `tests/integration/login/middleware.test.ts`: unauthenticated GET to `/` → 302 to `/login?returnTo=%2F`; unauthenticated GET to `/dashboard` → 302 to `/login?returnTo=%2Fdashboard`; authenticated GET to `/login` → 302 to `/`; `/login` and `/auth/callback` are public (no redirect)
- [ ] **[TEST]** Add to `auth-callback.test.ts`: `returnTo=/dashboard` → redirects to `/dashboard`; `returnTo=https://evil.com` → redirects to `/` (same-origin check blocks open redirect)
- [ ] Verify middleware redirects unauthenticated access to any protected route to `/login?returnTo=<original-path>`
- [ ] Verify after successful login, `/auth/callback` redirects to `returnTo` value
- [ ] Verify authenticated user visiting `/login` is redirected to `/`

### Phase 5: Polish & Accessibility

- [ ] **[IMPL]** Add `@media (prefers-reduced-motion: reduce)` block in `globals.css` — set `transition: none` for all animated elements (login button bg, opacity, language dropdown)
- [ ] **[IMPL]** Add responsive Tailwind classes matching design-style.md breakpoints: mobile (`<768px`) — header `px-4`, content `px-6 pt-20 pb-12`, ROOT FURTHER `max-w-[280px] w-full`, tagline `text-base leading-7 w-full`, button `w-full`, footer `px-4 py-6`; tablet (`768–1023px`) — header `md:px-12`, content `md:px-12`, ROOT FURTHER `md:w-[360px]`
- [ ] **[TEST]** Add Playwright viewport tests to `login.spec.ts`: at 375×812 (mobile) — login button is full-width; at 768×1024 (tablet) — ROOT FURTHER width is ≤360px; at 1440×1024 (desktop) — layout matches desktop design
- [ ] **[TEST]** Add Playwright a11y test: install `@axe-core/playwright`; run `checkA11y` on `/login` — zero violations at AA level
- [ ] Verify Tab key navigates: SAA Logo → LanguageSelector → LoginButton (in DOM order)
- [ ] Verify Enter/Space activates LoginButton (triggers OAuth) and LanguageSelector (opens dropdown)
- [ ] Verify focus returns to LoginButton after OAuth error (set focus imperatively in `LoginButton.tsx` when `error` prop changes)
- [ ] Complete E2E test `login.spec.ts`: happy path (mocked OAuth) + error path (`?error=auth_failed`) + already-authenticated redirect

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| "ROOT FURTHER" asset unavailable (not in media API) | High | Medium | Export SVG from Figma manually; fallback: identify display font and render as text |
| Google OAuth local dev config mismatch (`redirect_uri`) | Medium | High | Ensure `http://localhost:3000/auth/callback` is set in Google Cloud Console; verify `supabase/config.toml` `additional_redirect_urls` |
| `skip_nonce_check = false` breaking local Google OAuth | Medium | High | Set `skip_nonce_check = true` for local only (already commented in config.toml) |
| next-intl App Router middleware conflict with Supabase middleware | Low | High | Single `middleware.ts`: call `intlMiddleware(request)` first to get locale response; then run `supabase.auth.updateSession()` (session refresh + cookie); chain responses by copying Set-Cookie headers from Supabase response onto the intl response |
| US flag asset sourcing | Low | Low | Use any standard SVG (e.g., Twitter Twemoji, flagcdn.com); document source |

### Estimated Complexity

- **Frontend**: Medium (layout is visual-heavy; auth flow and i18n add complexity)
- **Backend**: Low (Supabase SDK handles everything)
- **Testing**: Medium (OAuth flow requires mocking; E2E requires Playwright browser)

---

## Integration Testing Strategy

### Test Scope

- [x] **Component/UI interactions**: LoginButton loading/error states; LanguageSelector open/close/select
- [x] **External dependencies**: Supabase Auth SDK (mock in unit; real in E2E)
- [x] **User workflows**: Google OAuth flow, language switch + persist, protected route redirect

### Test Categories

| Category | Applicable? | Key Scenarios |
|----------|-------------|---------------|
| UI ↔ Logic | Yes | Button click → loading state → error display |
| App ↔ External API | Yes | `/auth/callback` code exchange with Supabase |
| App ↔ Data Layer | No | Auth only — no DB reads/writes in this screen |
| Cross-platform | No | Web only |

### Mocking Strategy

| Dependency | Strategy | Rationale |
|------------|----------|-----------|
| `@supabase/ssr` (unit tests) | Mock | Avoid real network calls; test component behavior in isolation |
| Supabase Auth (E2E) | Real (local Supabase) | `npx supabase start` provides real auth; use test Google credentials |
| next-intl (unit tests) | Real | Lightweight — no reason to mock |
| `next/navigation` | Mock | Avoid router errors in jsdom |

### Test Scenarios Outline

1. **Happy Path**
   - [ ] Unauthenticated user navigates to `/login` → sees Login page
   - [ ] Click "LOGIN With Google" → `signInWithOAuth` called with correct params
   - [ ] `/auth/callback?code=valid` → session created → redirect to `/`
   - [ ] `/auth/callback?code=valid&returnTo=/awards` → redirect to `/awards`
   - [ ] Authenticated user navigates to `/login` → redirected to `/`

2. **Error Handling**
   - [ ] `/auth/callback?error=access_denied` → redirect to `/login?error=auth_failed`
   - [ ] Login page with `?error=auth_failed` → error message shown below button
   - [ ] `signInWithOAuth` throws → error message displayed, button re-enabled

3. **Edge Cases**
   - [ ] Double-click "LOGIN With Google" → second click ignored (button disabled)
   - [ ] `/auth/callback?returnTo=https://evil.com` → same-origin check blocks, redirects to `/`
   - [ ] Language switch while loading → locale changes; button state unaffected

### Coverage Goals

| Area | Target | Priority |
|------|--------|----------|
| Auth components (LoginButton, LanguageSelector) | 90%+ | High |
| Auth callback route handler | 90%+ | High |
| Middleware route protection | 85%+ | High |
| E2E critical paths | Key flows | High |

---

## Dependencies & Prerequisites

### Required Before Start

- [x] `constitution.md` reviewed and understood
- [x] `spec.md` approved (review complete — no open questions)
- [x] `design-style.md` approved (review complete)
- [x] Supabase config present (`supabase/config.toml` with Google OAuth enabled)
- [ ] Google Cloud Console OAuth credentials created and `.env.local` filled
- [ ] "ROOT FURTHER" asset resolution (Option A: SVG export or Option B: font ID)

### External Dependencies

- Supabase local instance (`npx supabase start`) running during development and integration tests
- Google OAuth app configured in Google Cloud Console with `http://localhost:3000/auth/callback` in authorized redirect URIs

---

## Next Steps

After plan approval:

1. **Run** `/momorph.tasks` to generate the detailed task breakdown
2. **Resolve** the "ROOT FURTHER" asset question before Phase 2
3. **Fill** `.env.local` with Supabase + Google credentials
4. **Begin** implementation following TDD cycle: Red → Green → Refactor

---

## Notes

- `supabase/config.toml` already has `[auth.external.google] enabled = true` — no Supabase config changes needed, just env vars.
- The Supabase local auth `site_url = "http://localhost:3000"` and `additional_redirect_urls` already include `http://localhost:3000`.
- **Env var naming**: client-accessible vars MUST be prefixed `NEXT_PUBLIC_`. Server-only keys (service role) must NOT have this prefix. Update `.env.example` accordingly.
- Design tokens in `globals.css` must be defined before any component work starts — all Tailwind classes in design-style.md implementation mapping reference CSS variables.
- **Font loading**: Use `next/font/google` (NOT `@import url()`). Import `Montserrat` and `Montserrat_Alternates` in `src/app/layout.tsx` with `weight: ['700'], subsets: ['latin']`; apply `.className` to `<body>`. This self-hosts fonts and eliminates FOUT (flash of unstyled text).
- **TailwindCSS v4**: Uses CSS-first config — define tokens in `@theme { }` block in `globals.css` (e.g., `--color-bg-page: #00101A`). No `tailwind.config.js` required. Custom utility classes are auto-generated from theme variables.
- **Icon component**: All icons (flags, chevron, Google logo, SAA logo) MUST use `<Icon>` — never raw `<img>` or `<svg>` tags per design-style.md constraint.
- **Background wave CSS**: the wave image requires non-standard positioning — use inline style: `style={{ backgroundImage: "url('/assets/login/images/wave-background.png')", backgroundPosition: '-440px -217.975px', backgroundSize: '159.763% 133.371%', backgroundRepeat: 'no-repeat' }}`.
- The tagline is translatable (vi: "Bắt đầu hành trình của bạn cùng SAA 2025. / Đăng nhập để khám phá!"; en equivalent needed). Footer copyright is static/brand — can be hardcoded.
- **Error message i18n keys**: `errors.auth_failed` → "Authentication failed. Please try again."; `errors.service_unavailable` → "Authentication service is temporarily unavailable. Please try again later."
