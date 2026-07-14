# Bundle Audit Report

> **Sprint**: Engineering Foundation (Final)  
> **Date**: 2026-07-15  
> **Tool**: Vite v8.1.4 (Rolldown bundler)  
> **Purpose**: This is the baseline audit. No optimization is performed in this sprint. Report establishes comparison baseline for future sprints.

---

## ⚠️ Status: BASELINE — Not Yet Optimized

This report records the **current state** of the bundle. Optimization is deferred to future sprints when features are implemented. Changes to the bundle baseline require documentation.

---

## 1. Application Bundle (`npm run build`)

### Build Output Summary

| File                      | Raw Size      | Gzip Size     |
| ------------------------- | ------------- | ------------- |
| `dist/index.html`         | 0.45 kB       | 0.29 kB       |
| `dist/assets/index-*.css` | **37.44 kB**  | **7.14 kB**   |
| `dist/assets/index-*.js`  | **428.10 kB** | **124.61 kB** |
| **Total**                 | **~466 kB**   | **~132 kB**   |

**Build Time**: 850ms  
**Modules Transformed**: 103

### Analysis

```
Single Bundle Composition (estimated)
─────────────────────────────────────
React + React-DOM       ~140 kB  (32.7%)
flexlayout-react         ~60 kB  (14.0%)  ← Largest single non-React dep
lucide-react             ~45 kB  (10.5%)  ← Tree-shakeable; will shrink as icons refined
i18next + react-i18next  ~35 kB  ( 8.2%)
sonner                   ~15 kB  ( 3.5%)
zustand                  ~15 kB  ( 3.5%)
tailwind-merge + clsx    ~ 8 kB  ( 1.9%)
@tanstack/react-query    ~25 kB  ( 5.8%)  ← Included but not heavily used yet
Application code         ~85 kB  (19.9%)  ← Features, components, core
─────────────────────────────────────
Total                   ~428 kB
```

### Largest Dependencies (by estimated contribution)

| Rank | Package                     | Estimated Size | Notes                                        |
| ---- | --------------------------- | -------------- | -------------------------------------------- |
| 1    | `react` + `react-dom`       | ~140 kB        | Cannot reduce                                |
| 2    | `flexlayout-react`          | ~60 kB         | Required for IDE layout                      |
| 3    | `lucide-react`              | ~45 kB         | Tree-shakeable — size will decrease          |
| 4    | `@tanstack/react-query`     | ~25 kB         | Partially used; may shrink with tree-shaking |
| 5    | `i18next` + `react-i18next` | ~35 kB         | Core to i18n requirement                     |

---

## 2. Storybook Bundle (`npm run build-storybook`)

### Build Output Summary

| File                      | Raw Size    | Gzip Size |
| ------------------------- | ----------- | --------- |
| `iframe.js` (preview app) | 1,140.64 kB | 325.78 kB |
| `axe.js` (a11y engine)    | 579.35 kB   | 158.44 kB |
| `components.js` (UI)      | 568.83 kB   | 181.19 kB |
| `DocsRenderer.js`         | 191.55 kB   | 60.73 kB  |
| `react-18.js`             | 182.56 kB   | 57.56 kB  |
| Others                    | ~175 kB     | ~62 kB    |

**Build Time**: 3.58s  
**Modules Transformed**: 1,920

> **Note**: Storybook bundle size is a dev/CI artifact and does not affect end-user performance. Large `iframe.js` is expected due to all stories, React DevTools, and test runner being included.

---

## 3. Vendor vs Application Split

| Category                  | Estimated Size (raw) | % of Bundle |
| ------------------------- | -------------------- | ----------- |
| **Vendor (node_modules)** | ~345 kB              | ~80.6%      |
| **Application code**      | ~83 kB               | ~19.4%      |

---

## 4. Optimization Opportunities (Future Sprints)

The following are identified **but not yet implemented** — these are documented as future work:

### High Priority

1. **Route-based Code Splitting**: Split features into dynamic chunks using `import()`. Expected saving: ~30-40% of initial bundle.
   - Timeline feature chunk
   - ScriptEditor feature chunk
   - ProjectExplorer feature chunk

2. **lucide-react Tree Shaking**: Ensure only used icons are imported. Estimated saving: ~15-20 kB.

   ```typescript
   // ❌ Not ideal (imports all icons)
   import { Play } from 'lucide-react';
   // ✅ Already tree-shakeable by default — verify no barrel imports
   ```

3. **@tanstack/react-query Deferral**: Package is included but not fully used. Consider lazy-loading when API integration begins.

### Medium Priority

4. **Vendor Chunk Splitting**: Split vendor code for better long-term caching.
5. **CSS Purging**: Ensure unused Tailwind utilities are purged in production.

### Low Priority

6. **Bundle Analyzer**: Add `rollup-plugin-visualizer` for detailed chunk visualization.

---

## 5. Baseline Thresholds

| Metric            | Current (Baseline) | Warn Threshold | Fail Threshold |
| ----------------- | ------------------ | -------------- | -------------- |
| JS Bundle (gzip)  | **124.61 kB**      | >150 kB        | >200 kB        |
| CSS Bundle (gzip) | **7.14 kB**        | >15 kB         | >30 kB         |
| Build Time        | **850ms**          | >2,000ms       | >5,000ms       |

---

## 6. Audit History

| Sprint                 | Date       | JS (gzip)     | CSS (gzip)  | Build Time | Notes                         |
| ---------------------- | ---------- | ------------- | ----------- | ---------- | ----------------------------- |
| Engineering Foundation | 2026-07-15 | **124.61 kB** | **7.14 kB** | **850ms**  | 🏁 Baseline — no optimization |

_This table is updated at the end of each sprint after running `npm run build`._

---

## See Also

- [Performance Baseline](./performance/baseline.md)
- [Dependency Inventory](./dependencies.md)
- [Risk Register](./risk-register.md) (R02 — Bundle Size Regression)
