import type { FormEvent } from 'react'
import { Form, Button, Alert, Row, Col, Spinner } from 'react-bootstrap'
import { FaUserPlus } from 'react-icons/fa'
import { useTranslation } from '../../hooks/useTranslation'
import type { RegisterFormValues } from '../../hooks/useRegisterForm'
import type { UserRole } from '../../types/domain'
import { isLegalProfessionalRole } from '../../utils/authConstants'
import PasswordField from './PasswordField'
import ProfessionalDetailsFields from './ProfessionalDetailsFields'

export interface RegisterFormProps {
  role: UserRole
  values: RegisterFormValues
  onFieldChange: <K extends keyof RegisterFormValues>(key: K, value: RegisterFormValues[K]) => void
  showPassword: boolean
  onToggleShowPassword: () => void
  error: string
  onDismissError: () => void
  loading: boolean
  onSubmit: (e: FormEvent) => void
  onBackToLogin: () => void
}

/**
 * Role-specific registration form (name, email, password, optional professional details).
 */
export default function RegisterForm({
  role,
  values,
  onFieldChange,
  showPassword,
  onToggleShowPassword,
  error,
  onDismissError,
  loading,
  onSubmit,
  onBackToLogin,
}: RegisterFormProps) {
  const { t } = useTranslation()

  return (
    <Form onSubmit={onSubmit}>
      {error && (
        <Alert variant="danger" dismissible onClose={onDismissError} className="mb-3 py-2 px-3 small rounded-3">
          {error}
        </Alert>
      )}

      <Form.Group className="mb-3">
        <Form.Label className="fw-semibold small text-secondary">{t('auth.fullNameLabel')}</Form.Label>
        <Form.Control
          type="text"
          value={values.name}
          onChange={(e) => onFieldChange('name', e.target.value)}
          required
          size="lg"
          placeholder={t('auth.fullNamePlaceholder')}
          disabled={loading}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label className="fw-semibold small text-secondary">{t('auth.emailLabel')}</Form.Label>
        <Form.Control
          type="email"
          value={values.email}
          onChange={(e) => onFieldChange('email', e.target.value)}
          required
          size="lg"
          placeholder={t('auth.emailPlaceholder')}
          disabled={loading}
          autoComplete="email"
        />
      </Form.Group>

      <PasswordField
        value={values.password}
        onChange={(v) => onFieldChange('password', v)}
        showPassword={showPassword}
        onToggleShow={onToggleShowPassword}
        disabled={loading}
        autoComplete="new-password"
        showLengthHint
      />

      {isLegalProfessionalRole(role) && (
        <ProfessionalDetailsFields
          role={role}
          firm={values.firm}
          onFirmChange={(v) => onFieldChange('firm', v)}
          registrationNumber={values.registrationNumber}
          onRegistrationNumberChange={(v) => onFieldChange('registrationNumber', v)}
          disabled={loading}
        />
      )}

      <Row className="g-2 mt-4">
        <Col xs={12} sm={7}>
          <Button
            type="submit"
            variant="primary"
            className="w-100 d-flex align-items-center justify-content-center gap-2 fw-semibold"
            size="lg"
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner size="sm" animation="border" />
                <span>Creating...</span>
              </>
            ) : (
              <>
                <FaUserPlus />
                <span>{t('auth.registerBtn')}</span>
              </>
            )}
          </Button>
        </Col>
        <Col xs={12} sm={5}>
          <Button
            variant="outline-secondary"
            size="lg"
            className="w-100"
            onClick={onBackToLogin}
            disabled={loading}
          >
            {t('auth.backToLogin')}
          </Button>
        </Col>
      </Row>
    </Form>
  )
}
