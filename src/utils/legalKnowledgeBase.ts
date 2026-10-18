/**
 * Static content for the UK Family Court legal knowledge base
 * (precedents, statutory checklists, appeal grounds and practical guidance).
 */

/** A run of inline text; `{ em }` segments are rendered in italics. */
export type RichTextSegment = string | { readonly em: string }

/** Plain text, or an ordered list of inline segments. */
export type RichText = string | readonly RichTextSegment[]

/** A bold label followed by explanatory text (e.g. `<strong>(a) …:</strong> …`). */
export interface LabelledPoint {
  readonly label: string
  readonly text: RichText
}

/** A citation that can be inserted into the case notes. */
export interface NoteCitation {
  readonly title: string
  readonly content: string
}

/** A leading case authority rendered as a card in the case law section. */
export interface CaseAuthority {
  readonly id: string
  readonly heading: string
  readonly badgeLabel: string
  readonly badgeBg: string
  readonly badgeText?: string
  readonly summary: string
  readonly citation: NoteCitation
  /** Bootstrap `md` column span. */
  readonly colMd: number
  /** Whether the card stretches to the full row height (`h-100`). */
  readonly fullHeight: boolean
}

export const KNOWLEDGE_BASE_SUPPORT_URL = 'https://support.mycourtbuddy.com/'

/** Accordion items expanded on first render. */
export const KNOWLEDGE_BASE_DEFAULT_OPEN_KEYS: string[] = ['0', '1']

// --- 1. Alienating Behaviours ---------------------------------------------

export const ALIENATION_COPY_ID = 'rec-cite'

export const ALIENATION_INTRO: RichText = [
  'In ',
  { em: "Re C ('Parental Alienation; Instruction of Expert) [2023] EWHC 345 (Fam) para 103" },
  ', Sir Andrew McFarlane (President of the Family Division) adopted the definition that parental alienation is not a diagnosable syndrome, but a process of manipulation of children through alienating behaviours.',
]

export const ALIENATION_ELEMENTS: readonly LabelledPoint[] = [
  {
    label: 'Reluctance or Refusal:',
    text: 'The child is reluctant, resisting or refusing to engage in a relationship with a parent or carer.',
  },
  {
    label: "Not Consequent on Parent's Actions:",
    text: [
      'The reluctance, resistance or refusal is ',
      { em: 'not' },
      ' consequent on the actions of that parent towards the child or other parent (which would be justified rejection), nor caused by natural alignment, affinity, or attachment.',
    ],
  },
  {
    label: 'Direct/Indirect Impacting Behaviours:',
    text: "The other parent has engaged in behaviours that have directly or indirectly impacted on the child, leading to the child's reluctance or refusal.",
  },
]

export const ALIENATION_SOURCES =
  'Sources: Family Justice Council Guidance (2024) & Ben Hine, Jennifer Herman (UWL 2024).'

export const ALIENATION_COPY_TEXT = `Re C ('Parental Alienation; Instruction of Expert) [2023] EWHC 345 (Fam) para 103: Alienating behaviours require establishing: (1) Child reluctance/refusal; (2) Not justified by applicant's behaviour or natural alignment; (3) Behaviours by respondent parent directly/indirectly causing the reluctance.`

export const ALIENATION_NOTE_CITATION: NoteCitation = {
  title: 'Alienating Behaviours 3-Element Test (Re C [2023])',
  content: `Under Re C [2023] EWHC 345 (Fam) para 103, three criteria must be satisfied to establish alienating behaviours: 1. Child refusal; 2. Not justified rejection; 3. Caused by other parent's behaviours. Allegations must be evaluated against this threshold.`,
}

// --- 2. Key Children Case Law ---------------------------------------------

export const KEY_CASE_AUTHORITIES: readonly CaseAuthority[] = [
  {
    id: 're-h-2018',
    heading: "1. Re H (Children's Wishes) [2018] EWCA Civ 1684",
    badgeLabel: 'Child Wishes',
    badgeBg: 'secondary',
    summary:
      'Courts must consider repeated, consistent wishes of young children where safe and appropriate to their age and understanding.',
    citation: {
      title: 'Re H [2018] EWCA Civ 1684',
      content:
        "Re H (Children's Wishes) [2018] EWCA Civ 1684: Courts must consider repeated, consistent wishes of young children where safe.",
    },
    colMd: 6,
    fullHeight: true,
  },
  {
    id: 're-l-2000',
    heading: '2. Re L, V, M & H [2000] 2 FLR 334',
    badgeLabel: 'Allegations vs Evidence',
    badgeBg: 'danger',
    summary:
      'Allegations alone are insufficient to restrict contact. Any assessment of risk must be strictly evidence-based, not speculative.',
    citation: {
      title: 'Re L [2000] 2 FLR 334',
      content:
        'Re L, V, M & H (Contact: Allegations) [2000] 2 FLR 334: Allegations alone are insufficient to restrict contact. Risk must be evidence-based.',
    },
    colMd: 6,
    fullHeight: true,
  },
  {
    id: 're-r-2021',
    heading: '3. Re R (A Child) [2021] EWCA Civ 162',
    badgeLabel: 'Litigation Conduct',
    badgeBg: 'warning',
    badgeText: 'dark',
    summary:
      'Litigation delays or procedural obstruction by one parent must not prejudice the child or artificially freeze contact.',
    citation: {
      title: 'Re R [2021] EWCA Civ 162',
      content:
        'Re R (A Child) (Litigation Conduct) [2021] EWCA Civ 162: Litigation delays or procedural obstruction by one parent must not prejudice the child or freeze contact.',
    },
    colMd: 6,
    fullHeight: true,
  },
  {
    id: 're-m-2012',
    heading: '4. Re M (Interim Contact) [2012] EWCA Civ 520',
    badgeLabel: 'Interim Presumption',
    badgeBg: 'success',
    summary:
      'Interim contact should actively support the parent-child relationship during proceedings unless clear evidence dictates otherwise.',
    citation: {
      title: 'Re M [2012] EWCA Civ 520',
      content:
        'Re M (Interim Contact) [2012] EWCA Civ 520: Interim contact should support the parent-child relationship unless clear evidence dictates otherwise.',
    },
    colMd: 6,
    fullHeight: true,
  },
  {
    id: 're-c-2011',
    heading: '5. Re C (Direct Contact: Suspension) [2011] EWCA Civ 521',
    badgeLabel: 'Last Resort',
    badgeBg: 'danger-subtle',
    badgeText: 'danger',
    summary:
      'Restriction or termination of contact is a severe interference with family life and must remain a strict measure of last resort.',
    citation: {
      title: 'Re C [2011] EWCA Civ 521',
      content:
        'Re C (Direct Contact: Suspension) [2011] EWCA Civ 521: Restriction of contact must be a last resort, based on evidence, not speculation.',
    },
    colMd: 12,
    fullHeight: false,
  },
]

// --- 3. Children Act 1989 s.1(3) Welfare Checklist ------------------------

export const WELFARE_CHECKLIST_INTRO =
  "The court's paramount consideration is the welfare of the child. Judges, barristers, and supporters must address each of these statutory elements in statements and submissions:"

export const WELFARE_CHECKLIST: readonly LabelledPoint[] = [
  { label: '(a) Wishes and Feelings:', text: "In light of the child's age and understanding." },
  { label: '(b) Physical, Emotional & Educational Needs:', text: 'Daily stability and care.' },
  { label: '(c) Likely Effect of Any Change:', text: 'Impact of disrupting current routine.' },
  { label: '(d) Age, Sex, Background & Characteristics:', text: 'Cultural/religious identity.' },
  { label: '(e) Any Harm Suffered or at Risk of Suffering:', text: 'Physical or emotional harm.' },
  { label: '(f) Capability of Each Parent:', text: "Meeting the child's needs effectively." },
]

// --- 4. Grounds for Appeal ------------------------------------------------

export const APPEAL_WARNING =
  'Appealing a family court decision requires high legal thresholds. Merely disagreeing with the judicial evaluation is insufficient.'

export const APPEAL_GROUNDS: readonly LabelledPoint[] = [
  {
    label: 'Significant Error in Law:',
    text: 'The judge misapplied statutory provisions or binding appellate precedents.',
  },
  {
    label: 'Misunderstood or Failed to Consider Evidence:',
    text: 'Material documentary evidence was ignored or misconstrued.',
  },
  {
    label: 'Serious Procedural Irregularity:',
    text: 'The litigant was denied a fair hearing or natural justice.',
  },
  {
    label: 'Decision Plainly Wrong:',
    text: 'The order was one that no reasonable judge properly directing themselves could have made.',
  },
]

// --- 5. Video Calls with Children -----------------------------------------

export const VIDEO_CALL_INTRO =
  'Maintaining meaningful contact via video calls during private law disputes is critical for preservation of attachment. Key practical tips:'

export const VIDEO_CALL_TIPS: readonly LabelledPoint[] = [
  {
    label: 'Activity-Centric:',
    text: 'Read a book together, play an interactive game, or share drawings rather than expecting sustained conversation.',
  },
  {
    label: 'Child-Led Duration:',
    text: 'Allow the child to set the pace. A positive 15-minute call is far better than a pressured 45-minute call.',
  },
  {
    label: 'Neutral Demeanour:',
    text: "Never question the child about the other parent's home, routine, or court proceedings.",
  },
  {
    label: 'Predictable Routine:',
    text: 'Agree consistent times and dates so the child feels secure and anticipates the connection.',
  },
]
