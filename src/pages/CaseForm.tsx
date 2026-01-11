import { useEffect, useMemo, useState } from 'react'
import { Button, Card, Form, Row, Col } from 'react-bootstrap'
import type { FamilyCase } from '../types/domain'
import { generateId } from '../services/storage'
import { useCasesStore } from '../store/casesStore'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

const courts = ['Family Court', 'High Court Family Division'] as const
const types = [
  'Public Law (Care Proceedings)',
  'Private Law (Child Arrangements)',
  'Domestic Abuse (Non-Molestation)',
  'Financial Remedies',
  'Adoption',
  'Other',
] as const
const statuses = ['Open', 'Stayed', 'Concluded'] as const

export default function CaseForm() {
    // Party form state for adding new parties
    const [partyRole, setPartyRole] = useState<'Applicant'|'Respondent'|'Guardian'|'Intervener'>('Applicant');
    const [partyFirstName, setPartyFirstName] = useState('');
    const [partyLastName, setPartyLastName] = useState('');
    const [partyDateOfBirth, setPartyDateOfBirth] = useState('');
    const [partyAddress, setPartyAddress] = useState('');
    const [partyContactEmail, setPartyContactEmail] = useState('');
    const [partyContactPhone, setPartyContactPhone] = useState('');
    const [partySolicitorFirm, setPartySolicitorFirm] = useState('');

    // Child form state
    const [childFirstName, setChildFirstName] = useState('');
    const [childLastName, setChildLastName] = useState('');
    const [childDateOfBirth, setChildDateOfBirth] = useState('');
    const [childAddress, setChildAddress] = useState('');
    const [childContactEmail, setChildContactEmail] = useState('');
    const [childContactPhone, setChildContactPhone] = useState('');

    function addPartyToForm() {
      if (!partyFirstName.trim() || !partyLastName.trim()) return;
      setForm(f => ({
        ...f,
        parties: [
          ...f.parties,
          {
            id: generateId('PTY'),
            role: partyRole,
            firstName: partyFirstName.trim(),
            lastName: partyLastName.trim(),
            dateOfBirth: partyDateOfBirth || undefined,
            address: partyAddress.trim() || undefined,
            contactEmail: partyContactEmail.trim() || undefined,
            contactPhone: partyContactPhone.trim() || undefined,
            solicitorFirm: partySolicitorFirm.trim() || undefined,
          },
        ],
      }));
      setPartyFirstName(''); setPartyLastName(''); setPartyDateOfBirth(''); setPartyAddress(''); setPartyContactEmail(''); setPartyContactPhone(''); setPartySolicitorFirm('');
    }

    function addChildToForm() {
      if (!childFirstName.trim() || !childLastName.trim()) return;
      setForm(f => ({
        ...f,
        parties: [
          ...f.parties,
          {
            id: generateId('PTY'),
            role: 'Child',
            firstName: childFirstName.trim(),
            lastName: childLastName.trim(),
            dateOfBirth: childDateOfBirth || undefined,
            address: childAddress.trim() || undefined,
            contactEmail: childContactEmail.trim() || undefined,
            contactPhone: childContactPhone.trim() || undefined,
          },
        ],
      }));
      setChildFirstName(''); setChildLastName(''); setChildDateOfBirth(''); setChildAddress(''); setChildContactEmail(''); setChildContactPhone('');
    }

    function removePartyFromForm(id: string) {
      setForm(f => ({ ...f, parties: f.parties.filter(p => p.id !== id) }));
    }
  const navigate = useNavigate()
  const { caseId } = useParams()
  const { getById, addOrUpdate } = useCasesStore()
  const { user } = useAuthStore()

  const existing = useMemo(() => (caseId ? getById(caseId) : undefined), [caseId, getById])

  const [form, setForm] = useState<FamilyCase>(() =>
    existing ?? {
      id: '',
      title: '',
      court: 'Family Court',
      caseType: 'Private Law (Child Arrangements)',
      status: 'Open',
      startedAt: new Date().toISOString().slice(0, 10),
      allocatedJudge: '',
      childrenInvolved: undefined,
      parties: [],
      hearings: [],
      orders: [],
      documents: [],
      notes: [],
      lastUpdatedAt: new Date().toISOString(),
      currentStage: 'application',
    },
  )

  useEffect(() => {
    if (existing) setForm(existing)
  }, [existing])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmedTitle = form.title.trim()
    const trimmedJudge = form.allocatedJudge?.trim() || undefined
    const id = existing?.id || form.id || generateId('CASE')
    const payload: FamilyCase = {
      ...form,
      id,
      title: trimmedTitle,
      allocatedJudge: trimmedJudge,
      startedAt: form.startedAt,
      members: existing?.members ?? (user ? [{ userId: user.id, role: 'Owner' }] : []),
      currentStage: existing?.currentStage || 'application',
    }
    addOrUpdate(payload)
    navigate(`/cases/${id}`)
  }

  return (
    <Card className="p-4 mx-auto">
      <Form onSubmit={handleSubmit}>
        <h4 className="mb-4">{existing ? 'Edit Case' : 'Create New Case'}</h4>
        {/* ...existing case fields... */}
        <Form.Group className="mb-3">
          <Form.Label>Case title</Form.Label>
          <Form.Control
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Case number (auto if left blank)</Form.Label>
          <Form.Control
            value={form.id}
            onChange={e => setForm(f => ({ ...f, id: e.target.value }))}
            placeholder="e.g., FC-23-001234"
          />
        </Form.Group>
        <Row className="mb-3">
          <Col>
            <Form.Group>
              <Form.Label>Court</Form.Label>
              <Form.Select value={form.court} onChange={e => setForm(f => ({ ...f, court: e.target.value as (typeof courts)[number] }))}>
                {courts.map(c => <option key={c} value={c}>{c}</option>)}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col>
            <Form.Group>
              <Form.Label>Case Type</Form.Label>
              <Form.Select value={form.caseType} onChange={e => setForm(f => ({ ...f, caseType: e.target.value as (typeof types)[number] }))}>
                {types.map(t => <option key={t} value={t}>{t}</option>)}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col>
            <Form.Group>
              <Form.Label>Status</Form.Label>
              <Form.Select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as (typeof statuses)[number] }))}>
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col>
            <Form.Group>
              <Form.Label>Started on</Form.Label>
              <Form.Control
                type="date"
                value={form.startedAt}
                onChange={e => setForm(f => ({ ...f, startedAt: e.target.value }))}
              />
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-4">
          <Col>
            <Form.Group>
              <Form.Label>Allocated judge</Form.Label>
              <Form.Control
                value={form.allocatedJudge || ''}
                onChange={e => setForm(f => ({ ...f, allocatedJudge: e.target.value }))}
              />
            </Form.Group>
          </Col>
          <Col className="d-flex align-items-end">
            <div className="mb-2">
              <b>Children involved:</b> {form.parties.filter(p => p.role === 'Child').length}
            </div>
          </Col>
        </Row>

        {/* Parties Section */}
        <Card className="mb-3 p-3">
          <Card.Title>Add Party</Card.Title>
          <Form as={Row} className="g-2 align-items-end">
            <Col md>
              <Form.Group>
                <Form.Label>Role</Form.Label>
                <Form.Select value={partyRole} onChange={e => setPartyRole(e.target.value as 'Applicant'|'Respondent'|'Guardian'|'Intervener')}>
                  {['Applicant','Respondent','Guardian','Intervener'].map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md>
              <Form.Group>
                <Form.Label>First name</Form.Label>
                <Form.Control value={partyFirstName} onChange={e => setPartyFirstName(e.target.value)} />
              </Form.Group>
            </Col>
            <Col md>
              <Form.Group>
                <Form.Label>Last name</Form.Label>
                <Form.Control value={partyLastName} onChange={e => setPartyLastName(e.target.value)} />
              </Form.Group>
            </Col>
            <Col md>
              <Form.Group>
                <Form.Label>Date of Birth</Form.Label>
                <Form.Control type="date" value={partyDateOfBirth} onChange={e => setPartyDateOfBirth(e.target.value)} />
              </Form.Group>
            </Col>
            <Col md>
              <Form.Group>
                <Form.Label>Address</Form.Label>
                <Form.Control value={partyAddress} onChange={e => setPartyAddress(e.target.value)} />
              </Form.Group>
            </Col>
            <Col md>
              <Form.Group>
                <Form.Label>Contact Email</Form.Label>
                <Form.Control type="email" value={partyContactEmail} onChange={e => setPartyContactEmail(e.target.value)} />
              </Form.Group>
            </Col>
            <Col md>
              <Form.Group>
                <Form.Label>Contact Phone</Form.Label>
                <Form.Control type="tel" value={partyContactPhone} onChange={e => setPartyContactPhone(e.target.value)} />
              </Form.Group>
            </Col>
            <Col md>
              <Form.Group>
                <Form.Label>Solicitor firm</Form.Label>
                <Form.Control value={partySolicitorFirm} onChange={e => setPartySolicitorFirm(e.target.value)} />
              </Form.Group>
            </Col>
            <Col md="auto">
              <Button variant="primary" onClick={e => { e.preventDefault(); addPartyToForm(); }} disabled={!partyFirstName || !partyLastName}>Add</Button>
            </Col>
          </Form>
          {/* List current parties (not children) */}
          {form.parties.filter(p => p.role !== 'Child').length > 0 && (
            <div className="mt-3">
              <div className="fw-bold mb-2">Parties</div>
              {form.parties.filter(p => p.role !== 'Child').map(p => (
                <div key={p.id} className="border rounded p-2 mb-2 d-flex justify-content-between align-items-center">
                  <div>
                    <span className="fw-semibold">{p.role}: {p.firstName} {p.lastName}</span>
                    <div className="small text-muted">
                      {p.dateOfBirth && <>DOB: {p.dateOfBirth} <br /></>}
                      {p.address && <>Address: {p.address} <br /></>}
                      {p.contactEmail && <>Email: {p.contactEmail} <br /></>}
                      {p.contactPhone && <>Phone: {p.contactPhone}</>}
                    </div>
                    {p.solicitorFirm && <div className="small text-muted">Solicitor: {p.solicitorFirm}</div>}
                  </div>
                  <Button size="sm" variant="outline-danger" onClick={() => removePartyFromForm(p.id)}>Remove</Button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Children Section */}
        <Card className="mb-3 p-3 border-info">
          <Card.Title>Add Child</Card.Title>
          <Form as={Row} className="g-2 align-items-end">
            <Col md>
              <Form.Group>
                <Form.Label>First name</Form.Label>
                <Form.Control value={childFirstName} onChange={e => setChildFirstName(e.target.value)} />
              </Form.Group>
            </Col>
            <Col md>
              <Form.Group>
                <Form.Label>Last name</Form.Label>
                <Form.Control value={childLastName} onChange={e => setChildLastName(e.target.value)} />
              </Form.Group>
            </Col>
            <Col md>
              <Form.Group>
                <Form.Label>Date of Birth</Form.Label>
                <Form.Control type="date" value={childDateOfBirth} onChange={e => setChildDateOfBirth(e.target.value)} />
              </Form.Group>
            </Col>
            <Col md>
              <Form.Group>
                <Form.Label>Address</Form.Label>
                <Form.Control value={childAddress} onChange={e => setChildAddress(e.target.value)} />
              </Form.Group>
            </Col>
            <Col md>
              <Form.Group>
                <Form.Label>Contact Email</Form.Label>
                <Form.Control type="email" value={childContactEmail} onChange={e => setChildContactEmail(e.target.value)} />
              </Form.Group>
            </Col>
            <Col md>
              <Form.Group>
                <Form.Label>Contact Phone</Form.Label>
                <Form.Control type="tel" value={childContactPhone} onChange={e => setChildContactPhone(e.target.value)} />
              </Form.Group>
            </Col>
            <Col md="auto">
              <Button variant="primary" onClick={e => { e.preventDefault(); addChildToForm(); }} disabled={!childFirstName || !childLastName}>Add</Button>
            </Col>
          </Form>
          {/* List current children */}
          {form.parties.filter(p => p.role === 'Child').length > 0 && (
            <div className="mt-3">
              <div className="fw-bold mb-2">Children</div>
              {form.parties.filter(p => p.role === 'Child').map(p => (
                <div key={p.id} className="border rounded p-2 mb-2 d-flex justify-content-between align-items-center">
                  <div>
                    <span className="fw-semibold">{p.firstName} {p.lastName}</span>
                    <div className="small text-muted">
                      {p.dateOfBirth && <>DOB: {p.dateOfBirth} <br /></>}
                      {p.address && <>Address: {p.address} <br /></>}
                      {p.contactEmail && <>Email: {p.contactEmail} <br /></>}
                      {p.contactPhone && <>Phone: {p.contactPhone}</>}
                    </div>
                  </div>
                  <Button size="sm" variant="outline-danger" onClick={() => removePartyFromForm(p.id)}>Remove</Button>
                </div>
              ))}
            </div>
          )}
        </Card>

        <div className="d-flex gap-2">
          <Button type="submit" variant="primary" className="px-4">Save</Button>
          <Button variant="outline-secondary" className="px-4" onClick={() => navigate(existing ? `/cases/${existing.id}` : '/')}>Cancel</Button>
        </div>
      </Form>
    </Card>
  )
}


