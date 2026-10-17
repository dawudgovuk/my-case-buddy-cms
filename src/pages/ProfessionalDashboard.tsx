import { useState, useEffect, useMemo } from 'react'
import { Container, Row, Col, Alert } from 'react-bootstrap'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useCasesStore } from '../store/casesStore'
import { getDeadlinesForUser, updateDeadline } from '../services/storage'
import { fetchStrapiDeadlines, updateStrapiDeadlineStatus } from '../services/strapi'
import type { DocumentDeadline } from '../types/domain'
import { isUserCaseMember, isUserCaseOwner } from '../utils/caseMembership'
import UpcomingHearingsCard, { type HearingItem } from '../components/dashboard/UpcomingHearingsCard'
import DeadlinesCard from '../components/dashboard/DeadlinesCard'
import AssignedCasesTab from '../components/dashboard/AssignedCasesTab'
import PeerSupportCasesTab from '../components/dashboard/PeerSupportCasesTab'
import ProfessionalHeader from '../components/dashboard/ProfessionalHeader'
import SystemQuickGuide from '../components/dashboard/SystemQuickGuide'
import ProfessionalFaqModal from '../components/dashboard/ProfessionalFaqModal'
import TabNav, { type TabItem } from '../components/common/TabNav'
import { FaHandshake, FaGavel, FaCalendarAlt, FaLock } from 'react-icons/fa'
import { useTranslation } from '../hooks/useTranslation'
import { toast } from '../store/toastStore'

type DashboardTab = 'peer' | 'assigned' | 'schedule'

export default function ProfessionalDashboard() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuthStore()
  const { cases, isStrapiMode, syncWithStrapi } = useCasesStore()
  const { t } = useTranslation()
  const [deadlines, setDeadlines] = useState<DocumentDeadline[]>([])
  const [activeTab, setActiveTab] = useState<DashboardTab>('peer')
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(!user?.isVerified)
  const [showFaqModal, setShowFaqModal] = useState(false)

  useEffect(() => {
    const tabParam = searchParams.get('tab') as DashboardTab | null
    if (tabParam && ['peer', 'assigned', 'schedule'].includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [searchParams])

  useEffect(() => {
    if (!user) return
    const userDeadlines = getDeadlinesForUser(user.id)
    setDeadlines(userDeadlines)

    if (isStrapiMode) {
      void syncWithStrapi()
      fetchStrapiDeadlines()
        .then((strapiDeadlines) => {
          if (strapiDeadlines && strapiDeadlines.length > 0) {
            setDeadlines(strapiDeadlines)
          }
        })
        .catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, isStrapiMode])

  const userCases = useMemo(() => {
    if (!user) return []
    return cases.filter((c) => isUserCaseMember(c, user))
  }, [user, cases])

  const peerSupportCasesCount = useMemo(() => {
    if (!user) return 0
    return cases.filter(
      (c) => Boolean(c.seekingPeerSupport) && !isUserCaseOwner(c, user) && !isUserCaseMember(c, user)
    ).length
  }, [cases, user])

  const upcomingHearings = useMemo(() => {
    const list: HearingItem[] = []
    userCases.forEach((caseData) => {
      caseData.hearings.forEach((hearing) => {
        const hearingDate = new Date(hearing.date)
        if (hearingDate >= new Date()) {
          list.push({
            caseId: caseData.id,
            caseTitle: caseData.title,
            hearing,
          })
        }
      })
    })
    return list.sort((a, b) => new Date(a.hearing.date).getTime() - new Date(b.hearing.date).getTime())
  }, [userCases])

  const pendingDeadlinesCount = useMemo(() => {
    return deadlines.filter((d) => d.status === 'pending').length
  }, [deadlines])

  const dashboardTabs = useMemo<TabItem<DashboardTab>[]>(
    () => [
      {
        key: 'peer',
        label: user?.isVerified
          ? t('professionalDashboard.peerSupportTab')
          : t('professionalDashboard.peerSupportRequestsTab'),
        count: peerSupportCasesCount,
        badgeVariant: user?.isVerified ? 'primary' : 'warning',
        icon: user?.isVerified ? <FaHandshake /> : <FaLock className="text-warning" />,
      },
      {
        key: 'assigned',
        label: t('professionalDashboard.assignedCasesTab'),
        count: userCases.length,
        badgeVariant: 'secondary',
        icon: <FaGavel />,
      },
      {
        key: 'schedule',
        label: t('professionalDashboard.scheduleTab'),
        count: upcomingHearings.length + pendingDeadlinesCount,
        badgeVariant: 'info',
        icon: <FaCalendarAlt />,
      },
    ],
    [peerSupportCasesCount, userCases.length, user?.isVerified, upcomingHearings.length, pendingDeadlinesCount, t]
  )

  function handleDeadlineToggle(deadlineId: string, currentStatus: DocumentDeadline['status']) {
    const newStatus = currentStatus === 'submitted' ? 'pending' : 'submitted'
    const dl = deadlines.find((d) => d.id === deadlineId)
    updateDeadline(deadlineId, {
      status: newStatus,
      submittedAt: newStatus === 'submitted' ? new Date().toISOString() : undefined,
    })
    setDeadlines((prev) =>
      prev.map((d) =>
        d.id === deadlineId
          ? { ...d, status: newStatus, submittedAt: newStatus === 'submitted' ? new Date().toISOString() : undefined }
          : d
      )
    )

    if (newStatus === 'submitted') {
      toast.success(`Marked deadline "${dl?.title || 'item'}" as submitted.`, 'Deadline Completed')
    } else {
      toast.info(`Reopened deadline "${dl?.title || 'item'}".`, 'Deadline Pending')
    }

    if (isStrapiMode) {
      updateStrapiDeadlineStatus(deadlineId, newStatus).catch(() => {
        // Fallback without disruption
      })
    }
  }

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
        <Row className="g-4">
          <Col xs={12} lg={6}>
            <UpcomingHearingsCard hearings={upcomingHearings} />
          </Col>
          <Col xs={12} lg={6}>
            <DeadlinesCard deadlines={deadlines} onToggleDeadline={handleDeadlineToggle} />
          </Col>
        </Row>
      )}

      {/* Accessible Beginner / System FAQ Modal */}
      <ProfessionalFaqModal show={showFaqModal} onHide={() => setShowFaqModal(false)} />
    </Container>
  )
}
