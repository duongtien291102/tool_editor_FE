# ADR 0001: Feature-Sliced Domain Architecture

## Status

Accepted

## Context

The AI Video Studio is a complex web application with multiple interconnected domains (Timeline, Script, Preview, Export). A flat or component-based structure is insufficient to manage this complexity, leading to tightly coupled code, circular dependencies, and a monolithic codebase that is hard to test and scale.

## Decision

We will adopt a Feature-Sliced Domain Architecture. Each major domain of the application will be encapsulated within its own "Feature" module (e.g., `src/features/timeline`, `src/features/script-editor`).

Each Feature must follow this strict internal layering:

1.  **Public API (`index.ts`)**: The only entry point for external features.
2.  **Domain Models (`core/models/`)**: Pure data structures and interfaces.
3.  **State (`core/state/`)**: State management (Zustand) and Runtime UI State.
4.  **Engines (`core/engines/`)**: Pure logic modules that manipulate state and models.
5.  **ViewModels (`core/viewmodels/`)**: Mappers that prepare state for rendering.
6.  **Input/Controllers (`core/input/`)**: Handlers for user interactions.
7.  **Components (`components/`)**: Pure React views that emit events and render ViewModels.

## Consequences

- **Positive**: High decoupling. Features can be developed and tested in isolation. Clear dependency boundaries prevent spaghetti code.
- **Negative**: Higher initial boilerplate (interfaces, ViewModels, explicit boundaries). Steeper learning curve for new developers.
