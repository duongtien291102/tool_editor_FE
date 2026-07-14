# Dead Code Audit Report

> **Version**: v0.1.0  
> **Date**: 2026-07-15  
> **Method**: Manual static analysis + grep scan  
> **Policy**: Items are listed and classified only. No automatic removal. Removal requires explicit decision.

---

## Legend

| Mark          | Meaning                                          |
| ------------- | ------------------------------------------------ |
| 🗑️ **Remove** | Safe to delete; no current or planned usage      |
| 🔒 **Keep**   | Intentional placeholder; required for foundation |
| 👀 **Review** | Unclear usage; needs team decision               |

---

## 1. Skeleton / Stub Engines

These engine files exist as intentional placeholders defined during the Engineering Foundation sprint.

| File                                       | Status         | Classification | Reason                         |
| ------------------------------------------ | -------------- | -------------- | ------------------------------ |
| `timeline/core/engines/CollisionEngine.ts` | Empty class    | 🔒 **Keep**    | TD-02: Planned for Feature 5   |
| `timeline/core/engines/SnapEngine.ts`      | Empty class    | 🔒 **Keep**    | TD-03: Planned for Feature 5   |
| `timeline/core/engines/TrackEngine.ts`     | Empty class    | 🔒 **Keep**    | Planned for Feature 5          |
| `timeline/core/engines/SelectionEngine.ts` | Empty class    | 🔒 **Keep**    | TD-06: Planned for Feature 5   |
| `timeline/core/history/IHistoryManager.ts` | Interface only | 🔒 **Keep**    | TD-04: Command Pattern planned |

**These are intentional technical debt stubs — do not remove.**

---

## 2. Unused Components

### Components with no consumer found

| Component             | File                                             | Current Import                                     | Classification | Action                       |
| --------------------- | ------------------------------------------------ | -------------------------------------------------- | -------------- | ---------------------------- |
| `MonacoEditorAdapter` | `script-editor/adapters/MonacoEditorAdapter.tsx` | Not imported anywhere (EditorFactory uses 'basic') | 🔒 **Keep**    | Needed when Monaco installed |
| `GlobalErrorBoundary` | `components/ui/GlobalErrorBoundary.tsx`          | Used in `EditorLayout.tsx` ✅                      | ✅ Used        | N/A                          |
| `Button`              | `components/ui/Button.tsx`                       | Used in `Button.spec.tsx` + stories                | ✅ Used        | N/A                          |

### Analysis

- `MonacoEditorAdapter`: Imported by `EditorFactory.ts` conditionally (if type === 'monaco'). The factory is active but defaults to 'basic'. Keep as infrastructure.

---

## 3. Unused Hooks

| Hook                 | File                                           | Consumer Found?                                          | Classification |
| -------------------- | ---------------------------------------------- | -------------------------------------------------------- | -------------- |
| `useRecentProjects`  | `workspace/hooks/useRecentProjects.ts`         | Not used in any component — only exported via `index.ts` | 👀 **Review**  |
| `useWorkspace`       | `workspace/hooks/useWorkspace.ts`              | Used in `WorkspaceHeader.tsx` ✅                         | ✅ Used        |
| `useCurrentProject`  | `workspace/hooks/useCurrentProject.ts`         | Used in `WorkspaceHeader.tsx` ✅                         | ✅ Used        |
| `useProjectExplorer` | `project-explorer/hooks/useProjectExplorer.ts` | Used in `ProjectExplorer.tsx` ✅                         | ✅ Used        |
| `useScriptStore`     | `script-editor/store/scriptStore.ts`           | Used in `ScriptEditorPanel.tsx` ✅                       | ✅ Used        |
| `useWorkspaceStore`  | `workspace/store/workspaceStore.ts`            | Used in workspace hooks ✅                               | ✅ Used        |
| `useTimelineStore`   | `timeline/core/state/timelineStore.ts`         | Used in components ✅                                    | ✅ Used        |

### `useRecentProjects` — Detail

```typescript
// workspace/hooks/useRecentProjects.ts — No component consumes this
export function useRecentProjects() { ... }
```

**Recommendation**: 👀 **Review** — Keep for now. The Recent Projects UI panel was planned but not implemented yet. Remove if no feature uses it by Sprint 4.

---

## 4. Unused Stores

| Store                  | File                                             | Consumer?                        | Classification            |
| ---------------------- | ------------------------------------------------ | -------------------------------- | ------------------------- |
| `src/store/app/`       | Directory                                        | Empty directory                  | 🗑️ **Remove** (empty dir) |
| `src/store/editor/`    | Directory                                        | Empty directory                  | 🗑️ **Remove** (empty dir) |
| `projectExplorerStore` | `project-explorer/store/projectExplorerStore.ts` | Used via `useProjectExplorer` ✅ | ✅ Used                   |

**Note**: The two empty `src/store/app/` and `src/store/editor/` directories were scaffolded in `ARCHITECTURE.md` but never populated. They are empty and should be cleaned up when the team decides to implement global app state (or when they are needed).

---

## 5. Unused Services

| Service                   | File                                      | Consumer?                           | Classification |
| ------------------------- | ----------------------------------------- | ----------------------------------- | -------------- |
| `commandRegistry`         | `core/command/CommandRegistry.ts`         | Not imported anywhere in app code   | 👀 **Review**  |
| `ShortcutManager`         | `core/command/ShortcutManager.ts`         | Not imported anywhere               | 👀 **Review**  |
| `notificationCenter`      | `core/event-bus/NotificationCenter.ts`    | Not imported anywhere               | 👀 **Review**  |
| `settingsService`         | `services/settings/SettingsService.ts`    | Used in `src/core/i18n/index.ts` ✅ | ✅ Used        |
| `workspaceService`        | `workspace/services/workspace.service.ts` | Used in `workspaceStore.ts` ✅      | ✅ Used        |
| `scriptService`           | `script-editor/services/ScriptService.ts` | Used in `scriptStore.ts` ✅         | ✅ Used        |
| `projectExplorer.service` | `project-explorer/services/`              | Used internally ✅                  | ✅ Used        |

### Unused Core Services — Detail

**`commandRegistry`** (`core/command/CommandRegistry.ts`):

- Provides `register()`, `getCommand()`, `getAllCommands()`
- No component or feature registers or queries commands yet
- **Classification**: 🔒 **Keep** — Foundation infrastructure for Command Palette (planned Sprint 3 or 4)

**`ShortcutManager`** (`core/command/ShortcutManager.ts`):

- Keyboard shortcut registration
- Not connected to any component
- **Classification**: 🔒 **Keep** — Foundation infrastructure, will be wired when Hotkeys are implemented

**`notificationCenter`** (`core/event-bus/NotificationCenter.ts`):

- Wraps `sonner` toast library
- Not called anywhere currently
- **Classification**: 🔒 **Keep** — Foundation infrastructure; will be used when features need user feedback (e.g., save success, export done)

---

## 6. Unused Types

| Type/Interface       | File                                    | Used?                         | Classification                     |
| -------------------- | --------------------------------------- | ----------------------------- | ---------------------------------- |
| `AppSettings`        | `services/settings/SettingsService.ts`  | Used internally ✅            | ✅ Used                            |
| `WorkspaceData`      | `workspace/types/index.ts`              | Used in service ✅            | ✅ Used                            |
| `ICommand`           | `script-editor/types/index.ts`          | Not used anywhere             | 👀 **Review**                      |
| `CommandDefinition`  | `core/command/CommandRegistry.ts`       | Only used internally          | 🔒 **Keep** (with CommandRegistry) |
| `SimplePointerEvent` | `timeline/core/input/DragController.ts` | Used within DragController ✅ | ✅ Used                            |

### `ICommand` — Detail

```typescript
// script-editor/types/index.ts
export interface ICommand {
  id: string;
  execute(): void;
  undo(): void;
}
```

- Defined but never instantiated
- Exists alongside `IHistoryManager` for future Undo/Redo implementation
- **Classification**: 🔒 **Keep** — Needed when TD-04 (HistoryManager) is implemented

---

## 7. Unused Locales

| Namespace                    | File                               | Used?                             | Classification                                  |
| ---------------------------- | ---------------------------------- | --------------------------------- | ----------------------------------------------- |
| `common.json` (en)           | `locales/en/common.json`           | Used in App.tsx and components ✅ | ✅ Used                                         |
| `workspace.json` (en)        | `locales/en/workspace.json`        | Used in `WorkspaceHeader` ✅      | ✅ Used                                         |
| `script-editor.json` (en)    | `locales/en/script-editor.json`    | Used in `SceneEditor` ✅          | ✅ Used                                         |
| `project-explorer.json` (en) | `locales/en/project-explorer.json` | Loaded in i18n config             | 👀 **Review** (loaded but may have unused keys) |
| `vi/` (all)                  | `locales/vi/`                      | Loaded as fallback                | 🔒 **Keep**                                     |

---

## 8. Unused Utilities

| Utility       | File                   | Used?                           | Classification |
| ------------- | ---------------------- | ------------------------------- | -------------- |
| `cn()`        | `src/utils/index.ts`   | Not imported by `@/utils` alias | 👀 **Review**  |
| `cn()` (core) | `src/core/utils/cn.ts` | Used in `Button.tsx` ✅         | ✅ Used        |

### Duplicate `cn` utility issue:

Two `cn` functions exist:

1. `src/utils/index.ts` — `cn()` via `@/utils`
2. `src/core/utils/cn.ts` — `cn()` via relative path

`Button.tsx` imports from `../../core/utils/cn`. The `src/utils/index.ts` version appears unused.

**Classification**: 🗑️ **Remove** `src/utils/index.ts` — Or consolidate into one canonical location (`src/core/utils/cn.ts` with `@/core/utils/cn` alias). The barrel file `src/utils/index.ts` exports `cn` which duplicates the core version.

---

## 9. Unused Assets

| Asset          | Location               | Used?                                    | Classification |
| -------------- | ---------------------- | ---------------------------------------- | -------------- |
| React SVG logo | `src/assets/react.svg` | Referenced in default Vite template only | 🗑️ **Remove**  |

---

## 10. Empty Directories

| Directory               | Status                     | Classification                                                       |
| ----------------------- | -------------------------- | -------------------------------------------------------------------- |
| `src/store/app/`        | Empty                      | 🗑️ **Remove** when global app state is needed (or keep for Sprint 3) |
| `src/store/editor/`     | Empty                      | 🗑️ **Remove** when editor global state is needed                     |
| `src/mocks/`            | Empty (MSW not configured) | 🔒 **Keep** — MSW setup planned                                      |
| `src/services/api/`     | Empty                      | 🔒 **Keep** — API integration planned Sprint 3                       |
| `src/services/queries/` | Empty                      | 🔒 **Keep** — TanStack Query setup planned Sprint 3                  |
| `src/types/`            | Empty                      | 🔒 **Keep** — Global types to be added as features grow              |
| `src/hooks/`            | Empty                      | 🔒 **Keep** — Shared hooks planned (useHotkeys, etc.)                |

---

## 11. Unused Exports in `index.ts` Files

### `workspace/index.ts`

| Export              | Consumer?                    | Classification              |
| ------------------- | ---------------------------- | --------------------------- |
| `useRecentProjects` | No component ✗               | 👀 Review                   |
| `workspaceService`  | No external consumer ✗       | 👀 Review (used internally) |
| Others              | WorkspaceHeader, App etc. ✅ | ✅ Used                     |

### `project-explorer/index.ts`

| Export                    | Consumer?              | Classification |
| ------------------------- | ---------------------- | -------------- |
| `projectExplorerStore`    | No external consumer ✗ | 👀 Review      |
| `projectExplorer.service` | No external consumer ✗ | 👀 Review      |
| `ProjectExplorer`, hooks  | Used via App.tsx ✅    | ✅ Used        |

---

## Summary Classification

| Category         | Keep                   | Review                    | Remove                            |
| ---------------- | ---------------------- | ------------------------- | --------------------------------- |
| Skeleton Engines | 5                      | 0                         | 0                                 |
| Components       | 1 (Monaco placeholder) | 0                         | 0                                 |
| Hooks            | 0                      | 1 (useRecentProjects)     | 0                                 |
| Stores           | 0                      | 0                         | 2 (empty dirs)                    |
| Services         | 3 (core infra)         | 0                         | 0                                 |
| Types            | 1 (ICommand)           | 0                         | 0                                 |
| Locales          | 0                      | 1 (project-explorer keys) | 0                                 |
| Utilities        | 0                      | 1 (duplicate cn)          | 1 (utils/index.ts or deduplicate) |
| Assets           | 0                      | 0                         | 1 (react.svg)                     |
| Empty Dirs       | 5 (planned)            | 0                         | 2 (store/app, store/editor)       |

---

## Recommended Actions (Next Sprint)

**🗑️ Remove now (safe, no impact):**

1. `src/assets/react.svg` — Unused Vite default asset
2. Consolidate `cn` — Either delete `src/utils/index.ts` and use `@/core/utils/cn`, or export `cn` from `@/utils` and update `Button.tsx`

**👀 Review by Sprint 3:**

1. `useRecentProjects` — Remove if no Recent Projects UI is planned
2. Empty `src/store/app/` and `src/store/editor/` directories — Populate or remove
3. `project-explorer.json` locale keys — Verify all keys are in use

**🔒 Do not remove (foundation infrastructure):**

- All skeleton engines (TD-01 through TD-06)
- `commandRegistry`, `ShortcutManager`, `notificationCenter`
- Empty `src/mocks/`, `src/services/api/`, `src/services/queries/`, `src/types/`, `src/hooks/`
