# Naming Conventions

Consistency in naming drastically reduces cognitive load.

1. **Components**: `PascalCase` (e.g., `ClipRenderer.tsx`).
2. **Domain Models**: `PascalCase` for Interfaces/Classes (e.g., `ClipTiming`, `TimelineEngine`).
3. **Variables/Functions**: `camelCase` (e.g., `handlePointerUp`, `clipDuration`).
4. **Constants**: `UPPER_SNAKE_CASE` (e.g., `DEFAULT_FPS`).
5. **ViewModels**: Must be suffixed with `ViewModel` (e.g., `ClipViewModel`).
6. **Engines**: Must be suffixed with `Engine` (e.g., `TrackEngine`).
7. **Stores**: Hook must be prefixed with `use` and suffixed with `Store` (e.g., `useTimelineStore`).
