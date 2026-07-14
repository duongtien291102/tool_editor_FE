# Release Process Runbook

> **Status**: FROZEN (Engineering Foundation Sprint)  
> **Last Updated**: 2026-07-15  
> **Owner**: Tech Lead

---

## Overview

We follow **Semantic Versioning** (`MAJOR.MINOR.PATCH`) and **trunk-based development** with GitHub Actions CI/CD.

```
MAJOR  — Breaking API or UX changes
MINOR  — New features (backward compatible)
PATCH  — Bug fixes (backward compatible)
```

---

## Environments

| Environment     | Branch       | Trigger         | URL                             |
| --------------- | ------------ | --------------- | ------------------------------- |
| **Development** | `main`       | Auto on merge   | `http://localhost:5173` (local) |
| **Staging**     | `main`       | Auto (future)   | TBD                             |
| **Production**  | Git tag `v*` | Manual tag push | TBD                             |

---

## CI/CD Pipeline (GitHub Actions)

Every PR and push to `main` triggers `.github/workflows/ci.yml`:

```
Step 1: Checkout & Setup Node 20.x
Step 2: npm ci --legacy-peer-deps
Step 3: Type Check (tsc -b)
Step 4: Lint (eslint)
Step 5: Unit Test & Coverage (vitest --coverage)
Step 6: Storybook Build
Step 7: Application Build (vite build)
Step 8: Upload dist/ artifact
```

> **All steps must pass (green) before merging a PR.**

---

## Release Checklist

### Pre-Release (Day Before)

- [ ] All PRs for this release are merged to `main`
- [ ] CI pipeline on `main` is fully green
- [ ] `npm run test` passes locally
- [ ] `npm run test:e2e` passes on staging data
- [ ] Performance Baseline — check no regression > 20% (see [baseline.md](../performance/baseline.md))
- [ ] CHANGELOG updated with changes for this version
- [ ] `package.json` version bumped

### Release Steps

1. **Bump version in `package.json`**

```bash
# Edit package.json version field manually
# OR use npm version
npm version minor  # for new features
npm version patch  # for bug fixes
npm version major  # for breaking changes
```

2. **Commit the version bump**

```bash
git add package.json package-lock.json
git commit -m "chore(release): bump version to v1.1.0"
git push origin main
```

3. **Create an annotated Git tag**

```bash
git tag -a v1.1.0 -m "Release v1.1.0: <short description>"
git push origin v1.1.0
```

4. **Create GitHub Release**

- Go to GitHub → Releases → Draft a new release
- Select the tag `v1.1.0`
- Fill in release notes (copy from CHANGELOG)
- Publish release

5. **Verify CI on the tag** runs build successfully

---

## Rollback Procedure

If a production issue is detected after release:

```bash
# Option 1: Revert to previous tag
git checkout v1.0.0
# Build and deploy from this tag

# Option 2: Hot-fix branch
git checkout -b fix/critical-bug main
# Make fix
git commit -m "fix: <description>"
# Create PR, merge to main, re-release as patch
```

---

## CHANGELOG Format

```markdown
## [1.1.0] - 2026-07-20

### Added

- Feature X: description

### Fixed

- Bug Y: description

### Changed

- Behavior Z: description
```

---

## Frozen Components — No Release Changes Without ADR

The following cannot be modified during release without a new Tech Lead-approved ADR:

- Folder Structure
- ADRs
- Coding Standards
- Config Service
- Logger
- CI Pipeline
- Testing configuration
- Storybook configuration
- Dependency Rules (ESLint import restrictions)

---

## See Also

- [local-development.md](./local-development.md)
- [troubleshooting.md](./troubleshooting.md)
- [Architecture ADRs](../adr/)
