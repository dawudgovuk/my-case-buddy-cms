import { useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCasesStore } from '../store/casesStore'
import { Card, Tabs, Tab, Accordion } from 'react-bootstrap'
import CaseSummaryCard from '../components/case/CaseSummaryCard'
import CaseTimeline from '../components/case/CaseTimeline'
import PartyCard from '../components/case/PartyCard'
import HearingCard from '../components/case/HearingCard'
import OrderCard from '../components/case/OrderCard'
import DocumentCard from '../components/case/DocumentCard'
import CaseNoteCard from '../components/case/CaseNoteCard'
import PartiesTab from '../components/case/tabs/PartiesTab'
import HearingsTab from '../components/case/tabs/HearingsTab'
import DocumentsTab from '../components/case/tabs/DocumentsTab'
import OrdersTab from '../components/case/tabs/OrdersTab'
import NotesTab from '../components/case/tabs/NotesTab'
import TeamInvitesTab from '../components/case/tabs/TeamInvitesTab'
import { getStagesForCase, getCurrentStageIndex } from '../utils/caseStages'

export default function CaseDetails() {
  const { caseId } = useParams()
  const navigate = useNavigate()
  const { getById } = useCasesStore()
  const fc = useMemo(() => (caseId ? getById(caseId) : undefined), [caseId, getById])
  const [tab, setTab] = useState(0)

  if (!caseId || !fc) return <div className="text-danger p-4">Case not found.</div>

  const stages = getStagesForCase(fc)
  const currentStageIndex = getCurrentStageIndex(fc)

  const nonChildren = fc.parties.filter((p) => p.role !== 'Child' || (p.role === 'Child' && p.solicitorFirm))
  const children = fc.parties.filter((p) => p.role === 'Child' && !p.solicitorFirm)

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
            <Tab eventKey={0} title="Case Overview">
              {/* Procedural Case Timeline */}
              <div className="mb-4">
                <CaseTimeline
                  stages={stages}
                  currentStageIndex={currentStageIndex}
                  showProgressBar={true}
                  collapsible={true}
                  defaultExpanded={true}
                />
              </div>

              {/* Collapsible Detail Sections */}
              <Accordion activeKey={['0', '1', '1a', '2', '3', '4', '5']} alwaysOpen>
                <Accordion.Item eventKey="0">
                  <Accordion.Header>Case Metadata</Accordion.Header>
                  <Accordion.Body>
                    <div className="row g-2">
                      <div className="col-md-6">
                        <strong>Case Number:</strong> {fc.id}
                      </div>
                      <div className="col-md-6">
                        <strong>Court:</strong> {fc.court}
                      </div>
                      <div className="col-md-6">
                        <strong>Type:</strong> {fc.caseType}
                      </div>
                      <div className="col-md-6">
                        <strong>Status:</strong> {fc.status}
                      </div>
                      <div className="col-md-6">
                        <strong>Started:</strong> {fc.startedAt}
                      </div>
                      {fc.allocatedJudge && (
                        <div className="col-md-6">
                          <strong>Allocated Judge:</strong> {fc.allocatedJudge}
                        </div>
                      )}
                    </div>
                  </Accordion.Body>
                </Accordion.Item>

                <Accordion.Item eventKey="1">
                  <Accordion.Header>Parties ({nonChildren.length})</Accordion.Header>
                  <Accordion.Body>
                    {nonChildren.length === 0 && <div className="text-muted">No adult parties recorded.</div>}
                    {nonChildren.map((p) => (
                      <PartyCard key={p.id} party={p} readOnly={true} />
                    ))}
                  </Accordion.Body>
                </Accordion.Item>

                <Accordion.Item eventKey="1a">
                  <Accordion.Header>Children ({children.length})</Accordion.Header>
                  <Accordion.Body>
                    {children.length === 0 && <div className="text-muted">No children recorded.</div>}
                    {children.map((p) => (
                      <PartyCard key={p.id} party={p} readOnly={true} />
                    ))}
                  </Accordion.Body>
                </Accordion.Item>

                <Accordion.Item eventKey="2">
                  <Accordion.Header>Scheduled Hearings ({fc.hearings.length})</Accordion.Header>
                  <Accordion.Body>
                    {fc.hearings.length === 0 && <div className="text-muted">No hearings scheduled.</div>}
                    {fc.hearings.map((h) => (
                      <HearingCard key={h.id} hearing={h} readOnly={true} />
                    ))}
                  </Accordion.Body>
                </Accordion.Item>

                <Accordion.Item eventKey="3">
                  <Accordion.Header>Court Orders ({fc.orders.length})</Accordion.Header>
                  <Accordion.Body>
                    {fc.orders.length === 0 && <div className="text-muted">No court orders recorded.</div>}
                    {fc.orders.map((o) => (
                      <OrderCard key={o.id} order={o} readOnly={true} />
                    ))}
                  </Accordion.Body>
                </Accordion.Item>

                <Accordion.Item eventKey="4">
                  <Accordion.Header>Documents & Evidence ({fc.documents.length})</Accordion.Header>
                  <Accordion.Body>
                    {fc.documents.length === 0 && <div className="text-muted">No documents uploaded.</div>}
                    {fc.documents.map((d) => (
                      <DocumentCard key={d.id} document={d} readOnly={true} />
                    ))}
                  </Accordion.Body>
                </Accordion.Item>

                <Accordion.Item eventKey="5">
                  <Accordion.Header>Notes & Updates ({fc.notes.length})</Accordion.Header>
                  <Accordion.Body>
                    {fc.notes.length === 0 && <div className="text-muted">No notes recorded.</div>}
                    {fc.notes.map((n) => (
                      <CaseNoteCard key={n.id} note={n} />
                    ))}
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            </Tab>

            <Tab eventKey={1} title="Parties">
              <PartiesTab caseId={fc.id} />
            </Tab>

            <Tab eventKey={2} title="Hearings">
              <HearingsTab caseId={fc.id} />
            </Tab>

            <Tab eventKey={3} title="Documents">
              <DocumentsTab caseId={fc.id} />
            </Tab>

            <Tab eventKey={4} title="Orders">
              <OrdersTab caseId={fc.id} />
            </Tab>

            <Tab eventKey={5} title="Notes">
              <NotesTab caseId={fc.id} />
            </Tab>

            <Tab eventKey={6} title="Team & Invites">
              <TeamInvitesTab caseId={fc.id} />
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>
    </div>
  )
}
