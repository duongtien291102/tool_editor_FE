# Git and Versioning Standards

## Commitlint Requirements

All commits must follow the Conventional Commits specification. This is enforced via Husky and Commitlint on `commit-msg`.

Allowed types:

- `feat`: A new feature
- `fix`: A bug fix
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, etc)
- `test`: Adding missing tests or correcting existing tests
- `build`: Changes that affect the build system or external dependencies
- `ci`: Changes to our CI configuration files and scripts
- `perf`: A code change that improves performance
- `chore`: Other changes that don't modify src or test files

## Semantic Versioning

The project adheres to strict Semantic Versioning (`MAJOR.MINOR.PATCH`).

- **MAJOR**: Incompatible API changes (Rare, reserved for major architectural overhauls).
- **MINOR**: Backward compatible functionality added (e.g., Every new Sprint/Feature).
- **PATCH**: Backward compatible bug fixes.
