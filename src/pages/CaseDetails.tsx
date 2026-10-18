import { useMemo, useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCasesStore } from '../store/casesStore'
import { useAuthStore } from '../store/authStore'
import { useTranslation } from '../hooks/useTranslation'
import { Card, Tabs, Tab, Badge, Spinner } from 'react-bootstrap'
import CaseSummaryCard from '../components/case/CaseSummaryCard'
import CaseOverviewTab from '../components/case/tabs/CaseOverviewTab'
import PartiesTab from '../components/case/tabs/PartiesTab'
import HearingsTab from '../components/case/tabs/HearingsTab'
import DocumentsTab from '../components/case/tabs/DocumentsTab'
import OrdersTab from '../components/case/tabs/OrdersTab'
import NotesTab from '../components/case/tabs/NotesTab'
import TeamInvitesTab from '../components/case/tabs/TeamInvitesTab'
import LegalHubTab from '../components/case/tabs/LegalHubTab'
import { CASE_DETAILS_TABS } from '../utils/caseConstants'
import {
  FaInfoCircle,
  FaUsers,
  FaCalendarAlt,
  FaFileAlt,
  FaBalanceScale,
  FaStickyNote,
  FaUserFriends,
  FaGavel,
} from 'react-icons/fa'

export default function CaseDetails() {
  const { caseId } = useParams()
  const navigate = useNavigate()
  const { getById, isLoadingStrapi, refresh } = useCasesStore()
  const { user } = useAuthStore()
  const { t } = useTranslation()
  const fc = useMemo(() => (caseId ? getById(caseId) : undefined), [caseId, getById])
  const [tab, setTab] = useState<number>(CASE_DETAILS_TABS.OVERVIEW)

  const isProfessional = Boolean(user?.role && user.role !== 'LIP')

  useEffect(() => {
    refresh()
  }, [refresh])

  if (!caseId) return <div className="text-danger p-4">{t('caseDetails.notFound')}</div>

  if (isLoadingStrapi && !fc) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <Spinner animation="border" variant="primary" className="me-2" />
        <span className="text-muted">Loading case details...</span>
      </div>
    )
  }

  if (!fc) return <div className="text-danger p-4">{t('caseDetails.notFound')}</div>

  const partiesCount = fc.parties?.length || 0
  const hearingsCount = fc.hearings?.length || 0
  const documentsCount = fc.documents?.length || 0
  const ordersCount = fc.orders?.length || 0
  const notesCount = fc.notes?.length || 0

  return (
    <div className="py-2" style={{ maxWidth: '1240px', margin: '0 auto' }}>
      {/* Reusable Case Header Summary */}
      <CaseSummaryCard
        caseData={fc}
        onEdit={() => navigate(`/cases/${fc.id}/edit`)}
        onBack={() => navigate(isProfessional ? '/professional-dashboard' : '/cases')}
        backLabel={isProfessional ? 'Back to Dashboard' : undefined}
      />

      <Card className="shadow-sm border rounded-3 overflow-hidden bg-white">
        <Card.Body className="p-3 p-md-4 case-details-tabs-wrapper">
          <Tabs
            id="case-details-tabs"
            activeKey={tab}
            onSelect={(k: string | null) => setTab(Number(k))}
            className="mb-4"
          >
            <Tab
              eventKey={CASE_DETAILS_TABS.OVERVIEW}
              title={
                <span className="d-inline-flex align-items-center gap-2">
                  <FaInfoCircle size={13} />
                  <span>{t('caseDetails.overviewTab')}</span>
                </span>
              }
            >
              <CaseOverviewTab caseData={fc} />
            </Tab>

            <Tab
              eventKey={CASE_DETAILS_TABS.PARTIES}
              title={
                <span className="d-inline-flex align-items-center gap-2">
                  <FaUsers size={13} />
                  <span>{t('caseDetails.partiesTab')}</span>
                  {partiesCount > 0 && (
                    <Badge bg="light" text="dark" pill className="border font-monospace" style={{ fontSize: '0.68rem' }}>
                      {partiesCount}
                    </Badge>
                  )}
                </span>
              }
            >
              <PartiesTab caseId={fc.id} />
            </Tab>

            <Tab
              eventKey={CASE_DETAILS_TABS.HEARINGS}
              title={
                <span className="d-inline-flex align-items-center gap-2">
                  <FaCalendarAlt size={13} />
                  <span>{t('caseDetails.hearingsTab')}</span>
                  {hearingsCount > 0 && (
                    <Badge bg="light" text="dark" pill className="border font-monospace" style={{ fontSize: '0.68rem' }}>
                      {hearingsCount}
                    </Badge>
                  )}
                </span>
              }
            >
              <HearingsTab caseId={fc.id} />
            </Tab>

            <Tab
              eventKey={CASE_DETAILS_TABS.DOCUMENTS}
              title={
                <span className="d-inline-flex align-items-center gap-2">
                  <FaFileAlt size={13} />
                  <span>{t('caseDetails.documentsTab')}</span>
                  {documentsCount > 0 && (
                    <Badge bg="light" text="dark" pill className="border font-monospace" style={{ fontSize: '0.68rem' }}>
                      {documentsCount}
                    </Badge>
                  )}
                </span>
              }
            >
              <DocumentsTab caseId={fc.id} />
            </Tab>

            <Tab
              eventKey={CASE_DETAILS_TABS.ORDERS}
              title={
                <span className="d-inline-flex align-items-center gap-2">
                  <FaBalanceScale size={13} />
                  <span>{t('caseDetails.ordersTab')}</span>
                  {ordersCount > 0 && (
                    <Badge bg="light" text="dark" pill className="border font-monospace" style={{ fontSize: '0.68rem' }}>
                      {ordersCount}
                    </Badge>
                  )}
                </span>
              }
            >
              <OrdersTab caseId={fc.id} />
            </Tab>

            <Tab
              eventKey={CASE_DETAILS_TABS.NOTES}
              title={
                <span className="d-inline-flex align-items-center gap-2">
                  <FaStickyNote size={13} />
                  <span>{t('caseDetails.notesTab')}</span>
                  {notesCount > 0 && (
                    <Badge bg="light" text="dark" pill className="border font-monospace" style={{ fontSize: '0.68rem' }}>
                      {notesCount}
                    </Badge>
                  )}
                </span>
              }
            >
              <NotesTab caseId={fc.id} />
            </Tab>

            <Tab
              eventKey={CASE_DETAILS_TABS.TEAM}
              title={
                <span className="d-inline-flex align-items-center gap-2">
                  <FaUserFriends size={13} />
                  <span>{t('caseDetails.teamTab')}</span>
                </span>
              }
            >
              <TeamInvitesTab caseId={fc.id} />
            </Tab>

            <Tab
              eventKey={CASE_DETAILS_TABS.LEGAL_HUB}
              title={
                <span className="d-inline-flex align-items-center gap-2">
                  <FaGavel size={13} />
                  <span>{t('caseDetails.legalHubTab')}</span>
                </span>
              }
            >
              <LegalHubTab caseData={fc} />
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>
    </div>
  )
}
