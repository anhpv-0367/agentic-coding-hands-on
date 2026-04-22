<!--
Sync Impact Report
==================
Version change: N/A → 1.0.0 (initial creation)

Added sections:
  - Core Principles (I–V)
  - Tech Stack Conventions
  - Development Workflow
  - Governance

Removed sections: N/A

Templates checked:
  ✅ .momorph/templates/plan-template.md — Constitution Compliance Check aligns with all five principles
  ✅ .momorph/templates/spec-template.md — Dependencies section references constitution.md; Visual Requirements aligns with Principle II
  ✅ .momorph/templates/tasks-template.md — Security hardening, testing discipline, and parallel task marks align with Principles III and V
  ✅ .momorph/guidelines/frontend.md — Design token / no-hardcode-values rule aligns with Principle II

Follow-up TODOs: None — all placeholders resolved.
-->

# Agentic Coding Hands-on Constitution

## Core Principles

### I. Clean Code & Source Organization

All code MUST be readable, concise, and maintainable. Source files MUST follow a
feature-first folder structure — group related code (components, hooks, services, types)
under `features/<feature-name>/` or the platform equivalent. Naming MUST use the platform
convention: kebab-case for files, PascalCase for classes/components, camelCase for
functions and variables. Every function and component MUST have a single, clearly named
responsibility. Dead code, commented-out blocks, and unresolved TODO comments MUST NOT
exist in committed code.

**Rationale**: Consistent structure reduces cognitive load for both AI-assisted generation
and human review. MoMorph-generated code integrates cleanly when the target codebase
follows predictable conventions.

### II. Platform-Appropriate UI Standards

UI implementation MUST conform to the design guidelines of the target platform:

- **Web**: Mobile-first responsive design; use Tailwind utility classes mapped to design
  tokens (never hardcode colors, spacing, or typography). See `.momorph/guidelines/frontend.md`.
- **Android**: Follow Material Design 3 guidelines; use Jetpack Compose with
  `MaterialTheme` tokens for colors, typography, and shapes.
- **iOS**: Follow Apple Human Interface Guidelines; use SwiftUI with native system
  components, SF Symbols, and Dynamic Type support.
- **React Native**: Follow Expo/React Native patterns; adapt Material or HIG conventions
  to match the primary target platform's norms.

Design tokens (colors, spacing, typography) MUST be defined centrally and consumed via
theme or token references — never as hardcoded values in component files.

**Rationale**: Platform-native UI improves usability and accessibility. Token-based theming
ensures visual consistency across the codebase and enables design updates without
touching component logic.

### III. Test-First Development (TDD — NON-NEGOTIABLE)

Tests MUST be written before implementation code. The required Red-Green-Refactor cycle is:

1. Write failing test(s) covering the acceptance scenario.
2. Get approval (human or CI gate) that the test represents correct intent.
3. Implement the minimum code to make the test(s) pass.
4. Refactor while keeping tests green.

Every user story MUST have at least one independently runnable test before implementation
begins. Unit tests cover business logic; integration tests cover service and data layer
interactions; E2E tests cover critical user flows.

**Rationale**: TDD prevents regressions, documents expected behavior as executable specs,
and ensures AI-generated code is verifiably correct before merging.

### IV. Supabase Integration Standards

All backend data, authentication, and storage MUST go through the official Supabase SDK —
never via raw SQL, direct REST calls, or custom HTTP clients that bypass the SDK.

- Authentication MUST use `supabase.auth`; custom auth implementations are prohibited.
- Row-Level Security (RLS) policies MUST be defined for every table accessible from
  client code.
- Supabase keys (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) MUST
  be stored in environment variables and MUST NOT appear in source code, logs, or bundles.
- The Supabase client MUST be initialized as a singleton and shared across the app.
- Prefer Supabase Edge Functions for server-side logic that requires elevated privileges.

**Rationale**: The Supabase SDK enforces RLS, handles token refresh, and abstracts
transport concerns. Bypassing it introduces security and consistency risks.

### V. OWASP Secure Coding Standards

The following OWASP Top 10 controls are MANDATORY throughout the codebase:

- **Input validation**: All user-supplied data MUST be validated and sanitized before use
  (Zod on web/React Native, Kotlin/Swift type coercion + validation on mobile).
- **Authentication & session management**: Use Supabase Auth exclusively. On web, MUST
  NOT store session tokens in `localStorage`; prefer httpOnly cookies or Supabase's
  built-in session storage.
- **Sensitive data protection**: No secrets, credentials, or PII in source code, logs,
  client-side bundles, or version control.
- **Injection prevention**: All queries MUST use the Supabase SDK's parameterized
  interface; constructing queries from raw user input is prohibited.
- **Broken access control**: RLS policies enforce server-side authorization; every
  sensitive operation MUST validate authorization on the server, not just the client.
- **Security misconfiguration**: HTTPS enforced in production; debug endpoints and
  verbose error messages MUST NOT be exposed in production builds; environment-specific
  secrets MUST NOT be committed.

**Rationale**: Security flaws discovered post-deployment are exponentially more costly to
fix. Embedding these controls in the constitution ensures AI-generated code adheres to
them from the first line written.

## Tech Stack Conventions

Platform-specific standards that MUST be followed alongside the core principles:

| Platform     | Language   | Framework               | UI Toolkit                       | Notes                                      |
|-------------|------------|-------------------------|----------------------------------|--------------------------------------------|
| Web         | TypeScript | Next.js (App Router)    | TailwindCSS + design tokens      | See `.momorph/guidelines/frontend.md`      |
| Android     | Kotlin     | Jetpack Compose         | Material Design 3                | `ViewModel` + `StateFlow` for state mgmt   |
| iOS         | Swift      | SwiftUI                 | Apple HIG / SF Symbols           | `@StateObject` / `ObservableObject`        |
| React Native| TypeScript | Expo (SDK)              | NativeWind or React Native Paper | Follow Expo Router conventions             |
| Backend/BaaS| —          | Supabase                | —                                | RLS required; Edge Functions for server logic |

Library additions MUST be justified. Prefer built-in platform capabilities and Supabase
features before introducing third-party dependencies.

## Development Workflow

### Quality Gates (MUST pass before every commit)

1. **Type check**: Zero TypeScript / Kotlin / Swift type errors.
2. **Lint**: Zero lint violations (`pnpm lint` / `ktlint` / `SwiftLint`).
3. **Tests**: All existing tests pass; new behavior covered by new tests.
4. **Build**: Production build succeeds without errors or warnings.

### Git Conventions

- Always branch from `main` using naming: `feature/<name>`, `fix/<description>`, `chore/<task>`.
- Commits MUST be atomic and descriptive; break large changes into logical increments.
- All changes MUST be merged to `main` via pull request with at least one review.
- Direct push to `main` is prohibited.

### AI-Generated Code Requirements

- All MoMorph-generated code MUST pass quality gates before committing.
- Generated code MUST be reviewed for security compliance (Principle V) before merge.
- The Constitution Compliance Check in `plan.md` MUST be fully completed before
  implementation tasks begin.

## Governance

This constitution supersedes all other project-level practices. Amendments require:

1. A documented rationale for the change.
2. A version bump following semantic versioning:
   - **MAJOR**: Backward-incompatible removal or redefinition of a principle.
   - **MINOR**: New principle, section, or materially expanded guidance added.
   - **PATCH**: Clarifications, wording fixes, or non-semantic refinements.
3. An updated `LAST_AMENDED_DATE` in ISO format.
4. Propagation to dependent templates (`plan-template.md`, `spec-template.md`,
   `tasks-template.md`) when affected sections change.

All PRs and code reviews MUST verify compliance with this constitution. Non-compliance
MUST be flagged and resolved before merge. For runtime development guidance, refer to
`.momorph/guidelines/` and `CLAUDE.md`.

**Version**: 1.0.0 | **Ratified**: 2026-04-20 | **Last Amended**: 2026-04-20
