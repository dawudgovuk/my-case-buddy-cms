import { Card, Alert, Badge } from 'react-bootstrap'
import { FaGavel } from 'react-icons/fa'
import type { FamilyCase } from '../../types/domain'

export interface InviteCaseSnapshotProps {
  caseDetails: Pick<
    FamilyCase,
    'id' | 'title' | 'caseNumber' | 'status' | 'court' | 'caseType' | 'currentStage' | 'startedAt' | 'peerSupportNote'
  > | null
  /** Fallback case reference shown when case details could not be hydrated. */
  caseId?: string
}

/**
 * Summary card of the invited case, or an info alert with the case reference when details are unavailable.
 */
export default function InviteCaseSnapshot({ caseDetails, caseId }: InviteCaseSnapshotProps) {
  if (!caseDetails) {
    return (
      <Alert variant="info" className="small mb-4">
        <FaGavel className="me-2" />
        Connected case reference: <strong>{caseId}</strong>
      </Alert>
    )
  }

  return (
    <Card className="bg-light border mb-4">
      <Card.Body className="p-3">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div>
            <div className="text-muted small text-uppercase fw-bold" style={{ fontSize: '0.75rem' }}>Case Details</div>
            <h5 className="fw-bold mb-1 text-dark">{caseDetails.title}</h5>
            <div className="text-primary small fw-semibold">
              Ref: {caseDetails.caseNumber || caseDetails.id}
            </div>
          </div>
          <Badge bg="secondary" className="px-2 py-1">
            {caseDetails.status || 'Active'}
          </Badge>
        </div>

        <div className="row g-2 pt-2 border-top text-muted small">
          <div className="col-sm-6">
            <strong>Court:</strong> {caseDetails.court}
          </div>
          <div className="col-sm-6">
            <strong>Case Type:</strong> {caseDetails.caseType}
          </div>
          {caseDetails.currentStage && (
            <div className="col-sm-6">
              <strong>Current Stage:</strong> {caseDetails.currentStage}
            </div>
          )}
          {caseDetails.startedAt && (
            <div className="col-sm-6">
              <strong>Started:</strong> {caseDetails.startedAt}
            </div>
          )}
        </div>

        {caseDetails.peerSupportNote && (
          <div className="mt-3 p-3 bg-white rounded border border-primary border-opacity-25">
            <div className="fw-bold text-primary small mb-1">Requested Assistance from Litigant:</div>
            <div className="fst-italic text-dark small">&ldquo;{caseDetails.peerSupportNote}&rdquo;</div>
          </div>
        )}
      </Card.Body>
    </Card>
  )
}
