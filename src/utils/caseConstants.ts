import type { CaseStatus, CaseType, CourtType, UserRole } from '../types/domain'

/**
 * Standard Family Court case type options
 */
export const CASE_TYPE_OPTIONS: readonly CaseType[] = [
  'Private Law (Child Arrangements)',
  'Public Law (Care Proceedings)',
  'Domestic Abuse (Non-Molestation)',
  'Financial Remedies',
  'Adoption',
  'Other',
] as const

/**
 * Standard Court venue types
 */
export const COURT_TYPE_OPTIONS: readonly CourtType[] = [
  'Family Court',
  'High Court Family Division',
] as const

/**
 * Case lifecycle statuses
 */
export const CASE_STATUS_OPTIONS: readonly CaseStatus[] = [
  'Open',
  'Stayed',
  'Concluded',
] as const

/**
 * System user roles
 */
export const USER_ROLES: readonly UserRole[] = [
  'LIP',
  'McKenzieFriend',
  'Solicitor',
  'Barrister',
] as const

/**
 * Case Details navigation tab identifiers
 */
export const CASE_DETAILS_TABS = {
  OVERVIEW: 0,
  PARTIES: 1,
  HEARINGS: 2,
  DOCUMENTS: 3,
  ORDERS: 4,
  NOTES: 5,
  TEAM: 6,
} as const

export type CaseDetailsTabKey = (typeof CASE_DETAILS_TABS)[keyof typeof CASE_DETAILS_TABS]

export interface TabDefinition {
  key: CaseDetailsTabKey
  id: string
  label: string
}

export const CASE_DETAILS_TAB_LIST: readonly TabDefinition[] = [
  { key: CASE_DETAILS_TABS.OVERVIEW, id: 'overview', label: 'Case Overview' },
  { key: CASE_DETAILS_TABS.PARTIES, id: 'parties', label: 'Parties' },
  { key: CASE_DETAILS_TABS.HEARINGS, id: 'hearings', label: 'Hearings' },
  { key: CASE_DETAILS_TABS.DOCUMENTS, id: 'documents', label: 'Documents' },
  { key: CASE_DETAILS_TABS.ORDERS, id: 'orders', label: 'Orders' },
  { key: CASE_DETAILS_TABS.NOTES, id: 'notes', label: 'Notes' },
  { key: CASE_DETAILS_TABS.TEAM, id: 'team', label: 'Team & Invites' },
] as const
