import { useState } from 'react'
import { Alert, Button, Card, Collapse, Spinner } from 'react-bootstrap'
import { FaCheckCircle, FaChevronDown, FaChevronUp, FaEnvelopeOpenText, FaPaperPlane, FaSignOutAlt } from 'react-icons/fa'
import type { UserRole } from '../../types/domain'
import { useTranslation } from '../../hooks/useTranslation'
import type { WelcomeNotice } from '../../hooks/useWelcomeVerification'
import { ROLE_LABEL_KEYS } from '../../utils/authConstants'
import AuthHero from './AuthHero'
import WelcomeSteps from './WelcomeSteps'
import RegistrationEmailPreview from './RegistrationEmailPreview'

export interface WelcomeVerifyCardProps {
  name: string
  email: string
  role: UserRole
  /** Token of the verification link already sent; absent when none has been sent yet. */
  token?: string
  notice?: WelcomeNotice | null
  onDismissNotice?: () => void
  checking?: boolean
  sending?: boolean
  onCheckVerified: () => void
  onSendEmail: () => void
  onUseDifferentAccount: () => void
  onOpenVerificationLink: (token: string) => void
}

/**
 * Welcome screen for a new account: shows progress (account created → verify email → dashboard),
 * where the verification link was sent, and the actions to continue, resend or switch account.
 */
export default function WelcomeVerifyCard({
  name,
  email,
  role,
  token,
  notice,
  onDismissNotice,
  checking = false,
  sending = false,
  onCheckVerified,
  onSendEmail,
  onUseDifferentAccount,
  onOpenVerificationLink,
}: WelcomeVerifyCardProps) {
  const { t } = useTranslation()
  const [showEmails, setShowEmails] = useState(false)
  const firstName = name.split(' ')[0] || name
  const steps = [t('welcome.stepCreated'), t('welcome.stepVerify'), t('welcome.stepDashboard')]

  return (
    <div className="auth-shell">
      <div className="auth-panel">
        <Card className="overflow-hidden">
          <AuthHero
            title={t('welcome.title', { name: firstName })}
            subtitle={t('welcome.subtitle', { role: t(ROLE_LABEL_KEYS[role]) })}
          />
          <Card.Body className="p-4">
            <WelcomeSteps steps={steps} currentIndex={1} />

            <div className="welcome-inbox">
              <span className="welcome-inbox-icon">
                <FaEnvelopeOpenText size={18} aria-hidden />
              </span>
              <div className="small">
                <h2 className="h6 fw-bold mb-1">{t('welcome.checkInboxTitle')}</h2>
                <p className="mb-1">
                  {token ? t('welcome.checkInboxBody', { email }) : t('welcome.noLinkYetBody', { email })}
                </p>
                {token && <p className="text-muted">{t('welcome.checkInboxHint')}</p>}
              </div>
            </div>

            {notice && (
              <Alert variant={notice.variant} dismissible onClose={onDismissNotice} className="py-2 small mb-3" role="status">
                {notice.text}
              </Alert>
            )}

            <div className="d-grid gap-2">
              {token ? (
                <Button variant="primary" size="lg" onClick={onCheckVerified} disabled={checking}>
                  {checking ? <Spinner animation="border" size="sm" className="me-2" /> : <FaCheckCircle className="me-2" />}
                  {checking ? t('welcome.checking') : t('welcome.alreadyVerifiedBtn')}
                </Button>
              ) : null}
              <Button variant={token ? 'outline-primary' : 'primary'} size={token ? undefined : 'lg'} onClick={onSendEmail} disabled={sending}>
                {sending ? <Spinner animation="border" size="sm" className="me-2" /> : <FaPaperPlane className="me-2" />}
                {sending ? t('welcome.sending') : token ? t('welcome.resendBtn') : t('welcome.sendBtn')}
              </Button>
            </div>

            {token && (
              <div className="mt-3 pt-3 border-top">
                <Button
                  variant="link"
                  className="p-0 small fw-semibold text-decoration-none d-inline-flex align-items-center gap-1"
                  aria-expanded={showEmails}
                  aria-controls="welcome-email-preview"
                  onClick={() => setShowEmails((v) => !v)}
                >
                  {showEmails ? t('welcome.hideEmails') : t('welcome.showEmails')}
                  {showEmails ? <FaChevronUp size={11} /> : <FaChevronDown size={11} />}
                </Button>
                <Collapse in={showEmails}>
                  <div id="welcome-email-preview">
                    <div className="pt-3">
                      <RegistrationEmailPreview name={name} email={email} token={token} role={role} onVerify={onOpenVerificationLink} />
                    </div>
                  </div>
                </Collapse>
              </div>
            )}
          </Card.Body>
        </Card>
        <p className="text-center small mt-3 mb-0">
          <Button variant="link" size="sm" className="text-muted text-decoration-none" onClick={onUseDifferentAccount}>
            <FaSignOutAlt className="me-1" />
            {t('welcome.useDifferentAccount')}
          </Button>
        </p>
      </div>
    </div>
  )
}
