import { Card, Alert, Button, Container } from 'react-bootstrap'
import type { UserRole } from '../../types/domain'

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
  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-50 py-5">
      <Card className="shadow-lg border-0" style={{ width: '100%', maxWidth: '560px' }}>
        <Card.Header className="text-center py-4 bg-primary text-white">
          <h2 className="h4 mb-0">Check Your Email</h2>
        </Card.Header>
        <Card.Body className="p-4 text-center">
          <Alert variant="info" className="text-start mb-4">
            <p className="mb-2">
              Thank you, <strong>{name}</strong>. A verification email has been sent to:
            </p>
            <div className="fw-bold fs-6 mb-2">{email}</div>
            <p className="small mb-0 text-muted">
              As a registered {role}, you will be granted access to review other people&apos;s cases once your email is confirmed.
            </p>
          </Alert>

          <div className="p-3 bg-light rounded border mb-4 text-start">
            <div className="small text-muted fw-bold mb-1">Demo Simulation Link:</div>
            <div className="small text-secondary mb-3">
              In this demo environment, click below to simulate clicking the email link:
            </div>
            <Button
              variant="success"
              className="w-100 fw-bold"
              onClick={() => onVerifyNow(token)}
            >
              Verify Email via Link Now
            </Button>
          </div>

          <Button variant="outline-secondary" className="w-100" onClick={onReturnToLogin}>
            Return to Login
          </Button>
        </Card.Body>
      </Card>
    </Container>
  )
}
