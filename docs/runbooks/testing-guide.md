# Testing Guide

> **Status**: FROZEN (Engineering Foundation Sprint)  
> **Last Updated**: 2026-07-15  
> **Owner**: Tech Lead / QA

---

## Testing Philosophy

We employ a **3-tier testing pyramid** to balance confidence and speed:

```
        ╔══════════╗
        ║   E2E    ║  ← Playwright: Critical user flows
        ╠══════════╣
        ║Component ║  ← RTL: UI rendering & interactions
        ╠══════════╣
        ║   Unit   ║  ← Vitest: Pure functions, engines, models
        ╚══════════╝
```

---

## Tier 1 — Unit Tests (Vitest)

**Scope**: Pure functions, domain models, engines, utilities, services with no UI dependency.

**What to test here:**

- `src/core/logger/` — Logger formatting and level filtering
- `src/core/config/` — ConfigService value resolution
- `src/features/timeline/core/engines/` — Clip collision, snap, playhead logic
- `src/features/timeline/core/models/` — TimelineDocument, Clip, Track immutable operations
- `src/utils/` — All helper functions

**Commands:**

```bash
# Run all unit tests once
npm run test

# Run in watch mode (TDD)
npm run test:watch

# Run with coverage report
npx vitest run --coverage
```

**Coverage target**: `>= 80%` on `src/core/` and `src/features/*/core/`

**File location convention:**

```
src/core/logger/logger.ts
src/core/logger/logger.spec.ts   ← co-located
```

**Example test structure:**

```typescript
import { describe, it, expect } from 'vitest';
import { Logger } from './logger';

describe('Logger', () => {
  it('should format messages with timestamp', () => {
    // arrange
    const logger = new Logger('test');
    // act
    const result = logger.format('Hello');
    // assert
    expect(result).toContain('[test]');
  });
});
```

---

## Tier 2 — Component Tests (React Testing Library)

**Scope**: React components — verifying rendering, interactions, accessibility, and state transitions.

**What to test here:**

- UI behavior (button clicks, form inputs)
- Conditional rendering
- Error boundary fallbacks

**Commands:**

```bash
# Same as unit: vitest runs both tiers
npm run test
```

**Selection rules:**

- **Always use**: `data-testid`, ARIA roles (`getByRole`), or accessible labels (`getByLabelText`)
- **Never use**: CSS class names or element type selectors (fragile)
- **Use `userEvent`** over `fireEvent` for realistic interactions

**Example:**

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TimelinePanel } from './TimelinePanel';

describe('TimelinePanel', () => {
  it('should render the playhead at 00:00', () => {
    render(<TimelinePanel />);
    expect(screen.getByTestId('playhead')).toBeInTheDocument();
    expect(screen.getByText('00:00')).toBeVisible();
  });
});
```

---

## Tier 3 — End-to-End Tests (Playwright)

**Scope**: Complete user workflows across the full application. Tests run against the real DOM with real (mocked via MSW) network data.

**What to test here:**

- "Load app → Open project → Drag clip to timeline"
- "Open script editor → Type dialogue → Save"
- "Resize panel layout → Reload → Layout persists"

**Commands:**

```bash
# Run all E2E tests
npm run test:e2e

# Run with browser UI (debug mode)
npx playwright test --ui

# Run a specific test file
npx playwright test tests-e2e/workspace.spec.ts
```

**Rules:**

- Do NOT mock internal services in E2E tests — let MSW handle network
- Each spec should be independent (no shared state between tests)
- Use `data-testid` attributes for selectors

**Config location:** `playwright.config.ts`  
**Test location:** `tests-e2e/`

---

## Storybook Visual Testing

Storybook serves as a **visual regression and component exploration tool**.

```bash
npm run storybook
# Opens http://localhost:6006

npm run build-storybook
# Produces a static build for CI verification
```

All UI components in `src/components/ui/` and feature panel components **should have a story**.

---

## Mocking Strategy

| Layer            | Tool                          | When                                          |
| ---------------- | ----------------------------- | --------------------------------------------- |
| Network requests | **MSW** (Mock Service Worker) | All tiers — intercepts at network level       |
| Module mocks     | `vi.mock()`                   | Unit tests only — mock heavy I/O dependencies |
| Time             | `vi.useFakeTimers()`          | Debounce / throttle / timeout testing         |

MSW handlers live in `src/mocks/handlers/`.

---

## Coverage Report

```bash
npx vitest run --coverage
# Output: coverage/ folder (HTML report)
# Open: coverage/index.html in browser
```

**Minimum thresholds** (enforced in `vitest.config.ts`):

- Lines: `>= 70%`
- Functions: `>= 80%`
- Core engines: `>= 80%`

---

## CI Integration

The CI pipeline (`.github/workflows/ci.yml`) runs:

```yaml
- name: Unit Test & Coverage
  run: npx vitest run --coverage

- name: Storybook Build
  run: npm run build-storybook
```

E2E tests can be run locally. Full E2E in CI requires a server — to be configured in a future sprint.

---

## See Also

- [local-development.md](./local-development.md)
- [troubleshooting.md](./troubleshooting.md)
- [Vitest Config](../../vitest.config.ts)
- [Playwright Config](../../playwright.config.ts)
