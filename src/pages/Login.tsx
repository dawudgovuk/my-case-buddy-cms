import { Container, Card, Alert, Button } from 'react-bootstrap'
import { useTranslation } from '../hooks/useTranslation'
import { useLoginForm } from '../hooks/useLoginForm'
import { FaLock } from 'react-icons/fa'
import RoleRegistrationLinks from '../components/auth/RoleRegistrationLinks'
import AuthHero from '../components/auth/AuthHero'
import AuthModeToggle from '../components/auth/AuthModeToggle'
import LoginForm from '../components/auth/LoginForm'

export default function Login() {
  const { t } = useTranslation()
  const {
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
  } = useLoginForm()

  const isSignIn = authMode === 'signin'

  return (
    <Container className="auth-shell">
      <div className="auth-panel">
        <Card className="auth-card border-0 rounded-4 overflow-hidden">
          <AuthHero
            title={isSignIn ? 'Welcome back' : 'Create your account'}
            subtitle={
              isSignIn
                ? t('auth.signInTitle')
                : 'Manage your family court case and get support from people who can help'
            }
          />

          <Card.Body className="p-4">
            {error && (
              <Alert
                variant="danger"
                dismissible
                onClose={() => setError(null)}
                className="py-2 px-3 small rounded-3 mb-3"
              >
                {error}
              </Alert>
            )}

            {successMsg && (
              <Alert
                variant="success"
                dismissible
                onClose={() => setSuccessMsg(null)}
                className="py-2 px-3 small rounded-3 mb-3"
              >
                {successMsg}
              </Alert>
            )}

            <AuthModeToggle mode={authMode} onChange={switchMode} />

            <LoginForm
              mode={authMode}
              values={values}
              onFieldChange={setField}
              showPassword={showPassword}
              onToggleShowPassword={toggleShowPassword}
              loading={loading}
              onSubmit={handleAuthSubmit}
            />

            {/* Mode Switch Prompt */}
            <div className="text-center mt-3 mb-2">
              <span className="text-muted small">
                {isSignIn ? "Don't have an account? " : 'Already registered? '}
              </span>
              <Button
                variant="link"
                className="p-0 small fw-bold text-decoration-none"
                onClick={() => switchMode(isSignIn ? 'signup' : 'signin')}
              >
                {isSignIn ? 'Create an account' : 'Sign in'}
              </Button>
            </div>

            {/* Reusable Role Registration Shortcuts */}
            <RoleRegistrationLinks onSelectRole={(role) => navigate(`/register/${role}`)} />
          </Card.Body>
        </Card>
        <div className="d-flex align-items-center justify-content-center gap-2 mt-3 text-muted">
          <FaLock size={10} className="text-primary opacity-75" />
          <span style={{ fontSize: '0.78rem' }}>
            Confidential & Secure under UK Family Procedure Rules
          </span>
        </div>
      </div>
    </Container>
  )
}
