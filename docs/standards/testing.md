# Testing Standards

Quality is enforced through a strict 3-tier testing strategy.

## 1. Unit Tests (Vitest)

- **Target**: Pure logic (Engines, Services, ViewModels, Reducers).
- **Tool**: Vitest.
- **Rule**: Every pure function/class MUST have a unit test. These tests execute in Node.js (no DOM) and must run exceptionally fast.

## 2. Integration Tests (React Testing Library)

- **Target**: React Components.
- **Tool**: Vitest + React Testing Library + jsdom.
- **Rule**: Tests focus on component interactions, rendering ViewModels correctly, and verifying that user interactions emit the correct events. Do not test implementation details.

## 3. End-to-End Tests (Playwright)

- **Target**: Full Application Workflows.
- **Tool**: Playwright.
- **Rule**: E2E tests run against a built version of the application in a real browser. They test critical user journeys (e.g., "Add clip to timeline, drag it, and playback"). These are slower and should only cover high-level flows.
