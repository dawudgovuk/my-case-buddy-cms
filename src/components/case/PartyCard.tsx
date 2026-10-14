import { useState } from 'react'
import { Card, Form, Row, Col, Button, Badge } from 'react-bootstrap'
import type { Party } from '../../types/domain'
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBriefcase, FaEdit, FaTrash } from 'react-icons/fa'

export interface PartyCardProps {
  party: Party
  onSave?: (updatedParty: Party) => void
  onDelete?: (partyId: string) => void
  readOnly?: boolean
  className?: string
}

export default function PartyCard({
  party,
  onSave,
  onDelete,
  readOnly = false,
  className = '',
}: PartyCardProps) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<Party>({ ...party })

  const isChild = party.role === 'Child'

  if (editing && !readOnly) {
    return (
      <Card className={`mb-2 p-3 shadow-sm border bg-white ${className}`}>
        <Form as={Row} className="g-2 align-items-end">
          <Col md={3}>
            <Form.Group>
              <Form.Label className="small fw-semibold">Role</Form.Label>
              <Form.Select
                size="sm"
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as Party['role'] }))}
              >
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
                value={form.firstName}
                onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
              />
            </Form.Group>
          </Col>
          <Col md={5}>
            <Form.Group>
              <Form.Label className="small fw-semibold">Last name</Form.Label>
              <Form.Control
                size="sm"
                value={form.lastName}
                onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label className="small fw-semibold">Date of Birth</Form.Label>
              <Form.Control
                size="sm"
                type="date"
                value={form.dateOfBirth || ''}
                onChange={(e) => setForm((f) => ({ ...f, dateOfBirth: e.target.value }))}
              />
            </Form.Group>
          </Col>
          <Col md={8}>
            <Form.Group>
              <Form.Label className="small fw-semibold">Address</Form.Label>
              <Form.Control
                size="sm"
                value={form.address || ''}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label className="small fw-semibold">Contact Email</Form.Label>
              <Form.Control
                size="sm"
                type="email"
                value={form.contactEmail || ''}
                onChange={(e) => setForm((f) => ({ ...f, contactEmail: e.target.value }))}
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label className="small fw-semibold">Contact Phone</Form.Label>
              <Form.Control
                size="sm"
                type="tel"
                value={form.contactPhone || ''}
                onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))}
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label className="small fw-semibold">Solicitor firm</Form.Label>
              <Form.Control
                size="sm"
                value={form.solicitorFirm || ''}
                onChange={(e) => setForm((f) => ({ ...f, solicitorFirm: e.target.value }))}
              />
            </Form.Group>
          </Col>
          <Col xs={12} className="d-flex gap-2 justify-content-end mt-3">
            <Button
              variant="success"
              size="sm"
              onClick={() => {
                onSave?.(form)
                setEditing(false)
              }}
              disabled={!form.firstName.trim() || !form.lastName.trim()}
            >
              Save
            </Button>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => {
                setForm({ ...party })
                setEditing(false)
              }}
            >
              Cancel
            </Button>
            {onDelete && (
              <Button variant="danger" size="sm" onClick={() => onDelete(party.id)}>
                Delete
              </Button>
            )}
          </Col>
        </Form>
      </Card>
    )
  }

  const roleBg: Record<Party['role'], 'primary' | 'secondary' | 'info' | 'warning' | 'dark'> = {
    Applicant: 'primary',
    Respondent: 'secondary',
    Child: 'info',
    Guardian: 'warning',
    Intervener: 'dark',
  }

  return (
    <Card className={`mb-2 p-3 border shadow-sm bg-white ${isChild ? 'border-info' : ''} ${className}`}>
      <div className="d-flex justify-content-between align-items-start gap-2">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <Badge bg={roleBg[party.role] || 'primary'} className="fw-semibold">
              <FaUser className="me-1" size={10} />
              {party.role}
            </Badge>
            <h6 className="mb-0 fw-bold text-dark">
              {party.firstName} {party.lastName}
            </h6>
          </div>

          <div className="small text-secondary mt-1">
            {party.dateOfBirth && (
              <span className="me-3">
                <strong>DOB:</strong> {party.dateOfBirth}
              </span>
            )}
            {party.address && (
              <span className="me-3">
                <FaMapMarkerAlt className="me-1 text-muted" />
                {party.address}
              </span>
            )}
            {party.contactEmail && (
              <span className="me-3">
                <FaEnvelope className="me-1 text-muted" />
                {party.contactEmail}
              </span>
            )}
            {party.contactPhone && (
              <span className="me-3">
                <FaPhone className="me-1 text-muted" />
                {party.contactPhone}
              </span>
            )}
          </div>

          {party.solicitorFirm && (
            <div className="small text-primary mt-1 d-flex align-items-center">
              <FaBriefcase className="me-1" />
              <span>Solicitor: {party.solicitorFirm}</span>
            </div>
          )}
        </div>

        {!readOnly && (
          <div className="d-flex gap-1">
            {onSave && (
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => setEditing(true)}
                className="d-flex align-items-center gap-1"
              >
                <FaEdit size={12} />
                <span>Edit</span>
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => onDelete(party.id)}
                className="d-flex align-items-center gap-1"
              >
                <FaTrash size={12} />
                <span>Delete</span>
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
