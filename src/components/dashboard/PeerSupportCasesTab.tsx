import { useState, useMemo } from 'react'
import { Card, Badge, Button, Alert, Row, Col, Form, Spinner } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import type { FamilyCase, User } from '../../types/domain'
import { useCasesStore } from '../../store/casesStore'
import { useAuthStore } from '../../store/authStore'
import { isUserCaseOwner, isUserCaseMember } from '../../utils/caseMembership'
import { FaEye, FaUserPlus, FaBalanceScale, FaHandshake, FaArrowRight } from 'react-icons/fa'
import { acceptStrapiPeerSupport } from '../../services/strapi'
import VerificationGateCard from '../verification/VerificationGateCard'
import { toast } from '../../store/toastStore'
import { useTranslation } from '../../hooks/useTranslation'

interface PeerSupportCasesTabProps {
  user: User
  cases: FamilyCase[]
  onSwitchToAssigned?: () => void
  assignedCasesCount?: number
}

export default function PeerSupportCasesTab({
  user,
  cases,
  onSwitchToAssigned,
  assignedCasesCount = 0,
}: PeerSupportCasesTabProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { addOrUpdate, isStrapiMode, syncWithStrapi } = useCasesStore()
  const { resendRegistrationEmails } = useAuthStore()
  const [filterType, setFilterType] = useState('all')
  const [joinedSuccess, setJoinedSuccess] = useState<string | null>(null)
  const [joiningId, setJoiningId] = useState<string | null>(null)
  const [joinError, setJoinError] = useState<string | null>(null)

  // Cases seeking peer support where current user is NOT the owner and NOT already a member
  const peerCases = useMemo(() => {
    return cases.filter((c) => {
      const isOwner = isUserCaseOwner(c, user)
      const isMember = isUserCaseMember(c, user)
      const seeking = Boolean(c.seekingPeerSupport)
      return seeking && !isOwner && !isMember
    })
  }, [cases, user])

  const filtered = useMemo(() => {
    if (filterType === 'all') return peerCases
    return peerCases.filter((c) => c.caseType === filterType)
  }, [peerCases, filterType])

  async function handleJoinAsSupporter(caseData: FamilyCase) {
    const isAlreadyMember = isUserCaseMember(caseData, user)
    if (isAlreadyMember) {
      if (onSwitchToAssigned) {
        onSwitchToAssigned()
      } else {
        navigate(`/cases/${caseData.documentId || caseData.id}`)
      }
      return
    }

    setJoiningId(caseData.id)
    setJoinError(null)

    try {
      if (isStrapiMode) {
        await acceptStrapiPeerSupport(caseData.documentId || caseData.id)
        await syncWithStrapi()
      } else {
        const updatedMembers = [
          ...(caseData.members || []),
          {
            userId: user.id,
            role: user.role === 'Barrister' ? ('Barrister' as const) : user.role === 'Solicitor' ? ('Solicitor' as const) : ('McKenzieFriend' as const),
            invitedAt: new Date().toISOString(),
          },
        ]

        addOrUpdate({
          ...caseData,
          members: updatedMembers,
          seekingPeerSupport: false,
          notes: [
            ...caseData.notes,
            {
              id: `note_${Date.now()}`,
              createdAt: new Date().toISOString(),
              author: `${user.name} (${user.role})`,
              text: `Joined case as verified ${user.role} to provide peer-to-peer support.`,
            },
          ],
        })
      }

      const successText = `You have joined "${caseData.title}" as an assigned peer supporter!`
      setJoinedSuccess(successText)
      toast.success(successText, 'Case Joined')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to join case as supporter'
      setJoinError(msg)
      toast.error(msg, 'Join Failed')
    } finally {
      setJoiningId(null)
    }
  }

  // Verification Gate: Unverified professionals cannot see other people's cases
  if (!user.isVerified) {
    const tokenToUse = user.verificationToken || 'demo_token_verify_now'

    return (
      <VerificationGateCard
        userEmail={user.email}
        verificationToken={tokenToUse}
        onVerifyClick={(token) => navigate(`/verify-email/${token}`)}
        onSwitchToAssigned={onSwitchToAssigned}
        assignedCasesCount={assignedCasesCount}
        onResendEmail={() => resendRegistrationEmails(user.email)}
      />
    )
  }

  // Verified View: Can see other people's cases
  return (
    <div className="my-2">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
        <div>
          <h4 className="fw-bold mb-1 d-flex align-items-center gap-2">
            <span>{t('professional.otherCasesSeekingPeer')}</span>
            <Badge bg="success" className="fs-6 px-2 py-1">
              {t('professional.verifiedAccessBadge')}
            </Badge>
          </h4>
          <p className="text-secondary small mb-0">
            {t('professional.otherCasesDesc')}
          </p>
        </div>

        <Form.Select
          style={{ width: 'auto' }}
          size="sm"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">{t('professional.allCaseTypes')} ({peerCases.length})</option>
          <option value="Private Law (Child Arrangements)">Private Law (Child Arrangements)</option>
          <option value="Public Law (Care Proceedings)">Public Law (Care Proceedings)</option>
          <option value="Domestic Abuse (Non-Molestation)">Domestic Abuse (Non-Molestation)</option>
          <option value="Financial Remedies">Financial Remedies</option>
        </Form.Select>
      </div>

      {joinedSuccess && (
        <Alert variant="success" dismissible onClose={() => setJoinedSuccess(null)} className="mb-3 d-flex flex-wrap justify-content-between align-items-center gap-2">
          <div className="d-flex align-items-center gap-2">
            <FaHandshake className="fs-5 flex-shrink-0" />
            <span>{joinedSuccess}</span>
          </div>
          {onSwitchToAssigned && (
            <Button size="sm" variant="success" onClick={onSwitchToAssigned} className="d-flex align-items-center gap-1">
              <span>{t('professional.viewInAssignedCases')}</span>
              <FaArrowRight />
            </Button>
          )}
        </Alert>
      )}

      {joinError && (
        <Alert variant="danger" dismissible onClose={() => setJoinError(null)} className="mb-3">
          {joinError}
        </Alert>
      )}

      {filtered.length === 0 ? (
        <Card className="text-center p-4 border-0 shadow-sm">
          <Card.Body>
            <FaBalanceScale size={40} className="text-muted mb-3" />
            <h6>{t('professional.noPeerMatching')}</h6>
            <p className="text-muted small mb-0">{t('professional.noPeerMatchingDesc')}</p>
          </Card.Body>
        </Card>
      ) : (
        <Row className="g-3">
          {filtered.map((caseData) => {
            const isAlreadyMember = isUserCaseMember(caseData, user)

            return (
              <Col key={caseData.id} xs={12} lg={6}>
                <Card className="shadow-sm border-0 h-100">
                  <Card.Body className="d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <h5 className="fw-bold mb-1 text-primary">
                          {caseData.id} — {caseData.title}
                        </h5>
                        <div className="small text-secondary">
                          {caseData.court} • {caseData.caseType}
                        </div>
                      </div>
                      <Badge bg={caseData.status === 'Open' ? 'success' : 'warning'} className="px-2 py-1">
                        {caseData.status}
                      </Badge>
                    </div>

                    {caseData.peerSupportNote && (
                      <div className="p-2 bg-light rounded border-start border-primary border-3 my-2 small">
                        <strong>{t('professional.requestedPeerSupport')}</strong>
                        <p className="mb-0 text-dark mt-1">{caseData.peerSupportNote}</p>
                      </div>
                    )}

                    <div className="d-flex gap-2 flex-wrap mb-3 mt-auto pt-2">
                      <Badge bg="secondary" className="px-2 py-1">
                        {t('dashboard.hearings')}: {caseData.hearings.length}
                      </Badge>
                      <Badge bg="info" className="px-2 py-1">
                        {t('dashboard.partyPlural')}: {caseData.parties.length}
                      </Badge>
                      {caseData.childrenInvolved ? (
                        <Badge bg="dark" className="px-2 py-1">
                          {t('dashboard.childPlural')}: {caseData.childrenInvolved}
                        </Badge>
                      ) : null}
                    </div>

                    <div className="d-flex gap-2">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="flex-grow-1 d-flex align-items-center justify-content-center gap-1"
                        onClick={() => navigate(`/cases/${caseData.id}`)}
                      >
                        <FaEye />
                        <span>{t('common.view')}</span>
                      </Button>
                      <Button
                        variant={isAlreadyMember ? 'secondary' : 'success'}
                        size="sm"
                        className="flex-grow-1 d-flex align-items-center justify-content-center gap-1"
                        onClick={() => void handleJoinAsSupporter(caseData)}
                        disabled={isAlreadyMember || joiningId === caseData.id}
                      >
                        {joiningId === caseData.id ? (
                          <Spinner size="sm" animation="border" />
                        ) : (
                          <FaUserPlus />
                        )}
                        <span>{isAlreadyMember ? t('professional.joinedSupporter') : t('professional.offerPeerSupport')}</span>
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            )
          })}
        </Row>
      )}
    </div>
  )
}
