// EditablePartyCard: Inline edit/delete for a Party
function EditablePartyCard({ party, onSave, onDelete }: {
  party: Party,
  onSave: (p: Party) => void,
  onDelete: () => void,
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Party>({ ...party });
  return (
    <Card className="mb-2 p-2">
      {editing ? (
        <Form as={Row} className="g-2 align-items-end">
          <Col md>
            <Form.Group>
              <Form.Label>Role</Form.Label>
              <Form.Select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as Party['role'] }))}>
                {['Applicant', 'Respondent', 'Child', 'Guardian', 'Intervener'].map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md>
            <Form.Group>
              <Form.Label>First name</Form.Label>
              <Form.Control value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} />
            </Form.Group>
          </Col>
          <Col md>
            <Form.Group>
              <Form.Label>Last name</Form.Label>
              <Form.Control value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} />
            </Form.Group>
          </Col>
          <Col md>
            <Form.Group>
              <Form.Label>Date of Birth</Form.Label>
              <Form.Control type="date" value={form.dateOfBirth || ''} onChange={e => setForm(f => ({ ...f, dateOfBirth: e.target.value }))} />
            </Form.Group>
          </Col>
          <Col md>
            <Form.Group>
              <Form.Label>Address</Form.Label>
              <Form.Control value={form.address || ''} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
            </Form.Group>
          </Col>
          <Col md>
            <Form.Group>
              <Form.Label>Contact Email</Form.Label>
              <Form.Control type="email" value={form.contactEmail || ''} onChange={e => setForm(f => ({ ...f, contactEmail: e.target.value }))} />
            </Form.Group>
          </Col>
          <Col md>
            <Form.Group>
              <Form.Label>Contact Phone</Form.Label>
              <Form.Control type="tel" value={form.contactPhone || ''} onChange={e => setForm(f => ({ ...f, contactPhone: e.target.value }))} />
            </Form.Group>
          </Col>
          <Col md>
            <Form.Group>
              <Form.Label>Solicitor firm</Form.Label>
              <Form.Control value={form.solicitorFirm || ''} onChange={e => setForm(f => ({ ...f, solicitorFirm: e.target.value }))} />
            </Form.Group>
          </Col>
          <Col md="auto">
            <Button variant="success" onClick={() => { onSave(form); setEditing(false); }} disabled={!form.firstName || !form.lastName}>Save</Button>{' '}
            <Button variant="secondary" onClick={() => { setForm({ ...party }); setEditing(false); }}>Cancel</Button>{' '}
            <Button variant="danger" onClick={onDelete}>Delete</Button>
          </Col>
        </Form>
      ) : (
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <div className="fw-bold">{party.role}: {party.firstName} {party.lastName}</div>
            <div className="small text-muted">
              {party.dateOfBirth && <>DOB: {party.dateOfBirth} <br /></>}
              {party.address && <>Address: {party.address} <br /></>}
              {party.contactEmail && <>Email: {party.contactEmail} <br /></>}
              {party.contactPhone && <>Phone: {party.contactPhone}</>}
            </div>
            <div className="text-muted">{party.solicitorFirm ? `Solicitor: ${party.solicitorFirm}` : 'No solicitor'}</div>
          </div>
          <div>
            <Button variant="outline-primary" size="sm" onClick={() => setEditing(true)}>Edit</Button>{' '}
            <Button variant="outline-danger" size="sm" onClick={onDelete}>Delete</Button>
          </div>
        </div>
      )}
    </Card>
  );
}

// EditableHearingCard: Inline edit/delete for a Hearing
function EditableHearingCard({ hearing, onSave, onDelete }: {
  hearing: Hearing,
  onSave: (h: Hearing) => void,
  onDelete: () => void,
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Hearing>({ ...hearing });
  return (
    <div>
      <Card className="mb-2 p-2">
        {editing ? (
          <>
            <Form as={Row} className="g-2 align-items-end">
              <Col md>
                <Form.Group>
                  <Form.Label>Type</Form.Label>
                  <Form.Select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as Hearing['type'] }))}>
                    {['Case Management', 'Directions', 'Fact-Finding', 'Final', 'Other'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md>
                <Form.Group>
                  <Form.Label>Date</Form.Label>
                  <Form.Control type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                </Form.Group>
              </Col>
              <Col md>
                <Form.Group>
                  <Form.Label>Time</Form.Label>
                  <Form.Control type="time" value={form.time || ''} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} />
                </Form.Group>
              </Col>
              <Col md>
                <Form.Group>
                  <Form.Label>Location</Form.Label>
                  <Form.Control value={form.location || ''} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
                </Form.Group>
              </Col>
              <Col md>
                <Form.Group>
                  <Form.Label>Judge</Form.Label>
                  <Form.Control value={form.judge || ''} onChange={e => setForm(f => ({ ...f, judge: e.target.value }))} />
                </Form.Group>
              </Col>
              <Col md="auto">
                <Button variant="success" onClick={() => { onSave(form); setEditing(false); }} disabled={!form.date}>Save</Button>{' '}
                <Button variant="secondary" onClick={() => { setForm({ ...hearing }); setEditing(false); }}>Cancel</Button>{' '}
                <Button variant="danger" onClick={onDelete}>Delete</Button>
              </Col>
            </Form>
            <Form.Group className="mt-2">
              <Form.Label>Notes (optional)</Form.Label>
              <Form.Control as="textarea" rows={2} value={form.notes || ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </Form.Group>
          </>
        ) : (
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <div className="fw-bold">{hearing.type} — {hearing.date}{hearing.time ? ` ${hearing.time}` : ''}</div>
              <div className="text-muted">{hearing.location || 'Location TBC'}{hearing.judge ? ` • Judge: ${hearing.judge}` : ''}</div>
              {hearing.notes && <div className="mt-1">{hearing.notes}</div>}
            </div>
            <div>
              <Button variant="outline-primary" size="sm" onClick={() => setEditing(true)}>Edit</Button>{' '}
              <Button variant="outline-danger" size="sm" onClick={onDelete}>Delete</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

// EditableDocumentCard: Inline edit/delete for a Document
function EditableDocumentCard({ document, onSave, onDelete }: {
  document: DocumentRecord,
  onSave: (d: DocumentRecord) => void,
  onDelete: () => void,
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<DocumentRecord>({ ...document });
  return (
    <div>
      <Card className="mb-2 p-2">
        {editing ? (
          <>
            <Form as={Row} className="g-2 align-items-end">
              <Col md>
                <Form.Group>
                  <Form.Label>Title</Form.Label>
                  <Form.Control value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                </Form.Group>
              </Col>
              <Col md>
                <Form.Group>
                  <Form.Label>Type</Form.Label>
                  <Form.Select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as DocumentRecord['type'] }))}>
                    {['Application', 'Statement', 'Medical', 'Expert Report', 'Bundle', 'Order', 'Other'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md>
                <Form.Group>
                  <Form.Label>URL</Form.Label>
                  <Form.Control value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} />
                </Form.Group>
              </Col>
              <Col md="auto">
                <Button variant="success" onClick={() => { onSave(form); setEditing(false); }} disabled={!form.title}>Save</Button>{' '}
                <Button variant="secondary" onClick={() => { setForm({ ...document }); setEditing(false); }}>Cancel</Button>{' '}
                <Button variant="danger" onClick={onDelete}>Delete</Button>
              </Col>
            </Form>
            <Form.Group className="mt-2">
              <Form.Label>Notes (optional)</Form.Label>
              <Form.Control as="textarea" rows={2} value={form.notes || ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </Form.Group>
          </>
        ) : (
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <div className="fw-bold">{document.title} ({document.type})</div>
              <div className="text-muted">{document.url}</div>
              {document.notes && <div className="mt-1">{document.notes}</div>}
            </div>
            <div>
              <Button variant="outline-primary" size="sm" onClick={() => setEditing(true)}>Edit</Button>{' '}
              <Button variant="outline-danger" size="sm" onClick={onDelete}>Delete</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

// EditableOrderCard: Inline edit/delete for an Order
function EditableOrderCard({ order, onSave, onDelete }: {
  order: OrderRecord,
  onSave: (o: OrderRecord) => void,
  onDelete: () => void,
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<OrderRecord>({ ...order });
  return (
    <div>
      <Card className="mb-2 p-2">
        {editing ? (
          <>
            <Form as={Row} className="g-2 align-items-end">
              <Col md>
                <Form.Group>
                  <Form.Label>Type</Form.Label>
                  <Form.Select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as OrderRecord['type'] }))}>
                    {['Child Arrangements Order', 'Care Order', 'Supervision Order', 'Non-Molestation Order', 'Prohibited Steps Order', 'Specific Issue Order', 'Financial Remedies Order', 'Other'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md>
                <Form.Group>
                  <Form.Label>Date made</Form.Label>
                  <Form.Control type="date" value={form.dateMade} onChange={e => setForm(f => ({ ...f, dateMade: e.target.value }))} />
                </Form.Group>
              </Col>
              <Col md>
                <Form.Group>
                  <Form.Label>Expires on (optional)</Form.Label>
                  <Form.Control type="date" value={form.expiresOn || ''} onChange={e => setForm(f => ({ ...f, expiresOn: e.target.value }))} />
                </Form.Group>
              </Col>
              <Col md="auto">
                <Button variant="success" onClick={() => { onSave(form); setEditing(false); }} disabled={!form.summary || !form.dateMade}>Save</Button>{' '}
                <Button variant="secondary" onClick={() => { setForm({ ...order }); setEditing(false); }}>Cancel</Button>{' '}
                <Button variant="danger" onClick={onDelete}>Delete</Button>
              </Col>
            </Form>
            <Form.Group className="mt-2">
              <Form.Label>Summary</Form.Label>
              <Form.Control as="textarea" rows={2} value={form.summary || ''} onChange={e => setForm(f => ({ ...f, summary: e.target.value }))} />
            </Form.Group>
          </>
        ) : (
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <div className="fw-bold">{order.type} — {order.dateMade}</div>
              <div className="text-muted">{order.expiresOn ? `Expires: ${order.expiresOn}` : 'No expiry'}</div>
              {order.summary && <div className="mt-1">{order.summary}</div>}
            </div>
            <div>
              <Button variant="outline-primary" size="sm" onClick={() => setEditing(true)}>Edit</Button>{' '}
              <Button variant="outline-danger" size="sm" onClick={onDelete}>Delete</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
import { useMemo, useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCasesStore } from '../store/casesStore'
import { Button, Card, Form, Row, Col, Tabs, Tab, Accordion } from 'react-bootstrap'
import { Steps } from 'antd'
import {
  FileOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  SolutionOutlined,
  AuditOutlined,
  FolderOpenOutlined,
  FileProtectOutlined,
  FileSyncOutlined,
} from '@ant-design/icons'
import { getStagesForCase, getCurrentStageIndex } from '../utils/caseStages'
// Map stage ids to icons
const stageIcons: Record<string, React.ReactNode> = {
  application: <FileOutlined />,
  'pre-proceedings': <ExclamationCircleOutlined />,
  'first-hearing': <CalendarOutlined />,
  directions: <SolutionOutlined />,
  'fact-finding': <AuditOutlined />,
  welfare: <ClockCircleOutlined />,
  final: <CheckCircleOutlined />,
  'without-notice': <ExclamationCircleOutlined />,
  service: <FileProtectOutlined />,
  'return-hearing': <CalendarOutlined />,
  'first-appointment': <CalendarOutlined />,
  disclosure: <FileSyncOutlined />,
  fdr: <SolutionOutlined />,
  assessment: <FolderOpenOutlined />,
}

import type { FamilyCase, Party, Hearing, DocumentRecord, OrderRecord } from '../types/domain'
import { generateId, createInvite, getAllInvites } from '../services/storage'
import { useAuthStore } from '../store/authStore'
import { listUsers } from '../services/auth'

function PartiesTab({ caseId }: { caseId: string }) {
  const store = useCasesStore()
  const [role, setRole] = useState<Party['role']>('Applicant')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [address, setAddress] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
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
          dateOfBirth: dateOfBirth || undefined,
          address: address.trim() || undefined,
          contactEmail: contactEmail.trim() || undefined,
          contactPhone: contactPhone.trim() || undefined,
          solicitorFirm: solicitorFirm.trim() || undefined,
        },
      ],
    }
    store.addOrUpdate(updated)
    setFirstName(''); setLastName(''); setDateOfBirth(''); setAddress(''); setContactEmail(''); setContactPhone(''); setSolicitorFirm('')
  }
  const nonChildren = fc.parties.filter(p => p.role !== 'Child' || (p.role === 'Child' && p.solicitorFirm));
  const children = fc.parties.filter(p => p.role === 'Child' && !p.solicitorFirm);
  return (
    <div className="mb-3">
      <Card className="mb-3 p-3">
        <Card.Title>Add party</Card.Title>
        <Form as={Row} className="g-2 align-items-end">
          <Col md>
            <Form.Group>
              <Form.Label>Role</Form.Label>
              <Form.Select value={role} onChange={e => setRole(e.target.value as Party['role'])}>
                {['Applicant', 'Respondent', 'Child', 'Guardian', 'Intervener'].map(r => (
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
              <Form.Label>Date of Birth</Form.Label>
              <Form.Control type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} />
            </Form.Group>
          </Col>
          <Col md>
            <Form.Group>
              <Form.Label>Address</Form.Label>
              <Form.Control value={address} onChange={e => setAddress(e.target.value)} />
            </Form.Group>
          </Col>
          <Col md>
            <Form.Group>
              <Form.Label>Contact Email</Form.Label>
              <Form.Control type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} />
            </Form.Group>
          </Col>
          <Col md>
            <Form.Group>
              <Form.Label>Contact Phone</Form.Label>
              <Form.Control type="tel" value={contactPhone} onChange={e => setContactPhone(e.target.value)} />
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
      {/* Non-children parties */}
      {nonChildren.length > 0 && (
        <Card className="mb-3 p-3">
          <Card.Title>Parties</Card.Title>
          {nonChildren.map((p) => (
            <EditablePartyCard
              key={p.id}
              party={p}
              onSave={updatedParty => {
                const updated: FamilyCase = {
                  ...current,
                  parties: current.parties.map(part => part.id === p.id ? updatedParty : part),
                }
                store.addOrUpdate(updated)
              }}
              onDelete={() => {
                const updated: FamilyCase = {
                  ...current,
                  parties: current.parties.filter(part => part.id !== p.id),
                }
                store.addOrUpdate(updated)
              }}
            />
          ))}
        </Card>
      )}
      {/* Children section */}
      {children.length > 0 && (
        <Card className="mb-3 p-3 border-info">
          <Card.Title>Children</Card.Title>
          {children.map((p) => (
            <EditablePartyCard
              key={p.id}
              party={p}
              onSave={updatedParty => {
                const updated: FamilyCase = {
                  ...current,
                  parties: current.parties.map(part => part.id === p.id ? updatedParty : part),
                }
                store.addOrUpdate(updated)
              }}
              onDelete={() => {
                const updated: FamilyCase = {
                  ...current,
                  parties: current.parties.filter(part => part.id !== p.id),
                }
                store.addOrUpdate(updated)
              }}
            />
          ))}
        </Card>
      )}
    </div>
  )
}

function HearingsTab({ caseId }: { caseId: string }) {
  const store = useCasesStore()
  const [type, setType] = useState<Hearing['type']>('Case Management')
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10))
  const [time, setTime] = useState<string>('10:00')
  const [location, setLocation] = useState<string>('')
  const [judge, setJudge] = useState<string>('')
  const [notes, setNotes] = useState<string>('')
  const [courtNames, setCourtNames] = useState<string[]>([])
  // Import useEffect from React
  // ...existing code...
  useEffect(() => {
    import('../utils/courtLocations').then(mod => {
      mod.getCourtNames().then(names => setCourtNames(names))
    })
  }, [])
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
                {['Case Management', 'Directions', 'Fact-Finding', 'Final', 'Other'].map(t => (
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
              <Form.Control
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                list="court-names-list"
                placeholder="Type or select location"
                autoComplete="off"
              />
              <datalist id="court-names-list">
                {courtNames.map(name => (
                  <option key={name} value={name} />
                ))}
              </datalist>
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
        <EditableHearingCard
          key={h.id}
          hearing={h}
          onSave={updatedHearing => {
            const updated: FamilyCase = {
              ...current,
              hearings: current.hearings.map(hrg => hrg.id === h.id ? updatedHearing : hrg),
            }
            store.addOrUpdate(updated)
          }}
          onDelete={() => {
            const updated: FamilyCase = {
              ...current,
              hearings: current.hearings.filter(hrg => hrg.id !== h.id),
            }
            store.addOrUpdate(updated)
          }}
        />
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
                {['Application', 'Statement', 'Medical', 'Expert Report', 'Bundle', 'Order', 'Other'].map(t => (
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
        <EditableDocumentCard
          key={d.id}
          document={d}
          onSave={updatedDoc => {
            const updated: FamilyCase = {
              ...current,
              documents: current.documents.map(doc => doc.id === d.id ? updatedDoc : doc),
            }
            store.addOrUpdate(updated)
          }}
          onDelete={() => {
            const updated: FamilyCase = {
              ...current,
              documents: current.documents.filter(doc => doc.id !== d.id),
            }
            store.addOrUpdate(updated)
          }}
        />
      ))}
    </div>
  )
}

function OrdersTab({ caseId }: { caseId: string }) {
  const store = useCasesStore()
  const [type, setType] = useState<OrderRecord['type']>('Child Arrangements Order')
  const [dateMade, setDateMade] = useState<string>(new Date().toISOString().slice(0, 10))
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
                {['Child Arrangements Order', 'Care Order', 'Supervision Order', 'Non-Molestation Order', 'Prohibited Steps Order', 'Specific Issue Order', 'Financial Remedies Order', 'Other'].map(t => (
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
        <EditableOrderCard
          key={o.id}
          order={o}
          onSave={updatedOrder => {
            const updated: FamilyCase = {
              ...current,
              orders: current.orders.map(ord => ord.id === o.id ? updatedOrder : ord),
            }
            store.addOrUpdate(updated)
          }}
          onDelete={() => {
            const updated: FamilyCase = {
              ...current,
              orders: current.orders.filter(ord => ord.id !== o.id),
            }
            store.addOrUpdate(updated)
          }}
        />
      ))}
    </div>
  )
}

function NotesTab({ caseId }: { caseId: string }) {
  const store = useCasesStore()
  const { user } = useAuthStore()
  const [author, setAuthor] = useState(user?.name || '')
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
        <Button variant="primary" onClick={generateInviteLink} className="mb-2">
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
              <span className="badge bg-primary fw-semibold px-3 py-2">
                Parties: {fc.parties.filter(p => p.role !== 'Child' || (p.role === 'Child' && p.solicitorFirm)).length}
              </span>
              <span className="badge bg-info fw-semibold px-3 py-2">Children: {fc.parties.filter(p => p.role === 'Child').length}</span>
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
              <Tab eventKey={0} title="Case Detail">

                <Card className="mb-3 p-3">
                  <Card.Title>Case Progress</Card.Title>
                  <Card.Body>
                    <div className="flex-grow-1 ms-md-4">
                      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', overflowX: 'auto', padding: '8px 0' }}>
                        <Steps
                          current={getCurrentStageIndex(fc)}
                          direction="vertical"
                          size="small"
                          style={{ marginTop: 8, marginBottom: 8, width: '100%' }}
                          items={getStagesForCase(fc).map((stage) => ({
                            title: <span style={{ whiteSpace: 'nowrap' }}>{stage.name}</span>,
                            description: <span style={{ whiteSpace: 'nowrap' }}>{stage.description}</span>,
                            icon: stageIcons[stage.id] || <FileOutlined />,
                          }))}
                        />
                      </div>
                    </div>
                  </Card.Body>
                </Card>

                {/* Improved layout: sections with Bootstrap Accordion */}
                <div className="mb-3">
                <Accordion activeKey={["0","1a","1","2","3","4"]} alwaysOpen>
                    <Accordion.Item eventKey="0">
                      <Accordion.Header>Case Summary</Accordion.Header>
                      <Accordion.Body>
                        <div>
                          <div className="mb-1"><b>Case Number:</b> {fc.id}</div>
                          <div className="mb-1"><b>Title:</b> {fc.title}</div>
                          <div className="mb-1"><b>Court:</b> {fc.court}</div>
                          <div className="mb-1"><b>Type:</b> {fc.caseType}</div>
                          <div className="mb-1"><b>Status:</b> {fc.status}</div>
                          <div className="mb-1"><b>Started:</b> {fc.startedAt}</div>
                          {fc.allocatedJudge && <div className="mb-1"><b>Allocated Judge:</b> {fc.allocatedJudge}</div>}
                          {fc.childrenInvolved !== undefined && <div className="mb-1"><b>Children Involved:</b> {fc.childrenInvolved}</div>}
                        </div>
                      </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="1">
                      <Accordion.Header>Parties</Accordion.Header>
                      <Accordion.Body>
                        {fc.parties.filter(p => p.role !== 'Child' || (p.role === 'Child' && p.solicitorFirm)).length === 0 && <div className="text-muted">No parties</div>}
                        {fc.parties.filter(p => p.role !== 'Child' || (p.role === 'Child' && p.solicitorFirm)).map(p => (
                          <div key={p.id} className="border rounded p-2 mb-2">
                            <b>{p.role}:</b> {p.firstName} {p.lastName}
                            {p.dateOfBirth && <div className="small text-muted">DOB: {p.dateOfBirth}</div>}
                            {p.address && <div className="small text-muted">Address: {p.address}</div>}
                            {p.contactEmail && <div className="small text-muted">Email: {p.contactEmail}</div>}
                            {p.contactPhone && <div className="small text-muted">Phone: {p.contactPhone}</div>}
                            {p.solicitorFirm && <div className="small text-muted">Solicitor: {p.solicitorFirm}</div>}
                          </div>
                        ))}
                      </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="2">
                      <Accordion.Item eventKey="1a">
                        <Accordion.Header>Children</Accordion.Header>
                        <Accordion.Body>
                          {fc.parties.filter(p => p.role === 'Child' && !p.solicitorFirm).length === 0 && <div className="text-muted">No children</div>}
                          {fc.parties.filter(p => p.role === 'Child' && !p.solicitorFirm).map(p => (
                            <div key={p.id} className="border rounded p-2 mb-2">
                              <b>Child:</b> {p.firstName} {p.lastName}
                              {p.dateOfBirth && <div className="small text-muted">DOB: {p.dateOfBirth}</div>}
                              {p.address && <div className="small text-muted">Address: {p.address}</div>}
                              {p.contactEmail && <div className="small text-muted">Email: {p.contactEmail}</div>}
                              {p.contactPhone && <div className="small text-muted">Phone: {p.contactPhone}</div>}
                            </div>
                          ))}
                        </Accordion.Body>
                      </Accordion.Item>
                      <Accordion.Header>Hearings</Accordion.Header>
                      <Accordion.Body>
                        {fc.hearings.length === 0 && <div className="text-muted">No hearings</div>}
                        {fc.hearings.map(h => (
                          <div key={h.id} className="border rounded p-2 mb-2">
                            <b>{h.type}</b> — {h.date}{h.time ? ` ${h.time}` : ''}<br />
                            {h.location && <span className="small text-muted">Location: {h.location} </span>}
                            {h.judge && <span className="small text-muted">Judge: {h.judge}</span>}<br />
                            {h.notes && <span className="small text-muted">Notes: {h.notes}</span>}
                          </div>
                        ))}
                      </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="3">
                      <Accordion.Header>Orders</Accordion.Header>
                      <Accordion.Body>
                        {fc.orders.length === 0 && <div className="text-muted">No orders</div>}
                        {fc.orders.map(o => (
                          <div key={o.id} className="border rounded p-2 mb-2">
                            <b>{o.type}</b> — {o.dateMade}
                            {o.expiresOn && <span className="small text-muted"> (Expires: {o.expiresOn})</span>}<br />
                            <span className="small text-muted">{o.summary}</span>
                          </div>
                        ))}
                      </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="4">
                      <Accordion.Header>Documents</Accordion.Header>
                      <Accordion.Body>
                        {fc.documents.length === 0 && <div className="text-muted">No documents</div>}
                        {fc.documents.map(d => (
                          <div key={d.id} className="border rounded p-2 mb-2">
                            <b>{d.title}</b> ({d.type})<br />
                            <span className="small text-muted">{d.url}</span>
                            {d.notes && <div className="small text-muted">Notes: {d.notes}</div>}
                          </div>
                        ))}
                      </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="5">
                      <Accordion.Header>Notes</Accordion.Header>
                      <Accordion.Body>
                        {fc.notes.length === 0 && <div className="text-muted">No notes</div>}
                        {fc.notes.map(n => (
                          <div key={n.id} className="border rounded p-2 mb-2">
                            <span className="small text-muted">{n.createdAt} by {n.author}</span><br />
                            {n.text}
                          </div>
                        ))}
                      </Accordion.Body>
                    </Accordion.Item>
                  </Accordion>
                </div>
              </Tab>
              <Tab eventKey={1} title="Parties">
                <PartiesTab caseId={fc.id} />
              </Tab>
              <Tab eventKey={2} title="Hearings">
                <HearingsTab caseId={fc.id} />
              </Tab>
              <Tab eventKey={3} title="Documents">
                <DocumentsTab caseId={fc.id} />
              </Tab>
              <Tab eventKey={4} title="Orders">
                <OrdersTab caseId={fc.id} />
              </Tab>
              <Tab eventKey={5} title="Notes">
                <NotesTab caseId={fc.id} />
              </Tab>
              <Tab eventKey={6} title="Team & Invites">
                <TeamInvitesTab caseId={fc.id} />
              </Tab>
            </Tabs>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}


