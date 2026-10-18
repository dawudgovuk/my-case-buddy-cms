import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { toast } from '../store/toastStore'

export interface UseResendVerificationEmailReturn {
  isResending: boolean
  /** Last success/failure notice to show inline; null until a resend is attempted. */
  notice: string | null
  resend: (email: string) => Promise<void>
}

/**
 * Re-dispatches registration/verification emails and tracks the in-flight state and result notice.
 */
export function useResendVerificationEmail(): UseResendVerificationEmailReturn {
  const { resendRegistrationEmails } = useAuthStore()
  const [isResending, setIsResending] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  async function resend(email: string) {
    setIsResending(true)
    try {
      const res = await resendRegistrationEmails(email)
      if (res.success) {
        const message = 'Verification and welcome emails re-dispatched to ' + email
        setNotice(message)
        toast.success(message, 'Emails Dispatched')
      } else {
        const message = 'Notice: ' + (res.error || 'Failed to dispatch')
        setNotice(message)
        toast.error(message, 'Dispatch Failed')
      }
    } finally {
      setIsResending(false)
    }
  }

  return { isResending, notice, resend }
}
