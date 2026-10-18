import { useEffect, useRef, useState } from 'react'
import { Container, Card, Button, Alert, Spinner } from 'react-bootstrap'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useTranslation } from '../hooks/useTranslation'
import type { User } from '../types/domain'
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaArrowRight,
  FaSignInAlt,
  FaShieldAlt,
} from 'react-icons/fa'
import { toast } from '../store/toastStore'
import { getLandingRoute } from '../utils/authConstants'

export default function VerifyEmail() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const { verifyUser, user: signedInUser } = useAuthStore()
  const { t } = useTranslation()

  const [loading, setLoading] = useState(true)
  const [verifiedUser, setVerifiedUser] = useState<User | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  // Each link is processed once (StrictMode runs effects twice in development)
  const handledToken = useRef<string | null>(null)

  useEffect(() => {
    if (token && handledToken.current === token) return
    handledToken.current = token ?? null
    if (!token) {
      const err = t('verifyEmail.missingToken')
      setErrorMessage(err)
      toast.error(err, 'Missing Token')
      setLoading(false)
      return
    }

    const result = verifyUser(token)
    if (result.success && result.user) {
      setVerifiedUser(result.user)
      setErrorMessage(null)
      toast.success(
        `Account for ${result.user.name} has been verified successfully!`,
        'Account Verified'
      )
    } else {
      setVerifiedUser(null)
      const err = result.error || t('verifyEmail.errorTitle')
      setErrorMessage(err)
      toast.error(err, 'Verification Failed')
    }
    setLoading(false)
  }, [token, verifyUser, t])

  const isMcKenzie = verifiedUser?.role === 'McKenzieFriend'
  const isLIP = verifiedUser?.role === 'LIP'
  const roleDisplay = isMcKenzie ? 'McKenzie Friend' : isLIP ? 'Litigant in Person' : verifiedUser?.role || 'Professional'

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-50 py-4 py-md-5">
      <Card className="shadow-lg border-0 overflow-hidden" style={{ maxWidth: '580px', width: '100%', borderRadius: '16px' }}>
        <Card.Header className="text-center py-4 bg-primary text-white">
          <h1 className="h4 fw-bold mb-0">Email Verification</h1>
        </Card.Header>
        <Card.Body className="p-4 text-center">
          {loading && (
            <div className="py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">{t('verifyEmail.verifying')}</p>
            </div>
          )}

          {!loading && verifiedUser && (
            <div>
              <div className="text-success mb-3">
                <FaCheckCircle size={56} />
              </div>
              <h2 className="h4 text-success fw-bold mb-2">Account Successfully Verified!</h2>
              <p className="text-muted small mb-3">
                Welcome, <strong>{verifiedUser.name}</strong>. Your <strong>{roleDisplay}</strong> credentials have been confirmed.
              </p>

              <Alert variant="success" className="text-start mb-4 py-2 px-3 small border-success-subtle bg-success-subtle text-success-emphasis">
                <div className="d-flex align-items-center gap-2">
                  <FaShieldAlt className="text-success flex-shrink-0" />
                  <div>
                    <strong>Access Cleared:</strong> {isLIP
                      ? 'You now have full permission to create and manage family court cases, upload documents, and seek support under UK Family Procedure Rules (FPR).'
                      : 'You now have full permission to review peer support cases and assist litigants under UK Family Procedure Rules (FPR).'}
                  </div>
                </div>
              </Alert>

              {/* Detailed Further Process */}
              <div className="p-3 bg-light rounded-3 border text-start mb-4">
                <div className="fw-bold small text-dark mb-2 d-flex align-items-center gap-1.5">
                  <FaShieldAlt className="text-primary" />
                  <span>Further Process for {roleDisplay}s:</span>
                </div>
                <div className="d-flex flex-column gap-2 small text-secondary" style={{ fontSize: '0.825rem' }}>
                  {isLIP ? (
                    <>
                      <div className="d-flex align-items-start gap-2">
                        <span className="badge bg-primary text-white rounded-circle p-1 mt-0.5" style={{ width: 18, height: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem' }}>
                          1
                        </span>
                        <div>
                          <strong>Create Your Family Court Case:</strong>
                          <div className="text-muted">Add your child arrangements or financial proceedings, court reference, and upcoming hearing dates.</div>
                        </div>
                      </div>

                      <div className="d-flex align-items-start gap-2">
                        <span className="badge bg-primary text-white rounded-circle p-1 mt-0.5" style={{ width: 18, height: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem' }}>
                          2
                        </span>
                        <div>
                          <strong>Compile Court Bundles &amp; Statements:</strong>
                          <div className="text-muted">Organize evidence, timeline milestones, and position statements in a compliant digital format.</div>
                        </div>
                      </div>

                      <div className="d-flex align-items-start gap-2">
                        <span className="badge bg-primary text-white rounded-circle p-1 mt-0.5" style={{ width: 18, height: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem' }}>
                          3
                        </span>
                        <div>
                          <strong>Request McKenzie Friend Assistance:</strong>
                          <div className="text-muted">Browse accredited peer supporters who can provide moral support and note-taking during your hearings.</div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="d-flex align-items-start gap-2">
                        <span className="badge bg-primary text-white rounded-circle p-1 mt-0.5" style={{ width: 18, height: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem' }}>
                          1
                        </span>
                        <div>
                          <strong>Browse Peer Support Cases:</strong>
                          <div className="text-muted">Explore open requests from Litigants in Person (LIP) who need assistance with Child Arrangements, Section 7 reports, or position statements.</div>
                        </div>
                      </div>

                      <div className="d-flex align-items-start gap-2">
                        <span className="badge bg-primary text-white rounded-circle p-1 mt-0.5" style={{ width: 18, height: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem' }}>
                          2
                        </span>
                        <div>
                          <strong>Offer Peer Assistance &amp; Join:</strong>
                          <div className="text-muted">Click &ldquo;Join Case&rdquo; on eligible proceedings to be added to the case team as an active supporter.</div>
                        </div>
                      </div>

                      <div className="d-flex align-items-start gap-2">
                        <span className="badge bg-primary text-white rounded-circle p-1 mt-0.5" style={{ width: 18, height: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem' }}>
                          3
                        </span>
                        <div>
                          <strong>Track Hearings &amp; Court Filings:</strong>
                          <div className="text-muted">Access the court calendar, upcoming FHDRA/DRA directions, and digital court bundle documents.</div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="d-grid gap-2">
                <Button
                  variant="primary"
                  size="lg"
                  className="d-flex align-items-center justify-content-center gap-2 fw-semibold shadow-xs"
                  onClick={() => navigate(getLandingRoute(signedInUser), { replace: true })}
                >
                  <span>
                    {!signedInUser
                      ? t('verifyEmail.returnToSignIn')
                      : isLIP
                        ? 'Go to My Cases'
                        : `Go to ${roleDisplay} Dashboard`}
                  </span>
                  <FaArrowRight />
                </Button>
              </div>
            </div>
          )}

          {!loading && !verifiedUser && errorMessage && (
            <div>
              <div className="text-danger mb-3">
                <FaExclamationTriangle size={56} />
              </div>
              <h2 className="h4 text-danger fw-bold mb-3">{t('verifyEmail.errorTitle')}</h2>
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
                <span>{t('verifyEmail.returnToSignIn')}</span>
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  )
}
