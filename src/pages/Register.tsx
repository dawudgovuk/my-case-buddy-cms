import { Container, Card, Form, Button, Alert, Row, Col, Spinner } from 'react-bootstrap'
import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from '../hooks/useTranslation'
import type { UserRole } from '../types/domain'
import { USER_ROLES } from '../utils/caseConstants'
import RegistrationPendingCard from '../components/auth/RegistrationPendingCard'
import { FaEye, FaEyeSlash, FaLock, FaUserPlus } from 'react-icons/fa'

function isValidRole(r: string | undefined): r is UserRole {
  return typeof r === 'string' && (USER_ROLES as readonly string[]).includes(r)
}

export default function Register() {
  const navigate = useNavigate()
  const { role } = useParams<{ role: string }>()
  const { registerWithNeon, resendRegistrationEmails } = useAuthStore()
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [firm, setFirm] = useState('')
  const [registrationNumber, setRegistrationNumber] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [registeredPendingVerification, setRegisteredPendingVerification] = useState<{
    email: string
    token: string
    name: string
  } | null>(null)

  if (!isValidRole(role)) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <Alert variant="danger">{t('auth.invalidRegistrationType')}</Alert>
      </Container>
    )
  }

  const userRole: UserRole = role

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!name.trim() || !email.trim()) {
      setError(t('auth.nameAndEmailRequired'))
      return
    }

    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters')
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
        setError(result.error || 'Registration failed. Please try again.')
        setLoading(false)
        return
      }

      const isProfessional = userRole === 'Solicitor' || userRole === 'Barrister' || userRole === 'McKenzieFriend'
      if (isProfessional && result.user.verificationToken) {
        setRegisteredPendingVerification({
          email: result.user.email,
          token: result.user.verificationToken,
          name: result.user.name,
        })
      } else {
        navigate(userRole === 'LIP' ? '/cases' : '/professional-dashboard')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

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
    <Container className="d-flex justify-content-center align-items-center min-vh-50 py-4 py-md-5">
      <Card className="shadow-lg border-0" style={{ width: '100%', maxWidth: '520px', borderRadius: '16px' }}>
        <Card.Header className="text-center py-4 bg-white border-bottom">
          <h1 className="h4 fw-bold mb-1">
            {t('auth.registerAsTitle', { role: userRole })}
          </h1>
          <p className="text-muted small mb-0">Create an account to manage your cases and peer support</p>
        </Card.Header>
        <Card.Body className="p-4">
          <Form onSubmit={handleSubmit}>
            {error && (
              <Alert variant="danger" dismissible onClose={() => setError('')} className="mb-3 py-2 px-3 small rounded-3">
                {error}
              </Alert>
            )}

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small text-secondary">{t('auth.fullNameLabel')}</Form.Label>
              <Form.Control
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                size="lg"
                placeholder={t('auth.emailPlaceholder')}
                disabled={loading}
                autoComplete="email"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <div className="d-flex justify-content-between align-items-center">
                <Form.Label className="fw-semibold small text-secondary">Password</Form.Label>
                <small className="text-muted" style={{ fontSize: '0.75rem' }}>Min 8 characters</small>
              </div>
              <div className="input-group">
                <span className="input-group-text bg-white text-muted">
                  <FaLock size={14} />
                </span>
                <Form.Control
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  size="lg"
                  disabled={loading}
                  autoComplete="new-password"
                />
                <Button
                  variant="outline-secondary"
                  className="border-start-0 bg-white text-muted"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                </Button>
              </div>
            </Form.Group>

            {(userRole === 'Solicitor' || userRole === 'Barrister') && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold small text-secondary">
                    {userRole === 'Solicitor' ? t('auth.firmLabel') : t('auth.chambersLabel')}
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={firm}
                    onChange={(e) => setFirm(e.target.value)}
                    size="lg"
                    placeholder={userRole === 'Solicitor' ? t('auth.firmPlaceholder') : t('auth.chambersPlaceholder')}
                    disabled={loading}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold small text-secondary">
                    {t('auth.registrationNumberLabel')}
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    size="lg"
                    placeholder={t('auth.registrationNumberPlaceholder')}
                    disabled={loading}
                  />
                </Form.Group>
              </>
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
                  onClick={() => navigate('/login')}
                  disabled={loading}
                >
                  {t('auth.backToLogin')}
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  )
}
