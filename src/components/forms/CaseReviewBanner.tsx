import { Card, Badge } from 'react-bootstrap'
import CaseReviewSubmitButton from './CaseReviewSubmitButton'

export interface CaseReviewBannerProps {
  isEditMode: boolean
  hasTitle: boolean
  isSubmitting: boolean
  onSubmit: () => void
}

/**
 * Top banner of the case review step: step badge, heading, guidance and primary submit action.
 */
export default function CaseReviewBanner({ isEditMode, hasTitle, isSubmitting, onSubmit }: CaseReviewBannerProps) {
  return (
    <Card className="border-0 bg-primary-subtle text-primary-emphasis p-4 rounded-3 mb-4 shadow-sm">
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <Badge bg="primary" className="p-1 px-2">
              Step 3 of 3
            </Badge>
            <h5 className="fw-bold mb-0 text-dark">
              {isEditMode ? 'Review Case Updates' : 'Review & Launch Case Proceedings'}
            </h5>
          </div>
          <p className="small text-muted mb-0">
            {isEditMode
              ? 'Review the modified details below before saving your changes.'
              : 'Confirm proceedings details, parties, and safeguards before creating your case workspace.'}
          </p>
        </div>

        <CaseReviewSubmitButton
          isEditMode={isEditMode}
          isReady={hasTitle}
          isSubmitting={isSubmitting}
          onSubmit={onSubmit}
          size="lg"
          className="fw-semibold px-4 d-flex align-items-center gap-2 shadow-sm text-nowrap"
          title={!hasTitle ? 'Please enter Case Title in Step 1 before creating the case' : undefined}
          iconSize={16}
          submittingLabel={isEditMode ? 'Saving Changes...' : 'Creating Case Workspace...'}
          notReadyLabel="Title Required (Step 1)"
          readyLabel={isEditMode ? 'Save Changes' : 'Create Case Now'}
        />
      </div>
    </Card>
  )
}
