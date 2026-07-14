# Folder Conventions

Every Feature module MUST adhere to the following standard structure:

```text
src/features/[feature-name]/
├── components/          # React components (dumb views)
├── core/
│   ├── constants/       # Feature-specific constants
│   ├── engines/         # Pure logic processors
│   ├── factory/         # Data generators/mocks
│   ├── history/         # Undo/Redo logic
│   ├── input/           # Input controllers (Pointer, Keyboard)
│   ├── models/          # Domain interfaces & Value Objects
│   ├── state/           # Zustand stores & Runtime state interfaces
│   └── viewmodels/      # View model mappings
├── index.ts             # The ONLY Public API export for the feature
└── README.md            # Feature documentation
```
