import { useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCasesStore } from '../store/casesStore'
import { Button, Card, Form, Row, Col, Tabs, Tab } from 'react-bootstrap'

import type { FamilyCase, Party, Hearing, DocumentRecord, OrderRecord } from '../types/domain'
import { generateId, createInvite, getAllInvites } from '../services/storage'
import { useAuthStore } from '../store/authStore'
import { listUsers } from '../services/auth'

function PartiesTab({ caseId }: { caseId: string }) {
  const store = useCasesStore()
  const [role, setRole] = useState<Party['role']>('Applicant')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [solicitorFirm, setSolicitorFirm] = useState('')
  const fc = store.getById(caseId)
  if (!fc) return null
  const current = fc as FamilyCase

  function addParty() {
    if (!firstName.trim() || !lastName.trim()) return
    const updated: FamilyCase = {
      ...current,
      parties: [
        ...current.parties,
        {
          id: generateId('PTY'),
          role,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          solicitorFirm: solicitorFirm.trim() || undefined,
        },
      ],
    }
    store.addOrUpdate(updated)
    setFirstName(''); setLastName(''); setSolicitorFirm('')
  }
  return (
    <div className="mb-3">
      <Card className="mb-3 p-3">
        <Card.Title>Add party</Card.Title>
        <Form as={Row} className="g-2 align-items-end">
          <Col md>
            <Form.Group>
              <Form.Label>Role</Form.Label>
              <Form.Select value={role} onChange={e => setRole(e.target.value as Party['role'])}>
                {['Applicant','Respondent','Child','Guardian','Intervener'].map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md>
            <Form.Group>
              <Form.Label>First name</Form.Label>
              <Form.Control value={firstName} onChange={e => setFirstName(e.target.value)} />
            </Form.Group>
          </Col>
          <Col md>
            <Form.Group>
              <Form.Label>Last name</Form.Label>
              <Form.Control value={lastName} onChange={e => setLastName(e.target.value)} />
            </Form.Group>
          </Col>
          <Col md>
            <Form.Group>
              <Form.Label>Solicitor firm</Form.Label>
              <Form.Control value={solicitorFirm} onChange={e => setSolicitorFirm(e.target.value)} />
            </Form.Group>
          </Col>
          <Col md="auto">
            <Button variant="primary" onClick={addParty} disabled={!firstName || !lastName}>Add</Button>
          </Col>
        </Form>
      </Card>
      {fc.parties.length === 0 && <div className="text-muted">No parties recorded.</div>}
      {fc.parties.map((p) => (
        <Card key={p.id} className="mb-2 p-2">
          <div className="fw-bold">{p.role}: {p.firstName} {p.lastName}</div>
          <div className="text-muted">{p.solicitorFirm ? `Solicitor: ${p.solicitorFirm}` : 'No solicitor'}</div>
        </Card>
      ))}
    </div>
  )
}

function HearingsTab({ caseId }: { caseId: string }) {
  const store = useCasesStore()
  const [type, setType] = useState<Hearing['type']>('Case Management')
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0,10))
  const [time, setTime] = useState<string>('10:00')
  const [location, setLocation] = useState<string>('')
  const [judge, setJudge] = useState<string>('')
  const [notes, setNotes] = useState<string>('')
  const fc = store.getById(caseId)
  if (!fc) return null
  const current = fc as FamilyCase

  function addHearing() {
    if (!date) return
    const updated: FamilyCase = {
      ...current,
      hearings: [
        ...current.hearings,
        { id: generateId('HRG'), type, date, time: time || undefined, location: location || undefined, judge: judge || undefined, notes: notes || undefined },
      ],
    }
    store.addOrUpdate(updated)
    setLocation(''); setJudge(''); setNotes('')
  }
  return (
    <div className="mb-3">
      <Card className="mb-3 p-3">
        <Card.Title>Schedule hearing</Card.Title>
        <Form as={Row} className="g-2 align-items-end">
          <Col md>
            <Form.Group>
              <Form.Label>Type</Form.Label>
              <Form.Select value={type} onChange={e => setType(e.target.value as Hearing['type'])}>
                {['Case Management','Directions','Fact-Finding','Final','Other'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md>
            <Form.Group>
              <Form.Label>Date</Form.Label>
              <Form.Control type="date" value={date} onChange={e => setDate(e.target.value)} />
            </Form.Group>
          </Col>
          <Col md>
            <Form.Group>
              <Form.Label>Time</Form.Label>
              <Form.Control type="time" value={time} onChange={e => setTime(e.target.value)} />
            </Form.Group>
          </Col>
          <Col md>
            <Form.Group>
              <Form.Label>Location</Form.Label>
              <Form.Control value={location} onChange={e => setLocation(e.target.value)} />
            </Form.Group>
          </Col>
          <Col md>
            <Form.Group>
              <Form.Label>Judge</Form.Label>
              <Form.Control value={judge} onChange={e => setJudge(e.target.value)} />
            </Form.Group>
          </Col>
          <Col md="auto">
            <Button variant="primary" onClick={addHearing} disabled={!date}>Add</Button>
          </Col>
        </Form>
        <Form.Group className="mt-3">
          <Form.Label>Notes (optional)</Form.Label>
          <Form.Control as="textarea" rows={2} value={notes} onChange={e => setNotes(e.target.value)} />
        </Form.Group>
      </Card>
      {fc.hearings.length === 0 && <div className="text-muted">No hearings scheduled.</div>}
      {fc.hearings.map((h) => (
        <Card key={h.id} className="mb-2 p-2">
          <div className="fw-bold">{h.type} — {h.date}{h.time ? ` ${h.time}` : ''}</div>
          <div className="text-muted">{h.location || 'Location TBC'}{h.judge ? ` • Judge: ${h.judge}` : ''}</div>
          {h.notes && <div className="mt-1">{h.notes}</div>}
        </Card>
      ))}
    </div>
  )
}

function DocumentsTab({ caseId }: { caseId: string }) {
  const store = useCasesStore()
  const [title, setTitle] = useState('')
  const [type, setType] = useState<DocumentRecord['type']>('Application')
  const [url, setUrl] = useState('')
  const [notes, setNotes] = useState('')
  const fc = store.getById(caseId)
  if (!fc) return null
  const current = fc as FamilyCase

  function addDocument() {
    if (!title.trim()) return
    const updated: FamilyCase = {
      ...current,
      documents: [
        ...current.documents,
        { id: generateId('DOC'), title: title.trim(), type, uploadedAt: new Date().toISOString(), url: url.trim() || '#', notes: notes.trim() || undefined },
      ],
    }
    store.addOrUpdate(updated)
    setTitle(''); setUrl(''); setNotes('')
  }
  return (
    <div className="mb-3">
      <Card className="mb-3 p-3">
        <Card.Title>Add document (URL)</Card.Title>
        <Form as={Row} className="g-2 align-items-end">
          <Col md>
            <Form.Group>
              <Form.Label>Title</Form.Label>
              <Form.Control value={title} onChange={e => setTitle(e.target.value)} />
            </Form.Group>
          </Col>
          <Col md>
            <Form.Group>
              <Form.Label>Type</Form.Label>
              <Form.Select value={type} onChange={e => setType(e.target.value as DocumentRecord['type'])}>
                {['Application','Statement','Medical','Expert Report','Bundle','Order','Other'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md>
            <Form.Group>
              <Form.Label>URL</Form.Label>
              <Form.Control value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." />
            </Form.Group>
          </Col>
          <Col md="auto">
            <Button variant="primary" onClick={addDocument} disabled={!title}>Add</Button>
          </Col>
        </Form>
        <Form.Group className="mt-3">
          <Form.Label>Notes (optional)</Form.Label>
          <Form.Control as="textarea" rows={2} value={notes} onChange={e => setNotes(e.target.value)} />
        </Form.Group>
      </Card>
      {fc.documents.length === 0 && <div className="text-muted">No documents uploaded.</div>}
      {fc.documents.map((d) => (
        <Card key={d.id} className="mb-2 p-2">
          <div className="fw-bold">{d.title}</div>
          <div className="text-muted">{d.type} • Uploaded {new Date(d.uploadedAt).toLocaleString()}</div>
        </Card>
      ))}
    </div>
  )
}

function OrdersTab({ caseId }: { caseId: string }) {
  const store = useCasesStore()
  const [type, setType] = useState<OrderRecord['type']>('Child Arrangements Order')
  const [dateMade, setDateMade] = useState<string>(new Date().toISOString().slice(0,10))
  const [summary, setSummary] = useState<string>('')
  const [expiresOn, setExpiresOn] = useState<string>('')
  const fc = store.getById(caseId)
  if (!fc) return null
  const current = fc as FamilyCase

  function addOrder() {
    if (!dateMade || !summary.trim()) return
    const updated: FamilyCase = {
      ...current,
      orders: [
        ...current.orders,
        { id: generateId('ORD'), type, dateMade, summary: summary.trim(), expiresOn: expiresOn || undefined },
      ],
    }
    store.addOrUpdate(updated)
    setSummary(''); setExpiresOn('')
  }
  return (
    <div className="mb-3">
      <Card className="mb-3 p-3">
        <Card.Title>Record order</Card.Title>
        <Form as={Row} className="g-2 align-items-end">
          <Col md>
            <Form.Group>
              <Form.Label>Type</Form.Label>
              <Form.Select value={type} onChange={e => setType(e.target.value as OrderRecord['type'])}>
                {['Child Arrangements Order','Care Order','Supervision Order','Non-Molestation Order','Prohibited Steps Order','Specific Issue Order','Financial Remedies Order','Other'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md>
            <Form.Group>
              <Form.Label>Date made</Form.Label>
              <Form.Control type="date" value={dateMade} onChange={e => setDateMade(e.target.value)} />
            </Form.Group>
          </Col>
          <Col md>
            <Form.Group>
              <Form.Label>Expires on (optional)</Form.Label>
              <Form.Control type="date" value={expiresOn} onChange={e => setExpiresOn(e.target.value)} />
            </Form.Group>
          </Col>
          <Col md="auto">
            <Button variant="primary" onClick={addOrder} disabled={!summary || !dateMade}>Add</Button>
          </Col>
        </Form>
        <Form.Group className="mt-3">
          <Form.Label>Summary</Form.Label>
          <Form.Control as="textarea" rows={2} value={summary} onChange={e => setSummary(e.target.value)} />
        </Form.Group>
      </Card>
      {fc.orders.length === 0 && <div className="text-muted">No orders recorded.</div>}
      {fc.orders.map((o) => (
        <Card key={o.id} className="mb-2 p-2">
          <div className="fw-bold">{o.type} — {o.dateMade}</div>
          <div className="text-muted">{o.summary}</div>
        </Card>
      ))}
    </div>
  )
}

function NotesTab({ caseId }: { caseId: string }) {
  const store = useCasesStore()
  const [author, setAuthor] = useState('')
  const [text, setText] = useState('')
  const fc = store.getById(caseId)
  if (!fc) return null
  const current = fc as FamilyCase

  function addNote() {
    if (!text.trim()) return
    const updated: FamilyCase = {
      ...current,
      notes: [
        ...current.notes,
        { id: generateId('NOTE'), createdAt: new Date().toISOString(), author: author.trim() || 'User', text: text.trim() },
      ],
    }
    store.addOrUpdate(updated)
    setText('')
  }
  return (
    <div className="mb-3">
      <Card className="mb-3 p-3">
        <Card.Title>Add note</Card.Title>
        <Form>
          <Form.Group className="mb-2">
            <Form.Label>Author (optional)</Form.Label>
            <Form.Control value={author} onChange={e => setAuthor(e.target.value)} />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Note</Form.Label>
            <Form.Control as="textarea" rows={3} value={text} onChange={e => setText(e.target.value)} />
          </Form.Group>
          <Button variant="primary" onClick={addNote} disabled={!text.trim()}>Add</Button>
        </Form>
      </Card>
      {fc.notes.length === 0 && <div className="text-muted">No notes yet.</div>}
      {fc.notes.map((n) => (
        <Card key={n.id} className="mb-2 p-2">
          <div className="text-muted">{new Date(n.createdAt).toLocaleString()} — {n.author}</div>
          <div>{n.text}</div>
        </Card>
      ))}
    </div>
  )
}

function TeamInvitesTab({ caseId }: { caseId: string }) {
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

  const allInvites = getAllInvites().filter(i => i.caseId === caseId)
  const allUsers = listUsers()

  function generateInviteLink() {
    if (!user) return
    const token = generateId('INV')
    const invite = {
      id: generateId('INV'),
      caseId: current.id,
      token,
      role: inviteRole,
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    }
    createInvite(invite)
    const inviteUrl = `${window.location.origin}/invite/${token}`
    setGeneratedInvite(inviteUrl)
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
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
      <Card className="mb-3 p-3">
        <Card.Title>Generate Invite Link</Card.Title>
        <Form.Group className="mb-2">
          <Form.Label>Invite Role</Form.Label>
          <Form.Select value={inviteRole} onChange={e => setInviteRole(e.target.value as 'McKenzieFriend' | 'Solicitor' | 'Barrister')}>
            <option value="McKenzieFriend">McKenzie Friend</option>
            <option value="Solicitor">Solicitor</option>
            <option value="Barrister">Barrister</option>
          </Form.Select>
        </Form.Group>
        <Button variant="primary" onClick={generateInviteLink} className="mb-2" block>
          Generate Invite Link
        </Button>
        {generatedInvite && (
          <div className="p-2 bg-light rounded mb-2">
            <div className="small text-muted mb-1">Invite Link:</div>
            <div className="d-flex align-items-center">
              <span className="flex-grow-1 text-break">{generatedInvite}</span>
              <Button size="sm" variant="outline-secondary" onClick={() => copyToClipboard(generatedInvite)} className="ms-2">Copy</Button>
            </div>
          </div>
        )}
      </Card>

      {/* Add Solicitor */}
      <Card className="mb-3 p-3">
        <Card.Title>Add Solicitor</Card.Title>
        <Form as={Row} className="g-2 align-items-end">
          <Col md>
            <Form.Group>
              <Form.Label>Solicitor Name</Form.Label>
              <Form.Control value={solicitorName} onChange={e => setSolicitorName(e.target.value)} />
            </Form.Group>
          </Col>
          <Col md>
            <Form.Group>
              <Form.Label>Firm</Form.Label>
              <Form.Control value={solicitorFirm} onChange={e => setSolicitorFirm(e.target.value)} />
            </Form.Group>
          </Col>
          <Col md="auto">
            <Button variant="primary" onClick={addSolicitor} disabled={!solicitorName.trim()}>Add Solicitor</Button>
          </Col>
        </Form>
      </Card>

      {/* Add Barrister */}
      <Card className="mb-3 p-3">
        <Card.Title>Add Barrister</Card.Title>
        <Form as={Row} className="g-2 align-items-end">
          <Col md>
            <Form.Group>
              <Form.Label>Barrister Name</Form.Label>
              <Form.Control value={barristerName} onChange={e => setBarristerName(e.target.value)} />
            </Form.Group>
          </Col>
          <Col md>
            <Form.Group>
              <Form.Label>Chambers</Form.Label>
              <Form.Control value={barristerChambers} onChange={e => setBarristerChambers(e.target.value)} />
            </Form.Group>
          </Col>
          <Col md="auto">
            <Button variant="primary" onClick={addBarrister} disabled={!barristerName.trim()}>Add Barrister</Button>
          </Col>
        </Form>
      </Card>

      {/* Existing Invites */}
      {allInvites.length > 0 && (
        <Card className="mb-3 p-3">
          <Card.Title>Active Invites</Card.Title>
          {allInvites.map((invite) => {
            const inviteUrl = `${window.location.origin}/invite/${invite.token}`
            return (
              <div key={invite.id} className="p-2 bg-light rounded mb-2 d-flex align-items-center">
                <span className="badge bg-info text-dark me-2">{invite.role}</span>
                <span className="flex-grow-1">{invite.usedAt ? 'Used' : 'Active'} • Created {new Date(invite.createdAt).toLocaleDateString()}</span>
                {!invite.usedAt && (
                  <Button size="sm" variant="outline-secondary" onClick={() => copyToClipboard(inviteUrl)} className="ms-2">Copy Link</Button>
                )}
              </div>
            )
          })}
        </Card>
      )}

      {/* Case Members */}
      {fc.members && fc.members.length > 0 && (
        <Card className="mb-3 p-3">
          <Card.Title>Case Team</Card.Title>
          {fc.members.map((member) => {
            const memberUser = allUsers.find(u => u.id === member.userId)
            return (
              <div key={member.userId} className="mb-2">
                <div className="fw-bold">{memberUser?.name || 'Unknown User'} ({member.role})</div>
                {memberUser?.email && (
                  <div className="text-muted">{memberUser.email}</div>
                )}
              </div>
            )
          })}
        </Card>
      )}
    </div>
  )
}

export default function CaseDetails() {
  const { caseId } = useParams()
  const navigate = useNavigate()
  const { getById } = useCasesStore()
  const fc = useMemo(() => (caseId ? getById(caseId) : undefined), [caseId, getById])
  const [tab, setTab] = useState(0)

  if (!caseId || !fc) return <div className="text-danger">Case not found.</div>;

  return (
    <div className="mb-3">
      <div className="container-fluid p-0">
        <div className="row mb-3 align-items-center">
          <div className="col">
            <h4>{fc.id} — {fc.title}</h4>
            <div className="small mb-1">{fc.court} • {fc.caseType} • Started {fc.startedAt}</div>
            <div className="d-flex gap-2 mb-2 flex-wrap">
              <span className="badge bg-success fw-semibold px-3 py-2">{fc.status}</span>
              <span className="badge bg-primary fw-semibold px-3 py-2">Parties: {fc.parties.length}</span>
              <span className="badge bg-warning text-dark fw-semibold px-3 py-2">Hearings: {fc.hearings.length}</span>
            </div>
          </div>
          <div className="col-auto d-flex gap-2">
            <Button variant="outline-primary" onClick={() => navigate(`/cases/${fc.id}/edit`)}>Edit</Button>
            <Button as="a" href="/" variant="link">Back to cases</Button>
          </div>
        </div>
        <Card className="mb-3">
          <Card.Body>
            <Tabs
              id="case-details-tabs"
              activeKey={tab}
              onSelect={(k: string | null) => setTab(Number(k))}
              className="mb-3"

            >
              <Tab eventKey={0} title="Parties">
                <PartiesTab caseId={fc.id} />
              </Tab>
              <Tab eventKey={1} title="Hearings">
                <HearingsTab caseId={fc.id} />
              </Tab>
              <Tab eventKey={2} title="Documents">
                <DocumentsTab caseId={fc.id} />
              </Tab>
              <Tab eventKey={3} title="Orders">
                <OrdersTab caseId={fc.id} />
              </Tab>
              <Tab eventKey={4} title="Notes">
                <NotesTab caseId={fc.id} />
              </Tab>
              <Tab eventKey={5} title="Team & Invites">
                <TeamInvitesTab caseId={fc.id} />
              </Tab>
            </Tabs>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}


