import type { DocumentDeadline, FamilyCase, User } from '../types/domain'
import type { DashboardStatusFilter } from '../components/dashboard/DashboardFilterBar'
import type { HearingItem } from '../components/dashboard/UpcomingHearingsCard'
import { isUserCaseMember, isUserCaseOwner } from './caseMembership'

/** localStorage key persisting the LIP dashboard grid/table preference. */
export const LIP_DASHBOARD_VIEW_STORAGE_KEY = 'lip_dashboard_view'

/** Default note attached when a LIP opts a case into peer support. */
export const PEER_SUPPORT_REQUEST_NOTE = 'Seeking peer review from experienced supporters'

/** Tab identifiers for the professional dashboard. */
export const PROFESSIONAL_DASHBOARD_TABS = ['peer', 'assigned', 'schedule'] as const

export type ProfessionalDashboardTab = (typeof PROFESSIONAL_DASHBOARD_TABS)[number]

/**
 * Type guard for a professional dashboard tab key (e.g. from a `?tab=` query param).
 */
export function isProfessionalDashboardTab(value: string | null): value is ProfessionalDashboardTab {
  return value !== null && (PROFESSIONAL_DASHBOARD_TABS as readonly string[]).includes(value)
}

/**
 * Filters cases by status and a free-text query matched against ID, title, court, type and judge.
 */
export function filterCasesBySearchAndStatus(
  cases: FamilyCase[],
  searchQuery: string,
  statusFilter: DashboardStatusFilter
): FamilyCase[] {
  const query = searchQuery.trim().toLowerCase()
  return cases.filter((c) => {
    if (statusFilter !== 'All' && c.status !== statusFilter) {
      return false
    }
    if (query) {
      const matches = [c.id, c.title, c.court, c.caseType, c.allocatedJudge]
        .filter(Boolean)
        .some((val) => String(val).toLowerCase().includes(query))
      if (!matches) return false
    }
    return true
  })
}

/**
 * Counts cases per dashboard status filter bucket (including `All`).
 */
export function countCasesByStatus(cases: FamilyCase[]): Record<DashboardStatusFilter, number> {
  return {
    All: cases.length,
    Open: cases.filter((c) => c.status === 'Open').length,
    Stayed: cases.filter((c) => c.status === 'Stayed').length,
    Concluded: cases.filter((c) => c.status === 'Concluded').length,
  }
}

/**
 * Totals every hearing recorded across the given cases (past and future).
 */
export function countAllHearings(cases: FamilyCase[]): number {
  return cases.reduce((acc, c) => acc + (c.hearings ? c.hearings.length : 0), 0)
}

/**
 * Counts cases currently flagged as seeking peer support.
 */
export function countCasesSeekingPeerSupport(cases: FamilyCase[]): number {
  return cases.filter((c) => c.seekingPeerSupport).length
}

/**
 * Counts peer-support requests the user could pick up (cases they neither own nor belong to).
 */
export function countPeerSupportOpportunities(cases: FamilyCase[], user: User | null): number {
  if (!user) return 0
  return cases.filter(
    (c) => Boolean(c.seekingPeerSupport) && !isUserCaseOwner(c, user) && !isUserCaseMember(c, user)
  ).length
}

/**
 * Collects hearings dated now or later across cases, sorted soonest first.
 */
export function getUpcomingHearings(cases: FamilyCase[]): HearingItem[] {
  const list: HearingItem[] = []
  cases.forEach((caseData) => {
    caseData.hearings.forEach((hearing) => {
      const hearingDate = new Date(hearing.date)
      if (hearingDate >= new Date()) {
        list.push({
          caseId: caseData.id,
          caseTitle: caseData.title,
          hearing,
        })
      }
    })
  })
  return list.sort((a, b) => new Date(a.hearing.date).getTime() - new Date(b.hearing.date).getTime())
}

/**
 * Counts deadlines still awaiting submission.
 */
export function countPendingDeadlines(deadlines: DocumentDeadline[]): number {
  return deadlines.filter((d) => d.status === 'pending').length
}
