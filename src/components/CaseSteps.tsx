import { Step } from 'semantic-ui-react'
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
      <Step.Group size="small" fluid>
        {stages.map((stage, index) => {
          const Icon = stageIcons[index % stageIcons.length]
          const isCompleted = index < currentStageIndex
          const isActive = index === currentStageIndex
          
          return (
            <Step
              key={stage.id}
              completed={isCompleted}
              active={isActive}
              disabled={index > currentStageIndex}
            >
              <Icon style={{ marginRight: '8px' }} />
              <Step.Content>
                <Step.Title>{stage.name}</Step.Title>
                <Step.Description>{stage.description}</Step.Description>
              </Step.Content>
            </Step>
          )
        })}
      </Step.Group>
    </div>
  )
}
