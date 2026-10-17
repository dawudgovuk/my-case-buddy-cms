import { useMemo, useEffect } from 'react'
import { Container, Alert } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useCasesStore } from '../store/casesStore'
import { useTranslation } from '../hooks/useTranslation'
import { useResendVerificationEmail } from '../hooks/useResendVerificationEmail'
import { useCaseDashboardFilters } from '../hooks/useCaseDashboardFilters'
import { isUserCaseOwner } from '../utils/caseMembership'
import {
  PEER_SUPPORT_REQUEST_NOTE,
  countAllHearings,
  countCasesSeekingPeerSupport,
} from '../utils/dashboardUtils'
import DashboardHeader from '../components/dashboard/DashboardHeader'
import DashboardTableView from '../components/dashboard/DashboardTableView'
import DashboardFilterBar from '../components/dashboard/DashboardFilterBar'
import DashboardCaseGrid from '../components/dashboard/DashboardCaseGrid'
import VerificationPendingAlert from '../components/dashboard/VerificationPendingAlert'
import NoActiveCasesCard from '../components/dashboard/NoActiveCasesCard'
import NoMatchingCasesCard from '../components/dashboard/NoMatchingCasesCard'

export default function LIPDashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { cases, togglePeerSupport, refresh } = useCasesStore()
  const { t } = useTranslation()
  const { isResending, notice, resend } = useResendVerificationEmail()

  // Auto-sync cases on dashboard mount
  useEffect(() => {
    refresh()
  }, [refresh])

  // User-owned cases using unified RBAC ownership helper
  const userCases = useMemo(() => {
    if (!user) return []
    return cases.filter((c) => isUserCaseOwner(c, user))
  }, [cases, user])

  const {
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    clearFilters,
    filteredCases,
    statusCounts,
  } = useCaseDashboardFilters(userCases)

  const upcomingHearingsCount = countAllHearings(userCases)
  const peerSupportCount = countCasesSeekingPeerSupport(userCases)

  if (!user) {
    return (
      <Container className="py-4">
        <Alert variant="warning">{t('auth.signInTitle')}</Alert>
      </Container>
    )
  }

  const handleTogglePeerSupport = (caseId: string, currentSeeking: boolean) => {
    togglePeerSupport(caseId, !currentSeeking, currentSeeking ? undefined : PEER_SUPPORT_REQUEST_NOTE)
  }
  const handleViewCase = (caseId: string) => navigate(`/cases/${caseId}`)
  const handleEditCase = (caseId: string) => navigate(`/cases/${caseId}/edit`)

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

      {/* Verification Notice Banner if account not verified */}
      {!user.isVerified && (
        <VerificationPendingAlert
          email={user.email}
          verificationToken={user.verificationToken}
          notice={notice}
          isResending={isResending}
          onVerifyNow={() => navigate(`/verify-email/${user.verificationToken}`)}
          onResend={() => resend(user.email)}
        />
      )}

      {userCases.length === 0 ? (
        <NoActiveCasesCard onCreateCase={() => navigate('/cases/new')} />
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
            onClearFilters={clearFilters}
          />

          {/* Active View Display */}
          {filteredCases.length === 0 ? (
            <NoMatchingCasesCard onClearFilters={clearFilters} />
          ) : viewMode === 'grid' ? (
            /* 1. Grid / Cards View (with Timeline) */
            <DashboardCaseGrid
              cases={filteredCases}
              onTogglePeerSupport={handleTogglePeerSupport}
              onViewCase={handleViewCase}
              onEditCase={handleEditCase}
            />
          ) : (
            /* 2. Table View */
            <DashboardTableView
              cases={filteredCases}
              onViewCase={handleViewCase}
              onEditCase={handleEditCase}
              onTogglePeerSupport={handleTogglePeerSupport}
            />
          )}
        </>
      )}
    </Container>
  )
}
