import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { toast } from '../store/toastStore'
import type { UserRole } from '../types/domain'
import { MIN_PASSWORD_LENGTH, WELCOME_ROUTE, getLandingRoute } from '../utils/authConstants'
import type { AuthMode } from '../utils/authConstants'

/** Editable values of the combined sign-in / sign-up form. */
export interface LoginFormValues {
  email: string
  password: string
  name: string
  selectedRole: UserRole
  firm: string
  registrationNumber: string
}

const INITIAL_VALUES: LoginFormValues = {
  email: '',
  password: '',
  name: '',
  selectedRole: 'LIP',
  firm: '',
  registrationNumber: '',
}

/**
 * State and submit logic for the Login page (Neon Managed Better Auth sign-in / sign-up),
 * including redirect of already-authenticated users. New accounts continue to the welcome page.
 */
export function useLoginForm() {
  const navigate = useNavigate()
  const { user, loginWithNeon, registerWithNeon } = useAuthStore()

  const [authMode, setAuthMode] = useState<AuthMode>('signin')
  const [values, setValues] = useState<LoginFormValues>(INITIAL_VALUES)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      navigate(getLandingRoute(user), { replace: true })
    }
  }, [user, navigate])

  function setField<K extends keyof LoginFormValues>(key: K, value: LoginFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  /** Switch between sign in / sign up and clear any banners. */
  function switchMode(mode: AuthMode) {
    setAuthMode(mode)
    setError(null)
    setSuccessMsg(null)
  }

  function failWith(message: string, title: string, level: 'error' | 'warning') {
    setError(message)
    toast[level](message, title)
    setLoading(false)
  }

  async function handleSignIn() {
    const { email, password } = values
    const result = await loginWithNeon(email, password)
    if (!result.success) {
      failWith(result.error || 'Authentication failed. Please check your credentials.', 'Sign In Failed', 'error')
      return
    }

    const authedUser = result.user
    const welcomeName = authedUser?.name || email.split('@')[0]
    setSuccessMsg('Signed in successfully!')
    toast.success(`Welcome back, ${welcomeName}!`, 'Signed In')
    navigate(getLandingRoute(authedUser), { replace: true })
  }

  async function handleSignUp() {
    const { name, email, password, selectedRole, firm, registrationNumber } = values
    if (!name.trim()) {
      failWith('Please enter your full name', 'Required Field', 'warning')
      return
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      failWith('Password must be at least 8 characters', 'Password Length', 'warning')
      return
    }

    const result = await registerWithNeon({
      name: name.trim(),
      email: email.trim(),
      password,
      role: selectedRole,
      firm: firm.trim() || undefined,
      registrationNumber: registrationNumber.trim() || undefined,
    })

    if (!result.success || !result.user) {
      failWith(result.error || 'Registration failed. Please try a different email.', 'Registration Failed', 'error')
      return
    }

    toast.success(`Account created! We sent a verification link to ${result.user.email}.`, 'Account Created')
    navigate(result.user.isVerified ? getLandingRoute(result.user) : WELCOME_ROUTE, { replace: true })
  }

  async function handleAuthSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)
    setLoading(true)

    try {
      if (authMode === 'signin') {
        await handleSignIn()
      } else {
        await handleSignUp()
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(msg)
      toast.error(msg, 'Authentication Error')
    } finally {
      setLoading(false)
    }
  }

  function toggleShowPassword() {
    setShowPassword(!showPassword)
  }

  return {
    authMode,
    values,
    setField,
    showPassword,
    toggleShowPassword,
    switchMode,
    loading,
    error,
    setError,
    successMsg,
    setSuccessMsg,
    handleAuthSubmit,
    navigate,
  }
}
