import type { CaseType, FamilyCase } from '../types/domain'

export interface CaseStageInfo {
  id: string
  name: string
  description: string
  order: number
}

// Define case stages for different case types
export const CASE_STAGES: Record<CaseType, CaseStageInfo[]> = {
  'Public Law (Care Proceedings)': [
    { id: 'pre-proceedings', name: 'Pre-Proceedings', description: 'Assessment and pre-proceedings meetings', order: 1 },
    { id: 'application', name: 'Application Filed', description: 'Care application submitted to court', order: 2 },
    { id: 'first-hearing', name: 'First Hearing', description: 'Case Management Hearing (CMH)', order: 3 },
    { id: 'directions', name: 'Directions', description: 'Directions hearing and interim orders', order: 4 },
    { id: 'fact-finding', name: 'Fact-Finding', description: 'Fact-finding hearing', order: 5 },
    { id: 'welfare', name: 'Welfare Hearing', description: 'Welfare assessment and final hearing', order: 6 },
    { id: 'final', name: 'Final Order', description: 'Final order made', order: 7 },
  ],
  'Private Law (Child Arrangements)': [
    { id: 'application', name: 'Application Filed', description: 'C100 application submitted', order: 1 },
    { id: 'first-hearing', name: 'First Hearing', description: 'First Hearing Dispute Resolution Appointment (FHDRA)', order: 2 },
    { id: 'mediation', name: 'Mediation/Assessment', description: 'Mediation or assessment process', order: 3 },
    { id: 'directions', name: 'Directions', description: 'Directions hearing', order: 4 },
    { id: 'fact-finding', name: 'Fact-Finding', description: 'Fact-finding hearing (if required)', order: 5 },
    { id: 'welfare', name: 'Welfare Hearing', description: 'Welfare assessment', order: 6 },
    { id: 'final', name: 'Final Hearing', description: 'Final hearing and order', order: 7 },
  ],
  'Domestic Abuse (Non-Molestation)': [
    { id: 'application', name: 'Application Filed', description: 'Application for Non-Molestation Order', order: 1 },
    { id: 'without-notice', name: 'Without Notice Hearing', description: 'Ex parte hearing (if urgent)', order: 2 },
    { id: 'service', name: 'Service', description: 'Service of application on respondent', order: 3 },
    { id: 'return-hearing', name: 'Return Hearing', description: 'Return hearing with both parties', order: 4 },
    { id: 'final', name: 'Final Order', description: 'Final order granted or refused', order: 5 },
  ],
  'Financial Remedies': [
    { id: 'application', name: 'Application Filed', description: 'Financial remedy application', order: 1 },
    { id: 'first-appointment', name: 'First Appointment', description: 'First Directions Appointment (FDA)', order: 2 },
    { id: 'disclosure', name: 'Disclosure', description: 'Financial disclosure process', order: 3 },
    { id: 'fdr', name: 'FDR', description: 'Financial Dispute Resolution hearing', order: 4 },
    { id: 'final', name: 'Final Hearing', description: 'Final hearing and order', order: 5 },
  ],
  'Adoption': [
    { id: 'application', name: 'Application Filed', description: 'Adoption application submitted', order: 1 },
    { id: 'first-hearing', name: 'First Hearing', description: 'First directions hearing', order: 2 },
    { id: 'assessment', name: 'Assessment', description: 'Adoption assessment and reports', order: 3 },
    { id: 'final', name: 'Final Hearing', description: 'Final adoption order hearing', order: 4 },
  ],
  'Other': [
    { id: 'application', name: 'Application Filed', description: 'Application submitted', order: 1 },
    { id: 'directions', name: 'Directions', description: 'Directions hearing', order: 2 },
    { id: 'final', name: 'Final Hearing', description: 'Final hearing', order: 3 },
  ],
}

export function getCurrentStageIndex(caseData: FamilyCase): number {
  const stages = CASE_STAGES[caseData.caseType] || CASE_STAGES['Other']
  const currentStageId = caseData.currentStage || 'application'
  const currentIndex = stages.findIndex(s => s.id === currentStageId)
  return currentIndex >= 0 ? currentIndex : 0
}

export function getStagesForCase(caseData: FamilyCase): CaseStageInfo[] {
  return CASE_STAGES[caseData.caseType] || CASE_STAGES['Other']
}

