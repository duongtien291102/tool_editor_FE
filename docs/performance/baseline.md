# Performance Baseline

> **Status**: OFFICIAL BASELINE — Engineering Foundation Sprint  
> **Date Recorded**: 2026-07-15  
> **Environment**: Local (Node 20.x, Windows 11, npm 10.x)  
> **Recorded By**: Tech Lead  
> **Freeze**: This baseline is FROZEN. Any deviation > 20% in future sprints requires investigation.

---

## ⚠️ Important Note

These metrics are recorded as the Engineering Foundation baseline. Future sprints must not regress these metrics without documented justification.

---

## 1. Application Build (Vite Production)

| Metric                        | Value       | Gzip      |
| ----------------------------- | ----------- | --------- |
| **Total Build Time**          | ~850ms      | —         |
| **JS Bundle (index.js)**      | 428.10 kB   | 124.61 kB |
| **CSS Bundle (index.css)**    | 37.44 kB    | 7.14 kB   |
| **Total Modules Transformed** | 103 modules | —         |
| **HTML**                      | 0.45 kB     | 0.29 kB   |

**Command**: `npm run build`

### Largest Bundle Contributors

- React + React-DOM: ~140 kB
- flexlayout-react (IDE layout): ~60 kB
- lucide-react (icons): ~45 kB (tree-shakeable)
- zustand (state management): ~15 kB
- i18next + react-i18next: ~30 kB
- tailwind-merge + clsx + class-variance-authority: ~8 kB

> **Note**: No code splitting is configured yet. All features are bundled into a single chunk. This is baseline behavior — code splitting per feature route is planned (Technical Debt TD-02 mitigation).

---

## 2. Type Check

| Metric               | Value |
| -------------------- | ----- |
| **tsc -b execution** | ~1.0s |

**Command**: `npx tsc -b`

---

## 3. Lint

| Metric               | Value |
| -------------------- | ----- |
| **ESLint execution** | ~2.5s |
| **Oxlint execution** | ~0.3s |

**Command**: `npm run lint`

---

## 4. Unit Tests (Vitest)

| Metric                  | Value    |
| ----------------------- | -------- |
| **Total Duration**      | 5.78s    |
| **Transform time**      | 1.85s    |
| **Setup time**          | 1.18s    |
| **Import time**         | 1.85s    |
| **Test execution time** | 308ms    |
| **Test Files**          | 3 passed |
| **Tests**               | 9 passed |

**Command**: `npm run test`

> **Known Issue**: `storybook (chromium)` test suite fails due to `aria-query` incompatibility with `@storybook/addon-vitest`. Core test suites (Logger, ClipEngine, Button) pass. This is tracked as a known issue in [troubleshooting.md](../runbooks/troubleshooting.md#issue-3).

---

## 5. Storybook Build

| Metric                        | Value                         |
| ----------------------------- | ----------------------------- |
| **Build Time**                | **3.58s**                     |
| **Total Modules Transformed** | 1920 modules                  |
| **iframe.js (main bundle)**   | 1,140.64 kB (gzip: 325.78 kB) |
| **axe (a11y)**                | 579.35 kB (gzip: 158.44 kB)   |
| **Status**                    | ✅ Completed successfully     |

**Command**: `npm run build-storybook`

> Storybook static build time varies significantly based on component count. Will be updated when complete.

---

## 6. E2E Tests (Playwright)

| Metric             | Value                    |
| ------------------ | ------------------------ |
| **Execution Time** | ~3.5s (smoke tests only) |
| **Test Files**     | To be defined            |

**Command**: `npm run test:e2e`

> E2E tests are in early setup phase. Full E2E suite timing will be established when critical user flows are implemented.

---

## 7. CI Pipeline (GitHub Actions - Estimated)

| Step                  | Estimated Time |
| --------------------- | -------------- |
| Checkout + Setup Node | ~30s           |
| npm ci                | ~60-90s        |
| Type Check            | ~10s           |
| Lint                  | ~15s           |
| Unit Test + Coverage  | ~30s           |
| Storybook Build       | ~120s          |
| App Build             | ~30s           |
| **Total CI**          | **~5-6 min**   |

---

## 8. Regression Thresholds

| Metric             | Baseline | Warn at | Fail at |
| ------------------ | -------- | ------- | ------- |
| JS Bundle (gzip)   | 124 kB   | >150 kB | >200 kB |
| Build Time         | 850ms    | >2s     | >5s     |
| Unit Test Duration | 308ms    | >1s     | >3s     |
| Type Check         | ~1.0s    | >5s     | >10s    |

---

## Comparison History

| Date       | Sprint                 | JS Bundle (gzip) | Build Time | Notes       |
| ---------- | ---------------------- | ---------------- | ---------- | ----------- |
| 2026-07-15 | Engineering Foundation | **124.61 kB**    | **850ms**  | 🏁 Baseline |

_This table will be updated at the end of each sprint._
