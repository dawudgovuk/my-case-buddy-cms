import { useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCasesStore } from '../store/casesStore'
import { Card, Tabs, Tab } from 'react-bootstrap'
import CaseSummaryCard from '../components/case/CaseSummaryCard'
import CaseOverviewTab from '../components/case/tabs/CaseOverviewTab'
import PartiesTab from '../components/case/tabs/PartiesTab'
import HearingsTab from '../components/case/tabs/HearingsTab'
import DocumentsTab from '../components/case/tabs/DocumentsTab'
import OrdersTab from '../components/case/tabs/OrdersTab'
import NotesTab from '../components/case/tabs/NotesTab'
import TeamInvitesTab from '../components/case/tabs/TeamInvitesTab'
import { CASE_DETAILS_TABS } from '../utils/caseConstants'

export default function CaseDetails() {
  const { caseId } = useParams()
  const navigate = useNavigate()
  const { getById } = useCasesStore()
  const fc = useMemo(() => (caseId ? getById(caseId) : undefined), [caseId, getById])
  const [tab, setTab] = useState<number>(CASE_DETAILS_TABS.OVERVIEW)

  if (!caseId || !fc) return <div className="text-danger p-4">Case not found.</div>

  return (
    <div className="container-fluid p-0">
      {/* Reusable Case Header Summary */}
      <CaseSummaryCard
        caseData={fc}
        onEdit={() => navigate(`/cases/${fc.id}/edit`)}
        onBack={() => navigate('/')}
      />

      <Card className="shadow-sm border-0">
        <Card.Body>
          <Tabs
            id="case-details-tabs"
            activeKey={tab}
            onSelect={(k: string | null) => setTab(Number(k))}
            className="mb-4"
          >
            <Tab eventKey={CASE_DETAILS_TABS.OVERVIEW} title="Case Overview">
              <CaseOverviewTab caseData={fc} />
            </Tab>

            <Tab eventKey={CASE_DETAILS_TABS.PARTIES} title="Parties">
              <PartiesTab caseId={fc.id} />
            </Tab>

            <Tab eventKey={CASE_DETAILS_TABS.HEARINGS} title="Hearings">
              <HearingsTab caseId={fc.id} />
            </Tab>

            <Tab eventKey={CASE_DETAILS_TABS.DOCUMENTS} title="Documents">
              <DocumentsTab caseId={fc.id} />
            </Tab>

            <Tab eventKey={CASE_DETAILS_TABS.ORDERS} title="Orders">
              <OrdersTab caseId={fc.id} />
            </Tab>

            <Tab eventKey={CASE_DETAILS_TABS.NOTES} title="Notes">
              <NotesTab caseId={fc.id} />
            </Tab>

            <Tab eventKey={CASE_DETAILS_TABS.TEAM} title="Team & Invites">
              <TeamInvitesTab caseId={fc.id} />
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>
    </div>
  )
}
