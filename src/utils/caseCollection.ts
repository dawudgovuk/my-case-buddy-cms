import type { FamilyCase } from '../types/domain';

/** True when two cases are the same record (matched by id, or by Strapi documentId when present). */
export function isSameCase(existing: FamilyCase, candidate: FamilyCase): boolean {
  return existing.id === candidate.id || (Boolean(candidate.documentId) && existing.documentId === candidate.documentId);
}

/**
 * Replaces the matching case in the list, or adds it when it is new
 * (`'start'` puts new cases first, `'end'` last).
 */
export function upsertCaseInList(cases: FamilyCase[], fc: FamilyCase, insertAt: 'start' | 'end' = 'start'): FamilyCase[] {
  if (cases.some((c) => isSameCase(c, fc))) {
    return cases.map((c) => (isSameCase(c, fc) ? fc : c));
  }
  return insertAt === 'start' ? [fc, ...cases] : [...cases, fc];
}

/** Keeps the client's member entries that the server response does not include. */
export function mergeCaseMembers(saved: FamilyCase, original: FamilyCase): FamilyCase {
  const mergedMembers = [...(saved.members || [])];
  (original.members || []).forEach((origM) => {
    if (!mergedMembers.some((m) => m.userId === origM.userId || (origM.email && m.email === origM.email))) {
      mergedMembers.push(origM);
    }
  });
  return { ...saved, members: mergedMembers.length > 0 ? mergedMembers : original.members };
}
