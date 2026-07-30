# i18n Localization Audit - Quick Reference Guide

**Audit Date:** 2026-07-29
**Scope:** Frontend - src/features and src/components
**Status:** ✅ COMPLETE

---

## Key Statistics at a Glance

- **Total Hardcoded Strings Found:** 123
- **Components Scanned:** 78 TSX files
- **Features Covered:** 9 major features
- **i18n Coverage:** 42% (121 strings needing translation)
- **Translation Files Existing:** 9 (auth, common, dashboard, editor, project-explorer, project, script-editor, workspace, full-translation)

---

## Priority Breakdown

### 🔴 CRITICAL (Phase 1) - 107 strings

1. **Auth Module** (23 strings)
   - LoginPage: Hero tagline, titles, form labels, buttons
   - Status: Vietnamese UI with English i18n needed

2. **Dashboard** (31 strings)
   - DashboardPage: KPI labels, section titles, quick action buttons
   - Status: All English, requires immediate translation

3. **ProjectList** (22 strings)
   - ProjectListPage: Title, filters, search, modal form, aspect ratios
   - Status: All English, high-impact feature

4. **Commercial** (31 strings)
   - CommercialScreen, CreditsTab, PricingTab: Hub title, tabs, pricing details
   - Status: All English, revenue-related content

### 🟡 HIGH (Phase 2) - 14+ strings

1. **Admin Console** (10 strings)
   - AdminConsoleScreen: Title, subtitle, 7 tab labels
   - Status: All English, operational feature

2. **Generation** (4 strings)
   - GenerationScreen: Title, subtitle, wizard/history tabs
   - Status: All English, wizard feature

### 🟢 MEDIUM (Phase 3) - Component refinements

1. **Workspace Header** (2 strings)
   - Language switcher tooltip
   - Status: Already partially i18n

2. **Editor Components** (Variable)
   - Timeline tools, inspector labels, workflow states
   - Status: Existing translation file, needs verification

---

## Files to Update (in order)

**Priority 1 (Week 1):**
`src/features/auth/LoginPage.tsx
src/features/project-explorer/components/DashboardPage.tsx
src/features/project-explorer/components/ProjectListPage.tsx
src/features/commercial/components/CommercialScreen.tsx
src/features/commercial/components/CreditsTab.tsx
src/features/commercial/components/PricingTab.tsx`

**Priority 2 (Week 2):**
`src/features/admin/components/AdminConsoleScreen.tsx
src/features/generation/components/GenerationScreen.tsx
src/features/workspace/components/WorkspaceHeader.tsx`

---

## Common Strings (Deduplication)

These strings appear multiple times and should use shared keys in common.json:

| String    | Count | Suggested Key           |
| --------- | ----- | ----------------------- |
| Draft     | 4     | common.status.draft     |
| Completed | 3     | common.status.completed |
| Rendering | 3     | common.status.rendering |
| Active    | 3     | common.status.active    |
| Cancel    | 5+    | common.buttons.cancel   |
| Create    | 4     | common.buttons.create   |
| Credits   | 8+    | common.units.credits    |
| Settings  | 3+    | common.buttons.settings |

**Savings:** ~20 duplicate string translations

---

## Recommended i18n Key Naming Pattern

**Format:** eature.section.element

**Examples:**

- uth.login.title - Auth feature, login section, title element
- dashboard.kpi.activeProjects.label - Dashboard, KPI subsection, active projects label
- projectList.modal.aspectRatio.landscape - ProjectList, modal section, aspect ratio option
- common.status.draft - Common namespace, status category, draft state

---

## Translation Coverage by Type

| Type            | Current | Target   | Gap     |
| --------------- | ------- | -------- | ------- |
| Page Titles     | 20%     | 100%     | 80%     |
| Form Labels     | 45%     | 100%     | 55%     |
| Buttons/Actions | 35%     | 100%     | 65%     |
| Error Messages  | 70%     | 100%     | 30%     |
| Section Headers | 25%     | 100%     | 75%     |
| **Overall**     | **42%** | **100%** | **58%** |

---

## Implementation Approach

### Step-by-Step for Each Component:

1. **Extract** hardcoded strings from JSX
2. **Create** i18n keys following namespace convention
3. **Update** component: Replace string with ('key')
4. **Add** English translations to src/locales/en/namespace.json
5. **Add** Vietnamese translations to src/locales/vi/namespace.json
6. **Test** with locale switcher (English ↔ Vietnamese)
7. **Verify** UI layout handles variable-length strings
8. **Check** special characters render correctly

### Example Code Pattern:

**Before:**
\\\ sx
<h1>AI Video Studio Dashboard</h1>
<p>Manage your AI generation workflows</p>
<button>Explore Projects</button>
\\\

**After:**
\\\ sx
import { useTranslation } from 'react-i18next';

export function DashboardPage() {
const { t } = useTranslation('dashboard');

return (
<div>
<h1>{t('title')}</h1>
<p>{t('subtitle')}</p>
<button>{t('buttons.exploreProjects')}</button>
</div>
);
}
\\\

---

## Translation File Structure

### Create/Extend These Files:

**New Files (fully create):**

- src/locales/en/dashboard.json
- src/locales/vi/dashboard.json
- src/locales/en/commercial.json
- src/locales/vi/commercial.json
- src/locales/en/admin.json
- src/locales/vi/admin.json
- src/locales/en/generation.json
- src/locales/vi/generation.json

**Extend Existing:**

- src/locales/en/auth.json (23 new keys)
- src/locales/vi/auth.json (23 new keys)
- src/locales/en/common.json (15+ new keys for shared strings)
- src/locales/vi/common.json (15+ new keys for shared strings)
- src/locales/en/project-explorer.json (extend with dashboard + projectList)
- src/locales/vi/project-explorer.json (extend with dashboard + projectList)

---

## Estimated Effort

| Phase      | Components | Strings  | Estimated Hours | Week     |
| ---------- | ---------- | -------- | --------------- | -------- |
| Phase 1    | 6          | 107      | 12-16           | Week 1   |
| Phase 2    | 3          | 14       | 4-6             | Week 2   |
| Phase 3    | 2-3        | 10+      | 3-5             | Week 3   |
| QA/Testing | -          | -        | 4-8             | Week 3-4 |
| **Total**  | **12-14**  | **123+** | **23-35 hours** |          |

---

## Quality Checklist

- [ ] All hardcoded visible strings replaced with i18n keys
- [ ] English translations added to all en/*.json files
- [ ] Vietnamese translations added to all vi/*.json files
- [ ] Language switcher works (EN ↔ VI)
- [ ] No layout breaks with longer translations
- [ ] Special characters (đ, ư, ô, etc.) render correctly
- [ ] Dates/times format per locale
- [ ] Numbers format per locale (thousands separator, decimals)
- [ ] No console warnings about missing translation keys
- [ ] All UI text appears translated when language switched
- [ ] Modals/dialogs properly localized
- [ ] Form validation messages translated
- [ ] Empty states translated
- [ ] Loading states translated
- [ ] Status badges translated

---

## Tools & Resources

### Key Tools:

- **i18next-scanner** - Extract new keys from code (recommended)
- **react-i18next** - Already integrated
- **i18next-backend** - Language file loading
- **Key Validation** - Run linter to catch missing keys

### Recommended Practices:

- Use consistent naming conventions
- Group related keys in same namespace
- Use nested object structure for logical organization
- Include context in key names (not just 'label', but 'submitButton', 'cancelButton')
- Document any keys with dynamic values
- Add comments for complex or non-obvious keys

---

## Risk Mitigation

### Potential Issues:

1. **Text overflow** - Some translations longer than English
   - Solution: Use line-clamp-* classes, test layout thoroughly

2. **Missing translations** - Typos in key names
   - Solution: Use i18next-scanner to validate keys exist

3. **RTL languages** (future)
   - Solution: Design structure-agnostic, consider RTL in CSS

4. **Pluralization** - Some strings need plural forms
   - Solution: Use i18next plural syntax: {{ count }} item, t('key', { count })

5. **Context-specific strings** - Same English word different meaning
   - Solution: Use descriptive key names, different keys for different contexts

---

## Next Steps

1. ✅ **Audit Complete** - This report documents all findings
2. 📋 **Review with team** - Confirm priority and timeline
3. 🎯 **Create implementation tasks** - Assign to developers
4. �� **Phase 1 implementation** - Auth, Dashboard, ProjectList, Commercial
5. ✅ **Phase 1 testing** - Language switcher, layout, special characters
6. 💻 **Phase 2 implementation** - Admin, Generation, refinements
7. ✅ **Full QA** - Complete localization testing
8. 📚 **Update guidelines** - Document i18n practices for team

---

## Audit Artifacts

Generated files in this audit:

1. **I18N_AUDIT_REPORT.md** - Comprehensive audit with detailed findings
2. **I18N_HARDCODED_STRINGS.csv** - CSV export for tracking/import
3. **I18N_QUICK_REFERENCE.md** - This file, quick lookup guide

---

Generated by i18n Localization Audit
Language Coverage: Vietnamese (VI) + English (EN)
Scope: Frontend (src/features + src/components)
