import { useEffect, useState } from 'react'
import { Container, Card, Button, Alert, Spinner } from 'react-bootstrap'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import type { User } from '../types/domain'
import { FaCheckCircle, FaExclamationTriangle, FaArrowRight, FaSignInAlt } from 'react-icons/fa'

export default function VerifyEmail() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const { verifyUser } = useAuthStore()

  const [loading, setLoading] = useState(true)
  const [verifiedUser, setVerifiedUser] = useState<User | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setErrorMessage('Missing verification token in link.')
      setLoading(false)
      return
    }

    const result = verifyUser(token)
    if (result.success && result.user) {
      setVerifiedUser(result.user)
    } else {
      setErrorMessage(result.error || 'Invalid or expired verification token.')
    }
    setLoading(false)
  }, [token, verifyUser])

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-50 py-5">
      <Card className="shadow-lg border-0" style={{ maxWidth: '540px', width: '100%' }}>
        <Card.Header className="text-center py-4 bg-primary text-white">
          <h1 className="h3 mb-0">Professional Email Verification</h1>
        </Card.Header>
        <Card.Body className="p-4 text-center">
          {loading && (
            <div className="py-4">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">Verifying your professional email link...</p>
            </div>
          )}

          {!loading && verifiedUser && (
            <div>
              <div className="text-success mb-3">
                <FaCheckCircle size={56} />
              </div>
              <h2 className="h4 text-success fw-bold mb-3">Email Verified Successfully!</h2>
              <Alert variant="success" className="text-start mb-4">
                <p className="mb-1">
                  Welcome, <strong>{verifiedUser.name}</strong> ({verifiedUser.role}).
                </p>
                <p className="mb-0 small">
                  Your email has been verified. You now have full clearance to review peer-to-peer cases shared by
                  litigants and provide legal guidance.
                </p>
              </Alert>

              <div className="d-grid gap-2">
                <Button
                  variant="primary"
                  size="lg"
                  className="d-flex align-items-center justify-content-center gap-2"
                  onClick={() => navigate('/professional-dashboard')}
                >
                  <span>Go to Professional Dashboard</span>
                  <FaArrowRight />
                </Button>
              </div>
            </div>
          )}

          {!loading && errorMessage && (
            <div>
              <div className="text-danger mb-3">
                <FaExclamationTriangle size={56} />
              </div>
              <h2 className="h4 text-danger fw-bold mb-3">Verification Link Expired or Invalid</h2>
              <Alert variant="danger" className="text-start mb-4">
                <p className="mb-0">{errorMessage}</p>
              </Alert>
              <Button
                variant="outline-secondary"
                size="lg"
                className="w-100 d-flex align-items-center justify-content-center gap-2"
                onClick={() => navigate('/login')}
              >
                <FaSignInAlt />
                <span>Return to Sign In</span>
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  )
}
