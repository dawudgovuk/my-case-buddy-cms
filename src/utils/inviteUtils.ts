import type { CaseInvite } from '../types/domain'

/**
 * Visual theme for the invite acceptance banner and capacity badge.
 */
export interface InviteRoleTheme {
  gradient: string
  badge: string
  label: string
}

/**
 * Human-readable role label used on the sign-in prompt for an invite.
 */
export function getInviteRoleLabel(role?: CaseInvite['role']): string {
  return role === 'McKenzieFriend'
    ? 'McKenzie Friend'
    : role === 'Solicitor'
      ? 'Solicitor'
      : role === 'Barrister'
        ? 'Barrister'
        : 'Legal supporter'
}

/**
 * Resolves the invite banner theme by role (Barrister is the fallback).
 */
export function getInviteRoleTheme(role?: CaseInvite['role']): InviteRoleTheme {
  return role === 'McKenzieFriend'
    ? { gradient: 'linear-gradient(135deg, #0a5c40 0%, #0e7a55 60%, #23a07a 100%)', badge: 'success', label: 'McKenzie Friend (court lay supporter)' }
    : role === 'Solicitor'
      ? { gradient: 'var(--mcb-hero)', badge: 'primary', label: 'Solicitor' }
      : { gradient: 'linear-gradient(135deg, #3b2a8a 0%, #5b3fc4 100%)', badge: 'secondary', label: 'Barrister' }
}

/**
 * Reasons an invite cannot be accepted, keyed to `inviteAccept.*` i18n keys.
 */
export type InviteValidationIssue = 'alreadyUsed' | 'hasExpired'

/**
 * i18n keys and English fallbacks for invite load / validation errors.
 */
export const INVITE_ERROR_MESSAGES = {
  invalidLink: { key: 'inviteAccept.invalidLink', fallback: 'Invalid invitation link' },
  notFoundOrExpired: { key: 'inviteAccept.notFoundOrExpired', fallback: 'Invitation not found or has expired' },
  alreadyUsed: { key: 'inviteAccept.alreadyUsed', fallback: 'This invitation has already been accepted' },
  hasExpired: { key: 'inviteAccept.hasExpired', fallback: 'This invitation has expired' },
} as const

/**
 * Checks whether an invite has already been used or has expired.
 * Returns the issue key or null when the invite is still valid.
 */
export function getInviteValidationIssue(
  invite: Pick<CaseInvite, 'usedAt' | 'expiresAt'>,
  now: Date = new Date()
): InviteValidationIssue | null {
  if (invite.usedAt) return 'alreadyUsed'
  if (invite.expiresAt && new Date(invite.expiresAt) < now) return 'hasExpired'
  return null
}
