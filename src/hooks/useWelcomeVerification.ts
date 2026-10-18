import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { toast } from '../store/toastStore'
import { getLandingRoute } from '../utils/authConstants'
import { useTranslation } from './useTranslation'

export interface WelcomeNotice {
  variant: 'success' | 'warning' | 'danger'
  text: string
}

/**
 * State and actions for the welcome / verify-email page: checking whether the email has been
 * verified, (re)sending the verification email, and switching account.
 */
export function useWelcomeVerification() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user, logout, refreshUsers, resendRegistrationEmails } = useAuthStore()
  const [checking, setChecking] = useState(false)
  const [sending, setSending] = useState(false)
  const [notice, setNotice] = useState<WelcomeNotice | null>(null)

  // The email link may be opened in another tab of this browser: pick up the change
  // when storage changes or when the user comes back to this tab.
  useEffect(() => {
    const sync = () => refreshUsers()
    window.addEventListener('storage', sync)
    window.addEventListener('focus', sync)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener('focus', sync)
    }
  }, [refreshUsers])

  function checkVerified() {
    setChecking(true)
    refreshUsers()
    const current = useAuthStore.getState().user
    setChecking(false)
    if (current?.isVerified) {
      toast.success(t('welcome.verifiedNow'), t('verifyEmail.successTitle'))
      navigate(getLandingRoute(current), { replace: true })
    } else {
      setNotice({ variant: 'warning', text: t('welcome.notVerifiedYet') })
    }
  }

  async function sendVerificationEmail() {
    if (!user) return
    setSending(true)
    setNotice(null)
    const result = await resendRegistrationEmails(user.email)
    setSending(false)
    if (result.success) {
      const text = t('welcome.resent', { email: user.email })
      setNotice({ variant: 'success', text })
      toast.success(text, t('welcome.checkInboxTitle'))
    } else {
      setNotice({ variant: 'danger', text: t('welcome.sendFailed') })
    }
  }

  async function switchAccount() {
    await logout()
    navigate('/login', { replace: true })
  }

  return {
    user,
    checking,
    sending,
    notice,
    dismissNotice: () => setNotice(null),
    checkVerified,
    sendVerificationEmail,
    switchAccount,
    openVerificationLink: (token: string) => navigate(`/verify-email/${token}`),
  }
}
