import type { FamilyCase, User } from '../types/domain'

/**
 * Checks whether a given user is an authorized member/collaborator of a case.
 * Matches flexibly against Strapi numeric ID, documentId, Neon Auth UUID, or email.
 */
export function isUserCaseMember(c: FamilyCase, user: User | null | undefined): boolean {
  if (!user) return false
  const uId = String(user.id)
  const uEmail = user.email ? user.email.toLowerCase().trim() : ''

  const members = c.members || []
  // If a case has no explicit members stored yet (e.g. freshly created or seeded),
  // LIP users default to having access to view their cases.
  if (members.length === 0) {
    return user.role === 'LIP'
  }

  return members.some((m) => {
    const mId = String(m.userId)
    const mDocId = m.documentId ? String(m.documentId) : ''
    const mEmail = m.email ? m.email.toLowerCase().trim() : ''
    return (
      mId === uId ||
      (mDocId && mDocId === uId) ||
      (uEmail && mId.toLowerCase() === uEmail) ||
      (uEmail && mEmail && mEmail === uEmail)
    )
  })
}

/**
 * Checks whether a given user is the designated owner of a case.
 * Matches flexibly across Strapi user ID, documentId, Neon Auth UUID, or verified email.
 */
export function isUserCaseOwner(c: FamilyCase, user: User | null | undefined): boolean {
  if (!user) return false
  const uId = String(user.id)
  const uEmail = user.email ? user.email.toLowerCase().trim() : ''

  const members = c.members || []
  if (members.length === 0) {
    return user.role === 'LIP'
  }

  return members.some((m) => {
    if (m.role !== 'Owner') return false
    const mId = String(m.userId)
    const mDocId = m.documentId ? String(m.documentId) : ''
    const mEmail = m.email ? m.email.toLowerCase().trim() : ''
    return (
      mId === uId ||
      (mDocId && mDocId === uId) ||
      (uEmail && mId.toLowerCase() === uEmail) ||
      (uEmail && mEmail && mEmail === uEmail)
    )
  })
}
