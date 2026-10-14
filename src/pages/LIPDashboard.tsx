import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useCasesStore } from '../store/casesStore'
import { useTranslation } from '../hooks/useTranslation'
import CaseCard from '../components/case/CaseCard'
import DashboardHeader from '../components/dashboard/DashboardHeader'
import { FaFolderPlus } from 'react-icons/fa'

export default function LIPDashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { cases, togglePeerSupport } = useCasesStore()
  const { t } = useTranslation()

  const userCases = cases.filter((c) => c.members?.some((m) => m.userId === user?.id && m.role === 'Owner'))
  const upcomingHearingsCount = userCases.reduce((acc, c) => acc + (c.hearings ? c.hearings.length : 0), 0)
  const peerSupportCount = userCases.filter((c) => c.seekingPeerSupport).length

  if (!user) {
    return (
      <Container className="py-4">
        <Alert variant="warning">{t('auth.signInTitle')}</Alert>
      </Container>
    )
  }

  return (
    <Container fluid className="px-lg-4 py-2">
      {/* Dashboard Executive Header & Metric Pills */}
      <DashboardHeader
        userName={user.name}
        userRole={t('lipDashboard.userRoleLabel')}
        title={t('lipDashboard.title')}
        totalCases={userCases.length}
        upcomingHearingsCount={upcomingHearingsCount}
        peerSupportCount={peerSupportCount}
        onFindSupporters={() => navigate('/peer-directory')}
        onNewCase={() => navigate('/cases/new')}
      />

      {userCases.length === 0 ? (
        <Card className="premium-card text-center p-5 border-0">
          <Card.Body className="py-5">
            <div className="d-flex align-items-center justify-content-center mx-auto rounded-circle bg-primary-subtle text-primary mb-3" style={{ width: 64, height: 64 }}>
              <FaFolderPlus size={28} />
            </div>
            <h3 className="mb-2 fw-bold text-dark">{t('lipDashboard.noActiveCasesTitle')}</h3>
            <p className="mb-4 text-muted" style={{ maxWidth: 440, margin: '0 auto' }}>
              {t('lipDashboard.noActiveCasesDesc')}
            </p>
            <Button variant="primary" size="lg" className="fw-semibold px-4 py-2 rounded-3 shadow-sm" onClick={() => navigate('/cases/new')}>
              {t('lipDashboard.createFirstCaseBtn')}
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Row className="g-4">
          {userCases.map((caseData) => (
            <Col key={caseData.id} xs={12} md={6} lg={4} className="d-flex">
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
