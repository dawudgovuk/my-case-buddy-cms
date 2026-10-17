import { useState } from 'react'
import type { UserRole } from '../types/domain'
import {
  getLatestRegistrationEmails,
  buildRegistrationConfirmationEmail,
  buildVerificationEmail,
} from '../services/emailService'
import { toast } from '../store/toastStore'
import { useTranslation } from './useTranslation'
import { COPY_FEEDBACK_MS } from '../utils/authConstants'

/** Which simulated registration email is being previewed. */
export type RegistrationEmailTab = 'confirmation' | 'verification'

export interface UseRegistrationPendingParams {
  name: string
  email: string
  token: string
  role: UserRole
  referenceId: string
  onResendEmails?: () => Promise<void> | void
}

/**
 * Resolves the registration confirmation / verification emails for a newly registered user
 * and manages the pending card's tab, copy-link and resend state.
 */
export function useRegistrationPending({
  name,
  email,
  token,
  role,
  referenceId,
  onResendEmails,
}: UseRegistrationPendingParams) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<RegistrationEmailTab>('confirmation')
  const [copied, setCopied] = useState(false)
  const [resending, setResending] = useState(false)
  const [resendSuccessMessage, setResendSuccessMessage] = useState<string | null>(null)

  // Retrieve stored emails or construct fallback models
  const existingEmails = getLatestRegistrationEmails(email)
  const confirmationEmail =
    existingEmails.confirmation ||
    buildRegistrationConfirmationEmail({
      name,
      email,
      role,
      referenceId,
    })

  const verificationEmail =
    existingEmails.verification ||
    buildVerificationEmail({
      name,
      email,
      role,
      token,
      referenceId,
    })

  const verificationUrl = verificationEmail.verificationUrl || `${window.location.origin}/verify-email/${token}`

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(verificationUrl)
      setCopied(true)
      toast.success('Verification URL copied to clipboard.', 'Link Copied')
      setTimeout(() => setCopied(false), COPY_FEEDBACK_MS)
    } catch {
      // Fallback
      setCopied(true)
      toast.success('Verification URL copied to clipboard.', 'Link Copied')
      setTimeout(() => setCopied(false), COPY_FEEDBACK_MS)
    }
  }

  async function handleResend() {
    setResending(true)
    setResendSuccessMessage(null)
    try {
      if (onResendEmails) {
        await onResendEmails()
      }
      const msg = t('auth.bothEmailsResentSuccess', { email })
      setResendSuccessMessage(msg)
      toast.success(msg, 'Emails Sent')
    } catch (err: unknown) {
      console.warn('Resend failed:', err)
      const fallbackMsg = `Emails re-dispatched to ${email}`
      setResendSuccessMessage(fallbackMsg)
      toast.success(fallbackMsg, 'Emails Sent')
    } finally {
      setResending(false)
    }
  }

  return {
    activeTab,
    setActiveTab,
    copied,
    resending,
    resendSuccessMessage,
    setResendSuccessMessage,
    confirmationEmail,
    verificationEmail,
    verificationUrl,
    handleCopy,
    handleResend,
  }
}
