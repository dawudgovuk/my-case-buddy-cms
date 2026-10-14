import type { ReactNode } from 'react'
import { Badge } from 'react-bootstrap'
import type { CaseStageInfo } from '../../utils/caseStages'
import {
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
  FaCheck,
} from 'react-icons/fa'

export interface CaseStepsProps {
  stages: CaseStageInfo[]
  currentStageIndex: number
  className?: string
}

const defaultIcons: Record<string, ReactNode> = {
  application: <FaFileAlt size={12} />,
  'pre-proceedings': <FaExclamationTriangle size={12} />,
  'first-hearing': <FaCalendarAlt size={12} />,
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

export default function CaseSteps({ stages, currentStageIndex, className = '' }: CaseStepsProps) {
  return (
    <div className={`case-steps-timeline position-relative ${className}`}>
      {stages.map((stage, idx) => {
        const isCurrent = idx === currentStageIndex
        const isCompleted = idx < currentStageIndex
        const isLast = idx === stages.length - 1

        return (
          <div
            key={stage.id}
            className={`case-step-item position-relative d-flex align-items-center gap-3 py-2 px-2 rounded-3 transition-all ${
              isCurrent
                ? 'bg-primary-subtle border border-primary-subtle'
                : isCompleted
                  ? 'text-dark'
                  : 'text-muted opacity-75'
            }`}
            style={{ marginBottom: '4px' }}
          >
            {/* Connecting Vertical Line */}
            {!isLast && (
              <div
                className={`case-step-connector ${isCompleted ? 'completed' : ''}`}
                style={{
                  position: 'absolute',
                  left: 20,
                  top: 28,
                  bottom: -10,
                  width: 2,
                  zIndex: 0,
                  backgroundColor: isCompleted ? '#86efac' : '#e2e8f0',
                }}
              />
            )}

            {/* Circular Step Badge */}
            <div
              className={`case-step-icon d-flex align-items-center justify-content-center rounded-circle flex-shrink-0 position-relative ${
                isCurrent
                  ? 'bg-primary text-white shadow-sm'
                  : isCompleted
                    ? 'bg-success text-white'
                    : 'bg-light text-secondary border'
              }`}
              style={{
                width: 26,
                height: 26,
                fontSize: '0.75rem',
                zIndex: 1,
                boxShadow: isCurrent ? '0 0 0 3px rgba(13, 110, 253, 0.2)' : undefined,
              }}
            >
              {isCompleted ? <FaCheck size={10} /> : (defaultIcons[stage.id] || <FaFileAlt size={11} />)}
            </div>

            {/* Step Label & Description */}
            <div className="flex-grow-1 min-w-0">
              <div className="d-flex align-items-center justify-content-between gap-2">
                <span className={`small text-truncate ${isCurrent ? 'fw-bold text-primary' : isCompleted ? 'fw-medium text-dark' : 'text-secondary'}`}>
                  {stage.name}
                </span>

                {isCurrent && (
                  <Badge bg="primary" className="fw-semibold px-2 py-0 text-white" style={{ fontSize: '0.65rem' }}>
                    Active
                  </Badge>
                )}
                {isCompleted && (
                  <span className="text-success small d-flex align-items-center" style={{ fontSize: '0.7rem' }}>
                    Done
                  </span>
                )}
              </div>

              {stage.description && (
                <div className="text-muted text-truncate" style={{ fontSize: '0.75rem' }}>
                  {stage.description}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
