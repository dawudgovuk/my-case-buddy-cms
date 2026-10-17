import { useState, useMemo } from 'react'
import { Container, Alert } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useCasesStore } from '../store/casesStore'
import { isUserCaseMember } from '../utils/caseMembership'
import { countPeerSupportOpportunities, getUpcomingHearings } from '../utils/dashboardUtils'
import { useProfessionalDashboardTab } from '../hooks/useProfessionalDashboardTab'
import { useProfessionalDeadlines } from '../hooks/useProfessionalDeadlines'
import { useProfessionalDashboardTabs } from '../hooks/useProfessionalDashboardTabs'
import AssignedCasesTab from '../components/dashboard/AssignedCasesTab'
import PeerSupportCasesTab from '../components/dashboard/PeerSupportCasesTab'
import ProfessionalHeader from '../components/dashboard/ProfessionalHeader'
import ProfessionalScheduleTab from '../components/dashboard/ProfessionalScheduleTab'
import SystemQuickGuide from '../components/dashboard/SystemQuickGuide'
import ProfessionalFaqModal from '../components/dashboard/ProfessionalFaqModal'
import TabNav from '../components/common/TabNav'

export default function ProfessionalDashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { cases, isStrapiMode, syncWithStrapi } = useCasesStore()
  const [activeTab, setActiveTab] = useProfessionalDashboardTab()
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(!user?.isVerified)
  const [showFaqModal, setShowFaqModal] = useState(false)
  const { deadlines, pendingDeadlinesCount, toggleDeadline } = useProfessionalDeadlines({
    user,
    isStrapiMode,
    syncWithStrapi,
  })

  const userCases = useMemo(() => {
    if (!user) return []
    return cases.filter((c) => isUserCaseMember(c, user))
  }, [user, cases])

  const peerSupportCasesCount = useMemo(() => countPeerSupportOpportunities(cases, user), [cases, user])
  const upcomingHearings = useMemo(() => getUpcomingHearings(userCases), [userCases])

  const dashboardTabs = useProfessionalDashboardTabs({
    isVerified: user?.isVerified,
    peerSupportCasesCount,
    assignedCasesCount: userCases.length,
    upcomingHearingsCount: upcomingHearings.length,
    pendingDeadlinesCount,
  })

  function handleVerifyClick() {
    if (!user) return
    const token = user.verificationToken || 'demo_token_verify_now'
    navigate(`/verify-email/${token}`)
  }

  if (!user) {
    return (
      <Container className="py-4">
        <Alert variant="warning">Please sign in to view the Professional Dashboard.</Alert>
      </Container>
    )
  }

  return (
    <Container fluid className="px-lg-4 py-2">
      {/* Redesigned Executive Professional Header with Metrics and Actions */}
      <ProfessionalHeader
        user={user}
        assignedCasesCount={userCases.length}
        peerSupportCasesCount={peerSupportCasesCount}
        upcomingHearingsCount={upcomingHearings.length}
        pendingDeadlinesCount={pendingDeadlinesCount}
        isGuideOpen={isGuideOpen}
        onToggleGuide={() => setIsGuideOpen(!isGuideOpen)}
        onOpenFaq={() => setShowFaqModal(true)}
        onVerifyClick={handleVerifyClick}
        onSelectTab={(tab) => setActiveTab(tab)}
      />

      {/* Beginner-friendly System Quick Guide for Newcomers */}
      <SystemQuickGuide
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        isVerified={Boolean(user.isVerified)}
        onVerifyClick={handleVerifyClick}
        onViewAssignedClick={() => setActiveTab('assigned')}
        onOpenFaq={() => setShowFaqModal(true)}
        assignedCasesCount={userCases.length}
      />

      {/* Main Tab Navigation */}
      <TabNav items={dashboardTabs} activeKey={activeTab} onSelect={setActiveTab} />

      {/* Tab Panels */}
      {activeTab === 'peer' && (
        <PeerSupportCasesTab
          user={user}
          cases={cases}
          onSwitchToAssigned={() => setActiveTab('assigned')}
          assignedCasesCount={userCases.length}
        />
      )}

      {activeTab === 'assigned' && <AssignedCasesTab cases={userCases} deadlines={deadlines} />}

      {activeTab === 'schedule' && (
        <ProfessionalScheduleTab
          hearings={upcomingHearings}
          deadlines={deadlines}
          onToggleDeadline={toggleDeadline}
        />
      )}

      {/* Accessible Beginner / System FAQ Modal */}
      <ProfessionalFaqModal show={showFaqModal} onHide={() => setShowFaqModal(false)} />
    </Container>
  )
}
