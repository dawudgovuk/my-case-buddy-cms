import { Container, Row, Col, Card, Button, Badge, Alert } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useCasesStore } from '../store/casesStore'
import CaseSteps from '../components/CaseSteps'
import { getStagesForCase, getCurrentStageIndex } from '../utils/caseStages'
import { format } from 'date-fns'
import { FaCalendarAlt, FaMapMarkerAlt, FaEye, FaPlus, FaGavel } from 'react-icons/fa'

export default function LIPDashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { cases } = useCasesStore()

  const userCases = cases.filter((c) => c.members?.some((m) => m.userId === user?.id && m.role === 'Owner'))

  if (!user) {
    return (
      <Container>
        <Alert variant="warning">Please log in</Alert>
      </Container>
    )
  }

  return (
    <Container fluid>
      <div className="mb-4">
        <h1 className="display-4 fw-bold text-primary mb-2">
          <FaGavel className="me-2" />
          My Cases Dashboard
        </h1>
        <p className="lead text-muted">
          Welcome, <span className="fw-bold text-primary">{user.name}</span>. Here's an overview of your cases and their progress.
        </p>
      </div>

      {userCases.length === 0 ? (
        <Card className="text-center p-5">
          <Card.Body>
            <FaGavel size={64} className="text-muted mb-3" />
            <h3 className="mb-3">No Cases Yet</h3>
            <p className="text-muted mb-4">Start managing your cases by creating your first one.</p>
            <Button variant="primary" size="lg" onClick={() => navigate('/cases/new')}>
              <FaPlus className="me-2" />
              Create Your First Case
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Row className="g-4">
          {userCases.map((caseData) => {
            const stages = getStagesForCase(caseData)
            const currentIndex = getCurrentStageIndex(caseData)
            const nextHearing = caseData.hearings
              .filter((h) => new Date(h.date) >= new Date())
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]

            return (
              <Col key={caseData.id} xs={12} md={6} lg={4}>
                <Card className="h-100 shadow-sm">
                  <Card.Body>
                    <div className="mb-3">
                      <h5 className="fw-bold text-primary mb-2">
                        {caseData.id} — {caseData.title}
                      </h5>
                      <p className="text-muted small mb-2">
                        {caseData.court} • {caseData.caseType}
                      </p>
                      <div className="d-flex gap-2 flex-wrap">
                        <Badge bg={caseData.status === 'Open' ? 'success' : caseData.status === 'Stayed' ? 'warning' : 'secondary'}>
                          {caseData.status}
                        </Badge>
                        <Badge bg="info">
                          <FaCalendarAlt className="me-1" />
                          {caseData.hearings.length} hearings
                        </Badge>
                      </div>
                    </div>

                    {nextHearing && (
                      <Alert variant="info" className="mb-3">
                        <div className="fw-bold mb-1">
                          <FaCalendarAlt className="me-2" />
                          Next Hearing
                        </div>
                        <div className="small">
                          {format(new Date(nextHearing.date), 'PPP')}
                          {nextHearing.time && ` at ${nextHearing.time}`}
                        </div>
                        {nextHearing.location && (
                          <div className="small mt-1">
                            <FaMapMarkerAlt className="me-1" />
                            {nextHearing.location}
                          </div>
                        )}
                      </Alert>
                    )}

                    <div className="mb-3">
                      <h6 className="fw-bold mb-2">Case Progress</h6>
                      <CaseSteps stages={stages} currentStageIndex={currentIndex} />
                    </div>

                    <Button variant="outline-primary" className="w-100" onClick={() => navigate(`/cases/${caseData.id}`)}>
                      <FaEye className="me-2" />
                      View Case Details
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            )
          })}
        </Row>
      )}
    </Container>
  )
}
