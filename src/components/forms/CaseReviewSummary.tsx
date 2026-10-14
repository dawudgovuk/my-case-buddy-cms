import { Card, Row, Col, Button, Badge, Spinner, Alert } from 'react-bootstrap'
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
  FaExclamationTriangle,
  FaArrowLeft,
} from 'react-icons/fa'

export interface CaseReviewSummaryProps {
  caseData: FamilyCase
  onEditStep: (step: number) => void
  isEditMode: boolean
  isSubmitting?: boolean
  onSubmit: () => void
  onCancel: () => void
  className?: string
}

export default function CaseReviewSummary({
  caseData,
  onEditStep,
  isEditMode,
  isSubmitting = false,
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
            variant={allReady ? 'primary' : 'secondary'}
            size="lg"
            onClick={onSubmit}
            disabled={!allReady || isSubmitting}
            className="fw-semibold px-4 d-flex align-items-center gap-2 shadow-sm text-nowrap"
            title={!hasTitle ? 'Please enter Case Title in Step 1 before creating the case' : undefined}
          >
            {isSubmitting ? (
              <>
                <Spinner animation="border" size="sm" />
                <span>{isEditMode ? 'Saving Changes...' : 'Creating Case Workspace...'}</span>
              </>
            ) : !allReady ? (
              <>
                <FaExclamationTriangle size={16} className="text-warning" />
                <span>Title Required (Step 1)</span>
              </>
            ) : (
              <>
                {isEditMode ? <FaSave size={16} /> : <FaRocket size={16} />}
                <span>{isEditMode ? 'Save Changes' : 'Create Case Now'}</span>
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Prominent Missing Title Error Alert */}
      {!hasTitle && (
        <Alert
          variant="danger"
          className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 p-3 rounded-3 shadow-sm mb-4 border-danger"
        >
          <div className="d-flex align-items-center gap-3">
            <div
              className="bg-danger text-white rounded-circle d-flex align-items-center justify-content-center p-2 flex-shrink-0"
              style={{ width: 40, height: 40 }}
            >
              <FaExclamationTriangle size={18} />
            </div>
            <div>
              <div className="fw-bold text-danger fs-6">Issue in Step 1: Case Title is Missing</div>
              <div className="small text-secondary">
                A case title is required before this case can be created. Click the button to return to Step 1 and provide a title.
              </div>
            </div>
          </div>
          <Button
            variant="danger"
            size="sm"
            className="fw-bold px-3 py-2 text-nowrap d-flex align-items-center justify-content-center gap-2 shadow-xs align-self-start align-self-sm-center"
            onClick={() => onEditStep(0)}
          >
            <FaArrowLeft size={12} />
            <span>Go Back to Step 1</span>
          </Button>
        </Alert>
      )}

      {/* Extracted Modular Readiness Checklist with onFixTitle callback */}
      <CaseReadinessChecklist
        hasTitle={hasTitle}
        court={caseData.court}
        applicantsCount={applicants.length}
        respondentsCount={respondents.length}
        onFixTitle={() => onEditStep(0)}
      />

      {/* Review Section Cards */}
      <Row className="g-4 mb-4">
        {/* Card 1: Case Details */}
        <Col md={6}>
          <Card
            className={`border shadow-sm bg-white rounded-3 h-100 ${
              !hasTitle ? 'border-danger-subtle' : ''
            }`}
          >
            <Card.Header
              className={`border-bottom py-3 px-3 d-flex justify-content-between align-items-center ${
                !hasTitle ? 'bg-danger-subtle text-danger' : 'bg-white'
              }`}
            >
              <div className="d-flex align-items-center gap-2">
                <FaFolder className={!hasTitle ? 'text-danger' : 'text-primary'} />
                <h6 className="fw-bold mb-0 text-dark">Case Identification</h6>
                {!hasTitle && (
                  <Badge bg="danger" className="py-0.5 px-1.5 ms-1 font-monospace" style={{ fontSize: '0.68rem' }}>
                    ⚠️ Issue
                  </Badge>
                )}
              </div>
              <Button
                variant={!hasTitle ? 'danger' : 'outline-primary'}
                size="sm"
                className="py-0 px-2 fw-semibold"
                style={{ fontSize: '0.78rem' }}
                onClick={() => onEditStep(0)}
              >
                <FaEdit className="me-1" size={10} />
                {!hasTitle ? 'Fix in Step 1' : 'Edit'}
              </Button>
            </Card.Header>
            <Card.Body className="p-3">
              {!caseData.title.trim() ? (
                <div className="alert alert-danger py-2 px-3 small d-flex align-items-center justify-content-between mb-3 rounded-3 border-danger-subtle">
                  <span className="text-danger fw-semibold d-flex align-items-center gap-1.5">
                    <FaExclamationTriangle /> Case Title is missing
                  </span>
                  <Button
                    variant="danger"
                    size="sm"
                    className="py-1 px-2 fw-bold text-nowrap"
                    style={{ fontSize: '0.75rem' }}
                    onClick={() => onEditStep(0)}
                  >
                    Add Title Now
                  </Button>
                </div>
              ) : (
                <h6 className="fw-bold text-dark mb-1">{caseData.title}</h6>
              )}

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
            variant={allReady ? 'primary' : 'secondary'}
            className="px-4 fw-semibold d-flex align-items-center gap-2 shadow-sm"
            onClick={onSubmit}
            disabled={!allReady || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Spinner animation="border" size="sm" />
                <span>{isEditMode ? 'Saving...' : 'Creating Workspace...'}</span>
              </>
            ) : !allReady ? (
              <>
                <FaExclamationTriangle size={14} className="text-warning" />
                <span>Title Missing (Fix in Step 1)</span>
              </>
            ) : (
              <>
                {isEditMode ? <FaSave size={14} /> : <FaRocket size={14} />}
                <span>{isEditMode ? 'Save Changes' : 'Create Case Workspace'}</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
