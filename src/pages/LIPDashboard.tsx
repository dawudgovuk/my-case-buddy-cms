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
        <h1>
          My Cases Dashboard
        </h1>
        <p className="lead">
          Welcome, <span className="fw-bold">{user.name}</span>. Here's an overview of your cases and their progress.
        </p>
      </div>

      {userCases.length === 0 ? (
        <Card className="text-center p-5">
          <Card.Body>
            
            <h3 className="mb-3 fw-bold">No Cases Yet</h3>
            <p className="mb-4 text-secondary">Start managing your cases by creating your first one.</p>
            <Button variant="primary" size="lg" className="fw-bold px-4 py-2" onClick={() => navigate('/cases/new')}>
              
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
                      <h5 className="fw-bold mb-2 text-primary">
                        {caseData.id} — {caseData.title}
                      </h5>
                      <p className="small mb-2 text-secondary">
                        {caseData.court} • {caseData.caseType}
                      </p>
                      <div className="d-flex gap-2 flex-wrap">
                        <Badge bg={caseData.status === 'Open' ? 'success' : caseData.status === 'Stayed' ? 'warning' : 'secondary'} className="fw-semibold px-3 py-2">
                          {caseData.status}
                        </Badge>
                        <Badge bg="primary" className="fw-semibold px-3 py-2">
                          
                          {caseData.hearings.length} hearings
                        </Badge>
                      </div>
                    </div>

                    {nextHearing && (
                      <Alert variant="warning" className="mb-3 fw-semibold">
                        <div className="fw-bold mb-1">
                          
                          Next Hearing
                        </div>
                        <div className="small">
                          {format(new Date(nextHearing.date), 'PPP')}
                          {nextHearing.time && ` at ${nextHearing.time}`}
                        </div>
                        {nextHearing.location && (
                          <div className="small mt-1">
                            
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
