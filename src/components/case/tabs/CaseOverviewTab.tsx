import { useMemo, useState, useEffect } from 'react'
import { Card, Row, Col, Badge, Button, ProgressBar, Form } from 'react-bootstrap'
import { differenceInDays, parseISO } from 'date-fns'
import type { FamilyCase, DocumentDeadline, Hearing } from '../../../types/domain'
import { useCasesStore } from '../../../store/casesStore'
import { useTranslation } from '../../../hooks/useTranslation'
import { getDeadlinesForCase } from '../../../services/storage'
import { fetchStrapiDeadlines, updateStrapiDeadlineStatus } from '../../../services/strapi'
import CaseTimeline from '../CaseTimeline'
import CaseMetadataOverview from '../CaseMetadataOverview'
import AddDeadlineModal from '../AddDeadlineModal'
import BundleComplianceModal from './BundleComplianceModal'
import { getStagesForCase, getCurrentStageIndex } from '../../../utils/caseStages'
import { partitionParties } from '../../../utils/partyUtils'
import { evaluateBundleCompliance, PD27A_MAX_PAGES } from '../../../utils/bundleCompliance'
import { displayDate } from '../../../utils/displayDate'
import { CASE_DETAILS_TABS } from '../../../utils/caseConstants'
import {
  FaClock,
  FaPlus,
  FaCalendarAlt,
  FaBalanceScale,
  FaVideo,
  FaExclamationTriangle,
  FaFileAlt,
  FaGavel,
  FaUsers,
  FaExternalLinkAlt,
  FaTasks,
  FaArrowRight,
  FaFolderOpen,
} from 'react-icons/fa'
import { toast } from '../../../store/toastStore'

export interface CaseOverviewTabProps {
  caseData?: FamilyCase
  caseId?: string
  onSelectTab?: (tabKey: number) => void
}

export default function CaseOverviewTab({ caseData, caseId, onSelectTab }: CaseOverviewTabProps) {
  const store = useCasesStore()
  const { t } = useTranslation()
  const [showAddDeadlineModal, setShowAddDeadlineModal] = useState(false)
  const [showBundleModal, setShowBundleModal] = useState(false)
  const [caseDeadlines, setCaseDeadlines] = useState<DocumentDeadline[]>([])

  const resolvedCase = useMemo(() => {
    if (caseData) return caseData
    if (caseId) return store.getById(caseId)
    return undefined
  }, [caseData, caseId, store])

  useEffect(() => {
    if (!resolvedCase) return
    const local = getDeadlinesForCase(resolvedCase.id)
    setCaseDeadlines(local)

    if (store.isStrapiMode) {
      fetchStrapiDeadlines({ caseId: resolvedCase.id })
        .then((strapiDl) => {
          if (strapiDl && strapiDl.length > 0) {
            setCaseDeadlines(strapiDl)
          }
        })
        .catch(() => {})
    }
  }, [resolvedCase, store.isStrapiMode])

  if (!resolvedCase) {
    return <div className="text-muted p-3">{t('caseDetails.noOverviewData')}</div>
  }

  const stages = getStagesForCase(resolvedCase)
  const currentStageIndex = getCurrentStageIndex(resolvedCase)
  const { adultsAndRepresented, children } = partitionParties(resolvedCase.parties || [])

  // Bundle metrics
  const bundleSummary = evaluateBundleCompliance(resolvedCase.documents || [])
  const bundlePercent = Math.min(100, Math.round((bundleSummary.totalPages / PD27A_MAX_PAGES) * 100))

  // Find next hearing
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const futureHearings = (resolvedCase.hearings || [])
    .filter((h) => {
      if (!h.date) return false
      try {
        return differenceInDays(parseISO(h.date), today) >= 0
      } catch {
        return false
      }
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const nextHearing: Hearing | undefined = futureHearings[0]
  const nextHearingDays = nextHearing ? differenceInDays(parseISO(nextHearing.date), today) : null

  // Count active compliance directions across court orders
  const activeOrderDirections = (resolvedCase.orders || []).reduce(
    (acc, o) => acc + (o.complianceDeadlines?.filter((d) => !d.isCompleted).length || 0),
    0
  )
  const penalNoticesCount = (resolvedCase.orders || []).filter((o) => o.hasPenalNotice).length

  // Handle stage change
  const handleStageChange = (newStageName: string) => {
    const updated: FamilyCase = {
      ...resolvedCase,
      currentStage: newStageName,
    }
    store.addOrUpdate(updated)
    toast.success(`Case milestone updated to "${newStageName}".`, 'Stage Updated')
  }

  const handleDeadlineToggle = async (dl: DocumentDeadline) => {
    const nextStatus = dl.status === 'submitted' ? 'pending' : 'submitted'
    setCaseDeadlines((prev) =>
      prev.map((d) => (d.id === dl.id ? { ...d, status: nextStatus } : d))
    )

    if (nextStatus === 'submitted') {
      toast.success(`Marked "${dl.title}" as submitted.`, 'Deadline Completed')
    } else {
      toast.info(`Reopened deadline "${dl.title}".`, 'Deadline Pending')
    }

    if (store.isStrapiMode) {
      try {
        await updateStrapiDeadlineStatus(dl.id, nextStatus)
      } catch {
        // Fallback
      }
    }
  }

  return (
    <div className="d-flex flex-column gap-3">
      {/* 1. Procedural Timeline & Milestone Stage Selector */}
      <Card className="border shadow-sm bg-white p-3 rounded-3">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2 mb-3">
          <div className="d-flex align-items-center gap-2">
            <span className="p-2 rounded-circle bg-primary-subtle text-primary">
              <FaTasks size={14} />
            </span>
            <div>
              <h6 className="fw-bold mb-0 text-dark">Procedural Timeline & Court Milestones</h6>
              <div className="small text-muted">
                Track formal proceedings stages through the Family Court case lifecycle.
              </div>
            </div>
          </div>

          {/* Quick Stage Progression Dropdown */}
          <div className="d-flex align-items-center gap-2 w-100 w-md-auto">
            <span className="small text-secondary fw-semibold flex-shrink-0">Current Milestone:</span>
            <Form.Select
              size="sm"
              value={resolvedCase.currentStage || stages[0]?.name || ''}
              onChange={(e) => handleStageChange(e.target.value)}
              className="fw-medium"
              style={{ minWidth: '220px' }}
            >
              {stages.map((st, idx) => (
                <option key={st.id} value={st.name}>
                  Stage {idx + 1}: {st.name}
                </option>
              ))}
            </Form.Select>
          </div>
        </div>

        <CaseTimeline
          caseData={resolvedCase}
          stages={stages}
          currentStageIndex={currentStageIndex}
          showProgressBar={true}
          collapsible={false}
          defaultExpanded={true}
        />
      </Card>

      {/* 2. Key Case Pulse Command Cards */}
      <Row className="g-3">
        {/* Pulse Card 1: Next Listed Hearing */}
        <Col md={6} lg={3}>
          <Card className="h-100 border shadow-sm p-3 bg-white rounded-3">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span className="small fw-semibold text-secondary text-uppercase" style={{ fontSize: '0.72rem' }}>
                Next Court Listing
              </span>
              <span className="p-1.5 rounded bg-primary-subtle text-primary">
                <FaCalendarAlt size={12} />
              </span>
            </div>

            {nextHearing ? (
              <div className="d-flex flex-column flex-grow-1">
                <div className="d-flex align-items-center gap-1.5 mb-1">
                  <Badge
                    bg={nextHearingDays !== null && nextHearingDays <= 2 ? 'danger' : 'primary'}
                    className="font-monospace"
                  >
                    {nextHearingDays === 0
                      ? 'Today!'
                      : nextHearingDays === 1
                      ? 'Tomorrow!'
                      : `In ${nextHearingDays} days`}
                  </Badge>
                  <span className="fw-bold text-dark small">{nextHearing.type}</span>
                </div>

                <div className="small text-dark fw-medium mb-1">
                  {displayDate(nextHearing.date)} {nextHearing.time ? `at ${nextHearing.time}` : ''}
                </div>

                <div className="small text-muted text-truncate mb-2" title={nextHearing.location || 'Location TBC'}>
                  {nextHearing.location || 'Location TBC'}
                </div>

                {nextHearing.remoteLink ? (
                  <a
                    href={nextHearing.remoteLink}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-sm btn-outline-primary d-inline-flex align-items-center justify-content-center gap-1 py-1 px-2 mt-auto"
                    style={{ fontSize: '0.75rem' }}
                  >
                    <FaVideo size={10} />
                    <span>Join Video Room</span>
                    <FaExternalLinkAlt size={8} />
                  </a>
                ) : (
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 text-start small text-primary text-decoration-none mt-auto"
                    onClick={() => onSelectTab?.(CASE_DETAILS_TABS.HEARINGS)}
                  >
                    View Hearing Details →
                  </Button>
                )}
              </div>
            ) : (
              <div className="d-flex flex-column justify-content-between flex-grow-1">
                <div className="text-muted small my-2">No upcoming court hearings currently scheduled.</div>
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="py-1 px-2 mt-auto"
                  style={{ fontSize: '0.75rem' }}
                  onClick={() => onSelectTab?.(CASE_DETAILS_TABS.HEARINGS)}
                >
                  + Schedule Listing
                </Button>
              </div>
            )}
          </Card>
        </Col>

        {/* Pulse Card 2: FPR PD 27A Court Bundle Compliance */}
        <Col md={6} lg={3}>
          <Card className="h-100 border shadow-sm p-3 bg-white rounded-3">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span className="small fw-semibold text-secondary text-uppercase" style={{ fontSize: '0.72rem' }}>
                PD 27A Bundle Status
              </span>
              <span className="p-1.5 rounded bg-success-subtle text-success">
                <FaFileAlt size={12} />
              </span>
            </div>

            <div className="d-flex flex-column flex-grow-1">
              <div className="d-flex align-items-center justify-content-between mb-1">
                <span className="fw-bold font-monospace text-dark">
                  {bundleSummary.totalPages} / {PD27A_MAX_PAGES} pp
                </span>
                <Badge
                  bg={bundleSummary.isCompliant ? 'success' : 'danger'}
                  className="font-monospace"
                  style={{ fontSize: '0.68rem' }}
                >
                  {bundleSummary.isCompliant ? 'Compliant' : 'Over Limit'}
                </Badge>
              </div>

              <ProgressBar
                now={bundlePercent}
                variant={bundleSummary.isCompliant ? (bundlePercent > 85 ? 'warning' : 'success') : 'danger'}
                style={{ height: '6px' }}
                className="mb-2"
              />

              <div className="small text-muted mb-2">
                {bundleSummary.documentCount} {bundleSummary.documentCount === 1 ? 'document' : 'documents'} indexed in 5 statutory sections.
              </div>

              <Button
                variant="outline-secondary"
                size="sm"
                className="py-1 px-2 mt-auto d-flex align-items-center justify-content-center gap-1"
                style={{ fontSize: '0.75rem' }}
                onClick={() => setShowBundleModal(true)}
              >
                <FaBalanceScale size={10} />
                <span>Audit & Export Index</span>
              </Button>
            </div>
          </Card>
        </Col>

        {/* Pulse Card 3: Compliance Directions & Orders */}
        <Col md={6} lg={3}>
          <Card className="h-100 border shadow-sm p-3 bg-white rounded-3">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span className="small fw-semibold text-secondary text-uppercase" style={{ fontSize: '0.72rem' }}>
                Court Orders & Directions
              </span>
              <span className="p-1.5 rounded bg-warning-subtle text-warning">
                <FaGavel size={12} />
              </span>
            </div>

            <div className="d-flex flex-column flex-grow-1">
              <div className="d-flex align-items-center gap-2 mb-1">
                <span className="h5 fw-bold text-dark mb-0 font-monospace">
                  {resolvedCase.orders?.length || 0}
                </span>
                <span className="small text-muted">Court Orders</span>
              </div>

              <div className="d-flex flex-column gap-1 mb-2 small text-secondary">
                {penalNoticesCount > 0 ? (
                  <span className="text-danger fw-semibold d-inline-flex align-items-center gap-1">
                    <FaExclamationTriangle size={10} />
                    <span>{penalNoticesCount} Penal Notice Warning</span>
                  </span>
                ) : (
                  <span>No penal warnings active</span>
                )}
                <span>
                  <strong>{activeOrderDirections}</strong> pending compliance tasks
                </span>
              </div>

              <Button
                variant="outline-primary"
                size="sm"
                className="py-1 px-2 mt-auto"
                style={{ fontSize: '0.75rem' }}
                onClick={() => onSelectTab?.(CASE_DETAILS_TABS.ORDERS)}
              >
                View Directions & Orders →
              </Button>
            </div>
          </Card>
        </Col>

        {/* Pulse Card 4: Parties & Safeguarding */}
        <Col md={6} lg={3}>
          <Card className="h-100 border shadow-sm p-3 bg-white rounded-3">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span className="small fw-semibold text-secondary text-uppercase" style={{ fontSize: '0.72rem' }}>
                Parties & Safeguarding
              </span>
              <span className="p-1.5 rounded bg-info-subtle text-info">
                <FaUsers size={12} />
              </span>
            </div>

            <div className="d-flex flex-column flex-grow-1">
              <div className="d-flex align-items-center gap-2 mb-1">
                <span className="h5 fw-bold text-dark mb-0 font-monospace">
                  {children.length}
                </span>
                <span className="small text-muted">{children.length === 1 ? 'Protected Child' : 'Protected Children'}</span>
              </div>

              <div className="small text-secondary mb-2">
                <span>{adultsAndRepresented.length} adult parties registered.</span>
                <div className="text-muted mt-0.5">
                  CAFCASS safeguarding & Section 7 readiness.
                </div>
              </div>

              <Button
                variant="outline-secondary"
                size="sm"
                className="py-1 px-2 mt-auto"
                style={{ fontSize: '0.75rem' }}
                onClick={() => onSelectTab?.(CASE_DETAILS_TABS.PARTIES)}
              >
                Manage Parties & Children →
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 3. Quick Action Launchpad */}
      <Card className="border shadow-sm bg-light p-3 rounded-3">
        <div className="small fw-bold text-dark mb-2 text-uppercase" style={{ fontSize: '0.74rem', letterSpacing: '0.5px' }}>
          Quick Action Launchpad:
        </div>
        <Row className="g-2">
          <Col xs={6} sm={3}>
            <Button
              variant="white"
              className="w-100 py-2 px-3 border shadow-xs d-flex align-items-center justify-content-between bg-white text-dark text-start"
              onClick={() => onSelectTab?.(CASE_DETAILS_TABS.DOCUMENTS)}
            >
              <div className="d-flex align-items-center gap-2">
                <FaFileAlt className="text-primary" size={13} />
                <span className="small fw-semibold">Upload Evidence</span>
              </div>
              <FaArrowRight size={10} className="text-muted" />
            </Button>
          </Col>

          <Col xs={6} sm={3}>
            <Button
              variant="white"
              className="w-100 py-2 px-3 border shadow-xs d-flex align-items-center justify-content-between bg-white text-dark text-start"
              onClick={() => onSelectTab?.(CASE_DETAILS_TABS.HEARINGS)}
            >
              <div className="d-flex align-items-center gap-2">
                <FaCalendarAlt className="text-primary" size={13} />
                <span className="small fw-semibold">Schedule Listing</span>
              </div>
              <FaArrowRight size={10} className="text-muted" />
            </Button>
          </Col>

          <Col xs={6} sm={3}>
            <Button
              variant="white"
              className="w-100 py-2 px-3 border shadow-xs d-flex align-items-center justify-content-between bg-white text-dark text-start"
              onClick={() => onSelectTab?.(CASE_DETAILS_TABS.ORDERS)}
            >
              <div className="d-flex align-items-center gap-2">
                <FaGavel className="text-primary" size={13} />
                <span className="small fw-semibold">Record Court Order</span>
              </div>
              <FaArrowRight size={10} className="text-muted" />
            </Button>
          </Col>

          <Col xs={6} sm={3}>
            <Button
              variant="white"
              className="w-100 py-2 px-3 border shadow-xs d-flex align-items-center justify-content-between bg-white text-dark text-start"
              onClick={() => onSelectTab?.(CASE_DETAILS_TABS.LEGAL_HUB)}
            >
              <div className="d-flex align-items-center gap-2">
                <FaBalanceScale className="text-success" size={13} />
                <span className="small fw-semibold">Open Legal Hub</span>
              </div>
              <FaArrowRight size={10} className="text-muted" />
            </Button>
          </Col>
        </Row>
      </Card>

      {/* 4. Split Overview: Metadata Grid & Document Filing Deadlines */}
      <Row className="g-3">
        <Col lg={6}>
          <Card className="p-3 shadow-sm border bg-white rounded-3 h-100">
            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2 text-dark">
              <FaFolderOpen className="text-primary" />
              <span>Case Jurisdictional Metadata</span>
            </h6>
            <CaseMetadataOverview caseData={resolvedCase} />
          </Card>
        </Col>

        <Col lg={6}>
          <Card className="p-3 shadow-sm border bg-white rounded-3 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold mb-0 d-flex align-items-center gap-2 text-dark">
                <FaClock className="text-primary" />
                <span>Document Filing Deadlines ({caseDeadlines.length})</span>
              </h6>
              <Button
                variant="outline-primary"
                size="sm"
                className="d-flex align-items-center gap-1 rounded-pill px-2.5 py-0.5"
                style={{ fontSize: '0.75rem' }}
                onClick={() => setShowAddDeadlineModal(true)}
              >
                <FaPlus size={9} />
                <span>Add Deadline</span>
              </Button>
            </div>

            {caseDeadlines.length === 0 ? (
              <div className="text-muted small p-3 bg-light rounded text-center border">
                No active filing deadlines recorded. Click &quot;Add Deadline&quot; to track court directions.
              </div>
            ) : (
              <div className="d-flex flex-column gap-2 overflow-auto" style={{ maxHeight: '280px' }}>
                {caseDeadlines.map((dl) => (
                  <div
                    key={dl.id}
                    className={`p-2 rounded border d-flex align-items-center justify-content-between small ${
                      dl.status === 'submitted'
                        ? 'bg-light text-muted'
                        : new Date(dl.deadlineDate) < new Date()
                        ? 'bg-danger-subtle border-danger-subtle'
                        : 'bg-white'
                    }`}
                  >
                    <div className="d-flex align-items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={dl.status === 'submitted'}
                        onChange={() => void handleDeadlineToggle(dl)}
                        className="form-check-input mt-0"
                        style={{ cursor: 'pointer' }}
                        title="Mark deadline submitted"
                      />
                      <div>
                        <div className={dl.status === 'submitted' ? 'text-decoration-line-through text-muted' : 'fw-semibold text-dark'}>
                          {dl.title}
                        </div>
                        {dl.description && <div className="text-muted" style={{ fontSize: '0.72rem' }}>{dl.description}</div>}
                      </div>
                    </div>

                    <div className="text-end flex-shrink-0 ms-2">
                      <Badge
                        bg={
                          dl.status === 'submitted'
                            ? 'success'
                            : new Date(dl.deadlineDate) < new Date()
                            ? 'danger'
                            : 'warning'
                        }
                        text={dl.status === 'submitted' || new Date(dl.deadlineDate) < new Date() ? 'white' : 'dark'}
                        className="font-monospace"
                        style={{ fontSize: '0.68rem' }}
                      >
                        {dl.status === 'submitted' ? 'Submitted' : `Due: ${dl.deadlineDate}`}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Add Deadline Modal */}
      {showAddDeadlineModal && (
        <AddDeadlineModal
          show={showAddDeadlineModal}
          onHide={() => setShowAddDeadlineModal(false)}
          caseId={resolvedCase.id}
          onDeadlineAdded={(newDl) => {
            setCaseDeadlines((prev) => [...prev, newDl])
            setShowAddDeadlineModal(false)
          }}
        />
      )}

      {/* Bundle Auditor Modal */}
      <BundleComplianceModal
        show={showBundleModal}
        onHide={() => setShowBundleModal(false)}
        caseData={resolvedCase}
      />
    </div>
  )
}
