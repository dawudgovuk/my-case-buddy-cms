import type { FormEvent } from 'react'
import { Form, Button, Spinner } from 'react-bootstrap'
import { FaSignInAlt, FaUserPlus, FaEnvelope, FaUser } from 'react-icons/fa'
import { useTranslation } from '../../hooks/useTranslation'
import type { LoginFormValues } from '../../hooks/useLoginForm'
import type { AuthMode } from '../../utils/authConstants'
import IconInputField from './IconInputField'
import PasswordField from './PasswordField'
import SignupRoleFields from './SignupRoleFields'

export interface LoginFormProps {
  mode: AuthMode
  values: LoginFormValues
  onFieldChange: <K extends keyof LoginFormValues>(key: K, value: LoginFormValues[K]) => void
  showPassword: boolean
  onToggleShowPassword: () => void
  loading: boolean
  onSubmit: (e: FormEvent) => void
}

/**
 * Combined sign-in / sign-up form body used on the Login page.
 */
export default function LoginForm({
  mode,
  values,
  onFieldChange,
  showPassword,
  onToggleShowPassword,
  loading,
  onSubmit,
}: LoginFormProps) {
  const { t } = useTranslation()
  const isSignIn = mode === 'signin'

  return (
    <Form onSubmit={onSubmit}>
      {!isSignIn && (
        <IconInputField
          label="Full Name"
          icon={<FaUser size={14} />}
          type="text"
          value={values.name}
          onChange={(v) => onFieldChange('name', v)}
          placeholder="e.g. John Doe"
          disabled={loading}
        />
      )}

      <IconInputField
        label="Email Address"
        icon={<FaEnvelope size={14} />}
        type="email"
        value={values.email}
        onChange={(v) => onFieldChange('email', v)}
        placeholder="name@example.com"
        disabled={loading}
        autoComplete="email"
      />

      <PasswordField
        value={values.password}
        onChange={(v) => onFieldChange('password', v)}
        showPassword={showPassword}
        onToggleShow={onToggleShowPassword}
        disabled={loading}
        autoComplete={isSignIn ? 'current-password' : 'new-password'}
        showLengthHint={!isSignIn}
        labelToggle
      />

      {!isSignIn && (
        <SignupRoleFields
          role={values.selectedRole}
          onRoleChange={(r) => onFieldChange('selectedRole', r)}
          firm={values.firm}
          onFirmChange={(v) => onFieldChange('firm', v)}
          registrationNumber={values.registrationNumber}
          onRegistrationNumberChange={(v) => onFieldChange('registrationNumber', v)}
          disabled={loading}
        />
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-100 mb-2.5 d-flex align-items-center justify-content-center gap-2 shadow-xs fw-semibold btn-auth-submit"
        disabled={loading}
      >
        {loading ? (
          <>
            <Spinner size="sm" animation="border" />
            <span>{isSignIn ? 'Signing in...' : 'Creating Account...'}</span>
          </>
        ) : (
          <>
            {isSignIn ? <FaSignInAlt /> : <FaUserPlus />}
            <span>{isSignIn ? t('common.signIn') : 'Create Account'}</span>
          </>
        )}
      </Button>
    </Form>
  )
}
