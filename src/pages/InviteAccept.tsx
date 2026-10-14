import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { getInviteByToken, updateInvite, getCase } from '../services/storage'
import { useCasesStore } from '../store/casesStore'
import { useTranslation } from '../hooks/useTranslation'
import type { CaseInvite } from '../types/domain'
import { Card, Button, Alert, Container, Row, Col } from 'react-bootstrap'

export default function InviteAccept() {
  const navigate = useNavigate()
  const { token } = useParams<{ token: string }>()
  const { user } = useAuthStore()
  const { addOrUpdate } = useCasesStore()
  const { t } = useTranslation()
  const [invite, setInvite] = useState<CaseInvite | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) {
      setError(t('inviteAccept.invalidLink'))
      setLoading(false)
      return
    }

    const foundInvite = getInviteByToken(token)
    if (!foundInvite) {
      setError(t('inviteAccept.notFoundOrExpired'))
      setLoading(false)
      return
    }

    if (foundInvite.usedAt) {
      setError(t('inviteAccept.alreadyUsed'))
      setLoading(false)
      return
    }

    if (foundInvite.expiresAt && new Date(foundInvite.expiresAt) < new Date()) {
      setError(t('inviteAccept.hasExpired'))
      setLoading(false)
      return
    }

    setInvite(foundInvite)
    setLoading(false)
  }, [token, t])

  function handleAccept() {
    if (!invite || !user) return

    // Check if user role matches invite role
    if (user.role !== invite.role) {
      setError(t('inviteAccept.roleMismatch', { inviteRole: invite.role, userRole: user.role }))
      return
    }

    // Get the case
    const caseData = getCase(invite.caseId)
    if (!caseData) {
      setError(t('caseDetails.notFound'))
      return
    }

    // Check if user is already a member
    if (caseData.members?.some((m) => m.userId === user.id)) {
      setError(t('inviteAccept.alreadyMember'))
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
        <span>{t('inviteAccept.loading')}</span>
      </Container>
    )
  }

  if (error) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-50">
        <Card className="shadow-lg border-0 p-4">
          <Alert variant="danger" className="text-center mb-3">{t('common.error')}</Alert>
          <div className="mb-3 text-center">{error}</div>
          <Button className="w-100" onClick={() => navigate('/login')}>
            {t('auth.backToLogin')}
          </Button>
        </Card>
      </Container>
    )
  }

  if (!user) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-50">
        <Card className="shadow-lg border-0 p-4">
          <h4 className="mb-3 text-center">{t('inviteAccept.pleaseLogInTitle')}</h4>
          <div className="mb-3 text-center">
            {t('inviteAccept.mustBeLoggedIn')}
          </div>
          <Row className="g-2 mt-2">
            <Col>
              <Button className="w-100" onClick={() => navigate(`/register/${invite?.role}`)}>
                {t('auth.registerAsTitle', { role: invite?.role || '' })}
              </Button>
            </Col>
            <Col>
              <Button className="w-100" variant="outline-primary" onClick={() => navigate('/login')}>
                {t('common.signIn')}
              </Button>
            </Col>
          </Row>
        </Card>
      </Container>
    )
  }

  const caseData = invite ? getCase(invite.caseId) : null

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-50">
      <Card className="shadow-lg border-0 p-4">
        <h4 className="mb-3 text-center">{t('inviteAccept.invitationTitle')}</h4>
        <div className="mb-3 text-center">
          {t('inviteAccept.invitedAs', { role: invite?.role || '' })}
        </div>
        {caseData && (
          <div className="mb-3 text-center">
            <div className="text-muted small mb-1">{t('inviteAccept.caseDetailsTitle')}</div>
            <div className="fw-bold">{caseData.id} — {caseData.title}</div>
            <div className="text-muted small">{caseData.court} • {caseData.caseType}</div>
          </div>
        )}
        <Row className="g-2 mt-2">
          <Col>
            <Button className="w-100" onClick={handleAccept}>
              {t('inviteAccept.acceptBtn')}
            </Button>
          </Col>
          <Col>
            <Button className="w-100" variant="outline-secondary" onClick={() => navigate('/dashboard')}>
              {t('inviteAccept.declineBtn')}
            </Button>
          </Col>
        </Row>
      </Card>
    </Container>
  )
}
