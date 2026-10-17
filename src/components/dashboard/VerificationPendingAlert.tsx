import { Alert, Button, Spinner } from 'react-bootstrap'
import { FaEnvelope, FaCheckCircle } from 'react-icons/fa'

export interface VerificationPendingAlertProps {
  email: string
  /** When present, a "Verify Now" shortcut is offered. */
  verificationToken?: string
  /** Result notice from the last resend attempt. */
  notice: string | null
  isResending: boolean
  onVerifyNow: () => void
  onResend: () => void
}

/**
 * Warning banner for unverified accounts with verify-now and resend-email actions.
 */
export default function VerificationPendingAlert({
  email,
  verificationToken,
  notice,
  isResending,
  onVerifyNow,
  onResend,
}: VerificationPendingAlertProps) {
  return (
    <Alert variant="warning" className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2 mb-3 shadow-xs border-warning-subtle">
      <div className="d-flex align-items-center gap-2">
        <FaEnvelope className="text-warning flex-shrink-0" />
        <div>
          <strong>Account Pending Email Verification:</strong> Welcome emails and your verification link were dispatched to <code>{email}</code>.
          {notice && <div className="text-success small fw-semibold mt-1"><FaCheckCircle className="me-1" />{notice}</div>}
        </div>
      </div>
      <div className="d-flex gap-2 align-items-center">
        {verificationToken && (
          <Button variant="outline-dark" size="sm" onClick={onVerifyNow}>
            Verify Now
          </Button>
        )}
        <Button variant="warning" size="sm" disabled={isResending} onClick={onResend}>
          {isResending ? (
            <>
              <Spinner size="sm" animation="border" className="me-1" />
              Sending...
            </>
          ) : (
            'Resend Verification Email'
          )}
        </Button>
      </div>
    </Alert>
  )
}
