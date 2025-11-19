// Removed semantic-ui Step import for custom vertical layout
import type { CaseStageInfo } from '../utils/caseStages'
import { FaFileAlt, FaGavel, FaHandshake, FaClipboardCheck, FaSearch, FaUserCheck, FaCheckCircle } from 'react-icons/fa'

interface CaseStepsProps {
  stages: CaseStageInfo[]
  currentStageIndex: number
}

const stageIcons = [
  FaFileAlt,      // Application
  FaGavel,        // First Hearing
  FaHandshake,    // Mediation/Assessment
  FaClipboardCheck, // Directions
  FaSearch,       // Fact-Finding
  FaUserCheck,    // Welfare
  FaCheckCircle,  // Final
]

export default function CaseSteps({ stages, currentStageIndex }: CaseStepsProps) {
  return (
    <div className="mt-3">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {stages.map((stage, index) => {
          const Icon = stageIcons[index % stageIcons.length]
          const isCompleted = index < currentStageIndex
          const isActive = index === currentStageIndex
          return (
            <div
              key={stage.id}
              className={`d-flex align-items-start py-2 px-2 border-start ${isCompleted ? 'bg-success bg-opacity-10' : isActive ? 'bg-primary bg-opacity-10' : ''}`}
              style={{ borderLeftWidth: 4, borderLeftStyle: 'solid', borderLeftColor: isCompleted ? '#198754' : isActive ? '#0d6efd' : '#dee2e6', position: 'relative' }}
            >
              <span style={{ fontSize: 20, marginRight: 12, color: isCompleted ? '#198754' : isActive ? '#0d6efd' : '#adb5bd', marginTop: 2 }}>
                <Icon />
              </span>
              <div>
                <div className={`fw-bold ${isActive ? 'text-primary' : isCompleted ? 'text-success' : 'text-muted'}`}>{stage.name}</div>
                {stage.description && <div className="small text-muted">{stage.description}</div>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
