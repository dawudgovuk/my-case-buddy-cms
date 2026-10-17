import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { getInviteByToken, updateInvite, getCase } from '../services/storage'
import { useCasesStore } from '../store/casesStore'
import { fetchStrapiInviteByToken, acceptStrapiInvite, fetchStrapiCaseById } from '../services/strapi'
import { useTranslation } from '../hooks/useTranslation'
import type { CaseInvite, FamilyCase } from '../types/domain'
import { isUserCaseMember } from '../utils/caseMembership'
import { Card, Button, Alert, Container, Row, Col, Badge, Spinner } from 'react-bootstrap'
import { FaHandshake, FaBalanceScale, FaCheckCircle, FaShieldAlt, FaGavel, FaArrowRight, FaExclamationTriangle } from 'react-icons/fa'

export default function InviteAccept() {
  const navigate = useNavigate()
  const { token } = useParams<{ token: string }>()
  const { user } = useAuthStore()
  const { addOrUpdate, isStrapiMode, syncWithStrapi } = useCasesStore()
  const { t } = useTranslation()

  const [invite, setInvite] = useState<CaseInvite | null>(null)
  const [caseDetails, setCaseDetails] = useState<FamilyCase | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!token) {
      setError(t('inviteAccept.invalidLink') || 'Invalid invitation link')
      setLoading(false)
      return
    }

    let isMounted = true

    async function loadData() {
      try {
        let foundInvite: CaseInvite | null | undefined = getInviteByToken(token!)

        if (!foundInvite) {
          foundInvite = await fetchStrapiInviteByToken(token!)
        }

        if (!isMounted) return

        if (!foundInvite) {
          setError(t('inviteAccept.notFoundOrExpired') || 'Invitation not found or has expired')
          setLoading(false)
          return
        }

        if (foundInvite.usedAt) {
          setError(t('inviteAccept.alreadyUsed') || 'This invitation has already been accepted')
          setLoading(false)
          return
        }

        if (foundInvite.expiresAt && new Date(foundInvite.expiresAt) < new Date()) {
          setError(t('inviteAccept.hasExpired') || 'This invitation has expired')
          setLoading(false)
          return
        }

        setInvite(foundInvite)

        // Hydrate case details
        if (foundInvite.caseId) {
          let caseObj: FamilyCase | null | undefined = getCase(foundInvite.caseId)
          if (!caseObj && isStrapiMode) {
            caseObj = await fetchStrapiCaseById(foundInvite.caseId)
          }
          if (isMounted && caseObj) {
            setCaseDetails(caseObj)
          }
        }
      } catch (err: unknown) {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : 'Failed to load invitation'
          setError(msg)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    void loadData()

    return () => {
      isMounted = false
    }
  }, [token, isStrapiMode, t])

  async function handleAccept() {
    if (!invite || !user) return

    // Role mismatch check
    if (user.role !== invite.role) {
      setError(
        `Role mismatch: This invitation requires role ${invite.role}, but your account is registered as ${user.role}.`
      )
      return
    }

    // Already member check
    if (caseDetails && isUserCaseMember(caseDetails, user)) {
      setError('You are already an authorized collaborator on this case.')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      if (isStrapiMode && invite.token) {
        await acceptStrapiInvite(invite.token)
        await syncWithStrapi()
      } else if (caseDetails) {
        const updatedMembers = [
          ...(caseDetails.members || []),
          {
            userId: user.id,
            role: invite.role as 'McKenzieFriend' | 'Solicitor' | 'Barrister',
            invitedAt: new Date().toISOString(),
            invitedBy: invite.createdBy,
          },
        ]
        addOrUpdate({
          ...caseDetails,
          members: updatedMembers,
          seekingPeerSupport: false,
        })
        updateInvite(invite.id, {
          usedAt: new Date().toISOString(),
          usedBy: user.id,
        })
      }

      setSuccess('Invitation accepted! You are now connected to this case as an authorized peer supporter.')
      setTimeout(() => {
        navigate('/professional-dashboard')
      }, 1500)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to accept invitation. Please try again.'
      setError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-50 py-5">
        <div className="text-center p-4" role="status">
          <Spinner animation="border" variant="primary" className="mb-3" />
          <div className="fw-semibold text-secondary">Opening your invitation…</div>
        </div>
      </Container>
    )
  }

  const inviteRoleLabel =
    invite?.role === 'McKenzieFriend' ? 'McKenzie Friend' : invite?.role === 'Solicitor' ? 'Solicitor' : invite?.role === 'Barrister' ? 'Barrister' : 'Legal supporter'

  if (error) {
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
                <Button variant="primary" className="flex-fill" onClick={() => navigate('/login')}>
                  Sign in
                </Button>
                <Button variant="outline-secondary" className="flex-fill" onClick={() => navigate('/professional-dashboard')}>
                  Go to dashboard
                </Button>
              </div>
            </Card.Body>
          </Card>
        </div>
      </Container>
    )
  }

  if (!user) {
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
                A litigant in person would like you to join their case team as a <strong className="text-white">{inviteRoleLabel}</strong>.
              </p>
            </div>
            <Card.Body className="p-4">
              <ul className="list-unstyled d-grid gap-2 mb-4 small">
                <li className="d-flex gap-2"><FaCheckCircle className="text-success mt-1 flex-shrink-0" /> See the case details, hearings and documents once you join</li>
                <li className="d-flex gap-2"><FaShieldAlt className="text-primary mt-1 flex-shrink-0" /> Everything in the case is confidential under the Family Procedure Rules</li>
              </ul>
              <Row className="g-2">
                <Col sm={6}>
                  <Button className="w-100" variant="primary" size="lg" onClick={() => navigate('/login')}>
                    Sign in to accept
                  </Button>
                </Col>
                <Col sm={6}>
                  <Button className="w-100" variant="outline-primary" size="lg" onClick={() => navigate(`/register/${invite?.role || 'McKenzieFriend'}`)}>
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

  const roleTheme = invite?.role === 'McKenzieFriend'
    ? { gradient: 'linear-gradient(135deg, #0a5c40 0%, #0e7a55 60%, #23a07a 100%)', badge: 'success', label: 'McKenzie Friend (court lay supporter)' }
    : invite?.role === 'Solicitor'
    ? { gradient: 'var(--mcb-hero)', badge: 'primary', label: 'Solicitor' }
    : { gradient: 'linear-gradient(135deg, #3b2a8a 0%, #5b3fc4 100%)', badge: 'secondary', label: 'Barrister' }

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
          {caseDetails ? (
            <Card className="bg-light border mb-4">
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <div className="text-muted small text-uppercase fw-bold" style={{ fontSize: '0.75rem' }}>Case Details</div>
                    <h5 className="fw-bold mb-1 text-dark">{caseDetails.title}</h5>
                    <div className="text-primary small fw-semibold">
                      Ref: {caseDetails.caseNumber || caseDetails.id}
                    </div>
                  </div>
                  <Badge bg="secondary" className="px-2 py-1">
                    {caseDetails.status || 'Active'}
                  </Badge>
                </div>

                <div className="row g-2 pt-2 border-top text-muted small">
                  <div className="col-sm-6">
                    <strong>Court:</strong> {caseDetails.court}
                  </div>
                  <div className="col-sm-6">
                    <strong>Case Type:</strong> {caseDetails.caseType}
                  </div>
                  {caseDetails.currentStage && (
                    <div className="col-sm-6">
                      <strong>Current Stage:</strong> {caseDetails.currentStage}
                    </div>
                  )}
                  {caseDetails.startedAt && (
                    <div className="col-sm-6">
                      <strong>Started:</strong> {caseDetails.startedAt}
                    </div>
                  )}
                </div>

                {caseDetails.peerSupportNote && (
                  <div className="mt-3 p-3 bg-white rounded border border-primary border-opacity-25">
                    <div className="fw-bold text-primary small mb-1">Requested Assistance from Litigant:</div>
                    <div className="fst-italic text-dark small">&ldquo;{caseDetails.peerSupportNote}&rdquo;</div>
                  </div>
                )}
              </Card.Body>
            </Card>
          ) : (
            <Alert variant="info" className="small mb-4">
              <FaGavel className="me-2" />
              Connected case reference: <strong>{invite?.caseId}</strong>
            </Alert>
          )}

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
                onClick={handleAccept}
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
                onClick={() => navigate('/professional-dashboard')}
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
