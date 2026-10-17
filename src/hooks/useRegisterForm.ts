import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { toast } from '../store/toastStore'
import type { UserRole } from '../types/domain'
import { useTranslation } from './useTranslation'
import { MIN_PASSWORD_LENGTH, getPostAuthRoute } from '../utils/authConstants'
import type { PendingVerification } from '../utils/authConstants'

/** Editable values of the role-specific registration form. */
export interface RegisterFormValues {
  name: string
  email: string
  password: string
  firm: string
  registrationNumber: string
}

const INITIAL_VALUES: RegisterFormValues = {
  name: '',
  email: '',
  password: '',
  firm: '',
  registrationNumber: '',
}

/**
 * State and submit logic for the role-specific Register page.
 */
export function useRegisterForm() {
  const navigate = useNavigate()
  const { registerWithNeon, resendRegistrationEmails } = useAuthStore()
  const { t } = useTranslation()

  const [values, setValues] = useState<RegisterFormValues>(INITIAL_VALUES)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [registeredPendingVerification, setRegisteredPendingVerification] =
    useState<PendingVerification | null>(null)

  function setField<K extends keyof RegisterFormValues>(key: K, value: RegisterFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  function toggleShowPassword() {
    setShowPassword(!showPassword)
  }

  async function handleSubmit(e: FormEvent, userRole: UserRole) {
    e.preventDefault()
    setError('')
    const { name, email, password, firm, registrationNumber } = values

    if (!name.trim() || !email.trim()) {
      const err = t('auth.nameAndEmailRequired')
      setError(err)
      toast.warning(err, 'Required Fields')
      return
    }

    if (!password || password.length < MIN_PASSWORD_LENGTH) {
      const err = 'Password must be at least 8 characters'
      setError(err)
      toast.warning(err, 'Password Length')
      return
    }

    setLoading(true)

    try {
      const result = await registerWithNeon({
        name: name.trim(),
        email: email.trim(),
        password,
        role: userRole,
        firm: firm.trim() || undefined,
        registrationNumber: registrationNumber.trim() || undefined,
      })

      if (!result.success || !result.user) {
        const err = result.error || 'Registration failed. Please try again.'
        setError(err)
        toast.error(err, 'Registration Failed')
        setLoading(false)
        return
      }

      if (result.user.verificationToken) {
        toast.success(
          `Registration submitted! Verification link dispatched to ${result.user.email}.`,
          'Check Your Inbox'
        )
        setRegisteredPendingVerification({
          email: result.user.email,
          token: result.user.verificationToken,
          name: result.user.name,
        })
      } else {
        toast.success(`Welcome to My Case Buddy, ${result.user.name}!`, 'Account Created')
        navigate(getPostAuthRoute(userRole))
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(msg)
      toast.error(msg, 'Registration Error')
    } finally {
      setLoading(false)
    }
  }

  return {
    values,
    setField,
    showPassword,
    toggleShowPassword,
    error,
    setError,
    loading,
    registeredPendingVerification,
    resendRegistrationEmails,
    handleSubmit,
    navigate,
  }
}
