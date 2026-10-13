import { Card, Button, Alert } from 'react-bootstrap'
import { FaLock, FaEnvelopeOpenText, FaCheckCircle } from 'react-icons/fa'

export interface VerificationGateCardProps {
  userEmail: string
  verificationToken?: string
  title?: string
  description?: string
  onVerifyClick?: (token: string) => void
  showEmailAlert?: boolean
}

export default function VerificationGateCard({
  userEmail,
  verificationToken = 'demo_token_verify_now',
  title = 'Email Verification Required',
  description = "In compliance with Family Procedure Rules and UK GDPR safeguarding, Solicitors, Barristers, and McKenzie Friends must verify their email address before they can view other people's cases or access peer support requests.",
  onVerifyClick,
  showEmailAlert = true,
}: VerificationGateCardProps) {
  return (
    <Card className="shadow-sm border-0 p-4 text-center my-3 bg-white">
      <Card.Body>
        <div className="text-warning mb-3">
          <FaLock size={48} />
        </div>
        <h4 className="fw-bold text-dark mb-2">{title}</h4>
        <p className="text-secondary mx-auto mb-4" style={{ maxWidth: '600px' }}>
          {description}
        </p>

        {showEmailAlert && (
          <Alert variant="warning" className="text-start mx-auto mb-4" style={{ maxWidth: '600px' }}>
            <div className="d-flex align-items-center gap-2 mb-2">
              <FaEnvelopeOpenText className="text-warning" />
              <strong>Verification email sent to:</strong>
            </div>
            <div className="fw-bold mb-2 text-dark">{userEmail}</div>
            <div className="small text-muted">
              Please click the link sent to your inbox to unlock peer case access.
            </div>
          </Alert>
        )}

        <div className="d-flex justify-content-center gap-3">
          <Button
            variant="primary"
            size="lg"
            className="d-flex align-items-center gap-2"
            onClick={() => onVerifyClick?.(verificationToken)}
          >
            <FaCheckCircle />
            <span>Verify Now (One-Click)</span>
          </Button>
        </div>
      </Card.Body>
    </Card>
  )
}
