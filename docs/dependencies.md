# Dependency Inventory

> **Status**: FROZEN (Engineering Foundation Sprint)  
> **Date**: 2026-07-15  
> **Source**: `package.json` v0.1.0  
> **Owner**: Tech Lead  
> **Purpose**: Prevent duplicate packages. Any new package addition must be checked against this list first.

---

## Production Dependencies

| Package                    | Version (package.json) | Role                               | Reason for Usage                                                                                          | Replaceable?                                  | Notes                                                   |
| -------------------------- | ---------------------- | ---------------------------------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------- | ------------------------------------------------------- |
| `react`                    | `^19.2.7`              | Core UI Library                    | Industry-standard for component-based architecture. Concurrent rendering, server components.              | No                                            | Major version, breaking changes expected from ecosystem |
| `react-dom`                | `^19.2.7`              | DOM Rendering                      | Required peer of react for web targets                                                                    | No                                            | Must match react version                                |
| `zustand`                  | `^5.0.14`              | State Management                   | Lightweight (~3kB), fast, no boilerplate, selector-based subscriptions. Better than Redux for this scale. | Yes — Redux Toolkit, Jotai, Valtio            | Current global state solution                           |
| `@tanstack/react-query`    | `^5.101.2`             | Server State / Data Fetching       | Caching, background refetch, stale-while-revalidate. Separates server state from UI state.                | Yes — SWR                                     | Not fully used yet; reserved for future API integration |
| `flexlayout-react`         | `^0.9.2`               | IDE Panel Layout                   | Dockable, resizable panels like VS Code. No alternative offers same level of IDE-class layout.            | Yes — GoldenLayout, React Mosaic              | Critical for editor UX                                  |
| `lucide-react`             | `^1.24.0`              | Icon Library                       | Clean SVG icons, tree-shakeable, consistent design. 1000+ icons.                                          | Yes — Heroicons, Phosphor Icons, Tabler Icons | Large package; tree-shaking essential                   |
| `i18next`                  | `^26.3.6`              | i18n Framework                     | Multi-language support, namespace splitting, lazy loading.                                                | Yes — FormatJS / react-intl                   | Foundation language infra                               |
| `react-i18next`            | `^17.0.9`              | React bindings for i18next         | Official React integration for i18next.                                                                   | No (paired with i18next)                      | Must stay in sync with i18next version                  |
| `class-variance-authority` | `^0.7.1`               | Variant-based CSS Classes          | Type-safe component variants (e.g., Button: primary/secondary/ghost). Used by shadcn/ui pattern.          | Yes — tailwind-variants                       | Core to component API design                            |
| `clsx`                     | `^2.1.1`               | Conditional Class Merging          | Lightweight utility for conditional className logic.                                                      | Yes — cx from cva                             | Often paired with tailwind-merge                        |
| `tailwind-merge`           | `^3.6.0`               | Tailwind Class Conflict Resolution | Prevents duplicate/conflicting Tailwind classes (e.g., `p-2 p-4` → `p-4`).                                | No (required for Tailwind projects)           | Used in `cn()` utility                                  |
| `sonner`                   | `^2.0.7`               | Toast Notifications                | Minimal, beautiful toast library. Lightweight and accessible.                                             | Yes — react-hot-toast, react-toastify         | Used for user feedback                                  |
| `react-error-boundary`     | `^6.1.2`               | Error Boundaries                   | Declarative error catching for React subtrees. Prevents full app crash.                                   | Yes — manual ErrorBoundary class              | Best practice for production resilience                 |

---

## Development Dependencies

### Build Tooling

| Package                | Version   | Role                    | Reason                                    | Replaceable?                    |
| ---------------------- | --------- | ----------------------- | ----------------------------------------- | ------------------------------- |
| `vite`                 | `^8.1.1`  | Build Tool & Dev Server | Fastest HMR, native ESM, plugin ecosystem | Yes — esbuild, webpack (slower) |
| `@vitejs/plugin-react` | `^6.0.3`  | React support for Vite  | Babel-based React refresh, JSX transform  | No (pairs with Vite)            |
| `typescript`           | `~6.0.2`  | Type System             | 100% strict TypeScript required           | No                              |
| `postcss`              | `^8.5.19` | CSS Processing          | Required by Tailwind v4                   | No                              |
| `autoprefixer`         | `^10.5.3` | CSS Vendor Prefixing    | Cross-browser CSS compatibility           | Mostly no                       |
| `tailwindcss`          | `^4.3.2`  | Utility-First CSS       | Design system foundation, rapid styling   | Yes — UnoCSS, CSS Modules       |
| `@tailwindcss/postcss` | `^4.3.2`  | Tailwind PostCSS plugin | Required for Tailwind v4 integration      | No                              |

### Testing

| Package                      | Version   | Role                        | Reason                                              | Replaceable?                           |
| ---------------------------- | --------- | --------------------------- | --------------------------------------------------- | -------------------------------------- |
| `vitest`                     | `^4.1.10` | Unit/Component Testing      | Native Vite integration, ESM support, fast.         | Yes — Jest (slower with Vite)          |
| `@vitest/coverage-v8`        | `4.1.10`  | Code Coverage (V8)          | Native V8 coverage, no instrumentation overhead     | Yes — Istanbul                         |
| `@vitest/browser-playwright` | `4.1.10`  | Browser-mode Vitest         | Run component tests in real browser via Playwright  | No (paired with Playwright)            |
| `@testing-library/react`     | `^16.3.2` | Component Testing Utilities | Accessibility-first React rendering & queries       | No (de facto standard)                 |
| `@testing-library/jest-dom`  | `^6.9.1`  | DOM Matchers                | Custom matchers: `toBeInTheDocument`, `toBeVisible` | No (pairs with @testing-library/react) |
| `@playwright/test`           | `^1.61.1` | E2E Testing Framework       | Cross-browser, reliable, auto-wait                  | Yes — Cypress                          |
| `playwright`                 | `^1.61.1` | Playwright Browser Engine   | Browser automation for E2E                          | No (pairs with @playwright/test)       |
| `jsdom`                      | `^29.1.1` | DOM Simulation              | Virtual DOM for unit tests without browser          | Yes — happy-dom                        |
| `msw`                        | `^2.15.0` | Mock Service Worker         | Network-level API mocking, works in browser & Node  | Yes — miragejs (less realistic)        |

### Code Quality

| Package                           | Version   | Role                      | Reason                                               | Replaceable?                    |
| --------------------------------- | --------- | ------------------------- | ---------------------------------------------------- | ------------------------------- |
| `eslint`                          | `^10.7.0` | JavaScript Linter         | Standard JS/TS static analysis                       | No                              |
| `typescript-eslint`               | `^8.64.0` | TypeScript ESLint Rules   | TypeScript-aware linting                             | No (pairs with eslint)          |
| `@eslint/js`                      | `^10.7.0` | ESLint Core Rules         | Built-in rule set                                    | No                              |
| `eslint-plugin-import`            | `^2.32.0` | Import Order & Boundaries | Enforces public API, prevents circular deps          | No (critical for architecture)  |
| `eslint-plugin-unused-imports`    | `^4.4.1`  | Unused Import Detection   | Keeps codebase clean                                 | Yes — built-in noUnusedLocals   |
| `eslint-plugin-storybook`         | `^10.5.0` | Storybook-specific Rules  | Enforces Story patterns                              | No                              |
| `oxlint`                          | `^1.71.0` | Fast Secondary Linter     | Rust-based, 100x faster than ESLint for simple rules | Yes — not critical              |
| `prettier`                        | `^3.9.5`  | Code Formatter            | Auto-formatting, enforced in CI                      | Yes — dprint, biome             |
| `husky`                           | `^9.1.7`  | Git Hooks                 | Pre-commit quality gates                             | Yes — Lefthook                  |
| `lint-staged`                     | `^16.4.0` | Staged Files Linting      | Run lint only on changed files                       | No (pairs with husky)           |
| `@commitlint/cli`                 | `^20.5.3` | Commit Message Linting    | Enforce Conventional Commits                         | No                              |
| `@commitlint/config-conventional` | `^20.5.3` | Conventional Commit Rules | Shared rule config                                   | No (pairs with @commitlint/cli) |

### Storybook

| Package                    | Version   | Role                               | Reason                                           | Replaceable?          |
| -------------------------- | --------- | ---------------------------------- | ------------------------------------------------ | --------------------- |
| `storybook`                | `^10.5.0` | Component Catalog & Visual Testing | Isolated component development and documentation | Yes — Ladle (lighter) |
| `@storybook/react-vite`    | `^10.5.0` | Storybook + Vite integration       | Required for Vite-based projects                 | No                    |
| `@storybook/addon-docs`    | `^10.5.0` | MDX Documentation                  | Auto-generate component docs from stories        | No                    |
| `@storybook/addon-a11y`    | `^10.5.0` | Accessibility Checker              | axe-core integration for a11y in Storybook       | Yes — manual axe      |
| `@storybook/addon-vitest`  | `^10.5.0` | Vitest + Storybook Integration     | Run stories as Vitest tests                      | No                    |
| `@storybook/addon-mcp`     | `^0.7.0`  | MCP server for Storybook AI        | AI tooling integration                           | Yes — experimental    |
| `@chromatic-com/storybook` | `^5.2.1`  | Chromatic Visual Testing           | Visual regression CI                             | Yes — Percy           |

### Types

| Package            | Version    | Role                       |
| ------------------ | ---------- | -------------------------- |
| `@types/node`      | `^24.13.3` | Node.js type definitions   |
| `@types/react`     | `^19.2.17` | React type definitions     |
| `@types/react-dom` | `^19.2.3`  | React DOM type definitions |

---

## Dependency Decision Rules

Before adding a new package:

1. **Check this inventory** — does a package with this function already exist?
2. **Check bundle impact** — run `npm run build` and compare output size
3. **Check compatibility** — does it work with React 19, Vite 8, TypeScript 6?
4. **Document it** — add it to this table immediately
5. **Get ADR** — if it's a production dependency, create an ADR if it changes architecture

> **Adding a duplicate package is a P0 code review violation.**
