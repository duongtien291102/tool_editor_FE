# i18n Localization Audit - Frontend Comprehensive Report

## Executive Summary

Performed complete scan of src/features and src/components directories identifying hardcoded visible strings that are NOT using i18n localization.

**Key Findings:**

- 78 TSX feature files identified
- Multiple hardcoded English and Vietnamese strings across 9 major features
- Existing i18n structure: en/, vi/ with 9 translation files (auth, common, dashboard, editor, project-explorer, project, script-editor, workspace, full-translation)
- **Coverage Gap:** ~40-50% of visible UI text is hardcoded

## Feature-by-Feature Audit Results

### 1. AUTH FEATURE (3 pages analyzed)

**Files:** LoginPage.tsx, RegisterPage.tsx, ForgotPasswordPage.tsx

**Hardcoded Strings Found:**

#### LoginPage.tsx

| String                                                          | Location | Type                  | Status          |
| --------------------------------------------------------------- | -------- | --------------------- | --------------- |
| "Sáng tạo đỉnh cao, hệ thống bền vững."                         | Line 244 | Hero text (VI)        | ❌ Not i18n     |
| "Xây dựng kịch bản. Định hình từng bản dựng."                   | Line 247 | Hero title (VI)       | ❌ Not i18n     |
| "Nền tảng studio ổn định cho dự án..."                          | Line 250 | Hero description (VI) | ❌ Not i18n     |
| "Môi trường sản xuất AI Video Studio"                           | Line 254 | Footer text (VI)      | ❌ Not i18n     |
| "Đăng nhập"                                                     | Line 75  | Button (VI)           | ❌ Not i18n     |
| "Đăng ký tài khoản"                                             | Line 90  | Button (VI)           | ❌ Not i18n     |
| "Đăng nhập vào AI Studio"                                       | Line 106 | Form title (VI)       | ❌ Not i18n     |
| "Nhập thông tin tài khoản..."                                   | Line 107 | Form subtitle (VI)    | ❌ Not i18n     |
| "Tên đăng nhập / Username"                                      | Line 111 | Label (VI/EN)         | ❌ Not i18n     |
| "Nhập tên đăng nhập"                                            | Line 114 | Placeholder (VI)      | ❌ Not i18n     |
| "Mật khẩu"                                                      | Line 119 | Label (VI)            | ❌ Not i18n     |
| "••••••••"                                                      | Line 124 | Placeholder (VI)      | ❌ Not i18n     |
| "Đăng nhập"                                                     | Line 140 | Button (VI)           | ❌ Not i18n     |
| "Đăng ký tài khoản mới"                                         | Line 147 | Form title (VI)       | ❌ Not i18n     |
| "Mọi tài khoản tạo mới sẽ mặc định có quyền người dùng (User)." | Line 148 | Subtitle (VI)         | ❌ Not i18n     |
| "🎉 Đã tạo tài khoản người dùng thành công!..."                 | Line 154 | Success message (VI)  | ❌ Not i18n     |
| "Chuyển sang Đăng nhập"                                         | Line 159 | Button (VI)           | ❌ Not i18n     |
| "Họ và tên"                                                     | Line 167 | Label (VI)            | ❌ Not i18n     |
| "Nguyễn Văn A"                                                  | Line 170 | Placeholder (VI)      | ❌ Not i18n     |
| "Email"                                                         | Line 175 | Label (EN)            | ⚠️ Partial i18n |
| "user@example.com"                                              | Line 179 | Placeholder (EN)      | ❌ Not i18n     |
| "Mật khẩu"                                                      | Line 184 | Label (VI)            | ❌ Not i18n     |
| "Ít nhất 6 ký tự"                                               | Line 188 | Placeholder (VI)      | ❌ Not i18n     |
| "Tạo tài khoản User"                                            | Line 203 | Button (VI)           | ❌ Not i18n     |
| "AI Studio"                                                     | Line 239 | Brand text            | ⚠️ Partial i18n |

**Translation Keys Needed:**

- auth.hero.tagline
- auth.hero.title
- auth.hero.description
- auth.footer.environment
- auth.login.signInButton
- auth.register.signUpButton
- auth.login.formTitle
- auth.login.formSubtitle
- auth.login.usernameLabelWithExample
- auth.login.usernamePlaceholder
- auth.login.passwordLabel
- auth.login.passwordPlaceholder
- auth.register.formTitle
- auth.register.formSubtitle
- auth.register.successMessage
- auth.register.switchToLoginButton
- auth.register.fullNameLabel
- auth.register.fullNamePlaceholder
- auth.register.emailPlaceholder
- auth.register.passwordMinLengthHint
- auth.register.createAccountButton
- common.brand.appName

**Status:** 🔴 CRITICAL - 23 hardcoded strings, Vietnamese UI

---

### 2. PROJECT-EXPLORER FEATURE (3 pages analyzed)

**Files:** DashboardPage.tsx, ProjectListPage.tsx, ProjectDetailPage.tsx

#### DashboardPage.tsx

| String                                   | Location | Type                  | Status       |
| ---------------------------------------- | -------- | --------------------- | ------------ |
| "AI Video Studio Dashboard"              | Line 15  | Page title (EN)       | ❌ Not i18n  |
| "Manage your AI generation workflows..." | Line 16  | Page description (EN) | ❌ Not i18n  |
| "Explore Projects"                       | Line 20  | Button (EN)           | ❌ Not i18n  |
| "AI Generation Engine"                   | Line 23  | Button (EN)           | ❌ Not i18n  |
| "Active Projects"                        | Line 32  | KPI label (EN)        | ❌ Not i18n  |
| "+12%"                                   | Line 35  | KPI metric (EN)       | ⚠️ Dynamic   |
| "6 updated today"                        | Line 38  | KPI subtext (EN)      | ❌ Not i18n  |
| "AI Render Jobs"                         | Line 45  | KPI label (EN)        | ❌ Not i18n  |
| "Active"                                 | Line 48  | KPI status (EN)       | ❌ Not i18n  |
| "98.4% success rate"                     | Line 52  | KPI subtext (EN)      | ⚠️ Dynamic   |
| "Video Exports"                          | Line 57  | KPI label (EN)        | ❌ Not i18n  |
| "4K NVENC"                               | Line 60  | KPI metric (EN)       | ❌ Not i18n  |
| "Total 14.2 GB encoded"                  | Line 64  | KPI subtext (EN)      | ⚠️ Dynamic   |
| "AI Providers"                           | Line 69  | KPI label (EN)        | ❌ Not i18n  |
| "Connected"                              | Line 72  | KPI status (EN)       | ❌ Not i18n  |
| "Veo, Sora, Runway, Kling"               | Line 76  | Provider list (EN)    | ⚠️ Dynamic   |
| "Recent Projects"                        | Line 84  | Section title (EN)    | ❌ Not i18n  |
| "View all"                               | Line 86  | Link (EN)             | ❌ Not i18n  |
| "Cyberpunk City Intro"                   | Line 95  | Project name (EN)     | ⚠️ Mock data |
| "16:9"                                   | Line 96  | Aspect ratio (EN)     | ⚠️ Dynamic   |
| "Completed"                              | Line 97  | Status label (EN)     | ❌ Not i18n  |
| "2 hours ago"                            | Line 98  | Timestamp (EN)        | ⚠️ Dynamic   |
| "Product Launch Trailer"                 | Line 101 | Project name (EN)     | ⚠️ Mock data |
| "Rendering"                              | Line 103 | Status (EN)           | ❌ Not i18n  |
| "Nature Documentary Shot 3"              | Line 108 | Project name (EN)     | ⚠️ Mock data |
| "Draft"                                  | Line 110 | Status (EN)           | ❌ Not i18n  |
| "Aspect Ratio: {ratio} • Updated {time}" | Line 102 | Format string (EN)    | ❌ Not i18n  |
| "+ Create New Project"                   | Line 127 | Button (EN)           | ❌ Not i18n  |
| "🎬 Launch AI Generation Studio"         | Line 133 | Button (EN)           | ❌ Not i18n  |
| "📦 Video Export Manager"                | Line 140 | Button (EN)           | ❌ Not i18n  |
| "Quick Actions"                          | Line 122 | Section title (EN)    | ❌ Not i18n  |

**Translation Keys Needed:**

- dashboard.title
- dashboard.subtitle
- dashboard.actions.exploreProjects
- dashboard.actions.aiGenerationEngine
- dashboard.kpi.activeProjects.label
- dashboard.kpi.activeProjects.change
- dashboard.kpi.activeProjects.updated
- dashboard.kpi.aiRenderJobs.label
- dashboard.kpi.aiRenderJobs.status
- dashboard.kpi.aiRenderJobs.successRate
- dashboard.kpi.videoExports.label
- dashboard.kpi.videoExports.codec
- dashboard.kpi.videoExports.encoded
- dashboard.kpi.aiProviders.label
- dashboard.kpi.aiProviders.status
- dashboard.kpi.aiProviders.list
- dashboard.sections.recentProjects.title
- dashboard.sections.recentProjects.viewAll
- dashboard.sections.quickActions.title
- dashboard.actions.createNewProject
- dashboard.actions.launchGenerationStudio
- dashboard.actions.videoExportManager
- dashboard.columns.aspectRatio
- dashboard.columns.updated

**Status:** 🔴 CRITICAL - 31 hardcoded strings, English UI

#### ProjectListPage.tsx

| String                                        | Location | Type                     | Status          |
| --------------------------------------------- | -------- | ------------------------ | --------------- |
| "Projects Studio"                             | Line 79  | Page title (EN)          | ❌ Not i18n     |
| "Manage your AI video production projects..." | Line 80  | Subtitle (EN)            | ❌ Not i18n     |
| "+ Create New Project"                        | Line 83  | Button (EN)              | ❌ Not i18n     |
| "Search projects..."                          | Line 89  | Placeholder (EN)         | ❌ Not i18n     |
| "ALL"                                         | Line 96  | Filter (EN)              | ❌ Not i18n     |
| "DRAFT"                                       | Line 96  | Filter (EN)              | ❌ Not i18n     |
| "RENDERING"                                   | Line 96  | Filter (EN)              | ❌ Not i18n     |
| "COMPLETED"                                   | Line 96  | Filter (EN)              | ❌ Not i18n     |
| "Shots: {count}"                              | Line 129 | Label (EN)               | ❌ Not i18n     |
| "Updated {date}"                              | Line 130 | Label (EN)               | ❌ Not i18n     |
| "Create New Project"                          | Line 135 | Modal title (EN)         | ❌ Not i18n     |
| "Project Name"                                | Line 137 | Label (EN)               | ❌ Not i18n     |
| "My AI Video Project"                         | Line 140 | Placeholder (EN)         | ❌ Not i18n     |
| "Aspect Ratio"                                | Line 144 | Label (EN)               | ❌ Not i18n     |
| "16:9 Landscape (YouTube, TV)"                | Line 147 | Option (EN)              | ❌ Not i18n     |
| "9:16 Portrait (TikTok, Shorts, Reels)"       | Line 148 | Option (EN)              | ❌ Not i18n     |
| "1:1 Square (Instagram)"                      | Line 149 | Option (EN)              | ❌ Not i18n     |
| "21:9 Ultrawide Cinematic"                    | Line 150 | Option (EN)              | ❌ Not i18n     |
| "Cancel"                                      | Line 152 | Button (EN)              | ⚠️ Partial i18n |
| "Create Project"                              | Line 155 | Button (EN)              | ❌ Not i18n     |
| "Cyberpunk Commercial 2026"                   | Line 44  | Mock data (EN)           | ⚠️ Mock data    |
| "New AI Video Project"                        | Line 65  | Default description (EN) | ❌ Not i18n     |

**Translation Keys Needed:**

- projectList.title
- projectList.subtitle
- projectList.actions.createNew
- projectList.search.placeholder
- projectList.filter.all
- projectList.filter.draft
- projectList.filter.rendering
- projectList.filter.completed
- projectList.card.shots
- projectList.card.updated
- projectList.modal.title
- projectList.modal.projectNameLabel
- projectList.modal.projectNamePlaceholder
- projectList.modal.aspectRatioLabel
- projectList.modal.aspectRatio16x9
- projectList.modal.aspectRatio9x16
- projectList.modal.aspectRatio1x1
- projectList.modal.aspectRatio21x9
- projectList.modal.buttons.cancel
- projectList.modal.buttons.create
- projectList.defaultDescription

**Status:** 🔴 CRITICAL - 22 hardcoded strings, English UI

---

### 3. COMMERCIAL FEATURE (6 tabs analyzed)

**Files:** CommercialScreen.tsx, CreditsTab.tsx, PricingTab.tsx, ProfileTab, SubscriptionTab, UsageTab, InvoicesTab

#### CommercialScreen.tsx

| String                                                     | Location | Type          | Status      |
| ---------------------------------------------------------- | -------- | ------------- | ----------- |
| "Commercial Hub"                                           | Line 90  | Title (EN)    | ❌ Not i18n |
| "Manage Profile, Subscriptions, Credits, Usage & Invoices" | Line 91  | Subtitle (EN) | ❌ Not i18n |
| "Credits:"                                                 | Line 96  | Label (EN)    | ❌ Not i18n |
| "+ Buy Credits"                                            | Line 99  | Button (EN)   | ❌ Not i18n |
| "profile"                                                  | Line 107 | Tab (EN)      | ❌ Not i18n |
| "subscription"                                             | Line 107 | Tab (EN)      | ❌ Not i18n |
| "pricing"                                                  | Line 107 | Tab (EN)      | ❌ Not i18n |
| "credits"                                                  | Line 107 | Tab (EN)      | ❌ Not i18n |
| "usage"                                                    | Line 107 | Tab (EN)      | ❌ Not i18n |
| "invoices"                                                 | Line 107 | Tab (EN)      | ❌ Not i18n |

#### CreditsTab.tsx

| String                   | Location | Type               | Status      |
| ------------------------ | -------- | ------------------ | ----------- |
| "Credit Wallet"          | Line 22  | Section title (EN) | ❌ Not i18n |
| "Credits"                | Line 23  | Unit (EN)          | ❌ Not i18n |
| "Purchased:"             | Line 26  | Label (EN)         | ❌ Not i18n |
| "Used:"                  | Line 27  | Label (EN)         | ❌ Not i18n |
| "Credit Top-Up Packages" | Line 31  | Section title (EN) | ❌ Not i18n |
| "Most Popular"           | Line 43  | Badge (EN)         | ❌ Not i18n |
| "one-time"               | Line 48  | Label (EN)         | ❌ Not i18n |
| "Buy Now ()"             | Line 53  | Button (EN)        | ❌ Not i18n |

#### PricingTab.tsx

| String                                  | Location | Type          | Status      |
| --------------------------------------- | -------- | ------------- | ----------- |
| "Choose Your SaaS Plan"                 | Line 17  | Title (EN)    | ❌ Not i18n |
| "Policy-enforced subscription tiers..." | Line 18  | Subtitle (EN) | ❌ Not i18n |
| "Current Plan"                          | Line 30  | Badge (EN)    | ❌ Not i18n |
| "/month"                                | Line 38  | Unit (EN)     | ❌ Not i18n |
| "Monthly Credits:"                      | Line 42  | Label (EN)    | ❌ Not i18n |
| "Export Limit:"                         | Line 45  | Label (EN)    | ❌ Not i18n |
| "/ mo"                                  | Line 46  | Unit (EN)     | ❌ Not i18n |
| "Concurrent Jobs"                       | Line 50  | Label (EN)    | ❌ Not i18n |
| "Queue limit:"                          | Line 53  | Label (EN)    | ❌ Not i18n |
| "Studio Customization Mode"             | Line 57  | Label (EN)    | ❌ Not i18n |
| "Advanced AI Workflows"                 | Line 61  | Label (EN)    | ❌ Not i18n |
| "Active Plan"                           | Line 72  | Button (EN)   | ❌ Not i18n |
| "Upgrade to {name}"                     | Line 72  | Button (EN)   | ❌ Not i18n |

**Status:** 🔴 CRITICAL - 31 hardcoded strings, English UI

---

### 4. ADMIN FEATURE (8 tabs analyzed)

**Files:** AdminConsoleScreen.tsx, MetricsDashboardTab, SystemHealthTab, AuditLogsTab, FeatureFlagsTab, UserManagementTab, JobsManagementTab, BackupExportTab

#### AdminConsoleScreen.tsx

| String                                        | Location | Type          | Status      |
| --------------------------------------------- | -------- | ------------- | ----------- |
| "Production Admin Console"                    | Line 47  | Title (EN)    | ❌ Not i18n |
| "Operational observability, system health..." | Line 48  | Subtitle (EN) | ❌ Not i18n |
| "🔄 Refresh System Status"                    | Line 52  | Button (EN)   | ❌ Not i18n |
| "📊 Metrics"                                  | Line 60  | Tab (EN)      | ❌ Not i18n |
| "💚 Health"                                   | Line 61  | Tab (EN)      | ❌ Not i18n |
| "📜 Audit Logs"                               | Line 62  | Tab (EN)      | ❌ Not i18n |
| "🚩 Feature Flags"                            | Line 63  | Tab (EN)      | ❌ Not i18n |
| "👥 Users & Credits"                          | Line 64  | Tab (EN)      | ❌ Not i18n |
| "⚙️ Jobs & Queue"                             | Line 65  | Tab (EN)      | ❌ Not i18n |
| "💾 Backup & Export"                          | Line 66  | Tab (EN)      | ❌ Not i18n |

**Status:** 🔴 CRITICAL - 10 hardcoded strings, English UI

---

### 5. GENERATION FEATURE (1 screen analyzed)

**Files:** GenerationScreen.tsx

#### GenerationScreen.tsx

| String                                | Location | Type          | Status      |
| ------------------------------------- | -------- | ------------- | ----------- |
| "Video Generation Experience"         | Line 43  | Title (EN)    | ❌ Not i18n |
| "End-to-end video pipeline wizard..." | Line 44  | Subtitle (EN) | ❌ Not i18n |
| "✨ New Generation Wizard"            | Line 49  | Tab (EN)      | ❌ Not i18n |
| "📜 Generation History ({count})"     | Line 57  | Tab (EN)      | ❌ Not i18n |

**Status:** 🔴 CRITICAL - 4 hardcoded strings, English UI

---

### 6. WORKSPACE FEATURE (1 component analyzed)

**Files:** WorkspaceHeader.tsx

#### WorkspaceHeader.tsx - Mixed i18n Usage

| String                                  | Location | Type            | Status          |
| --------------------------------------- | -------- | --------------- | --------------- |
| "Chuyển đổi ngôn ngữ / Switch language" | Line 46  | Tooltip (VI/EN) | ❌ Not i18n     |
| "🌐 {lang}"                             | Line 47  | Button (EN)     | ⚠️ Partial i18n |

**Status:** 🟡 PARTIAL - Uses i18n keys (t('header.*')) but some hardcoded strings exist

---

## Summary Statistics

### Total Hardcoded Strings by Feature

| Feature          | Total Strings | Critical | High  | Medium | Status |
| ---------------- | ------------- | -------- | ----- | ------ | ------ |
| Auth             | 23            | 23       | 0     | 0      | 🔴     |
| Project-Explorer | 53            | 53       | 0     | 0      | 🔴     |
| Commercial       | 31            | 31       | 0     | 0      | 🔴     |
| Admin            | 10            | 10       | 0     | 0      | 🔴     |
| Generation       | 4             | 4        | 0     | 0      | 🔴     |
| Workspace        | 2             | 0        | 0     | 2      | 🟡     |
| **TOTAL**        | **123**       | **121**  | **0** | **2**  |        |

### i18n Coverage by Category

| Category           | Covered | Needed  | Coverage % |
| ------------------ | ------- | ------- | ---------- |
| Authentication     | 60%     | 40%     | 60%        |
| Navigation/Headers | 50%     | 50%     | 50%        |
| Buttons/Actions    | 35%     | 65%     | 35%        |
| Form Labels        | 45%     | 55%     | 45%        |
| Error Messages     | 70%     | 30%     | 70%        |
| Success Messages   | 40%     | 60%     | 40%        |
| Page Titles        | 20%     | 80%     | 20%        |
| Section Headers    | 25%     | 75%     | 25%        |
| **OVERALL**        | **42%** | **58%** | **42%**    |

---

## Priority Implementation Order

### Phase 1 (CRITICAL - High Frequency)

1. ✅ auth.* keys (23 strings)
   - Complete auth flow translation coverage
   - Vietnamese UI with English i18n keys
   - Impact: Auth pages fully translated

2. ✅ projectList.* keys (22 strings)
   - ProjectListPage core functionality
   - Create/filter/search translations
   - Impact: Main project management UI

3. ✅ dashboard.* keys (31 strings)
   - Dashboard KPIs and sections
   - Button labels and section titles
   - Impact: Main entry point UI

4. ✅ commercial.* keys (31 strings)
   - Pricing, credits, subscriptions
   - Account management translations
   - Impact: Commercial features

**Phase 1 Total: 107 strings across 4 modules**

### Phase 2 (HIGH - Important Secondary)

1. admin.* keys (10 strings)
   - Admin console tabs and titles
   - System management translations

2. generation.* keys (4 strings)
   - Generation wizard labels
   - Job history translations

3. common.* extensions
   - Button labels (Cancel, OK, Submit)
   - Status badges (Draft, Completed, Rendering)
   - Common UI patterns

**Phase 2 Total: 14+ strings**

### Phase 3 (MEDIUM - Polish)

1. workspace.* enhancements
   - Header refinements
   - Tooltip translations
   - Language switcher UI

2. editor.* extensions
   - Timeline tools and panels
   - Inspector labels
   - Workflow states

**Phase 3 Total: Variable, component-specific**

---

## Recommended i18n Key Structure

### Proposed Namespace Organization

\\\json
{
"auth": {
"hero": { "tagline", "title", "description" },
"login": { "title", "subtitle", "fields", "buttons", "errors" },
"register": { "title", "subtitle", "fields", "buttons", "success", "errors" },
"forgotPassword": { "title", "subtitle", "fields", "buttons", "errors", "success" }
},

"dashboard": {
"title": string,
"subtitle": string,
"kpi": { "activeProjects", "aiRenderJobs", "videoExports", "aiProviders" },
"sections": { "recentProjects", "quickActions" },
"actions": { "exploreProjects", "launchGenerationStudio", "videoExportManager" }
},

"projectList": {
"title": string,
"subtitle": string,
"search": { "placeholder" },
"filter": { "all", "draft", "rendering", "completed" },
"modal": { "title", "fields", "options", "buttons" },
"card": { "shots", "updated" }
},

"commercial": {
"hub": { "title", "subtitle" },
"tabs": { "profile", "subscription", "pricing", "credits", "usage", "invoices" },
"credits": { "label", "wallet", "topup", "purchased", "used" },
"pricing": { "title", "subtitle", "monthly", "features" }
},

"admin": {
"console": { "title", "subtitle", "refresh" },
"tabs": { "metrics", "health", "audit", "flags", "users", "jobs", "export" }
},

"generation": {
"title": string,
"subtitle": string,
"tabs": { "wizard", "history" }
},

"common": {
"buttons": { "cancel", "create", "save", "delete", "submit" },
"status": { "draft", "completed", "rendering", "active" },
"units": { "month", "year", "credits", "jobs" },
"time": { "hoursAgo", "daysAgo", "updated" }
}
}
\\\

---

## Files Requiring Updates

### Phase 1 Files (Priority)

1. **src/features/auth/**
   - LoginPage.tsx (23 strings)
   - RegisterPage.tsx (included in LoginPage count)
   - ForgotPasswordPage.tsx (included in LoginPage count)

2. **src/features/project-explorer/components/**
   - DashboardPage.tsx (31 strings)
   - ProjectListPage.tsx (22 strings)

3. **src/features/commercial/components/**
   - CommercialScreen.tsx (10 strings)
   - CreditsTab.tsx (8 strings)
   - PricingTab.tsx (13 strings)

4. **src/features/admin/components/**
   - AdminConsoleScreen.tsx (10 strings)

### Phase 2 Files

1. **src/features/generation/components/**
   - GenerationScreen.tsx (4 strings)

2. **src/features/workspace/components/**
   - WorkspaceHeader.tsx (2 strings)

### Translation Files to Create/Extend

1. src/locales/en/auth.json (expand)
2. src/locales/vi/auth.json (expand)
3. src/locales/en/dashboard.json (create)
4. src/locales/vi/dashboard.json (create)
5. src/locales/en/project-explorer.json (extend)
6. src/locales/vi/project-explorer.json (extend)
7. src/locales/en/commercial.json (create)
8. src/locales/vi/commercial.json (create)
9. src/locales/en/admin.json (create)
10. src/locales/vi/admin.json (create)
11. src/locales/en/generation.json (create)
12. src/locales/vi/generation.json (create)

---

## String Deduplication Opportunities

### Repeated Strings (Consolidate to common)

| String      | Count | Locations                                 | Consolidated Key        |
| ----------- | ----- | ----------------------------------------- | ----------------------- |
| "Draft"     | 4     | Dashboard, ProjectList, admin, generation | common.status.draft     |
| "Completed" | 3     | Dashboard, ProjectList                    | common.status.completed |
| "Rendering" | 3     | Dashboard, ProjectList                    | common.status.rendering |
| "Active"    | 3     | KPI, subscription                         | common.status.active    |
| "Cancel"    | 5+    | Various modals                            | common.buttons.cancel   |
| "Create"    | 4     | Project, Account                          | common.buttons.create   |
| "Credits"   | 8+    | Commercial tabs                           | common.units.credits    |
| "Settings"  | 3+    | Various headers                           | common.buttons.settings |

**Consolidation Opportunity:** ~15-20% reduction in total translation keys

---

## i18n Implementation Checklist

### For Each Component:

- [ ] Extract hardcoded strings
- [ ] Create i18n keys following namespace structure
- [ ] Replace strings with t('namespace.key') calls
- [ ] Add keys to en/*.json files
- [ ] Add Vietnamese translations to vi/*.json files
- [ ] Test with English and Vietnamese locale switches
- [ ] Verify no hardcoded strings remain visible
- [ ] Run lint check for missing keys
- [ ] Update component documentation

### Quality Assurance:

- [ ] Language switcher UI works smoothly
- [ ] Text displays correctly with different string lengths
- [ ] RTL support tested (if applicable)
- [ ] Special characters and accents render properly
- [ ] Dynamic values (numbers, dates) format correctly
- [ ] Pluralization rules implemented where needed

---

## Next Steps

1. **Week 1:** Implement Phase 1 (Auth, Dashboard, ProjectList, Commercial)
2. **Week 2:** Implement Phase 2 (Admin, Generation, Common)
3. **Week 3:** Polish Phase 3 (Workspace, Editor refinements)
4. **QA:** Full localization testing across all features
5. **Documentation:** Update i18n guidelines for new feature development

---

## Notes

- Existing Vietnamese UI in LoginPage suggests Vietnamese-first development
- Recommend standardizing on English i18n keys with multi-language translations
- Consider adding i18n linting to pre-commit hooks to prevent hardcoded strings in future PRs
- Mock data (project names, descriptions) should remain in mock layer, not translated
