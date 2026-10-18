import { useState } from 'react'
import type { UserRole } from '../types/domain'
import {
  getLatestRegistrationEmails,
  buildRegistrationConfirmationEmail,
  buildVerificationEmail,
} from '../services/emailService'
import { toast } from '../store/toastStore'
import { COPY_FEEDBACK_MS } from '../utils/authConstants'

/** Which registration email is being previewed. */
export type RegistrationEmailTab = 'confirmation' | 'verification'

export interface UseRegistrationEmailPreviewParams {
  name: string
  email: string
  token: string
  role: UserRole
  referenceId: string
  initialTab?: RegistrationEmailTab
}

/**
 * Resolves the registration confirmation / verification emails sent to a user (stored copies first,
 * rebuilt otherwise) and manages the preview's tab and copy-link state.
 */
export function useRegistrationEmailPreview({
  name,
  email,
  token,
  role,
  referenceId,
  initialTab = 'confirmation',
}: UseRegistrationEmailPreviewParams) {
  const [activeTab, setActiveTab] = useState<RegistrationEmailTab>(initialTab)
  const [copied, setCopied] = useState(false)

  const existingEmails = getLatestRegistrationEmails(email)
  const confirmationEmail =
    existingEmails.confirmation || buildRegistrationConfirmationEmail({ name, email, role, referenceId })
  const verificationEmail =
    existingEmails.verification || buildVerificationEmail({ name, email, role, token, referenceId })
  const verificationUrl = verificationEmail.verificationUrl || `${window.location.origin}/verify-email/${token}`

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(verificationUrl)
      setCopied(true)
      toast.success('Verification URL copied to clipboard.', 'Link Copied')
      setTimeout(() => setCopied(false), COPY_FEEDBACK_MS)
    } catch {
      toast.error('Could not copy the link. Select it and copy it manually.', 'Copy Failed')
    }
  }

  return {
    activeTab,
    setActiveTab,
    copied,
    confirmationEmail,
    verificationEmail,
    verificationUrl,
    handleCopy,
  }
}
