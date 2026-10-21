import { useState } from 'react'
import { Card, Form, Row, Col, Button, Badge } from 'react-bootstrap'
import { parseISO, differenceInYears, differenceInMonths } from 'date-fns'
import { useTranslation } from '../../hooks/useTranslation'
import type { Party, PartyRepresentation } from '../../types/domain'
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaBriefcase,
  FaEdit,
  FaTrash,
  FaChild,
  FaShieldAlt,
  FaSchool,
  FaGavel,
} from 'react-icons/fa'

export interface PartyCardProps {
  party: Party
  onSave?: (updatedParty: Party) => void
  onDelete?: (partyId: string) => void
  readOnly?: boolean
  className?: string
}

function getAgeString(dob?: string): string {
  if (!dob) return ''
  try {
    const birth = parseISO(dob)
    const now = new Date()
    const years = differenceInYears(now, birth)
    if (years < 2) {
      const months = differenceInMonths(now, birth)
      return `${months} months old`
    }
    return `Age ${years}`
  } catch {
    return ''
  }
}

export default function PartyCard({
  party,
  onSave,
  onDelete,
  readOnly = false,
  className = '',
}: PartyCardProps) {
  const { t } = useTranslation()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<Party>({ ...party })

  const isChild = party.role === 'Child'
  const ageString = getAgeString(party.dateOfBirth)

  if (editing && !readOnly) {
    const formIsChild = form.role === 'Child'

    return (
      <Card className={`mb-2 p-3 shadow-sm border bg-white ${className}`}>
        <Form as={Row} className="g-2">
          <Col md={3}>
            <Form.Group>
              <Form.Label className="small fw-semibold">{t.caseTabs.partyRole}</Form.Label>
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
              <Form.Label className="small fw-semibold">{t.caseTabs.partyFirstName}</Form.Label>
              <Form.Control
                size="sm"
                value={form.firstName}
                onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
              />
            </Form.Group>
          </Col>

          <Col md={5}>
            <Form.Group>
              <Form.Label className="small fw-semibold">{t.caseTabs.partyLastName}</Form.Label>
              <Form.Control
                size="sm"
                value={form.lastName}
                onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
              />
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group>
              <Form.Label className="small fw-semibold">{t.caseTabs.partyDob}</Form.Label>
              <Form.Control
                size="sm"
                type="date"
                value={form.dateOfBirth || ''}
                onChange={(e) => setForm((f) => ({ ...f, dateOfBirth: e.target.value }))}
              />
            </Form.Group>
          </Col>

          {/* Child specific inputs */}
          {formIsChild ? (
            <>
              <Col md={5}>
                <Form.Group>
                  <Form.Label className="small fw-semibold">{t.caseTabs.partySchool}</Form.Label>
                  <Form.Control
                    size="sm"
                    value={form.schoolOrNursery || ''}
                    onChange={(e) => setForm((f) => ({ ...f, schoolOrNursery: e.target.value }))}
                    placeholder="e.g. St Peter's Primary"
                  />
                </Form.Group>
              </Col>
              <Col md={3} className="d-flex align-items-center pt-3">
                <Form.Check
                  type="checkbox"
                  id={`edit-pr-${party.id}`}
                  label={t.caseTabs.parentalResponsibilityActive}
                  checked={form.parentalResponsibility ?? true}
                  onChange={(e) => setForm((f) => ({ ...f, parentalResponsibility: e.target.checked }))}
                  className="small fw-semibold text-secondary"
                />
              </Col>
            </>
          ) : (
            /* Adult specific inputs */
            <>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="small fw-semibold">{t.caseTabs.partyRepresentation}</Form.Label>
                  <Form.Select
                    size="sm"
                    value={form.representation || 'Litigant in Person'}
                    onChange={(e) => setForm((f) => ({ ...f, representation: e.target.value as PartyRepresentation }))}
                  >
                    <option value="Litigant in Person">{t.roles.lip}</option>
                    <option value="Instructed Solicitor">{t.roles.solicitor}</option>
                    <option value="Direct Access Barrister">{t.roles.barrister}</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="small fw-semibold">{t.caseTabs.partySolicitor}</Form.Label>
                  <Form.Control
                    size="sm"
                    value={form.solicitorFirm || ''}
                    onChange={(e) => setForm((f) => ({ ...f, solicitorFirm: e.target.value }))}
                    placeholder="e.g. Simpson & Partners LLP"
                  />
                </Form.Group>
              </Col>
            </>
          )}

          <Col md={formIsChild ? 12 : 8}>
            <Form.Group>
              <Form.Label className="small fw-semibold">{t.caseTabs.partyAddress}</Form.Label>
              <Form.Control
                size="sm"
                value={form.address || ''}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              />
            </Form.Group>
          </Col>

          {!formIsChild && (
            <Col md={4}>
              <Form.Group>
                <Form.Label className="small fw-semibold">{t.caseTabs.partySpecialMeasures}</Form.Label>
                <Form.Control
                  size="sm"
                  value={form.specialMeasuresRequired || ''}
                  onChange={(e) => setForm((f) => ({ ...f, specialMeasuresRequired: e.target.value }))}
                  placeholder="e.g. Screens, separate waiting room"
                />
              </Form.Group>
            </Col>
          )}

          {!formIsChild && (
            <>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold">{t.caseTabs.partyEmail}</Form.Label>
                  <Form.Control
                    size="sm"
                    type="email"
                    value={form.contactEmail || ''}
                    onChange={(e) => setForm((f) => ({ ...f, contactEmail: e.target.value }))}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold">{t.caseTabs.partyPhone}</Form.Label>
                  <Form.Control
                    size="sm"
                    value={form.contactPhone || ''}
                    onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))}
                  />
                </Form.Group>
              </Col>
            </>
          )}

          <Col xs={12} className="d-flex gap-2 justify-content-end mt-2">
            <Button
              variant="success"
              size="sm"
              onClick={() => {
                onSave?.(form)
                setEditing(false)
              }}
              disabled={!form.firstName.trim() || !form.lastName.trim()}
            >
              {t.common.save}
            </Button>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => {
                setForm({ ...party })
                setEditing(false)
              }}
            >
              {t.common.cancel}
            </Button>
            {onDelete && (
              <Button variant="danger" size="sm" onClick={() => onDelete(party.id)}>
                {t.common.delete}
              </Button>
            )}
          </Col>
        </Form>
      </Card>
    )
  }

  // View Mode
  const representation = party.representation || (party.solicitorFirm ? 'Instructed Solicitor' : 'Litigant in Person')

  return (
    <Card className={`mb-2 p-3 border shadow-sm bg-white ${className}`}>
      <div className="d-flex justify-content-between align-items-start gap-2">
        <div className="min-width-0 flex-grow-1">
          {/* Header Badges */}
          <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
            <Badge bg={isChild ? 'info' : party.role === 'Applicant' ? 'primary' : 'warning'} className="fw-semibold">
              {isChild ? <FaChild className="me-1" size={11} /> : <FaUser className="me-1" size={10} />}
              {party.role}
            </Badge>

            <h6 className="mb-0 fw-bold text-dark text-truncate">
              {party.firstName} {party.lastName}
            </h6>

            {/* Child Age Calculation */}
            {isChild && ageString && (
              <Badge bg="light" text="dark" className="border font-monospace">
                {ageString}
              </Badge>
            )}

            {/* Adult Legal Representation Badge */}
            {!isChild && (
              <Badge
                bg={representation === 'Litigant in Person' ? 'light' : 'primary-subtle'}
                text={representation === 'Litigant in Person' ? 'dark' : 'primary'}
                className="border font-monospace d-inline-flex align-items-center gap-1"
                style={{ fontSize: '0.72rem' }}
              >
                {representation === 'Litigant in Person' ? (
                  <FaUser size={9} />
                ) : representation === 'Direct Access Barrister' ? (
                  <FaGavel size={9} />
                ) : (
                  <FaBriefcase size={9} />
                )}
                <span>
                  {representation === 'Litigant in Person'
                    ? t.roles.lip
                    : representation === 'Direct Access Barrister'
                    ? t.roles.barrister
                    : t.roles.solicitor}
                </span>
              </Badge>
            )}

            {/* FPR Part 3A Special Measures Badge */}
            {party.specialMeasuresRequired && (
              <Badge bg="danger-subtle" text="danger" className="border border-danger-subtle d-inline-flex align-items-center gap-1">
                <FaShieldAlt size={9} />
                <span>{t.caseTabs.partySpecialMeasures}</span>
              </Badge>
            )}
          </div>

          {/* Details Row */}
          <div className="small text-secondary mt-1 d-flex flex-wrap align-items-center gap-3">
            {party.dateOfBirth && <span>{t.caseTabs.partyDob}: {party.dateOfBirth}</span>}

            {isChild && party.schoolOrNursery && (
              <span className="d-inline-flex align-items-center gap-1">
                <FaSchool size={11} className="text-secondary" />
                <span>{party.schoolOrNursery}</span>
              </span>
            )}

            {!isChild && party.solicitorFirm && (
              <span className="d-inline-flex align-items-center gap-1">
                <FaBriefcase size={11} className="text-primary" />
                <span>{party.solicitorFirm}</span>
              </span>
            )}

            {party.contactEmail && (
              <span className="d-inline-flex align-items-center gap-1">
                <FaEnvelope size={11} className="text-muted" />
                <span>{party.contactEmail}</span>
              </span>
            )}

            {party.contactPhone && (
              <span className="d-inline-flex align-items-center gap-1">
                <FaPhone size={11} className="text-muted" />
                <span>{party.contactPhone}</span>
              </span>
            )}
          </div>

          {party.address && (
            <div className="small text-muted mt-1 d-flex align-items-center gap-1">
              <FaMapMarkerAlt size={10} className="text-danger flex-shrink-0" />
              <span>{party.address}</span>
            </div>
          )}

          {/* Special Measures Detail */}
          {party.specialMeasuresRequired && (
            <div className="small mt-2 p-1.5 px-2 rounded bg-danger-subtle border border-danger-subtle text-danger-emphasis d-inline-flex align-items-center gap-1.5">
              <FaShieldAlt size={11} className="flex-shrink-0" />
              <span>
                <strong>{t.caseTabs.partySpecialMeasures}:</strong> {party.specialMeasuresRequired}
              </span>
            </div>
          )}
        </div>

        {!readOnly && (
          <div className="d-flex gap-1 flex-shrink-0">
            {onSave && (
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => setEditing(true)}
                className="d-flex align-items-center gap-1 py-1 px-2"
                style={{ fontSize: '0.78rem' }}
              >
                <FaEdit size={11} />
                <span>{t.common.edit}</span>
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => onDelete(party.id)}
                className="d-flex align-items-center gap-1 py-1 px-2"
                style={{ fontSize: '0.78rem' }}
              >
                <FaTrash size={11} />
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
