import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { FamilyCase, Party, CaseType, CourtType } from '../types/domain'
import { generateId } from '../services/storage'
import { useCasesStore } from '../store/casesStore'
import { useAuthStore } from '../store/authStore'
import { toast } from '../store/toastStore'
import type { CaseMetadataFormValues } from '../components/forms/CaseMetadataForm'
import { buildInitialCaseMembers, createEmptyCase } from '../utils/caseFormUtils'
import { countChildren } from '../utils/partyUtils'
import { validateCaseNumber, formatCaseNumberInput } from '../utils/caseNumberUtils'

export interface CasePreset {
  title: string
  caseType: CaseType
  court: CourtType
}

export interface UseCaseFormReturn {
  existing: FamilyCase | undefined
  form: FamilyCase
  currentStep: number
  setCurrentStep: (step: number) => void
  isSubmitting: boolean
  errorMessage: string | null
  clearError: () => void
  handleMetadataChange: <K extends keyof CaseMetadataFormValues>(field: K, value: CaseMetadataFormValues[K]) => void
  handleSelectPreset: (preset: CasePreset) => void
  handleAddParty: (newParty: Party) => void
  handleUpdateParty: (updatedParty: Party) => void
  handleRemoveParty: (partyId: string) => void
  handleSubmit: () => Promise<void>
}

/**
 * Owns the create/edit case wizard state: form draft, active step, party edits,
 * validation and persistence (with toasts and navigation on success).
 */
export function useCaseForm(caseId: string | undefined): UseCaseFormReturn {
  const navigate = useNavigate()
  const { getById, addOrUpdate } = useCasesStore()
  const { user } = useAuthStore()

  const existing = useMemo(() => (caseId ? getById(caseId) : undefined), [caseId, getById])
  const [currentStep, setCurrentStep] = useState<number>(0)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [form, setForm] = useState<FamilyCase>(() => existing ?? createEmptyCase())

  useEffect(() => {
    if (existing) setForm(existing)
  }, [existing])

  function handleMetadataChange<K extends keyof CaseMetadataFormValues>(
    field: K,
    value: CaseMetadataFormValues[K]
  ) {
    setForm((f) => {
      const next = { ...f, [field]: value }
      if (field === 'id') {
        const str = typeof value === 'string' ? value.trim() : ''
        next.id = str
        next.caseNumber =
          str && !str.startsWith('CASE_') && !str.startsWith('case_')
            ? formatCaseNumberInput(str)
            : undefined
      }
      return next
    })
  }

  function handleSelectPreset(preset: CasePreset) {
    setForm((f) => ({
      ...f,
      title: preset.title,
      caseType: preset.caseType,
      court: preset.court,
    }))
    toast.info(`Applied template: "${preset.title}"`, 'Preset Selected')
  }

  function handleAddParty(newParty: Party) {
    setForm((f) => ({
      ...f,
      parties: [...f.parties, newParty],
    }))
    toast.success(`Added ${newParty.firstName} ${newParty.lastName} (${newParty.role}) to case.`, 'Party Added')
  }

  function handleUpdateParty(updatedParty: Party) {
    setForm((f) => ({
      ...f,
      parties: f.parties.map((p) => (p.id === updatedParty.id ? updatedParty : p)),
    }))
    toast.success(`Updated party ${updatedParty.firstName} ${updatedParty.lastName}.`, 'Party Updated')
  }

  function handleRemoveParty(partyId: string) {
    const p = form.parties.find((item) => item.id === partyId)
    setForm((f) => ({
      ...f,
      parties: f.parties.filter((p) => p.id !== partyId),
    }))
    toast.info(`Removed ${p ? `${p.firstName} ${p.lastName}` : 'party'} from form.`, 'Party Removed')
  }

  async function handleSubmit() {
    if (isSubmitting) return

    const trimmedTitle = form.title.trim()
    if (!trimmedTitle) {
      toast.warning('Please enter a case title before saving.', 'Title Required')
      return
    }

    const rawNumber = form.caseNumber || form.id
    const caseIdValidation = validateCaseNumber(rawNumber)
    if (!caseIdValidation.isValid) {
      toast.warning(
        caseIdValidation.error || 'Please enter a valid 16-digit Court Case Number or leave blank for auto-generated ID.',
        'Invalid Case Number'
      )
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    const trimmedJudge = form.allocatedJudge?.trim() || undefined
    const cleanId = rawNumber ? formatCaseNumberInput(rawNumber) : undefined
    const isOfficialCaseNumber = Boolean(
      cleanId && !cleanId.startsWith('CASE_') && !cleanId.startsWith('case_')
    )
    const finalCaseNumber = isOfficialCaseNumber ? cleanId : undefined
    const finalId = isOfficialCaseNumber
      ? cleanId!
      : existing?.id || cleanId || generateId('CASE')

    const previousId = existing?.id && existing.id !== finalId ? existing.id : undefined

    const payload: FamilyCase = {
      ...form,
      id: finalId,
      documentId: existing?.documentId || form.documentId,
      caseNumber: finalCaseNumber,
      title: trimmedTitle,
      allocatedJudge: trimmedJudge,
      startedAt: form.startedAt,
      childrenInvolved: countChildren(form.parties),
      members: existing?.members ?? buildInitialCaseMembers(user),
      currentStage: existing?.currentStage || 'application',
    }

    try {
      const savedCase = await addOrUpdate(payload, previousId)
      if (existing) {
        toast.success(`Changes to "${savedCase.title || trimmedTitle}" saved successfully.`, 'Case Updated')
      } else {
        toast.success(`Case "${savedCase.title || trimmedTitle}" created successfully.`, 'Case Created')
      }
      navigate(`/cases/${encodeURIComponent(savedCase.id || finalId)}`)
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to save case. Please check your network connection and try again.'
      setErrorMessage(message)
      toast.error(message, 'Failed to Save Case')
      setIsSubmitting(false)
    }
  }

  return {
    existing,
    form,
    currentStep,
    setCurrentStep,
    isSubmitting,
    errorMessage,
    clearError: () => setErrorMessage(null),
    handleMetadataChange,
    handleSelectPreset,
    handleAddParty,
    handleUpdateParty,
    handleRemoveParty,
    handleSubmit,
  }
}
