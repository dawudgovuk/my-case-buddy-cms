import { useNavigate, useParams } from 'react-router-dom'
import { FaArrowLeft } from 'react-icons/fa'
import CaseMetadataForm from '../components/forms/CaseMetadataForm'
import PartyFormSection from '../components/case/PartyFormSection'
import CaseCreationStepper from '../components/forms/CaseCreationStepper'
import CaseQuickPresets from '../components/forms/CaseQuickPresets'
import CaseReviewSummary from '../components/forms/CaseReviewSummary'
import CaseFormHeader from '../components/forms/CaseFormHeader'
import CaseFormErrorAlert from '../components/forms/CaseFormErrorAlert'
import CaseFormStepFooter from '../components/forms/CaseFormStepFooter'
import { useCaseForm } from '../hooks/useCaseForm'
import { useTranslation } from '../hooks/useTranslation'
import { countAdults, countChildren } from '../utils/partyUtils'

export default function CaseForm() {
  const navigate = useNavigate()
  const { caseId } = useParams()
  const {
    existing,
    form,
    currentStep,
    setCurrentStep,
    isSubmitting,
    errorMessage,
    clearError,
    handleMetadataChange,
    handleSelectPreset,
    handleAddParty,
    handleUpdateParty,
    handleRemoveParty,
    handleSubmit,
  } = useCaseForm(caseId)
  const { t } = useTranslation()

  const childrenCount = countChildren(form.parties)
  const adultPartiesCount = countAdults(form.parties)
  const isDetailsValid = Boolean(form.title.trim())
  const exitToCaseOrHome = () => navigate(existing ? `/cases/${existing.id}` : '/')

  return (
    <div className="py-2" style={{ maxWidth: '980px', margin: '0 auto' }}>
      {/* Page Header */}
      <CaseFormHeader
        existingCase={existing}
        isSubmitting={isSubmitting}
        isSaveDisabled={!isDetailsValid || isSubmitting}
        onCancel={() => navigate(existing ? `/cases/${existing.id}` : '/cases')}
        onSave={handleSubmit}
      />

      {/* Action Error Alert */}
      {errorMessage && <CaseFormErrorAlert message={errorMessage} onDismiss={clearError} />}

      {/* Guided 3-Step Interactive Stepper */}
      <CaseCreationStepper
        currentStep={currentStep}
        onSelectStep={(step) => setCurrentStep(step)}
        status={{
          detailsValid: isDetailsValid,
          titleMissing: !isDetailsValid,
          partiesCount: adultPartiesCount,
          childrenCount,
        }}
      />

      {/* Step 0: Case Details */}
      {currentStep === 0 && (
        <div>
          {!existing && (
            <CaseQuickPresets
              onSelectPreset={handleSelectPreset}
              currentTitle={form.title}
            />
          )}

          <CaseMetadataForm
            values={{
              title: form.title,
              id: form.id,
              court: form.court,
              caseType: form.caseType,
              status: form.status,
              startedAt: form.startedAt,
              allocatedJudge: form.allocatedJudge,
            }}
            onChange={handleMetadataChange}
            childrenCount={childrenCount}
            className="mb-4"
          />

          <CaseFormStepFooter
            backContent={t('common.cancel')}
            onBack={exitToCaseOrHome}
            nextLabel={t('caseForm.continueToParties')}
            nextDisabled={!isDetailsValid}
            onNext={() => setCurrentStep(1)}
          />
        </div>
      )}

      {/* Step 1: Parties & Children */}
      {currentStep === 1 && (
        <div>
          {/* Adult Parties Section */}
          <PartyFormSection
            parties={form.parties}
            onAddParty={handleAddParty}
            onUpdateParty={handleUpdateParty}
            onRemoveParty={handleRemoveParty}
            isChildSection={false}
          />

          {/* Children Section */}
          <PartyFormSection
            parties={form.parties}
            onAddParty={handleAddParty}
            onUpdateParty={handleUpdateParty}
            onRemoveParty={handleRemoveParty}
            isChildSection={true}
          />

          <CaseFormStepFooter
            backContent={
              <>
                <FaArrowLeft size={12} />
                <span>{t('caseForm.backToDetails')}</span>
              </>
            }
            backClassName="d-flex align-items-center justify-content-center gap-2"
            onBack={() => setCurrentStep(0)}
            nextLabel={t('caseForm.proceedToReview')}
            onNext={() => setCurrentStep(2)}
          />
        </div>
      )}

      {/* Step 2: Review & Confirmation */}
      {currentStep === 2 && (
        <CaseReviewSummary
          caseData={form}
          onEditStep={(step) => setCurrentStep(step)}
          isEditMode={Boolean(existing)}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          onCancel={exitToCaseOrHome}
        />
      )}
    </div>
  )
}
