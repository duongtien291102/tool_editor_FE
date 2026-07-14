# TypeScript Conventions

1. **Strict Mode**: TypeScript strict mode is unconditionally enabled.
2. **Verbatim Module Syntax**: `verbatimModuleSyntax` is enabled. You MUST use `import type { Type }` when importing types and interfaces.
3. **No `any`**: The use of `any` is strictly prohibited. Use `unknown` if the type is truly dynamic, and narrow it down with type guards.
4. **Interfaces over Types**: Use `interface` for object definitions and `type` for unions, intersections, and primitives.
5. **Value Objects**: Use Value Objects for core primitive concepts (e.g., `TimelineTime` instead of `number` for frames).
