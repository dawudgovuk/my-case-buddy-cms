import type { CaseMember, FamilyCase, Party, User } from '../types/domain'

/**
 * Builds the blank case record used to seed the create-case wizard.
 * Dates are evaluated at call time so each new form gets fresh timestamps.
 */
export function createEmptyCase(): FamilyCase {
  return {
    id: '',
    title: '',
    court: 'Family Court',
    caseType: 'Private Law (Child Arrangements)',
    status: 'Open',
    startedAt: new Date().toISOString().slice(0, 10),
    allocatedJudge: '',
    childrenInvolved: undefined,
    parties: [],
    hearings: [],
    orders: [],
    documents: [],
    notes: [],
    lastUpdatedAt: new Date().toISOString(),
    currentStage: 'application',
  }
}

/**
 * Builds the initial owner membership list for a newly created case.
 * Registers the user by ID and, when distinct, by email so either identity resolves ownership.
 */
export function buildInitialCaseMembers(user: User | null): CaseMember[] {
  return user
    ? [
        { userId: user.id, role: 'Owner', email: user.email },
        ...(user.email && user.email !== user.id
          ? [{ userId: user.email, role: 'Owner' as const, email: user.email }]
          : []),
      ]
    : []
}

export interface PartiesByRole {
  applicants: Party[]
  respondents: Party[]
  children: Party[]
  otherParties: Party[]
}

/**
 * Groups case parties into applicants, respondents, children and any other roles.
 */
export function groupPartiesByRole(parties: Party[]): PartiesByRole {
  return {
    applicants: parties.filter((p) => p.role === 'Applicant'),
    respondents: parties.filter((p) => p.role === 'Respondent'),
    children: parties.filter((p) => p.role === 'Child'),
    otherParties: parties.filter(
      (p) => p.role !== 'Applicant' && p.role !== 'Respondent' && p.role !== 'Child'
    ),
  }
}
