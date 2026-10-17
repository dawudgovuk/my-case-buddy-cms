import type { IconType } from 'react-icons'
import { FaBriefcase, FaGavel, FaUserFriends } from 'react-icons/fa'
import type { FamilyCase } from '../types/domain'

/**
 * Quick-insert help topics offered in the peer support request modal.
 */
export const PEER_SUPPORT_PRESET_TOPICS: ReadonlyArray<{ label: string; icon: string }> = [
  { label: 'Position Statement Review', icon: '📑' },
  { label: 'FHDRA & Hearing Prep', icon: '⚖️' },
  { label: 'Court Bundle Indexing', icon: '📂' },
  { label: 'Moral & Lay Court Support', icon: '🤝' },
  { label: 'Cafcass Section 7 Advice', icon: '👨‍👩‍👧' },
  { label: 'Non-Molestation / Safety Order', icon: '🛡️' },
]

/** Maximum length of the peer support request note. */
export const PEER_SUPPORT_NOTE_MAX_LENGTH = 1000

/**
 * Visual theme for the recipient of a peer support request.
 */
export interface PeerRequestRoleTheme {
  gradient: string
  bgSubtle: string
  borderSubtle: string
  textClass: string
  icon: IconType
  tag: string
}

/**
 * Resolves the recipient visual theme by role (McKenzie Friend is the default).
 */
export function getPeerRequestRoleTheme(role: string): PeerRequestRoleTheme {
  switch (role) {
    case 'Solicitor':
      return {
        gradient: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
        bgSubtle: 'rgba(37, 99, 235, 0.08)',
        borderSubtle: '#bfdbfe',
        textClass: 'text-primary',
        icon: FaBriefcase,
        tag: 'SRA Regulated Solicitor',
      }
    case 'Barrister':
      return {
        gradient: 'linear-gradient(135deg, #6d28d9 0%, #8b5cf6 100%)',
        bgSubtle: 'rgba(124, 58, 237, 0.08)',
        borderSubtle: '#ddd6fe',
        textClass: 'text-purple',
        icon: FaGavel,
        tag: 'BSB Registered Barrister KC',
      }
    case 'McKenzieFriend':
    default:
      return {
        gradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
        bgSubtle: 'rgba(16, 185, 129, 0.08)',
        borderSubtle: '#a7f3d0',
        textClass: 'text-success',
        icon: FaUserFriends,
        tag: 'FPR PD 27A McKenzie Friend',
      }
  }
}

/**
 * Builds up to two uppercase initials from the first letter of each space-separated word.
 */
export function getNameInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

/**
 * Stable selection key for a case (Strapi documentId, falling back to id).
 */
export function getCaseSelectionKey(c: Pick<FamilyCase, 'id' | 'documentId'>): string {
  return c.documentId || c.id
}

/**
 * Formats the dropdown label for a case in the request modal.
 */
export function formatCaseOptionLabel(
  c: Pick<FamilyCase, 'caseNumber' | 'title' | 'court' | 'caseType'>
): string {
  return c.caseNumber
    ? `${c.caseNumber} · ${c.title} (${c.court || 'Family Court'})`
    : `${c.title} (${c.caseType || 'Family Court'})`
}

/**
 * Note text used when a preset topic is inserted into an empty note.
 */
export function buildInitialPresetNote(presetLabel: string): string {
  return `I would appreciate peer support with: ${presetLabel}.\n\nDetails: `
}

/**
 * Appends an additional preset topic line to an existing note.
 */
export function appendPresetToNote(note: string, presetLabel: string): string {
  return `${note.trim()}\n• Also requesting help with: ${presetLabel}`
}
