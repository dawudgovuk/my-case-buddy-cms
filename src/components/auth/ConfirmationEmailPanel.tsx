import { Badge, Button } from 'react-bootstrap'
import { FaBookOpen, FaShieldAlt } from 'react-icons/fa'
import { MCKENZIE_PRACTICE_GUIDANCE, LIP_COURT_GUIDANCE } from '../../services/emailService'
import { useTranslation } from '../../hooks/useTranslation'
import type { DispatchedEmail } from '../../types/email'

export interface ConfirmationEmailPanelProps {
  email: DispatchedEmail
  recipientName: string
  recipientEmail: string
  roleDisplay: string
  isLIP: boolean
  onViewVerification: () => void
}

/**
 * Preview of "Email #1: Registration Confirmation" including role guidance.
 */
export default function ConfirmationEmailPanel({
  email,
  recipientName,
  recipientEmail,
  roleDisplay,
  isLIP,
  onViewVerification,
}: ConfirmationEmailPanelProps) {
  const { t } = useTranslation()
  const guidance = isLIP ? LIP_COURT_GUIDANCE : MCKENZIE_PRACTICE_GUIDANCE

  return (
    <div className="p-3 bg-light rounded-3 border mb-4">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <div className="d-flex align-items-center gap-1.5 text-dark fw-bold small">
          <FaBookOpen className="text-primary" size={14} />
          <span>Email #1: Registration Confirmation</span>
        </div>
        <Badge bg="success" className="py-1 px-2 font-monospace">
          Delivered
        </Badge>
      </div>

      <div className="bg-white p-3 rounded-2 border small mb-3">
        <div className="text-muted" style={{ fontSize: '0.75rem' }}>From: {email.sender}</div>
        <div className="text-muted mb-2" style={{ fontSize: '0.75rem' }}>To: {recipientName} &lt;{recipientEmail}&gt;</div>
        <div className="fw-semibold text-dark border-top pt-2 mb-2 d-flex justify-content-between align-items-center">
          <span>{email.subject}</span>
          <Badge bg="secondary-subtle" className="text-secondary border">
            {t('auth.referenceIdLabel')} {email.referenceId}
          </Badge>
        </div>

        <p className="text-secondary mb-3" style={{ fontSize: '0.825rem', whiteSpace: 'pre-line' }}>
          Welcome to My Case Buddy, <strong>{recipientName}</strong>! Your registration as a <strong>{roleDisplay}</strong> has been officially received.
        </p>

        {/* Guidance Box */}
        <div className="p-2.5 rounded-2 bg-light border mb-3">
          <div className="fw-bold text-dark small mb-2 d-flex align-items-center gap-1.5">
            <FaShieldAlt className="text-primary" size={12} />
            <span>{isLIP ? 'Litigant in Person Court Guidance & Rights' : t('auth.mckenzieRemitTitle')}</span>
          </div>

          <div className="mb-2">
            <div className="fw-semibold text-success small mb-1" style={{ fontSize: '0.75rem' }}>
              {isLIP ? 'Your Rights & Capabilities' : t('auth.whatYouCanDo')}
            </div>
            <ul className="mb-2 ps-3 text-secondary small" style={{ fontSize: '0.75rem' }}>
              {guidance.allowed.map((item, idx) => (
                <li key={idx} className="mb-0.5">{item}</li>
              ))}
            </ul>
          </div>

          <div>
            <div className="fw-semibold text-danger small mb-1" style={{ fontSize: '0.75rem' }}>
              {isLIP ? 'Safeguarding Rules & Restrictions' : t('auth.whatYouCannotDo')}
            </div>
            <ul className="mb-0 ps-3 text-secondary small" style={{ fontSize: '0.75rem' }}>
              {guidance.prohibited.map((item, idx) => (
                <li key={idx} className="mb-0.5">{item}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Switch to Verification Email Callout */}
        <Button
          variant="outline-primary"
          size="sm"
          className="w-100 fw-semibold d-flex align-items-center justify-content-center gap-2 py-2"
          onClick={onViewVerification}
        >
          <span>{t('auth.viewVerificationEmailBtn')}</span>
        </Button>
      </div>
    </div>
  )
}
