import { useState } from 'react'
import { Card, Form, Row, Col, Button } from 'react-bootstrap'
import { useCasesStore } from '../../../store/casesStore'
import { generateId } from '../../../services/storage'
import type { FamilyCase, Party } from '../../../types/domain'
import PartyCard from '../PartyCard'

export interface PartiesTabProps {
  caseId: string
}

export default function PartiesTab({ caseId }: PartiesTabProps) {
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
    setFirstName('')
    setLastName('')
    setDateOfBirth('')
    setAddress('')
    setContactEmail('')
    setContactPhone('')
    setSolicitorFirm('')
  }

  const nonChildren = fc.parties.filter((p) => p.role !== 'Child' || (p.role === 'Child' && p.solicitorFirm))
  const children = fc.parties.filter((p) => p.role === 'Child' && !p.solicitorFirm)

  return (
    <div className="mb-3">
      <Card className="mb-3 p-3 shadow-sm border bg-white">
        <Card.Title className="h5 fw-bold mb-3">Add Case Party</Card.Title>
        <Form as={Row} className="g-2 align-items-end">
          <Col md={3}>
            <Form.Group>
              <Form.Label className="small fw-semibold">Role</Form.Label>
              <Form.Select value={role} onChange={(e) => setRole(e.target.value as Party['role'])} size="sm">
                {['Applicant', 'Respondent', 'Child', 'Guardian', 'Intervener'].map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label className="small fw-semibold">First name</Form.Label>
              <Form.Control
                size="sm"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. John"
              />
            </Form.Group>
          </Col>
          <Col md={5}>
            <Form.Group>
              <Form.Label className="small fw-semibold">Last name</Form.Label>
              <Form.Control
                size="sm"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Smith"
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label className="small fw-semibold">Date of Birth</Form.Label>
              <Form.Control
                size="sm"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label className="small fw-semibold">Address</Form.Label>
              <Form.Control
                size="sm"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Address line"
              />
            </Form.Group>
          </Col>
          <Col md={5}>
            <Form.Group>
              <Form.Label className="small fw-semibold">Contact Email</Form.Label>
              <Form.Control
                size="sm"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="email@example.com"
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label className="small fw-semibold">Contact Phone</Form.Label>
              <Form.Control
                size="sm"
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="Phone number"
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label className="small fw-semibold">Solicitor firm</Form.Label>
              <Form.Control
                size="sm"
                value={solicitorFirm}
                onChange={(e) => setSolicitorFirm(e.target.value)}
                placeholder="Legal firm name"
              />
            </Form.Group>
          </Col>
          <Col md={2} className="text-end">
            <Button
              variant="primary"
              size="sm"
              onClick={addParty}
              disabled={!firstName.trim() || !lastName.trim()}
              className="w-100"
            >
              + Add Party
            </Button>
          </Col>
        </Form>
      </Card>

      {fc.parties.length === 0 && <div className="text-muted p-3 bg-light rounded">No parties recorded yet.</div>}

      {/* Non-children parties */}
      {nonChildren.length > 0 && (
        <Card className="mb-3 p-3 shadow-sm border bg-white">
          <Card.Title className="h6 fw-bold mb-3 text-primary">Parties to Proceedings</Card.Title>
          {nonChildren.map((p) => (
            <PartyCard
              key={p.id}
              party={p}
              onSave={(updatedParty) => {
                const updated: FamilyCase = {
                  ...current,
                  parties: current.parties.map((part) => (part.id === p.id ? updatedParty : part)),
                }
                store.addOrUpdate(updated)
              }}
              onDelete={() => {
                const updated: FamilyCase = {
                  ...current,
                  parties: current.parties.filter((part) => part.id !== p.id),
                }
                store.addOrUpdate(updated)
              }}
            />
          ))}
        </Card>
      )}

      {/* Children section */}
      {children.length > 0 && (
        <Card className="mb-3 p-3 border-info shadow-sm bg-white">
          <Card.Title className="h6 fw-bold mb-3 text-info">Children Involved</Card.Title>
          {children.map((p) => (
            <PartyCard
              key={p.id}
              party={p}
              onSave={(updatedParty) => {
                const updated: FamilyCase = {
                  ...current,
                  parties: current.parties.map((part) => (part.id === p.id ? updatedParty : part)),
                }
                store.addOrUpdate(updated)
              }}
              onDelete={() => {
                const updated: FamilyCase = {
                  ...current,
                  parties: current.parties.filter((part) => part.id !== p.id),
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
