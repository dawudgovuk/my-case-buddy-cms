import { useState } from 'react'
import type { ReactNode } from 'react'
import { Badge, Collapse, Button } from 'react-bootstrap'
import type { FamilyCase } from '../../types/domain'
import type { CaseStageInfo } from '../../utils/caseStages'
import { isUserCaseMember } from '../../utils/caseMembership'
import { useAuthStore } from '../../store/authStore'
import UpdateCaseStageModal from './UpdateCaseStageModal'
import {
  FaCheck,
  FaFileAlt,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaTasks,
  FaSearch,
  FaHeart,
  FaGavel,
  FaEnvelope,
  FaDollarSign,
  FaUserCheck,
  FaChevronDown,
  FaChevronUp,
  FaHandshake,
  FaEdit,
  FaArrowRight,
} from 'react-icons/fa'

export interface CaseTimelineProps {
  stages: CaseStageInfo[]
  currentStageIndex: number
  caseData?: FamilyCase
  showProgressBar?: boolean
  collapsible?: boolean
  defaultExpanded?: boolean
  compact?: boolean
  className?: string
  interactive?: boolean
  onStageClick?: (stage: CaseStageInfo, index: number) => void
  onStageChange?: (newStage: CaseStageInfo, index: number) => void
}

const stageIcons: Record<string, ReactNode> = {
  application: <FaFileAlt size={12} />,
  'pre-proceedings': <FaExclamationTriangle size={12} />,
  'first-hearing': <FaCalendarAlt size={12} />,
  mediation: <FaHandshake size={12} />,
  directions: <FaTasks size={12} />,
  'fact-finding': <FaSearch size={12} />,
  welfare: <FaHeart size={12} />,
  final: <FaGavel size={12} />,
  'without-notice': <FaExclamationTriangle size={12} />,
  service: <FaEnvelope size={12} />,
  'return-hearing': <FaCalendarAlt size={12} />,
  'first-appointment': <FaCalendarAlt size={12} />,
  disclosure: <FaFileAlt size={12} />,
  fdr: <FaDollarSign size={12} />,
  assessment: <FaUserCheck size={12} />,
}

export default function CaseTimeline({
  stages,
  currentStageIndex,
  caseData,
  showProgressBar = true,
  collapsible = true,
  defaultExpanded = true,
  compact = false,
  className = '',
  interactive = false,
  onStageClick,
  onStageChange,
}: CaseTimelineProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const [showModal, setShowModal] = useState(false)
  const [selectedTargetStage, setSelectedTargetStage] = useState<string | undefined>(undefined)

  const { user } = useAuthStore()

  // Authorized members: Litigant in Person (owner), McKenzie Friend, Solicitor, Barrister
  const canUpdate = Boolean(caseData && user && isUserCaseMember(caseData, user))

  const total = stages.length
  const progressPercent = total > 0 ? Math.round(((currentStageIndex + 1) / total) * 100) : 0
  const activeStage = stages[currentStageIndex]
  const nextStage = stages[currentStageIndex + 1]

  function openUpdateModal(stageId?: string) {
    setSelectedTargetStage(stageId)
    setShowModal(true)
  }

  return (
    <div
      className={`case-timeline-card rounded-3 border overflow-hidden ${
        compact ? 'bg-light bg-opacity-60' : 'bg-white shadow-sm'
      } ${className}`}
      style={{ borderColor: '#e2e8f0' }}
    >
      <div className="p-3">
        {/* Stage Header: Stage Count & Stage Name + Update Action */}
        <div className="d-flex align-items-center justify-content-between gap-2 mb-2 flex-wrap">
          <div className="d-flex align-items-center gap-2">
            <span className="fw-bold text-dark" style={{ fontSize: '0.84rem' }}>
              Stage {currentStageIndex + 1} of {total}
            </span>
            {activeStage && (
              <span
                className="badge badge-soft-emerald px-2 py-0.5 rounded-pill fw-semibold text-truncate"
                style={{ fontSize: '0.72rem', maxWidth: 190 }}
                title={activeStage.name}
              >
                ● {activeStage.name}
              </span>
            )}
          </div>

          {canUpdate && (
            <Button
              variant="outline-primary"
              size="sm"
              className="py-0 px-2 d-inline-flex align-items-center gap-1 fw-medium"
              style={{ fontSize: '0.74rem', height: '24px' }}
              onClick={() => openUpdateModal(activeStage?.id)}
              title="Set or advance the court progress stage"
            >
              <FaEdit size={10} />
              <span>Update Progress</span>
            </Button>
          )}
        </div>

        {/* Progress Bar */}
        {showProgressBar && (
          <div className="mb-2">
            <div className="case-mini-progress" style={{ height: 6 }}>
              <div
                className="case-mini-progress-bar"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Next Step Hint & Quick Action & Expand Toggle */}
        <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
          <div className="d-flex align-items-center gap-2 min-width-0">
            <span className="text-muted text-truncate" style={{ fontSize: '0.75rem' }}>
              {nextStage ? (
                <>
                  <span className="text-secondary fw-medium">Next:</span> {nextStage.name}
                </>
              ) : (
                <span className="text-success fw-medium">All court stages completed</span>
              )}
            </span>

            {canUpdate && nextStage && (
              <button
                type="button"
                onClick={() => openUpdateModal(nextStage.id)}
                className="btn btn-link p-0 text-primary text-decoration-none fw-semibold d-inline-flex align-items-center gap-1"
                style={{ fontSize: '0.75rem' }}
                title={`Advance to ${nextStage.name}`}
              >
                <span>Advance</span>
                <FaArrowRight size={9} />
              </button>
            )}
          </div>

          {collapsible && (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              aria-expanded={expanded}
              className="btn btn-link p-0 text-decoration-none text-secondary d-inline-flex align-items-center gap-1 flex-shrink-0 ms-auto"
              style={{ fontSize: '0.74rem', fontWeight: 500 }}
            >
              <span>{expanded ? 'Hide steps' : 'View steps'}</span>
              {expanded ? <FaChevronUp size={8} /> : <FaChevronDown size={8} />}
            </button>
          )}
        </div>
      </div>

      <Collapse in={!collapsible || expanded}>
        <div>
          <div className={`pt-2 ${compact ? 'px-3 pb-3 border-top' : 'p-3 border-top'}`} style={{ borderColor: '#f1f5f9' }}>
            <div className="position-relative ps-2">
              {stages.map((stage, idx) => {
                const isCompleted = idx < currentStageIndex
                const isCurrent = idx === currentStageIndex
                const isLast = idx === stages.length - 1

                let nodeBg = 'bg-light border text-muted'
                let nodeBorder = 'border-secondary'
                let textColor = 'text-muted'
                let stageBadgeVariant = 'secondary'

                if (isCompleted) {
                  nodeBg = 'bg-success text-white'
                  nodeBorder = 'border-success'
                  textColor = 'text-dark'
                  stageBadgeVariant = 'success'
                } else if (isCurrent) {
                  nodeBg = 'bg-dark text-white shadow-sm'
                  nodeBorder = 'border-dark'
                  textColor = 'text-dark fw-bold'
                  stageBadgeVariant = 'dark'
                }

                return (
                  <div
                    key={stage.id}
                    className={`position-relative d-flex align-items-start gap-3 ${isLast ? '' : compact ? 'pb-2' : 'pb-3'} ${
                      canUpdate || interactive ? 'rounded p-1 transition-all' : ''
                    }`}
                  >
                    {/* Vertical connecting line */}
                    {!isLast && (
                      <div
                        className="position-absolute"
                        style={{
                          left: 17,
                          top: 26,
                          bottom: 0,
                          width: 2,
                          backgroundColor: isCompleted ? '#198754' : '#dee2e6',
                          zIndex: 1,
                        }}
                      />
                    )}

                    {/* Milestone circle node */}
                    <div
                      className={`d-flex align-items-center justify-content-center rounded-circle flex-shrink-0 ${nodeBg} ${nodeBorder} ${
                        canUpdate ? 'cursor-pointer' : ''
                      }`}
                      style={{
                        width: 28,
                        height: 28,
                        zIndex: 2,
                        transition: 'all 0.2s ease',
                      }}
                      onClick={() => {
                        if (canUpdate) {
                          openUpdateModal(stage.id)
                        } else if (interactive) {
                          onStageClick?.(stage, idx)
                        }
                      }}
                      title={canUpdate ? `Click to set stage to ${stage.name}` : undefined}
                    >
                      {isCompleted ? (
                        <FaCheck size={11} />
                      ) : (
                        stageIcons[stage.id] || <span style={{ fontSize: '0.7rem' }}>{idx + 1}</span>
                      )}
                    </div>

                    {/* Stage description content */}
                    <div className="flex-grow-1 min-width-0">
                      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-0">
                        <div className="d-flex align-items-center gap-2 flex-wrap">
                          <span
                            className={`small ${textColor} ${canUpdate ? 'cursor-pointer' : ''}`}
                            onClick={() => canUpdate && openUpdateModal(stage.id)}
                          >
                            {stage.name}
                          </span>
                          {isCurrent && (
                            <Badge bg={stageBadgeVariant} pill style={{ fontSize: '0.65rem' }}>
                              Current Stage
                            </Badge>
                          )}
                          {isCompleted && (
                            <span className="text-success small" style={{ fontSize: '0.7rem' }}>
                              Completed
                            </span>
                          )}
                        </div>

                        {canUpdate && !isCurrent && (
                          <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm py-0 px-2 small ms-auto"
                            style={{ fontSize: '0.68rem', lineHeight: '18px' }}
                            onClick={() => openUpdateModal(stage.id)}
                            title={`Move case progress to Stage ${idx + 1}: ${stage.name}`}
                          >
                            Move here
                          </button>
                        )}
                      </div>

                      {stage.description && (
                        <div
                          className="text-secondary small mt-0 text-truncate-2"
                          style={{ fontSize: compact ? '0.75rem' : '0.8rem', lineHeight: 1.35 }}
                        >
                          {stage.description}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </Collapse>

      {/* Update Stage Modal for Authorized Members */}
      {caseData && (
        <UpdateCaseStageModal
          show={showModal}
          onHide={() => setShowModal(false)}
          caseData={caseData}
          initialStageId={selectedTargetStage}
          onSuccess={(updated) => {
            const idx = stages.findIndex((s) => s.id === updated.currentStage)
            if (idx >= 0 && stages[idx]) {
              onStageChange?.(stages[idx], idx)
            }
          }}
        />
      )}
    </div>
  )
}
