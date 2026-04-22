# Implementation Plan: Homepage SAA 2025

**Frame**: `i87tDx10uM-Homepage` (Figma `2167:9026`)
**Date**: 2026-04-21
**Spec**: `specs/i87tDx10uM-Homepage/spec.md`
**Design-style**: `specs/i87tDx10uM-Homepage/design-style.md`

---

## Summary

The Homepage is the authenticated landing page at `/`, which is also the "About SAA 2025" screen. It presents:
1. A full-bleed keyvisual hero with a small "ROOT FURTHER" logo, a live countdown (DAYS/HOURS/MINUTES) to the ceremony, event info (time + location + broadcast channel), and two CTAs (About Awards / About Kudos).
2. A large decorative "ROOT FURTHER" display (two image assets) above a 3-paragraph campaign description.
3. An awards grid of 6 category cards linking to `/awards#<slug>`.
4. A Sun\* Kudos promo card linking to `/kudos`.
5. Persistent global chrome: fixed header with 3 nav links + notification + language + profile; footer with logo + 4 nav links + copyright; floating widget button.

**Technical approach**: MVP is a **static authenticated page** — no backend calls beyond Supabase session. All dynamic-looking data is either environment-variable-driven (`NEXT_PUBLIC_EVENT_DATE`) or static i18n (`vi.json`/`en.json`). Notifications service is stubbed; widget button is a silent no-op. This lets us ship the page fast, with the service-layer wrapper pattern already in place for future backend integration.

Builds on the Login screen's infrastructure: reuse `<Icon>`, `<LanguageSelector>`, Supabase clients, middleware, next-intl config, font imports, and the design-token system in `globals.css`.

---

## Technical Context

**Language/Framework**: TypeScript 5.x / Next.js 16 (App Router, `--src-dir`)
**Primary Dependencies**: React 19, TailwindCSS v4 (CSS-first `@theme`), next-intl v4, `@supabase/ssr`, `@supabase/supabase-js`, `next/font/google`, `next/font/local` (new — for Digital Numbers)
**Database**: N/A for MVP (no backend APIs called beyond Supabase Auth)
**Testing**: Jest + `@testing-library/react` + `@testing-library/user-event` for unit/integration; Playwright + `axe-playwright` for E2E & accessibility
**State Management**: React built-in (`useState`, `useEffect`) for local state; `NEXT_LOCALE` cookie for locale; Supabase SDK for session. **No SWR/Redux/Zustand in MVP** (no async data fetching needed).
**API Style**: N/A for MVP. Future backend integration will use REST via a thin service-layer wrapper so component code doesn't change.

---

## Constitution Compliance Check

*GATE: Must pass before implementation can begin*

| Constitution Rule | Status | Notes |
|-------------------|--------|-------|
| I. Feature-first folder structure; kebab-case files; PascalCase components | ✅ | `src/components/{auth,layout,ui,homepage}/` pattern continues; `page.tsx` in `src/app/page.tsx` |
| I. No dead code / no unresolved TODOs | ✅ | Planned — enforced at PR review |
| II. Mobile-first responsive via Tailwind + design tokens; no hardcoded colors/spacing | ✅ | All tokens already centralized in `globals.css` `@theme`; homepage adds ~20 new tokens (gold-glow shadow, accent-warm, z-index layers, new spacing) |
| II. Tailwind utility classes over inline styles | ⚠ | Login uses inline styles heavily. Plan: continue mixing (responsive values via Tailwind `className="px-4 md:px-12 lg:px-36"`, static complex values via inline `style={}`). Acceptable since the project hasn't converted Login yet. |
| III. TDD (test-first) | ✅ | Plan enforces failing test → implementation → green for every new component. See §Implementation Strategy. |
| IV. Supabase SDK for auth; no custom HTTP clients | ✅ | Homepage only reads `supabase.auth.getUser()` via server client. No new auth code. |
| IV. RLS policies for tables | N/A | No new tables accessed. |
| IV. Supabase keys via env vars only | ✅ | Already in `.env.local`. |
| IV. Singleton client | ✅ | Reuses Login's `src/lib/supabase/{client,server}.ts`. |
| V. Input validation at system boundaries | ✅ | Only boundary is `NEXT_PUBLIC_EVENT_DATE` — validated by `new Date(...)` + `isFinite(+date)`. No user input. |
| V. No session tokens in `localStorage` | ✅ | Supabase SDK uses httpOnly cookies. |
| V. No secrets in bundle | ✅ | Only `NEXT_PUBLIC_*` vars are bundled. |
| **CLAUDE.md** — `type` not `interface` | ✅ | All planned type declarations use `type`. |
| **CLAUDE.md** — no direct `fetch`; use `apiClient` wrapper | ✅ | MVP makes no HTTP calls. Service-layer stubs follow the wrapper pattern for future. |
| **CLAUDE.md** — ALL icons/images via `<Icon>` component | ✅ | New components import `<Icon>` for every SVG/PNG. `<Icon>` may be extended to support Next.js `<Image>` for large assets. |
| **CLAUDE.md** — Feature-First structure | ✅ | New folder: `src/components/homepage/` for homepage-specific components. Shared layout components stay in `src/components/layout/`. |
| **CLAUDE.md** — No new libraries without justification | ⚠ | Adding `axe-playwright` was done in Login work. Homepage adds **no new runtime deps**. Dev dep `@next/third-parties` NOT needed. |

**Violations**: None. One CAVEAT — the existing Login screen uses inline styles; plan continues that pattern for this screen rather than refactoring both at once (separate cleanup PR). See §Open Questions.

---

## Architecture Decisions

### Frontend Approach

- **Component structure** — **Feature-First** with shared layout extracted:
  - `src/components/homepage/` — screen-specific (countdown, hero, awards grid, kudos promo, widget).
  - `src/components/layout/` — shared chrome (Header, Footer, LanguageSelector, generalized `NavLink`, `NotificationButton`, `ProfileAvatar`, `ProfileMenu`).
  - `src/components/ui/` — atomic primitives (Icon, Button, SectionHeader).
- **Styling strategy**:
  - **Design tokens in `globals.css` `@theme`** — single source of truth. Add ~20 new tokens (gold-glow shadow, accent colors, z-index layers, new spacing, new radius values).
  - **Responsive & layout** via Tailwind utility classes in `className`.
  - **Static complex values** (rgba backgrounds, gradients, specific shadow stacks) via inline `style={}` matching Login's pattern.
- **Data fetching**:
  - No fetch/SWR in MVP. The Homepage is a React Server Component that reads:
    - `supabase.auth.getUser()` at the top of `page.tsx` (authenticated check + hydrates profile).
    - `process.env.NEXT_PUBLIC_EVENT_DATE` — passed as a prop to `<Countdown />`.
    - i18n messages via `getTranslations` (RSC) / `useTranslations` (client).
  - **Client components** for anything interactive: `<Countdown />`, `<LanguageSelector />`, `<ProfileMenu />`, `<NotificationButton />` (disabled in MVP but still a client component for future click handling), `<WidgetButton />` (same).
- **Countdown implementation**:
  - Pure function `computeRemaining(target: Date, now: Date)` → `{days, hours, minutes, isPast}` — **unit-testable without DOM**.
  - Client component `<Countdown target={Date}>`:
    - `useEffect` schedules the next tick at the next minute boundary (`setTimeout(update, msUntilNextMinute)`), then switches to `setInterval(update, 60000)` — avoids drift from fixed-interval misalignment with the wall-clock minute.
    - `visibilitychange` listener: when tab returns to visible, recompute from `Date.now()` and restart the boundary-aligned interval (don't trust an in-memory tick count).
    - **Single `aria-live="polite"` region** at the root of the `<Countdown>` component (NOT per tile — 6 simultaneous announcements/minute would be noise). Content: the full `hero.countdown.aria_label` formatted string (e.g. "14 days, 3 hours, 27 minutes remaining"). `aria-atomic="true"` so the entire message is re-read each tick.
    - The decorative "Coming soon" label above the tiles receives `aria-hidden="true"` (semantically redundant with the live region).
  - Sub-components `<CountdownUnit label digits>` and `<CountdownDigitTile char>` are **pure presentation** (no ARIA attrs of their own).
- **Service-layer stubs** (for future backend compatibility):
  - `src/lib/services/event-config.ts` — returns `{ event_datetime: process.env.NEXT_PUBLIC_EVENT_DATE!, location: /* i18n handled at UI layer */ }`. Swap to `fetch('/api/event/config')` later.
  - `src/lib/services/awards-categories.ts` — returns the static list `['top-talent', 'top-project', ...]` with image URL paths. Swap to `fetch('/api/awards/categories')` later.
  - `src/lib/services/notifications.ts` — returns `{ unread_count: 0 }` synchronously. Swap to `fetch('/api/notifications/summary')` later.

### Backend Approach

N/A for MVP — no endpoints implemented on the backend. Typed contracts documented in spec.md §Predicted response shapes will guide future work.

### Integration Points

- **Existing services reused**:
  - `src/lib/supabase/{client,server}.ts` — Supabase clients (from Login).
  - `middleware.ts` — already redirects unauthenticated `/` → `/login?returnTo=%2F`.
  - `src/i18n/{config,request}.ts` + `messages/{vi,en}.json` — next-intl setup.
- **Shared components leveraged**:
  - `<Icon>` — extend to accept optional `aria-hidden`, `priority` for large images (maybe wrap `next/image` internally for raster).
  - `<LanguageSelector>` — reused as-is.
  - `<Header>` — **generalized**: add `selectedNav: "about-saa" | "awards" | "kudos" | "standards"` prop; add nav-link children; inject notification + profile + language trio.
  - `<Footer>` — **generalized**: add 4 nav links; add `selectedNav` prop.
- **API contracts** — None for MVP. Typed stubs in `src/lib/services/*` match the future shapes.
- **Asset pipeline** — `public/assets/homepage/` (new folder) houses all homepage-specific images and the `DigitalNumbers-Regular.woff2` font.

---

## Project Structure

### Documentation (this feature)

```text
.momorph/specs/i87tDx10uM-Homepage/
├── spec.md              # Feature specification (exhaustive)
├── design-style.md      # Design tokens + component specs
├── plan.md              # This file
├── tasks.md             # (generated next by /momorph.tasks)
└── assets/
    └── frame.png        # Figma reference screenshot
```

### Source Code (affected areas)

```text
frontend/
├── public/
│   ├── assets/
│   │   ├── homepage/                          # NEW — homepage-specific assets
│   │   │   ├── images/
│   │   │   │   ├── keyvisual-bg.png
│   │   │   │   ├── root-further-hero-logo.png
│   │   │   │   ├── root-text.png
│   │   │   │   ├── further-text.png
│   │   │   │   ├── kudos-background.png
│   │   │   │   └── awards/
│   │   │   │       ├── top-talent.png
│   │   │   │       ├── top-project.png
│   │   │   │       ├── top-project-leader.png
│   │   │   │       ├── best-manager.png
│   │   │   │       ├── signature-2025-creator.png
│   │   │   │       └── mvp.png
│   │   │   ├── icons/
│   │   │   │   ├── bell.svg
│   │   │   │   ├── user.svg
│   │   │   │   ├── chevron-right.svg
│   │   │   │   ├── arrow-right.svg
│   │   │   │   ├── pencil.svg
│   │   │   │   └── kudos-logo.svg
│   │   │   └── wordmarks/
│   │   │       └── kudos.svg
│   │   └── fonts/
│   │       └── DigitalNumbers-Regular.woff2   # NEW
│   └── (existing login assets untouched)
├── src/
│   ├── app/
│   │   ├── page.tsx                            # MODIFIED — replace welcome text with <Homepage />
│   │   └── layout.tsx                          # MODIFIED — add Digital Numbers font; wire generateMetadata
│   ├── components/
│   │   ├── homepage/                           # NEW — feature-specific
│   │   │   ├── Homepage.tsx                    # Composite — composes all sections; imported by src/app/page.tsx
│   │   │   ├── HeroBackdrop.tsx                # Keyvisual bg + Cover gradient overlay
│   │   │   ├── HeroSection.tsx                 # Frame 487 content (small logo + countdown + event info + CTAs)
│   │   │   ├── Countdown.tsx                   # Client component — interval + visibilitychange + single aria-live region
│   │   │   ├── CountdownUnit.tsx               # One of Days/Hours/Minutes
│   │   │   ├── CountdownDigitTile.tsx          # Single glass tile + digit glyph
│   │   │   ├── EventInfo.tsx                   # Time + Location + broadcast note
│   │   │   ├── CtaButton.tsx                   # Primary/outline variant (shared between hero + kudos + widget)
│   │   │   ├── RootFurtherDisplay.tsx          # Frame 486 — 2 images + sr-only h1
│   │   │   ├── HeroDescription.tsx             # 3-paragraph block
│   │   │   ├── AwardsSection.tsx               # Wrapper: header + grid
│   │   │   ├── AwardsHeader.tsx                # C1 caption + title + desc (uses <SectionHeader>)
│   │   │   ├── AwardCard.tsx                   # Single focusable <a> wrapping picture + text + "Chi tiết"
│   │   │   ├── KudosPromo.tsx                  # D1 card
│   │   │   ├── WidgetButton.tsx                # Floating pill — MVP: aria-disabled no-op
│   │   │   ├── index.ts                        # Barrel export
│   │   │   └── constants.ts                    # AWARD_SLUGS (ordered), award image path map
│   │   ├── layout/
│   │   │   ├── Header.tsx                     # MODIFIED — generalize with selectedNav + nav links + right cluster
│   │   │   ├── Footer.tsx                     # MODIFIED — add 4 nav links + selectedNav
│   │   │   ├── LanguageSelector.tsx           # Unchanged
│   │   │   ├── NavLink.tsx                    # NEW — shared nav link with 3 states
│   │   │   ├── NotificationButton.tsx         # NEW — bell + optional red dot; MVP disabled
│   │   │   ├── ProfileAvatar.tsx              # NEW — 40×40 button with border
│   │   │   ├── ProfileMenu.tsx                # NEW — dropdown with Profile/Sign out/[Admin]
│   │   │   └── SkipLink.tsx                   # NEW — a11y skip link
│   │   ├── ui/
│   │   │   ├── Icon.tsx                       # MODIFIED — optional `priority`; maybe wrap next/image for raster
│   │   │   ├── SectionHeader.tsx              # NEW — caption + h2 + description
│   │   │   └── VisuallyHidden.tsx             # NEW — sr-only wrapper
│   │   └── auth/
│   │       └── LoginButton.tsx                # Unchanged
│   ├── lib/
│   │   ├── supabase/                          # Unchanged
│   │   ├── services/                          # NEW — stub service layer
│   │   │   ├── event-config.ts
│   │   │   ├── awards-categories.ts
│   │   │   └── notifications.ts
│   │   └── utils/
│   │       ├── countdown.ts                   # NEW — pure `computeRemaining` function
│   │       ├── is-locale.ts                   # NEW — locale type guard
│   │       └── format-event-time.ts           # NEW — Intl.DateTimeFormat wrapper
│   ├── i18n/
│   │   ├── config.ts                           # Unchanged
│   │   ├── request.ts                          # Unchanged
│   │   └── messages/
│   │       ├── vi.json                         # MODIFIED — add homepage.*, nav.*, footer.*, common.* keys
│   │       └── en.json                         # MODIFIED — mirror vi.json keys
│   └── types/                                  # NEW folder
│       └── homepage.ts                         # Type-only: AwardCategory, EventConfig, User, NotificationSummary
├── tests/
│   ├── unit/
│   │   └── homepage/
│   │       ├── countdown.test.ts               # Pure function — past/now/+1s/+1d/+30d boundary cases
│   │       ├── Countdown.test.tsx              # Component — interval + visibilitychange + single aria-live
│   │       ├── CountdownUnit.test.tsx          # zero-pad split, label render
│   │       ├── CountdownDigitTile.test.tsx     # Rendering, reduced-motion
│   │       ├── CtaButton.test.tsx              # Variants + hover swap + disabled
│   │       ├── AwardCard.test.tsx              # Single <a>, href correct, single tab stop, hover classes
│   │       ├── AwardsHeader.test.tsx           # Caption + h2 + description
│   │       ├── KudosPromo.test.tsx             # Content + CTA href
│   │       ├── WidgetButton.test.tsx           # MVP aria-disabled + click is no-op
│   │       ├── Homepage.test.tsx               # Composite renders all sections in correct order
│   │       ├── HeroDescription.test.tsx        # Renders 3 paragraphs from i18n
│   │       ├── RootFurtherDisplay.test.tsx     # sr-only h1 + decorative images
│   │       ├── Header.test.tsx                 # Updated: selectedNav prop + 3 nav + notif + lang + profile
│   │       ├── Footer.test.tsx                 # Updated: 4 nav links; Standards aria-disabled
│   │       ├── NavLink.test.tsx                # 3 states + selected-click-scrolls-to-top
│   │       ├── NotificationButton.test.tsx     # MVP aria-disabled; future-state unread dot
│   │       ├── ProfileAvatar.test.tsx          # Image fallback when avatar_url null
│   │       ├── ProfileMenu.test.tsx            # Options vary by role; sign-out calls supabase.signOut
│   │       ├── SkipLink.test.tsx               # Focusable on Tab; href="#main-content"
│   │       ├── SectionHeader.test.tsx          # Caption + h2 + description structure
│   │       ├── i18n-parity.test.ts             # vi.json vs en.json key-set equality
│   │       ├── format-event-time.test.ts       # "18h30" (vi) vs "6:30 PM" (en) via Intl.DateTimeFormat
│   │       ├── event-config.test.ts            # Stub service returns env var value
│   │       ├── awards-categories.test.ts       # Stub returns 6 slugs in correct order
│   │       └── notifications.test.ts           # Stub returns { unread_count: 0 }
│   ├── integration/
│   │   └── homepage/
│   │       ├── page.test.tsx                   # RSC: unauth → redirect, auth → renders; reads session
│   │       ├── locale-switching.test.tsx       # Toggle EN → every visible string updates; verify no diacritics remain
│   │       └── countdown-language-toggle.test.tsx # US2 edge case: toggle mid-countdown preserves values
│   └── e2e/
│       └── homepage.spec.ts                    # Playwright: viewport (mobile/tablet/desktop) + axe a11y + happy path + card nav + reduced-motion
├── jest.config.ts                              # Unchanged
├── playwright.config.ts                        # Unchanged
└── package.json                                # Unchanged (no new runtime deps; existing Jest/Playwright cover new tests)
```

### Dependencies

**No new runtime dependencies.** All new capabilities use already-installed packages.

| Package | Purpose | Status |
|---------|---------|--------|
| `next/font/local` | Self-host Digital Numbers font | Built-in Next.js feature |
| `next/image` | Optimize large raster assets (hero bg, award thumbnails) | Built-in |
| All existing | `next-intl`, `@supabase/ssr`, `react`, `next` | Already in `package.json` |

**One new dev asset**: `public/assets/homepage/fonts/DigitalNumbers-Regular.woff2` (font file, not an npm package).

---

## Implementation Strategy

### Overall approach

**Vertical slices by user story**, TDD for every component. Each slice lands a visibly complete feature end-to-end (types → service stub → component + tests → wire into page) before the next slice begins. This matches the project's earlier Login-screen development flow.

Phase 1 (Foundation) is horizontal — shared tokens, layout chrome generalization, and service-layer stubs — so subsequent vertical slices can focus on screen-specific components without chrome distractions.

### Phase Breakdown

#### Phase 0 — Asset Preparation

Download all Figma assets and fonts into `public/assets/homepage/`. Verify each against `design-style.md` §Icon / Font Specifications. Do NOT start any code work until all assets are in place.

**Asset manifest** (to be downloaded via `mcp__momorph__get_media_files` unless noted):

| Target path | Figma node ID | Source | Notes |
|-------------|---------------|--------|-------|
| `images/keyvisual-bg.png` | `2167:9028` (`MM_MEDIA_Keyvisual BG`) | media_files | Full-bleed hero background, 1512×1392 |
| `images/root-further-hero-logo.png` | `2788:12911` (`MM_MEDIA_Root Further Logo`) | media_files | Small hero logo combined |
| `images/root-text.png` | `3204:10155` (`MM_MEDIA_Root Text`) | media_files | Large "ROOT" wordmark — may require `get_figma_image` @2x if not in media_files |
| `images/further-text.png` | `3204:10154` (`MM_MEDIA_Further Text`) | media_files | Large "FURTHER" wordmark — same fallback |
| `images/kudos-background.png` | `I3390:10349;313:8416` (`MM_MEDIA_Kudos Background`) | media_files | 1120×500 Sunkudos media |
| `images/awards/top-talent.png` | `I2167:9075;214:1019;214:666;10:951` (`MM_MEDIA_Top Talent`) | media_files | 336×336 (export @2x for Retina) |
| `images/awards/top-project.png` | `I2167:9076;214:1019;214:666;214:654` | media_files | 336×336 @2x |
| `images/awards/top-project-leader.png` | `I2167:9077;214:1019;214:666;214:655` | media_files | 336×336 @2x |
| `images/awards/best-manager.png` | `I2167:9079;214:1019;214:666;214:656` | media_files | 336×336 @2x |
| `images/awards/signature-2025-creator.png` | `I2167:9080;214:1019;214:666;214:657` | media_files | 336×336 @2x |
| `images/awards/mvp.png` | `I2167:9081;214:1019;214:666;214:653` | media_files | 336×336 @2x |
| `wordmarks/kudos.svg` | `I3390:10349;329:2948` (`MM_MEDIA_Logo/Kudos`) | media_files | Exported as SVG/PNG — replaces SVN-Gotham font |
| `icons/bell.svg` | `I2167:9091;186:2101;186:2020;186:1420` (`MM_MEDIA_Noti?=True`) | media_files | 24×24 |
| `icons/user.svg` | `I2167:9091;186:1597;186:1420` (`MM_MEDIA_User Profile`) | media_files | 24×24 |
| `icons/chevron-right.svg` | `I2167:9063;186:1766` (`MM_MEDIA_Up`) | media_files | 20×20 (used in CTAs) |
| `icons/arrow-right.svg` | `I2167:9075;214:1023;186:1441` (`MM_MEDIA_Up` in "Chi tiết" button) | media_files | 16×16 |
| `icons/pencil.svg` | `I5022:15169;214:3839;186:1763` (`MM_MEDIA_Pen`) | media_files | 24×24 widget left |
| `icons/kudos-logo.svg` | `I5022:15169;214:3839;186:1766;214:3762` (`MM_MEDIA_Kudos Logo`) | media_files | 24×24 widget right |
| `fonts/DigitalNumbers-Regular.woff2` | — | Free font distro (SIL OFL-licensed "Digital-7" or equivalent) | See §Open Questions |
| `fonts/LICENSE.txt` | — | Included with font | Document license |

**Asset-download procedure**:
1. Create directories: `public/assets/homepage/{images,icons,wordmarks,fonts}` and `public/assets/homepage/images/awards/`.
2. Run `mcp__momorph__get_media_files` with `fileKey=9ypp4enmFmdK3YAFJLIu6C` and all media node IDs in one batch.
3. For any ROOT/FURTHER/Keyvisual images returning empty from `get_media_files`, fall back to `mcp__momorph__get_figma_image` with `nodeId` and `scale=2`.
4. Rename downloaded files to match the target paths above.
5. Source the Digital Numbers font from a permissive-license distribution; place `.woff2` + `LICENSE.txt` in `fonts/`.

**Exit criteria**:
- All 19 asset files exist at their target paths.
- `frame.png` reference renders visibly (already in `.momorph/specs/i87tDx10uM-Homepage/assets/`).
- `DigitalNumbers-Regular.woff2` loads via a test page without FOIT/FOUT.
- `LICENSE.txt` present for the font.

#### Phase 1 — Foundation (shared)

1. **Design tokens** — extend `src/app/globals.css` `@theme` with ~20 new tokens from `design-style.md`:
   - Colors: `--color-bg-header-dark`, `--color-bg-sunkudos-media`, `--color-btn-primary-bg`, `--color-btn-secondary-bg`, `--color-accent-glow`, `--color-accent-warm`, `--color-text-gold`, `--color-border-subtle`, `--color-border-gold`, `--color-divider`, `--color-status-notification`.
   - Shadows: `--shadow-gold-glow`, `--text-shadow-glow`, `--backdrop-blur-tile`.
   - Z-index: 7 layers.
   - Spacing + radius: the ones not already present.
2. **Digital Numbers font** — add `next/font/local` loader in `src/app/layout.tsx`; expose as `--font-digital-numbers` CSS variable.
3. **i18n keys** — write both `vi.json` and `en.json` with full homepage + nav + footer + common + metadata namespaces from spec.md §i18n Keys. Run `npm test i18n-parity.test.ts` to confirm parity (write this test first).
4. **Service layer stubs** — create `src/lib/services/{event-config,awards-categories,notifications}.ts` with typed interfaces matching the future API contracts; stubs return static/env-var data.
5. **Type definitions** — `src/types/homepage.ts` with `AwardCategory`, `EventConfig`, `NotificationSummary`, `UserRole`.
6. **Utility modules** — `src/lib/utils/{countdown,format-event-time,is-locale}.ts` with pure functions and unit tests.
7. **Icon component extension** — additive prop `priority?: boolean` and `kind?: "svg" | "raster"` (default `"svg"` = current `<img>` behavior; `"raster"` swaps to Next.js `<Image>` internally for hero bg, ROOT/FURTHER wordmarks, and award thumbnails). All existing Login call sites (`kind` unspecified) continue to work unchanged — verified by re-running Login's existing unit + E2E suite after the change.

   New `<Icon>` API:
   ```ts
   type IconProps = {
     src: string;
     size: number;                                 // required width/height in px
     alt: string;                                  // required for accessibility; "" = decorative
     className?: string;
     style?: CSSProperties;
     "aria-hidden"?: boolean | "true" | "false";
     kind?: "svg" | "raster";                      // default "svg" (renders <img>); "raster" renders <Image>
     priority?: boolean;                           // only honored when kind="raster"; sets Image priority=true
   };
   ```
8. **Layout chrome generalization** (TDD each):
   - `<NavLink>` — new shared component with 3 states (default/hover/selected).
   - `<NotificationButton>` — MVP `aria-disabled` variant.
   - `<ProfileAvatar>` + `<ProfileMenu>` — dropdown with Profile / Sign out / (Admin).
   - `<Header>` — generalize: accept `selectedNav`, render nav links + right cluster, fixed + blur backdrop.
   - `<Footer>` — add 4 nav links, accept `selectedNav`; item 7.5 ("Tiêu chuẩn chung") is rendered as:
     ```tsx
     <a
       href="#"
       aria-disabled="true"
       onClick={(e) => e.preventDefault()}
       className="..." /* same classes as other footer links, normal state */
     >
       {t("footer.nav.standards")}
     </a>
     ```
     Swap to `<Link href="/standards">` when the Standards screen exists.
   - `<SkipLink>` — visually-hidden link that jumps to `#main-content` on Tab focus.
9. **`generateMetadata`** — implement in `src/app/page.tsx` (per-route) using `getTranslations` — TR-007.

**Exit criteria**: Login page still renders identically; i18n parity test passes; Header/Footer generalized and reused by Login without regression (run existing Login tests).

#### Phase 2 — User Story 1 (P1): Countdown & Hero (MVP)

Vertical slice — smallest viable hero experience:

1. Tests first (TDD): `countdown.test.ts` (pure), `Countdown.test.tsx` (interval + visibilitychange + reduced-motion), `CountdownDigitTile.test.tsx`, `CountdownUnit.test.tsx`, `CtaButton.test.tsx` (variants, states).
2. Implementation:
   - `<CountdownDigitTile>` — glass tile, digit glyph, `--backdrop-blur-tile`, 0.5px gold border.
   - `<CountdownUnit>` — 2 tiles + label, derives `char[]` from `zeroPad2(value)`.
   - `<Countdown>` — client component; `aria-live="polite"` announcement uses `hero.countdown.aria_label`.
   - `<CtaButton>` — accepts `variant="primary"|"outline"`; hover on outline swaps to primary.
   - `<EventInfo>` — static rows + broadcast note.
   - `<HeroBackdrop>` — absolute keyvisual bg + Cover gradient.
   - `<RootFurtherDisplay>` — big split images + sr-only h1.
   - `<HeroDescription>` — 3 paragraphs.
   - `<HeroSection>` — composes small logo + Countdown + EventInfo + CTA pair.
3. Wire into `src/app/page.tsx`: replace welcome text with `<Homepage>` component; keep existing auth redirect logic.

**Exit criteria**: navigate to `/` while logged in → hero renders with correct countdown values; clicking CTAs navigates to `/awards` and `/kudos` (pages return 404 — acceptable; documented in Dependencies).

#### Phase 3 — User Story 3 (P2): Awards Grid

1. Tests first: `AwardCard.test.tsx` (link href, hover, a11y single-tab-stop), `AwardsHeader.test.tsx`, responsive grid test.
2. Implementation:
   - `constants.ts` — ordered slug list + image paths.
   - `<AwardsHeader>` — uses `<SectionHeader>`.
   - `<AwardCard>` — single `<a>` wrapping image + title + description + decorative "Chi tiết"; hover lift + glow.
   - `<AwardsSection>` — loops slugs → `<AwardCard>`; CSS grid 3 cols desktop, 2 tablet, 2 mobile.
3. Append to homepage below hero.

**Exit criteria**: 6 cards render in order; hover lifts card; click navigates to `/awards#<slug>`.

#### Phase 4 — User Story 4 (P2): Sun* Kudos Promo

1. Tests first: `KudosPromo.test.tsx` (label + title + body + CTA + wordmark + `/kudos` nav).
2. Implementation:
   - `<KudosPromo>` — 2-column row; left content + CTA; right media + wordmark image; responsive stacking.

**Exit criteria**: card renders with all elements from Figma; CTA navigates to `/kudos`.

#### Phase 5 — User Story 5 (P2): Global Chrome polish

Most chrome is already in Phase 1. This phase is about homepage-specific wiring:

1. Tests: `ProfileMenu.test.tsx` (admin role variant), `Header.test.tsx` (selectedNav="about-saa"), `Footer.test.tsx` (4 links, Standards disabled), `WidgetButton.test.tsx` (MVP no-op, ARIA state).
2. Implementation:
   - `<WidgetButton>` — fixed bottom-right pill with pencil / "/" / kudos-logo; `aria-disabled="true"`.
   - Wire `selectedNav="about-saa"` on Header + Footer within the homepage.
3. ProfileMenu reads `supabase.auth.getUser()` `app_metadata.role` → conditionally renders Admin Dashboard option.

**Exit criteria**: header shows selected state; profile click opens menu; sign-out works end-to-end; widget button renders but does nothing on click.

#### Phase 6 — User Story 6 (P3): Unauthenticated redirect

Verification phase — the existing middleware from Login already handles this. Write one Playwright E2E test to confirm `/` while logged out → `/login?returnTo=%2F`.

#### Phase 7 — Polish

1. **Responsive verification** at 3 viewports (Playwright): 375×812 (mobile), 768×1024 (tablet), 1440×1024 (desktop). Assert: grid columns (2/2/3), hero title scales, CTA wrap, widget button position.
2. **Accessibility**: run `axe-playwright` on `/` — must report zero WCAG 2.1 AA violations (mirror the Login project's `checkA11y` setup).
3. **Locale switching E2E**: load VN, toggle EN, assert every visible Vietnamese-diacritic character is gone (regex `[ĂÂĐÊÔƠƯăâđêôơư]` per SC-003).
4. **Reduced-motion**: Playwright sets `prefers-reduced-motion: reduce`; verify no transitions apply. Leverage the existing global `@media` reset in `globals.css`.
5. **Keyboard navigation Tab order** — automated Playwright test confirming the order from spec.md §Edge Cases:
   ```
   Skip-link → SAA Logo → About SAA 2025 → Awards Information → Sun* Kudos →
   Notification bell → Language selector → Profile avatar → ABOUT AWARDS → ABOUT KUDOS →
   Award card 1 (single stop) → ... → Award card 6 →
   Sunkudos Chi tiết → Footer: About SAA → Awards Info → Sun* Kudos → Tiêu chuẩn chung (still focusable but aria-disabled) →
   Widget button
   ```
6. **Performance (LCP ≤2.5s, TR-001)**:
   - `<HeroBackdrop>` uses `<Icon kind="raster" priority src="/assets/homepage/images/keyvisual-bg.png" />` so Next.js renders `<Image priority>` — highest-fetch-priority, preloaded in `<head>`.
   - Award thumbnails use `<Icon kind="raster" />` WITHOUT `priority` so they lazy-load.
   - Lighthouse CI run manually at Phase 7; document score in PR description.
7. **Visual diff** (optional): compare rendered homepage screenshot to `assets/frame.png` using MoMorph's `compareScreenshots`; tolerate small differences under document-tokens thresholds.

### Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Figma image exports unavailable or wrong format (PNG vs SVG) | Med | Med | Use `mcp__momorph__get_media_files` for all assets; fall back to `mcp__momorph__get_figma_image` with `@2x` scale for ROOT FURTHER split images. Verify each asset before Phase 1 ends. |
| `<Icon>` component can't efficiently render 336×336 award thumbnails (currently uses `<img>` without Next.js optimization) | Med | Low | Extend `<Icon>` to optionally render `next/image` when a `priority` or `size > 100` is passed. Keep `<img>` path for small icons to avoid churn. |
| Countdown drifts because `setInterval` isn't guaranteed — tab may throttle | High | Med | Use `visibilitychange` + recompute from wall clock every resume; additionally compute drift-corrected next tick (`setTimeout` at the next minute boundary) instead of fixed 60000ms. |
| Digital Numbers font fails to load / licensing issue | Low | Low | The font is a free decorative font. Fallback `monospace` keeps the digits readable even if the font fails. Document license in `public/assets/homepage/fonts/LICENSE.txt`. |
| Selected-state nav underline conflicts with Tailwind focus outline | Low | Low | Selected-state underline is `1px solid #FFEA9E` on `border-bottom`; focus outline is `outline` (separate property). Coexist cleanly. |
| Multi-line award description truncation (2 lines + ellipsis) inconsistent across browsers | Med | Low | Use `-webkit-line-clamp: 2; display: -webkit-box; -webkit-box-orient: vertical; overflow: hidden` — supported in all modern browsers per caniuse. |
| Supabase session lookup slow on Vercel cold start | Low | Med | Already encountered in Login; `middleware.ts` + RSC `createServerClient` already optimized. Measure in Polish phase. |
| Header changes break Login screen | Med | Med | Run existing Login unit + E2E tests after every `<Header>`/`<Footer>` change. Ensure `selectedNav` is optional with a sensible default so Login (which doesn't set it) keeps working. |
| Content team changes EN translations after implementation | High | Low | Content lives in `vi.json`/`en.json` — a translation-only change is a string edit with no code churn. Acceptable. |
| I18n parity test false-positives on intentional asymmetry | Low | Low | Parity test uses deep-key enumeration; acceptable. Document the rule in `tests/unit/homepage/i18n-parity.test.ts`. |

### Estimated Complexity

- **Frontend**: **High** — 15+ new components, responsive design across 3 breakpoints, countdown interval logic, a11y heading hierarchy, i18n for every string, gold-glow visual system.
- **Backend**: **None** — no new API implementation in MVP.
- **Testing**: **Medium** — TDD adds 15+ new unit tests, 2 integration tests, 1 E2E suite. Jest + Playwright infrastructure already in place from Login.

---

## Integration Testing Strategy

### Test Scope

- [x] **Component/Module interactions**: Homepage page renders with all sections (`<Homepage>` → `<Header>` + `<HeroSection>` + `<RootFurtherDisplay>` + `<HeroDescription>` + `<AwardsSection>` + `<KudosPromo>` + `<WidgetButton>` + `<Footer>` + `<SkipLink>`).
- [x] **External dependencies**: Supabase Auth for `getUser()` + `signOut()`; stubbed for MVP otherwise.
- [ ] **Data layer**: N/A — no database access from MVP homepage.
- [x] **User workflows**: Login → Homepage; Locale toggle; Sign-out flow; Card/CTA navigation targets (destination pages not implemented; only verify URL changes).

### Test Categories

| Category | Applicable? | Key Scenarios |
|----------|-------------|---------------|
| UI ↔ Logic | Yes | Countdown updates per minute; LanguageSelector swaps locale cookie + re-renders all text |
| Service ↔ Service | No | No inter-service calls in MVP |
| App ↔ External API | Limited | Supabase Auth only (session read + sign-out) |
| App ↔ Data Layer | No | N/A for MVP |
| Cross-platform | Yes | Responsive at 375 (mobile), 768 (tablet), 1440 (desktop) viewports |

### Test Environment

- **Environment type**: Local dev (`yarn dev`) + Local Supabase (`npx supabase start`). CI: GitHub Actions (future — not set up yet).
- **Test data strategy**:
  - Unit: Jest fake timers (`jest.useFakeTimers`) for Countdown.
  - Integration: real `NextIntlClientProvider` + mocked Supabase session (`@/lib/supabase/server` mocked to return a user).
  - E2E: Playwright with a real dev server; Supabase login mocked via intercepted OAuth callback OR pre-seeded session cookie.
- **Isolation approach**: fresh React component mount per test (RTL's `render` cleanup); Playwright: new browser context per test.

### Mocking Strategy

| Dependency | Strategy | Rationale |
|------------|----------|-----------|
| Supabase `createServerClient` | Mock for unit/integration; real for E2E | Unit tests shouldn't hit real network; E2E verifies full wiring |
| `next-intl` | Real `NextIntlClientProvider` in integration; mock `useTranslations` returning identity map in isolated unit tests | Matches Login screen's pattern |
| `next/navigation` (router/pathname) | Mocked in unit tests via `jest.setup.ts` | Existing pattern |
| `NEXT_PUBLIC_EVENT_DATE` | Set to `new Date(Date.now() + 30*86400*1000).toISOString()` in unit tests (30 days out); real env var in E2E | Deterministic countdown for unit tests |
| `Date.now()` / `setInterval` | Jest fake timers | Deterministic interval testing |

### Test Scenarios Outline

1. **Happy Path**
   - [ ] Authenticated user visits `/` → sees hero + countdown + all sections.
   - [ ] Countdown decrements over simulated time (fake timers advance).
   - [ ] User clicks language selector → EN → every string switches.
   - [ ] User clicks award card → navigates to `/awards#<slug>`.
   - [ ] User clicks Sun\* Kudos CTA → navigates to `/kudos`.
   - [ ] User clicks profile → menu opens → sign-out → redirect to `/login`.

2. **Error Handling**
   - [ ] `NEXT_PUBLIC_EVENT_DATE` invalid → countdown tiles render `--`; rest of page renders.
   - [ ] `NEXT_PUBLIC_EVENT_DATE` in past → tiles show `00`; "Coming soon" hidden.
   - [ ] Missing i18n key (simulated via override) → dev mode logs warning; production falls back to VN.
   - [ ] User without `avatar_url` → profile icon falls back to `user.svg`.

3. **Edge Cases**
   - [ ] Tab hidden 5 min → countdown resyncs on visibilitychange.
   - [ ] Viewport resized from desktop → mobile: grid re-flows from 3 cols to 2.
   - [ ] `prefers-reduced-motion: reduce` → no hover transitions.
   - [ ] Keyboard-only user Tabs through all interactive elements in correct order.
   - [ ] Axe-core reports zero AA violations.
   - [ ] Tiêu chuẩn chung click does nothing (verified `aria-disabled`).

### Tooling & Framework

- **Test framework**: Jest 30 + `@testing-library/react` 16 + `@testing-library/user-event` 14 for unit/integration; Playwright 1.x + `axe-playwright` 2.x for E2E & a11y.
- **Supporting tools**: `jest.useFakeTimers()` for countdown; `jest.mock('@/lib/supabase/server')` for RSC tests; `next/jest.js` for Next.js-aware config.
- **CI integration**: `yarn test && yarn test:e2e` runs both suites. GitHub Actions workflow TBD (not in scope for homepage).

### Coverage Goals

| Area | Target | Priority |
|------|--------|----------|
| Countdown pure logic (`countdown.ts`) | 100% | High |
| Homepage components | ≥85% | High |
| Shared layout components (Header/Footer/NavLink/ProfileMenu/NotificationButton) | ≥80% | High |
| Service-layer stubs | 100% (trivial) | Medium |
| I18n parity (keys vi ↔ en) | 100% | High |
| A11y (axe) | 0 violations | High |
| Locale-toggle E2E | Pass | High |

---

## Dependencies & Prerequisites

### Required Before Start

- [x] `constitution.md` reviewed and understood.
- [x] `spec.md` approved (reviewed 3 times; zero open questions).
- [x] `design-style.md` reviewed (tokens, components, states, responsive all specified).
- [ ] `research.md` — **not required** for this feature; existing Login codebase is the research baseline.
- [ ] API contracts defined — **N/A** for MVP; future contracts documented in spec.md.
- [ ] Database migrations — **N/A**; no DB changes.
- [ ] Figma assets downloaded and placed in `public/assets/homepage/` (Phase 0 gate).

### External Dependencies

- **Figma (MoMorph)** — asset exports via `mcp__momorph__get_media_files` + `mcp__momorph__get_figma_image`.
- **Supabase local dev** — running `supabase start` + `.env.local` populated.
- **Google OAuth** (existing) — for the full login → homepage happy path E2E.
- **Digital Numbers font** — from a free/open font source; license file to be included in `public/assets/homepage/fonts/LICENSE.txt`.

### Related Screens Blocking Full Demo (but NOT blocking implementation)

- `/awards` — target of hero CTA + award cards. OK to 404 during development; will be specified separately.
- `/kudos` — target of hero CTA + Kudos promo CTA. OK to 404.
- `/profile` — target of Profile dropdown. OK to 404.
- `/admin` — target conditional on role. OK to 404.
- `/standards` — not wired in MVP (placeholder only).

---

## Git & Delivery Workflow (Constitution §Development Workflow)

- **Branch**: `feature/homepage-saa-2025` off `main`. If the work is broken into multiple PRs per phase, use `feature/homepage-foundation`, `feature/homepage-hero`, `feature/homepage-awards`, etc.
- **Commit cadence**: atomic per logical unit (one commit per test-pass cycle, one commit per component + its tests together when small). No "WIP" commits on `main`.
- **Pre-commit quality gates** (constitution): `pnpm typecheck && pnpm lint && pnpm test && pnpm build` — must all pass. *(This project currently has no configured ESLint; add basic config in Phase 1 or skip lint until ESLint is set up — consistent with Login.)*
- **PR description** MUST include: short summary, link to spec+plan, phases covered, manual-QA checklist, Lighthouse score (Phase 7 onward).
- **Merge policy**: squash-merge into `main`; direct push prohibited.
- **Never**: `--no-verify`, `git push --force`, skip tests, or bypass hooks.

---

## Next Steps

After plan approval:

1. **Run** `/momorph.tasks` to generate the ordered task list (tasks.md) with parallel markers.
2. **Review** tasks.md for parallelization opportunities — Phase 0 assets can all run in parallel; Phase 2 component files are mostly independent; test-first order within each phase must be respected.
3. **Begin** implementation from Phase 0 → Phase 7 following the strict TDD cycle: Red (failing test) → Green (minimum code to pass) → Refactor.

---

## Open Questions

These do not block plan approval or Phase 0/1 start, but should be surfaced before the relevant phase:

- [ ] **Inline-style vs Tailwind consistency**: Login uses heavy inline-style. Homepage will continue the pattern for parity. Recommend a separate follow-up PR to convert both screens to Tailwind utility classes (const II of constitution). Acceptable to defer?
- [ ] **`<Icon>` next/image upgrade**: Extending `<Icon>` internally to use `next/image` for large raster is the cleanest path. Confirm OK to modify the existing `<Icon>` component rather than introducing a parallel `<ImageIcon>` component. *(Recommended: modify `<Icon>` — it remains the single abstraction per constitution.)*
- [ ] **Digital Numbers font source**: which exact distribution (Wikipedia lists a free font "Digital-7" that visually matches; also "DigitalNumbers" by Paul D. Hunt). Confirm the selected `.woff2` file comes from a source with a permissive license (SIL OFL or similar) before Phase 0 completes.
- [ ] **Award card image aspect**: Figma shows 336×336 but the visible circular/glowing illustration inside may be smaller. Export at 2× for Retina and let CSS size to 336×336 (or scale responsively). Confirm during Phase 0 asset verification.

---

## Notes

- **MVP scope is deliberately tight** — no SWR/fetch layer, no widget actions, no notifications panel, no admin page. This keeps the homepage shippable in a single sprint while establishing every pattern (service-layer wrappers, i18n-first strings, TDD cadence, a11y gates) that later features will extend.
- **Countdown is the most mistake-prone piece** — drift under tab-throttling + the per-digit sub-tile rendering + reduced-motion variants + i18n ARIA label are four orthogonal concerns. Invest in thorough unit tests for `computeRemaining` first; component tests verify rendering + interval wiring.
- **Header & Footer generalization is load-bearing** — these components will be reused on Awards, Kudos, Profile, Admin, and Standards pages. Time spent in Phase 1 getting the `selectedNav` + 4-footer-link API right pays off 5× later.
- **Gold-glow is the brand signature** — don't skimp on matching the exact shadow values (`0 4px 4px rgba(0,0,0,0.25), 0 0 6px #FAE287`). Visual diff between implementation and Figma screenshot is a Phase 7 polish gate.
- **Mix-blend-mode on award pictures** — `mix-blend-mode: screen` composites award thumbnails over the dark page bg. Without it, images look washed out. Easy to forget; add an explicit test asserting the computed style.
- **Reduced-motion compliance** — the project already has a global `@media (prefers-reduced-motion: reduce)` reset in `globals.css`. Homepage adds NO animations that aren't covered by that reset. Verify in Phase 7.
