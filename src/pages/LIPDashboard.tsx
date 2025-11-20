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
      <Container className="login-airbnb-bg" style={{ minHeight: '100vh' }}>
        <Alert variant="warning" className="login-airbnb-card p-4 text-center" style={{ maxWidth: 400, margin: 'auto' }}>
          Please log in
        </Alert>
      </Container>
    )
  }

  return (
    <Container fluid className="py-4" style={{ background: 'linear-gradient(120deg, #fff 0%, #f7f7f7 100%)', minHeight: '100vh' }}>
      <div className="mb-4 text-center">
        <h1 style={{ fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 800, color: 'var(--airbnb-coral)', fontSize: '2.5rem', letterSpacing: '-0.01em' }}>
          <FaGavel style={{ marginRight: 12, color: 'var(--airbnb-dark)' }} />
          My Cases Dashboard
        </h1>
        <p style={{ color: 'var(--airbnb-gray)', fontSize: '1.2rem', marginTop: 8 }}>
          Welcome, <span style={{ color: 'var(--airbnb-green)', fontWeight: 700 }}>{user.name}</span>. Here's an overview of your cases and their progress.
        </p>
      </div>

      {userCases.length === 0 ? (
        <Card className="login-airbnb-card text-center p-5 mx-auto" style={{ maxWidth: 420 }}>
          <Card.Body>
            <FaGavel size={64} style={{ color: 'var(--airbnb-gray)' }} className="mb-3" />
            <h3 className="mb-3" style={{ color: 'var(--airbnb-dark)', fontWeight: 800 }}>No Cases Yet</h3>
            <p className="mb-4" style={{ color: 'var(--airbnb-gray)' }}>Start managing your cases by creating your first one.</p>
            <Button className="login-airbnb-btn" size="lg" onClick={() => navigate('/cases/new')}>
              <FaPlus style={{ marginRight: 8 }} />
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
                <Card className="login-airbnb-card h-100 shadow-sm p-2" style={{ borderRadius: 20, border: '1px solid var(--airbnb-border)' }}>
                  <Card.Body>
                    <div className="mb-3">
                      <h5 style={{ color: 'var(--airbnb-coral)', fontWeight: 700, fontSize: '1.2rem' }} className="mb-2">
                        {caseData.id} — {caseData.title}
                      </h5>
                      <p style={{ color: 'var(--airbnb-gray)' }} className="small mb-2">
                        {caseData.court} • {caseData.caseType}
                      </p>
                      <div className="d-flex gap-2 flex-wrap">
                        <Badge style={{ background: caseData.status === 'Open' ? 'var(--airbnb-green)' : caseData.status === 'Stayed' ? 'var(--airbnb-yellow)' : 'var(--airbnb-gray)', color: '#fff', fontWeight: 600, fontSize: '0.95em', borderRadius: 12, padding: '0.4em 0.9em' }}>
                          {caseData.status}
                        </Badge>
                        <Badge style={{ background: 'var(--airbnb-coral)', color: '#fff', fontWeight: 600, fontSize: '0.95em', borderRadius: 12, padding: '0.4em 0.9em' }}>
                          <FaCalendarAlt style={{ marginRight: 4 }} />
                          {caseData.hearings.length} hearings
                        </Badge>
                      </div>
                    </div>

                    {nextHearing && (
                      <Alert style={{ background: 'var(--airbnb-yellow)', color: 'var(--airbnb-dark)', border: 'none', borderRadius: 12, fontWeight: 600 }} className="mb-3 py-2 px-3">
                        <div className="fw-bold mb-1">
                          <FaCalendarAlt style={{ marginRight: 8 }} />
                          Next Hearing
                        </div>
                        <div className="small">
                          {format(new Date(nextHearing.date), 'PPP')}
                          {nextHearing.time && ` at ${nextHearing.time}`}
                        </div>
                        {nextHearing.location && (
                          <div className="small mt-1">
                            <FaMapMarkerAlt style={{ marginRight: 4 }} />
                            {nextHearing.location}
                          </div>
                        )}
                      </Alert>
                    )}

                    <div className="mb-3">
                      <h6 style={{ color: 'var(--airbnb-dark)', fontWeight: 700 }} className="mb-2">Case Progress</h6>
                      <CaseSteps stages={stages} currentStageIndex={currentIndex} />
                    </div>

                    <Button className="login-airbnb-outline w-100" style={{ borderRadius: 16, fontWeight: 700, fontSize: '1.05rem' }} onClick={() => navigate(`/cases/${caseData.id}`)}>
                      <FaEye style={{ marginRight: 8 }} />
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
