# Local Development Runbook

> **Status**: FROZEN (Engineering Foundation Sprint)  
> **Last Updated**: 2026-07-15  
> **Owner**: Tech Lead

---

## Prerequisites

| Tool    | Minimum Version | Notes                             |
| ------- | --------------- | --------------------------------- |
| Node.js | `>= 20.x`       | Use nvm or fnm to manage versions |
| npm     | `>= 10.x`       | Bundled with Node 20              |
| Git     | `>= 2.39`       | For hooks via Husky               |
| VS Code | Latest          | Recommended IDE                   |

---

## First-Time Setup

### 1. Clone the Repository

```bash
git clone https://github.com/<org>/tool_editor_fe.git
cd tool_editor_fe
```

### 2. Install Dependencies

```bash
npm install --legacy-peer-deps
```

> **Why `--legacy-peer-deps`?**  
> Some Storybook and ESLint plugins have strict peer constraints. This flag allows co-installation without error. See [troubleshooting.md](./troubleshooting.md) for details.

### 3. Configure Environment Variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in any required `VITE_*` variables. All client-facing environment variables **must** be prefixed with `VITE_`.

> **Do NOT** access `import.meta.env` directly in business logic. Always go through `ConfigService` (`src/core/config/`).

### 4. Install Playwright Browsers (First Time Only)

```bash
npx playwright install --with-deps
```

---

## Daily Development Workflow

### Start the App

```bash
npm run dev
```

- Opens Vite development server at `http://localhost:5173`
- Hot Module Replacement (HMR) is active

### Start Storybook (UI Component Isolation)

```bash
npm run storybook
```

- Opens at `http://localhost:6006`
- Use Storybook to develop and verify UI components in isolation **before** integrating them into the app

### Run All Tests (Quick Check)

```bash
npm run test
```

### Run E2E Tests

```bash
npm run test:e2e
```

### Run Lint

```bash
npm run lint
```

### Type Check

```bash
npx tsc -b
```

---

## Git Workflow

### Branch Strategy

- **`main`**: Protected. Direct pushes are forbidden. Only PRs allowed.
- **`feature/<name>`**: All new feature work.
- **`fix/<name>`**: Bug fixes.
- **`chore/<name>`**: Build, config, documentation changes.
- **`refactor/<name>`**: Code refactoring without behavior change.

### Commit Message Format (Conventional Commits)

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Examples:**

```
feat(timeline): add clip drag-and-drop support
fix(workspace): resolve panel resize flicker
chore(ci): upgrade Node to 20.x
docs(runbooks): add local-development guide
```

**Allowed types:** `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `style`, `perf`

---

## Pre-Commit Gates

Husky automatically runs `lint-staged` before every commit:

- **ESLint + Oxlint** on staged `.ts/.tsx` files
- **Prettier** on staged files
- **commitlint** on the commit message

> If any gate fails, the commit is blocked. Fix the errors and recommit.

---

## Feature Generation

To scaffold a new feature with the correct folder structure:

```bash
npm run gen:feature
```

Follow the prompts. This generates the `src/features/<name>/` folder with `index.ts`, `components/`, `store/`, `services/`, `types/`.

---

## Architecture Rules (MUST READ)

1. **Public API only**: Features communicate **only** through `index.ts`. Never import from `components/`, `store/`, `services/`, or `core/` of another feature.
2. **Core is shared infrastructure**: `src/core/` provides Logger, ConfigService, EventBus, ThemeProvider. Do not add business logic here.
3. **No circular imports**: Enforced by ESLint `import/no-cycle`.
4. **Freezed Foundation**: Folder structure, ADRs, coding standards, CI config, Logger, Config, Storybook, and dependency rules are **FROZEN**. Any change requires a new ADR approved by Tech Lead.

---

## Recommended VS Code Extensions

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-playwright.playwright",
    "vitest.explorer"
  ]
}
```

---

## See Also

- [testing-guide.md](./testing-guide.md)
- [troubleshooting.md](./troubleshooting.md)
- [release-process.md](./release-process.md)
- [Architecture Docs](../ARCHITECTURE.md)
