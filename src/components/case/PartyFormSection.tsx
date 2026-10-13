import { useState } from 'react'
import { Card, Form, Row, Col, Button } from 'react-bootstrap'
import type { Party } from '../../types/domain'
import { generateId } from '../../services/storage'
import PartyCard from './PartyCard'

export interface PartyFormSectionProps {
  parties: Party[]
  onAddParty: (party: Party) => void
  onRemoveParty: (partyId: string) => void
  isChildSection?: boolean
  className?: string
}

export default function PartyFormSection({
  parties,
  onAddParty,
  onRemoveParty,
  isChildSection = false,
  className = '',
}: PartyFormSectionProps) {
  const [role, setRole] = useState<Party['role']>(isChildSection ? 'Child' : 'Applicant')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [address, setAddress] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [solicitorFirm, setSolicitorFirm] = useState('')

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!firstName.trim() || !lastName.trim()) return

    onAddParty({
      id: generateId('PTY'),
      role: isChildSection ? 'Child' : role,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      dateOfBirth: dateOfBirth || undefined,
      address: address.trim() || undefined,
      contactEmail: contactEmail.trim() || undefined,
      contactPhone: contactPhone.trim() || undefined,
      solicitorFirm: !isChildSection && solicitorFirm.trim() ? solicitorFirm.trim() : undefined,
    })

    setFirstName('')
    setLastName('')
    setDateOfBirth('')
    setAddress('')
    setContactEmail('')
    setContactPhone('')
    setSolicitorFirm('')
  }

  const sectionParties = isChildSection
    ? parties.filter((p) => p.role === 'Child')
    : parties.filter((p) => p.role !== 'Child')

  return (
    <Card className={`mb-3 p-3 shadow-sm border bg-white ${isChildSection ? 'border-info' : ''} ${className}`}>
      <Card.Title className={`h6 fw-bold mb-3 ${isChildSection ? 'text-info' : 'text-primary'}`}>
        {isChildSection ? 'Add Child' : 'Add Party to Case'}
      </Card.Title>

      <Form as={Row} className="g-2 align-items-end" onSubmit={handleAdd}>
        {!isChildSection && (
          <Col md={3}>
            <Form.Group>
              <Form.Label className="small fw-semibold">Role</Form.Label>
              <Form.Select
                size="sm"
                value={role}
                onChange={(e) => setRole(e.target.value as Party['role'])}
              >
                {['Applicant', 'Respondent', 'Guardian', 'Intervener'].map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        )}

        <Col md={isChildSection ? 4 : 3}>
          <Form.Group>
            <Form.Label className="small fw-semibold">First name</Form.Label>
            <Form.Control
              size="sm"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name"
            />
          </Form.Group>
        </Col>

        <Col md={isChildSection ? 4 : 3}>
          <Form.Group>
            <Form.Label className="small fw-semibold">Last name</Form.Label>
            <Form.Control
              size="sm"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last name"
            />
          </Form.Group>
        </Col>

        <Col md={isChildSection ? 4 : 3}>
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

        <Col md={6}>
          <Form.Group>
            <Form.Label className="small fw-semibold">Address</Form.Label>
            <Form.Control
              size="sm"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Address"
            />
          </Form.Group>
        </Col>

        <Col md={6}>
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

        {!isChildSection && (
          <Col md={4}>
            <Form.Group>
              <Form.Label className="small fw-semibold">Solicitor firm</Form.Label>
              <Form.Control
                size="sm"
                value={solicitorFirm}
                onChange={(e) => setSolicitorFirm(e.target.value)}
                placeholder="Solicitor's firm"
              />
            </Form.Group>
          </Col>
        )}

        <Col md={isChildSection ? 6 : 2} className="text-end">
          <Button
            variant={isChildSection ? 'info' : 'primary'}
            size="sm"
            onClick={handleAdd}
            disabled={!firstName.trim() || !lastName.trim()}
            className="w-100"
          >
            + Add {isChildSection ? 'Child' : 'Party'}
          </Button>
        </Col>
      </Form>

      {sectionParties.length > 0 && (
        <div className="mt-3">
          <div className="fw-semibold small text-muted mb-2">
            Current {isChildSection ? 'Children' : 'Parties'} ({sectionParties.length})
          </div>
          {sectionParties.map((p) => (
            <PartyCard
              key={p.id}
              party={p}
              onDelete={onRemoveParty}
              readOnly={false}
            />
          ))}
        </div>
      )}
    </Card>
  )
}
