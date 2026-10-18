import { Alert, Button } from 'react-bootstrap'
import { FaArrowLeft, FaExclamationTriangle } from 'react-icons/fa'

export interface CaseReviewMissingTitleAlertProps {
  onGoToDetails: () => void
}

/**
 * Prominent alert shown on the review step when the case title is missing.
 */
export default function CaseReviewMissingTitleAlert({ onGoToDetails }: CaseReviewMissingTitleAlertProps) {
  return (
    <Alert
      variant="danger"
      className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 p-3 rounded-3 shadow-sm mb-4 border-danger"
    >
      <div className="d-flex align-items-center gap-3">
        <div
          className="bg-danger text-white rounded-circle d-flex align-items-center justify-content-center p-2 flex-shrink-0"
          style={{ width: 40, height: 40 }}
        >
          <FaExclamationTriangle size={18} />
        </div>
        <div>
          <div className="fw-bold text-danger fs-6">Issue in Step 1: Case Title is Missing</div>
          <div className="small text-secondary">
            A case title is required before this case can be created. Click the button to return to Step 1 and provide a title.
          </div>
        </div>
      </div>
      <Button
        variant="danger"
        size="sm"
        className="fw-bold px-3 py-2 text-nowrap d-flex align-items-center justify-content-center gap-2 shadow-xs align-self-start align-self-sm-center"
        onClick={onGoToDetails}
      >
        <FaArrowLeft size={12} />
        <span>Go Back to Step 1</span>
      </Button>
    </Alert>
  )
}
