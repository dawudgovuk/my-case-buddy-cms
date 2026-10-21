import type { ReactNode } from 'react'
import { Card } from 'react-bootstrap'
import type { FamilyCase } from '../../types/domain'
import { getStagesForCase, getCurrentStageIndex } from '../../utils/caseStages'
import { useCaseConfigStore } from '../../store/caseConfigStore'
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
  FaHandshake,
  FaCalendarAlt,
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
  buttonLayout = 'vertical',
  showProgress = true,
  showNextHearing = true,
  progressComponent = 'timeline',
  timelineDefaultExpanded = false,
  className = '',
}: CaseCardProps) {
  const caseStagesMap = useCaseConfigStore((state) => state.caseStagesMap)
  const stages = getStagesForCase(caseData, caseStagesMap)
  const currentStageIndex = getCurrentStageIndex(caseData, stages)
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
      <Card.Body className="d-flex flex-column h-100 p-3.5 p-md-4">
        {/* Title Header with Status & Peer Support Badges on Same Line */}
        <div className="mb-3">
          <div className="d-flex align-items-center justify-content-between gap-2 mb-2 flex-wrap">
            <div className="d-flex align-items-center gap-2 flex-wrap flex-grow-1">
              <h5
                className="fw-bold mb-0 text-dark hover-text-primary"
                style={{
                  letterSpacing: '-0.3px',
                  lineHeight: 1.3,
                  fontSize: '1.05rem',
                  cursor: onViewDetails ? 'pointer' : 'default',
                }}
                onClick={() => onViewDetails?.(caseData.id)}
                title={caseData.title}
              >
                {caseData.title || '(Untitled Case)'}
              </h5>

              <span
                className={`badge rounded-pill px-2.5 py-1 small fw-semibold ${statusBadgeClass}`}
                style={{ fontSize: '0.72rem' }}
              >
                ● {caseData.status}
              </span>

              {isSeekingSupport && (
                <span
                  className="badge badge-soft-emerald rounded-pill px-2.5 py-1 small fw-semibold d-inline-flex align-items-center gap-1"
                  title="Peer Support Active"
                  style={{ fontSize: '0.7rem' }}
                >
                  <FaHandshake size={10} />
                  <span>Peer Support</span>
                </span>
              )}
            </div>

            {(partiesCount > 0 || childrenCount > 0) && (
              <div className="d-flex align-items-center gap-1.5 text-muted small flex-shrink-0 ms-auto" style={{ fontSize: '0.75rem' }}>
                {partiesCount > 0 && (
                  <span
                    className="badge bg-light text-secondary border px-2 py-1 rounded-pill d-inline-flex align-items-center gap-1"
                    title={`${partiesCount} Parties`}
                    style={{ fontSize: '0.7rem', fontWeight: 500 }}
                  >
                    <FaUsers size={10} className="text-secondary opacity-75" />
                    <span>{partiesCount} {partiesCount === 1 ? 'Party' : 'Parties'}</span>
                  </span>
                )}
                {childrenCount > 0 && (
                  <span
                    className="badge bg-light text-secondary border px-2 py-1 rounded-pill d-inline-flex align-items-center gap-1"
                    title={`${childrenCount} Children`}
                    style={{ fontSize: '0.7rem', fontWeight: 500 }}
                  >
                    <FaChild size={10} className="text-secondary opacity-75" />
                    <span>{childrenCount} {childrenCount === 1 ? 'Child' : 'Children'}</span>
                  </span>
                )}
              </div>
            )}
          </div>

          <div
            className="small text-secondary d-flex align-items-center gap-1.5 flex-wrap"
            style={{ fontSize: '0.78rem', minHeight: '1.25rem' }}
          >
            <span className="d-inline-flex align-items-center gap-1 text-muted">
              <FaGavel size={10} className="text-secondary opacity-75 flex-shrink-0" />
              <span>{caseData.court}</span>
            </span>
            <span className="text-muted">•</span>
            <span className="text-muted text-truncate" style={{ maxWidth: 230 }}>
              {caseData.caseType}
            </span>
          </div>
        </div>

        {/* Hearing Banner Section (Consistent 104px Height) */}
        {showNextHearing && (
          nextHearing ? (
            <NextHearingBanner hearing={nextHearing} className="mb-3" />
          ) : (
            <div className="hearing-banner hearing-banner-empty p-3 mb-3">
              <div className="d-flex gap-3 align-items-center">
                <div className="hearing-date-chip is-empty" aria-hidden="true">
                  <FaCalendarAlt size={16} />
                </div>
                <div className="min-w-0">
                  <div className="hearing-banner-label">Next court hearing</div>
                  <div className="fw-semibold text-dark">No hearing booked yet</div>
                  <div className="small text-muted">Add the date as soon as the court sends it.</div>
                </div>
              </div>
            </div>
          )
        )}

        {/* Progression Section */}
        {showProgress && (
          <div className="flex-grow-1 mb-3">
            {progressComponent === 'timeline' ? (
              <CaseTimeline
                caseData={caseData}
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
            <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
              {onViewDetails && (
                <ViewCaseButton
                  caseId={caseData.id}
                  onView={() => onViewDetails(caseData.id)}
                  className="flex-grow-1"
                />
              )}
              {onTogglePeerSupport && (
                <PeerSupportButton
                  isSeekingPeerSupport={isSeekingSupport}
                  onToggle={() => onTogglePeerSupport(caseData.id, isSeekingSupport)}
                />
              )}
              {onEdit && (
                <EditCaseButton
                  caseId={caseData.id}
                  onEdit={() => onEdit(caseData.id)}
                />
              )}
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  )
}

