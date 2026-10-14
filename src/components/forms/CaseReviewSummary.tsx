import { Card, Row, Col, Button, Badge } from 'react-bootstrap'
import type { FamilyCase } from '../../types/domain'
import CaseReadinessChecklist from './CaseReadinessChecklist'
import {
  FaEdit,
  FaGavel,
  FaUsers,
  FaChild,
  FaFolder,
  FaCalendarAlt,
  FaRocket,
  FaSave,
} from 'react-icons/fa'

export interface CaseReviewSummaryProps {
  caseData: FamilyCase
  onEditStep: (step: number) => void
  isEditMode: boolean
  onSubmit: () => void
  onCancel: () => void
  className?: string
}

export default function CaseReviewSummary({
  caseData,
  onEditStep,
  isEditMode,
  onSubmit,
  onCancel,
  className = '',
}: CaseReviewSummaryProps) {
  const applicants = caseData.parties.filter((p) => p.role === 'Applicant')
  const respondents = caseData.parties.filter((p) => p.role === 'Respondent')
  const children = caseData.parties.filter((p) => p.role === 'Child')
  const otherParties = caseData.parties.filter(
    (p) => p.role !== 'Applicant' && p.role !== 'Respondent' && p.role !== 'Child'
  )

  const hasTitle = Boolean(caseData.title.trim())
  const allReady = hasTitle

  return (
    <div className={className}>
      {/* Top Banner */}
      <Card className="border-0 bg-primary-subtle text-primary-emphasis p-4 rounded-3 mb-4 shadow-sm">
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <Badge bg="primary" className="p-1 px-2">
                Step 3 of 3
              </Badge>
              <h5 className="fw-bold mb-0 text-dark">
                {isEditMode ? 'Review Case Updates' : 'Review & Launch Case Proceedings'}
              </h5>
            </div>
            <p className="small text-muted mb-0">
              {isEditMode
                ? 'Review the modified details below before saving your changes.'
                : 'Confirm proceedings details, parties, and safeguards before creating your case workspace.'}
            </p>
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={onSubmit}
            disabled={!allReady}
            className="fw-semibold px-4 d-flex align-items-center gap-2 shadow-sm"
          >
            {isEditMode ? <FaSave size={16} /> : <FaRocket size={16} />}
            <span>{isEditMode ? 'Save Changes' : 'Create Case Now'}</span>
          </Button>
        </div>
      </Card>

      {/* Extracted Modular Readiness Checklist */}
      <CaseReadinessChecklist
        hasTitle={hasTitle}
        court={caseData.court}
        applicantsCount={applicants.length}
        respondentsCount={respondents.length}
      />

      {/* Review Section Cards */}
      <Row className="g-4 mb-4">
        {/* Card 1: Case Details */}
        <Col md={6}>
          <Card className="border shadow-sm bg-white rounded-3 h-100">
            <Card.Header className="bg-white border-bottom py-3 px-3 d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2">
                <FaFolder className="text-primary" />
                <h6 className="fw-bold mb-0 text-dark">Case Identification</h6>
              </div>
              <Button
                variant="outline-primary"
                size="sm"
                className="py-0 px-2"
                style={{ fontSize: '0.78rem' }}
                onClick={() => onEditStep(0)}
              >
                <FaEdit className="me-1" size={10} />
                Edit
              </Button>
            </Card.Header>
            <Card.Body className="p-3">
              <h6 className="fw-bold text-dark mb-1">{caseData.title || '(No title entered)'}</h6>
              <div className="text-muted small mb-3">
                Reference: <code className="text-dark fw-bold">{caseData.id || '(Auto-generated)'}</code>
              </div>

              <div className="d-flex flex-column gap-2 small">
                <div className="d-flex justify-content-between border-bottom pb-1">
                  <span className="text-muted">Court:</span>
                  <span className="fw-semibold text-dark">{caseData.court}</span>
                </div>
                <div className="d-flex justify-content-between border-bottom pb-1">
                  <span className="text-muted">Case Type:</span>
                  <span className="fw-semibold text-dark">{caseData.caseType}</span>
                </div>
                <div className="d-flex justify-content-between border-bottom pb-1">
                  <span className="text-muted">Status:</span>
                  <Badge bg="success" className="fw-normal">
                    {caseData.status}
                  </Badge>
                </div>
                <div className="d-flex justify-content-between border-bottom pb-1">
                  <span className="text-muted">Started On:</span>
                  <span className="fw-semibold text-dark">
                    <FaCalendarAlt className="me-1 text-muted" size={11} />
                    {caseData.startedAt}
                  </span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Allocated Judge:</span>
                  <span className="fw-semibold text-dark">
                    <FaGavel className="me-1 text-muted" size={11} />
                    {caseData.allocatedJudge || 'Unassigned / Bench'}
                  </span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Card 2: People Involved */}
        <Col md={6}>
          <Card className="border shadow-sm bg-white rounded-3 h-100">
            <Card.Header className="bg-white border-bottom py-3 px-3 d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2">
                <FaUsers className="text-primary" />
                <h6 className="fw-bold mb-0 text-dark">Parties & Children ({caseData.parties.length})</h6>
              </div>
              <Button
                variant="outline-primary"
                size="sm"
                className="py-0 px-2"
                style={{ fontSize: '0.78rem' }}
                onClick={() => onEditStep(1)}
              >
                <FaEdit className="me-1" size={10} />
                Edit
              </Button>
            </Card.Header>
            <Card.Body className="p-3">
              {/* Applicants */}
              <div className="mb-3">
                <div className="small fw-bold text-muted text-uppercase mb-1" style={{ fontSize: '0.72rem' }}>
                  Applicants ({applicants.length})
                </div>
                {applicants.length > 0 ? (
                  <div className="d-flex flex-wrap gap-1">
                    {applicants.map((a) => (
                      <Badge key={a.id} bg="primary" className="fw-normal p-2">
                        {a.firstName} {a.lastName}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-muted small fst-italic">None added</span>
                )}
              </div>

              {/* Respondents */}
              <div className="mb-3">
                <div className="small fw-bold text-muted text-uppercase mb-1" style={{ fontSize: '0.72rem' }}>
                  Respondents ({respondents.length})
                </div>
                {respondents.length > 0 ? (
                  <div className="d-flex flex-wrap gap-1">
                    {respondents.map((r) => (
                      <Badge key={r.id} bg="secondary" className="fw-normal p-2">
                        {r.firstName} {r.lastName}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-muted small fst-italic">None added</span>
                )}
              </div>

              {/* Children */}
              <div className="mb-2">
                <div className="small fw-bold text-muted text-uppercase mb-1" style={{ fontSize: '0.72rem' }}>
                  Children Subject of Application ({children.length})
                </div>
                {children.length > 0 ? (
                  <div className="d-flex flex-wrap gap-1">
                    {children.map((c) => (
                      <Badge key={c.id} bg="warning" text="dark" className="fw-normal p-2 d-inline-flex align-items-center gap-1">
                        <FaChild size={11} />
                        {c.firstName} {c.lastName}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-muted small fst-italic">No children registered</span>
                )}
              </div>

              {otherParties.length > 0 && (
                <div>
                  <div className="small fw-bold text-muted text-uppercase mb-1" style={{ fontSize: '0.72rem' }}>
                    Other Parties ({otherParties.length})
                  </div>
                  <div className="d-flex flex-wrap gap-1">
                    {otherParties.map((o) => (
                      <Badge key={o.id} bg="dark" className="fw-normal p-2">
                        {o.role}: {o.firstName} {o.lastName}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Bottom Actions */}
      <div className="d-flex justify-content-between align-items-center pt-3 border-top">
        <Button variant="outline-secondary" className="px-4" onClick={() => onEditStep(1)}>
          ← Back to Parties
        </Button>
        <div className="d-flex gap-2">
          <Button variant="outline-danger" className="px-3" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="primary"
            className="px-4 fw-semibold d-flex align-items-center gap-2 shadow-sm"
            onClick={onSubmit}
            disabled={!allReady}
          >
            {isEditMode ? <FaSave size={14} /> : <FaRocket size={14} />}
            <span>{isEditMode ? 'Save Changes' : 'Create Case Workspace'}</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
