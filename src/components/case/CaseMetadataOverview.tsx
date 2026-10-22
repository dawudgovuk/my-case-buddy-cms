import type { FamilyCase } from '../../types/domain'
import CaseStatusBadge from '../common/CaseStatusBadge'
import { useTranslation } from '../../hooks/useTranslation'

export interface CaseMetadataOverviewProps {
  caseData: Pick<FamilyCase, 'id' | 'court' | 'caseType' | 'status' | 'startedAt' | 'allocatedJudge'> & {
    caseNumber?: string
  }
  className?: string
}

/**
 * Clean, accessible read-only summary grid of case metadata.
 * Complies with SRP and Interface Segregation Principle.
 */
export default function CaseMetadataOverview({ caseData, className }: CaseMetadataOverviewProps) {
  const { t } = useTranslation()

  return (
    <div className={`row g-3 ${className || ''}`}>
      <div className="col-12 col-md-6 col-lg-4">
        <span className="text-muted small d-block">{t('caseDetails.caseNumber')}</span>
        <strong className="text-dark fs-6">{caseData.caseNumber || caseData.id}</strong>
      </div>

      <div className="col-12 col-md-6 col-lg-4">
        <span className="text-muted small d-block">{t('caseDetails.courtVenue')}</span>
        <strong className="text-dark">{caseData.court}</strong>
      </div>

      <div className="col-12 col-md-6 col-lg-4">
        <span className="text-muted small d-block">{t('caseDetails.caseType')}</span>
        <strong className="text-dark">{caseData.caseType}</strong>
      </div>

      <div className="col-12 col-md-6 col-lg-4">
        <span className="text-muted small d-block mb-1">{t('caseDetails.statusLabel')}</span>
        <CaseStatusBadge status={caseData.status} />
      </div>

      <div className="col-12 col-md-6 col-lg-4">
        <span className="text-muted small d-block">{t('caseDetails.proceedingsStarted')}</span>
        <strong className="text-dark">{caseData.startedAt || t('caseDetails.unassigned')}</strong>
      </div>

      <div className="col-12 col-md-6 col-lg-4">
        <span className="text-muted small d-block">{t('caseDetails.allocatedJudge')}</span>
        {caseData.allocatedJudge ? (
          <strong className="text-dark">{caseData.allocatedJudge}</strong>
        ) : (
          <span className="text-muted fst-italic">{t('caseDetails.unassigned')}</span>
        )}
      </div>
    </div>
  )
}
