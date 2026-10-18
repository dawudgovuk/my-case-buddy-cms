import { Card, Button, Alert, Container } from 'react-bootstrap'
import { FaExclamationTriangle } from 'react-icons/fa'

export interface InviteErrorCardProps {
  error: string
  isLoggedIn?: boolean
  onSignIn: () => void
  onGoToDashboard: () => void
}

/**
 * Auth-shell card explaining why an invitation cannot be opened.
 */
export default function InviteErrorCard({ error, isLoggedIn = false, onSignIn, onGoToDashboard }: InviteErrorCardProps) {
  return (
    <Container className="auth-shell">
      <div className="auth-panel">
        <Card className="overflow-hidden">
          <div className="auth-hero" style={{ background: 'linear-gradient(135deg, #7a2a20 0%, #c0392b 100%)' }}>
            <div className="auth-hero-icon">
              <FaExclamationTriangle size={22} />
            </div>
            <h1 className="h3 fw-bold mb-1">
              {error.toLowerCase().includes('already') ? 'Invitation Already Processed' : 'This invitation can’t be opened'}
            </h1>
            <p>
              {error.toLowerCase().includes('already')
                ? 'This support invite has already been accepted.'
                : 'Ask the person who invited you to send a new link.'}
            </p>
          </div>
          <Card.Body className="p-4">
            <Alert variant={error.toLowerCase().includes('already') ? 'info' : 'danger'} className="small mb-4">
              {error}
            </Alert>
            <div className="d-grid d-sm-flex gap-2">
              {isLoggedIn ? (
                <Button variant="primary" className="flex-fill" onClick={onGoToDashboard}>
                  Go to dashboard
                </Button>
              ) : (
                <>
                  <Button variant="primary" className="flex-fill" onClick={onSignIn}>
                    Sign in
                  </Button>
                  <Button variant="outline-secondary" className="flex-fill" onClick={onGoToDashboard}>
                    Go to dashboard
                  </Button>
                </>
              )}
            </div>
          </Card.Body>
        </Card>
      </div>
    </Container>
  )
}
