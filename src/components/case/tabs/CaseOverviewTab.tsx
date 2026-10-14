import { useMemo } from 'react'
import { Accordion } from 'react-bootstrap'
import type { FamilyCase } from '../../../types/domain'
import { useCasesStore } from '../../../store/casesStore'
import { useTranslation } from '../../../hooks/useTranslation'
import CaseTimeline from '../CaseTimeline'
import PartyCard from '../PartyCard'
import HearingCard from '../HearingCard'
import OrderCard from '../OrderCard'
import DocumentCard from '../DocumentCard'
import CaseNoteCard from '../CaseNoteCard'
import CaseMetadataOverview from '../CaseMetadataOverview'
import { getStagesForCase, getCurrentStageIndex } from '../../../utils/caseStages'
import { partitionParties } from '../../../utils/partyUtils'

export interface CaseOverviewTabProps {
  caseData?: FamilyCase
  caseId?: string
}

/**
 * Procedural Overview Tab for CaseDetails.
 * Encapsulates the procedural timeline, case metadata grid, and collapsible item summaries.
 */
export default function CaseOverviewTab({ caseData, caseId }: CaseOverviewTabProps) {
  const { getById } = useCasesStore()
  const { t } = useTranslation()

  const resolvedCase = useMemo(() => {
    if (caseData) return caseData
    if (caseId) return getById(caseId)
    return undefined
  }, [caseData, caseId, getById])

  if (!resolvedCase) {
    return <div className="text-muted p-3">{t('caseDetails.noOverviewData')}</div>
  }

  const stages = getStagesForCase(resolvedCase)
  const currentStageIndex = getCurrentStageIndex(resolvedCase)
  const { adultsAndRepresented, children } = partitionParties(resolvedCase.parties)

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
      <Accordion activeKey={['0', '1', '1a', '2', '3', '4', '5']} alwaysOpen>
        <Accordion.Item eventKey="0">
          <Accordion.Header>{t('caseDetails.metadataTitle')}</Accordion.Header>
          <Accordion.Body>
            <CaseMetadataOverview caseData={resolvedCase} />
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="1">
          <Accordion.Header>
            {t('caseDetails.partiesCount', { count: adultsAndRepresented.length })}
          </Accordion.Header>
          <Accordion.Body>
            {adultsAndRepresented.length === 0 ? (
              <div className="text-muted">{t('caseDetails.noAdultParties')}</div>
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
    </div>
  )
}
