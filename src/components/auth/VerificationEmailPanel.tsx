import { Badge, Button } from 'react-bootstrap'
import { FaShieldAlt, FaExternalLinkAlt, FaCheck, FaCopy } from 'react-icons/fa'
import { useTranslation } from '../../hooks/useTranslation'
import type { DispatchedEmail } from '../../types/email'

export interface VerificationEmailPanelProps {
  email: DispatchedEmail
  recipientName: string
  recipientEmail: string
  roleDisplay: string
  isLIP: boolean
  verificationUrl: string
  copied: boolean
  onCopy: () => void
  onVerify: () => void
}

/**
 * Preview of "Email #2: Verification & Clearance Link" with simulate-click, copyable URL
 * and a "what happens next" summary.
 */
export default function VerificationEmailPanel({
  email,
  recipientName,
  recipientEmail,
  roleDisplay,
  isLIP,
  verificationUrl,
  copied,
  onCopy,
  onVerify,
}: VerificationEmailPanelProps) {
  const { t } = useTranslation()

  return (
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
        <div className="text-muted" style={{ fontSize: '0.75rem' }}>From: {email.sender}</div>
        <div className="text-muted mb-2" style={{ fontSize: '0.75rem' }}>To: {recipientName} &lt;{recipientEmail}&gt;</div>
        <div className="fw-semibold text-dark border-top pt-2 mb-2">
          {email.subject}
        </div>
        <p className="text-secondary mb-3" style={{ fontSize: '0.825rem' }}>
          Under UK Family Procedure Rules (FPR Part 12) child safeguarding standards, all {roleDisplay}s must verify their email before reviewing litigant proceedings or offering peer support.
        </p>

        {/* Primary Simulate Verification Click Button */}
        <Button
          variant="success"
          className="w-100 fw-bold d-flex align-items-center justify-content-center gap-2 py-2 mb-3 shadow-xs"
          onClick={onVerify}
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
              onClick={onCopy}
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
  )
}
