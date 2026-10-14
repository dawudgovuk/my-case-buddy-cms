import { Container, Card, Form, Button, Alert, Row, Col } from 'react-bootstrap'
import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from '../hooks/useTranslation'
import type { User, UserRole } from '../types/domain'
import { saveUsers, listUsers } from '../services/auth'
import { generateId } from '../services/storage'
import { isStrapiEnabled, strapiRegister } from '../services/strapi'
import { USER_ROLES } from '../utils/caseConstants'
import RegistrationPendingCard from '../components/auth/RegistrationPendingCard'

function isValidRole(r: string | undefined): r is UserRole {
  return typeof r === 'string' && (USER_ROLES as readonly string[]).includes(r)
}

export default function Register() {
  const navigate = useNavigate()
  const { role } = useParams<{ role: string }>()
  const { login } = useAuthStore()
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firm, setFirm] = useState('')
  const [registrationNumber, setRegistrationNumber] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

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

    const existingUsers = listUsers()
    if (existingUsers.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      setError(t('auth.emailAlreadyExists'))
      return
    }

    setIsSubmitting(true)

    const isProfessional = userRole === 'Solicitor' || userRole === 'Barrister' || userRole === 'McKenzieFriend'
    const verificationToken = isProfessional ? generateId('verify') : undefined

    let assignedId = generateId('user')

    // Automatically sync registration with Strapi if enabled
    if (isStrapiEnabled()) {
      try {
        const strapiResult = await strapiRegister({
          username: email.trim(),
          email: email.trim(),
          password: password || 'CaseBuddy2026!',
          userRole,
          firm: firm.trim() || undefined,
          registrationNumber: registrationNumber.trim() || undefined,
        })
        if (strapiResult.user?.id) {
          assignedId = String(strapiResult.user.id)
        }
      } catch (err: unknown) {
        console.warn('Strapi auto-registration info:', err)
      }
    }

    const newUser: User = {
      id: assignedId,
      name: name.trim(),
      email: email.trim(),
      role: userRole,
      isVerified: !isProfessional,
      ...(verificationToken && {
        verificationToken,
        verificationSentAt: new Date().toISOString(),
      }),
      ...(firm.trim() && { firm: firm.trim() }),
      ...(registrationNumber.trim() && { registrationNumber: registrationNumber.trim() }),
    }

    const updatedUsers: User[] = [...existingUsers, newUser]
    saveUsers(updatedUsers)
    useAuthStore.setState({ users: updatedUsers })
    setIsSubmitting(false)

    if (isProfessional && verificationToken) {
      setRegisteredPendingVerification({
        email: newUser.email,
        token: verificationToken,
        name: newUser.name,
      })
    } else {
      login(newUser.id)
      navigate(userRole === 'LIP' ? '/cases' : '/professional-dashboard')
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
      />
    )
  }

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-50 py-4">
      <Card className="shadow-lg border-0" style={{ width: '100%', maxWidth: '520px' }}>
        <Card.Header className="text-center py-3 py-sm-4 bg-white border-bottom">
          <h1 className="h4 fw-bold mb-0">
            {t('auth.registerAsTitle', { role: userRole })}
          </h1>
        </Card.Header>
        <Card.Body className="p-3 p-sm-4">
          <Form onSubmit={handleSubmit}>
            {error && (
              <Alert variant="danger" className="mb-3">
                {error}
              </Alert>
            )}

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">{t('auth.fullNameLabel')}</Form.Label>
              <Form.Control
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                size="lg"
                placeholder={t('auth.fullNamePlaceholder')}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">{t('auth.emailLabel')}</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                size="lg"
                placeholder={t('auth.emailPlaceholder')}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Password (Optional)</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                size="lg"
                placeholder="Set password for Strapi API account"
              />
              <Form.Text className="text-muted">Defaults to a secure preset if left blank.</Form.Text>
            </Form.Group>

            {(userRole === 'Solicitor' || userRole === 'Barrister') && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">
                    {userRole === 'Solicitor' ? t('auth.firmLabel') : t('auth.chambersLabel')}
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={firm}
                    onChange={(e) => setFirm(e.target.value)}
                    size="lg"
                    placeholder={userRole === 'Solicitor' ? t('auth.firmPlaceholder') : t('auth.chambersPlaceholder')}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">
                    {t('auth.registrationNumberLabel')}
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    size="lg"
                    placeholder={t('auth.registrationNumberPlaceholder')}
                  />
                  <Form.Text className="text-muted">{t('auth.registrationNumberPlaceholder')}</Form.Text>
                </Form.Group>
              </>
            )}

            <Row className="g-2 mt-4">
              <Col xs={12} sm={6}>
                <Button type="submit" className="w-100" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? 'Registering...' : t('auth.registerBtn')}
                </Button>
              </Col>
              <Col xs={12} sm={6}>
                <Button variant="outline-secondary" size="lg" className="w-100" onClick={() => navigate('/login')}>
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
