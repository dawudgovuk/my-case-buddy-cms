// Removed Material UI imports
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { getInviteByToken, updateInvite, getCase } from '../services/storage'
import { useCasesStore } from '../store/casesStore'
import type { CaseInvite } from '../types/domain'
import { Card, Button, Alert, Container, Row, Col } from 'react-bootstrap'

export default function InviteAccept() {
  const navigate = useNavigate()
  const { token } = useParams<{ token: string }>()
  const { user } = useAuthStore()
  const { addOrUpdate } = useCasesStore()
  const [invite, setInvite] = useState<CaseInvite | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) {
      setError('Invalid invite link')
      setLoading(false)
      return
    }

    const foundInvite = getInviteByToken(token)
    if (!foundInvite) {
      setError('Invite link not found or has expired')
      setLoading(false)
      return
    }

    if (foundInvite.usedAt) {
      setError('This invite link has already been used')
      setLoading(false)
      return
    }

    if (foundInvite.expiresAt && new Date(foundInvite.expiresAt) < new Date()) {
      setError('This invite link has expired')
      setLoading(false)
      return
    }

    setInvite(foundInvite)
    setLoading(false)
  }, [token])

  function handleAccept() {
    if (!invite || !user) return

    // Check if user role matches invite role
    if (user.role !== invite.role) {
      setError(`This invite is for ${invite.role} role, but you are registered as ${user.role}`)
      return
    }

    // Get the case
    const caseData = getCase(invite.caseId)
    if (!caseData) {
      setError('Case not found')
      return
    }

    // Check if user is already a member
    if (caseData.members?.some(m => m.userId === user.id)) {
      setError('You are already a member of this case')
      return
    }

    // Add user as a member
    const updatedCase = {
      ...caseData,
      members: [
        ...(caseData.members || []),
        {
          userId: user.id,
          role: invite.role as 'McKenzieFriend' | 'Solicitor' | 'Barrister',
          invitedAt: new Date().toISOString(),
          invitedBy: invite.createdBy,
        },
      ],
    }

    addOrUpdate(updatedCase)

    // Mark invite as used
    updateInvite(invite.id, {
      usedAt: new Date().toISOString(),
      usedBy: user.id,
    })

    // Navigate to case
    navigate(`/cases/${invite.caseId}`)
  }


  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-50">
        <span>Loading...</span>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-50">
        <Card className="shadow-lg border-0 p-4" style={{ maxWidth: 420, width: '100%', background: 'var(--airbnb-light)'}}>
          <Alert variant="danger" className="text-center mb-3" style={{ background: 'var(--airbnb-coral)', color: '#fff', fontWeight: 700 }}>Error</Alert>
          <div className="mb-3 text-center" style={{ color: 'var(--airbnb-dark)' }}>{error}</div>
          <Button className="w-100 login-airbnb-btn" style={{ background: 'var(--airbnb-coral)', border: 'none', fontWeight: 700 }} onClick={() => navigate('/login')}>
            Go to Login
          </Button>
        </Card>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-50">
        <Card className="shadow-lg border-0 p-4" style={{ maxWidth: 420, width: '100%', background: 'var(--airbnb-light)' }}>
          <h4 className="mb-3 text-center" style={{ color: 'var(--airbnb-coral)', fontWeight: 800 }}>Please Log In</h4>
          <div className="mb-3 text-center" style={{ color: 'var(--airbnb-dark)' }}>
            You need to be logged in to accept this invite. If you don't have an account, please register first.
          </div>
          <Row className="g-2 mt-2">
            <Col>
              <Button className="w-100 login-airbnb-btn" style={{ background: 'var(--airbnb-coral)', border: 'none', fontWeight: 700 }} onClick={() => navigate(`/register/${invite?.role}`)}>
                Register as {invite?.role}
              </Button>
            </Col>
            <Col>
              <Button className="w-100 login-airbnb-outline" variant="outline-primary" style={{ color: 'var(--airbnb-coral)', borderColor: 'var(--airbnb-coral)', fontWeight: 700 }} onClick={() => navigate('/login')}>
                Login
              </Button>
            </Col>
          </Row>
        </Card>
      </Container>
    );
  }

  const caseData = invite ? getCase(invite.caseId) : null

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-50">
      <Card className="shadow-lg border-0 p-4" style={{ maxWidth: 420, width: '100%', background: 'var(--airbnb-light)' }}>
        <h4 className="mb-3 text-center" style={{ color: 'var(--airbnb-coral)', fontWeight: 800 }}>Case Invitation</h4>
        <div className="mb-3 text-center" style={{ color: 'var(--airbnb-dark)' }}>
          You have been invited to join a case as a <strong>{invite?.role}</strong>.
        </div>
        {caseData && (
          <div className="mb-3 text-center">
            <div style={{ color: 'var(--airbnb-gray)', fontSize: 13, marginBottom: 2 }}>Case Details:</div>
            <div style={{ fontWeight: 700 }}>{caseData.id} — {caseData.title}</div>
            <div style={{ color: 'var(--airbnb-gray)', fontSize: 13 }}>{caseData.court} • {caseData.caseType}</div>
          </div>
        )}
        <Row className="g-2 mt-2">
          <Col>
            <Button className="w-100 login-airbnb-btn" style={{ background: 'var(--airbnb-green)', border: 'none', fontWeight: 700 }} onClick={handleAccept}>
              Accept Invitation
            </Button>
          </Col>
          <Col>
            <Button className="w-100 login-airbnb-outline" variant="outline-secondary" style={{ color: 'var(--airbnb-coral)', borderColor: 'var(--airbnb-coral)', fontWeight: 700 }} onClick={() => navigate('/dashboard')}>
              Decline
            </Button>
          </Col>
        </Row>
      </Card>
    </Container>
  );
}
