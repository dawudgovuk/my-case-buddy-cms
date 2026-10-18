import { Button, Spinner } from 'react-bootstrap'
import { FaRocket, FaSave, FaExclamationTriangle } from 'react-icons/fa'

export interface CaseReviewSubmitButtonProps {
  isEditMode: boolean
  isReady: boolean
  isSubmitting: boolean
  onSubmit: () => void
  className: string
  iconSize: number
  size?: 'sm' | 'lg'
  title?: string
  submittingLabel: string
  notReadyLabel: string
  readyLabel: string
}

/**
 * Submit button for the case review step with submitting, not-ready and ready visual states.
 */
export default function CaseReviewSubmitButton({
  isEditMode,
  isReady,
  isSubmitting,
  onSubmit,
  className,
  iconSize,
  size,
  title,
  submittingLabel,
  notReadyLabel,
  readyLabel,
}: CaseReviewSubmitButtonProps) {
  return (
    <Button
      variant={isReady ? 'primary' : 'secondary'}
      size={size}
      onClick={onSubmit}
      disabled={!isReady || isSubmitting}
      className={className}
      title={title}
    >
      {isSubmitting ? (
        <>
          <Spinner animation="border" size="sm" />
          <span>{submittingLabel}</span>
        </>
      ) : !isReady ? (
        <>
          <FaExclamationTriangle size={iconSize} className="text-warning" />
          <span>{notReadyLabel}</span>
        </>
      ) : (
        <>
          {isEditMode ? <FaSave size={iconSize} /> : <FaRocket size={iconSize} />}
          <span>{readyLabel}</span>
        </>
      )}
    </Button>
  )
}
