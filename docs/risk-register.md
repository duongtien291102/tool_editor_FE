# Risk Register

> **Status**: ACTIVE  
> **Last Updated**: 2026-07-15  
> **Owner**: Tech Lead  
> **Review Cadence**: Every sprint retrospective

---

## Risk Severity Matrix

```
         │ LOW Impact │ MEDIUM Impact │ HIGH Impact │ CRITICAL Impact
─────────┼────────────┼───────────────┼─────────────┼────────────────
HIGH Prob│            │    MONITOR    │   MITIGATE  │    ESCALATE
MED Prob │            │    TRACK      │   MITIGATE  │    MITIGATE
LOW Prob │    ACCEPT  │    ACCEPT     │    TRACK    │    MITIGATE
```

---

## Active Risks

### R01 — Feature Cross-Import Circular Dependencies

| Field             | Value                                                                                                                                                                                                             |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**            | R01                                                                                                                                                                                                               |
| **Category**      | Architecture                                                                                                                                                                                                      |
| **Description**   | Features importing from each other's internal modules (`components/`, `store/`, `core/`) creates tight coupling and circular dependency chains. As the codebase grows, this becomes undetectable without tooling. |
| **Impact**        | HIGH — circular deps cause cryptic runtime errors, break tree-shaking, and make refactoring very expensive                                                                                                        |
| **Probability**   | MEDIUM — teams naturally take shortcuts under deadline pressure                                                                                                                                                   |
| **Status**        | 🟡 MITIGATED (ongoing)                                                                                                                                                                                            |
| **Mitigation**    | ESLint `import/no-restricted-paths` enforces Public API-only imports. `import/no-cycle` detects cycles. CI blocks all PRs with violations.                                                                        |
| **Owner**         | Tech Lead                                                                                                                                                                                                         |
| **ADR Reference** | ADR-0001                                                                                                                                                                                                          |

---

### R02 — Bundle Size Regression

| Field             | Value                                                                                                                                                                                                                  |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**            | R02                                                                                                                                                                                                                    |
| **Category**      | Performance                                                                                                                                                                                                            |
| **Description**   | As features grow and new libraries are added, the single-bundle JS can balloon significantly, degrading initial load time for users. Current baseline: 428KB (124KB gzip).                                             |
| **Impact**        | MEDIUM — slower initial load, poor UX on low-bandwidth connections                                                                                                                                                     |
| **Probability**   | HIGH — each new feature/library adds to the bundle                                                                                                                                                                     |
| **Status**        | 🟡 TRACKED                                                                                                                                                                                                             |
| **Mitigation**    | (1) Bundle size is tracked in [baseline.md](./performance/baseline.md). (2) Warn threshold: >150KB gzip. (3) Planned: route-based code splitting per feature. (4) Review `dependencies.md` before adding new packages. |
| **Owner**         | Frontend Team                                                                                                                                                                                                          |
| **ADR Reference** | —                                                                                                                                                                                                                      |

---

### R03 — React 19 Ecosystem Compatibility

| Field             | Value                                                                                                                                                                                                                                                                             |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**            | R03                                                                                                                                                                                                                                                                               |
| **Category**      | Dependency                                                                                                                                                                                                                                                                        |
| **Description**   | React 19 is relatively new. Some libraries (especially Storybook addons, testing utilities) have strict peer dependency constraints and may break on minor updates. Evidence: `aria-query` incompatibility with `@storybook/addon-vitest`.                                        |
| **Impact**        | HIGH — broken CI gates or testing infrastructure blocks the entire team                                                                                                                                                                                                           |
| **Probability**   | LOW-MEDIUM — will decrease as ecosystem matures                                                                                                                                                                                                                                   |
| **Status**        | 🔴 ACTIVE (known `aria-query` issue)                                                                                                                                                                                                                                              |
| **Mitigation**    | (1) `--legacy-peer-deps` documented as standard install flag. (2) Lock versions in `package.json` with `~` patch pinning for critical tools. (3) Monitor monthly changelogs for `@storybook/*` and `@testing-library/*`. (4) Isolate Storybook test issues from unit tests in CI. |
| **Owner**         | Tech Lead                                                                                                                                                                                                                                                                         |
| **ADR Reference** | —                                                                                                                                                                                                                                                                                 |

---

### R04 — Timeline State Performance Bottleneck

| Field             | Value                                                                                                                                                                                                                                           |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**            | R04                                                                                                                                                                                                                                             |
| **Category**      | Performance                                                                                                                                                                                                                                     |
| **Description**   | As timelines grow to 100+ clips across 20+ tracks, naive Zustand store subscriptions will cause excessive re-renders across the entire timeline component tree. No virtualization is in place.                                                  |
| **Impact**        | HIGH — UI becomes unresponsive with real-world project sizes                                                                                                                                                                                    |
| **Probability**   | MEDIUM — will manifest once real project data is integrated                                                                                                                                                                                     |
| **Status**        | 🟡 DEFERRED (to Feature Sprint)                                                                                                                                                                                                                 |
| **Mitigation**    | (1) Use granular Zustand selectors (never subscribe to entire store). (2) Implement `react-window` or custom virtualization for track rows. (3) Use `useMemo` / `React.memo` on Clip and Track renderers. (4) Technical Debt TD-05 tracks this. |
| **Owner**         | Core UI Team                                                                                                                                                                                                                                    |
| **ADR Reference** | ADR-0004                                                                                                                                                                                                                                        |

---

### R05 — E2E Test Flakiness

| Field             | Value                                                                                                                                                                                                                                                                                   |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**            | R05                                                                                                                                                                                                                                                                                     |
| **Category**      | Quality                                                                                                                                                                                                                                                                                 |
| **Description**   | Playwright E2E tests that depend on animation timings, network responses, or system state can become unreliable (flaky), reducing trust in the test suite and causing pipeline instability.                                                                                             |
| **Impact**        | MEDIUM — false negatives erode team confidence; ignored tests provide no value                                                                                                                                                                                                          |
| **Probability**   | HIGH — any non-deterministic UI behavior will eventually cause flakiness                                                                                                                                                                                                                |
| **Status**        | 🟡 TRACKED                                                                                                                                                                                                                                                                              |
| **Mitigation**    | (1) Always use `data-testid` attributes instead of CSS selectors. (2) Use Playwright's `waitFor` and `expect` retry logic instead of fixed `sleep()`. (3) Isolate test data — E2E must not share state between tests. (4) Tag smoke tests to run separately from full regression suite. |
| **Owner**         | QA / Test Engineering                                                                                                                                                                                                                                                                   |
| **ADR Reference** | —                                                                                                                                                                                                                                                                                       |

---

### R06 — Architecture Drift Post-Freeze

| Field             | Value                                                                                                                                                                                                                                   |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**            | R06                                                                                                                                                                                                                                     |
| **Category**      | Process                                                                                                                                                                                                                                 |
| **Description**   | After the Engineering Foundation is frozen, future developers (especially new hires) may unknowingly modify frozen elements (folder structure, Logger, ConfigService, ADRs, CI) without following the ADR process.                      |
| **Impact**        | HIGH — breaks established conventions, creates inconsistency, increases maintenance cost                                                                                                                                                |
| **Probability**   | MEDIUM — new team members are unfamiliar with freeze policy                                                                                                                                                                             |
| **Status**        | 🟡 MITIGATED (ongoing)                                                                                                                                                                                                                  |
| **Mitigation**    | (1) FREEZE_POLICY.md documents what is frozen. (2) Runbooks in `docs/runbooks/` serve as onboarding for new members. (3) Architecture rules enforced in ESLint. (4) PR review checklist includes "does this change a frozen component?" |
| **Owner**         | Tech Lead                                                                                                                                                                                                                               |
| **ADR Reference** | ADR-0001                                                                                                                                                                                                                                |

---

### R07 — i18n Key Drift

| Field             | Value                                                                                                                                                                                                           |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**            | R07                                                                                                                                                                                                             |
| **Category**      | Maintainability                                                                                                                                                                                                 |
| **Description**   | As features are added, i18n translation keys may be defined in one locale file but missing from others, or used in code but never defined. This causes silent missing-text bugs.                                |
| **Impact**        | MEDIUM — silent UI regressions with missing text, especially in non-English locales                                                                                                                             |
| **Probability**   | MEDIUM — easy to forget when moving fast                                                                                                                                                                        |
| **Status**        | 🟡 TRACKED                                                                                                                                                                                                      |
| **Mitigation**    | (1) Each feature has its own locale namespace (e.g., `workspace`, `timeline`). (2) Future: add `i18next-scanner` to CI to detect missing keys. (3) Fallback strings defined inline as second argument to `t()`. |
| **Owner**         | Frontend Team                                                                                                                                                                                                   |
| **ADR Reference** | —                                                                                                                                                                                                               |

---

### R08 — Developer Onboarding Time

| Field             | Value                                                                                                                                                                                                             |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**            | R08                                                                                                                                                                                                               |
| **Category**      | Process                                                                                                                                                                                                           |
| **Description**   | Without proper documentation, new developers take 2-5 days to become productive. Missing runbooks force them to ask experienced team members repeatedly, reducing everyone's velocity.                            |
| **Impact**        | MEDIUM — indirect productivity loss; knowledge silos                                                                                                                                                              |
| **Probability**   | HIGH — will happen as team grows                                                                                                                                                                                  |
| **Status**        | 🟢 MITIGATED                                                                                                                                                                                                      |
| **Mitigation**    | Runbooks created in `docs/runbooks/`: `local-development.md`, `testing-guide.md`, `release-process.md`, `troubleshooting.md`. Architecture documented in `docs/ARCHITECTURE.md` and `docs/architecture-graph.md`. |
| **Owner**         | Tech Lead                                                                                                                                                                                                         |
| **ADR Reference** | —                                                                                                                                                                                                                 |

---

### R09 — Mock Data Divergence from Production API

| Field             | Value                                                                                                                                                                                                   |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**            | R09                                                                                                                                                                                                     |
| **Category**      | Quality                                                                                                                                                                                                 |
| **Description**   | MSW mock handlers and mock data may drift from the real API contract over time. Frontend features built against stale mocks will fail when integrated with the real backend.                            |
| **Impact**        | HIGH — integration testing failures discovered late                                                                                                                                                     |
| **Probability**   | MEDIUM — inevitable without contract testing                                                                                                                                                            |
| **Status**        | 🟡 TRACKED                                                                                                                                                                                              |
| **Mitigation**    | (1) Mock data shape is documented in feature `mock/data.ts` files. (2) Future: introduce OpenAPI contract testing (e.g., Pact) to sync mocks with backend spec. (3) Integration testing sprint planned. |
| **Owner**         | Frontend Team + Backend Team                                                                                                                                                                            |
| **ADR Reference** | —                                                                                                                                                                                                       |

---

## Closed Risks

| ID  | Description | Closed Date | Resolution |
| --- | ----------- | ----------- | ---------- |
| —   | —           | —           | —          |

---

## Risk Summary

| ID  | Category        | Impact | Probability | Status       |
| --- | --------------- | ------ | ----------- | ------------ |
| R01 | Architecture    | HIGH   | MEDIUM      | 🟡 Mitigated |
| R02 | Performance     | MEDIUM | HIGH        | 🟡 Tracked   |
| R03 | Dependency      | HIGH   | LOW-MED     | 🔴 Active    |
| R04 | Performance     | HIGH   | MEDIUM      | 🟡 Deferred  |
| R05 | Quality         | MEDIUM | HIGH        | 🟡 Tracked   |
| R06 | Process         | HIGH   | MEDIUM      | 🟡 Mitigated |
| R07 | Maintainability | MEDIUM | MEDIUM      | 🟡 Tracked   |
| R08 | Process         | MEDIUM | HIGH        | 🟢 Mitigated |
| R09 | Quality         | HIGH   | MEDIUM      | 🟡 Tracked   |

**Legend**: 🔴 Active Risk · 🟡 Tracked/Mitigated · 🟢 Resolved
