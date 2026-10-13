import { createElement } from 'react'
import type { ComponentItem } from './types'
import { ButtonsPreview } from './ButtonPreviews'
import {
  CaseCardTimelinePreview,
  CaseCardStepsPreview,
  CaseTimelinePreview,
  CaseStepsPreview,
} from './CasePreviews'
import {
  TabNavPreview,
  LogoPreview,
  UpcomingHearingsPreview,
  DeadlinesPreview,
} from './WidgetPreviews'
import { PeerSupporterCardPreview } from './DirectoryPreviews'
import { VerificationGateCardPreview, CaseStatusBadgePreview } from './VerificationPreviews'
import {
  PartyCardPreview,
  HearingCardPreview,
  DocumentCardPreview,
  OrderCardPreview,
  CaseNoteCardPreview,
  CaseSummaryCardPreview,
  InviteLinkCardPreview,
  CaseListItemCardPreview,
  PartyFormSectionPreview,
} from './CaseRecordPreviews'
import { CaseMetadataFormPreview, FormInputsSuitePreview } from './FormPreviews'

export const COMPONENT_CATALOG: ComponentItem[] = [
  // 1. Cases & Progression
  {
    id: 'case-card-timeline',
    name: 'Case Card (with Timeline)',
    category: 'Cases & Progression',
    filePath: 'src/components/case/CaseCard.tsx',
    importStatement: "import CaseCard from '../components/case/CaseCard'",
    description:
      'Litigant in Person dashboard case card integrated with the modern, collapsible, interactive procedural CaseTimeline component.',
    badges: ['Card + Timeline', 'Composite UI', 'Collapsible'],
    codeSnippet: `<CaseCard
  caseData={caseData}
  progressComponent="timeline"
  onTogglePeerSupport={(id, cur) => handleToggle(id, !cur)}
  onViewDetails={(id) => navigate('/cases/' + id)}
/>`,
    propsDoc: [
      { name: 'caseData', type: 'FamilyCase', required: true, description: 'Family court case entity object' },
      { name: 'progressComponent', type: "'steps' | 'timeline'", defaultVal: "'steps'", description: 'Selects embedded progress component' },
      { name: 'buttonLayout', type: "'vertical' | 'horizontal'", defaultVal: "'vertical'", description: 'Arrangement of action buttons' },
      { name: 'showProgress', type: 'boolean', defaultVal: 'true', description: 'Whether to show the progression tracker' },
      { name: 'showNextHearing', type: 'boolean', defaultVal: 'true', description: 'Whether to show next hearing alert box' },
      { name: 'actions', type: 'ReactNode', description: 'Optional custom action buttons override' },
    ],
    renderPreview: (onFeedback) => createElement(CaseCardTimelinePreview, { onFeedback }),
  },
  {
    id: 'case-timeline',
    name: 'Case Timeline (Standalone)',
    category: 'Cases & Progression',
    filePath: 'src/components/case/CaseTimeline.tsx',
    importStatement: "import CaseTimeline from '../components/case/CaseTimeline'",
    description:
      'Modern procedural timeline displaying case milestones with continuous vertical track, circular nodes, percentage progress bar, and expand/collapse controls.',
    badges: ['Timeline Component', 'Court Progression', 'Collapsible'],
    codeSnippet: `<CaseTimeline
  stages={stages}
  currentStageIndex={2}
  showProgressBar={true}
  collapsible={true}
  compact={false}
  interactive={true}
  onStageClick={(stage, index) => console.log(stage)}
/>`,
    propsDoc: [
      { name: 'stages', type: 'CaseStageInfo[]', required: true, description: 'Ordered list of court procedural stages' },
      { name: 'currentStageIndex', type: 'number', required: true, description: 'Zero-based index of current active stage' },
      { name: 'showProgressBar', type: 'boolean', defaultVal: 'true', description: 'Whether to show the progress summary bar' },
      { name: 'collapsible', type: 'boolean', defaultVal: 'true', description: 'Allows collapsing and expanding the full timeline' },
      { name: 'compact', type: 'boolean', defaultVal: 'false', description: 'Renders in compact format suitable for cards' },
      { name: 'interactive', type: 'boolean', defaultVal: 'false', description: 'Enables click handlers on stages' },
      { name: 'onStageClick', type: '(stage, index) => void', description: 'Fired when a stage node is clicked' },
    ],
    renderPreview: (onFeedback) => createElement(CaseTimelinePreview, { onFeedback }),
  },
  {
    id: 'case-card-steps',
    name: 'Case Card (with Steps - Original)',
    category: 'Cases & Progression',
    filePath: 'src/components/case/CaseCard.tsx',
    importStatement: "import CaseCard from '../components/case/CaseCard'",
    description:
      'The original dashboard case card as displayed on the LIP Dashboard, embedding the CaseSteps component with left-border highlighting.',
    badges: ['Original Card', 'LIP Dashboard Default'],
    codeSnippet: `<CaseCard
  caseData={caseData}
  progressComponent="steps"
  onTogglePeerSupport={(id, cur) => handleToggle(id, !cur)}
  onViewDetails={(id) => navigate('/cases/' + id)}
/>`,
    propsDoc: [
      { name: 'caseData', type: 'FamilyCase', required: true, description: 'Family court case entity object' },
      { name: 'progressComponent', type: "'steps' | 'timeline'", defaultVal: "'steps'", description: 'Renders original steps by default' },
      { name: 'buttonLayout', type: "'vertical' | 'horizontal'", defaultVal: "'vertical'", description: 'Arrangement of action buttons' },
    ],
    renderPreview: (onFeedback) => createElement(CaseCardStepsPreview, { onFeedback }),
  },
  {
    id: 'case-steps',
    name: 'Case Progress Stepper (Standalone)',
    category: 'Cases & Progression',
    filePath: 'src/components/case/CaseSteps.tsx',
    importStatement: "import CaseSteps from '../components/case/CaseSteps'",
    description:
      'The original vertical progress stepper displaying court stages with custom icons and left-border color indicators.',
    badges: ['Original Stepper', 'Domain Aware'],
    codeSnippet: `<CaseSteps
  stages={stages}
  currentStageIndex={2}
/>`,
    propsDoc: [
      { name: 'stages', type: 'CaseStageInfo[]', required: true, description: 'Ordered list of court procedural stages' },
      { name: 'currentStageIndex', type: 'number', required: true, description: 'Zero-based index of currently active stage' },
    ],
    renderPreview: (onFeedback) => createElement(CaseStepsPreview, { onFeedback }),
  },

  // 2. Case Management & Records (Extracted from CaseDetails.tsx)
  {
    id: 'case-summary-card',
    name: 'Case Summary Card',
    category: 'Case Management & Records',
    filePath: 'src/components/case/CaseSummaryCard.tsx',
    importStatement: "import CaseSummaryCard from '../components/case/CaseSummaryCard'",
    description:
      'Header metadata banner displaying case ID, court venue, case type, semantic status badge, party counts, hearing counts, and quick navigation actions.',
    badges: ['Header Banner', 'Semantic Status', 'Clean Architecture'],
    codeSnippet: `<CaseSummaryCard
  caseData={caseData}
  onEdit={() => navigate('/cases/' + id + '/edit')}
  onBack={() => navigate('/cases')}
/>`,
    propsDoc: [
      { name: 'caseData', type: 'FamilyCase', required: true, description: 'The family court case object' },
      { name: 'onEdit', type: '() => void', description: 'Triggered when Edit Case is clicked' },
      { name: 'onBack', type: '() => void', description: 'Triggered when Back to cases is clicked' },
      { name: 'showActions', type: 'boolean', defaultVal: 'true', description: 'Whether to show action buttons' },
    ],
    renderPreview: (onFeedback) => createElement(CaseSummaryCardPreview, { onFeedback }),
  },
  {
    id: 'party-card',
    name: 'Party Card (with Inline Edit)',
    category: 'Case Management & Records',
    filePath: 'src/components/case/PartyCard.tsx',
    importStatement: "import PartyCard from '../components/case/PartyCard'",
    description:
      'Modular card representing a case party (Applicant, Respondent, Child, Guardian, Intervener) with contact info, DOB, address, solicitor details, and inline editing form.',
    badges: ['Inline Editable', 'Child Support', 'Type-Safe'],
    codeSnippet: `<PartyCard
  party={party}
  onSave={(updated) => updateParty(updated)}
  onDelete={(id) => removeParty(id)}
  readOnly={false}
/>`,
    propsDoc: [
      { name: 'party', type: 'Party', required: true, description: 'Party domain entity' },
      { name: 'onSave', type: '(party: Party) => void', description: 'Callback when edited party is saved' },
      { name: 'onDelete', type: '(id: string) => void', description: 'Callback when delete is confirmed' },
      { name: 'readOnly', type: 'boolean', defaultVal: 'false', description: 'Hides edit/delete actions for view-only contexts' },
    ],
    renderPreview: (onFeedback) => createElement(PartyCardPreview, { onFeedback }),
  },
  {
    id: 'hearing-card',
    name: 'Hearing Card (with Inline Edit)',
    category: 'Case Management & Records',
    filePath: 'src/components/case/HearingCard.tsx',
    importStatement: "import HearingCard from '../components/case/HearingCard'",
    description:
      'Card displaying hearing date, time, court venue, presiding judge, and directions notes with inline editing and court datalist autocomplete.',
    badges: ['Court Scheduling', 'Inline Editable', 'Directions'],
    codeSnippet: `<HearingCard
  hearing={hearing}
  courtLocations={courtLocationsList}
  onSave={(updated) => updateHearing(updated)}
  onDelete={(id) => removeHearing(id)}
/>`,
    propsDoc: [
      { name: 'hearing', type: 'Hearing', required: true, description: 'Hearing domain entity' },
      { name: 'onSave', type: '(hearing: Hearing) => void', description: 'Callback when edited hearing is saved' },
      { name: 'onDelete', type: '(id: string) => void', description: 'Callback when hearing is removed' },
      { name: 'courtLocations', type: 'string[]', description: 'List of UK court venues for autocomplete' },
      { name: 'readOnly', type: 'boolean', defaultVal: 'false', description: 'View-only mode toggle' },
    ],
    renderPreview: (onFeedback) => createElement(HearingCardPreview, { onFeedback }),
  },
  {
    id: 'document-card',
    name: 'Document & Evidence Card',
    category: 'Case Management & Records',
    filePath: 'src/components/case/DocumentCard.tsx',
    importStatement: "import DocumentCard from '../components/case/DocumentCard'",
    description:
      'Card displaying court filings, statements, bundles, and exhibits with secure URL link, upload timestamp, notes, and edit form.',
    badges: ['Filing Evidence', 'Document Types', 'Inline Editable'],
    codeSnippet: `<DocumentCard
  document={documentRecord}
  onSave={(updated) => updateDoc(updated)}
  onDelete={(id) => removeDoc(id)}
/>`,
    propsDoc: [
      { name: 'document', type: 'DocumentRecord', required: true, description: 'Document record entity' },
      { name: 'onSave', type: '(doc: DocumentRecord) => void', description: 'Callback on save' },
      { name: 'onDelete', type: '(id: string) => void', description: 'Callback on delete' },
      { name: 'readOnly', type: 'boolean', defaultVal: 'false', description: 'View-only mode toggle' },
    ],
    renderPreview: (onFeedback) => createElement(DocumentCardPreview, { onFeedback }),
  },
  {
    id: 'order-card',
    name: 'Court Order Card',
    category: 'Case Management & Records',
    filePath: 'src/components/case/OrderCard.tsx',
    importStatement: "import OrderCard from '../components/case/OrderCard'",
    description:
      'Card displaying judicial orders (Child Arrangements, Non-Molestation, Prohibited Steps), issue dates, expiry alerts, and directions summaries.',
    badges: ['Judicial Orders', 'Expiry Alert', 'Inline Editable'],
    codeSnippet: `<OrderCard
  order={orderRecord}
  onSave={(updated) => updateOrder(updated)}
  onDelete={(id) => removeOrder(id)}
/>`,
    propsDoc: [
      { name: 'order', type: 'OrderRecord', required: true, description: 'Court order record entity' },
      { name: 'onSave', type: '(order: OrderRecord) => void', description: 'Callback on save' },
      { name: 'onDelete', type: '(id: string) => void', description: 'Callback on delete' },
      { name: 'readOnly', type: 'boolean', defaultVal: 'false', description: 'View-only mode toggle' },
    ],
    renderPreview: (onFeedback) => createElement(OrderCardPreview, { onFeedback }),
  },
  {
    id: 'case-note-card',
    name: 'Case Note Card',
    category: 'Case Management & Records',
    filePath: 'src/components/case/CaseNoteCard.tsx',
    importStatement: "import CaseNoteCard from '../components/case/CaseNoteCard'",
    description:
      'Timestamped activity note displaying case log entries, legal advice updates, and attendance notes with author identity.',
    badges: ['Attendance Note', 'Timestamped'],
    codeSnippet: `<CaseNoteCard note={caseNote} />`,
    propsDoc: [
      { name: 'note', type: 'CaseNote', required: true, description: 'Case note entity with author, text, createdAt' },
    ],
    renderPreview: () => createElement(CaseNoteCardPreview),
  },
  {
    id: 'invite-link-card',
    name: 'Team Invite Link Card',
    category: 'Case Management & Records',
    filePath: 'src/components/case/InviteLinkCard.tsx',
    importStatement: "import InviteLinkCard from '../components/case/InviteLinkCard'",
    description:
      'Card displaying generated case invite links for solicitors, barristers, or McKenzie friends with token URL and one-click copy to clipboard.',
    badges: ['RBAC Sharing', 'Clipboard Copy', 'Role Badges'],
    codeSnippet: `<InviteLinkCard
  id="inv-1"
  role="McKenzieFriend"
  token="inv_token_9918"
  createdAt="2026-10-10"
/>`,
    propsDoc: [
      { name: 'role', type: 'string', required: true, description: 'Role assigned to invitee' },
      { name: 'token', type: 'string', required: true, description: 'Secure token string' },
      { name: 'createdAt', type: 'string', required: true, description: 'Creation date ISO' },
      { name: 'usedAt', type: 'string', description: 'Timestamp when token was accepted' },
      { name: 'baseUrl', type: 'string', description: 'Origin domain URL' },
    ],
    renderPreview: (onFeedback) => createElement(InviteLinkCardPreview, { onFeedback }),
  },
  {
    id: 'party-form-section',
    name: 'Party & Child Form Section',
    category: 'Case Management & Records',
    filePath: 'src/components/case/PartyFormSection.tsx',
    importStatement: "import PartyFormSection from '../components/case/PartyFormSection'",
    description:
      'Reusable form card for adding and managing parties or children during case creation or edition.',
    badges: ['Form Section', 'Children & Adult Parties'],
    codeSnippet: `<PartyFormSection
  parties={form.parties}
  onAddParty={handleAddParty}
  onRemoveParty={handleRemoveParty}
  isChildSection={false}
/>`,
    propsDoc: [
      { name: 'parties', type: 'Party[]', required: true, description: 'Current list of parties in form' },
      { name: 'onAddParty', type: '(party: Party) => void', required: true, description: 'Callback when new party is submitted' },
      { name: 'onRemoveParty', type: '(id: string) => void', required: true, description: 'Callback when party is deleted' },
      { name: 'isChildSection', type: 'boolean', defaultVal: 'false', description: 'Configures section for children without solicitor fields' },
    ],
    renderPreview: (onFeedback) => createElement(PartyFormSectionPreview, { onFeedback }),
  },

  // 3. Form Inputs & Controls (Extracted from /cases/new)
  {
    id: 'case-metadata-form',
    name: 'Case Metadata Form (from /cases/new)',
    category: 'Form Inputs & Controls',
    filePath: 'src/components/forms/CaseMetadataForm.tsx',
    importStatement: "import CaseMetadataForm from '../components/forms/CaseMetadataForm'",
    description:
      'The comprehensive case input block extracted from /cases/new, capturing Title, Case Number, Court Jurisdiction, Case Type, Status, Started Date, and Presiding Judge.',
    badges: ['Extracted from /cases/new', 'Composite Form', 'Type-Safe'],
    codeSnippet: `<CaseMetadataForm
  values={formValues}
  onChange={(field, val) => handleFieldChange(field, val)}
  childrenCount={2}
/>`,
    propsDoc: [
      { name: 'values', type: 'CaseMetadataFormValues', required: true, description: 'Object containing title, id, court, caseType, status, startedAt, allocatedJudge' },
      { name: 'onChange', type: '(field, value) => void', required: true, description: 'Generic field update handler' },
      { name: 'disabled', type: 'boolean', defaultVal: 'false', description: 'Disables all form inputs' },
      { name: 'childrenCount', type: 'number', description: 'Optional children count indicator badge' },
    ],
    renderPreview: (onFeedback) => createElement(CaseMetadataFormPreview, { onFeedback }),
  },
  {
    id: 'form-inputs-suite',
    name: 'Form Inputs Suite (TextInput, Select, Date, Textarea)',
    category: 'Form Inputs & Controls',
    filePath: 'src/components/forms/TextInputField.tsx',
    importStatement:
      "import TextInputField from '../components/forms/TextInputField'\nimport SelectField from '../components/forms/SelectField'\nimport DateField from '../components/forms/DateField'\nimport TextareaField from '../components/forms/TextareaField'",
    description:
      'Standardized form controls with labels, required indicators, icon prefixes, validation error displays, and helper texts.',
    badges: ['Atomic Controls', 'Validation Ready', 'Icons Support'],
    codeSnippet: `<TextInputField label="Name" value={val} onChange={setVal} required icon={<FaUser />} />
<SelectField label="Role" value={role} onChange={setRole} options={['LIP', 'Solicitor']} />
<DateField label="Hearing Date" value={date} onChange={setDate} />
<TextareaField label="Notes" value={notes} onChange={setNotes} rows={3} />`,
    propsDoc: [
      { name: 'label', type: 'string', description: 'Input label text' },
      { name: 'value', type: 'string', required: true, description: 'Controlled input value' },
      { name: 'onChange', type: '(val: string) => void', required: true, description: 'Value change handler' },
      { name: 'required', type: 'boolean', defaultVal: 'false', description: 'Renders red asterisk and sets required' },
      { name: 'icon', type: 'ReactNode', description: 'Prefix icon element' },
      { name: 'error', type: 'string', description: 'Validation error text' },
      { name: 'helperText', type: 'string', description: 'Muted descriptive guidance text' },
    ],
    renderPreview: (onFeedback) => createElement(FormInputsSuitePreview, { onFeedback }),
  },

  // 4. Case Lists & Badges
  {
    id: 'case-list-item-card',
    name: 'Case List Item Card',
    category: 'Case Lists & Badges',
    filePath: 'src/components/case/CaseListItemCard.tsx',
    importStatement: "import CaseListItemCard from '../components/case/CaseListItemCard'",
    description:
      'Full case summary row card used in case lists and search views with judge, court venue, status badge, counts, and action buttons.',
    badges: ['List Item', 'Interactive Row', 'Full Metadata'],
    codeSnippet: `<CaseListItemCard
  caseData={caseData}
  onViewCase={(id) => navigate('/cases/' + id)}
  onDeleteCase={(id) => handleDelete(id)}
/>`,
    propsDoc: [
      { name: 'caseData', type: 'FamilyCase', required: true, description: 'Family court case entity' },
      { name: 'onViewCase', type: '(id: string) => void', description: 'Fired when row is clicked' },
      { name: 'onDeleteCase', type: '(id: string) => void', description: 'Fired when delete button is pressed' },
      { name: 'showActions', type: 'boolean', defaultVal: 'true', description: 'Whether to show edit/delete buttons' },
    ],
    renderPreview: (onFeedback) => createElement(CaseListItemCardPreview, { onFeedback }),
  },
  {
    id: 'case-status-badge',
    name: 'Case Status Badge',
    category: 'Case Lists & Badges',
    filePath: 'src/components/common/CaseStatusBadge.tsx',
    importStatement: "import CaseStatusBadge from '../components/common/CaseStatusBadge'",
    description:
      'Semantic status pill badge with color coding (success for Open, warning for Stayed, secondary for Concluded) and icon accents.',
    badges: ['Atomic UI', 'Semantic Colors', 'Icon Accents'],
    codeSnippet: `<CaseStatusBadge status="Open" size="md" showIcon={true} />`,
    propsDoc: [
      { name: 'status', type: 'string', required: true, description: 'Status text (e.g. Open, Stayed, Concluded)' },
      { name: 'size', type: "'sm' | 'md' | 'lg'", defaultVal: "'md'", description: 'Badge padding and font sizing' },
      { name: 'showIcon', type: 'boolean', defaultVal: 'true', description: 'Whether to display icon bullet' },
    ],
    renderPreview: () => createElement(CaseStatusBadgePreview),
  },

  // 5. Legal Directory & Safeguarding
  {
    id: 'peer-supporter-card',
    name: 'Peer Supporter Card',
    category: 'Legal Directory & Safeguarding',
    filePath: 'src/components/directory/PeerSupporterCard.tsx',
    importStatement: "import PeerSupporterCard from '../components/directory/PeerSupporterCard'",
    description:
      'Professional profile card displaying Solicitors, Barristers, and McKenzie Friends with email-verification badge, firm/chambers info, registration number, and request support action.',
    badges: ['Directory Card', 'FPR Safeguarding', 'Verified Professional'],
    codeSnippet: `<PeerSupporterCard
  professional={proUser}
  onRequestSupport={(id) => openRequestModal(id)}
  showRequestButton={true}
/>`,
    propsDoc: [
      { name: 'professional', type: 'User', required: true, description: 'Verified legal professional entity' },
      { name: 'onRequestSupport', type: '(id: string) => void', description: 'Fired when request support is clicked' },
      { name: 'showRequestButton', type: 'boolean', defaultVal: 'true', description: 'Whether to show request button' },
    ],
    renderPreview: (onFeedback) => createElement(PeerSupporterCardPreview, { onFeedback }),
  },
  {
    id: 'verification-gate-card',
    name: 'Verification Gate Card',
    category: 'Legal Directory & Safeguarding',
    filePath: 'src/components/verification/VerificationGateCard.tsx',
    importStatement: "import VerificationGateCard from '../components/verification/VerificationGateCard'",
    description:
      'Safeguarding access card requiring email verification for legal professionals before accessing other people’s cases under FPR & UK GDPR.',
    badges: ['Safeguarding Gate', 'UK GDPR / FPR', 'Access Control'],
    codeSnippet: `<VerificationGateCard
  userEmail="solicitor@example.com"
  verificationToken="tok_123"
  onVerifyClick={(token) => navigate('/verify-email/' + token)}
/>`,
    propsDoc: [
      { name: 'userEmail', type: 'string', required: true, description: 'Professional email address' },
      { name: 'verificationToken', type: 'string', description: 'Verification token string' },
      { name: 'title', type: 'string', description: 'Card title override' },
      { name: 'description', type: 'string', description: 'Safeguarding explanation override' },
      { name: 'onVerifyClick', type: '(token: string) => void', description: 'Callback on verify button click' },
    ],
    renderPreview: (onFeedback) => createElement(VerificationGateCardPreview, { onFeedback }),
  },

  // 6. Buttons & Actions
  {
    id: 'case-card-buttons',
    name: 'Case Action Buttons',
    category: 'Buttons & Actions',
    filePath: 'src/components/common/CaseCardButtons.tsx',
    importStatement:
      "import { PeerSupportButton, ViewCaseButton, EditCaseButton, DeleteCaseButton, CaseActionButton, CaseCardActions } from '../components/common/CaseCardButtons'",
    description:
      'Modular, accessible action buttons tailored for court cases (Peer Support toggle, View Details, Edit, Delete, and custom actions).',
    badges: ['Atomic UI', 'Bootstrap', 'Accessible'],
    codeSnippet: `<PeerSupportButton
  isSeekingPeerSupport={seeking}
  onToggle={() => setSeeking(!seeking)}
/>
<ViewCaseButton caseId="FC-23-00035" />
<EditCaseButton caseId="FC-23-00035" />
<DeleteCaseButton caseId="FC-23-00035" onDelete={handleDelete} />`,
    propsDoc: [
      { name: 'isSeekingPeerSupport', type: 'boolean', required: true, description: 'Current peer support flag state' },
      { name: 'onToggle', type: '() => void', required: true, description: 'Triggered when the button is pressed' },
      { name: 'caseId', type: 'string', required: true, description: 'Target case identifier' },
      { name: 'fullWidth', type: 'boolean', defaultVal: 'false', description: 'Expands button to fill container width' },
      { name: 'variant', type: 'ButtonVariant', defaultVal: "'primary'", description: 'Bootstrap color variant style' },
    ],
    renderPreview: (onFeedback) => createElement(ButtonsPreview, { onFeedback }),
  },

  // 7. Navigation & Brand
  {
    id: 'tab-nav',
    name: 'TabNav (Tab Navigation)',
    category: 'Navigation & Brand',
    filePath: 'src/components/common/TabNav.tsx',
    importStatement: "import TabNav, { type TabItem } from '../components/common/TabNav'",
    description:
      'Type-safe tab navigation bar with pill count badges, icons, keyboard accessibility, and variant switching (tabs, pills, underline).',
    badges: ['Strict Generics', 'Keyboard Accessible', 'Badge Counts'],
    codeSnippet: `const tabs: TabItem<'cases' | 'reviews'>[] = [
  { key: 'cases', label: 'Cases', count: 12, badgeVariant: 'primary' },
  { key: 'reviews', label: 'Reviews', count: 4, badgeVariant: 'warning' },
]

<TabNav items={tabs} activeKey={activeTab} onSelect={setActiveTab} />`,
    propsDoc: [
      { name: 'items', type: 'TabItem<T>[]', required: true, description: 'Array of tab definitions with key, label, count, and icon' },
      { name: 'activeKey', type: 'T', required: true, description: 'Currently active tab key' },
      { name: 'onSelect', type: '(key: T) => void', required: true, description: 'Callback fired when a tab is selected' },
      { name: 'variant', type: "'tabs' | 'pills' | 'underline'", defaultVal: "'tabs'", description: 'Visual appearance variant' },
    ],
    renderPreview: (onFeedback) => createElement(TabNavPreview, { onFeedback }),
  },
  {
    id: 'logo',
    name: 'Brand Logo',
    category: 'Navigation & Brand',
    filePath: 'src/components/common/Logo.tsx',
    importStatement: "import Logo from '../components/common/Logo'",
    description: 'My Case Buddy logo brand asset with typography and responsive graphic mark.',
    badges: ['Brand Asset', 'Vector Graphic'],
    codeSnippet: `<Logo />`,
    propsDoc: [],
    renderPreview: () => createElement(LogoPreview),
  },

  // 8. Dashboard Widgets
  {
    id: 'upcoming-hearings',
    name: 'Upcoming Hearings Card',
    category: 'Dashboard Widgets',
    filePath: 'src/components/dashboard/UpcomingHearingsCard.tsx',
    importStatement: "import UpcomingHearingsCard from '../components/dashboard/UpcomingHearingsCard'",
    description:
      'Dashboard overview card displaying scheduled court hearings, dates, courtrooms, judges, and direct navigation links.',
    badges: ['Dashboard Widget', 'Date-Fns Aware'],
    codeSnippet: `<UpcomingHearingsCard hearings={hearingsList} />`,
    propsDoc: [
      { name: 'hearings', type: 'HearingItem[]', required: true, description: 'List of upcoming hearings with case metadata' },
    ],
    renderPreview: () => createElement(UpcomingHearingsPreview),
  },
  {
    id: 'deadlines-card',
    name: 'Deadlines Card',
    category: 'Dashboard Widgets',
    filePath: 'src/components/dashboard/DeadlinesCard.tsx',
    importStatement: "import DeadlinesCard from '../components/dashboard/DeadlinesCard'",
    description:
      'Document submission tracker showing overdue filings with red alerts, upcoming deadlines, and interactive completion checkboxes.',
    badges: ['Dashboard Widget', 'Interactive Checks'],
    codeSnippet: `<DeadlinesCard
  deadlines={deadlines}
  onToggleDeadline={(id, status) => handleToggle(id, status)}
/>`,
    propsDoc: [
      { name: 'deadlines', type: 'DocumentDeadline[]', required: true, description: 'Array of filing deadlines with due dates and statuses' },
      { name: 'onToggleDeadline', type: '(id: string, status: string) => void', required: true, description: 'Triggered when a deadline checkbox is clicked' },
    ],
    renderPreview: (onFeedback) => createElement(DeadlinesPreview, { onFeedback }),
  },
]
