import type { FamilyCase, Hearing } from '../types/domain'

/**
 * Static content and text builders for the McKenzie Friend (FPR PD 27A) lay support toolkit.
 */

export const DEFAULT_MCKENZIE_NAME = 'McKenzie Friend'
export const DEFAULT_MCKENZIE_EMAIL = 'mckenzie@layhelp.uk'
export const DEFAULT_LITIGANT_NAME = 'Litigant in Person'
export const DEFAULT_SPEAKER_ROLE = 'Judge'

/** A select option with a stored value and a display label. */
export interface SpeakerRoleOption {
  readonly value: string
  readonly label: string
}

/** Speakers that can be attributed in the live hearing log. */
export const SPEAKER_ROLE_OPTIONS: readonly SpeakerRoleOption[] = [
  { value: 'Judge', label: 'Judge / Magistrates' },
  { value: 'Opposing Party', label: 'Opposing Party / Counsel' },
  { value: 'Litigant in Person', label: 'Litigant (Quiet Advice)' },
  { value: 'Ruling', label: 'Judicial Direction / Ruling' },
]

export type PositionReviewCheckKey = 'pageLimit' | 'welfare' | 'proposals' | 'tone'

/** A position statement compliance check with its pass/fail summary lines. */
export interface PositionReviewCheck {
  readonly key: PositionReviewCheckKey
  /** DOM id of the checkbox. */
  readonly id: string
  readonly label: string
  readonly passText: string
  readonly failText: string
}

/** Position statement best-practice checks, in display and report order. */
export const POSITION_REVIEW_CHECKS: readonly PositionReviewCheck[] = [
  {
    key: 'pageLimit',
    id: 'chk-page',
    label: 'Length ≤ 2-3 pages max (PD 27A guidelines)',
    passText: '✓ Length within 2-3 page bundle limit (PD 27A)',
    failText: '✗ Exceeds recommended 2-3 page limit',
  },
  {
    key: 'welfare',
    id: 'chk-welfare',
    label: 'Children Act 1989 s.1(3) Welfare Checklist addressed',
    passText: '✓ Statutory Welfare Checklist addressed (s.1(3) Children Act)',
    failText: '✗ Welfare checklist needs strengthening',
  },
  {
    key: 'proposals',
    id: 'chk-proposals',
    label: 'Realistic proposed schedule for Child Arrangements Order',
    passText: '✓ Specific Child Arrangements Order proposals included',
    failText: '✗ Proposed contact schedule missing or vague',
  },
  {
    key: 'tone',
    id: 'chk-tone',
    label: 'Calm, child-focused tone (no unsubstantiated allegations)',
    passText: '✓ Non-inflammatory, child-focused tone',
    failText: '✗ Emotional or combative tone needs revision',
  },
]

export type PositionReviewChecks = Record<PositionReviewCheckKey, boolean>

/** All checks start ticked. */
export const INITIAL_POSITION_REVIEW_CHECKS: PositionReviewChecks = {
  pageLimit: true,
  welfare: true,
  proposals: true,
  tone: true,
}

/** Returns "First Last" of the applicant, or the generic litigant label. */
export function getLitigantName(caseData: Pick<FamilyCase, 'parties'>): string {
  const applicant = caseData.parties.find((p) => p.role === 'Applicant')
  return applicant ? `${applicant.firstName} ${applicant.lastName}` : DEFAULT_LITIGANT_NAME
}

export interface DeclarationTextParams {
  caseData: Pick<FamilyCase, 'court' | 'caseNumber' | 'id' | 'title'>
  litigantName: string
  mckenzieName: string
  mckenzieEmail: string
}

/** Generates the formal PD 27A notice text (dated today, en-GB). */
export function buildDeclarationText({ caseData, litigantName, mckenzieName, mckenzieEmail }: DeclarationTextParams): string {
  return `IN THE FAMILY COURT AT ${caseData.court.toUpperCase()}
CASE NO: ${caseData.caseNumber || caseData.id}

NOTICE OF LAY ASSISTANCE (MCKENZIE FRIEND)
Pursuant to Practice Direction 27A & Practice Guidance: McKenzie Friends (Civil and Family Courts) [2010] 1 FLR 1677

1. CASE TITLE: ${caseData.title || caseData.id}
2. LITIGANT RECEIVING ASSISTANCE: ${litigantName}
3. MCKENZIE FRIEND:
   - Full Name: ${mckenzieName}
   - Contact Email: ${mckenzieEmail}

FORMAL UNDERTAKINGS AND DECLARATION:
1. I have read and agree to strictly abide by Practice Direction 27A and the Practice Guidance on McKenzie Friends.
2. I understand that my role is strictly confined to:
   a. Providing moral support for the litigant;
   b. Taking contemporaneous notes of court proceedings;
   c. Assisting with the organisation of court papers and bundles;
   d. Quietly advising on points of law, procedure, and questions for witnesses.
3. I understand that I do not possess an automatic right of audience or right to conduct litigation, unless exceptional leave is granted by the Judge upon oral application under D v S (Rights of Audience) [1997].
4. I declare that I have no personal, financial, or pecuniary interest in the outcome of these proceedings, nor any conflict of interest with either party.
5. I understand and undertake to maintain strict confidentiality in accordance with Family Procedure Rules 12.73 and Section 12 of the Administration of Justice Act 1960.

Date: ${new Date().toLocaleDateString('en-GB')}
Signature: __________________________ (${mckenzieName})`
}

/** Wraps the declaration for filing into case notes. */
export function buildDeclarationNoteText(declarationText: string): string {
  return `[FPR Practice Direction 27A - Lay Supporter Declaration Filed]\n\n${declarationText}`
}

/** Formats a timestamped live hearing log entry, e.g. `[10:04:12] Judge: …`. */
export function formatHearingLogEntry(speakerRole: string, text: string): string {
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  return `[${timestamp}] ${speakerRole}: ${text}`
}

/** Builds the contemporaneous hearing note committed to case notes. */
export function buildHearingNoteText(
  hearings: readonly Hearing[],
  selectedHearingId: string,
  notetaker: string,
  log: readonly string[]
): string {
  const hearingObj = hearings.find((h) => h.id === selectedHearingId)
  const hearingTitle = hearingObj ? `${hearingObj.type} Hearing (${hearingObj.date})` : 'Court Hearing'
  return `[Contemporaneous Hearing Note - McKenzie Friend]\nHearing: ${hearingTitle}\nNotetaker: ${notetaker}\n\n${log.join('\n')}`
}

/** Builds the position statement compliance review note. */
export function buildPositionReviewText(reviewer: string, checks: PositionReviewChecks, comments: string): string {
  const checksText = POSITION_REVIEW_CHECKS.map((check) => (checks[check.key] ? check.passText : check.failText)).join('\n')
  return `[Position Statement Review - McKenzie Friend]\nReviewer: ${reviewer}\n\nCompliance Checks:\n${checksText}\n\nSupporter Guidance & Comments:\n${comments || 'No additional comments provided.'}`
}
