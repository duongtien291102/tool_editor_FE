# ADR 0002: Timeline Reference Architecture

## Status

Accepted

## Context

The Timeline is the foundational component of the Video Editor. All other features (Playback, Export, Animation, AI Generation) will eventually depend on it. It requires extreme performance, scalability, and maintainability.

## Decision

The Timeline Engine will serve as the Reference Architecture for the entire project. All subsequent features MUST follow the architectural patterns established by the Timeline Engine.

Key architectural tenets:

1.  **Strict Purity**: Logic resides in Engine classes (`TrackEngine`, `ClipEngine`). These classes are pure TypeScript and must never import React, DOM dependencies, or Browser APIs directly.
2.  **Controller Pattern**: User input is handled by pure `InputController` classes, which transform DOM events into Domain commands.
3.  **Dumb Components**: React components are strictly view layers. They subscribe to stores (via selectors) or receive ViewModels as props. They contain zero business logic and only emit standard events upwards.
4.  **Value Objects**: Core concepts (like `Time`, `Frame`) are wrapped in Value Objects to enforce type safety and encapsulate calculations.

## Consequences

- **Positive**: Guarantees testability of the core logic on Node.js without DOM mocking. Ensures uniform codebase quality and architectural consistency across all features.
- **Negative**: Requires strict discipline during code review to prevent leakage of UI concerns into the Engine layer.
