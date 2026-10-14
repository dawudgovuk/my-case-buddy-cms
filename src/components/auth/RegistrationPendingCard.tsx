import { Card, Alert, Button, Container } from 'react-bootstrap'
import type { UserRole } from '../../types/domain'
import { useTranslation } from '../../hooks/useTranslation'

export interface RegistrationPendingCardProps {
  name: string
  email: string
  token: string
  role: UserRole
  onVerifyNow: (token: string) => void
  onReturnToLogin: () => void
}

/**
 * Notice card displayed when a legal professional registers and requires email verification.
 */
export default function RegistrationPendingCard({
  name,
  email,
  token,
  role,
  onVerifyNow,
  onReturnToLogin,
}: RegistrationPendingCardProps) {
  const { t } = useTranslation()

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-50 py-5">
      <Card className="shadow-lg border-0" style={{ width: '100%', maxWidth: '560px' }}>
        <Card.Header className="text-center py-4 bg-primary text-white">
          <h2 className="h4 mb-0">{t('auth.checkEmailTitle')}</h2>
        </Card.Header>
        <Card.Body className="p-4 text-center">
          <Alert variant="info" className="text-start mb-4">
            <p className="mb-2">
              {t('auth.verificationSentNotice', { email })}
            </p>
            <div className="fw-bold fs-6 mb-2">{name} ({email})</div>
            <p className="small mb-0 text-muted">
              {t('auth.verificationExplanation', { role })}
            </p>
          </Alert>

          <div className="p-3 bg-light rounded border mb-4 text-start">
            <div className="small text-muted fw-bold mb-1">Demo Simulation Link:</div>
            <div className="small text-secondary mb-3">
              {t('auth.demoSimulationNotice')}
            </div>
            <Button
              variant="success"
              className="w-100 fw-bold"
              onClick={() => onVerifyNow(token)}
            >
              {t('auth.simulateVerifyBtn')}
            </Button>
          </div>

          <Button variant="outline-secondary" className="w-100" onClick={onReturnToLogin}>
            {t('auth.returnToLoginBtn')}
          </Button>
        </Card.Body>
      </Card>
    </Container>
  )
}
