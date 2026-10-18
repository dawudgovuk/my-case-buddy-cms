import { useState } from 'react'
import type { FamilyCase } from '../types/domain'
import { useCasesStore } from '../store/casesStore'
import { useAuthStore } from '../store/authStore'
import { toast } from '../store/toastStore'
import { withAppendedNote } from '../utils/caseNotes'
import type { NoteCitation } from '../utils/legalKnowledgeBase'

export interface UseCitationActionsReturn {
  /** Id of the citation most recently copied (cleared after 2.5s). */
  copiedId: string | null
  /** Success message after a citation is inserted into notes (cleared after 3.5s). */
  addedNoteSuccess: string | null
  copyToClipboard: (text: string, id: string) => void
  insertCitationToNotes: (citation: NoteCitation) => void
}

/**
 * Copy-to-clipboard and insert-into-case-notes actions for legal citations,
 * with transient feedback state.
 */
export function useCitationActions(caseData: FamilyCase): UseCitationActionsReturn {
  const store = useCasesStore()
  const { user } = useAuthStore()
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [addedNoteSuccess, setAddedNoteSuccess] = useState<string | null>(null)

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    toast.success('Legal authority citation copied to clipboard.', 'Citation Copied')
    setTimeout(() => setCopiedId(null), 2500)
  }

  const insertCitationToNotes = ({ title: citationTitle, content: citationContent }: NoteCitation) => {
    const noteText = `[Legal Citation / Authority Reference]\nTitle: ${citationTitle}\n\n${citationContent}\n\nCase: ${caseData.title || caseData.id} | Inserted by: ${user?.name || 'Supporter'}`
    const updated = withAppendedNote(caseData, user?.name || 'Legal Supporter', noteText)
    store.addOrUpdate(updated)
    const successMsg = `Citation "${citationTitle}" added directly to case notes!`
    setAddedNoteSuccess(successMsg)
    toast.success(successMsg, 'Citation Saved')
    setTimeout(() => setAddedNoteSuccess(null), 3500)
  }

  return { copiedId, addedNoteSuccess, copyToClipboard, insertCitationToNotes }
}
