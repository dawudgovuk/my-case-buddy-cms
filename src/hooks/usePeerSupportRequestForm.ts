import { useState, useEffect, useMemo } from 'react'
import type { FamilyCase, User } from '../types/domain'
import { toast } from '../store/toastStore'
import {
  appendPresetToNote,
  buildInitialPresetNote,
  getCaseSelectionKey,
} from '../utils/peerSupportRequestUtils'

export interface UsePeerSupportRequestFormOptions {
  show: boolean
  cases: FamilyCase[]
  targetProfessional?: User | null
  onSendRequest: (caseId: string, note: string, targetProfessional?: User | null) => Promise<void> | void
}

export interface UsePeerSupportRequestFormResult {
  selectedCaseId: string
  setSelectedCaseId: (caseId: string) => void
  selectedCase: FamilyCase | null
  note: string
  setNote: (note: string) => void
  internalSubmitting: boolean
  modalError: string | null
  clearModalError: () => void
  handleSend: () => Promise<void>
  handleAddPreset: (presetLabel: string) => void
}

/**
 * Form state for the peer support request modal: selected case, request note,
 * preset topic insertion, submission and error handling.
 */
export function usePeerSupportRequestForm({
  show,
  cases,
  targetProfessional,
  onSendRequest,
}: UsePeerSupportRequestFormOptions): UsePeerSupportRequestFormResult {
  const [selectedCaseId, setSelectedCaseId] = useState<string>('')
  const [note, setNote] = useState<string>('')
  const [internalSubmitting, setInternalSubmitting] = useState<boolean>(false)
  const [modalError, setModalError] = useState<string | null>(null)

  useEffect(() => {
    if (show && cases.length > 0) {
      setSelectedCaseId(getCaseSelectionKey(cases[0]))
      setNote('')
      setModalError(null)
    }
  }, [show, cases])

  const selectedCase = useMemo(() => {
    if (!selectedCaseId) return cases[0] || null
    return (
      cases.find((c) => getCaseSelectionKey(c) === selectedCaseId) ||
      cases[0] ||
      null
    )
  }, [cases, selectedCaseId])

  async function handleSend() {
    if (!selectedCaseId) return
    setInternalSubmitting(true)
    setModalError(null)
    try {
      await onSendRequest(selectedCaseId, note.trim(), targetProfessional)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send peer support request'
      setModalError(msg)
      toast.error(msg, 'Request Failed')
    } finally {
      setInternalSubmitting(false)
    }
  }

  function handleAddPreset(presetLabel: string) {
    if (!note.trim()) {
      setNote(buildInitialPresetNote(presetLabel))
    } else if (!note.includes(presetLabel)) {
      setNote((prev) => appendPresetToNote(prev, presetLabel))
    }
  }

  return {
    selectedCaseId,
    setSelectedCaseId,
    selectedCase,
    note,
    setNote,
    internalSubmitting,
    modalError,
    clearModalError: () => setModalError(null),
    handleSend,
    handleAddPreset,
  }
}
