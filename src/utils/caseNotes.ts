import type { FamilyCase } from '../types/domain'
import { generateId } from '../services/storage'

/**
 * Returns a copy of the case with a new strategy note appended to its notes.
 * The note receives a fresh `NOTE` id and the current ISO timestamp.
 */
export function withAppendedNote(caseData: FamilyCase, author: string, text: string): FamilyCase {
  return {
    ...caseData,
    notes: [
      ...caseData.notes,
      {
        id: generateId('NOTE'),
        createdAt: new Date().toISOString(),
        author,
        text,
      },
    ],
  }
}
