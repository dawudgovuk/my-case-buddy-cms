import { Card, Badge } from 'react-bootstrap'
import CaseReviewSubmitButton from './CaseReviewSubmitButton'
import { useTranslation } from '../../hooks/useTranslation'

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
  const { t } = useTranslation()

  return (
    <Card className="border-0 bg-primary-subtle text-primary-emphasis p-4 rounded-3 mb-4 shadow-sm">
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <Badge bg="primary" className="p-1 px-2">
              {t('caseForm.step3Of3')}
            </Badge>
            <h5 className="fw-bold mb-0 text-dark">
              {isEditMode ? t('caseForm.reviewCaseUpdates') : t('caseForm.reviewAndLaunch')}
            </h5>
          </div>
          <p className="small text-muted mb-0">
            {isEditMode
              ? t('caseForm.reviewEditSubtitle')
              : t('caseForm.reviewCreateSubtitle')}
          </p>
        </div>

        <CaseReviewSubmitButton
          isEditMode={isEditMode}
          isReady={hasTitle}
          isSubmitting={isSubmitting}
          onSubmit={onSubmit}
          size="lg"
          className="fw-semibold px-4 d-flex align-items-center gap-2 shadow-sm text-nowrap"
          title={!hasTitle ? t('caseForm.titleRequiredTooltip') : undefined}
          iconSize={16}
          submittingLabel={isEditMode ? t('caseForm.savingChanges') : t('caseForm.creatingCaseWorkspace')}
          notReadyLabel={t('caseForm.titleRequiredNotice')}
          readyLabel={isEditMode ? t('common.saveChanges') : t('caseForm.createCaseNow')}
        />
      </div>
    </Card>
  )
}
