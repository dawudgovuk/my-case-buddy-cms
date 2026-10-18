import { useState, useEffect, useMemo } from 'react'
import { Card, Form, Row, Col, Button, Badge, Spinner, Nav } from 'react-bootstrap'
import { useCasesStore } from '../../../store/casesStore'
import { useAuthStore } from '../../../store/authStore'
import { generateId, createInvite, getAllInvites, deleteInvite } from '../../../services/storage'
import { listUsers } from '../../../services/auth'
import { createStrapiInvite, fetchStrapiInvitesForCase, deleteStrapiInvite } from '../../../services/strapi'
import { toast } from '../../../store/toastStore'
import type { CaseInvite, CaseMember, FamilyCase } from '../../../types/domain'
import InviteLinkCard from '../InviteLinkCard'
import {
  FaUserPlus,
  FaUsers,
  FaCopy,
  FaCheck,
  FaBriefcase,
  FaGavel,
  FaLink,
  FaBuilding,
  FaEnvelope,
  FaPhone,
  FaTrashAlt,
} from 'react-icons/fa'

export interface TeamInvitesTabProps {
  caseId: string
}

export default function TeamInvitesTab({ caseId }: TeamInvitesTabProps) {
  const store = useCasesStore()
  const [inviteRole, setInviteRole] = useState<'McKenzieFriend' | 'Solicitor' | 'Barrister'>('McKenzieFriend')
  const [generatedInvite, setGeneratedInvite] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  // Solicitor Form State
  const [solicitorName, setSolicitorName] = useState('')
  const [solicitorFirm, setSolicitorFirm] = useState('')
  const [solicitorEmail, setSolicitorEmail] = useState('')
  const [solicitorPhone, setSolicitorPhone] = useState('')
  const [isAddingSolicitor, setIsAddingSolicitor] = useState(false)

  // Barrister Form State
  const [barristerName, setBarristerName] = useState('')
  const [barristerChambers, setBarristerChambers] = useState('')
  const [barristerEmail, setBarristerEmail] = useState('')
  const [barristerPhone, setBarristerPhone] = useState('')
  const [isAddingBarrister, setIsAddingBarrister] = useState(false)

  // Invites filter: 'all' | 'active' | 'used'
  const [inviteFilter, setInviteFilter] = useState<'all' | 'active' | 'used'>('all')

  const { user } = useAuthStore()
  const fc = store.getById(caseId)
  const current = fc as FamilyCase

  const [invites, setInvites] = useState<CaseInvite[]>(() =>
    getAllInvites().filter((i) => i.caseId === caseId)
  )
  const allUsers = listUsers()

  useEffect(() => {
    let isMounted = true
    if (store.isStrapiMode) {
      fetchStrapiInvitesForCase(caseId).then((strapiInvites) => {
        if (!isMounted || !strapiInvites.length) return
        setInvites((prev) => {
          const map = new Map<string, CaseInvite>()
          prev.forEach((inv) => map.set(inv.token, inv))
          strapiInvites.forEach((inv) => map.set(inv.token, inv))
          return Array.from(map.values())
        })
      })
    }
    return () => {
      isMounted = false
    }
  }, [caseId, store.isStrapiMode])

  const activeInvites = useMemo(
    () => invites.filter((i) => !i.usedAt && (!i.expiresAt || new Date(i.expiresAt) >= new Date())),
    [invites]
  )

  const usedInvites = useMemo(
    () => invites.filter((i) => Boolean(i.usedAt)),
    [invites]
  )

  const filteredInvites = useMemo(() => {
    if (inviteFilter === 'active') return activeInvites
    if (inviteFilter === 'used') return usedInvites
    return invites
  }, [inviteFilter, activeInvites, usedInvites, invites])

  if (!fc || !user) return null

  async function generateInviteLink() {
    if (!user || isGenerating) return
    setIsGenerating(true)
    setGeneratedInvite(null)
    setCopied(false)

    try {
      const localToken = generateId('INV')
      let effectiveToken = localToken

      if (store.isStrapiMode) {
        try {
          const strapiInvite = await createStrapiInvite(current.id, inviteRole, undefined, localToken)
          if (strapiInvite?.token) {
            effectiveToken = strapiInvite.token
          }
        } catch (err) {
          console.warn('Failed to persist invite to Strapi, falling back to local storage:', err)
        }
      }

      const invite: CaseInvite = {
        id: generateId('INV'),
        caseId: current.id,
        token: effectiveToken,
        role: inviteRole,
        createdBy: user.id,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      }
      createInvite(invite)
      setInvites((prev) => [invite, ...prev.filter((i) => i.token !== effectiveToken)])

      const inviteUrl = `${window.location.origin}/invite/${effectiveToken}`
      setGeneratedInvite(inviteUrl)
      toast.success(
        `Generated invitation link for ${inviteRole === 'McKenzieFriend' ? 'McKenzie Friend' : inviteRole}.`,
        'Invite Created'
      )
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to generate invitation link'
      toast.error(msg, 'Error')
    } finally {
      setIsGenerating(false)
    }
  }

  function copyToClipboard() {
    if (generatedInvite && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(generatedInvite)
      setCopied(true)
      toast.success('Case invitation link copied to clipboard.', 'Link Copied')
      setTimeout(() => setCopied(false), 2500)
    }
  }

  async function addSolicitor() {
    const name = solicitorName.trim()
    const firm = solicitorFirm.trim()
    const email = solicitorEmail.trim().toLowerCase()
    const phone = solicitorPhone.trim()

    if (!name || !firm) {
      toast.warning('Please enter both the solicitor name and firm.', 'Missing Information')
      return
    }

    setIsAddingSolicitor(true)
    try {
      const newMember: CaseMember = {
        userId: generateId('MBR'),
        role: 'Solicitor',
        name,
        firm,
        email: email || undefined,
        phone: phone || undefined,
        invitedAt: new Date().toISOString(),
      }

      // Update legal representative details on Applicant party if present
      const updatedParties = (current.parties || []).map((p) => {
        if (p.role === 'Applicant') {
          return {
            ...p,
            solicitorFirm: firm,
            solicitorContact: name,
            contactEmail: email || p.contactEmail,
            contactPhone: phone || p.contactPhone,
          }
        }
        return p
      })

      const existingMembers = current.members || []
      const updated: FamilyCase = {
        ...current,
        members: [...existingMembers, newMember],
        parties: updatedParties,
      }

      await store.addOrUpdate(updated)
      toast.success(`Solicitor ${name} (${firm}) added to case team.`, 'Solicitor Added')
      setSolicitorName('')
      setSolicitorFirm('')
      setSolicitorEmail('')
      setSolicitorPhone('')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to add solicitor'
      toast.error(msg, 'Error')
    } finally {
      setIsAddingSolicitor(false)
    }
  }

  async function addBarrister() {
    const name = barristerName.trim()
    const chambers = barristerChambers.trim()
    const email = barristerEmail.trim().toLowerCase()
    const phone = barristerPhone.trim()

    if (!name || !chambers) {
      toast.warning('Please enter both counsel name and chambers.', 'Missing Information')
      return
    }

    setIsAddingBarrister(true)
    try {
      const newMember: CaseMember = {
        userId: generateId('MBR'),
        role: 'Barrister',
        name,
        firm: chambers,
        email: email || undefined,
        phone: phone || undefined,
        invitedAt: new Date().toISOString(),
      }

      const existingMembers = current.members || []
      const updated: FamilyCase = {
        ...current,
        members: [...existingMembers, newMember],
      }

      await store.addOrUpdate(updated)
      toast.success(`Counsel ${name} (${chambers}) added to case team.`, 'Barrister Added')
      setBarristerName('')
      setBarristerChambers('')
      setBarristerEmail('')
      setBarristerPhone('')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to add barrister'
      toast.error(msg, 'Error')
    } finally {
      setIsAddingBarrister(false)
    }
  }

  async function handleRevokeInvite(tokenOrId: string) {
    const invite = invites.find((i) => i.token === tokenOrId || i.id === tokenOrId)
    deleteInvite(tokenOrId)

    if (store.isStrapiMode && invite) {
      const target = invite.documentId || invite.id || invite.token
      await deleteStrapiInvite(target)
    }

    setInvites((prev) => prev.filter((i) => i.token !== tokenOrId && i.id !== tokenOrId))
    toast.info('Invitation link has been revoked.', 'Invite Revoked')
  }

  async function removeMember(member: CaseMember) {
    if (member.role === 'Owner') {
      toast.warning('Case owner cannot be removed from the team.', 'Action Prohibited')
      return
    }

    const displayName = member.name || member.username || member.email || 'Team member'
    if (!window.confirm(`Are you sure you want to remove ${displayName} from the case team?`)) {
      return
    }

    const updatedMembers = (current.members || []).filter(
      (m) =>
        m.userId !== member.userId &&
        (!member.email || m.email?.toLowerCase() !== member.email.toLowerCase())
    )

    const updated: FamilyCase = {
      ...current,
      members: updatedMembers,
    }

    await store.addOrUpdate(updated)
    toast.info(`${displayName} was removed from the case team.`, 'Member Removed')
  }

  return (
    <div className="mb-3">
      {/* 1. Generate Invite Links */}
      <Card className="mb-3 p-3 shadow-sm border bg-white">
        <Card.Title className="h5 fw-bold mb-2 d-flex align-items-center gap-2">
          <FaUserPlus className="text-primary" />
          <span>Generate Invite Link</span>
        </Card.Title>
        <p className="text-muted small mb-3">
          Create a secure, 30-day invitation link allowing a supporter or legal professional to join this case team.
        </p>

        <Form.Group className="mb-3">
          <Form.Label className="small fw-semibold">Invite Role</Form.Label>
          <Form.Select
            size="sm"
            value={inviteRole}
            disabled={isGenerating}
            onChange={(e) => setInviteRole(e.target.value as 'McKenzieFriend' | 'Solicitor' | 'Barrister')}
          >
            <option value="McKenzieFriend">McKenzie Friend</option>
            <option value="Solicitor">Solicitor (Instructing Legal Representative)</option>
            <option value="Barrister">Barrister (Counsel)</option>
          </Form.Select>
        </Form.Group>

        <Button
          variant="primary"
          size="sm"
          onClick={generateInviteLink}
          disabled={isGenerating}
          className="mb-2 d-inline-flex align-items-center gap-2"
        >
          {isGenerating && (
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
            />
          )}
          <span>{isGenerating ? 'Generating Link...' : 'Generate Invite Link'}</span>
        </Button>

        {generatedInvite && (
          <div className="p-3 bg-light rounded-3 mt-3 border">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="small text-muted fw-semibold">Generated Invitation Link:</span>
              <Button
                variant={copied ? 'success' : 'outline-primary'}
                size="sm"
                className="d-flex align-items-center gap-1 py-1 px-2"
                onClick={copyToClipboard}
              >
                {copied ? <FaCheck size={12} /> : <FaCopy size={12} />}
                <span className="small">{copied ? 'Copied!' : 'Copy Link'}</span>
              </Button>
            </div>
            <code className="small text-break bg-white p-2 rounded border d-block font-monospace">
              {generatedInvite}
            </code>
            <div className="small text-muted mt-2">
              Share this secure link with your {inviteRole === 'McKenzieFriend' ? 'McKenzie Friend' : inviteRole}. They will automatically be admitted to this case once opened.
            </div>
          </div>
        )}
      </Card>

      {/* 2. Add Legal Representative (Solicitor) */}
      <Card className="mb-3 p-3 shadow-sm border bg-white">
        <div className="d-flex align-items-center gap-2 mb-2">
          <FaBriefcase className="text-primary" size={18} />
          <Card.Title className="h5 fw-bold mb-0">Add Legal Representative (Solicitor)</Card.Title>
        </div>
        <p className="text-muted small mb-3">
          Directly record your instructing solicitor on the case team and link them to court filings.
        </p>

        <Form onSubmit={(e) => { e.preventDefault(); void addSolicitor(); }}>
          <Row className="g-2 mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="small fw-semibold">
                  Solicitor Name <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  size="sm"
                  value={solicitorName}
                  onChange={(e) => setSolicitorName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  disabled={isAddingSolicitor}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="small fw-semibold">
                  Firm Name <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  size="sm"
                  value={solicitorFirm}
                  onChange={(e) => setSolicitorFirm(e.target.value)}
                  placeholder="e.g. Jenkins & Co Solicitors"
                  disabled={isAddingSolicitor}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="small fw-semibold">Email Address (optional)</Form.Label>
                <Form.Control
                  size="sm"
                  type="email"
                  value={solicitorEmail}
                  onChange={(e) => setSolicitorEmail(e.target.value)}
                  placeholder="e.g. s.jenkins@jenkinslaw.co.uk"
                  disabled={isAddingSolicitor}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="small fw-semibold">Phone / Direct Line (optional)</Form.Label>
                <Form.Control
                  size="sm"
                  value={solicitorPhone}
                  onChange={(e) => setSolicitorPhone(e.target.value)}
                  placeholder="e.g. +44 20 7946 0958"
                  disabled={isAddingSolicitor}
                />
              </Form.Group>
            </Col>
          </Row>

          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={!solicitorName.trim() || !solicitorFirm.trim() || isAddingSolicitor}
            className="d-inline-flex align-items-center gap-2"
          >
            {isAddingSolicitor && <Spinner as="span" animation="border" size="sm" />}
            <span>+ Add Solicitor to Case Team</span>
          </Button>
        </Form>
      </Card>

      {/* 3. Add Counsel (Barrister) */}
      <Card className="mb-3 p-3 shadow-sm border bg-white">
        <div className="d-flex align-items-center gap-2 mb-2">
          <FaGavel className="text-warning" size={18} />
          <Card.Title className="h5 fw-bold mb-0">Add Counsel (Barrister)</Card.Title>
        </div>
        <p className="text-muted small mb-3">
          Directly record instructed counsel / barrister representing you in hearings.
        </p>

        <Form onSubmit={(e) => { e.preventDefault(); void addBarrister(); }}>
          <Row className="g-2 mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="small fw-semibold">
                  Barrister Name <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  size="sm"
                  value={barristerName}
                  onChange={(e) => setBarristerName(e.target.value)}
                  placeholder="e.g. Eleanor Vance KC"
                  disabled={isAddingBarrister}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="small fw-semibold">
                  Chambers <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  size="sm"
                  value={barristerChambers}
                  onChange={(e) => setBarristerChambers(e.target.value)}
                  placeholder="e.g. 4 Paper Buildings"
                  disabled={isAddingBarrister}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="small fw-semibold">Email / Clerks Room (optional)</Form.Label>
                <Form.Control
                  size="sm"
                  type="email"
                  value={barristerEmail}
                  onChange={(e) => setBarristerEmail(e.target.value)}
                  placeholder="e.g. clerks@4pb.com"
                  disabled={isAddingBarrister}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="small fw-semibold">Phone / Chambers Line (optional)</Form.Label>
                <Form.Control
                  size="sm"
                  value={barristerPhone}
                  onChange={(e) => setBarristerPhone(e.target.value)}
                  placeholder="e.g. +44 20 7583 0777"
                  disabled={isAddingBarrister}
                />
              </Form.Group>
            </Col>
          </Row>

          <Button
            type="submit"
            variant="warning"
            className="text-dark fw-semibold d-inline-flex align-items-center gap-2"
            size="sm"
            disabled={!barristerName.trim() || !barristerChambers.trim() || isAddingBarrister}
          >
            {isAddingBarrister && <Spinner as="span" animation="border" size="sm" />}
            <span>+ Add Barrister to Case Team</span>
          </Button>
        </Form>
      </Card>

      {/* 4. Active & Historical Case Invites */}
      <Card className="mb-3 p-3 shadow-sm border bg-white">
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
          <div className="d-flex align-items-center gap-2">
            <FaLink className="text-primary" />
            <Card.Title className="h5 fw-bold mb-0">Active Case Invites</Card.Title>
            <Badge bg="primary" pill>
              {invites.length}
            </Badge>
          </div>

          {invites.length > 0 && (
            <Nav
              variant="pills"
              className="small"
              activeKey={inviteFilter}
              onSelect={(k) => setInviteFilter((k as 'all' | 'active' | 'used') || 'all')}
            >
              <Nav.Item>
                <Nav.Link eventKey="all" className="py-1 px-2 small">
                  All ({invites.length})
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="active" className="py-1 px-2 small">
                  Active ({activeInvites.length})
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="used" className="py-1 px-2 small">
                  Accepted ({usedInvites.length})
                </Nav.Link>
              </Nav.Item>
            </Nav>
          )}
        </div>

        {filteredInvites.length === 0 ? (
          <div className="text-muted p-3 bg-light rounded text-center small">
            {invites.length === 0
              ? 'No invitation links generated yet. Generate a secure link above to share with a McKenzie Friend, Solicitor, or Barrister.'
              : `No invites match the "${inviteFilter}" filter.`}
          </div>
        ) : (
          filteredInvites.map((invite) => (
            <InviteLinkCard
              key={invite.id || invite.token}
              id={invite.id}
              role={invite.role}
              token={invite.token}
              createdAt={invite.createdAt}
              expiresAt={invite.expiresAt}
              usedAt={invite.usedAt}
              onRevoke={handleRevokeInvite}
            />
          ))
        )}
      </Card>

      {/* 5. Case Team Members */}
      {fc.members && fc.members.length > 0 && (
        <Card className="mb-3 p-3 shadow-sm border bg-white">
          <Card.Title className="h5 fw-bold mb-3 d-flex align-items-center gap-2">
            <FaUsers className="text-primary" />
            <span>Case Team Members</span>
            <Badge bg="secondary" pill className="ms-1">
              {fc.members.length}
            </Badge>
          </Card.Title>

          {(() => {
            const uniqueMembers = (fc.members || []).reduce<CaseMember[]>((acc, member) => {
              const existingIndex = acc.findIndex(
                (m) =>
                  (member.email && m.email && m.email.toLowerCase() === member.email.toLowerCase()) ||
                  (member.documentId && m.documentId && m.documentId === member.documentId) ||
                  m.userId === member.userId
              )
              if (existingIndex === -1) {
                acc.push(member)
              } else if (member.role === 'Owner') {
                acc[existingIndex] = member
              }
              return acc
            }, [])

            return uniqueMembers.map((member, idx) => {
              const memberUser = allUsers.find(
                (u) =>
                  u.id === member.userId ||
                  (member.email && u.email?.toLowerCase() === member.email.toLowerCase())
              )
              const isCurrentUser =
                (user?.id && (user.id === member.userId || user.id === member.documentId)) ||
                (user?.email && member.email && user.email.toLowerCase() === member.email.toLowerCase())

              const displayName =
                member.name ||
                memberUser?.name ||
                (isCurrentUser ? user?.name : '') ||
                member.username ||
                (member.email ? member.email.split('@')[0] : 'Team Member')

              const displayEmail =
                member.email ||
                memberUser?.email ||
                (isCurrentUser ? user?.email : '')

              const displayFirm = member.firm || (memberUser as { firm?: string })?.firm

              const roleBadgeVariant =
                member.role === 'Owner'
                  ? 'primary'
                  : member.role === 'McKenzieFriend'
                  ? 'success'
                  : member.role === 'Solicitor'
                  ? 'info'
                  : member.role === 'Barrister'
                  ? 'warning'
                  : 'secondary'

              return (
                <div
                  key={member.userId || member.documentId || member.email || idx}
                  className="p-3 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2"
                >
                  <div>
                    <div className="fw-semibold text-dark d-flex align-items-center gap-2 flex-wrap">
                      <span>{displayName}</span>
                      {isCurrentUser && (
                        <span className="badge bg-light text-secondary border small">You</span>
                      )}
                    </div>

                    <div className="d-flex align-items-center gap-3 text-muted small mt-1 flex-wrap">
                      {displayFirm && (
                        <span className="d-inline-flex align-items-center gap-1">
                          <FaBuilding size={11} className="text-secondary" />
                          <span>{displayFirm}</span>
                        </span>
                      )}
                      {displayEmail && (
                        <span className="d-inline-flex align-items-center gap-1">
                          <FaEnvelope size={11} className="text-secondary" />
                          <span>{displayEmail}</span>
                        </span>
                      )}
                      {member.phone && (
                        <span className="d-inline-flex align-items-center gap-1">
                          <FaPhone size={11} className="text-secondary" />
                          <span>{member.phone}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    <Badge bg={roleBadgeVariant} className="px-2 py-1 text-white">
                      {member.role === 'McKenzieFriend' ? 'McKenzie Friend' : member.role}
                    </Badge>

                    {member.role !== 'Owner' && !isCurrentUser && (
                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="py-0 px-2 border-0"
                        title="Remove member from case team"
                        onClick={() => void removeMember(member)}
                      >
                        <FaTrashAlt size={12} />
                      </Button>
                    )}
                  </div>
                </div>
              )
            })
          })()}
        </Card>
      )}
    </div>
  )
}
