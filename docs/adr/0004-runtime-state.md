# ADR 0004: Separation of Project Data and Runtime State

## Status

Accepted

## Context

A common pitfall in Editor applications is conflating the data that describes the project (which needs to be saved/loaded) with the ephemeral data that describes the current state of the UI (which does not). Mixing these complicates serialization, undo/redo history, and collaborative editing.

## Decision

We will strictly separate Project Data from Runtime UI State at the structural level.

1.  **Project Data (`TimelineDocument`)**: Contains the source of truth for the project. Tracks, Clips, Timings, and logical relationships. This state is serialized, saved to disk/server, and tracked by the HistoryManager for Undo/Redo.
2.  **Runtime State (`TimelineRuntimeState`)**: Contains ephemeral UI state. Viewport position (zoom, scroll), selection state, drag-and-drop shadows, highlighted tracks, and panel sizes. This state is never saved to the project file and is ignored by the Undo/Redo stack.

## Consequences

- **Positive**: Trivial serialization of project files. Drastically simplifies Undo/Redo implementation since ephemeral UI interactions are excluded. Smaller payload sizes.
- **Negative**: Requires developers to actively decide whether a new state field belongs to the Document or the Runtime.
