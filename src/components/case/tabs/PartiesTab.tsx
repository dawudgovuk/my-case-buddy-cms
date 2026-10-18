import { useState } from 'react'
import { Card, Form, Row, Col, Button, Badge } from 'react-bootstrap'
import { useCasesStore } from '../../../store/casesStore'
import { generateId } from '../../../services/storage'
import { toast } from '../../../store/toastStore'
import type { FamilyCase, Party, PartyRepresentation } from '../../../types/domain'
import PartyCard from '../PartyCard'
import { partitionParties } from '../../../utils/partyUtils'
import { FaUserPlus, FaUsers, FaChild, FaUser, FaShieldAlt } from 'react-icons/fa'

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
  const [representation, setRepresentation] = useState<PartyRepresentation>('Litigant in Person')
  const [solicitorFirm, setSolicitorFirm] = useState('')
  const [schoolOrNursery, setSchoolOrNursery] = useState('')
  const [parentalResponsibility, setParentalResponsibility] = useState(true)
  const [specialMeasuresRequired, setSpecialMeasuresRequired] = useState('')

  const fc = store.getById(caseId)
  if (!fc) return null
  const current = fc as FamilyCase

  const isChild = role === 'Child'

  function addParty() {
    if (!firstName.trim() || !lastName.trim()) return
    const newName = `${firstName.trim()} ${lastName.trim()}`
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
          contactEmail: !isChild ? contactEmail.trim() || undefined : undefined,
          contactPhone: !isChild ? contactPhone.trim() || undefined : undefined,
          representation: !isChild ? representation : undefined,
          solicitorFirm: !isChild && representation === 'Instructed Solicitor' ? solicitorFirm.trim() || undefined : undefined,
          schoolOrNursery: isChild ? schoolOrNursery.trim() || undefined : undefined,
          parentalResponsibility: isChild ? parentalResponsibility : undefined,
          specialMeasuresRequired: specialMeasuresRequired.trim() || undefined,
        },
      ],
    }
    store.addOrUpdate(updated)
    toast.success(`Added ${newName} (${role}) to proceedings.`, 'Party Added')

    // Reset form
    setFirstName('')
    setLastName('')
    setDateOfBirth('')
    setAddress('')
    setContactEmail('')
    setContactPhone('')
    setSolicitorFirm('')
    setSchoolOrNursery('')
    setSpecialMeasuresRequired('')
  }

  const { adultsAndRepresented: nonChildren, children } = partitionParties(fc.parties || [])
  const lipCount = nonChildren.filter(
    (p) => !p.representation || p.representation === 'Litigant in Person'
  ).length
  const specialMeasuresCount = (fc.parties || []).filter((p) => p.specialMeasuresRequired).length

  return (
    <div className="d-flex flex-column gap-3">
      {/* Top Summary Banner */}
      <Card className="border shadow-sm bg-white p-3 rounded-3">
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="p-2 rounded-circle bg-primary-subtle text-primary">
                <FaUsers size={16} />
              </span>
              <div>
                <h6 className="fw-bold mb-0 text-dark">Parties, Children & Representation</h6>
                <div className="small text-muted">
                  Register all applicants, respondents, children, and legal representatives under FPR rules.
                </div>
              </div>
            </div>
          </div>

          <div className="d-flex gap-2 flex-wrap">
            <Badge bg="primary" className="py-1 px-2 font-monospace">
              {nonChildren.length} Adult Parties
            </Badge>
            <Badge bg="info" className="py-1 px-2 font-monospace text-white">
              {children.length} {children.length === 1 ? 'Child' : 'Children'}
            </Badge>
            <Badge bg="light" text="dark" className="border py-1 px-2 font-monospace">
              {lipCount} Litigants in Person
            </Badge>
            {specialMeasuresCount > 0 && (
              <Badge bg="danger-subtle" text="danger" className="border border-danger-subtle py-1 px-2 font-monospace d-flex align-items-center gap-1">
                <FaShieldAlt size={10} />
                <span>{specialMeasuresCount} Special Measures</span>
              </Badge>
            )}
          </div>
        </div>
      </Card>

      {/* Add Case Party Form */}
      <Card className="p-3 shadow-sm border bg-white rounded-3">
        <Card.Title className="h6 fw-bold mb-3 d-flex align-items-center gap-2 text-dark">
          <FaUserPlus className="text-primary" />
          <span>Register Party or Protected Child</span>
        </Card.Title>

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
              <Form.Label className="small fw-semibold">First Name</Form.Label>
              <Form.Control
                size="sm"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Sarah"
              />
            </Form.Group>
          </Col>

          <Col md={5}>
            <Form.Group>
              <Form.Label className="small fw-semibold">Last Name</Form.Label>
              <Form.Control
                size="sm"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Jenkins"
              />
            </Form.Group>
          </Col>

          <Col md={3}>
            <Form.Group>
              <Form.Label className="small fw-semibold">Date of Birth</Form.Label>
              <Form.Control
                type="date"
                size="sm"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
              />
            </Form.Group>
          </Col>

          {/* Child specific inputs */}
          {isChild ? (
            <>
              <Col md={5}>
                <Form.Group>
                  <Form.Label className="small fw-semibold">School or Nursery (optional)</Form.Label>
                  <Form.Control
                    size="sm"
                    value={schoolOrNursery}
                    onChange={(e) => setSchoolOrNursery(e.target.value)}
                    placeholder="e.g. St Peter's Primary"
                  />
                </Form.Group>
              </Col>

              <Col md={4} className="d-flex align-items-center pt-3">
                <Form.Check
                  type="checkbox"
                  id="add-child-pr"
                  label="Parental Responsibility (PR) Active"
                  checked={parentalResponsibility}
                  onChange={(e) => setParentalResponsibility(e.target.checked)}
                  className="small fw-semibold text-secondary"
                />
              </Col>
            </>
          ) : (
            /* Adult specific inputs */
            <>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="small fw-semibold">Legal Representation</Form.Label>
                  <Form.Select
                    size="sm"
                    value={representation}
                    onChange={(e) => setRepresentation(e.target.value as PartyRepresentation)}
                  >
                    <option value="Litigant in Person">Litigant in Person (Self-Represented)</option>
                    <option value="Instructed Solicitor">Instructed Solicitor</option>
                    <option value="Direct Access Barrister">Direct Access Barrister</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              {representation === 'Instructed Solicitor' && (
                <Col md={5}>
                  <Form.Group>
                    <Form.Label className="small fw-semibold">Solicitor Firm</Form.Label>
                    <Form.Control
                      size="sm"
                      value={solicitorFirm}
                      onChange={(e) => setSolicitorFirm(e.target.value)}
                      placeholder="e.g. Simpson & Partners LLP"
                    />
                  </Form.Group>
                </Col>
              )}
            </>
          )}

          <Col md={isChild ? 12 : representation === 'Instructed Solicitor' ? 7 : 8}>
            <Form.Group>
              <Form.Label className="small fw-semibold">Address / Jurisdiction</Form.Label>
              <Form.Control
                size="sm"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Residential address or court jurisdiction"
              />
            </Form.Group>
          </Col>

          {!isChild && (
            <>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="small fw-semibold">Contact Email</Form.Label>
                  <Form.Control
                    type="email"
                    size="sm"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="email@example.com"
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label className="small fw-semibold">Contact Phone</Form.Label>
                  <Form.Control
                    size="sm"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="07..."
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label className="small fw-semibold">FPR Part 3A Special Measures</Form.Label>
                  <Form.Control
                    size="sm"
                    value={specialMeasuresRequired}
                    onChange={(e) => setSpecialMeasuresRequired(e.target.value)}
                    placeholder="e.g. Screens, separate waiting room"
                  />
                </Form.Group>
              </Col>
            </>
          )}

          <Col xs={12} className="text-end mt-2">
            <Button
              variant="primary"
              size="sm"
              onClick={addParty}
              disabled={!firstName.trim() || !lastName.trim()}
              className="px-4 fw-semibold"
            >
              + Add {role}
            </Button>
          </Col>
        </Form>
      </Card>

      {/* Adult Parties Section */}
      <div>
        <h6 className="fw-bold mb-2 text-dark d-flex align-items-center gap-2">
          <FaUser className="text-primary" size={13} />
          <span>Adult Parties & Legal Representatives ({nonChildren.length})</span>
        </h6>
        {nonChildren.length === 0 ? (
          <div className="text-muted p-3 bg-light rounded text-center border">
            No adult parties registered yet.
          </div>
        ) : (
          <div className="d-flex flex-column gap-2">
            {nonChildren.map((p) => (
              <PartyCard
                key={p.id}
                party={p}
                onSave={(updatedParty) => {
                  const updated: FamilyCase = {
                    ...current,
                    parties: current.parties.map((orig) => (orig.id === p.id ? updatedParty : orig)),
                  }
                  store.addOrUpdate(updated)
                  toast.success(`Party "${updatedParty.firstName} ${updatedParty.lastName}" updated.`, 'Party Updated')
                }}
                onDelete={() => {
                  const updated: FamilyCase = {
                    ...current,
                    parties: current.parties.filter((orig) => orig.id !== p.id),
                  }
                  store.addOrUpdate(updated)
                  toast.info(`Party removed from proceedings.`, 'Party Removed')
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Children Section */}
      <div>
        <h6 className="fw-bold mb-2 text-dark d-flex align-items-center gap-2">
          <FaChild className="text-info" size={14} />
          <span>Children Subject to Proceedings ({children.length})</span>
        </h6>
        {children.length === 0 ? (
          <div className="text-muted p-3 bg-light rounded text-center border">
            No children registered under this case.
          </div>
        ) : (
          <div className="d-flex flex-column gap-2">
            {children.map((c) => (
              <PartyCard
                key={c.id}
                party={c}
                onSave={(updatedChild) => {
                  const updated: FamilyCase = {
                    ...current,
                    parties: current.parties.map((orig) => (orig.id === c.id ? updatedChild : orig)),
                  }
                  store.addOrUpdate(updated)
                  toast.success(`Child details for "${updatedChild.firstName}" updated.`, 'Child Updated')
                }}
                onDelete={() => {
                  const updated: FamilyCase = {
                    ...current,
                    parties: current.parties.filter((orig) => orig.id !== c.id),
                  }
                  store.addOrUpdate(updated)
                  toast.info(`Child record removed from case.`, 'Child Removed')
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
