import { Card, ProgressBar } from 'react-bootstrap'
import { FaFolderOpen, FaUsers, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa'
import { useTranslation } from '../../hooks/useTranslation'

export interface StepperStatus {
  detailsValid: boolean
  partiesCount: number
  childrenCount: number
  titleMissing?: boolean
}

export interface CaseCreationStepperProps {
  currentStep: number
  onSelectStep: (step: number) => void
  status: StepperStatus
  className?: string
}

export default function CaseCreationStepper({
  currentStep,
  onSelectStep,
  status,
  className = '',
}: CaseCreationStepperProps) {
  const { t } = useTranslation()

  const steps = [
    {
      step: 0,
      title: `1. ${t('caseForm.stepDetails')}`,
      subtitle: 'Jurisdiction & Court',
      icon: FaFolderOpen,
    },
    {
      step: 1,
      title: `2. ${t('caseForm.stepParties')}`,
      subtitle: 'People Involved',
      icon: FaUsers,
    },
    {
      step: 2,
      title: `3. ${t('caseForm.stepReview')}`,
      subtitle: 'Verify & Confirm',
      icon: FaCheckCircle,
    },
  ]

  // Calculate completion percentage:
  let completion = 15
  if (status.detailsValid) completion += 35
  if (status.partiesCount > 0) completion += 35
  if (currentStep === 2) {
    completion = status.detailsValid ? 100 : Math.min(completion + 15, 80)
  }

  return (
    <Card className={`border-0 shadow-sm mb-4 bg-white ${className}`}>
      <Card.Body className="p-3 p-md-4">
        {/* Stepper Tabs Bar */}
        <div className="d-flex flex-row align-items-stretch justify-content-between gap-2">
          {steps.map((s) => {
            const isActive = currentStep === s.step
            const isCompleted =
              (s.step === 0 && status.detailsValid) ||
              (s.step === 1 && status.partiesCount > 0) ||
              (s.step === 2 && currentStep === 2 && status.detailsValid)

            // Step 0 has an issue if details are invalid and user progressed past step 0
            const isStep0Error = s.step === 0 && !status.detailsValid && currentStep > 0
            const isStep1Warning = s.step === 1 && status.partiesCount === 0 && currentStep === 2

            const Icon = isStep0Error ? FaExclamationTriangle : s.icon

            return (
              <button
                key={s.step}
                type="button"
                onClick={() => onSelectStep(s.step)}
                className={`btn stepper-step ${isActive ? 'is-active' : ''} text-start p-2 p-md-3 rounded-3 d-flex align-items-center gap-3 border position-relative ${
                  isActive
                    ? 'border-primary bg-primary-subtle text-primary shadow-xs'
                    : isStep0Error
                      ? 'border-danger bg-danger-subtle text-danger shadow-xs'
                      : isCompleted
                        ? 'border-success-subtle bg-light text-dark'
                        : isStep1Warning
                          ? 'border-warning-subtle bg-white text-secondary'
                          : 'border-light-subtle bg-white text-secondary'
                }`}
                style={{
                  flex: 1,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                }}
                title={
                  isStep0Error
                    ? 'Case Title is missing! Click here to return to Step 1 and add title'
                    : undefined
                }
              >
                <div
                  className={`rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 ${
                    isActive
                      ? 'bg-primary text-white shadow-sm'
                      : isStep0Error
                        ? 'bg-danger text-white shadow-sm'
                        : isCompleted
                          ? 'bg-success text-white'
                          : isStep1Warning
                            ? 'bg-warning text-white'
                            : 'bg-secondary-subtle text-secondary'
                  }`}
                  style={{ width: 38, height: 38 }}
                >
                  <Icon size={16} />
                </div>
                <div className="overflow-hidden flex-grow-1 stepper-text">
                  <div className="d-flex align-items-center justify-content-between gap-1">
                    <span
                      className={`fw-bold small ${
                        isActive
                          ? 'text-primary'
                          : isStep0Error
                            ? 'text-danger'
                            : 'text-dark'
                      }`}
                    >
                      {s.title}
                    </span>
                    {isStep0Error && (
                      <span
                        className="badge bg-danger text-white py-0.5 px-1.5 font-monospace"
                        style={{ fontSize: '0.68rem' }}
                      >
                        ⚠️ Title Missing
                      </span>
                    )}
                    {isCompleted && !isActive && (
                      <span
                        className="badge bg-success-subtle text-success py-0 px-1 font-monospace"
                        style={{ fontSize: '0.7rem' }}
                      >
                        Done
                      </span>
                    )}
                    {isStep1Warning && !isActive && (
                      <span
                        className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle py-0 px-1 font-monospace"
                        style={{ fontSize: '0.7rem' }}
                      >
                        Recommended
                      </span>
                    )}
                  </div>
                  <div
                    className={`small text-truncate ${
                      isStep0Error
                        ? 'text-danger fw-semibold'
                        : 'text-muted'
                    }`}
                    style={{ fontSize: '0.8rem' }}
                  >
                    {isStep0Error
                      ? 'Required title missing — Click to fix'
                      : s.step === 1 && (status.partiesCount > 0 || status.childrenCount > 0)
                        ? `${status.partiesCount} parties, ${status.childrenCount} children`
                        : s.step === 0 && isActive && !status.detailsValid
                          ? 'Case Title is required *'
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
            <div className="d-flex align-items-center gap-2">
              {currentStep === 2 && !status.detailsValid && (
                <span className="small text-danger fw-semibold" style={{ fontSize: '0.75rem' }}>
                  ⚠️ Step 1 requires attention
                </span>
              )}
              <span
                style={{ fontSize: '0.75rem' }}
                className={`fw-semibold ${
                  currentStep === 2 && !status.detailsValid ? 'text-danger' : 'text-primary'
                }`}
              >
                {completion}% Complete
              </span>
            </div>
          </div>
          <ProgressBar
            now={completion}
            variant={
              currentStep === 2 && !status.detailsValid
                ? 'danger'
                : completion === 100
                  ? 'success'
                  : 'primary'
            }
            style={{ height: '6px', borderRadius: '4px' }}
          />
        </div>
      </Card.Body>
    </Card>
  )
}
