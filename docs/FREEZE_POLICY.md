# Architecture Freeze Policy

> **Status**: ACTIVE — Effective from Engineering Foundation Sprint completion  
> **Date**: 2026-07-15  
> **Approved by**: Tech Lead  
> **Version**: 1.0

---

## Overview

The Engineering Foundation has been completed and **frozen**. This document defines what is frozen, what the rules are, and the process for making exceptions.

---

## Frozen Components

The following are **FROZEN** as of 2026-07-15. They must not be changed without a new ADR approved by the Tech Lead.

### 1. Folder Structure

```
src/
├── assets/
├── components/
│   └── ui/
├── core/
│   ├── command/
│   ├── config/
│   ├── event-bus/
│   ├── i18n/
│   ├── logger/
│   ├── plugin/
│   ├── theme/
│   └── utils/
├── features/
│   └── <feature>/
│       ├── index.ts        ← PUBLIC API BOUNDARY
│       ├── components/
│       ├── store/
│       ├── services/
│       └── types/
├── hooks/
├── layouts/
├── locales/
├── mocks/
├── services/
├── store/
├── types/
└── utils/
```

**Rule**: Do not add new top-level folders to `src/` without an ADR.

### 2. Architecture Decision Records (ADRs)

All 4 foundation ADRs are frozen:

- **ADR-0001**: Feature-Sliced Domain Architecture
- **ADR-0002**: Timeline Reference Architecture
- **ADR-0003**: Event-Driven Communication
- **ADR-0004**: Separation of Project & Runtime State

**Rule**: ADRs may be superseded by a new ADR, not edited in place.

### 3. Coding Standards (`docs/standards/`)

All 7 standard documents are frozen:

- `architecture.md` — Public API boundaries, import rules
- `folder.md` — Folder naming conventions
- `git.md` — Branch strategy, commit format
- `naming.md` — File, variable, component naming
- `react.md` — React patterns and hooks rules
- `testing.md` — Testing strategy and patterns
- `typescript.md` — TypeScript strictness rules

**Rule**: No amendments without Tech Lead review.

### 4. Config Service (`src/core/config/`)

The `ConfigService` API is frozen. Features must access environment variables only through it.

**Rule**: Do not add new environment variable access outside of ConfigService.

### 5. Logger (`src/core/logger/`)

The Logger interface, transports (Console, Memory, Remote, File), and usage patterns are frozen.

**Rule**: Do not add `console.log` directly. Use `appLogger` or a scoped logger.

### 6. CI Pipeline (`.github/workflows/ci.yml`)

The CI steps are frozen:

1. Type Check
2. Lint
3. Unit Test + Coverage
4. Storybook Build
5. Application Build

**Rule**: No CI steps may be removed. New steps may be added only with Tech Lead approval.

### 7. Testing Strategy

The 3-tier testing pyramid is frozen:

- Tier 1: Vitest (unit + component)
- Tier 2: Playwright (E2E)
- Tier 3: Storybook (visual)

**Rule**: No testing tool replacements without ADR.

### 8. Storybook Configuration (`.storybook/`)

The Storybook configuration, addons, and story patterns are frozen.

**Rule**: Do not add or remove Storybook addons without Tech Lead review.

### 9. Dependency Rules (ESLint `import/no-restricted-paths`)

The import boundary rules are frozen:

- Features must only be imported via their `index.ts`
- No direct imports from another feature's `components/`, `store/`, `services/`, `core/`
- Core must not depend on features

**Rule**: These ESLint rules must not be disabled or weakened.

---

## What Is NOT Frozen

The following are free to change as features are built:

- Feature implementations within `src/features/<feature>/`
- New features added to `src/features/`
- Tests, stories, mock data within features
- `docs/` content (documentation can always be improved)

---

## Exception Process

**To change a frozen component:**

1. **Propose** — Create a new ADR document in `docs/adr/`
   - Use the next sequential number (e.g., `0005-<short-title>.md`)
   - Document: Context, Decision, Consequences
2. **Review** — Submit for Tech Lead review (minimum 2 business days)
3. **Approve** — Tech Lead approves and merges the ADR
4. **Implement** — Only after ADR is merged to `main`

**No exception** — If the change is not justified by an approved ADR, the PR will be rejected during review.

---

## Enforcement

| Method                                | What it enforces                      |
| ------------------------------------- | ------------------------------------- |
| ESLint (`import/no-restricted-paths`) | Public API boundaries                 |
| ESLint (`import/no-cycle`)            | No circular dependencies              |
| TypeScript strict mode                | Type safety                           |
| CI Quality Gate                       | All checks must pass                  |
| PR Review                             | Human review of architectural changes |
| This document                         | Awareness and process                 |
