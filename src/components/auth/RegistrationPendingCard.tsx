import { Card, Alert, Button, Container, Badge } from 'react-bootstrap'
import type { UserRole } from '../../types/domain'
import { FaEnvelope, FaShieldAlt, FaExternalLinkAlt, FaArrowRight, FaSignInAlt, FaInfoCircle } from 'react-icons/fa'

export interface RegistrationPendingCardProps {
  name: string
  email: string
  token: string
  role: UserRole
  onVerifyNow: (token: string) => void
  onReturnToLogin: () => void
}

/**
 * Notice card displayed when a McKenzie Friend or legal professional registers and requires email verification.
 */
export default function RegistrationPendingCard({
  name,
  email,
  token,
  role,
  onVerifyNow,
  onReturnToLogin,
}: RegistrationPendingCardProps) {
  const roleDisplay = role === 'McKenzieFriend' ? 'McKenzie Friend' : role

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-50 py-4 py-md-5">
      <Card className="shadow-lg border-0 overflow-hidden" style={{ width: '100%', maxWidth: '580px', borderRadius: '16px' }}>
        <Card.Header className="text-center py-4 bg-primary text-white position-relative">
          <div className="bg-white text-primary rounded-circle d-inline-flex align-items-center justify-content-center p-3 mb-2 shadow-sm">
            <FaEnvelope size={32} />
          </div>
          <h2 className="h4 fw-bold mb-1">Verify Your Email Address</h2>
          <p className="mb-0 text-white-50 small">
            Activation required for {roleDisplay} credentials
          </p>
        </Card.Header>

        <Card.Body className="p-4">
          <Alert variant="info" className="border-info-subtle bg-info-subtle text-info-emphasis rounded-3 p-3 mb-3">
            <div className="d-flex gap-2">
              <FaInfoCircle size={18} className="mt-0.5 flex-shrink-0 text-primary" />
              <div className="small">
                A verification link has been dispatched to <strong>{email}</strong> for <strong>{name}</strong>.
                Under UK Family Procedure Rules (FPR), all {roleDisplay}s must confirm their email before accessing proceedings.
              </div>
            </div>
          </Alert>

          {/* Simulated Email Inbox Box */}
          <div className="p-3 bg-light rounded-3 border mb-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div className="d-flex align-items-center gap-1.5 text-dark fw-bold small">
                <FaShieldAlt className="text-primary" size={14} />
                <span>Simulated Email Notification</span>
              </div>
              <Badge bg="success" className="py-1 px-2 font-monospace">
                Dispatched
              </Badge>
            </div>

            <div className="bg-white p-3 rounded-2 border small mb-3">
              <div className="text-muted" style={{ fontSize: '0.75rem' }}>From: support@mycasebuddy.justice.gov.uk</div>
              <div className="text-muted mb-2" style={{ fontSize: '0.75rem' }}>To: {name} &lt;{email}&gt;</div>
              <div className="fw-semibold text-dark border-top pt-2 mb-2">
                Action Required: Verify your {roleDisplay} account
              </div>
              <p className="text-secondary mb-3" style={{ fontSize: '0.825rem' }}>
                Thank you for registering with My Case Buddy. Please verify your email to unlock access to Litigant-in-Person cases and peer review workspace.
              </p>

              <Button
                variant="success"
                className="w-100 fw-bold d-flex align-items-center justify-content-center gap-2 py-2 shadow-xs"
                onClick={() => onVerifyNow(token)}
              >
                <span>Click Here to Verify Email (Simulate Email Click)</span>
                <FaExternalLinkAlt size={12} />
              </Button>
            </div>

            {/* Further Process Explanatory Notes */}
            <div className="px-1">
              <div className="fw-bold small text-dark mb-1">What is the next step?</div>
              <ol className="small text-muted ps-3 mb-0" style={{ fontSize: '0.8rem' }}>
                <li className="mb-1">Click the verification button above to confirm your email.</li>
                <li className="mb-1">Your account will be immediately upgraded to <strong>Verified {roleDisplay}</strong>.</li>
                <li>You can then view other people&apos;s cases seeking peer support and offer assistance.</li>
              </ol>
            </div>
          </div>

          <div className="d-flex flex-column flex-sm-row gap-2">
            <Button
              variant="outline-secondary"
              className="w-100 d-flex align-items-center justify-content-center gap-2"
              onClick={onReturnToLogin}
            >
              <FaSignInAlt size={14} />
              <span>Return to Sign In</span>
            </Button>
            <Button
              variant="primary"
              className="w-100 d-flex align-items-center justify-content-center gap-2 fw-semibold"
              onClick={() => onVerifyNow(token)}
            >
              <span>Verify Now</span>
              <FaArrowRight size={14} />
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  )
}
