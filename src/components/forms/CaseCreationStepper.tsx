import { Card, ProgressBar } from 'react-bootstrap'
import { FaFolderOpen, FaUsers, FaCheckCircle } from 'react-icons/fa'

export interface StepperStatus {
  detailsValid: boolean
  partiesCount: number
  childrenCount: number
}

export interface CaseCreationStepperProps {
  currentStep: number
  onSelectStep: (step: number) => void
  status: StepperStatus
  className?: string
}

interface StepConfig {
  step: number
  title: string
  subtitle: string
  icon: typeof FaFolderOpen
}

const STEPS: StepConfig[] = [
  {
    step: 0,
    title: '1. Case Details',
    subtitle: 'Jurisdiction & Court',
    icon: FaFolderOpen,
  },
  {
    step: 1,
    title: '2. Parties & Children',
    subtitle: 'People Involved',
    icon: FaUsers,
  },
  {
    step: 2,
    title: '3. Review & Launch',
    subtitle: 'Verify & Confirm',
    icon: FaCheckCircle,
  },
]

export default function CaseCreationStepper({
  currentStep,
  onSelectStep,
  status,
  className = '',
}: CaseCreationStepperProps) {
  // Calculate completion percentage:
  // Step 0 valid: 33%, Step 1 (has at least 1 party): 66%, Step 2: 100%
  let completion = 15
  if (status.detailsValid) completion += 35
  if (status.partiesCount > 0) completion += 35
  if (currentStep === 2) completion = 100

  return (
    <Card className={`border-0 shadow-sm mb-4 bg-white ${className}`}>
      <Card.Body className="p-3 p-md-4">
        {/* Stepper Tabs Bar */}
        <div className="d-flex flex-column flex-md-row align-items-stretch align-items-md-center justify-content-between gap-2">
          {STEPS.map((s) => {
            const isActive = currentStep === s.step
            const isCompleted =
              (s.step === 0 && status.detailsValid) ||
              (s.step === 1 && status.partiesCount > 0) ||
              (s.step === 2 && currentStep === 2)
            const Icon = s.icon

            return (
              <button
                key={s.step}
                type="button"
                onClick={() => onSelectStep(s.step)}
                className={`btn text-start p-2 p-md-3 rounded-3 transition-all d-flex align-items-center gap-3 border ${
                  isActive
                    ? 'border-primary bg-primary-subtle text-primary shadow-xs'
                    : isCompleted
                      ? 'border-success-subtle bg-light text-dark'
                      : 'border-light-subtle bg-white text-secondary'
                }`}
                style={{
                  flex: 1,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <div
                  className={`rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 ${
                    isActive
                      ? 'bg-primary text-white shadow-sm'
                      : isCompleted
                        ? 'bg-success text-white'
                        : 'bg-secondary-subtle text-secondary'
                  }`}
                  style={{ width: 38, height: 38 }}
                >
                  <Icon size={16} />
                </div>
                <div className="overflow-hidden">
                  <div className="d-flex align-items-center gap-2">
                    <span className={`fw-bold small ${isActive ? 'text-primary' : 'text-dark'}`}>
                      {s.title}
                    </span>
                    {isCompleted && !isActive && (
                      <span className="badge bg-success-subtle text-success py-0 px-1 font-monospace" style={{ fontSize: '0.7rem' }}>
                        Done
                      </span>
                    )}
                  </div>
                  <div className="text-muted small text-truncate" style={{ fontSize: '0.8rem' }}>
                    {s.step === 1 && (status.partiesCount > 0 || status.childrenCount > 0)
                      ? `${status.partiesCount} parties, ${status.childrenCount} children`
                      : s.subtitle}
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Subtle Progress Bar */}
        <div className="mt-3 px-1">
          <div className="d-flex justify-content-between align-items-center small text-muted mb-1">
            <span style={{ fontSize: '0.75rem' }}>Step {currentStep + 1} of 3</span>
            <span style={{ fontSize: '0.75rem' }} className="fw-semibold text-primary">
              {completion}% Complete
            </span>
          </div>
          <ProgressBar
            now={completion}
            variant={completion === 100 ? 'success' : 'primary'}
            style={{ height: '6px', borderRadius: '4px' }}
          />
        </div>
      </Card.Body>
    </Card>
  )
}
