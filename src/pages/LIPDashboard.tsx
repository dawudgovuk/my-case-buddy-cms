import { useState, useMemo, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useCasesStore } from '../store/casesStore'
import { useTranslation } from '../hooks/useTranslation'
import type { CaseStatus } from '../types/domain'
import CaseCard from '../components/case/CaseCard'
import DashboardHeader from '../components/dashboard/DashboardHeader'
import DashboardTableView from '../components/dashboard/DashboardTableView'
import DashboardFilterBar from '../components/dashboard/DashboardFilterBar'
import { FaFolderPlus } from 'react-icons/fa'

type DashboardViewMode = 'grid' | 'table'

export default function LIPDashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { cases, togglePeerSupport } = useCasesStore()
  const { t } = useTranslation()

  // View mode state with local storage persistence
  const [viewMode, setViewMode] = useState<DashboardViewMode>(() => {
    const saved = localStorage.getItem('lip_dashboard_view')
    return saved === 'table' ? 'table' : 'grid'
  })

  useEffect(() => {
    localStorage.setItem('lip_dashboard_view', viewMode)
  }, [viewMode])

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<CaseStatus | 'All'>('All')

  // User-owned cases
  const userCases = useMemo(() => {
    if (!user) return []
    return cases.filter((c) =>
      c.members?.some((m) => m.userId === user.id && m.role === 'Owner')
    )
  }, [cases, user])

  // Filtered cases based on search and status
  const filteredCases = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return userCases.filter((c) => {
      if (statusFilter !== 'All' && c.status !== statusFilter) {
        return false
      }
      if (query) {
        const matches = [c.id, c.title, c.court, c.caseType, c.allocatedJudge]
          .filter(Boolean)
          .some((val) => String(val).toLowerCase().includes(query))
        if (!matches) return false
      }
      return true
    })
  }, [userCases, searchQuery, statusFilter])

  // Real-time status counts
  const statusCounts = useMemo(() => {
    return {
      All: userCases.length,
      Open: userCases.filter((c) => c.status === 'Open').length,
      Stayed: userCases.filter((c) => c.status === 'Stayed').length,
      Concluded: userCases.filter((c) => c.status === 'Concluded').length,
    }
  }, [userCases])

  const upcomingHearingsCount = userCases.reduce(
    (acc, c) => acc + (c.hearings ? c.hearings.length : 0),
    0
  )
  const peerSupportCount = userCases.filter((c) => c.seekingPeerSupport).length

  if (!user) {
    return (
      <Container className="py-4">
        <Alert variant="warning">{t('auth.signInTitle')}</Alert>
      </Container>
    )
  }

  const handleTogglePeerSupport = (caseId: string, currentSeeking: boolean) => {
    togglePeerSupport(
      caseId,
      !currentSeeking,
      currentSeeking ? undefined : 'Seeking peer review from experienced supporters'
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
            <div
              className="d-flex align-items-center justify-content-center mx-auto rounded-circle bg-primary-subtle text-primary mb-3"
              style={{ width: 64, height: 64 }}
            >
              <FaFolderPlus size={28} />
            </div>
            <h3 className="mb-2 fw-bold text-dark">
              {t('lipDashboard.noActiveCasesTitle')}
            </h3>
            <p className="mb-4 text-muted" style={{ maxWidth: 440, margin: '0 auto' }}>
              {t('lipDashboard.noActiveCasesDesc')}
            </p>
            <Button
              className="btn-obsidian fw-semibold px-4 py-2 rounded-3 shadow-sm"
              size="lg"
              onClick={() => navigate('/cases/new')}
            >
              {t('lipDashboard.createFirstCaseBtn')}
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <>
          {/* Controls & View Switcher Toolbar */}
          <DashboardFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            statusCounts={statusCounts}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onClearFilters={() => {
              setSearchQuery('')
              setStatusFilter('All')
            }}
          />

          {/* Active View Display */}
          {filteredCases.length === 0 ? (
            <Card className="premium-card text-center p-5 border-0">
              <Card.Body className="py-4">
                <h6 className="fw-bold text-dark">No matching cases found</h6>
                <p className="small text-muted mb-3">
                  Try adjusting your search query or status filter to see your active court cases.
                </p>
                <Button
                  variant="light"
                  className="btn-soft border px-3 py-1.5 small fw-semibold"
                  onClick={() => {
                    setSearchQuery('')
                    setStatusFilter('All')
                  }}
                >
                  Clear Filters
                </Button>
              </Card.Body>
            </Card>
          ) : viewMode === 'grid' ? (
            /* 1. Grid / Cards View (with Timeline) */
            <Row className="g-4">
              {filteredCases.map((caseData) => (
                <Col key={caseData.id} xs={12} md={6} lg={4} className="d-flex">
                  <CaseCard
                    caseData={caseData}
                    buttonLayout="vertical"
                    progressComponent="timeline"
                    timelineDefaultExpanded={false}
                    onTogglePeerSupport={handleTogglePeerSupport}
                    onViewDetails={(caseId) => navigate(`/cases/${caseId}`)}
                    onEdit={(caseId) => navigate(`/cases/${caseId}/edit`)}
                  />
                </Col>
              ))}
            </Row>
          ) : (
            /* 2. Table View */
            <DashboardTableView
              cases={filteredCases}
              onViewCase={(caseId) => navigate(`/cases/${caseId}`)}
              onEditCase={(caseId) => navigate(`/cases/${caseId}/edit`)}
              onTogglePeerSupport={handleTogglePeerSupport}
            />
          )}
        </>
      )}
    </Container>
  )
}

