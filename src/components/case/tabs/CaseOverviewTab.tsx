import { useMemo, useState, useEffect } from 'react'
import { displayDate } from '../../../utils/displayDate'
import { Accordion, Badge, Button } from 'react-bootstrap'
import type { FamilyCase, DocumentDeadline } from '../../../types/domain'
import { useCasesStore } from '../../../store/casesStore'
import { useTranslation } from '../../../hooks/useTranslation'
import { getDeadlinesForCase } from '../../../services/storage'
import { fetchStrapiDeadlines, updateStrapiDeadlineStatus } from '../../../services/strapi'
import CaseTimeline from '../CaseTimeline'
import PartyCard from '../PartyCard'
import HearingCard from '../HearingCard'
import OrderCard from '../OrderCard'
import DocumentCard from '../DocumentCard'
import CaseNoteCard from '../CaseNoteCard'
import CaseMetadataOverview from '../CaseMetadataOverview'
import AddDeadlineModal from '../AddDeadlineModal'
import { getStagesForCase, getCurrentStageIndex } from '../../../utils/caseStages'
import { partitionParties } from '../../../utils/partyUtils'
import { FaClock, FaPlus, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa'

export interface CaseOverviewTabProps {
  caseData?: FamilyCase
  caseId?: string
}

/**
 * Procedural Overview Tab for CaseDetails.
 * Encapsulates the procedural timeline, case metadata grid, filing deadlines, and collapsible item summaries.
 */
export default function CaseOverviewTab({ caseData, caseId }: CaseOverviewTabProps) {
  const { getById, isStrapiMode } = useCasesStore()
  const { t } = useTranslation()
  const [showAddDeadlineModal, setShowAddDeadlineModal] = useState(false)
  const [caseDeadlines, setCaseDeadlines] = useState<DocumentDeadline[]>([])

  const resolvedCase = useMemo(() => {
    if (caseData) return caseData
    if (caseId) return getById(caseId)
    return undefined
  }, [caseData, caseId, getById])

  useEffect(() => {
    if (!resolvedCase) return
    const local = getDeadlinesForCase(resolvedCase.id)
    setCaseDeadlines(local)

    if (isStrapiMode) {
      fetchStrapiDeadlines({ caseId: resolvedCase.id })
        .then((strapiDl) => {
          if (strapiDl && strapiDl.length > 0) {
            setCaseDeadlines(strapiDl)
          }
        })
        .catch(() => {})
    }
  }, [resolvedCase, isStrapiMode])

  if (!resolvedCase) {
    return <div className="text-muted p-3">{t('caseDetails.noOverviewData')}</div>
  }

  const stages = getStagesForCase(resolvedCase)
  const currentStageIndex = getCurrentStageIndex(resolvedCase)
  const { adultsAndRepresented, children } = partitionParties(resolvedCase.parties)

  const handleDeadlineToggle = async (dl: DocumentDeadline) => {
    const nextStatus = dl.status === 'submitted' ? 'pending' : 'submitted'
    setCaseDeadlines((prev) =>
      prev.map((d) => (d.id === dl.id ? { ...d, status: nextStatus } : d))
    )

    if (isStrapiMode) {
      try {
        await updateStrapiDeadlineStatus(dl.id, nextStatus)
      } catch {
        // Fallback
      }
    }
  }

  return (
    <div>
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
      <Accordion activeKey={['0', '1', '1a', '2', '3', '4', '5', '6']} alwaysOpen>
        <Accordion.Item eventKey="0">
          <Accordion.Header>{t('caseDetails.metadataTitle')}</Accordion.Header>
          <Accordion.Body>
            <CaseMetadataOverview caseData={resolvedCase} />
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="1">
          <Accordion.Header>
            {t('caseDetails.adultsCount', { count: adultsAndRepresented.length })}
          </Accordion.Header>
          <Accordion.Body>
            {adultsAndRepresented.length === 0 ? (
              <div className="text-muted">{t('caseDetails.noParties')}</div>
            ) : (
              adultsAndRepresented.map((p) => <PartyCard key={p.id} party={p} readOnly={true} />)
            )}
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="1a">
          <Accordion.Header>
            {t('caseDetails.childrenCount', { count: children.length })}
          </Accordion.Header>
          <Accordion.Body>
            {children.length === 0 ? (
              <div className="text-muted">{t('caseDetails.noChildren')}</div>
            ) : (
              children.map((p) => <PartyCard key={p.id} party={p} readOnly={true} />)
            )}
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="2">
          <Accordion.Header>
            {t('caseDetails.hearingsCount', { count: resolvedCase.hearings.length })}
          </Accordion.Header>
          <Accordion.Body>
            {resolvedCase.hearings.length === 0 ? (
              <div className="text-muted">{t('caseDetails.noHearings')}</div>
            ) : (
              resolvedCase.hearings.map((h) => <HearingCard key={h.id} hearing={h} readOnly={true} />)
            )}
          </Accordion.Body>
        </Accordion.Item>

        {/* 6. Document Filing Deadlines Section */}
        <Accordion.Item eventKey="6">
          <Accordion.Header>
            <div className="d-flex align-items-center justify-content-between w-100 pe-3">
              <span className="d-flex align-items-center gap-2">
                <FaClock className="text-primary" />
                <span>Filing Deadlines ({caseDeadlines.length})</span>
              </span>
            </div>
          </Accordion.Header>
          <Accordion.Body>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="small text-muted">
                Track court directions, witness statement filings, and evidence deadlines.
              </span>
              <Button
                variant="outline-primary"
                size="sm"
                className="d-flex align-items-center gap-1.5 rounded-pill px-3 shadow-xs"
                onClick={() => setShowAddDeadlineModal(true)}
              >
                <FaPlus size={10} />
                <span>Add Deadline</span>
              </Button>
            </div>

            {caseDeadlines.length === 0 ? (
              <div className="text-muted small">No filing deadlines set for this case.</div>
            ) : (
              <div className="d-flex flex-column gap-2">
                {caseDeadlines.map((dl) => (
                  <div
                    key={dl.id}
                    className={`p-2.5 rounded border d-flex align-items-center justify-content-between ${
                      dl.status === 'submitted'
                        ? 'bg-light text-muted'
                        : new Date(dl.deadlineDate) < new Date()
                        ? 'bg-danger-subtle border-danger-subtle'
                        : 'bg-white'
                    }`}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <input
                        type="checkbox"
                        checked={dl.status === 'submitted'}
                        onChange={() => void handleDeadlineToggle(dl)}
                        className="form-check-input mt-0"
                        style={{ cursor: 'pointer' }}
                        title="Mark deadline submitted"
                      />
                      <div>
                        <div className={`fw-semibold ${dl.status === 'submitted' ? 'text-decoration-line-through text-muted' : 'text-dark'}`}>
                          {dl.title}
                        </div>
                        {dl.description && <div className="small text-secondary">{dl.description}</div>}
                      </div>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      {dl.documentType && (
                        <Badge bg="secondary" className="small">
                          {dl.documentType}
                        </Badge>
                      )}
                      <Badge
                        bg={
                          dl.status === 'submitted'
                            ? 'success'
                            : new Date(dl.deadlineDate) < new Date()
                            ? 'danger'
                            : 'warning'
                        }
                        className={dl.status === 'pending' && new Date(dl.deadlineDate) >= new Date() ? 'text-dark' : ''}
                      >
                        {dl.status === 'submitted' ? (
                          <span className="d-inline-flex align-items-center gap-1">
                            <FaCheckCircle size={10} /> Submitted
                          </span>
                        ) : new Date(dl.deadlineDate) < new Date() ? (
                          <span className="d-inline-flex align-items-center gap-1">
                            <FaExclamationTriangle size={10} /> Overdue: {displayDate(dl.deadlineDate)}
                          </span>
                        ) : (
                          <span>Due: {displayDate(dl.deadlineDate)}</span>
                        )}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="3">
          <Accordion.Header>
            {t('caseDetails.ordersCount', { count: resolvedCase.orders.length })}
          </Accordion.Header>
          <Accordion.Body>
            {resolvedCase.orders.length === 0 ? (
              <div className="text-muted">{t('caseDetails.noOrders')}</div>
            ) : (
              resolvedCase.orders.map((o) => <OrderCard key={o.id} order={o} readOnly={true} />)
            )}
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="4">
          <Accordion.Header>
            {t('caseDetails.documentsCount', { count: resolvedCase.documents.length })}
          </Accordion.Header>
          <Accordion.Body>
            {resolvedCase.documents.length === 0 ? (
              <div className="text-muted">{t('caseDetails.noDocuments')}</div>
            ) : (
              resolvedCase.documents.map((d) => <DocumentCard key={d.id} document={d} readOnly={true} />)
            )}
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="5">
          <Accordion.Header>
            {t('caseDetails.notesCount', { count: resolvedCase.notes.length })}
          </Accordion.Header>
          <Accordion.Body>
            {resolvedCase.notes.length === 0 ? (
              <div className="text-muted">{t('caseDetails.noNotes')}</div>
            ) : (
              resolvedCase.notes.map((n) => <CaseNoteCard key={n.id} note={n} />)
            )}
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      {/* Add Deadline Modal Dialog */}
      <AddDeadlineModal
        show={showAddDeadlineModal}
        caseId={resolvedCase.id}
        onHide={() => setShowAddDeadlineModal(false)}
        onDeadlineAdded={(newDl) => setCaseDeadlines((prev) => [...prev, newDl])}
      />
    </div>
  )
}
