import { useState } from 'react'
import type { ReactNode } from 'react'
import { Card, Badge, ProgressBar, Button, Collapse } from 'react-bootstrap'
import type { CaseStageInfo } from '../../utils/caseStages'
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
} from 'react-icons/fa'

export interface CaseTimelineProps {
  stages: CaseStageInfo[]
  currentStageIndex: number
  showProgressBar?: boolean
  collapsible?: boolean
  defaultExpanded?: boolean
  compact?: boolean
  className?: string
  interactive?: boolean
  onStageClick?: (stage: CaseStageInfo, index: number) => void
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
  showProgressBar = true,
  collapsible = true,
  defaultExpanded = true,
  compact = false,
  className = '',
  interactive = false,
  onStageClick,
}: CaseTimelineProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  const total = stages.length
  const progressPercent = total > 0 ? Math.round(((currentStageIndex + 1) / total) * 100) : 0
  const activeStage = stages[currentStageIndex]

  return (
    <Card className={`border shadow-sm bg-white case-timeline-card ${className}`}>
      <Card.Header className="bg-white border-bottom-0 pt-3 pb-2 d-flex flex-wrap align-items-center justify-content-between gap-2">
        <div className="d-flex align-items-center gap-2">
          <span className="fw-bold text-dark fs-6">Court Procedural Timeline</span>
          {activeStage && (
            <Badge bg="primary" className="fw-semibold px-2 py-1">
              Active: {activeStage.name}
            </Badge>
          )}
        </div>

        <div className="d-flex align-items-center gap-3">
          {showProgressBar && (
            <div className="d-none d-sm-flex align-items-center gap-2" style={{ minWidth: 160 }}>
              <ProgressBar
                now={progressPercent}
                variant="primary"
                style={{ height: 6, width: 100 }}
                className="rounded-pill"
              />
              <span className="small text-muted fw-semibold" style={{ fontSize: '0.75rem' }}>
                {progressPercent}%
              </span>
            </div>
          )}

          {collapsible && (
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              aria-expanded={expanded}
              className="py-0 px-2 d-flex align-items-center gap-1"
              style={{ fontSize: '0.8rem', height: 26 }}
            >
              <span>{expanded ? 'Collapse' : 'Expand'}</span>
              {expanded ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />}
            </Button>
          )}
        </div>
      </Card.Header>

      {/* Progress percentage on mobile when visible */}
      {showProgressBar && (
        <div className="d-sm-none px-3 pb-2">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <span className="small text-muted" style={{ fontSize: '0.75rem' }}>Progress</span>
            <span className="small text-muted fw-semibold" style={{ fontSize: '0.75rem' }}>{progressPercent}%</span>
          </div>
          <ProgressBar now={progressPercent} variant="primary" style={{ height: 4 }} className="rounded-pill" />
        </div>
      )}

      <Collapse in={!collapsible || expanded}>
        <div>
          <Card.Body className={`pt-2 ${compact ? 'p-2' : 'p-3'}`}>
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
                  nodeBg = 'bg-primary text-white shadow-sm ring-4 ring-primary-subtle'
                  nodeBorder = 'border-primary'
                  textColor = 'text-primary fw-bold'
                  stageBadgeVariant = 'primary'
                }

                return (
                  <div
                    key={stage.id}
                    className={`position-relative d-flex align-items-start gap-3 ${isLast ? '' : compact ? 'pb-2' : 'pb-3'} ${
                      interactive ? 'cursor-pointer hover-bg-light rounded p-1' : ''
                    }`}
                    onClick={() => interactive && onStageClick?.(stage, idx)}
                  >
                    {/* Vertical connecting line */}
                    {!isLast && (
                      <div
                        className="position-absolute"
                        style={{
                          left: 13,
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
                      className={`d-flex align-items-center justify-content-center rounded-circle flex-shrink-0 ${nodeBg} ${nodeBorder}`}
                      style={{
                        width: 28,
                        height: 28,
                        zIndex: 2,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {isCompleted ? (
                        <FaCheck size={11} />
                      ) : (
                        stageIcons[stage.id] || <span style={{ fontSize: '0.7rem' }}>{idx + 1}</span>
                      )}
                    </div>

                    {/* Stage description content */}
                    <div className="flex-grow-1 min-width-0">
                      <div className="d-flex flex-wrap align-items-center gap-2 mb-0">
                        <span className={`small ${textColor}`}>{stage.name}</span>
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
          </Card.Body>
        </div>
      </Collapse>
    </Card>
  )
}
