import type { IconType } from 'react-icons'
import { FaBalanceScale, FaGavel, FaHandshake, FaUsers } from 'react-icons/fa'
import type { User, UserRole } from '../types/domain'
import { isProfessionalRole } from './userUtils'

/**
 * Roles listed in the verified legal professionals directory.
 */
export type ProfessionalRole = Exclude<UserRole, 'LIP'>

/**
 * Directory role filter value (`'all'` disables role filtering).
 */
export type DirectoryRoleFilter = 'all' | ProfessionalRole

/**
 * Per-role professional counts shown on the directory metric cards and filter chips.
 */
export interface DirectoryCounts {
  all: number
  mckenzie: number
  solicitors: number
  barristers: number
}

/**
 * Header metric card definitions for the peer directory.
 */
export const DIRECTORY_METRICS: ReadonlyArray<{
  countKey: keyof DirectoryCounts
  label: string
  icon: IconType
  iconClass: string
  iconSize: number
}> = [
  { countKey: 'all', label: 'All Verified:', icon: FaUsers, iconClass: 'text-primary', iconSize: 13 },
  { countKey: 'mckenzie', label: 'McKenzie Friends:', icon: FaHandshake, iconClass: 'text-success', iconSize: 13 },
  { countKey: 'solicitors', label: 'Solicitors:', icon: FaGavel, iconClass: 'text-primary', iconSize: 12 },
  { countKey: 'barristers', label: 'Barristers:', icon: FaBalanceScale, iconClass: 'text-warning', iconSize: 13 },
]

/**
 * Role filter chip definitions for the peer directory filter bar.
 */
export const DIRECTORY_ROLE_CHIPS: ReadonlyArray<{
  key: DirectoryRoleFilter
  label: string
  countKey: keyof DirectoryCounts
  activeClass: string
  dotColor?: string
}> = [
  { key: 'all', label: 'All Roles', countKey: 'all', activeClass: 'active' },
  { key: 'McKenzieFriend', label: 'McKenzie Friends', countKey: 'mckenzie', activeClass: 'active active-emerald', dotColor: '#10b981' },
  { key: 'Solicitor', label: 'Solicitors', countKey: 'solicitors', activeClass: 'active', dotColor: '#2563eb' },
  { key: 'Barrister', label: 'Barristers', countKey: 'barristers', activeClass: 'active', dotColor: '#f59e0b' },
]

/**
 * Returns true when the user is a verified Solicitor, Barrister or McKenzie Friend.
 */
export function isVerifiedLegalProfessional(u: User): boolean {
  return isProfessionalRole(u.role) && Boolean(u.isVerified)
}

/**
 * Counts directory professionals per role.
 */
export function countProfessionalsByRole(professionals: User[]): DirectoryCounts {
  return {
    all: professionals.length,
    mckenzie: professionals.filter((p) => p.role === 'McKenzieFriend').length,
    solicitors: professionals.filter((p) => p.role === 'Solicitor').length,
    barristers: professionals.filter((p) => p.role === 'Barrister').length,
  }
}

/**
 * Key family court legal supporter specialisms for litigants seeking targeted help.
 */
export const FAMILY_COURT_SPECIALISMS = [
  'Child Arrangements (Live with / Spend time with)',
  'FHDRA Preparation & Position Statements',
  'CAFCASS Section 7 Safeguarding Analysis',
  'Domestic Abuse & Non-Molestation',
  'FPR PD 27A Court Bundles',
  'Fact-Finding & Evidence',
  'Financial Remedies',
] as const

/**
 * Filters professionals by role, a free-text search term, and an optional specialism.
 */
export function filterProfessionals(
  professionals: User[],
  roleFilter: DirectoryRoleFilter,
  searchTerm: string,
  specialismFilter: string = 'ALL'
): User[] {
  const term = searchTerm.trim().toLowerCase()
  return professionals.filter((p) => {
    const matchesRole = roleFilter === 'all' || p.role === roleFilter
    const matchesTerm =
      !term ||
      p.name.toLowerCase().includes(term) ||
      (p.firm && p.firm.toLowerCase().includes(term)) ||
      (p.registrationNumber && p.registrationNumber.toLowerCase().includes(term)) ||
      (p.bio && p.bio.toLowerCase().includes(term)) ||
      (p.specialisms && p.specialisms.some((s) => s.toLowerCase().includes(term)))

    const matchesSpecialism =
      specialismFilter === 'ALL' ||
      (Array.isArray(p.specialisms) && p.specialisms.includes(specialismFilter)) ||
      (p.bio && p.bio.toLowerCase().includes(specialismFilter.toLowerCase()))

    return matchesRole && matchesTerm && matchesSpecialism
  })
}
