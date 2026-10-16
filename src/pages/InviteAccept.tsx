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
import { FaHandshake, FaBalanceScale, FaCheckCircle, FaShieldAlt, FaGavel, FaArrowRight } from 'react-icons/fa'

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
        <div className="text-center p-4">
          <Spinner animation="border" variant="primary" className="mb-3" />
          <div className="fw-semibold text-secondary">Verifying peer support invitation...</div>
        </div>
      </Container>
    )
  }

  if (error) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-50 py-5">
        <Card className="shadow-lg border-0 p-4 text-center" style={{ maxWidth: 520, borderRadius: 16 }}>
          <div className="mx-auto mb-3" style={{ fontSize: '3rem', color: '#dc3545' }}>⚠️</div>
          <h4 className="fw-bold mb-2">Invitation Notice</h4>
          <Alert variant="danger" className="py-2 text-start small mb-3">
            {error}
          </Alert>
          <div className="d-flex gap-2 justify-content-center">
            <Button variant="outline-secondary" onClick={() => navigate('/professional-dashboard')}>
              Go to Dashboard
            </Button>
            <Button variant="primary" onClick={() => navigate('/login')}>
              Sign In
            </Button>
          </div>
        </Card>
      </Container>
    )
  }

  if (!user) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-50 py-5">
        <Card className="shadow-lg border-0 p-4 text-center" style={{ maxWidth: 540, borderRadius: 16 }}>
          <div className="mx-auto mb-3" style={{ fontSize: '3rem' }}>🤝</div>
          <h4 className="fw-bold mb-2">Peer Support Invitation</h4>
          <p className="text-muted small mb-4">
            You have been invited to assist a Litigant in Person as a{' '}
            <strong className="text-dark">{invite?.role || 'Legal Supporter'}</strong> under Family Procedure Rules.
            Please sign in or register to accept.
          </p>
          <Row className="g-2">
            <Col sm={6}>
              <Button className="w-100" variant="primary" onClick={() => navigate('/login')}>
                Sign In to Accept
              </Button>
            </Col>
            <Col sm={6}>
              <Button className="w-100" variant="outline-primary" onClick={() => navigate(`/register/${invite?.role || 'McKenzieFriend'}`)}>
                Register as {invite?.role || 'Supporter'}
              </Button>
            </Col>
          </Row>
        </Card>
      </Container>
    )
  }

  const roleTheme = invite?.role === 'McKenzieFriend'
    ? { gradient: 'linear-gradient(135deg, #065f46 0%, #059669 100%)', badge: 'success', label: 'McKenzie Friend (Court Lay Supporter)' }
    : invite?.role === 'Solicitor'
    ? { gradient: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)', badge: 'primary', label: 'Solicitor' }
    : { gradient: 'linear-gradient(135deg, #581c87 0%, #7c3aed 100%)', badge: 'secondary', label: 'Barrister' }

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-50 py-4 py-md-5">
      <Card className="shadow-lg border-0 overflow-hidden" style={{ maxWidth: 650, borderRadius: 16, width: '100%' }}>
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
