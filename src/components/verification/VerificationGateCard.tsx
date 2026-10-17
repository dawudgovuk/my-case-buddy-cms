import { useState } from 'react'
import { Card, Button, Alert, Row, Col, Badge } from 'react-bootstrap'
import {
  FaShieldAlt,
  FaEnvelope,
  FaCheckCircle,
  FaPaperPlane,
  FaArrowRight,
  FaUserShield,
  FaLock,
  FaGavel,
} from 'react-icons/fa'
import { toast } from '../../store/toastStore'

export interface VerificationGateCardProps {
  userEmail: string
  verificationToken?: string
  title?: string
  description?: string
  onVerifyClick?: (token: string) => void
  showEmailAlert?: boolean
  onSwitchToAssigned?: () => void
  assignedCasesCount?: number
  onResendEmail?: () => void
}

export default function VerificationGateCard({
  userEmail,
  verificationToken = 'demo_token_verify_now',
  title = 'Email Verification Required to Access Peer Requests',
  description = "In compliance with UK Family Procedure Rules (FPR Part 12) and UK GDPR safeguarding, Solicitors, Barristers, and McKenzie Friends must verify their email address before accessing case details or peer requests posted by Litigants in Person.",
  onVerifyClick,
  showEmailAlert = true,
  onSwitchToAssigned,
  assignedCasesCount = 0,
  onResendEmail,
}: VerificationGateCardProps) {
  const [resendStatus, setResendStatus] = useState<string | null>(null)

  const handleResend = () => {
    if (onResendEmail) {
      onResendEmail()
    }
    const msg = `A fresh verification link has been sent to ${userEmail}`
    setResendStatus(msg)
    toast.success(msg, 'Verification Link Dispatched')
    setTimeout(() => {
      setResendStatus(null)
    }, 5000)
  }

  return (
    <Card className="verification-gate-card shadow-sm border rounded-4 my-3 bg-white overflow-hidden">
      <Card.Body className="p-4 p-md-5 text-center">
        {/* Top Safeguarding Shield Icon */}
        <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-warning-subtle text-warning-emphasis mb-3 p-3 shadow-xs" style={{ width: 72, height: 72 }}>
          <FaShieldAlt size={36} />
        </div>

        <h3 className="fw-bold text-dark mb-2">{title}</h3>
        <p className="text-secondary mx-auto mb-4" style={{ maxWidth: '640px', lineHeight: 1.6 }}>
          {description}
        </p>

        {/* 3 Steps To Understand Access */}
        <div className="bg-light p-3 p-md-4 rounded-4 mb-4 border text-start mx-auto" style={{ maxWidth: '720px' }}>
          <div className="d-flex align-items-center gap-2 mb-3">
            <FaUserShield className="text-primary" />
            <h6 className="fw-bold mb-0 text-dark">Why is this step required for newcomers?</h6>
          </div>
          <Row className="g-3">
            <Col xs={12} md={4}>
              <div className="p-2 border rounded-3 bg-white h-100">
                <div className="small fw-bold text-primary mb-1 d-flex align-items-center gap-1">
                  <span>1. Child Safeguarding</span>
                </div>
                <p className="small text-muted mb-0">
                  Family Court files contain private child and domestic arrangements protected by UK law.
                </p>
              </div>
            </Col>
            <Col xs={12} md={4}>
              <div className="p-2 border rounded-3 bg-white h-100">
                <div className="small fw-bold text-warning-emphasis mb-1 d-flex align-items-center gap-1">
                  <span>2. Instant 1-Click Verification</span>
                </div>
                <p className="small text-muted mb-0">
                  Click the one-click demo button below to immediately unlock access in this environment.
                </p>
              </div>
            </Col>
            <Col xs={12} md={4}>
              <div className="p-2 border rounded-3 bg-white h-100">
                <div className="small fw-bold text-success mb-1 d-flex align-items-center gap-1">
                  <span>3. Support Litigants</span>
                </div>
                <p className="small text-muted mb-0">
                  Browse requests from Litigants in Person seeking help with bundles and hearings.
                </p>
              </div>
            </Col>
          </Row>
        </div>

        {/* Email verification status box */}
        {showEmailAlert && (
          <div className="p-3 p-md-4 rounded-3 border bg-white mx-auto mb-4 text-start shadow-xs" style={{ maxWidth: '640px' }}>
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
              <div className="d-flex align-items-center gap-2">
                <FaEnvelope className="text-primary" />
                <strong className="text-dark">Verification email registered to:</strong>
              </div>
              <Badge bg="secondary-subtle" className="text-secondary border">
                Verification Token Active
              </Badge>
            </div>

            <div className="p-2 px-3 bg-light rounded-2 border font-monospace text-dark fw-bold mb-3 d-flex justify-content-between align-items-center">
              <span>{userEmail}</span>
              <span className="badge bg-warning-subtle text-warning-emphasis small fw-normal">Pending Click</span>
            </div>

            {resendStatus && (
              <Alert variant="success" className="py-2 small mb-3">
                <FaCheckCircle className="me-1" />
                {resendStatus}
              </Alert>
            )}

            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
              <Button
                variant="primary"
                size="lg"
                className="d-flex align-items-center justify-content-center gap-2 fw-semibold px-4 py-2 rounded-3 shadow-sm flex-grow-1 flex-md-grow-0"
                onClick={() => onVerifyClick?.(verificationToken)}
              >
                <FaCheckCircle />
                <span>Verify Now (One-Click)</span>
              </Button>

              <Button
                variant="outline-secondary"
                size="sm"
                className="d-flex align-items-center gap-1 px-3 py-2 rounded-3"
                onClick={handleResend}
              >
                <FaPaperPlane size={12} />
                <span>Resend Verification Link</span>
              </Button>
            </div>
          </div>
        )}

        {/* Alternative Pathway: Assigned Cases already accessible */}
        {assignedCasesCount > 0 && onSwitchToAssigned && (
          <div className="p-3 bg-primary-subtle border border-primary-subtle rounded-3 mx-auto mb-4 text-start d-flex flex-wrap justify-content-between align-items-center gap-2" style={{ maxWidth: '640px' }}>
            <div>
              <div className="fw-bold text-primary d-flex align-items-center gap-1">
                <FaGavel />
                <span>You already have {assignedCasesCount} assigned case{assignedCasesCount === 1 ? '' : 's'}</span>
              </div>
              <div className="small text-secondary">
                Cases where you are directly invited do not require peer support verification.
              </div>
            </div>
            <Button
              variant="outline-primary"
              size="sm"
              className="d-flex align-items-center gap-1 fw-semibold"
              onClick={onSwitchToAssigned}
            >
              <span>View Assigned Cases</span>
              <FaArrowRight size={12} />
            </Button>
          </div>
        )}

        {/* Safeguarding & Compliance Trust Footnotes */}
        <div className="d-flex justify-content-center align-items-center gap-4 text-muted small flex-wrap pt-2">
          <span className="d-flex align-items-center gap-1">
            <FaShieldAlt className="text-secondary" />
            <span>UK GDPR Compliant</span>
          </span>
          <span className="d-flex align-items-center gap-1">
            <FaLock className="text-secondary" />
            <span>FPR Part 12 Safeguarded</span>
          </span>
          <span className="d-flex align-items-center gap-1">
            <FaCheckCircle className="text-secondary" />
            <span>Child Privacy Protected</span>
          </span>
        </div>
      </Card.Body>
    </Card>
  )
}
