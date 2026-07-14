# Timeline Engines

This directory contains pure business logic for the Timeline domain.

## Rules

1. **NO UI Frameworks**: Do not import React, Vue, etc.
2. **NO State Managers**: Do not import Zustand, Redux, etc.
3. **NO DOM/Browser APIs**: Must run seamlessly in Node.js for unit testing.
4. **Purity**: Functions should ideally be pure, transforming data or state objects passed into them, or encapsulated within stateful but framework-agnostic classes.
