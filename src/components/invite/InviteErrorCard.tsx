import { Card, Button, Alert, Container } from 'react-bootstrap'
import { FaExclamationTriangle } from 'react-icons/fa'

export interface InviteErrorCardProps {
  error: string
  onSignIn: () => void
  onGoToDashboard: () => void
}

/**
 * Auth-shell card explaining why an invitation cannot be opened.
 */
export default function InviteErrorCard({ error, onSignIn, onGoToDashboard }: InviteErrorCardProps) {
  return (
    <Container className="auth-shell">
      <div className="auth-panel">
        <Card className="overflow-hidden">
          <div className="auth-hero" style={{ background: 'linear-gradient(135deg, #7a2a20 0%, #c0392b 100%)' }}>
            <div className="auth-hero-icon">
              <FaExclamationTriangle size={22} />
            </div>
            <h1 className="h3 fw-bold mb-1">This invitation can’t be opened</h1>
            <p>Ask the person who invited you to send a new link.</p>
          </div>
          <Card.Body className="p-4">
            <Alert variant="danger" className="small mb-4">
              {error}
            </Alert>
            <div className="d-grid d-sm-flex gap-2">
              <Button variant="primary" className="flex-fill" onClick={onSignIn}>
                Sign in
              </Button>
              <Button variant="outline-secondary" className="flex-fill" onClick={onGoToDashboard}>
                Go to dashboard
              </Button>
            </div>
          </Card.Body>
        </Card>
      </div>
    </Container>
  )
}
