# Architecture Standards

## Dependency Graph & Cross-Feature Communication

To maintain decoupling and prevent circular dependencies, strict rules apply to how Features communicate.

1. **Strict Boundary**: A Feature (e.g., `Feature A`) is strictly isolated. Its internal implementation details (`components`, `engines`, `state`) are private.
2. **Public API Only**: `Feature A` may ONLY interact with `Feature B` by importing from `Feature B`'s `index.ts` (its Public API).
3. **No Direct Imports**: You are explicitly banned from doing: `import { X } from '@/features/featureB/core/models/X'`.
4. **Reference Architecture**: The Timeline Engine is the reference architecture for all Features. Every new feature must contain the following layers: Domain Model, Runtime State, Service Layer, Engine Layer, ViewModel, Factory, Interface, README, Unit Test Skeleton, i18n, Mock Layer.
