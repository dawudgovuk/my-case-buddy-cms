import { useState } from 'react'
import { Card, Form, Row, Col, Button, Badge } from 'react-bootstrap'
import type { Party } from '../../types/domain'
import { generateId } from '../../services/storage'
import { FaUserPlus, FaChild, FaCheck, FaTimes, FaBirthdayCake, FaShieldAlt } from 'react-icons/fa'

export interface PartyInlineEditorProps {
  isChild: boolean
  defaultRole?: Party['role']
  initialData?: Party
  onSave: (party: Party) => void
  onCancel: () => void
  className?: string
}

export default function PartyInlineEditor({
  isChild,
  defaultRole,
  initialData,
  onSave,
  onCancel,
  className = '',
}: PartyInlineEditorProps) {
  const [role, setRole] = useState<Party['role']>(
    initialData?.role ?? (isChild ? 'Child' : defaultRole ?? 'Applicant')
  )
  const [firstName, setFirstName] = useState(initialData?.firstName ?? '')
  const [lastName, setLastName] = useState(initialData?.lastName ?? '')
  const [dateOfBirth, setDateOfBirth] = useState(initialData?.dateOfBirth ?? '')
  const [address, setAddress] = useState(initialData?.address ?? '')
  const [contactEmail, setContactEmail] = useState(initialData?.contactEmail ?? '')
  const [contactPhone, setContactPhone] = useState(initialData?.contactPhone ?? '')
  const [solicitorFirm, setSolicitorFirm] = useState(initialData?.solicitorFirm ?? '')

  // Calculate age if DOB provided
  const calculatedAge = dateOfBirth
    ? Math.max(0, Math.floor((Date.now() - new Date(dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)))
    : null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!firstName.trim() || !lastName.trim()) return

    const partyRecord: Party = {
      id: initialData?.id || generateId('PTY'),
      role: isChild ? 'Child' : role,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      dateOfBirth: dateOfBirth || undefined,
      address: address.trim() || undefined,
      contactEmail: contactEmail.trim() || undefined,
      contactPhone: contactPhone.trim() || undefined,
      solicitorFirm: !isChild && solicitorFirm.trim() ? solicitorFirm.trim() : undefined,
    }

    onSave(partyRecord)
  }

  const isValid = Boolean(firstName.trim() && lastName.trim())

  return (
    <Card className={`border border-primary-subtle shadow-sm bg-light-subtle rounded-3 mb-3 ${className}`}>
      <Card.Header className="bg-white border-bottom py-2 px-3 d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-2">
          {isChild ? (
            <Badge bg="warning" text="dark" className="p-1 px-2 d-flex align-items-center gap-1">
              <FaChild size={12} />
              <span>Child Record</span>
            </Badge>
          ) : (
            <Badge bg="primary" className="p-1 px-2 d-flex align-items-center gap-1">
              <FaUserPlus size={12} />
              <span>Party to Proceedings</span>
            </Badge>
          )}
          <span className="fw-bold small text-dark">
            {initialData ? `Edit ${initialData.firstName}` : isChild ? 'Register Child Involved' : `Add ${role}`}
          </span>
        </div>
        <Button variant="link" size="sm" className="p-0 text-secondary" onClick={onCancel}>
          <FaTimes size={14} />
        </Button>
      </Card.Header>

      <Card.Body className="p-3">
        <Form onSubmit={handleSubmit}>
          {/* Section 1: Identity */}
          <div className="small fw-bold text-uppercase text-muted mb-2" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
            Personal Information
          </div>
          <Row className="g-2 mb-3">
            {!isChild && (
              <Col md={3}>
                <Form.Group controlId="party-editor-role">
                  <Form.Label className="small fw-semibold mb-1">Role *</Form.Label>
                  <Form.Select
                    size="sm"
                    value={role}
                    onChange={(e) => setRole(e.target.value as Party['role'])}
                    className="border-secondary-subtle"
                  >
                    <option value="Applicant">Applicant</option>
                    <option value="Respondent">Respondent</option>
                    <option value="Guardian">Guardian (CAFCASS)</option>
                    <option value="Intervener">Intervener</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            )}

            <Col md={isChild ? 4 : 3}>
              <Form.Group controlId="party-editor-firstname">
                <Form.Label className="small fw-semibold mb-1">First Name *</Form.Label>
                <Form.Control
                  size="sm"
                  placeholder="e.g. Sarah"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </Form.Group>
            </Col>

            <Col md={isChild ? 4 : 3}>
              <Form.Group controlId="party-editor-lastname">
                <Form.Label className="small fw-semibold mb-1">Last Name *</Form.Label>
                <Form.Control
                  size="sm"
                  placeholder="e.g. Jenkins"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </Form.Group>
            </Col>

            <Col md={isChild ? 4 : 3}>
              <Form.Group controlId="party-editor-dob">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <Form.Label className="small fw-semibold mb-0">Date of Birth</Form.Label>
                  {calculatedAge !== null && !isNaN(calculatedAge) && (
                    <span className="badge bg-info-subtle text-info py-0" style={{ fontSize: '0.7rem' }}>
                      <FaBirthdayCake className="me-1" size={9} />
                      {calculatedAge} yrs old
                    </span>
                  )}
                </div>
                <Form.Control
                  size="sm"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Section 2: Contact & Court Representation */}
          <div className="small fw-bold text-uppercase text-muted mb-2" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
            {isChild ? 'Residence & Protection' : 'Contact & Representation (Optional)'}
          </div>

          <Row className="g-2 mb-3">
            <Col md={isChild ? 12 : 6}>
              <Form.Group controlId="party-editor-address">
                <Form.Label className="small fw-semibold mb-1">
                  {isChild ? 'Primary Residence / School Area' : 'Postal Address'}
                </Form.Label>
                <Form.Control
                  size="sm"
                  placeholder={isChild ? 'e.g. Manchester, UK (Confidential under FPR)' : 'e.g. 14 High Street, Manchester'}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </Form.Group>
            </Col>

            {!isChild && (
              <>
                <Col md={3}>
                  <Form.Group controlId="party-editor-email">
                    <Form.Label className="small fw-semibold mb-1">Email</Form.Label>
                    <Form.Control
                      size="sm"
                      type="email"
                      placeholder="e.g. party@example.com"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                    />
                  </Form.Group>
                </Col>

                <Col md={3}>
                  <Form.Group controlId="party-editor-phone">
                    <Form.Label className="small fw-semibold mb-1">Phone</Form.Label>
                    <Form.Control
                      size="sm"
                      type="tel"
                      placeholder="e.g. 07700 900123"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                    />
                  </Form.Group>
                </Col>

                <Col md={12}>
                  <Form.Group controlId="party-editor-solicitor">
                    <Form.Label className="small fw-semibold mb-1">Solicitor / Legal Representative Firm</Form.Label>
                    <Form.Control
                      size="sm"
                      placeholder="e.g. Cartwright & Co Solicitors (Leave blank if Litigant in Person)"
                      value={solicitorFirm}
                      onChange={(e) => setSolicitorFirm(e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </>
            )}
          </Row>

          {isChild && (
            <div className="p-2 mb-3 bg-white rounded border border-warning-subtle small text-muted d-flex align-items-center gap-2">
              <FaShieldAlt className="text-warning flex-shrink-0" />
              <span style={{ fontSize: '0.78rem' }}>
                Protected under UK Family Procedure Rules (FPR Rule 29.1). Contact details are hidden from public records.
              </span>
            </div>
          )}

          {/* Form Actions */}
          <div className="d-flex justify-content-end gap-2 pt-2 border-top">
            <Button variant="outline-secondary" size="sm" onClick={onCancel} className="px-3">
              <FaTimes className="me-1" size={12} />
              Cancel
            </Button>
            <Button
              type="submit"
              variant={isChild ? 'warning' : 'primary'}
              size="sm"
              disabled={!isValid}
              className="px-3 fw-semibold"
            >
              <FaCheck className="me-1" size={12} />
              {initialData ? 'Update Record' : isChild ? 'Add Child to Case' : 'Add Party to Case'}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  )
}
