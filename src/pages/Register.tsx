import { Container, Card, Button, Alert } from 'react-bootstrap'
import { useParams } from 'react-router-dom'
import { useTranslation } from '../hooks/useTranslation'
import { useRegisterForm } from '../hooks/useRegisterForm'
import type { UserRole } from '../types/domain'
import { ROLE_INTROS, ROLE_TITLES, isValidRole } from '../utils/authConstants'
import RegistrationPendingCard from '../components/auth/RegistrationPendingCard'
import AuthHero from '../components/auth/AuthHero'
import RegisterForm from '../components/auth/RegisterForm'

export default function Register() {
  const { role } = useParams<{ role: string }>()
  const { t } = useTranslation()
  const {
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
  } = useRegisterForm()

  if (!isValidRole(role)) {
    return (
      <Container className="auth-shell">
        <div className="auth-panel">
          <Alert variant="danger" className="mb-3">{t('auth.invalidRegistrationType')}</Alert>
          <Button variant="primary" onClick={() => navigate('/login')}>{t('auth.backToLogin')}</Button>
        </div>
      </Container>
    )
  }

  const userRole: UserRole = role

  if (registeredPendingVerification) {
    return (
      <RegistrationPendingCard
        name={registeredPendingVerification.name}
        email={registeredPendingVerification.email}
        token={registeredPendingVerification.token}
        role={userRole}
        onVerifyNow={(token) => navigate(`/verify-email/${token}`)}
        onReturnToLogin={() => navigate('/login')}
        onResendEmails={async () => {
          await resendRegistrationEmails(registeredPendingVerification.email)
        }}
      />
    )
  }

  return (
    <Container className="auth-shell">
      <div className="auth-panel">
      <Card className="overflow-hidden">
        <AuthHero title={<>Join as a {ROLE_TITLES[userRole]}</>} subtitle={ROLE_INTROS[userRole]} />
        <Card.Body className="p-4">
          <RegisterForm
            role={userRole}
            values={values}
            onFieldChange={setField}
            showPassword={showPassword}
            onToggleShowPassword={toggleShowPassword}
            error={error}
            onDismissError={() => setError('')}
            loading={loading}
            onSubmit={(e) => handleSubmit(e, userRole)}
            onBackToLogin={() => navigate('/login')}
          />
        </Card.Body>
      </Card>
      <p className="text-center text-muted small mt-3 mb-0">
        Not a {ROLE_TITLES[userRole]}?{' '}
        <button type="button" className="btn btn-link btn-sm p-0 align-baseline" onClick={() => navigate('/login')}>
          Choose a different account type
        </button>
      </p>
      </div>
    </Container>
  )
}
