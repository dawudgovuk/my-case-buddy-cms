import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useCasesStore } from '../store/casesStore'
import CaseCard from '../components/case/CaseCard'
import { FaUserShield } from 'react-icons/fa'

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
          {userCases.map((caseData) => (
            <Col key={caseData.id} xs={12} md={6} lg={4}>
              <CaseCard
                caseData={caseData}
                onTogglePeerSupport={(caseId, currentSeeking) =>
                  togglePeerSupport(
                    caseId,
                    !currentSeeking,
                    currentSeeking ? undefined : 'Seeking peer review from experienced supporters'
                  )
                }
                onViewDetails={(caseId) => navigate(`/cases/${caseId}`)}
              />
            </Col>
          ))}
        </Row>
      )}
    </Container>
  )
}
