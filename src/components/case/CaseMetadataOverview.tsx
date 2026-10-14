import type { FamilyCase } from '../../types/domain'
import CaseStatusBadge from '../common/CaseStatusBadge'

export interface CaseMetadataOverviewProps {
  caseData: Pick<FamilyCase, 'id' | 'court' | 'caseType' | 'status' | 'startedAt' | 'allocatedJudge'>
  className?: string
}

/**
 * Clean, accessible read-only summary grid of case metadata.
 * Complies with SRP and Interface Segregation Principle.
 */
export default function CaseMetadataOverview({ caseData, className }: CaseMetadataOverviewProps) {
  return (
    <div className={`row g-3 ${className || ''}`}>
      <div className="col-12 col-md-6 col-lg-4">
        <span className="text-muted small d-block">Case Number</span>
        <strong className="text-dark fs-6">{caseData.id}</strong>
      </div>

      <div className="col-12 col-md-6 col-lg-4">
        <span className="text-muted small d-block">Court Venue</span>
        <strong className="text-dark">{caseData.court}</strong>
      </div>

      <div className="col-12 col-md-6 col-lg-4">
        <span className="text-muted small d-block">Proceedings Type</span>
        <strong className="text-dark">{caseData.caseType}</strong>
      </div>

      <div className="col-12 col-md-6 col-lg-4">
        <span className="text-muted small d-block mb-1">Status</span>
        <CaseStatusBadge status={caseData.status} />
      </div>

      <div className="col-12 col-md-6 col-lg-4">
        <span className="text-muted small d-block">Proceedings Started</span>
        <strong className="text-dark">{caseData.startedAt || 'Not specified'}</strong>
      </div>

      {caseData.allocatedJudge ? (
        <div className="col-12 col-md-6 col-lg-4">
          <span className="text-muted small d-block">Allocated Judge</span>
          <strong className="text-dark">{caseData.allocatedJudge}</strong>
        </div>
      ) : (
        <div className="col-12 col-md-6 col-lg-4">
          <span className="text-muted small d-block">Allocated Judge</span>
          <span className="text-muted fst-italic">Unassigned</span>
        </div>
      )}
    </div>
  )
}
