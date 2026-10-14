import type { Party } from '../types/domain'

export interface PartitionedParties {
  adultsAndRepresented: Party[]
  children: Party[]
}

/**
 * Separates parties into adult/represented parties and unrepresented children
 * pursuant to Family Court safeguarding and procedural grouping rules.
 */
export function partitionParties(parties: Party[] = []): PartitionedParties {
  const adultsAndRepresented = parties.filter(
    (p) => p.role !== 'Child' || (p.role === 'Child' && Boolean(p.solicitorFirm))
  )
  const children = parties.filter((p) => p.role === 'Child' && !p.solicitorFirm)
  return { adultsAndRepresented, children }
}

/**
 * Counts children involved in a case party list.
 */
export function countChildren(parties: Party[] = []): number {
  return parties.filter((p) => p.role === 'Child').length
}

/**
 * Counts adult parties involved in a case party list.
 */
export function countAdults(parties: Party[] = []): number {
  return parties.filter((p) => p.role !== 'Child').length
}

/**
 * Safely formats party full name.
 */
export function formatPartyName(party: Pick<Party, 'firstName' | 'lastName'>): string {
  return `${party.firstName} ${party.lastName}`.trim()
}
