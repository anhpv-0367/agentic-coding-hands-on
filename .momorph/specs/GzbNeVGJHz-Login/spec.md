# Feature Specification: Login

**Frame ID**: `662:14387`
**Frame Name**: `Login`
**File Key**: `9ypp4enmFmdK3YAFJLIu6C`
**Created**: 2026-04-20
**Status**: Draft

---

## Overview

The Login screen is the unauthenticated entry point for the **Sun* Annual Awards 2025 (SAA 2025)** web application. It presents the brand identity ("ROOT FURTHER") and provides a single authentication action — **Login with Google** — powered by Supabase Auth with Google OAuth provider. No email/password flow exists; Google SSO is the only login method.

The screen also exposes a language selector (Vietnamese / English) in the header.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Google OAuth Login (Priority: P1)

A visitor lands on the Login page while unauthenticated and clicks "LOGIN With Google" to authenticate via their Google account and gain access to the SAA 2025 application.

**Why this priority**: This is the sole authentication mechanism. Without it, no user can access the application.

**Independent Test**: Navigate to `/login` while logged out. Click "LOGIN With Google". Complete Google OAuth flow. Verify redirect to authenticated home screen and that a valid session exists.

**Acceptance Scenarios**:

1. **Given** user is unauthenticated and on `/login`, **When** they click "LOGIN With Google", **Then** the browser redirects to Google's OAuth consent screen.
2. **Given** user completes Google OAuth successfully, **When** the callback is received, **Then** user is redirected to `/` (or to the original `returnTo` route if one was stored before redirect).
3. **Given** user is already authenticated (session active), **When** they navigate to `/login`, **Then** they are automatically redirected to the home/dashboard (no login prompt shown).
4. **Given** Google OAuth fails or user cancels, **When** the callback is received with an error, **Then** user remains on `/login` and an appropriate error message is shown.

---

### User Story 2 - Language Selection (Priority: P2)

A user clicks the language selector in the header to switch the UI language between Vietnamese (VN) and English (EN).

**Why this priority**: The app supports bilingual content. Language preference should persist across sessions. However, the core auth flow works regardless of language.

**Independent Test**: On the login page, click the "VN" language button. Verify UI text changes to English (or equivalent toggle). Verify the selection is persisted (e.g., localStorage or cookie).

**Acceptance Scenarios**:

1. **Given** the default language is Vietnamese (VN flag shown), **When** user opens the language dropdown and selects English, **Then** UI text switches to English AND the flag icon changes to the US flag with "EN" label.
2. **Given** a language has been selected, **When** user refreshes the page, **Then** the previously selected language (label and flag) is preserved.

---

### User Story 3 - Unauthenticated Route Protection (Priority: P3)

When an unauthenticated user attempts to access a protected route, they are redirected to the Login screen.

**Why this priority**: Supports correct access control, but the screen itself can function as a standalone login page without this flow.

**Independent Test**: Navigate directly to `/dashboard` while logged out. Verify redirect to `/login`.

**Acceptance Scenarios**:

1. **Given** user is not authenticated, **When** they navigate to any protected route, **Then** they are redirected to `/login`.
2. **Given** user is redirected to `/login` from a protected route, **When** they successfully log in, **Then** they are redirected back to the originally requested route (not a fixed home page).

---

### Edge Cases

- What happens when Google OAuth provider is unavailable? → Show a user-friendly error: "Authentication service is temporarily unavailable. Please try again later."
- What happens when Supabase is unreachable? → Show a generic error and allow retry.
- What happens on very slow networks during OAuth redirect? → Show loading state on the button to prevent double-clicks.
- What happens when a valid session cookie exists but has expired? → Supabase SDK handles refresh; if refresh fails, user sees login page normally.

---

## UI/UX Requirements *(from Figma)*

### Screen Components

| Component | Node ID | Description | Interactions |
|-----------|---------|-------------|--------------|
| Header (`mms_A_Header`) | `662:14391` | Fixed top bar (80px), semi-transparent dark bg | — |
| Logo (`mms_A.1_Logo`) | `I662:14391;186:2166` | SAA logo (52×56px), top-left | Click → navigate to `/` or no-op |
| Language Selector (`mms_A.2_Language`) | `I662:14391;186:1601` | Flag icon + locale label ("VN"/"EN") + chevron (108×56px); flag and label reflect current `locale` state | Click → open language dropdown |
| Background Key Visual (`mms_C_Keyvisual`) | `662:14388` | Full-bleed abstract wave artwork | None (decorative) |
| Left Gradient Overlay (`Rectangle 57`) | `662:14392` | Gradient from `#00101A` left edge | None (decorative) |
| Bottom Gradient Overlay (`Cover`) | `662:14390` | Gradient from `#00101A` bottom edge | None (decorative) |
| Brand Logo Image (`mms_B.1_Key Visual`) | `662:14395` | "ROOT FURTHER" logo image (451×200px) | None (decorative) |
| Tagline (`mms_B.2_content`) | `662:14753` | 2-line tagline text | None |
| Login Button (`mms_B.3_Login`) | `662:14426` | "LOGIN With Google" CTA (305×60px, #FFEA9E bg) | Click → initiate Google OAuth |
| Footer (`mms_D_Footer`) | `662:14447` | Copyright bar with top border | None |

For complete visual specs (colors, typography, spacing, states), see [`design-style.md`](./design-style.md).

### Navigation Flow

- **From**: Any unauthenticated state / direct URL / redirect from protected route
- **To**: Home/Dashboard (on successful auth), same page (on error/cancel)
- **Triggers**: "LOGIN With Google" button click → Google OAuth → Supabase callback

### Visual Requirements

- Responsive breakpoints: mobile (< 768px), tablet (768–1023px), desktop (≥ 1024px)
- No page-level animations defined; button hover transition 150ms ease-in-out
- Accessibility: WCAG AA — white text on `#00101A` (21:1 ✓), `#00101A` on `#FFEA9E` (~12:1 ✓)
- Loading state: disable button and show visual feedback during OAuth redirect

### Accessibility Requirements

- **Keyboard navigation**: "LOGIN With Google" button MUST be focusable via `Tab` and activatable via `Enter`/`Space`. Language selector MUST be keyboard-operable.
- **ARIA labels**: Login button MUST have `aria-label="Login with Google"`. Language selector MUST have `aria-label="Select language"` and `aria-expanded` toggled on open/close.
- **Screen reader**: Error messages MUST be announced via `role="alert"` or `aria-live="polite"`.
- **Focus management**: After OAuth error, focus MUST return to the login button.
- **Reduced motion**: Respect `prefers-reduced-motion` — disable transitions when set.

### State Management

| State | Scope | Description |
|-------|-------|-------------|
| `isLoading` | Local (Login page) | `true` while OAuth redirect is in progress; disables button |
| `errorMessage` | Local (Login page) | String shown below login button on OAuth failure; `null` when no error |
| `authSession` | Global (Supabase Auth context) | Current authenticated session; triggers redirect if non-null on mount |
| `locale` | Global (i18n context / cookie) | Current language (`"vi"` or `"en"`); persisted across reloads. Controls flag icon and label in language selector. |
| `isLangDropdownOpen` | Local (Language Selector) | `true` when language dropdown is open |

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The page MUST display the "LOGIN With Google" button as the sole authentication action.
- **FR-002**: Clicking "LOGIN With Google" MUST initiate Google OAuth via `supabase.auth.signInWithOAuth({ provider: 'google' })`.
- **FR-003**: On successful OAuth callback, the system MUST redirect the user to the `returnTo` query parameter value if present and valid (same-origin only), otherwise to `/`.
- **FR-004**: If a valid session already exists on page load, the system MUST redirect the user away from `/login` without showing the form.
- **FR-005**: On OAuth failure or cancellation, the system MUST remain on `/login` and display an inline error message below the login button (e.g., "Authentication failed. Please try again.").
- **FR-006**: The language selector MUST provide a dropdown with two options: **VN** (Vietnamese flag) and **EN** (US flag). Selecting an option updates both the displayed flag and label in the header trigger.
- **FR-007**: The selected language MUST persist across page reloads. The app MUST use an i18n library (e.g., `next-intl` or `next-i18next`) for all translatable strings.
- **FR-008**: The login button MUST show a loading/disabled state while the OAuth redirect is in progress to prevent duplicate submissions.

### Technical Requirements

- **TR-001**: Authentication MUST use `supabase.auth` exclusively — no custom auth, no raw fetch to Google APIs (Constitution Principle IV).
- **TR-002**: Session tokens MUST NOT be stored in `localStorage`; use Supabase's built-in session storage with httpOnly cookies where supported (Constitution Principle V).
- **TR-003**: The page MUST check for an existing session on mount (e.g., `supabase.auth.getSession()`) and redirect immediately if authenticated.
- **TR-004**: OAuth callback URL MUST be allowlisted in both Supabase Auth settings and Google Cloud Console.
- **TR-005**: No secrets or API keys may appear in client-side code (Constitution Principle V).

### Key Entities

- **Session**: Managed by Supabase Auth SDK. Contains `access_token`, `refresh_token`, `user` object with Google profile data (email, name, avatar).
- **User**: `id` (UUID), `email`, `user_metadata.full_name`, `user_metadata.avatar_url` — sourced from Google OAuth profile.

---

## API Dependencies

| Endpoint / SDK Call | Method | Purpose | Status |
|---------------------|--------|---------|--------|
| `supabase.auth.signInWithOAuth({ provider: 'google', redirectTo })` | SDK | Initiate Google OAuth flow | Supabase built-in |
| `supabase.auth.getSession()` | SDK | Check existing session on page load | Supabase built-in |
| `supabase.auth.exchangeCodeForSession(code)` | SDK | Exchange OAuth code for session (callback route) | Supabase built-in |
| `/auth/callback` | GET | Supabase OAuth callback route (Next.js route handler) | New |

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of users who complete Google OAuth are redirected to the dashboard within 2 seconds.
- **SC-002**: 0% of unauthenticated users can access protected routes (enforced by middleware).
- **SC-003**: Login button loading state activates within 100ms of click and prevents duplicate OAuth initiations.
- **SC-004**: Language preference persists correctly across 100% of page reloads.

---

## Out of Scope

- Email/password login — only Google OAuth is implemented.
- User registration flow — handled entirely by Google OAuth (first login auto-creates user in Supabase).
- Forgot password / magic link flows.
- Social login providers other than Google.
- Admin/role-based login differentiation on this screen.

---

## Dependencies

- [x] Constitution document exists (`.momorph/constitution.md`)
- [ ] API specifications available (`.momorph/API.yml`) — *not yet created*
- [ ] Database design completed (`.momorph/database.sql`) — *not yet created*
- [x] Screen flow documented (`.momorph/SCREENFLOW.md`)

---

## Notes

- Supabase project must have Google OAuth provider enabled and configured with a valid `clientId` and `clientSecret`.
- The `redirectTo` URL passed to `signInWithOAuth` must match an allowlisted URL in Supabase Auth settings (e.g., `http://localhost:3000/auth/callback` for dev, production URL for prod).
- The "ROOT FURTHER" image and wave background are media assets to be served from `public/assets/` or Supabase Storage.
- Font families `Montserrat` and `Montserrat Alternates` must be loaded from Google Fonts or bundled locally.
- This screen is exclusively for **web** (Next.js). Mobile platforms (Android/iOS/React Native) will have separate Login screen specs.
