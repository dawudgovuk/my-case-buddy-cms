import type { ReactNode } from 'react'
import { Card, Button, Alert, Container, Row, Col, Badge, Spinner } from 'react-bootstrap'
import { FaHandshake, FaBalanceScale, FaCheckCircle, FaShieldAlt, FaArrowRight } from 'react-icons/fa'
import type { User } from '../../types/domain'
import type { InviteRoleTheme } from '../../utils/inviteUtils'

export interface InviteAcceptPanelProps {
  user: Pick<User, 'name' | 'email'>
  roleTheme: InviteRoleTheme
  success: string
  isSubmitting: boolean
  /** Case summary slot (e.g. `InviteCaseSnapshot`). */
  caseSnapshot: ReactNode
  onAccept: () => void
  onDecline: () => void
}

/**
 * Role-themed peer support invitation card with account details, case snapshot,
 * FPR confidentiality notice and accept / decline actions.
 */
export default function InviteAcceptPanel({
  user,
  roleTheme,
  success,
  isSubmitting,
  caseSnapshot,
  onAccept,
  onDecline,
}: InviteAcceptPanelProps) {
  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-50 py-4 py-md-5">
      <Card className="overflow-hidden" style={{ maxWidth: 650, width: '100%', boxShadow: 'var(--mcb-shadow)' }}>
        {/* Banner Header */}
        <div style={{ background: roleTheme.gradient, padding: '28px 24px', color: '#ffffff' }} className="text-center">
          <div className="d-inline-flex p-3 rounded-circle bg-white bg-opacity-25 mb-2 shadow-sm" style={{ fontSize: '1.75rem' }}>
            <FaHandshake />
          </div>
          <h3 className="fw-bold mb-1">Peer Support Request</h3>
          <div className="small text-white-50 text-uppercase tracking-wider">
            UK Family Court &bull; Practice Direction 27A
          </div>
        </div>

        <Card.Body className="p-4">
          {success && (
            <Alert variant="success" className="d-flex align-items-center gap-2 mb-3">
              <FaCheckCircle className="flex-shrink-0 fs-5" />
              <div>{success}</div>
            </Alert>
          )}

          <div className="mb-3 d-flex justify-content-between align-items-center">
            <span className="text-muted small">Responding Account:</span>
            <span className="fw-bold text-dark">{user.name} ({user.email})</span>
          </div>

          <div className="mb-4">
            <span className="text-muted small d-block mb-1">Invited Capacity:</span>
            <Badge bg={roleTheme.badge} className="px-3 py-2 fs-6 fw-semibold">
              <FaBalanceScale className="me-2" />
              {roleTheme.label}
            </Badge>
          </div>

          {/* Case Snapshot Card */}
          {caseSnapshot}

          {/* FPR Confidentiality Notice */}
          <div className="p-3 mb-4 rounded bg-light border text-muted small d-flex gap-2 align-items-start">
            <FaShieldAlt className="text-success mt-1 flex-shrink-0" />
            <div style={{ fontSize: '0.825rem', lineHeight: '1.4' }}>
              <strong>FPR Part 12 & PD 27A Confidentiality:</strong> By accepting, you confirm you are providing lay assistance / peer guidance in compliance with Family Procedure Rules. Court documents and details must remain strictly privileged and private.
            </div>
          </div>

          {/* Action Buttons */}
          <Row className="g-2">
            <Col sm={7}>
              <Button
                className="w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2 shadow-sm"
                variant="success"
                onClick={onAccept}
                disabled={isSubmitting || Boolean(success)}
              >
                {isSubmitting ? (
                  <>
                    <Spinner size="sm" animation="border" />
                    <span>Connecting to Case...</span>
                  </>
                ) : (
                  <>
                    <FaCheckCircle />
                    <span>Accept & Join Case</span>
                    <FaArrowRight className="ms-1" />
                  </>
                )}
              </Button>
            </Col>
            <Col sm={5}>
              <Button
                className="w-100 py-2"
                variant="outline-secondary"
                onClick={onDecline}
                disabled={isSubmitting}
              >
                Decline & Close
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  )
}
