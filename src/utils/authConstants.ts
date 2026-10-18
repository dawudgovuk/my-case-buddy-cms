import type { User, UserRole } from '../types/domain'
import { USER_ROLES } from './caseConstants'

/**
 * Minimum password length enforced on sign-up / registration forms.
 */
export const MIN_PASSWORD_LENGTH = 8

/**
 * Lower-case role titles used in "Join as a …" registration copy.
 */
export const ROLE_TITLES: Record<UserRole, string> = {
  LIP: 'litigant in person',
  McKenzieFriend: 'McKenzie Friend',
  Solicitor: 'solicitor',
  Barrister: 'barrister',
}

/**
 * Short role-specific introductions shown on the registration hero.
 */
export const ROLE_INTROS: Record<UserRole, string> = {
  LIP: 'Keep track of your family court case, hearings and documents in one place.',
  McKenzieFriend: 'Support people who are going through family court on their own.',
  Solicitor: 'Offer your expertise to people representing themselves in family court.',
  Barrister: 'Offer your expertise to people representing themselves in family court.',
}

/**
 * Role options for the Family Court Role select on the sign-up form.
 */
export const SIGNUP_ROLE_OPTIONS: readonly { value: UserRole; label: string }[] = [
  { value: 'LIP', label: 'Litigant in Person (LIP)' },
  { value: 'McKenzieFriend', label: 'McKenzie Friend' },
  { value: 'Solicitor', label: 'Solicitor' },
  { value: 'Barrister', label: 'Barrister' },
] as const

/** How long (ms) the "copied" confirmation stays visible after copying a link. */
export const COPY_FEEDBACK_MS = 2500

/**
 * Type guard for a route param / raw string being a known user role.
 */
export function isValidRole(r: string | undefined): r is UserRole {
  return typeof r === 'string' && (USER_ROLES as readonly string[]).includes(r)
}

/**
 * Whether a role is a regulated legal professional (requires firm / registration number).
 */
export function isLegalProfessionalRole(role: UserRole): role is 'Solicitor' | 'Barrister' {
  return role === 'Solicitor' || role === 'Barrister'
}

/**
 * Landing route after a successful sign-in / registration for the given role.
 */
export function getPostAuthRoute(role: UserRole | undefined): '/cases' | '/professional-dashboard' {
  return role === 'LIP' ? '/cases' : '/professional-dashboard'
}

/** i18n key of each role's display name. */
export const ROLE_LABEL_KEYS: Record<UserRole, string> = {
  LIP: 'roles.lip',
  McKenzieFriend: 'roles.mckenzieFriend',
  Solicitor: 'roles.solicitor',
  Barrister: 'roles.barrister',
}

/**
 * Human-readable role label used in registration confirmation copy.
 */
export function getRoleDisplayName(role: UserRole): string {
  return role === 'McKenzieFriend' ? 'McKenzie Friend' : role === 'LIP' ? 'Litigant in Person' : role
}

/** Where newly registered (unverified) users wait until they confirm their email. */
export const WELCOME_ROUTE = '/welcome'

/**
 * Where a user should land: sign-in when signed out, the welcome / verify-email page
 * until their email is verified, then their dashboard.
 */
export function getLandingRoute(user: Pick<User, 'role' | 'isVerified'> | null | undefined): string {
  if (!user) return '/login'
  if (!user.isVerified) return WELCOME_ROUTE
  return getPostAuthRoute(user.role)
}

/** Login page mode: existing-user sign in vs. new account sign up. */
export type AuthMode = 'signin' | 'signup'
