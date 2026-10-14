import { useEffect, useState } from 'react'
import { Container, Card, Button, Alert, Spinner } from 'react-bootstrap'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useTranslation } from '../hooks/useTranslation'
import type { User } from '../types/domain'
import { FaCheckCircle, FaExclamationTriangle, FaArrowRight, FaSignInAlt } from 'react-icons/fa'

export default function VerifyEmail() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const { verifyUser } = useAuthStore()
  const { t } = useTranslation()

  const [loading, setLoading] = useState(true)
  const [verifiedUser, setVerifiedUser] = useState<User | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setErrorMessage(t('verifyEmail.missingToken'))
      setLoading(false)
      return
    }

    const result = verifyUser(token)
    if (result.success && result.user) {
      setVerifiedUser(result.user)
    } else {
      setErrorMessage(result.error || t('verifyEmail.errorTitle'))
    }
    setLoading(false)
  }, [token, verifyUser, t])

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-50 py-5">
      <Card className="shadow-lg border-0" style={{ maxWidth: '540px', width: '100%' }}>
        <Card.Header className="text-center py-4 bg-primary text-white">
          <h1 className="h3 mb-0">{t('verifyEmail.header')}</h1>
        </Card.Header>
        <Card.Body className="p-4 text-center">
          {loading && (
            <div className="py-4">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">{t('verifyEmail.verifying')}</p>
            </div>
          )}

          {!loading && verifiedUser && (
            <div>
              <div className="text-success mb-3">
                <FaCheckCircle size={56} />
              </div>
              <h2 className="h4 text-success fw-bold mb-3">{t('verifyEmail.successTitle')}</h2>
              <Alert variant="success" className="text-start mb-4">
                <p className="mb-1">
                  {t('verifyEmail.welcomeMessage', { name: verifiedUser.name, role: verifiedUser.role })}
                </p>
                <p className="mb-0 small">
                  {t('verifyEmail.successBody')}
                </p>
              </Alert>

              <div className="d-grid gap-2">
                <Button
                  variant="primary"
                  size="lg"
                  className="d-flex align-items-center justify-content-center gap-2"
                  onClick={() => navigate('/professional-dashboard')}
                >
                  <span>{t('verifyEmail.goToDashboard')}</span>
                  <FaArrowRight />
                </Button>
              </div>
            </div>
          )}

          {!loading && errorMessage && (
            <div>
              <div className="text-danger mb-3">
                <FaExclamationTriangle size={56} />
              </div>
              <h2 className="h4 text-danger fw-bold mb-3">{t('verifyEmail.errorTitle')}</h2>
              <Alert variant="danger" className="text-start mb-4">
                <p className="mb-0">{errorMessage}</p>
              </Alert>
              <Button
                variant="outline-secondary"
                size="lg"
                className="w-100 d-flex align-items-center justify-content-center gap-2"
                onClick={() => navigate('/login')}
              >
                <FaSignInAlt />
                <span>{t('verifyEmail.returnToSignIn')}</span>
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  )
}
