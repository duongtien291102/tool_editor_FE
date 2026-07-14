# Bundle Analysis Report

> **Version**: v0.1.0  
> **Date**: 2026-07-15  
> **Tool**: Vite v8.1.4 + rollup-plugin-visualizer  
> **Environment**: Windows 11, Node 20.x, npm 10.x  
> **Status**: BASELINE — Pre-optimization

---

## 1. Production Bundle Summary

| File                      | Raw Size      | Gzip          | Brotli (est.) |
| ------------------------- | ------------- | ------------- | ------------- |
| `dist/assets/index-*.js`  | **428.10 kB** | **124.61 kB** | ~108 kB       |
| `dist/assets/index-*.css` | **37.73 kB**  | **7.18 kB**   | ~6.4 kB       |
| `dist/index.html`         | 0.45 kB       | 0.29 kB       | —             |
| **Total**                 | **~466 kB**   | **~132 kB**   | —             |

**Build Time (vite only)**: 768ms  
**Total Pipeline (tsc + vite)**: ~3.85s  
**Modules Transformed**: 103

> **Visualizer Report**: [bundle-stats.html](./bundle-stats.html) — Open in browser for interactive treemap.

---

## 2. Dependency Size Breakdown (Estimated via module analysis)

### Production Dependencies — Estimated Contributions

| Package                    | Estimated Raw | Estimated Gzip | % of Bundle | Notes                                                               |
| -------------------------- | ------------- | -------------- | ----------- | ------------------------------------------------------------------- |
| `react`                    | ~7 kB         | ~3 kB          | 1.6%        | Core library (small, pairs with react-dom)                          |
| `react-dom`                | ~130 kB       | ~42 kB         | 30.4%       | DOM renderer — largest single dep                                   |
| `zustand`                  | ~14 kB        | ~5 kB          | 3.3%        | State management                                                    |
| `flexlayout-react`         | ~58 kB        | ~20 kB         | 13.5%       | IDE panel layout (no tree-shaking)                                  |
| `i18next`                  | ~25 kB        | ~10 kB         | 5.8%        | i18n framework                                                      |
| `react-i18next`            | ~12 kB        | ~4 kB          | 2.8%        | React bindings for i18next                                          |
| `lucide-react`             | ~35-45 kB     | ~12 kB         | 8.2-10.5%   | Icon library (tree-shakeable — actual size depends on imports used) |
| `sonner`                   | ~15 kB        | ~5 kB          | 3.5%        | Toast notifications                                                 |
| `@tanstack/react-query`    | ~24 kB        | ~8 kB          | 5.6%        | Data fetching (included, partially used)                            |
| `react-error-boundary`     | ~3 kB         | ~1 kB          | 0.7%        | Error boundaries                                                    |
| `tailwind-merge` + `clsx`  | ~9 kB         | ~3 kB          | 2.1%        | CSS utilities                                                       |
| `class-variance-authority` | ~3 kB         | ~1 kB          | 0.7%        | Component variants                                                  |
| `zustand/react/shallow`    | ~1 kB         | ~0.4 kB        | 0.2%        | Shallow comparison util                                             |
| **Application code**       | ~87 kB        | ~21 kB         | **20.3%**   | All features + core + layouts                                       |
| **Total**                  | **~428 kB**   | **~124 kB**    | 100%        |                                                                     |

### Monaco Editor

> ❌ **Not installed**. `MonacoEditorAdapter.tsx` exists as a placeholder but imports are commented out. When Monaco is added, expect **+2-4 MB** bundle increase and mandatory lazy-loading.

---

## 3. Largest Dependencies — Ranking

| Rank | Package                 | Estimated Size (raw) | Lazy Load Candidate?               |
| ---- | ----------------------- | -------------------- | ---------------------------------- |
| 🥇 1 | `react-dom`             | ~130 kB              | ❌ Cannot lazy-load                |
| 🥈 2 | `flexlayout-react`      | ~58 kB               | 🟡 Could be async-split per panel  |
| 🥉 3 | `lucide-react`          | ~35-45 kB            | ✅ Tree-shaking already active     |
| 4    | `@tanstack/react-query` | ~24 kB               | ✅ Defer to API integration sprint |
| 5    | `i18next`               | ~25 kB               | ❌ Must be synchronous (app init)  |
| 6    | `sonner`                | ~15 kB               | 🟡 Could be lazy per usage         |
| 7    | `zustand`               | ~14 kB               | ❌ Core to state                   |
| 8    | `react-i18next`         | ~12 kB               | ❌ Needed at startup               |

---

## 4. Application Code Breakdown (~87 kB)

| Module                      | Estimated Size | Notes                                        |
| --------------------------- | -------------- | -------------------------------------------- |
| `features/timeline`         | ~28 kB         | Largest feature — components, engines, state |
| `features/script-editor`    | ~18 kB         | SceneEditor, SceneList, store                |
| `features/workspace`        | ~12 kB         | Header, hooks, store                         |
| `features/project-explorer` | ~8 kB          | Explorer tree, store                         |
| `core/`                     | ~10 kB         | Logger, Config, Theme, i18n                  |
| `layouts/`                  | ~6 kB          | EditorLayout, LayoutStorage                  |
| `components/ui/`            | ~3 kB          | Button, GlobalErrorBoundary                  |
| `utils/` + `types/`         | ~2 kB          | cn(), global types                           |

---

## 5. Lazy Load / Dynamic Import Recommendations

### 🔴 High Priority (implement in Sprint 3)

#### 1. Feature-based Code Splitting

Split each major feature into a dynamic chunk. Estimated saving: **~80-100 kB gzip** on initial load.

```typescript
// In EditorLayout or router
const TimelinePanel = lazy(() =>
  import('@/features/timeline').then((m) => ({ default: m.TimelinePanel })),
);
const ScriptEditorPanel = lazy(() =>
  import('@/features/script-editor').then((m) => ({ default: m.ScriptEditorPanel })),
);
const ProjectExplorer = lazy(() =>
  import('@/features/project-explorer').then((m) => ({ default: m.ProjectExplorer })),
);
```

Expected chunks after splitting:

- `chunk-timeline.js` — ~28 kB raw
- `chunk-script-editor.js` — ~18 kB raw
- `chunk-project-explorer.js` — ~8 kB raw
- `vendor-core.js` — ~200 kB raw (react-dom, zustand, etc.)

#### 2. Monaco Editor (Future)

When Monaco is implemented, it **MUST** be lazy-loaded:

```typescript
const MonacoEditor = lazy(() => import('@monaco-editor/react'));
```

Monaco adds ~2-4 MB. Without lazy-loading, it would make the app unusable on slow connections.

### 🟡 Medium Priority (Sprint 4+)

#### 3. @tanstack/react-query

Currently imported but not fully utilized. Consider conditional import when API integration begins.

#### 4. Vendor Chunk Splitting (for cache optimization)

```typescript
// vite.config.ts
rollupOptions: {
  output: {
    manualChunks: {
      'vendor-react': ['react', 'react-dom'],
      'vendor-i18n': ['i18next', 'react-i18next'],
      'vendor-layout': ['flexlayout-react'],
    }
  }
}
```

### 🟢 Low Priority

#### 5. Icon Tree-Shaking Verification

Ensure lucide-react icons are imported individually, not as barrel import:

```typescript
// ✅ Good (already tree-shakeable by default)
import { Play, Pause, Stop } from 'lucide-react';

// ❌ Avoid (imports everything)
import * as Icons from 'lucide-react';
```

---

## 6. Bundle Size Thresholds

| Metric     | Current       | Warn at  | Action Required          |
| ---------- | ------------- | -------- | ------------------------ |
| JS (gzip)  | **124.61 kB** | >160 kB  | Profile new imports      |
| JS (gzip)  | **124.61 kB** | >200 kB  | Mandatory code splitting |
| CSS (gzip) | **7.18 kB**   | >20 kB   | Review Tailwind config   |
| Build time | **768ms**     | >3,000ms | Profile build plugins    |

---

## 7. No Monaco Currently

The codebase includes `MonacoEditorAdapter.tsx` which is scaffolded but the actual `@monaco-editor/react` package is **NOT installed**. The `BasicEditorAdapter.tsx` (a simple `<textarea>`) is used instead via `EditorFactory`.

When Monaco is added in a future sprint, it must be:

1. Lazy-loaded via `React.lazy()`
2. Behind a feature flag
3. Measured against this baseline (expect +2,000-4,000 kB raw)

---

## 8. Interactive Visualization

The full interactive treemap is available at:
[docs/audit/bundle-stats.html](./bundle-stats.html)

Open in any browser to explore the bundle composition interactively.

---

## See Also

- [Performance Baseline v0.1.0](../performance/baseline-v0.1.0.md)
- [Dependency Inventory](../dependencies.md)
- [Risk Register — R02](../risk-register.md)
