import { Badge, Button, Card, ProgressBar } from 'react-bootstrap';
import {
  FaCheckCircle,
  FaRegCircle,
  FaExclamationTriangle,
  FaChevronRight,
  FaBookOpen,
} from 'react-icons/fa';
import type { GuidanceJourney, GuidanceStep } from '../../types/guidance';
import { useGuidanceStore } from '../../store/guidanceStore';

interface JourneyStepperProps {
  journey: GuidanceJourney;
  activeStep: GuidanceStep | null;
  onSelectStep: (step: GuidanceStep) => void;
}

export default function JourneyStepper({
  journey,
  activeStep,
  onSelectStep,
}: JourneyStepperProps) {
  const { isStepCompleted, toggleStepCompletion } = useGuidanceStore();

  const totalSteps = journey.steps.length;
  const completedCount = journey.steps.filter((s) => isStepCompleted(s.slug)).length;
  const progressPercent = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  return (
    <div className="journey-stepper mb-4">
      {/* Header with Progress Bar */}
      <Card className="border-0 shadow-xs mb-3" style={{ border: '1px solid var(--mcb-border)' }}>
        <Card.Body className="p-3 p-md-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-2">
            <div>
              <div className="d-flex align-items-center gap-2">
                <span
                  className="badge border px-2.5 py-1"
                  style={{
                    backgroundColor: 'var(--mcb-primary-soft)',
                    color: 'var(--mcb-primary)',
                    borderColor: 'var(--mcb-primary-border)',
                  }}
                >
                  Phase {journey.order}
                </span>
                <span className="text-muted small fw-medium">{journey.type || 'Court Milestone'}</span>
              </div>
              <h3 className="h5 fw-bold text-dark mt-1 mb-0">{journey.name}</h3>
            </div>
            <div className="text-md-end">
              <span className="fw-semibold text-primary">{completedCount} of {totalSteps}</span>{' '}
              <span className="text-muted small">steps completed ({progressPercent}%)</span>
            </div>
          </div>

          <ProgressBar
            now={progressPercent}
            variant={progressPercent === 100 ? 'success' : 'primary'}
            style={{ height: '8px', borderRadius: '4px' }}
            className="my-2"
          />

          {journey.description && (
            <p className="text-muted small mb-0 mt-2">{journey.description}</p>
          )}
        </Card.Body>
      </Card>

      {/* Stepper Timeline List */}
      <div className="steps-container d-flex flex-column gap-2.5">
        {journey.steps.map((step, idx) => {
          const isCompleted = isStepCompleted(step.slug);
          const isSelected = activeStep?.slug === step.slug;

          return (
            <div
              key={step.id || step.slug}
              className={`p-3 rounded transition-all position-relative border ${
                isSelected
                  ? 'border-primary shadow-xs'
                  : isCompleted
                  ? 'bg-light border-success border-opacity-25'
                  : 'bg-white border-secondary border-opacity-20'
              }`}
              style={{
                cursor: 'pointer',
                backgroundColor: isSelected ? 'var(--mcb-primary-soft)' : undefined,
                borderLeft: isSelected ? '4px solid var(--mcb-primary)' : undefined,
              }}
              onClick={() => onSelectStep(step)}
            >
              <div className="d-flex align-items-start gap-3">
                {/* Step Status Icon / Button */}
                <button
                  type="button"
                  className="btn p-0 border-0 flex-shrink-0 mt-0.5 text-start"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleStepCompletion(step.slug);
                  }}
                  title={isCompleted ? 'Mark step as incomplete' : 'Mark step as completed'}
                  aria-label={isCompleted ? 'Mark incomplete' : 'Mark complete'}
                >
                  {isCompleted ? (
                    <FaCheckCircle className="text-success fs-4" />
                  ) : isSelected ? (
                    <span className="badge rounded-pill bg-primary px-2 py-1 fs-6">
                      {idx + 1}
                    </span>
                  ) : (
                    <FaRegCircle className="text-muted fs-5" />
                  )}
                </button>

                {/* Step Details */}
                <div className="flex-grow-1">
                  <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                    <div className="d-flex align-items-center gap-2">
                      <span className="text-muted small fw-semibold">Step {idx + 1}</span>
                      <h4
                        className={`h6 mb-0 fw-bold ${
                          isCompleted ? 'text-decoration-line-through text-muted' : 'text-dark'
                        }`}
                      >
                        {step.name}
                      </h4>
                    </div>

                    {/* Conditional Badge */}
                    {step.isConditional && (
                      <Badge bg="warning" text="dark" className="d-inline-flex align-items-center gap-1 small fw-medium">
                        <FaExclamationTriangle size={11} />
                        Conditional
                      </Badge>
                    )}
                  </div>

                  <p className="text-secondary small mb-2 mt-1">{step.description}</p>

                  {/* Conditional Explanation Callout */}
                  {step.isConditional && step.conditionCriteria && (
                    <div
                      className="p-2 rounded small mb-2"
                      style={{
                        backgroundColor: '#fff8e6',
                        borderLeft: '3px solid #f59e0b',
                        color: '#92400e',
                        fontSize: '0.8rem',
                      }}
                    >
                      <strong>When is this required?</strong> {step.conditionCriteria}
                    </div>
                  )}

                  {/* Quick Action Footer */}
                  <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mt-2 pt-2 border-top border-light">
                    <div className="d-flex align-items-center gap-3">
                      {step.articles && step.articles.length > 0 && (
                        <span className="text-primary small fw-medium d-inline-flex align-items-center gap-1">
                          <FaBookOpen size={12} />
                          {step.articles[0].references && step.articles[0].references.length > 0
                            ? `${step.articles[0].references.length} Official Form(s)`
                            : 'Guidance Available'}
                        </span>
                      )}
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      <Button
                        variant={isCompleted ? 'outline-secondary' : 'outline-success'}
                        size="sm"
                        className="py-0 px-2 fw-medium"
                        style={{ fontSize: '0.75rem' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStepCompletion(step.slug);
                        }}
                      >
                        {isCompleted ? 'Mark Pending' : 'Mark Completed'}
                      </Button>

                      <Button
                        variant={isSelected ? 'primary' : 'light'}
                        size="sm"
                        className="py-0.5 px-2.5 fw-medium d-inline-flex align-items-center gap-1"
                        style={{ fontSize: '0.8rem' }}
                        onClick={() => onSelectStep(step)}
                      >
                        <span>{isSelected ? 'Viewing Guide' : 'Open Guide'}</span>
                        <FaChevronRight size={10} />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
