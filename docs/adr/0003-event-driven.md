# ADR 0003: Event-Driven Communication and ViewModels

## Status

Accepted

## Context

Tightly coupling React components to complex global state stores leads to excessive re-renders and poor performance. In complex UI systems like a Timeline Editor, dragging a clip should not cause the entire timeline to re-render.

## Decision

We will utilize an Event-Driven architecture combined with ViewModels to bridge the pure logic layer (Engines) and the UI layer (React).

1.  **Event Bus**: An application-wide Event Bus will facilitate decoupled communication between distant components or features without prop drilling or deep store subscriptions.
2.  **ViewModels**: Before raw domain data (`Clip`, `Track`) reaches a component, it is mapped into a `ViewModel` (`ClipViewModel`, `TrackViewModel`).
3.  **Shallow Rendering**: Components will subscribe only to the specific slices of state or ViewModels they require, leveraging Zustand's shallow equality checks to prevent unnecessary renders.

## Consequences

- **Positive**: Massive performance gains. Complex operations like dragging or zooming will only trigger renders on the specific affected DOM nodes. Components are fully decoupled from domain models.
- **Negative**: Increased complexity in state mapping. Requires careful tracking of Event Bus subscriptions to prevent memory leaks.
