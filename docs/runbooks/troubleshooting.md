# Troubleshooting Guide

> **Status**: FROZEN (Engineering Foundation Sprint)  
> **Last Updated**: 2026-07-15  
> **Owner**: Tech Lead

---

## Quick Diagnostic Commands

```bash
# Check Node and npm versions
node --version   # Should be >= 20.x
npm --version    # Should be >= 10.x

# Re-install all dependencies from scratch
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# Full CI simulation locally
npx tsc -b && npm run lint && npm run test && npm run build
```

---

## Issue 1: ESLint or TypeScript Errors Not Updating in IDE

**Symptom**: You fixed code, but the editor still shows red squiggles.

**Solution:**

1. Open VS Code Command Palette (`Ctrl+Shift+P`)
2. Run **"ESLint: Restart ESLint Server"**
3. Run **"TypeScript: Restart TS Server"**
4. Verify manually in terminal:

```bash
npx tsc -b --noEmit
npm run lint
```

---

## Issue 2: Dependency Conflicts (ERESOLVE)

**Symptom:**

```
npm error ERESOLVE unable to resolve dependency tree
```

**Cause**: Some `@storybook/*`, `eslint-plugin-*`, or `@vitest/*` packages have strict peer-dependency declarations that conflict.

**Solution:**

```bash
# Always use --legacy-peer-deps for this project
npm install <package> --legacy-peer-deps
```

> This is a known trade-off. See [ADR-0001](../adr/0001-feature-architecture.md) for context on dependency management.

---

## Issue 3: Vitest Fails with Browser/JSDOM Errors

**Symptom:**

```
Error: Cannot find module 'aria-query'
TypeError: missing exports from @storybook/addon-vitest
```

**Cause**: Some Storybook Vitest addon versions conflict with jsdom environment.

**Solution:**

1. Check `vitest.config.ts` — ensure `environment: 'jsdom'` is set for component tests
2. Separate browser-mode tests and node-mode tests using the `projects` config
3. Run `npm run test` (not `npx vitest --browser`) unless explicitly needed

---

## Issue 4: Environment Variables Not Loading

**Symptom**: `import.meta.env.VITE_*` returns `undefined` at runtime.

**Cause**: Missing `.env.local` file or wrong variable prefix.

**Solution:**

```bash
# Create from example
cp .env.example .env.local
# Fill in values
```

**Rules:**

- Client variables **must** start with `VITE_`
- Server/CI variables (no `VITE_` prefix) are NOT available in the browser
- Always use `ConfigService` to read env vars — never access `import.meta.env` directly in business logic

```typescript
// ❌ Wrong
const apiUrl = import.meta.env.VITE_API_URL;

// ✅ Correct
import { configService } from '@/core/config';
const apiUrl = configService.get('apiUrl');
```

---

## Issue 5: Husky Pre-commit Hook Not Running

**Symptom**: Commit succeeds without lint/test running.

**Solution:**

```bash
# Re-initialize Husky
npm run prepare

# Verify .husky/ hooks exist
ls .husky/
# Should show: pre-commit, commit-msg
```

If on Windows and hooks still don't fire:

```bash
git config core.hooksPath .husky
```

---

## Issue 6: Playwright Tests Failing Locally

**Symptom**: E2E tests timeout or fail with "net::ERR_CONNECTION_REFUSED".

**Cause**: Playwright tests require the dev server to be running.

**Solution:**

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Run E2E tests
npm run test:e2e
```

Or configure `playwright.config.ts` to use `webServer`:

```typescript
webServer: {
  command: 'npm run dev',
  port: 5173,
  reuseExistingServer: !process.env.CI,
},
```

---

## Issue 7: Storybook Won't Start

**Symptom:**

```
Error: Cannot find module '@storybook/...'
```

**Solution:**

```bash
npm install --legacy-peer-deps
npm run storybook
```

If Storybook port 6006 is in use:

```bash
npm run storybook -- --port 6007
```

---

## Issue 8: `import/no-restricted-paths` ESLint Error

**Symptom:**

```
Import from '@/features/timeline/components/TimelinePanel' is restricted.
Use the feature's public API via '@/features/timeline' instead.
```

**Cause**: You are directly importing from a feature's internal folder. This violates the Public API boundary.

**Solution:**

```typescript
// ❌ Wrong — importing from internal path
import { TimelinePanel } from '@/features/timeline/components/TimelinePanel';

// ✅ Correct — import from public API
import { TimelinePanel } from '@/features/timeline';
```

---

## Issue 9: `tsc` Type Errors on Clean Install

**Symptom**: Type errors appear only on first `npm ci` in a fresh environment.

**Cause**: TypeScript path aliases or missing type declarations.

**Solution:**

```bash
# Ensure tsconfig paths are resolved
npx tsc -b --listFiles | head -20

# If @/ aliases break, verify tsconfig.app.json compilerOptions.paths
```

---

## See Also

- [local-development.md](./local-development.md)
- [testing-guide.md](./testing-guide.md)
- [release-process.md](./release-process.md)
