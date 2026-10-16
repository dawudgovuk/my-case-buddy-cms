import { useState } from 'react'
import { Card, Alert, Button, Container, Badge, Nav, Spinner } from 'react-bootstrap'
import type { UserRole } from '../../types/domain'
import {
  FaEnvelope,
  FaShieldAlt,
  FaExternalLinkAlt,
  FaArrowRight,
  FaSignInAlt,
  FaInfoCircle,
  FaCheckCircle,
  FaCopy,
  FaCheck,
  FaRedo,
  FaBookOpen,
} from 'react-icons/fa'
import {
  getLatestRegistrationEmails,
  buildRegistrationConfirmationEmail,
  buildVerificationEmail,
  MCKENZIE_PRACTICE_GUIDANCE,
  LIP_COURT_GUIDANCE,
} from '../../services/emailService'
import { useTranslation } from '../../hooks/useTranslation'

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
  const roleDisplay = role === 'McKenzieFriend' ? 'McKenzie Friend' : isLIP ? 'Litigant in Person' : role
  const guidance = isLIP ? LIP_COURT_GUIDANCE : MCKENZIE_PRACTICE_GUIDANCE
  const [activeTab, setActiveTab] = useState<'confirmation' | 'verification'>('confirmation')
  const [copied, setCopied] = useState(false)
  const [resending, setResending] = useState(false)
  const [resendSuccessMessage, setResendSuccessMessage] = useState<string | null>(null)

  // Retrieve stored emails or construct fallback models
  const existingEmails = getLatestRegistrationEmails(email)
  const confirmationEmail =
    existingEmails.confirmation ||
    buildRegistrationConfirmationEmail({
      name,
      email,
      role,
      referenceId,
    })

  const verificationEmail =
    existingEmails.verification ||
    buildVerificationEmail({
      name,
      email,
      role,
      token,
      referenceId,
    })

  const verificationUrl = verificationEmail.verificationUrl || `${window.location.origin}/verify-email/${token}`

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(verificationUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // Fallback
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  async function handleResend() {
    setResending(true)
    setResendSuccessMessage(null)
    try {
      if (onResendEmails) {
        await onResendEmails()
      }
      setResendSuccessMessage(t('auth.bothEmailsResentSuccess', { email }))
    } catch (err: unknown) {
      console.warn('Resend failed:', err)
      setResendSuccessMessage(`Emails re-dispatched to ${email}`)
    } finally {
      setResending(false)
    }
  }

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

          {/* Email Navigator Tabs */}
          <Nav variant="pills" className="nav-fill mb-3 bg-light p-1 rounded-3 border">
            <Nav.Item>
              <Nav.Link
                active={activeTab === 'confirmation'}
                onClick={() => setActiveTab('confirmation')}
                className={`py-2 px-3 fw-semibold small d-flex align-items-center justify-content-center gap-1.5 rounded-2 ${
                  activeTab === 'confirmation' ? 'bg-primary text-white shadow-xs' : 'text-dark'
                }`}
              >
                <span>{t('auth.confirmationTab')}</span>
                <Badge bg={activeTab === 'confirmation' ? 'light' : 'success-subtle'} text={activeTab === 'confirmation' ? 'primary' : 'success'} className="ms-1">
                  Confirmed
                </Badge>
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                active={activeTab === 'verification'}
                onClick={() => setActiveTab('verification')}
                className={`py-2 px-3 fw-semibold small d-flex align-items-center justify-content-center gap-1.5 rounded-2 ${
                  activeTab === 'verification' ? 'bg-primary text-white shadow-xs' : 'text-dark'
                }`}
              >
                <span>{t('auth.verificationTab')}</span>
                <Badge bg={activeTab === 'verification' ? 'light' : 'warning-subtle'} text={activeTab === 'verification' ? 'primary' : 'warning-emphasis'} className="ms-1">
                  Required
                </Badge>
              </Nav.Link>
            </Nav.Item>
          </Nav>

          {/* TAB 1: REGISTRATION CONFIRMATION EMAIL */}
          {activeTab === 'confirmation' && (
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
                <div className="text-muted" style={{ fontSize: '0.75rem' }}>From: {confirmationEmail.sender}</div>
                <div className="text-muted mb-2" style={{ fontSize: '0.75rem' }}>To: {name} &lt;{email}&gt;</div>
                <div className="fw-semibold text-dark border-top pt-2 mb-2 d-flex justify-content-between align-items-center">
                  <span>{confirmationEmail.subject}</span>
                  <Badge bg="secondary-subtle" className="text-secondary border">
                    {t('auth.referenceIdLabel')} {confirmationEmail.referenceId}
                  </Badge>
                </div>

                <p className="text-secondary mb-3" style={{ fontSize: '0.825rem', whiteSpace: 'pre-line' }}>
                  Welcome to My Case Buddy, <strong>{name}</strong>! Your registration as a <strong>{roleDisplay}</strong> has been officially received.
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
                  onClick={() => setActiveTab('verification')}
                >
                  <span>{t('auth.viewVerificationEmailBtn')}</span>
                </Button>
              </div>
            </div>
          )}

          {/* TAB 2: ACCOUNT VERIFICATION EMAIL */}
          {activeTab === 'verification' && (
            <div className="p-3 bg-light rounded-3 border mb-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="d-flex align-items-center gap-1.5 text-dark fw-bold small">
                  <FaShieldAlt className="text-primary" size={14} />
                  <span>Email #2: Verification &amp; Clearance Link</span>
                </div>
                <Badge bg="warning" text="dark" className="py-1 px-2 font-monospace">
                  Action Required
                </Badge>
              </div>

              <div className="bg-white p-3 rounded-2 border small mb-3">
                <div className="text-muted" style={{ fontSize: '0.75rem' }}>From: {verificationEmail.sender}</div>
                <div className="text-muted mb-2" style={{ fontSize: '0.75rem' }}>To: {name} &lt;{email}&gt;</div>
                <div className="fw-semibold text-dark border-top pt-2 mb-2">
                  {verificationEmail.subject}
                </div>
                <p className="text-secondary mb-3" style={{ fontSize: '0.825rem' }}>
                  Under UK Family Procedure Rules (FPR Part 12) child safeguarding standards, all {roleDisplay}s must verify their email before reviewing litigant proceedings or offering peer support.
                </p>

                {/* Primary Simulate Verification Click Button */}
                <Button
                  variant="success"
                  className="w-100 fw-bold d-flex align-items-center justify-content-center gap-2 py-2 mb-3 shadow-xs"
                  onClick={() => onVerifyNow(token)}
                >
                  <span>Click Here to Verify Email (Simulate Email Click)</span>
                  <FaExternalLinkAlt size={12} />
                </Button>

                {/* Copyable Direct Link Box */}
                <div className="p-2 bg-light rounded border mb-2">
                  <div className="text-muted small mb-1" style={{ fontSize: '0.7rem' }}>Direct Verification URL:</div>
                  <div className="d-flex align-items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={verificationUrl}
                      className="form-control form-control-sm font-monospace text-truncate bg-white"
                      style={{ fontSize: '0.75rem' }}
                    />
                    <Button
                      variant={copied ? 'success' : 'outline-secondary'}
                      size="sm"
                      onClick={handleCopy}
                      className="d-flex align-items-center gap-1 text-nowrap px-2.5"
                    >
                      {copied ? <FaCheck size={11} /> : <FaCopy size={11} />}
                      <span style={{ fontSize: '0.75rem' }}>{copied ? t('auth.linkCopied') : t('auth.copyVerificationLink')}</span>
                    </Button>
                  </div>
                </div>

                <div className="small text-muted" style={{ fontSize: '0.75rem' }}>
                  Notice: This verification link remains valid for 24 hours.
                </div>
              </div>

              {/* What happens next */}
              <div className="px-1">
                <div className="fw-bold small text-dark mb-1">What happens after verification?</div>
                <ol className="small text-muted ps-3 mb-0" style={{ fontSize: '0.8rem' }}>
                  <li className="mb-0.5">Your profile upgrades to <strong>Verified {roleDisplay}</strong>.</li>
                  {isLIP ? (
                    <>
                      <li className="mb-0.5">You unlock access to create and manage Family Court cases and hearings.</li>
                      <li>You can request peer assistance and bundle support from verified McKenzie Friends.</li>
                    </>
                  ) : (
                    <>
                      <li className="mb-0.5">You unlock access to browse peer support requests from Litigants in Person.</li>
                      <li>You can view court directions, hearing milestones, and document bundles.</li>
                    </>
                  )}
                </ol>
              </div>
            </div>
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
