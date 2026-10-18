import { Card, Button, Container, Row, Col } from 'react-bootstrap'
import { FaHandshake, FaCheckCircle, FaShieldAlt } from 'react-icons/fa'

export interface InviteSignInPromptProps {
  roleLabel: string
  onSignIn: () => void
  onRegister: () => void
}

/**
 * Prompt shown to signed-out visitors, asking them to sign in or register to accept an invite.
 */
export default function InviteSignInPrompt({ roleLabel, onSignIn, onRegister }: InviteSignInPromptProps) {
  return (
    <Container className="auth-shell">
      <div className="auth-panel">
        <Card className="overflow-hidden">
          <div className="auth-hero">
            <div className="auth-hero-icon">
              <FaHandshake size={24} />
            </div>
            <h1 className="h3 fw-bold mb-1">You’ve been invited to help</h1>
            <p>
              A litigant in person would like you to join their case team as a <strong className="text-white">{roleLabel}</strong>.
            </p>
          </div>
          <Card.Body className="p-4">
            <ul className="list-unstyled d-grid gap-2 mb-4 small">
              <li className="d-flex gap-2"><FaCheckCircle className="text-success mt-1 flex-shrink-0" /> See the case details, hearings and documents once you join</li>
              <li className="d-flex gap-2"><FaShieldAlt className="text-primary mt-1 flex-shrink-0" /> Everything in the case is confidential under the Family Procedure Rules</li>
            </ul>
            <Row className="g-2">
              <Col sm={6}>
                <Button className="w-100" variant="primary" size="lg" onClick={onSignIn}>
                  Sign in to accept
                </Button>
              </Col>
              <Col sm={6}>
                <Button className="w-100" variant="outline-primary" size="lg" onClick={onRegister}>
                  Create an account
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </div>
    </Container>
  )
}
