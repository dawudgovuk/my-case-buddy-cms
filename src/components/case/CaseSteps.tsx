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
} from 'react-icons/fa'

export interface CaseStepsProps {
  stages: CaseStageInfo[]
  currentStageIndex: number
  className?: string
}

const defaultIcons: Record<string, React.ReactNode> = {
  application: <FaFileAlt />,
  'pre-proceedings': <FaExclamationTriangle />,
  'first-hearing': <FaCalendarAlt />,
  directions: <FaTasks />,
  'fact-finding': <FaSearch />,
  welfare: <FaHeart />,
  final: <FaGavel />,
  'without-notice': <FaExclamationTriangle />,
  service: <FaEnvelope />,
  'return-hearing': <FaCalendarAlt />,
  'first-appointment': <FaCalendarAlt />,
  disclosure: <FaFileAlt />,
  fdr: <FaDollarSign />,
  assessment: <FaUserCheck />,
}

export default function CaseSteps({ stages, currentStageIndex, className = '' }: CaseStepsProps) {
  return (
    <div className={`case-steps-container ${className}`}>
      {stages.map((stage, idx) => {
        const isCurrent = idx === currentStageIndex
        const isCompleted = idx < currentStageIndex

        return (
          <div
            key={stage.id}
            className={`d-flex align-items-center gap-3 p-2 rounded mb-1 transition-all ${
              isCurrent
                ? 'bg-primary-subtle border-start border-4 border-primary fw-semibold'
                : isCompleted
                  ? 'text-muted'
                  : 'text-secondary opacity-75'
            }`}
          >
            <div className={`fs-5 ${isCurrent ? 'text-primary' : isCompleted ? 'text-success' : 'text-muted'}`}>
              {defaultIcons[stage.id] || <FaFileAlt />}
            </div>
            <div>
              <div className="small mb-0">{stage.name}</div>
              {stage.description && <div className="text-muted" style={{ fontSize: '0.75rem' }}>{stage.description}</div>}
            </div>
          </div>
        )
      })}
    </div>
  )
}
