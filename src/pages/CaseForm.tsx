import { useEffect, useMemo, useState } from 'react'
import { Card, Button, Alert, Spinner } from 'react-bootstrap'
import type { FamilyCase, Party, CaseType, CourtType } from '../types/domain'
import { generateId } from '../services/storage'
import { useCasesStore } from '../store/casesStore'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import CaseMetadataForm, { type CaseMetadataFormValues } from '../components/forms/CaseMetadataForm'
import PartyFormSection from '../components/case/PartyFormSection'
import CaseCreationStepper from '../components/forms/CaseCreationStepper'
import CaseQuickPresets from '../components/forms/CaseQuickPresets'
import CaseReviewSummary from '../components/forms/CaseReviewSummary'
import { FaSave, FaArrowRight, FaArrowLeft, FaTimes, FaExclamationTriangle } from 'react-icons/fa'
import { useTranslation } from '../hooks/useTranslation'

export default function CaseForm() {
  const navigate = useNavigate()
  const { caseId } = useParams()
  const { getById, addOrUpdate } = useCasesStore()
  const { user } = useAuthStore()
  const { t } = useTranslation()

  const existing = useMemo(() => (caseId ? getById(caseId) : undefined), [caseId, getById])
  const [currentStep, setCurrentStep] = useState<number>(0)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [form, setForm] = useState<FamilyCase>(() =>
    existing ?? {
      id: '',
      title: '',
      court: 'Family Court',
      caseType: 'Private Law (Child Arrangements)',
      status: 'Open',
      startedAt: new Date().toISOString().slice(0, 10),
      allocatedJudge: '',
      childrenInvolved: undefined,
      parties: [],
      hearings: [],
      orders: [],
      documents: [],
      notes: [],
      lastUpdatedAt: new Date().toISOString(),
      currentStage: 'application',
    }
  )

  useEffect(() => {
    if (existing) setForm(existing)
  }, [existing])

  function handleMetadataChange<K extends keyof CaseMetadataFormValues>(
    field: K,
    value: CaseMetadataFormValues[K]
  ) {
    setForm((f) => ({
      ...f,
      [field]: value,
    }))
  }

  function handleSelectPreset(preset: { title: string; caseType: CaseType; court: CourtType }) {
    setForm((f) => ({
      ...f,
      title: preset.title,
      caseType: preset.caseType,
      court: preset.court,
    }))
  }

  function handleAddParty(newParty: Party) {
    setForm((f) => ({
      ...f,
      parties: [...f.parties, newParty],
    }))
  }

  function handleUpdateParty(updatedParty: Party) {
    setForm((f) => ({
      ...f,
      parties: f.parties.map((p) => (p.id === updatedParty.id ? updatedParty : p)),
    }))
  }

  function handleRemoveParty(partyId: string) {
    setForm((f) => ({
      ...f,
      parties: f.parties.filter((p) => p.id !== partyId),
    }))
  }

  async function handleSubmit() {
    if (isSubmitting) return
    setIsSubmitting(true)
    setErrorMessage(null)

    const trimmedTitle = form.title.trim()
    const trimmedJudge = form.allocatedJudge?.trim() || undefined
    const id = existing?.id || form.id || generateId('CASE')
    const calculatedChildren = form.parties.filter((p) => p.role === 'Child').length
    const payload: FamilyCase = {
      ...form,
      id,
      title: trimmedTitle,
      allocatedJudge: trimmedJudge,
      startedAt: form.startedAt,
      childrenInvolved: calculatedChildren,
      members: existing?.members ?? (user ? [
        { userId: user.id, role: 'Owner', email: user.email },
        ...(user.email && user.email !== user.id ? [{ userId: user.email, role: 'Owner' as const, email: user.email }] : [])
      ] : []),
      currentStage: existing?.currentStage || 'application',
    }

    try {
      const savedCase = await addOrUpdate(payload)
      navigate(`/cases/${savedCase.id || id}`)
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to save case. Please check your network connection and try again.'
      setErrorMessage(message)
      setIsSubmitting(false)
    }
  }

  const childrenCount = form.parties.filter((p) => p.role === 'Child').length
  const adultPartiesCount = form.parties.filter((p) => p.role !== 'Child').length
  const isDetailsValid = Boolean(form.title.trim())

  return (
    <div className="py-2" style={{ maxWidth: '980px', margin: '0 auto' }}>
      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2 mb-3">
        <div>
          <div className="text-primary small fw-bold text-uppercase mb-1" style={{ letterSpacing: '0.5px' }}>
            {existing ? t('caseForm.categoryManage') : t('caseForm.categorySetup')}
          </div>
          <h2 className="fw-bold text-dark mb-0">{existing ? t('caseForm.editTitle') : t('caseForm.createTitle')}</h2>
          <p className="text-secondary small mb-0">
            {existing
              ? t('caseForm.managementSubtitle', { id: existing.id })
              : t('caseForm.setupSubtitle')}
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <Button
            variant="outline-secondary"
            size="sm"
            className="px-3 d-flex align-items-center gap-1 shadow-xs"
            onClick={() => navigate(existing ? `/cases/${existing.id}` : '/cases')}
          >
            <FaTimes size={12} />
            <span>{t('common.cancel')}</span>
          </Button>

          {existing && (
            <Button
              variant="primary"
              size="sm"
              className="px-3 d-flex align-items-center gap-1 shadow-xs"
              onClick={handleSubmit}
              disabled={!isDetailsValid || isSubmitting}
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

      {/* Action Error Alert */}
      {errorMessage && (
        <Alert
          variant="danger"
          dismissible
          onClose={() => setErrorMessage(null)}
          className="d-flex align-items-center gap-2 mb-3 shadow-sm rounded-3"
        >
          <FaExclamationTriangle className="text-danger flex-shrink-0" />
          <div className="small">
            <strong>Action failed:</strong> {errorMessage}
          </div>
        </Alert>
      )}

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

          <Card className="p-3 border shadow-sm bg-white rounded-3">
            <div className="d-flex flex-column-reverse flex-sm-row justify-content-between align-items-stretch align-items-sm-center gap-2">
              <Button
                variant="outline-secondary"
                onClick={() => navigate(existing ? `/cases/${existing.id}` : '/')}
              >
                {t('common.cancel')}
              </Button>
              <Button
                variant="primary"
                className="px-4 fw-semibold d-flex align-items-center justify-content-center gap-2"
                onClick={() => setCurrentStep(1)}
                disabled={!isDetailsValid}
              >
                <span>{t('caseForm.continueToParties')}</span>
                <FaArrowRight size={12} />
              </Button>
            </div>
          </Card>
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

          <Card className="p-3 border shadow-sm bg-white rounded-3">
            <div className="d-flex flex-column-reverse flex-sm-row justify-content-between align-items-stretch align-items-sm-center gap-2">
              <Button
                variant="outline-secondary"
                className="d-flex align-items-center justify-content-center gap-2"
                onClick={() => setCurrentStep(0)}
              >
                <FaArrowLeft size={12} />
                <span>{t('caseForm.backToDetails')}</span>
              </Button>
              <Button
                variant="primary"
                className="px-4 fw-semibold d-flex align-items-center justify-content-center gap-2"
                onClick={() => setCurrentStep(2)}
              >
                <span>{t('caseForm.proceedToReview')}</span>
                <FaArrowRight size={12} />
              </Button>
            </div>
          </Card>
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
          onCancel={() => navigate(existing ? `/cases/${existing.id}` : '/')}
        />
      )}
    </div>
  )
}
