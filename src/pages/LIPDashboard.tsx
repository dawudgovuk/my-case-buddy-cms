import { Container, Row, Col, Card, Button, Badge, Alert } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useCasesStore } from '../store/casesStore'
import CaseSteps from '../components/CaseSteps'
import { getStagesForCase, getCurrentStageIndex } from '../utils/caseStages'
import { format } from 'date-fns'
import { FaHandshake, FaUserShield } from 'react-icons/fa'

export default function LIPDashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { cases, togglePeerSupport } = useCasesStore()

  const userCases = cases.filter((c) => c.members?.some((m) => m.userId === user?.id && m.role === 'Owner'))

  if (!user) {
    return (
      <Container className="py-4">
        <Alert variant="warning">Please log in</Alert>
      </Container>
    )
  }

  return (
    <Container fluid className="py-2">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h1 className="h2 mb-1">My Cases Dashboard</h1>
          <p className="lead mb-0 text-secondary">
            Welcome, <span className="fw-bold">{user.name}</span>. Track your case progression and connect with peer legal support.
          </p>
        </div>
        <Button
          variant="outline-primary"
          className="d-flex align-items-center gap-2"
          onClick={() => navigate('/peer-directory')}
        >
          <FaUserShield />
          <span>Find Experienced Legal People</span>
        </Button>
      </div>

      {userCases.length === 0 ? (
        <Card className="text-center p-5 shadow-sm border-0">
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
                <Card className="h-100 shadow-sm border-0 d-flex flex-column">
                  <Card.Body className="d-flex flex-column">
                    <div className="mb-3">
                      <h5 className="fw-bold mb-1 text-primary">
                        {caseData.id} — {caseData.title}
                      </h5>
                      <p className="small mb-2 text-secondary">
                        {caseData.court} • {caseData.caseType}
                      </p>
                      <div className="d-flex gap-2 flex-wrap">
                        <Badge
                          bg={
                            caseData.status === 'Open'
                              ? 'success'
                              : caseData.status === 'Stayed'
                              ? 'warning'
                              : 'secondary'
                          }
                          className="px-2 py-1"
                        >
                          {caseData.status}
                        </Badge>
                        <Badge bg="primary" className="px-2 py-1">
                          {caseData.hearings.length} hearings
                        </Badge>
                        {caseData.seekingPeerSupport && (
                          <Badge bg="info" className="px-2 py-1">
                            Peer Support Active
                          </Badge>
                        )}
                      </div>
                    </div>

                    {nextHearing && (
                      <Alert variant="warning" className="mb-3 py-2 px-3 small">
                        <div className="fw-bold mb-1">Next Hearing:</div>
                        <div>
                          {format(new Date(nextHearing.date), 'PPP')}
                          {nextHearing.time && ` at ${nextHearing.time}`}
                        </div>
                        {nextHearing.location && <div className="text-secondary">{nextHearing.location}</div>}
                      </Alert>
                    )}

                    <div className="mb-3">
                      <h6 className="fw-bold mb-2 small text-muted">Case Progress</h6>
                      <CaseSteps stages={stages} currentStageIndex={currentIndex} />
                    </div>

                    <div className="mt-auto d-flex flex-column gap-2 pt-2">
                      <Button
                        variant={caseData.seekingPeerSupport ? 'outline-success' : 'outline-secondary'}
                        size="sm"
                        className="d-flex align-items-center justify-content-center gap-1"
                        onClick={() =>
                          togglePeerSupport(
                            caseData.id,
                            !caseData.seekingPeerSupport,
                            caseData.seekingPeerSupport ? undefined : 'Seeking peer review from experienced supporters'
                          )
                        }
                      >
                        <FaHandshake />
                        <span>
                          {caseData.seekingPeerSupport ? '✓ Open to Peer Support' : 'Enable Peer Support'}
                        </span>
                      </Button>

                      <Button
                        variant="primary"
                        size="sm"
                        className="w-100"
                        onClick={() => navigate(`/cases/${caseData.id}`)}
                      >
                        View Case Details
                      </Button>
                    </div>
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
