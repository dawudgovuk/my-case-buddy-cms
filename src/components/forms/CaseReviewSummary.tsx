import { Row, Col, Button } from 'react-bootstrap'
import type { FamilyCase } from '../../types/domain'
import { groupPartiesByRole } from '../../utils/caseFormUtils'
import { useTranslation } from '../../hooks/useTranslation'
import CaseReadinessChecklist from './CaseReadinessChecklist'
import CaseReviewBanner from './CaseReviewBanner'
import CaseReviewMissingTitleAlert from './CaseReviewMissingTitleAlert'
import CaseIdentificationReviewCard from './CaseIdentificationReviewCard'
import CasePartiesReviewCard from './CasePartiesReviewCard'
import CaseReviewSubmitButton from './CaseReviewSubmitButton'

export interface CaseReviewSummaryProps {
  caseData: FamilyCase
  onEditStep: (step: number) => void
  isEditMode: boolean
  isSubmitting?: boolean
  onSubmit: () => void
  onCancel: () => void
  className?: string
}

/**
 * Final step of the case wizard: summarises details and parties and offers the submit action.
 */
export default function CaseReviewSummary({
  caseData,
  onEditStep,
  isEditMode,
  isSubmitting = false,
  onSubmit,
  onCancel,
  className = '',
}: CaseReviewSummaryProps) {
  const { t } = useTranslation()
  const partiesByRole = groupPartiesByRole(caseData.parties)
  const hasTitle = Boolean(caseData.title.trim())
  const allReady = hasTitle

  return (
    <div className={className}>
      {/* Top Banner */}
      <CaseReviewBanner
        isEditMode={isEditMode}
        hasTitle={hasTitle}
        isSubmitting={isSubmitting}
        onSubmit={onSubmit}
      />

      {/* Prominent Missing Title Error Alert */}
      {!hasTitle && <CaseReviewMissingTitleAlert onGoToDetails={() => onEditStep(0)} />}

      {/* Extracted Modular Readiness Checklist with onFixTitle callback */}
      <CaseReadinessChecklist
        hasTitle={hasTitle}
        court={caseData.court}
        applicantsCount={partiesByRole.applicants.length}
        respondentsCount={partiesByRole.respondents.length}
        onFixTitle={() => onEditStep(0)}
      />

      {/* Review Section Cards */}
      <Row className="g-4 mb-4">
        {/* Card 1: Case Details */}
        <Col md={6}>
          <CaseIdentificationReviewCard
            caseData={caseData}
            hasTitle={hasTitle}
            onEditDetails={() => onEditStep(0)}
          />
        </Col>

        {/* Card 2: People Involved */}
        <Col md={6}>
          <CasePartiesReviewCard
            totalParties={caseData.parties.length}
            partiesByRole={partiesByRole}
            onEditParties={() => onEditStep(1)}
          />
        </Col>
      </Row>

      {/* Bottom Actions */}
      <div className="d-flex justify-content-between align-items-center pt-3 border-top">
        <Button variant="outline-secondary" className="px-4" onClick={() => onEditStep(1)}>
          ← {t('caseForm.stepParties')}
        </Button>
        <div className="d-flex gap-2">
          <Button variant="outline-danger" className="px-3" onClick={onCancel}>
            {t('common.cancel')}
          </Button>
          <CaseReviewSubmitButton
            isEditMode={isEditMode}
            isReady={allReady}
            isSubmitting={isSubmitting}
            onSubmit={onSubmit}
            className="px-4 fw-semibold d-flex align-items-center gap-2 shadow-sm"
            iconSize={14}
            submittingLabel={isEditMode ? t('profile.saving') : t('caseForm.submitCreating')}
            notReadyLabel="Title Missing (Fix in Step 1)"
            readyLabel={isEditMode ? t('common.saveChanges') : t('caseForm.confirmAndSave')}
          />
        </div>
      </div>
    </div>
  )
}
