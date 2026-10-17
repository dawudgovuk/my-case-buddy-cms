import { Button, Spinner } from 'react-bootstrap'
import { FaSave, FaTimes } from 'react-icons/fa'
import { useTranslation } from '../../hooks/useTranslation'
import type { FamilyCase } from '../../types/domain'

export interface CaseFormHeaderProps {
  /** Case being edited; omit when creating a new case. */
  existingCase?: Pick<FamilyCase, 'id'>
  isSubmitting: boolean
  isSaveDisabled: boolean
  onCancel: () => void
  onSave: () => void
}

/**
 * Page header for the case create/edit wizard with cancel and (edit mode only) quick-save actions.
 */
export default function CaseFormHeader({
  existingCase,
  isSubmitting,
  isSaveDisabled,
  onCancel,
  onSave,
}: CaseFormHeaderProps) {
  const { t } = useTranslation()
  const isEditMode = Boolean(existingCase)

  return (
    <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2 mb-3">
      <div>
        <div className="text-primary small fw-bold text-uppercase mb-1" style={{ letterSpacing: '0.5px' }}>
          {isEditMode ? t('caseForm.categoryManage') : t('caseForm.categorySetup')}
        </div>
        <h2 className="fw-bold text-dark mb-0">{isEditMode ? t('caseForm.editTitle') : t('caseForm.createTitle')}</h2>
        <p className="text-secondary small mb-0">
          {existingCase
            ? t('caseForm.managementSubtitle', { id: existingCase.id })
            : t('caseForm.setupSubtitle')}
        </p>
      </div>

      <div className="d-flex align-items-center gap-2">
        <Button
          variant="outline-secondary"
          size="sm"
          className="px-3 d-flex align-items-center gap-1 shadow-xs"
          onClick={onCancel}
        >
          <FaTimes size={12} />
          <span>{t('common.cancel')}</span>
        </Button>

        {isEditMode && (
          <Button
            variant="primary"
            size="sm"
            className="px-3 d-flex align-items-center gap-1 shadow-xs"
            onClick={onSave}
            disabled={isSaveDisabled}
          >
            {isSubmitting ? (
              <>
                <Spinner animation="border" size="sm" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <FaSave size={12} />
                <span>{t('common.saveChanges')}</span>
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
