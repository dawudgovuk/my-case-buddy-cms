import type { ReactNode } from 'react'
import { Card, Button } from 'react-bootstrap'
import type { FamilyCase } from '../../types/domain'
import { getStagesForCase, getCurrentStageIndex } from '../../utils/caseStages'
import CaseSteps from './CaseSteps'
import CaseTimeline from './CaseTimeline'
import NextHearingBanner from './NextHearingBanner'
import {
  PeerSupportButton,
  ViewCaseButton,
  EditCaseButton,
  CaseCardActions,
} from '../common/CaseCardButtons'
import {
  FaUsers,
  FaChild,
  FaGavel,
  FaArrowRight,
  FaFolderOpen,
  FaHandshake,
  FaEdit,
} from 'react-icons/fa'

export interface CaseCardProps {
  caseData: FamilyCase
  onTogglePeerSupport?: (caseId: string, currentStatus: boolean) => void
  onViewDetails?: (caseId: string) => void
  onEdit?: (caseId: string) => void
  actions?: ReactNode
  buttonLayout?: 'vertical' | 'horizontal'
  showProgress?: boolean
  showNextHearing?: boolean
  progressComponent?: 'steps' | 'timeline' | 'compact'
  timelineDefaultExpanded?: boolean
  className?: string
}

export default function CaseCard({
  caseData,
  onTogglePeerSupport,
  onViewDetails,
  onEdit,
  actions,
  buttonLayout = 'horizontal',
  showProgress = true,
  showNextHearing = true,
  progressComponent = 'compact',
  timelineDefaultExpanded = false,
  className = '',
}: CaseCardProps) {
  const stages = getStagesForCase(caseData)
  const currentStageIndex = getCurrentStageIndex(caseData)
  const nextHearing =
    caseData.hearings && caseData.hearings.length > 0 ? caseData.hearings[0] : null
  const isSeekingSupport = Boolean(caseData.seekingPeerSupport)

  const childrenCount = caseData.parties?.filter((p) => p.role === 'Child').length || 0
  const partiesCount =
    caseData.parties?.filter(
      (p) => p.role !== 'Child' || (p.role === 'Child' && p.solicitorFirm)
    ).length || 0

  const isOpen = caseData.status === 'Open'
  const isStayed = caseData.status === 'Stayed'

  const statusBadgeClass = isOpen
    ? 'badge-soft-emerald'
    : isStayed
      ? 'badge-soft-amber'
      : 'badge-soft-slate'

  const progressPercent = Math.min(
    100,
    Math.round(((currentStageIndex + 1) / Math.max(stages.length, 1)) * 100)
  )

  return (
    <Card className={`premium-card h-100 d-flex flex-column border-0 ${className}`}>
      <Card.Body className="d-flex flex-column h-100 p-4">
        {/* Header: ID, Status, and Quiet Counts */}
        <div className="d-flex align-items-center justify-content-between gap-2 mb-3">
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-light text-muted border font-monospace px-2 py-1 small">
              {caseData.id}
            </span>
            <span className={`badge rounded-pill px-2.5 py-1 small fw-semibold ${statusBadgeClass}`}>
              ● {caseData.status}
            </span>
          </div>

          <div className="d-flex align-items-center gap-2 text-muted small">
            <span
              className="d-inline-flex align-items-center gap-1"
              title={`${partiesCount} Parties`}
            >
              <FaUsers size={12} className="text-secondary opacity-75" />
              <span>{partiesCount}</span>
            </span>
            {childrenCount > 0 && (
              <span
                className="d-inline-flex align-items-center gap-1"
                title={`${childrenCount} Children`}
              >
                <FaChild size={11} className="text-secondary opacity-75" />
                <span>{childrenCount}</span>
              </span>
            )}
          </div>
        </div>

        {/* Title & Court Description */}
        <div className="mb-3">
          <h5
            className="fw-bold mb-1 text-dark"
            style={{
              letterSpacing: '-0.3px',
              lineHeight: 1.35,
              cursor: onViewDetails ? 'pointer' : 'default',
            }}
            onClick={() => onViewDetails?.(caseData.id)}
          >
            {caseData.title || '(Untitled Case)'}
          </h5>

          <div className="small text-secondary d-flex align-items-center gap-2 flex-wrap">
            <span className="d-inline-flex align-items-center gap-1">
              <FaGavel size={11} className="text-muted" />
              <span>{caseData.court}</span>
            </span>
            <span className="text-muted">•</span>
            <span className="text-muted">{caseData.caseType}</span>
          </div>
        </div>

        {/* Next Hearing Banner (Warm, Understated) */}
        {showNextHearing && nextHearing && (
          <NextHearingBanner hearing={nextHearing} className="mb-3" />
        )}

        {/* Progression Section */}
        {showProgress && (
          <div className="flex-grow-1 mb-3">
            {progressComponent === 'timeline' ? (
              <CaseTimeline
                stages={stages}
                currentStageIndex={currentStageIndex}
                compact={true}
                collapsible={true}
                defaultExpanded={timelineDefaultExpanded}
              />
            ) : progressComponent === 'steps' ? (
              <CaseSteps stages={stages} currentStageIndex={currentStageIndex} />
            ) : (
              /* Compact Mini Progress Bar */
              <div className="my-1 p-2.5 bg-light rounded-3 border">
                <div className="d-flex justify-content-between align-items-center mb-1.5">
                  <span
                    className="text-muted text-truncate small"
                    style={{ fontSize: '0.75rem' }}
                  >
                    Stage {currentStageIndex + 1}/{stages.length}:{' '}
                    <strong className="text-dark">
                      {stages[currentStageIndex]?.name || 'In Progress'}
                    </strong>
                  </span>
                  <span
                    className="fw-semibold text-secondary"
                    style={{ fontSize: '0.72rem' }}
                  >
                    {progressPercent}%
                  </span>
                </div>
                <div className="case-mini-progress">
                  <div
                    className="case-mini-progress-bar"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons Section */}
        <div className="mt-auto pt-3 border-top">
          {actions ? (
            actions
          ) : buttonLayout === 'vertical' ? (
            <CaseCardActions layout="vertical">
              {onTogglePeerSupport && (
                <PeerSupportButton
                  isSeekingPeerSupport={isSeekingSupport}
                  onToggle={() => onTogglePeerSupport(caseData.id, isSeekingSupport)}
                  fullWidth
                />
              )}
              {onViewDetails && (
                <ViewCaseButton
                  caseId={caseData.id}
                  onView={() => onViewDetails(caseData.id)}
                  fullWidth
                />
              )}
              {onEdit && (
                <EditCaseButton
                  caseId={caseData.id}
                  onEdit={() => onEdit(caseData.id)}
                  fullWidth
                />
              )}
            </CaseCardActions>
          ) : (
            <div className="d-flex align-items-center justify-content-between gap-2">
              {onViewDetails && (
                <Button
                  className="btn-obsidian d-inline-flex align-items-center gap-2 py-2 px-3 shadow-none flex-grow-1 text-truncate"
                  size="sm"
                  onClick={() => onViewDetails(caseData.id)}
                  style={{ fontSize: '0.825rem' }}
                >
                  <FaFolderOpen size={13} className="flex-shrink-0" />
                  <span className="text-truncate">Open Case</span>
                  <FaArrowRight size={10} className="ms-auto flex-shrink-0" />
                </Button>
              )}

              <div className="d-flex align-items-center gap-1 flex-shrink-0">
                {onTogglePeerSupport && (
                  <Button
                    variant={isSeekingSupport ? 'success' : 'light'}
                    className={`d-inline-flex align-items-center gap-1 py-1.5 px-2.5 border ${
                      isSeekingSupport
                        ? 'bg-success text-white border-success'
                        : 'btn-soft text-secondary'
                    }`}
                    size="sm"
                    onClick={() => onTogglePeerSupport(caseData.id, isSeekingSupport)}
                    title={
                      isSeekingSupport
                        ? 'Peer Support is active'
                        : 'Request peer review support'
                    }
                    style={{ fontSize: '0.8rem' }}
                  >
                    <FaHandshake size={12} />
                    <span className="d-none d-sm-inline">
                      {isSeekingSupport ? 'Active' : 'Support'}
                    </span>
                  </Button>
                )}

                {onEdit && (
                  <Button
                    variant="light"
                    className="btn-soft text-secondary py-1.5 px-2 border"
                    size="sm"
                    onClick={() => onEdit(caseData.id)}
                    title="Edit Case"
                    aria-label="Edit Case"
                  >
                    <FaEdit size={12} />
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  )
}

