import { Badge, Button } from 'react-bootstrap';
import {
  FaCheckCircle,
  FaRegCircle,
  FaExclamationTriangle,
  FaBookOpen,
} from 'react-icons/fa';
import type { GuidanceStep } from '../../../types/guidance';

export interface TrackerStepItemProps {
  step: GuidanceStep;
  index: number;
  isCompleted: boolean;
  onToggle: () => void;
  onOpenGuide: () => void;
}

export default function TrackerStepItem({
  step,
  index,
  isCompleted,
  onToggle,
  onOpenGuide,
}: TrackerStepItemProps) {
  return (
    <div
      className={`p-2.5 rounded border transition-all d-flex align-items-start justify-content-between gap-3 ${
        isCompleted
          ? 'bg-light border-success border-opacity-25'
          : 'bg-white border-secondary border-opacity-20 hover-shadow-xs'
      }`}
    >
      <div className="d-flex align-items-start gap-2.5">
        <button
          type="button"
          className="btn p-0 border-0 flex-shrink-0 mt-0.5"
          onClick={onToggle}
          title={isCompleted ? 'Mark incomplete' : 'Mark completed'}
          aria-label={isCompleted ? 'Mark incomplete' : 'Mark completed'}
        >
          {isCompleted ? (
            <FaCheckCircle className="text-success fs-5" />
          ) : (
            <FaRegCircle className="text-muted fs-5" />
          )}
        </button>

        <div>
          <div className="d-flex flex-wrap align-items-center gap-2">
            <span className="fw-semibold text-secondary small">Step {index + 1}:</span>
            <span
              className={`fw-semibold small ${
                isCompleted ? 'text-decoration-line-through text-muted' : 'text-dark'
              }`}
            >
              {step.name}
            </span>

            {step.isConditional && (
              <Badge
                bg="warning"
                text="dark"
                className="d-inline-flex align-items-center gap-1"
                style={{ fontSize: '0.68rem' }}
              >
                <FaExclamationTriangle size={10} />
                Conditional
              </Badge>
            )}
          </div>

          {step.description && (
            <div className="text-muted small mt-0.5" style={{ fontSize: '0.8rem' }}>
              {step.description}
            </div>
          )}

          {step.isConditional && step.conditionCriteria && (
            <div
              className="mt-1.5 p-1.5 rounded small"
              style={{
                backgroundColor: '#fffbeb',
                borderLeft: '3px solid #f59e0b',
                color: '#92400e',
                fontSize: '0.75rem',
              }}
            >
              <strong>Criteria:</strong> {step.conditionCriteria}
            </div>
          )}
        </div>
      </div>

      {/* Action to view guide & forms */}
      <div className="d-flex align-items-center gap-2 flex-shrink-0">
        {step.articles && step.articles.length > 0 && (
          <Button
            variant="light"
            size="sm"
            onClick={onOpenGuide}
            className="d-inline-flex align-items-center gap-1 border text-primary fw-medium py-1 px-2.5"
            style={{ fontSize: '0.78rem' }}
          >
            <FaBookOpen size={11} />
            <span>Guide & Forms</span>
          </Button>
        )}
      </div>
    </div>
  );
}
