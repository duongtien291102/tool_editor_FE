# Performance Baseline — v0.1.0

> **Version**: v0.1.0 — Engineering Foundation (FROZEN)  
> **Date Recorded**: 2026-07-15  
> **Environment**: Windows 11, Node 20.x, npm 10.x  
> **Status**: OFFICIAL FROZEN BASELINE  
> **Recorded By**: Engineering Foundation Sprint

---

> ⚠️ **This baseline is frozen at v0.1.0. Any future sprint that deviates more than 20% from these numbers must investigate and document the cause.**

---

## 1. Build Pipeline — Measured Values

### 1.1 Application Build (Vite)

| Metric                          | Value      | Notes                           |
| ------------------------------- | ---------- | ------------------------------- |
| **Vite build time**             | **768ms**  | Measured: `✓ built in 768ms`    |
| **Total pipeline (tsc + vite)** | **~3.85s** | Includes TypeScript compilation |
| **Modules transformed**         | 103        | All source + dependencies       |

### 1.2 TypeScript Check

| Metric                    | Value     | Notes                                          |
| ------------------------- | --------- | ---------------------------------------------- |
| **tsc -b execution time** | **3.57s** | Full type check from clean cache               |
| **Errors**                | **0**     | ✅ Clean                                       |
| **Strict mode**           | ON        | `noUnusedLocals`, `noUnusedParameters` enabled |

### 1.3 ESLint

| Metric                    | Value      | Notes                                         |
| ------------------------- | ---------- | --------------------------------------------- |
| **ESLint execution time** | **23.94s** | Includes all import rules + TypeScript ESLint |
| **Warnings**              | 0          | ✅ Clean                                      |
| **Errors**                | 0          | ✅ Clean                                      |

> **Note**: 23.94s lint time is higher than expected. Likely due to `eslint-plugin-import` resolving all module graphs on Windows. Investigate `eslint-plugin-import` caching options in future sprint.

### 1.4 Storybook Build

| Metric                  | Value                 | Notes                                 |
| ----------------------- | --------------------- | ------------------------------------- |
| **Build time**          | **3.58s**             | ✅ Completed successfully             |
| **Modules transformed** | 1,920                 | Full Storybook + all stories + addons |
| **iframe.js (preview)** | 1,140 kB gzip: 325 kB | Expected for Storybook                |
| **Status**              | ✅ PASS               |                                       |

---

## 2. Test Suite — Measured Values

### 2.1 Vitest Unit Tests

| Metric                  | Value     | Notes                                  |
| ----------------------- | --------- | -------------------------------------- |
| **Total duration**      | **5.48s** | Full test run including setup          |
| **Transform time**      | 2.81s     | Vite transform overhead                |
| **Setup time**          | 708ms     | Test environment initialization        |
| **Import time**         | 3.83s     | Module loading                         |
| **Test execution time** | **290ms** | Actual test code runtime               |
| **Test files passed**   | 3         | Logger, Button, ClipEngine             |
| **Tests passed**        | 9         | All unit tests ✅                      |
| **Failed suites**       | 1         | Storybook Chromium (known: aria-query) |

**Test files:**

- `src/core/logger/Logger.spec.ts` — 3 tests, 24ms
- `src/components/ui/Button.spec.tsx` — 5 tests, 263ms
- `src/features/timeline/core/engines/ClipEngine.spec.ts` — 1 test, 5ms

### 2.2 Playwright E2E

| Metric     | Value                | Notes                                 |
| ---------- | -------------------- | ------------------------------------- |
| **Status** | Not configured       | E2E test suite pending implementation |
| **Target** | <30s for smoke suite | To be established in Sprint 3         |

---

## 3. Bundle Size — Measured Values

### 3.1 JavaScript

| Metric                 | Value                       |
| ---------------------- | --------------------------- |
| **Raw**                | 428.10 kB                   |
| **Gzip**               | **124.61 kB**               |
| **Brotli (estimated)** | ~108 kB                     |
| **Single bundle**      | Yes (no code splitting yet) |

### 3.2 CSS

| Metric   | Value       |
| -------- | ----------- |
| **Raw**  | 37.73 kB    |
| **Gzip** | **7.18 kB** |

### 3.3 Vendor vs Application Split

| Category              | Estimated Raw | %      |
| --------------------- | ------------- | ------ |
| Vendor (node_modules) | ~341 kB       | ~79.7% |
| Application code      | ~87 kB        | ~20.3% |

---

## 4. Memory Usage

| Context                  | Value                      | Notes                       |
| ------------------------ | -------------------------- | --------------------------- |
| Dev server (npm run dev) | ~85-110 MB Node heap       | Vite HMR + dev transforms   |
| Production build process | ~200-250 MB peak Node heap | During tsc + vite build     |
| Browser (app loaded)     | ~35-50 MB RAM              | Measured in Chrome DevTools |
| Storybook dev            | ~300-400 MB Node heap      | Heavy addon processing      |

> Memory measured via Windows Task Manager during build. Exact values vary by system state.

---

## 5. Regression Thresholds

| Metric                   | v0.1.0 Baseline | ⚠️ Warn (>20%) | 🔴 Fail (>50%) |
| ------------------------ | --------------- | -------------- | -------------- |
| JS bundle (gzip)         | 124.61 kB       | >149 kB        | >187 kB        |
| CSS bundle (gzip)        | 7.18 kB         | >8.6 kB        | >10.8 kB       |
| Vite build time          | 768ms           | >922ms         | >1,152ms       |
| Full pipeline (tsc+vite) | 3.85s           | >4.62s         | >5.78s         |
| Vitest total             | 5.48s           | >6.58s         | >8.22s         |
| Vitest test execution    | 290ms           | >348ms         | >435ms         |
| TSC check                | 3.57s           | >4.28s         | >5.36s         |
| Storybook build          | 3.58s           | >4.30s         | >5.37s         |
| Tests passing            | 9/9             | —              | <9 = BLOCK     |

---

## 6. Baseline Comparison History

| Sprint         | Date           | JS (gzip)     | Vite Build | TSC       | Vitest (tests) | Tests   |
| -------------- | -------------- | ------------- | ---------- | --------- | -------------- | ------- |
| Eng Foundation | **2026-07-15** | **124.61 kB** | **768ms**  | **3.57s** | **290ms**      | **9/9** |

_This table will be updated at the end of each sprint._

---

## 7. Known Issues at Baseline

| Issue                         | Impact on Metrics                   | Tracking                      |
| ----------------------------- | ----------------------------------- | ----------------------------- |
| ESLint takes 23.94s           | High lint time in CI                | R03, investigate caching      |
| Storybook chromium test fails | 1 test suite fails (non-blocking)   | R03 (aria-query)              |
| No E2E tests                  | Playwright timing N/A               | Planned Sprint 3              |
| No code splitting             | All features in single 428kB bundle | R02, planned Sprint 3         |
| No Monaco                     | Not in bundle yet                   | Future +2-4 MB mandatory lazy |

---

## 8. Measurement Commands (Reproducible)

```powershell
# TypeScript check
$start = Get-Date; npx tsc -b; Write-Host "TSC: $((Get-Date) - $start)"

# ESLint
$start = Get-Date; npm run lint; Write-Host "Lint: $((Get-Date) - $start)"

# Vite build
npm run build

# Vitest
npx vitest run

# Storybook build
npm run build-storybook

# Bundle analysis (with visualizer)
npx vite build --config vite.analyze.ts
# Then open docs/audit/bundle-stats.html
```
