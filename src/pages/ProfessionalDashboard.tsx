import { useState, useEffect, useMemo } from 'react'
import { Container, Row, Col, Alert, Badge } from 'react-bootstrap'
import { useAuthStore } from '../store/authStore'
import { useCasesStore } from '../store/casesStore'
import { getDeadlinesForUser, updateDeadline } from '../services/storage'
import type { DocumentDeadline } from '../types/domain'
import UpcomingHearingsCard, { type HearingItem } from '../components/dashboard/UpcomingHearingsCard'
import DeadlinesCard from '../components/dashboard/DeadlinesCard'
import AssignedCasesTab from '../components/dashboard/AssignedCasesTab'
import PeerSupportCasesTab from '../components/dashboard/PeerSupportCasesTab'
import TabNav, { type TabItem } from '../components/common/TabNav'
import { FaUserCheck, FaExclamationCircle, FaHandshake, FaGavel, FaCalendarAlt } from 'react-icons/fa'

type DashboardTab = 'peer' | 'assigned' | 'schedule'

export default function ProfessionalDashboard() {
  const { user } = useAuthStore()
  const { cases } = useCasesStore()
  const [deadlines, setDeadlines] = useState<DocumentDeadline[]>([])
  const [activeTab, setActiveTab] = useState<DashboardTab>('peer')

  useEffect(() => {
    if (!user) return
    const userDeadlines = getDeadlinesForUser(user.id)
    setDeadlines(userDeadlines)
  }, [user])

  const userCases = useMemo(() => {
    if (!user) return []
    return cases.filter((c) => c.members?.some((m) => m.userId === user.id))
  }, [user, cases])

  const peerSupportCasesCount = useMemo(() => {
    if (!user) return 0
    return cases.filter(
      (c) => Boolean(c.seekingPeerSupport) && !c.members?.some((m) => m.userId === user.id && m.role === 'Owner')
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

  const dashboardTabs = useMemo<TabItem<DashboardTab>[]>(
    () => [
      {
        key: 'peer',
        label: 'Peer Support Cases',
        count: peerSupportCasesCount,
        badgeVariant: 'primary',
        icon: <FaHandshake />,
      },
      {
        key: 'assigned',
        label: 'My Assigned Cases',
        count: userCases.length,
        badgeVariant: 'secondary',
        icon: <FaGavel />,
      },
      {
        key: 'schedule',
        label: 'Hearings & Deadlines',
        icon: <FaCalendarAlt />,
      },
    ],
    [peerSupportCasesCount, userCases.length]
  )

  function handleDeadlineToggle(deadlineId: string, currentStatus: DocumentDeadline['status']) {
    const newStatus = currentStatus === 'submitted' ? 'pending' : 'submitted'
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
  }

  if (!user) {
    return (
      <Container className="py-4">
        <Alert variant="warning">Please sign in to view the Professional Dashboard.</Alert>
      </Container>
    )
  }

  return (
    <Container fluid className="py-2">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h1 className="h2 mb-1">Professional Dashboard</h1>
          <p className="lead mb-0 text-secondary">
            Welcome, <span className="fw-bold">{user.name}</span> ({user.role})
            {user.firm && <span> • {user.firm}</span>}
          </p>
        </div>

        <div>
          {user.isVerified ? (
            <Badge bg="success" className="px-3 py-2 fs-6 d-inline-flex align-items-center gap-1">
              <FaUserCheck />
              <span>Verified Account</span>
            </Badge>
          ) : (
            <Badge bg="warning" className="px-3 py-2 fs-6 text-dark d-inline-flex align-items-center gap-1">
              <FaExclamationCircle />
              <span>Pending Email Verification</span>
            </Badge>
          )}
        </div>
      </div>

      <TabNav items={dashboardTabs} activeKey={activeTab} onSelect={setActiveTab} />

      {activeTab === 'peer' && <PeerSupportCasesTab user={user} cases={cases} />}

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
    </Container>
  )
}
