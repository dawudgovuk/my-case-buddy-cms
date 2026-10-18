import type { DocumentRecord } from '../types/domain'

export const PD27A_MAX_PAGES = 350

export type BundleSectionKey = 'A' | 'B' | 'C' | 'D' | 'E'

export interface BundleSectionDefinition {
  key: BundleSectionKey
  title: string
  description: string
}

export const BUNDLE_SECTIONS: readonly BundleSectionDefinition[] = [
  {
    key: 'A',
    title: 'Section A: Preliminary Documents',
    description: 'Case summary, Statement of Issues, Chronology, Position Statements, Skeleton Arguments',
  },
  {
    key: 'B',
    title: 'Section B: Applications & Orders',
    description: 'Notices of Application (e.g. C100, C1A, C2) and previous Court Orders',
  },
  {
    key: 'C',
    title: 'Section C: Statements & Affidavits',
    description: 'Witness statements, affidavits, and exhibits referenced by witnesses',
  },
  {
    key: 'D',
    title: 'Section D: Expert Reports',
    description: 'Section 7 / Section 37 CAFCASS/Local Authority reports, independent social work, psychological assessments',
  },
  {
    key: 'E',
    title: 'Section E: Other Documents',
    description: 'Police disclosure, medical records, school reports, other relevant documentary evidence',
  },
] as const

/**
 * Maps a DocumentRecord type to its standard FPR PD 27A section
 */
export function mapDocumentToSection(doc: DocumentRecord): BundleSectionKey {
  switch (doc.type) {
    case 'Bundle':
    case 'Other':
      return 'E'
    case 'Application':
    case 'Order':
      return 'B'
    case 'Statement':
      return 'C'
    case 'Expert Report':
      return 'D'
    case 'Medical':
      return 'E'
    default:
      return 'E'
  }
}

export interface SectionIndexEntry {
  sectionKey: BundleSectionKey
  document: DocumentRecord
  startPage: number
  endPage: number
}

export interface BundleComplianceSummary {
  totalPages: number
  isCompliant: boolean
  remainingPages: number
  excessPages: number
  documentCount: number
  sections: Record<BundleSectionKey, SectionIndexEntry[]>
}

/**
 * Calculates continuous pagination and evaluates PD 27A compliance
 */
export function evaluateBundleCompliance(documents: DocumentRecord[]): BundleComplianceSummary {
  let currentPage = 1
  const sections: Record<BundleSectionKey, SectionIndexEntry[]> = {
    A: [],
    B: [],
    C: [],
    D: [],
    E: [],
  }

  // Group and paginate documents sequentially
  const sectionKeys: BundleSectionKey[] = ['A', 'B', 'C', 'D', 'E']
  for (const key of sectionKeys) {
    const docsInSection = documents.filter((doc) => mapDocumentToSection(doc) === key)
    for (const doc of docsInSection) {
      const docPages = Math.max(1, doc.pageCount || 1)
      const startPage = currentPage
      const endPage = startPage + docPages - 1
      currentPage = endPage + 1

      sections[key].push({
        sectionKey: key,
        document: doc,
        startPage,
        endPage,
      })
    }
  }

  const totalPages = currentPage - 1
  const isCompliant = totalPages <= PD27A_MAX_PAGES
  const remainingPages = Math.max(0, PD27A_MAX_PAGES - totalPages)
  const excessPages = Math.max(0, totalPages - PD27A_MAX_PAGES)

  return {
    totalPages,
    isCompliant,
    remainingPages,
    excessPages,
    documentCount: documents.length,
    sections,
  }
}

/**
 * Generates formatted plain-text court bundle index ready for pasting into court documents
 */
export function generateBundleIndexText(caseTitle: string, caseNumber: string | undefined, summary: BundleComplianceSummary): string {
  const lines: string[] = []
  lines.push(`COURT BUNDLE INDEX (FPR PRACTICE DIRECTION 27A)`)
  lines.push(`IN THE FAMILY COURT`)
  lines.push(`Case Ref: ${caseNumber || 'TBD'} | Matter: ${caseTitle}`)
  lines.push(`Total Bundle Pages: ${summary.totalPages} / ${PD27A_MAX_PAGES} (Status: ${summary.isCompliant ? 'COMPLIANT' : 'OVERSIZE - LEAVE REQUIRED'})`)
  lines.push(`Generated: ${new Date().toLocaleDateString('en-GB')}`)
  lines.push('='.repeat(70))
  lines.push('')

  for (const sec of BUNDLE_SECTIONS) {
    const entries = summary.sections[sec.key]
    lines.push(`${sec.title.toUpperCase()}`)
    lines.push('-'.repeat(50))
    if (!entries || entries.length === 0) {
      lines.push('  [No documents filed in this section]')
    } else {
      for (const entry of entries) {
        const exhibit = entry.document.exhibitRef ? `[${entry.document.exhibitRef}] ` : ''
        const dateStr = entry.document.uploadedAt ? ` (${entry.document.uploadedAt.slice(0, 10)})` : ''
        lines.push(`  Pages ${entry.startPage}-${entry.endPage} : ${exhibit}${entry.document.title}${dateStr}`)
      }
    }
    lines.push('')
  }

  lines.push('='.repeat(70))
  lines.push(`Statement: Prepared in accordance with FPR 2010 Practice Direction 27A.`)
  return lines.join('\n')
}
