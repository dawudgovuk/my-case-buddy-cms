import { useState, useMemo } from 'react'
import { Card, Badge, Button, Alert, Row, Col, Form } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import type { FamilyCase, User } from '../../types/domain'
import { useCasesStore } from '../../store/casesStore'
import { FaEye, FaUserPlus, FaBalanceScale, FaHandshake } from 'react-icons/fa'
import VerificationGateCard from '../verification/VerificationGateCard'

interface PeerSupportCasesTabProps {
  user: User
  cases: FamilyCase[]
}

export default function PeerSupportCasesTab({ user, cases }: PeerSupportCasesTabProps) {
  const navigate = useNavigate()
  const { addOrUpdate } = useCasesStore()
  const [filterType, setFilterType] = useState('all')
  const [joinedSuccess, setJoinedSuccess] = useState<string | null>(null)

  // Cases seeking peer support where current user is NOT the owner
  const peerCases = useMemo(() => {
    return cases.filter((c) => {
      const isOwner = c.members?.some((m) => m.userId === user.id && m.role === 'Owner')
      const seeking = Boolean(c.seekingPeerSupport)
      return seeking && !isOwner
    })
  }, [cases, user.id])

  const filtered = useMemo(() => {
    if (filterType === 'all') return peerCases
    return peerCases.filter((c) => c.caseType === filterType)
  }, [peerCases, filterType])

  function handleJoinAsSupporter(caseData: FamilyCase) {
    const isAlreadyMember = caseData.members?.some((m) => m.userId === user.id)
    if (isAlreadyMember) {
      navigate(`/cases/${caseData.id}`)
      return
    }

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

    setJoinedSuccess(`You have joined ${caseData.id} as a peer supporter!`)
  }

  // Verification Gate: Unverified professionals cannot see other people's cases
  if (!user.isVerified) {
    const tokenToUse = user.verificationToken || 'demo_token_verify_now'

    return (
      <VerificationGateCard
        userEmail={user.email}
        verificationToken={tokenToUse}
        onVerifyClick={(token) => navigate(`/verify-email/${token}`)}
      />
    )
  }

  // Verified View: Can see other people's cases
  return (
    <div className="my-2">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
        <div>
          <h4 className="fw-bold mb-1 d-flex align-items-center gap-2">
            <span>Other People&apos;s Cases Seeking Peer Support</span>
            <Badge bg="success" className="fs-6 px-2 py-1">
              ✓ Verified Access
            </Badge>
          </h4>
          <p className="text-secondary small mb-0">
            Litigants in Person who have requested experienced legal peer review and mentoring.
          </p>
        </div>

        <Form.Select
          style={{ width: 'auto' }}
          size="sm"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">All Case Types ({peerCases.length})</option>
          <option value="Private Law (Child Arrangements)">Private Law (Child Arrangements)</option>
          <option value="Public Law (Care Proceedings)">Public Law (Care Proceedings)</option>
          <option value="Domestic Abuse (Non-Molestation)">Domestic Abuse (Non-Molestation)</option>
          <option value="Financial Remedies">Financial Remedies</option>
        </Form.Select>
      </div>

      {joinedSuccess && (
        <Alert variant="success" dismissible onClose={() => setJoinedSuccess(null)} className="mb-3">
          <FaHandshake className="me-2" />
          {joinedSuccess}
        </Alert>
      )}

      {filtered.length === 0 ? (
        <Card className="text-center p-4 border-0 shadow-sm">
          <Card.Body>
            <FaBalanceScale size={40} className="text-muted mb-3" />
            <h6>No peer support requests found matching this filter.</h6>
            <p className="text-muted small mb-0">Check back later as new litigants seek peer assistance.</p>
          </Card.Body>
        </Card>
      ) : (
        <Row className="g-3">
          {filtered.map((caseData) => {
            const isAlreadyMember = caseData.members?.some((m) => m.userId === user.id)

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
                        <strong>Requested Peer Support:</strong>
                        <p className="mb-0 text-dark mt-1">{caseData.peerSupportNote}</p>
                      </div>
                    )}

                    <div className="d-flex gap-2 flex-wrap mb-3 mt-auto pt-2">
                      <Badge bg="secondary" className="px-2 py-1">
                        Hearings: {caseData.hearings.length}
                      </Badge>
                      <Badge bg="info" className="px-2 py-1">
                        Parties: {caseData.parties.length}
                      </Badge>
                      {caseData.childrenInvolved ? (
                        <Badge bg="dark" className="px-2 py-1">
                          Children: {caseData.childrenInvolved}
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
                        <span>View Details</span>
                      </Button>
                      <Button
                        variant={isAlreadyMember ? 'secondary' : 'success'}
                        size="sm"
                        className="flex-grow-1 d-flex align-items-center justify-content-center gap-1"
                        onClick={() => handleJoinAsSupporter(caseData)}
                        disabled={isAlreadyMember}
                      >
                        <FaUserPlus />
                        <span>{isAlreadyMember ? 'Joined Supporter' : 'Offer Peer Support'}</span>
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
