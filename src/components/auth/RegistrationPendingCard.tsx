import { Card, Alert, Button, Container, Spinner } from 'react-bootstrap'
import type { UserRole } from '../../types/domain'
import {
  FaEnvelope,
  FaArrowRight,
  FaSignInAlt,
  FaInfoCircle,
  FaCheckCircle,
  FaRedo,
} from 'react-icons/fa'
import { useTranslation } from '../../hooks/useTranslation'
import { useRegistrationPending } from '../../hooks/useRegistrationPending'
import { getRoleDisplayName } from '../../utils/authConstants'
import RegistrationEmailTabs from './RegistrationEmailTabs'
import ConfirmationEmailPanel from './ConfirmationEmailPanel'
import VerificationEmailPanel from './VerificationEmailPanel'

export interface RegistrationPendingCardProps {
  name: string
  email: string
  token: string
  role: UserRole
  referenceId?: string
  onVerifyNow: (token: string) => void
  onReturnToLogin: () => void
  onResendEmails?: () => Promise<void> | void
}

/**
 * Notice card displayed when any user registers.
 * Elegantly presents both the Registration Confirmation Email and the Verification Email.
 */
export default function RegistrationPendingCard({
  name,
  email,
  token,
  role,
  referenceId = 'REG-001',
  onVerifyNow,
  onReturnToLogin,
  onResendEmails,
}: RegistrationPendingCardProps) {
  const { t } = useTranslation()
  const isLIP = role === 'LIP'
  const roleDisplay = getRoleDisplayName(role)
  const {
    activeTab,
    setActiveTab,
    copied,
    resending,
    resendSuccessMessage,
    setResendSuccessMessage,
    confirmationEmail,
    verificationEmail,
    verificationUrl,
    handleCopy,
    handleResend,
  } = useRegistrationPending({ name, email, token, role, referenceId, onResendEmails })

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-50 py-4 py-md-5">
      <Card className="shadow-lg border-0 overflow-hidden" style={{ width: '100%', maxWidth: '640px', borderRadius: '16px' }}>
        {/* Header */}
        <Card.Header className="text-center py-4 bg-primary text-white position-relative">
          <div className="bg-white text-primary rounded-circle d-inline-flex align-items-center justify-content-center p-3 mb-2 shadow-sm">
            <FaEnvelope size={30} />
          </div>
          <h2 className="h4 fw-bold mb-1">{t('auth.twoEmailsDispatchedTitle')}</h2>
          <p className="mb-0 text-white-50 small">
            Registration confirmed &amp; activation link dispatched for <strong>{roleDisplay}</strong>
          </p>
        </Card.Header>

        <Card.Body className="p-4">
          {/* Dispatch Notice */}
          <Alert variant="info" className="border-info-subtle bg-info-subtle text-info-emphasis rounded-3 p-3 mb-3">
            <div className="d-flex gap-2">
              <FaInfoCircle size={18} className="mt-0.5 flex-shrink-0 text-primary" />
              <div className="small">
                {t('auth.twoEmailsDispatchedNotice', { email })}
              </div>
            </div>
          </Alert>

          {/* Resend success notice */}
          {resendSuccessMessage && (
            <Alert variant="success" dismissible onClose={() => setResendSuccessMessage(null)} className="py-2 small mb-3">
              <FaCheckCircle className="me-1.5" />
              {resendSuccessMessage}
            </Alert>
          )}

          <RegistrationEmailTabs activeTab={activeTab} onChange={setActiveTab} />

          {activeTab === 'confirmation' && (
            <ConfirmationEmailPanel
              email={confirmationEmail}
              recipientName={name}
              recipientEmail={email}
              roleDisplay={roleDisplay}
              isLIP={isLIP}
              onViewVerification={() => setActiveTab('verification')}
            />
          )}

          {activeTab === 'verification' && (
            <VerificationEmailPanel
              email={verificationEmail}
              recipientName={name}
              recipientEmail={email}
              roleDisplay={roleDisplay}
              isLIP={isLIP}
              verificationUrl={verificationUrl}
              copied={copied}
              onCopy={handleCopy}
              onVerify={() => onVerifyNow(token)}
            />
          )}

          {/* Resend Action Bar */}
          <div className="d-flex justify-content-between align-items-center mb-3 p-2 px-3 bg-light rounded-2 border">
            <span className="small text-muted">Didn&apos;t receive the emails?</span>
            <Button
              variant="link"
              size="sm"
              className="p-0 text-decoration-none fw-semibold d-flex align-items-center gap-1.5"
              onClick={handleResend}
              disabled={resending}
            >
              {resending ? <Spinner animation="border" size="sm" /> : <FaRedo size={12} />}
              <span>{resending ? t('auth.resendingEmails') : t('auth.resendBothEmailsBtn')}</span>
            </Button>
          </div>

          {/* Primary Action Buttons */}
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
