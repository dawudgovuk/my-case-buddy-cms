import { useState, useMemo, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Form, Alert } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useCasesStore } from '../store/casesStore'
import { useTranslation } from '../hooks/useTranslation'
import type { CaseStatus } from '../types/domain'
import CaseCard from '../components/case/CaseCard'
import DashboardHeader from '../components/dashboard/DashboardHeader'
import DashboardTableView from '../components/dashboard/DashboardTableView'
import {
  FaFolderPlus,
  FaThLarge,
  FaTable,
  FaSearch,
  FaTimes,
} from 'react-icons/fa'

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
          <div
            className="bg-white rounded-4 p-3 border mb-4"
            style={{
              borderColor: '#e2e8f0',
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.02), 0 6px 18px -4px rgba(15, 23, 42, 0.04)',
            }}
          >
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
              {/* Search & Status Filters */}
              <div className="d-flex align-items-center gap-2.5 flex-grow-1 flex-wrap" style={{ minWidth: 260 }}>
                {/* Search Box */}
                <div className="position-relative flex-grow-1" style={{ maxWidth: 300 }}>
                  <FaSearch
                    size={12}
                    className="position-absolute text-muted"
                    style={{ left: 12, top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <Form.Control
                    type="search"
                    placeholder="Search cases, courts, or IDs..."
                    size="sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="ps-4 pe-4 py-1.5 rounded-3 bg-light border shadow-none"
                    style={{ fontSize: '0.825rem', borderColor: '#e2e8f0' }}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      className="btn btn-link position-absolute p-0 text-muted"
                      style={{ right: 10, top: '50%', transform: 'translateY(-50%)' }}
                      onClick={() => setSearchQuery('')}
                      aria-label="Clear Search"
                    >
                      <FaTimes size={11} />
                    </button>
                  )}
                </div>

                {/* Status Filter Buttons with live counts */}
                <div className="d-flex align-items-center gap-1.5 flex-wrap">
                  {(['All', 'Open', 'Stayed', 'Concluded'] as const).map((st) => {
                    const isSelected = statusFilter === st
                    return (
                      <button
                        key={st}
                        type="button"
                        className={`btn btn-sm d-inline-flex align-items-center gap-1.5 px-3 py-1.5 rounded-pill fw-medium transition-all ${
                          isSelected
                            ? 'btn-obsidian text-white shadow-xs'
                            : 'btn-soft text-secondary border'
                        }`}
                        style={{ fontSize: '0.78rem' }}
                        onClick={() => setStatusFilter(st)}
                      >
                        <span>{st}</span>
                        <span
                          className={`badge rounded-pill ${
                            isSelected
                              ? 'bg-white bg-opacity-25 text-white'
                              : 'bg-light text-muted border'
                          }`}
                          style={{ fontSize: '0.68rem', padding: '2px 6px' }}
                        >
                          {statusCounts[st]}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* View Mode Segmented Controls */}
              <div
                className="d-flex align-items-center bg-light p-1 rounded-pill border flex-shrink-0"
                style={{ borderColor: '#e2e8f0' }}
              >
                <Button
                  variant="light"
                  size="sm"
                  className={`d-inline-flex align-items-center gap-1.5 px-3 py-1 rounded-pill shadow-none border-0 ${
                    viewMode === 'grid'
                      ? 'btn-obsidian text-white shadow-xs'
                      : 'text-secondary bg-transparent'
                  }`}
                  style={{ fontSize: '0.8rem' }}
                  onClick={() => setViewMode('grid')}
                  title="Card View (with Timeline)"
                >
                  <FaThLarge size={11} />
                  <span>Cards</span>
                </Button>

                <Button
                  variant="light"
                  size="sm"
                  className={`d-inline-flex align-items-center gap-1.5 px-3 py-1 rounded-pill shadow-none border-0 ${
                    viewMode === 'table'
                      ? 'btn-obsidian text-white shadow-xs'
                      : 'text-secondary bg-transparent'
                  }`}
                  style={{ fontSize: '0.8rem' }}
                  onClick={() => setViewMode('table')}
                  title="Table View"
                >
                  <FaTable size={11} />
                  <span>Table</span>
                </Button>
              </div>
            </div>
          </div>

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
                    buttonLayout="horizontal"
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

