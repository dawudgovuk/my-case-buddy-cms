import { Card, Row, Col } from 'react-bootstrap'
import { FaCheckCircle, FaExclamationCircle } from 'react-icons/fa'

export interface CaseReadinessChecklistProps {
  hasTitle: boolean
  court: string
  applicantsCount: number
  respondentsCount: number
  className?: string
}

export default function CaseReadinessChecklist({
  hasTitle,
  court,
  applicantsCount,
  respondentsCount,
  className = '',
}: CaseReadinessChecklistProps) {
  const hasApplicant = applicantsCount > 0
  const hasRespondent = respondentsCount > 0

  return (
    <Card className={`border shadow-sm bg-white rounded-3 mb-4 ${className}`}>
      <Card.Header className="bg-white border-bottom py-3 px-3 px-md-4">
        <h6 className="fw-bold mb-0 text-dark">Pre-Filing Readiness Checklist</h6>
      </Card.Header>
      <Card.Body className="p-3 p-md-4">
        <Row className="g-3">
          <Col sm={6} md={3}>
            <div className="d-flex align-items-center gap-2">
              {hasTitle ? (
                <FaCheckCircle className="text-success flex-shrink-0" size={18} />
              ) : (
                <FaExclamationCircle className="text-danger flex-shrink-0" size={18} />
              )}
              <div>
                <div className="small fw-semibold text-dark">Case Title</div>
                <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                  {hasTitle ? 'Title provided' : 'Title missing'}
                </div>
              </div>
            </div>
          </Col>

          <Col sm={6} md={3}>
            <div className="d-flex align-items-center gap-2">
              <FaCheckCircle className="text-success flex-shrink-0" size={18} />
              <div>
                <div className="small fw-semibold text-dark">Jurisdiction</div>
                <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                  {court}
                </div>
              </div>
            </div>
          </Col>

          <Col sm={6} md={3}>
            <div className="d-flex align-items-center gap-2">
              {hasApplicant ? (
                <FaCheckCircle className="text-success flex-shrink-0" size={18} />
              ) : (
                <FaExclamationCircle className="text-warning flex-shrink-0" size={18} />
              )}
              <div>
                <div className="small fw-semibold text-dark">Applicant Party</div>
                <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                  {applicantsCount > 0 ? `${applicantsCount} registered` : 'Recommended'}
                </div>
              </div>
            </div>
          </Col>

          <Col sm={6} md={3}>
            <div className="d-flex align-items-center gap-2">
              {hasRespondent ? (
                <FaCheckCircle className="text-success flex-shrink-0" size={18} />
              ) : (
                <FaExclamationCircle className="text-warning flex-shrink-0" size={18} />
              )}
              <div>
                <div className="small fw-semibold text-dark">Respondent Party</div>
                <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                  {respondentsCount > 0 ? `${respondentsCount} registered` : 'Recommended'}
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  )
}
