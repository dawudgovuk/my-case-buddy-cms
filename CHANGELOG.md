# Change Log

## Case Details Executive Redesign, Non-Overflowing Header & Modern Underline Tabs

### Features & Capabilities Added:
1. **Case Summary Card Redesign (`CaseSummaryCard.tsx`)**:
   - Fixed the critical horizontal overflow bug where non-existent Bootstrap class `w-md-auto` paired with `w-100` forced the action buttons to occupy 100% width with `flex-shrink: 0`, popping "Edit Case" out of the card boundary.
   - Added clean "Back to Cases" breadcrumb navigation link at the top of the view.
   - Streamlined title presentation: prominent case title header accompanied by subtle monospace ID badge and status pill, eliminating raw technical ID prefixes.
   - Replaced solid high-contrast metric badges with elegant, muted `.stat-pill` elements featuring round icon containers and clear counts.
2. **Modern Case Details Tab Navigation (`CaseDetails.tsx` & `index.css`)**:
   - Replaced default Bootstrap rounded-outline tab styling with a sleek, Linear/Apple-inspired underline tab bar with smooth hover transitions, active indicators, and no jarring background outlines.
   - Integrated semantic icons (`FaInfoCircle`, `FaUsers`, `FaCalendarAlt`, `FaFileAlt`, `FaBalanceScale`, `FaStickyNote`, `FaUserFriends`) and dynamic item count badges into each tab title.
3. **Procedural Timeline Polish (`CaseTimeline.tsx`)**:
   - Added missing `mediation` stage icon (`FaHandshake`) to `stageIcons` to replace the fallback numeric text for the Mediation/Assessment stage.
4. **Fluid Responsive Viewports (`App.tsx`)**:
   - Upgraded main `<Container>` to `<Container fluid="xl">`, ensuring full responsive breathing room on laptops, split-screen browsers, and DevTools viewports without artificial 720px cramping.

## Cases Dashboard Design Polish, Canonical Routing (`/cases`) & Pixel-Perfect Favicon

### Features & Capabilities Added:
1. **Pixel-Perfect Brand Favicon (`public/` & `index.html`)**:
   - Replaced icon with the exact two-tone heart logo centered within a crisp, rounded white container matching the browser tab aesthetic:
     - Vector SVG: [`public/favicon.svg`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/public/favicon.svg) with rounded `#ffffff` background and `#ff6363` / `#ffa7a7` dual halves.
     - Multi-resolution ICO: [`public/favicon.ico`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/public/favicon.ico) (16, 32, 48, 64px).
     - High-DPI PNG: [`public/favicon.png`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/public/favicon.png) (32x32).
     - Cache-busting query strings (`?v=3`) added to [`index.html`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/index.html).
2. **Cases Dashboard Visual Bug Fixes (`CasesHeader.tsx`, `CasesFilterBar.tsx`, `CaseListItemCard.tsx`)**:
   - **Header Button Fix**: Corrected "+ New Case" button in [`CasesHeader.tsx`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/src/components/case/CasesHeader.tsx) to prevent horizontal stretching across the desktop viewport.
   - **Unified Filter Bar**: Streamlined [`CasesFilterBar.tsx`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/src/components/case/CasesFilterBar.tsx) into a single cohesive toolbar with no large empty gaps between the search box and filter pills. Replaced intrusive `title` attributes with accessible `aria-label` to remove unwanted browser tooltips.
   - **Case Card Structure**: Restored clean horizontal card layout on desktop in [`CaseListItemCard.tsx`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/src/components/case/CaseListItemCard.tsx), ensuring secondary metadata (court, case type, judge, start date) renders in a compact, inline arrangement rather than wrapping vertically into 5 lines.
3. **Canonical Cases Routing (`/cases`)**:
   - Added explicit `<Route path="/cases" element={...} />` in [`App.tsx`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/src/App.tsx) for `CasesList`.
   - Configured root path (`/`) to redirect LIP users cleanly to `/cases` and professionals to `/professional-dashboard`.
   - Updated navigation in [`AppHeader.tsx`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/src/components/common/AppHeader.tsx) so the "Cases" link routes to `/cases` and properly reflects active states.
   - Updated post-login navigation in [`Login.tsx`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/src/pages/Login.tsx) to route LIP users to `/cases`.
   - Updated back navigation in [`CaseDetails.tsx`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/src/pages/CaseDetails.tsx) and cancel action in [`CaseForm.tsx`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/src/pages/CaseForm.tsx) to return to `/cases`.

## Mobile-First Responsive Layout Overhaul & Mandatory Engineering Rules

### Features & Capabilities Added:
1. **Mandatory Mobile-First Responsive Directives for all AI Agents & Engineers**:
   - Updated [`AGENTS.md`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/AGENTS.md), [`GEMINI.md`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/GEMINI.md), and [`.agents/rules/coding-standards.md`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/.agents/rules/coding-standards.md) to permanently mandate 100% fluid, mobile-first responsive layouts across all viewports (Mobile `<576px`, Tablet `576-991px`, Split-screen `992-1199px`, and Desktop `>=1200px`).
   - Updated [`.agents/skills/code-reviewer/SKILL.md`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/.agents/skills/code-reviewer/SKILL.md) to require automated verification for zero horizontal scrollbar overflow, touch target sizing (min 44px), fluid toolbar wrapping, and smooth tab scrolling.
2. **Global CSS & Viewport Hygiene (`src/index.css`)**:
   - Added `overflow-x: hidden` and `max-width: 100vw` on `html` and `body` to eliminate horizontal scrollbar drift.
   - Built `.nav-tabs-responsive` and `.case-details-tabs-wrapper` for native mobile touch-swipeable horizontal scrolling across multi-tab layouts.
   - Added responsive adjustments for `.metric-card`, `.stat-pill`, `.case-row-item`, and action buttons on mobile screens (`<576px` and `<768px`).
3. **App Header & Navigation Drawer (`AppHeader.tsx`)**:
   - Replaced `expand="lg"` with `expand="xl"` to ensure tablets, small laptops, and split-screen browser windows with DevTools open collapse smoothly into a sleek mobile hamburger drawer instead of squishing navigation links.
   - Added auto-closing controlled state (`expanded`, `setExpanded(false)`) so clicking any nav link immediately closes the mobile dropdown menu.
   - Styled the mobile drawer with responsive controls for language switching and user profile menu.
4. **Cases Dashboard & Filter Bar Overhaul (`CasesFilterBar.tsx` & `CasesHeader.tsx`)**:
   - Redesigned `CasesFilterBar.tsx` into a modern 2-row fluid layout:
     - Search input expands flexibly with clear button and view toggle controls.
     - Status segmented filter pills swipe horizontally on mobile without breaking lines unevenly.
     - Case Type and Sort dropdowns dynamically span 50/50 or full width on small screens and auto width on desktop.
   - Enhanced `CasesHeader.tsx` metric stat cards with responsive padding, font scaling, and 2x2 mobile / 4x1 desktop layout.
5. **Case List Item Card & Mobile Action Bar (`CaseListItemCard.tsx`)**:
   - Replaced rigid single-line `text-truncate` on secondary metadata with clean responsive wrapping so court, case type, and judge are never cut off with `...`.
   - Built a touch-friendly bottom action bar for mobile viewports (`w-100` with `flex-fill` on `<768px`), smoothly transitioning to right-aligned controls on desktop.
6. **Executive Dashboards & Tab Navigation (`ProfessionalHeader.tsx`, `DashboardHeader.tsx`, `TabNav.tsx`, `CaseDetails.tsx`)**:
   - Formatted stat metrics into responsive 2x2 grids on mobile and 4-column rows on tablet/desktop.
   - Converted long tab collections into smooth, horizontally scrollable tab bars.
7. **Form Ergonomics (`CaseForm.tsx`, `Register.tsx`, `Login.tsx`)**:
   - Made stepper navigation buttons and verification alerts wrap responsively on narrow viewports.

## Support & Knowledge Base Integration & Brand Favicon

### Features & Capabilities Added:
1. **Brand Favicon Fix (`index.html` & `public/`)**:
   - Replaced default Vite placeholder with the official brand heart logo icon across all formats:
     - Vector SVG: [`public/favicon.svg`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/public/favicon.svg)
     - High-DPI PNG: [`public/favicon.png`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/public/favicon.png)
     - Legacy fallback: [`public/favicon.ico`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/public/favicon.ico)
     - Apple Touch Icon: `apple-touch-icon`
   - Updated page title to `My Case Buddy - Family Court CMS`.
2. **Official Support & Knowledge Base Integration (`https://support.mycourtbuddy.com/`)**:
   - **Navbar Header ([`AppHeader.tsx`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/src/components/common/AppHeader.tsx))**:
     - Added a dedicated "Support" navigation link with life-ring icon and external link badge opening [`https://support.mycourtbuddy.com/`](https://support.mycourtbuddy.com/) in a new tab.
     - Added "Support & Help Centre" item to the user profile menu dropdown.
   - **Application Footer ([`App.tsx`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/src/App.tsx))**:
     - Enhanced legal footer with an actionable "Support & Knowledge Base" button.
   - **Professional FAQ & Guidance ([`ProfessionalFaqModal.tsx`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/src/components/dashboard/ProfessionalFaqModal.tsx))**:
     - Added dedicated topic detailing where to find legal articles on Children Case Law, Grounds for Appeal, Alienating Behaviours, and Hints for Video Calls with Children.
     - Integrated direct CTA button in modal footer.
   - **Localization (`src/i18n/`)**:
     - Added translations for `common.support`, `common.supportKnowledgeBase`, and `common.supportCenter` across English, Welsh, Spanish, and Polish.

## Verified & Unverified Professional Users Balanced Rollout & Clean Login

### Features & Capabilities Added:
1. **Balanced Distribution of Verified & Unverified Users (`src/services/auth.ts` & `src/seed.ts`)**:
   - Implemented a clean, balanced split across all legal professional roles:
     - **McKenzie Friends**: 8 Verified (`isVerified: true`), 7 Unverified (`isVerified: false`).
     - **Solicitors**: 8 Verified (`isVerified: true`), 7 Unverified (`isVerified: false`).
     - **Barristers**: 8 Verified (`isVerified: true`), 7 Unverified (`isVerified: false`).
     - **Litigants in Person**: 15 LIP users (ready to file applications and seek support).
   - Self-healing migration in [`listUsers()`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/src/services/auth.ts) balances existing browser storage automatically without wiping user cases.
2. **Streamlined & Focused Login Experience (`Login.tsx`)**:
   - Removed the extra "Quick Demo Profiles:" banner per user request.
   - Organized the user selection dropdown with accessible `<optgroup>` categories:
     - `✓ Verified Legal Professionals (Ready for Practice)` (24 verified professionals)
     - `Litigants in Person (LIP)` (15 litigants)
     - `⚠️ Unverified Professionals (Awaiting Email Verification)` (21 unverified professionals)
   - Kept the instant 1-click verification alert for when an unverified user is selected, allowing instant account clearance directly from the login page.

## Internationalization (i18n) Translation Engine & Full Page Localization

### Features & Capabilities Added:
1. **Type-Safe Internationalization Architecture (`src/i18n/`)**:
   - Created a zero-dependency, pure TypeScript translation engine supporting 4 languages:
     - **English (`en`)**: UK HMCTS Family Court standard terminology.
     - **Welsh (`cy` - Cymraeg)**: Legally mandated bilingual support under the Welsh Language Act for HMCTS Welsh Family Courts and Cafcass Cymru.
     - **Spanish (`es`)**: Complete localization for Hispanic court users and litigants.
     - **Polish (`pl`)**: Complete localization for Polish-speaking UK court users.
   - Built [`translate()`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/src/i18n/index.ts) with strict dot-notation path resolution, parameter interpolation (`{{param}}`), and graceful fallback to English.
   - Built [`languageStore.ts`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/src/store/languageStore.ts) using Zustand and `localStorage` persistence with automatic HTML `lang` attribute synchronization.
   - Authoring custom [`useTranslation`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/src/hooks/useTranslation.ts) hook exposing typed translation functions and active language metadata.
2. **Language Switcher Component (`LanguageSwitcher.tsx`)**:
   - Created accessible dropdown selector [`LanguageSwitcher.tsx`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/src/components/common/LanguageSwitcher.tsx) integrated directly into [`AppHeader.tsx`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/src/components/common/AppHeader.tsx) with native name labels and flag icons.
   - Registered `LanguageSwitcher` in the Component Explorer registry (`/components`).
3. **Comprehensive Multi-Page Localization (Every Page Translated)**:
   - [`AppHeader.tsx`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/src/components/common/AppHeader.tsx): Navigation links, auth buttons, role indicators, and language switcher.
   - [`App.tsx`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/src/App.tsx): Legal footer disclaimer and dynamic document titles.
   - [`CaseDetails.tsx`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/src/pages/CaseDetails.tsx): Tab navigation, breadcrumbs, action buttons, and not-found states.
   - [`CaseOverviewTab.tsx`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/src/components/case/tabs/CaseOverviewTab.tsx) & [`CaseMetadataOverview.tsx`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/src/components/case/CaseMetadataOverview.tsx): Metadata cards, judge indicators, and accordion section labels.
   - [`CasesList.tsx`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/src/pages/CasesList.tsx), [`CasesHeader.tsx`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/src/components/case/CasesHeader.tsx), [`CasesFilterBar.tsx`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/src/components/case/CasesFilterBar.tsx), [`EmptyCasesState.tsx`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/src/components/case/EmptyCasesState.tsx), [`CaseListItemCard.tsx`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/src/components/case/CaseListItemCard.tsx), & [`DeleteCaseModal.tsx`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/src/components/case/DeleteCaseModal.tsx): Full filter bar, sort controls, case action triggers, and irreversible deletion modals.
   - [`CaseForm.tsx`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/src/pages/CaseForm.tsx): 3-step wizard headers, navigation steps, and proceed buttons.
   - [`LIPDashboard.tsx`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/src/pages/LIPDashboard.tsx): Litigant dashboard header, empty states, and peer support badges.
   - [`ProfessionalDashboard.tsx`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/src/pages/ProfessionalDashboard.tsx): Practice tabs, email verification notices, and newcomer guide triggers.
   - [`PeerDirectory.tsx`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/src/pages/PeerDirectory.tsx) & [`PeerSupportRequestModal.tsx`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/src/components/directory/PeerSupportRequestModal.tsx): Professional directory filters, search inputs, and peer review request modals.
   - [`Login.tsx`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/src/pages/Login.tsx) & [`RoleRegistrationLinks.tsx`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/src/components/auth/RoleRegistrationLinks.tsx): Sign-in headers, user selector dropdown, and role registration cards.
   - [`Register.tsx`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/src/pages/Register.tsx) & [`RegistrationPendingCard.tsx`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/src/components/auth/RegistrationPendingCard.tsx): Registration form labels, verification simulation notices, and link buttons.
   - [`VerifyEmail.tsx`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/src/pages/VerifyEmail.tsx): Verification progress indicators, success welcome cards, and error fallback links.
   - [`InviteAccept.tsx`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/src/pages/InviteAccept.tsx): Invitation acceptance workflows, authentication gates, and member validation alerts.
   - [`ComponentShowcase.tsx`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/src/pages/ComponentShowcase.tsx): Component Explorer search, category tabs, and header descriptions.

## Code Optimization, Modular Decomposition & Agent Architecture Standards

### Features & Architectural Optimizations:
1. **Case Details Decomposition (`/cases/:id`)**:
   - Decomposed monolithic inline JSX from [`CaseDetails.tsx`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/src/pages/CaseDetails.tsx), reducing line count from 185 to 67 lines (<70 lines).
   - Created standalone [`CaseOverviewTab.tsx`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/src/components/case/tabs/CaseOverviewTab.tsx) encapsulating procedural timeline and collapsible accordion item summaries.
   - Created standalone [`CaseMetadataOverview.tsx`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/src/components/case/CaseMetadataOverview.tsx) adhering to ISP and SRP for clean metadata grid presentation.
2. **Centralized Domain Constants & Pure Utilities**:
   - Created [`src/utils/caseConstants.ts`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/src/utils/caseConstants.ts) centralizing `CASE_TYPE_OPTIONS`, `COURT_TYPE_OPTIONS`, `CASE_STATUS_OPTIONS`, `USER_ROLES`, and `CASE_DETAILS_TABS` navigation definitions.
   - Created [`src/utils/partyUtils.ts`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/src/utils/partyUtils.ts) establishing reusable domain pure functions: `partitionParties`, `countChildren`, `countAdults`, and `formatPartyName`. Eliminates duplicated inline filtering across `CaseDetails`, `PartiesTab`, and `CasesList`.
3. **Pages Directory Modular Optimization (`src/pages/`)**:
   - [`CasesList.tsx`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/src/pages/CasesList.tsx): Converted to consume centralized `CASE_TYPE_OPTIONS` and `countChildren` utilities.
   - [`PeerDirectory.tsx`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/src/pages/PeerDirectory.tsx): Extracted inline modal into standalone [`PeerSupportRequestModal.tsx`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/src/components/directory/PeerSupportRequestModal.tsx), reducing page complexity.
   - [`Register.tsx`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/src/pages/Register.tsx): Extracted verification wait card into standalone [`RegistrationPendingCard.tsx`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/src/components/auth/RegistrationPendingCard.tsx) and centralized `USER_ROLES`.
   - [`Login.tsx`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/src/pages/Login.tsx): Extracted registration role buttons into standalone [`RoleRegistrationLinks.tsx`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/src/components/auth/RoleRegistrationLinks.tsx).
4. **Component Explorer Integration (`/components`)**:
   - Created [`CaseDetailsPreviews.tsx`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/src/components/showcase/CaseDetailsPreviews.tsx) with interactive previews and registered all 5 new components in [`componentRegistry.ts`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/src/components/showcase/componentRegistry.ts).
5. **Directives & Agent Standards Updated Across Repository**:
   - Updated [`AGENTS.md`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/AGENTS.md), [`GEMINI.md`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/GEMINI.md), [`.agents/rules/coding-standards.md`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/.agents/rules/coding-standards.md), [`.agents/rules/solid-principles.md`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/.agents/rules/solid-principles.md), [`.agents/rules/task-orchestrator.md`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/.agents/rules/task-orchestrator.md), [`.agents/skills/code-reviewer/SKILL.md`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/.agents/skills/code-reviewer/SKILL.md), and [`.agents/skills/task-orchestrator/SKILL.md`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/.agents/skills/task-orchestrator/SKILL.md).
   - Mandated ultra-lean page containers (<150-200 lines), zero monolithic inline JSX, centralized constants/utilities, and mandatory component-first registration.

## [Unreleased] - Professional Dashboard Redesign & Newcomer Onboarding Experience

### Features & Capabilities Added:
1. **Professional Dashboard Redesign (`/professional-dashboard`)**:
   - Redesigned the dashboard to be welcoming, intuitive, and educational for newcomers unfamiliar with UK Family Court proceedings and McKenzie Friend duties.
   - Built an executive [`ProfessionalHeader.tsx`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/src/components/dashboard/ProfessionalHeader.tsx) with user role badging, email verification status pill, 4-metric interactive summary pills (Assigned Cases, Peer Requests, Hearings, Deadlines), and instant guide triggers.
   - Created beginner-friendly [`SystemQuickGuide.tsx`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/src/components/dashboard/SystemQuickGuide.tsx) with a 3-step visual walkthrough explaining user roles, FPR/GDPR safeguarding verification rationale, and the difference between assigned and peer support cases.
   - Authoring accessible [`ProfessionalFaqModal.tsx`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/src/components/dashboard/ProfessionalFaqModal.tsx) explaining core concepts in plain English: Litigants in Person (LIP), McKenzie Friends, confidentiality, hearing stages, and case collaboration.
   - Re-engineered [`VerificationGateCard.tsx`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/src/components/verification/VerificationGateCard.tsx) with 3-step visual cards, one-click demo verification, simulated resend link feedback, alternate routing to already-accessible assigned cases, and UK GDPR/FPR compliance badges.
   - Added friendly context headers to [`AssignedCasesTab.tsx`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/src/components/dashboard/AssignedCasesTab.tsx) and [`PeerSupportCasesTab.tsx`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/src/components/dashboard/PeerSupportCasesTab.tsx).
2. **Component Explorer Integration (`/components`)**:
   - All 3 new components catalogued in `componentRegistry.ts` with live interactive previews in [`ProfessionalDashboardPreviews.tsx`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/src/components/showcase/ProfessionalDashboardPreviews.tsx).

## Cases Page Redesign & Enhanced Case Management

### Features & Capabilities Added:
1. **Cases Dashboard Redesign (`/cases`)**:
   - Transformed the plain cases list into a high-end legal proceedings dashboard.
   - Added executive metrics header displaying total cases, active proceedings, scheduled upcoming hearings, and protected children.
   - Implemented real-time multi-dimensional search with status pills (All, Open, Stayed, Concluded), case type filter, sorting, and List/Grid view toggling.
   - Enhanced case list cards with status color-coded left borders, upcoming hearing alerts, and clean action buttons.
   - Integrated delete confirmation modal with irreversible deletion safeguards.
2. **New Standalone Modular Components (<300 lines, Zero `any`)**:
   - [`CasesHeader.tsx`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/src/components/case/CasesHeader.tsx): Executive overview header with stat pills and primary "+ Create New Case" CTA.
   - [`CasesFilterBar.tsx`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/src/components/case/CasesFilterBar.tsx): Multi-dimensional search, status filter pills with counts, sorting, and list/grid layout switcher.
   - [`EmptyCasesState.tsx`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/src/components/case/EmptyCasesState.tsx): Differentiated empty states for active search filters versus empty repositories.
   - [`DeleteCaseModal.tsx`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/src/components/case/DeleteCaseModal.tsx): Confirmation modal safeguarding against accidental loss of case records.
   - Redesigned [`CaseListItemCard.tsx`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/src/components/case/CaseListItemCard.tsx): Premium interactive case card with status accent, next hearing alert, and metadata chips.
3. **Component Explorer Integration (`/components`)**:
   - All 4 new components catalogued in `componentRegistry.ts` with interactive previews in [`CaseListPreviews.tsx`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/src/components/showcase/CaseListPreviews.tsx).

## Guided Case Creation Wizard & Design Redesign

### Features & Capabilities Added:
1. **Guided 3-Step Case Creation Stepper (`/cases/new` & `/cases/:id/edit`)**:
   - Replaced flat, monolithic form with an intuitive 3-step wizard with direct step navigation:
     - **Step 1: Case Details & Jurisdiction**: Quick proceeding template chips, grouped court registry details, auto-ID generator info, and LIP tips.
     - **Step 2: Parties & Children**: Dedicated sections for adult parties (applicants, respondents, guardians) and children subject to proceedings with FPR confidentiality protection.
     - **Step 3: Review & Launch**: Pre-filing readiness checklist, comprehensive case summary cards, and quick step-edit shortcuts before launch.
2. **New Standalone Modular Components (<300 lines, Zero `any`)**:
   - [`CaseCreationStepper.tsx`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/src/components/forms/CaseCreationStepper.tsx): Interactive step navigation bar with progress percentage and status badges.
   - [`CaseQuickPresets.tsx`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/src/components/forms/CaseQuickPresets.tsx): Standardized application chips for Child Arrangements, Prohibited Steps, Non-Molestation, and Financial Remedies.
   - [`PartyInlineEditor.tsx`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/src/components/case/PartyInlineEditor.tsx): Card-based editor with role selection, automatic child age calculation, and FPR rules notice.
   - [`CaseReadinessChecklist.tsx`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/src/components/forms/CaseReadinessChecklist.tsx): Status checklist verifying key filings before proceeding creation.
   - [`CaseReviewSummary.tsx`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/src/components/forms/CaseReviewSummary.tsx): Comprehensive review and launch confirmation dashboard.
3. **Component Explorer Integration (`/components`)**:
   - All 5 new components catalogued in `componentRegistry.ts` with interactive previews in [`CaseWizardPreviews.tsx`](file:///Users/parvez/Documents/MyPersonal/my-case-buddy-cms/src/components/showcase/CaseWizardPreviews.tsx).


### Features & Capabilities Added:
1. **Peer-to-Peer Support Directory (`/peer-directory`)**:
   - Directory enabling Litigants in Person to discover, filter, and connect with verified Solicitors, Barristers, and McKenzie Friends.
   - Filter by legal role and real-time search by legal practitioner name, firm, or chambers.
   - Case support modal allowing LIPs to request peer review on their cases.
2. **Professional Email Link Verification (`/verify-email/:token`)**:
   - Registration flow for legal professionals now mandates email verification to protect court data confidentiality.
   - Token-based verification endpoint validating professional status and upgrading credentials to `isVerified: true`.
   - Clear verification pending gate with simulation links for seamless demonstration and testing.
3. **Peer Support Case Visibility on Professional Dashboard**:
   - Access gate protecting other people's cases until email verification is confirmed.
   - Dedicated "Peer Support Cases" tab for verified legal professionals displaying cases where LIPs requested help.
   - Ability to review case metadata, notes, and join as a peer support team member.
4. **Architecture & SOLID Modularization**:
   - Decomposed oversized `ProfessionalDashboard.tsx` (473 lines -> 151 lines) into single-responsibility subcomponents (`UpcomingHearingsCard`, `DeadlinesCard`, `AssignedCasesTab`, `PeerSupportCasesTab`).
   - Clean TypeScript types with zero `any` and all lint checks passing.

## Change log (11 November 2025)

### Dashboards, Registration and invite link for Solicitors and Barristers

1. **User roles**
   - Added `Solicitor` and `Barrister` to user roles
   - Updated domain types to support professional fields (firm, registration number)

2. **Registration pages**
   - Created `/register/:role` for McKenzie Friend, Solicitor, and Barrister
   - Registration includes role-specific fields (firm for Solicitor/Barrister, registration number)
   - Auto-login after registration

3. **Invite link system**
   - Generate invite links from the "Team & Invites" tab in case details
   - Invite links support McKenzie Friend, Solicitor, and Barrister roles
   - Invite acceptance page at `/invite/:token`
   - Links expire after 30 days and can be marked as used

4. **Case management updates**
   - Added "Team & Invites" tab to case details
   - Can add Solicitor and Barrister directly to cases
   - View active invites and case team members

5. **LIP dashboard** (`/dashboard`)
   - Shows all cases owned by the Litigant in Person
   - Case progress visualization using Material-UI Stepper (similar to Semantic-UI Steps)
   - Shows next hearing information
   - Case stages defined per case type (Public Law, Private Law, etc.)

6. **Professional dashboard** (`/professional-dashboard`)
   - For McKenzie Friends, Solicitors, and Barristers
   - Upcoming hearings list sorted by date
   - Document submission deadlines as a to-do list
   - Overdue items highlighted
   - Checkbox to mark deadlines as submitted
   - Shows all assigned cases

7. **Routing and navigation**
   - Role-based routing (LIPs see different dashboards than professionals)
   - Navigation updated to include new pages
   - Login page includes registration links
### Notes

- Semantic-UI: Due to a Node.js installation issue, a custom `CaseSteps` component using Material-UI Stepper was created to match Semantic-UI Steps. To use Semantic-UI React later:
  ```bash
  npm install semantic-ui-react semantic-ui-css
  Then replace the `CaseSteps` component if desired.
- Case stages: Defined in `src/utils/caseStages.ts` for different case types (Public Law, Private Law, etc.)

- Deadlines: The deadline system is in place. You can create deadlines programmatically using the storage service functions.

All features are implemented and ready to use. The app should work with the existing Material-UI setup, and you can optionally switch to Semantic-UI later if needed.


- Updated `Register.tsx` to support LIP registration
- Added LIP registration button to the Login page
- 12 McKenzie Friends
- 12 Solicitors
- 70% have professionals assigned (McKenzie Friends, Solicitors, Barristers)
- Some professionals have multiple cases assigned
### 3. Logo implementation
- Created `Logo.tsx` component using SVG and HTML/CSS
- Matches the design:
  - Styled with proper typography and spacing
- Logo is clickable and navigates to the appropriate dashboard
- Multiple hearings per case
- Realistic names, firms, chambers, and judges
- Professional registration numbers for Solicitors and Barristers

The seed data will only populate if no cases exist, so existing data won't be overwritten. To reset and seed fresh data, clear localStorage and refresh the app.

Reviewing the current setup, then switching to React Bootstrap and implementing the improvements.


## Changelog (06 November 2025)

## Migration from Material-UI to React Bootstrap and Icon. Add Prioritised colour Coding Tablulate Case Lists

### 1. Dependencies updated
   - Removed Material-UI packages
   - Added: `react-bootstrap`, `bootstrap`, `semantic-ui-react`, `semantic-ui-css`, `react-icons`
   - Updated `package.json`

### 2. Logo
   - New logo component with balance scale icon
   - Gradient background and styling
   - Clickable, navigates to dashboard

### 3. LIP Dashboard
   - Horizontal Semantic UI Steps with icons per stage
   - Responsive cards with gradient styling
   - Icons throughout (calendar, location, eye)

### 4. Professional Dashboard
   - Sortable table (Case ID, Title, Next Hearing, Next Deadline, Priority)
   - Traffic light color coding:
     - Red (priority-high): Overdue deadlines
     - Yellow (priority-medium): Due within 7 days
     - Green (priority-low): OK
   - Icons and badges for status indicators

### 5. UI updates
   - Gradient backgrounds and buttons
   - Card hover effects
   - Colorful badges and alerts
   - Custom scrollbar styling
   - Responsive design for mobile and web

### 6. Seed data
   - 15 LIPs (was 12)
   - 15 McKenzie Friends (was 12)
   - 15 Solicitors (was 12)
   - 15 Barristers (was 12)
   - Unique names generation
   - 55 cases with varied assignments

### 7. Pages updated
   - Login: Bootstrap with icons
   - Register: Role-based color themes
   - App: Bootstrap navbar with icons
   - All pages use Bootstrap component


## Changelog (11 January 2026)

### `src/pages/CaseDetails.tsx`
- **UI/UX Enhancements:**
  - Added inline editing and deletion for parties, hearings, documents, and orders using new `Editable*Card` components.
  - Improved tab structure: "Case Detail" tab now uses a Bootstrap Accordion for summary, parties, children, hearings, orders, documents, and notes.
  - Added Ant Design Steps component for visual case progress with icons.
  - Enhanced party/child grouping: children without a solicitor are shown separately.
  - Badges for parties and children now reflect dynamic counts, with parties count excluding children without a solicitor.
  - Added more detailed fields for parties (DOB, address, contact info).
  - Hearings location field now uses an autocomplete datalist populated from the courts CSV.
- **Logic:**
  - Filtering logic for parties and children improved for accurate badge counts and display.

### `src/pages/CaseForm.tsx`
- **Form Improvements:**
  - Removed manual "Children involved" input; now dynamically displays the count of children added.
  - Added sections to add parties and children with detailed fields (DOB, address, contact info).
  - Lists of current parties and children are shown with remove buttons.
  - Improved state management for adding/removing parties and children.

### `src/pages/CasesList.tsx`
- **List Display:**
  - Badges for children and parties now use dynamic counts.
  - Parties badge excludes children without a solicitor.
  - Children badge shows count if any children are present.

### `src/seed.ts`
- **Seed Data:**
  - Parties and children now include additional fields: date of birth, address, contact email, and phone.
  - Randomized values for new fields in generated cases.

### `src/types/domain.ts`
- **Type Updates:**
  - `Party` interface now includes `address` and `contactPhone` fields for richer data.

### `README.md`
- **Documentation:**
  - Updated to reflect new features, UI changes, and data model enhancements.

### `package.json` & `package-lock.json`
- **Dependencies:**
  - Updated to include new or upgraded packages (e.g., Ant Design icons, possibly others for UI improvements).

---

**Summary:**  
These changes collectively improve the UI/UX for managing parties, children, hearings, and other case details, ensure dynamic and accurate counts, and enrich the data model for parties and children. The court location dropdown is now dynamically populated from a CSV, and the codebase is better documented and structured for future enhancements.