import { useState } from 'react'
import { Card, Form, Row, Col, Button, Badge } from 'react-bootstrap'
import { useCasesStore } from '../../../store/casesStore'
import { useAuthStore } from '../../../store/authStore'
import { generateId, createInvite, getAllInvites } from '../../../services/storage'
import { listUsers } from '../../../services/auth'
import { createStrapiInvite } from '../../../services/strapi'
import type { FamilyCase } from '../../../types/domain'
import InviteLinkCard from '../InviteLinkCard'
import { FaUserPlus, FaUsers } from 'react-icons/fa'

export interface TeamInvitesTabProps {
  caseId: string
}

export default function TeamInvitesTab({ caseId }: TeamInvitesTabProps) {
  const store = useCasesStore()
  const [inviteRole, setInviteRole] = useState<'McKenzieFriend' | 'Solicitor' | 'Barrister'>('McKenzieFriend')
  const [generatedInvite, setGeneratedInvite] = useState<string | null>(null)
  const [solicitorName, setSolicitorName] = useState('')
  const [solicitorFirm, setSolicitorFirm] = useState('')
  const [barristerName, setBarristerName] = useState('')
  const [barristerChambers, setBarristerChambers] = useState('')
  const { user } = useAuthStore()

  const fc = store.getById(caseId)
  if (!fc || !user) return null
  const current = fc as FamilyCase

  const allInvites = getAllInvites().filter((i) => i.caseId === caseId)
  const allUsers = listUsers()

  async function generateInviteLink() {
    if (!user) return
    const token = generateId('INV')
    const invite = {
      id: generateId('INV'),
      caseId: current.id,
      token,
      role: inviteRole,
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }
    createInvite(invite)

    if (store.isStrapiMode) {
      try {
        await createStrapiInvite(current.id, inviteRole, user.id)
      } catch {
        // Fallback to local storage invite
      }
    }

    const inviteUrl = `${window.location.origin}/invite/${token}`
    setGeneratedInvite(inviteUrl)
  }

  function addSolicitor() {
    if (!solicitorName.trim()) return
    const updated: FamilyCase = {
      ...current,
      parties: [
        ...current.parties,
        {
          id: generateId('PTY'),
          role: 'Applicant',
          firstName: solicitorName.trim().split(' ')[0] || '',
          lastName: solicitorName.trim().split(' ').slice(1).join(' ') || '',
          solicitorFirm: solicitorFirm.trim() || undefined,
        },
      ],
    }
    store.addOrUpdate(updated)
    setSolicitorName('')
    setSolicitorFirm('')
  }

  function addBarrister() {
    if (!barristerName.trim()) return
    const updated: FamilyCase = {
      ...current,
      parties: [
        ...current.parties,
        {
          id: generateId('PTY'),
          role: 'Applicant',
          firstName: barristerName.trim().split(' ')[0] || '',
          lastName: barristerName.trim().split(' ').slice(1).join(' ') || '',
          solicitorFirm: barristerChambers.trim() || undefined,
        },
      ],
    }
    store.addOrUpdate(updated)
    setBarristerName('')
    setBarristerChambers('')
  }

  return (
    <div className="mb-3">
      {/* Generate Invite Links */}
      <Card className="mb-3 p-3 shadow-sm border bg-white">
        <Card.Title className="h5 fw-bold mb-3 d-flex align-items-center gap-2">
          <FaUserPlus className="text-primary" />
          <span>Generate Invite Link</span>
        </Card.Title>
        <Form.Group className="mb-3">
          <Form.Label className="small fw-semibold">Invite Role</Form.Label>
          <Form.Select
            size="sm"
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as 'McKenzieFriend' | 'Solicitor' | 'Barrister')}
          >
            <option value="McKenzieFriend">McKenzie Friend</option>
            <option value="Solicitor">Solicitor</option>
            <option value="Barrister">Barrister</option>
          </Form.Select>
        </Form.Group>
        <Button variant="primary" size="sm" onClick={generateInviteLink} className="mb-2">
          Generate Invite Link
        </Button>
        {generatedInvite && (
          <div className="p-3 bg-light rounded mb-2 border">
            <div className="small text-muted mb-1">Generated Invite Link:</div>
            <code className="small text-break bg-white p-2 rounded border d-block">{generatedInvite}</code>
          </div>
        )}
      </Card>

      {/* Add Solicitor */}
      <Card className="mb-3 p-3 shadow-sm border bg-white">
        <Card.Title className="h5 fw-bold mb-3">Add Legal Representative (Solicitor)</Card.Title>
        <Form as={Row} className="g-2 align-items-end">
          <Col md={5}>
            <Form.Group>
              <Form.Label className="small fw-semibold">Solicitor Name</Form.Label>
              <Form.Control
                size="sm"
                value={solicitorName}
                onChange={(e) => setSolicitorName(e.target.value)}
                placeholder="Full name"
              />
            </Form.Group>
          </Col>
          <Col md={5}>
            <Form.Group>
              <Form.Label className="small fw-semibold">Firm</Form.Label>
              <Form.Control
                size="sm"
                value={solicitorFirm}
                onChange={(e) => setSolicitorFirm(e.target.value)}
                placeholder="Solicitor's firm"
              />
            </Form.Group>
          </Col>
          <Col md={2} className="text-end">
            <Button
              variant="outline-primary"
              size="sm"
              onClick={addSolicitor}
              disabled={!solicitorName.trim()}
              className="w-100"
            >
              Add Solicitor
            </Button>
          </Col>
        </Form>
      </Card>

      {/* Add Barrister */}
      <Card className="mb-3 p-3 shadow-sm border bg-white">
        <Card.Title className="h5 fw-bold mb-3">Add Counsel (Barrister)</Card.Title>
        <Form as={Row} className="g-2 align-items-end">
          <Col md={5}>
            <Form.Group>
              <Form.Label className="small fw-semibold">Barrister Name</Form.Label>
              <Form.Control
                size="sm"
                value={barristerName}
                onChange={(e) => setBarristerName(e.target.value)}
                placeholder="Counsel's name"
              />
            </Form.Group>
          </Col>
          <Col md={5}>
            <Form.Group>
              <Form.Label className="small fw-semibold">Chambers</Form.Label>
              <Form.Control
                size="sm"
                value={barristerChambers}
                onChange={(e) => setBarristerChambers(e.target.value)}
                placeholder="Chambers name"
              />
            </Form.Group>
          </Col>
          <Col md={2} className="text-end">
            <Button
              variant="outline-primary"
              size="sm"
              onClick={addBarrister}
              disabled={!barristerName.trim()}
              className="w-100"
            >
              Add Barrister
            </Button>
          </Col>
        </Form>
      </Card>

      {/* Existing Invites */}
      {allInvites.length > 0 && (
        <Card className="mb-3 p-3 shadow-sm border bg-white">
          <Card.Title className="h5 fw-bold mb-3">Active Case Invites</Card.Title>
          {allInvites.map((invite) => (
            <InviteLinkCard
              key={invite.id}
              id={invite.id}
              role={invite.role}
              token={invite.token}
              createdAt={invite.createdAt}
              usedAt={invite.usedAt}
            />
          ))}
        </Card>
      )}

      {/* Case Members */}
      {fc.members && fc.members.length > 0 && (
        <Card className="mb-3 p-3 shadow-sm border bg-white">
          <Card.Title className="h5 fw-bold mb-3 d-flex align-items-center gap-2">
            <FaUsers className="text-primary" />
            <span>Case Team Members</span>
          </Card.Title>
          {fc.members.map((member) => {
            const memberUser = allUsers.find((u) => u.id === member.userId)
            return (
              <div key={member.userId} className="p-2 border-bottom d-flex justify-content-between align-items-center">
                <div>
                  <div className="fw-bold text-dark">{memberUser?.name || 'Unknown User'}</div>
                  {memberUser?.email && <div className="small text-muted">{memberUser.email}</div>}
                </div>
                <Badge bg={member.role === 'Owner' ? 'primary' : 'success'}>{member.role === 'McKenzieFriend' ? 'McKenzie Friend' : member.role}</Badge>
              </div>
            )
          })}
        </Card>
      )}
    </div>
  )
}
