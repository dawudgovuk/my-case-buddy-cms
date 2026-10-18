import { useState } from 'react'
import { displayDate } from '../../utils/displayDate'
import { Card, Form, Row, Col, Button, Badge, Dropdown } from 'react-bootstrap'
import type { Hearing, HearingOutcome, RemotePlatform } from '../../types/domain'
import {
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaGavel,
  FaEdit,
  FaTrash,
  FaVideo,
  FaExternalLinkAlt,
  FaShieldAlt,
  FaCheckCircle,
} from 'react-icons/fa'

export interface HearingCardProps {
  hearing: Hearing
  onSave?: (updatedHearing: Hearing) => void
  onDelete?: (hearingId: string) => void
  readOnly?: boolean
  courtLocations?: string[]
  className?: string
}

export default function HearingCard({
  hearing,
  onSave,
  onDelete,
  readOnly = false,
  courtLocations = [],
  className = '',
}: HearingCardProps) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<Hearing>({ ...hearing })

  const outcome = hearing.outcome || 'Pending'

  const handleQuickOutcome = (newOutcome: HearingOutcome) => {
    if (!onSave) return
    onSave({
      ...hearing,
      outcome: newOutcome,
    })
  }

  const getOutcomeBadgeVariant = (o?: string) => {
    switch (o) {
      case 'Order Made':
        return 'success'
      case 'Directions Given':
        return 'primary'
      case 'Consent Order Agreed':
        return 'info'
      case 'Adjourned':
        return 'warning'
      case 'Dismissed':
        return 'secondary'
      case 'Pending':
      default:
        return 'light'
    }
  }

  if (editing && !readOnly) {
    return (
      <Card className={`mb-2 p-3 shadow-sm border bg-white ${className}`}>
        <Form as={Row} className="g-2">
          <Col md={3}>
            <Form.Group>
              <Form.Label className="small fw-semibold">Hearing Type</Form.Label>
              <Form.Select
                size="sm"
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as Hearing['type'] }))}
              >
                {['Case Management', 'Directions', 'Fact-Finding', 'Final', 'Other'].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={3}>
            <Form.Group>
              <Form.Label className="small fw-semibold">Date</Form.Label>
              <Form.Control
                size="sm"
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              />
            </Form.Group>
          </Col>

          <Col md={2}>
            <Form.Group>
              <Form.Label className="small fw-semibold">Time</Form.Label>
              <Form.Control
                size="sm"
                type="time"
                value={form.time || ''}
                onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
              />
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group>
              <Form.Label className="small fw-semibold">Court Location / Venue</Form.Label>
              <Form.Control
                size="sm"
                value={form.location || ''}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                list={`courts-list-${hearing.id}`}
                placeholder="e.g. Central Family Court"
              />
              {courtLocations.length > 0 && (
                <datalist id={`courts-list-${hearing.id}`}>
                  {courtLocations.map((loc) => (
                    <option key={loc} value={loc} />
                  ))}
                </datalist>
              )}
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group>
              <Form.Label className="small fw-semibold">Allocated Judge</Form.Label>
              <Form.Control
                size="sm"
                value={form.judge || ''}
                onChange={(e) => setForm((f) => ({ ...f, judge: e.target.value }))}
                placeholder="e.g. HHJ Jenkins / District Judge"
              />
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group>
              <Form.Label className="small fw-semibold">Remote Platform</Form.Label>
              <Form.Select
                size="sm"
                value={form.remotePlatform || 'In-Person'}
                onChange={(e) => setForm((f) => ({ ...f, remotePlatform: e.target.value as RemotePlatform }))}
              >
                {['In-Person', 'CVP (Cloud Video Platform)', 'MS Teams', 'BT MeetMe', 'Telephone'].map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group>
              <Form.Label className="small fw-semibold">Remote Video Link</Form.Label>
              <Form.Control
                size="sm"
                value={form.remoteLink || ''}
                onChange={(e) => setForm((f) => ({ ...f, remoteLink: e.target.value }))}
                placeholder="https://cvp.justice.gov.uk/..."
              />
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group>
              <Form.Label className="small fw-semibold">Hearing Outcome</Form.Label>
              <Form.Select
                size="sm"
                value={form.outcome || 'Pending'}
                onChange={(e) => setForm((f) => ({ ...f, outcome: e.target.value as HearingOutcome }))}
              >
                {['Pending', 'Order Made', 'Directions Given', 'Adjourned', 'Consent Order Agreed', 'Dismissed'].map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={8}>
            <Form.Group>
              <Form.Label className="small fw-semibold">Special Measures (FPR Part 3A)</Form.Label>
              <Form.Control
                size="sm"
                value={form.specialMeasures || ''}
                onChange={(e) => setForm((f) => ({ ...f, specialMeasures: e.target.value }))}
                placeholder="e.g. Separate waiting room, witness screen, video link"
              />
            </Form.Group>
          </Col>

          <Col xs={12}>
            <Form.Group>
              <Form.Label className="small fw-semibold">Outcome Summary / Decisions Recorded</Form.Label>
              <Form.Control
                size="sm"
                as="textarea"
                rows={2}
                value={form.outcomeSummary || ''}
                onChange={(e) => setForm((f) => ({ ...f, outcomeSummary: e.target.value }))}
                placeholder="Summary of directions or orders given at the conclusion of this hearing"
              />
            </Form.Group>
          </Col>

          <Col xs={12}>
            <Form.Group>
              <Form.Label className="small fw-semibold">Preparation Notes</Form.Label>
              <Form.Control
                size="sm"
                value={form.notes || ''}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Skeleton arguments, counsel attendance, or preparation items"
              />
            </Form.Group>
          </Col>

          <Col xs={12} className="d-flex gap-2 justify-content-end mt-2">
            <Button
              variant="success"
              size="sm"
              onClick={() => {
                onSave?.(form)
                setEditing(false)
              }}
              disabled={!form.date}
            >
              Save
            </Button>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => {
                setForm({ ...hearing })
                setEditing(false)
              }}
            >
              Cancel
            </Button>
            {onDelete && (
              <Button variant="danger" size="sm" onClick={() => onDelete(hearing.id)}>
                Delete
              </Button>
            )}
          </Col>
        </Form>
      </Card>
    )
  }

  const isRemote = hearing.remotePlatform && hearing.remotePlatform !== 'In-Person'

  return (
    <Card className={`mb-2 p-3 border shadow-sm bg-white ${className}`}>
      <div className="d-flex justify-content-between align-items-start gap-2">
        <div className="min-width-0 flex-grow-1">
          {/* Header Badges */}
          <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
            <Badge bg="warning" className="text-dark fw-semibold">
              <FaGavel className="me-1" size={10} />
              {hearing.type}
            </Badge>

            <span className="fw-bold text-dark d-flex align-items-center gap-1">
              <FaCalendarAlt className="text-primary me-1" />
              {displayDate(hearing.date)}
            </span>

            {hearing.time && (
              <span className="small text-secondary d-flex align-items-center gap-1">
                <FaClock className="text-muted" />
                {hearing.time}
              </span>
            )}

            {/* Outcome Badge */}
            <Badge
              bg={getOutcomeBadgeVariant(hearing.outcome)}
              className={hearing.outcome === 'Pending' || !hearing.outcome ? 'text-secondary border' : ''}
            >
              {hearing.outcome || 'Pending'}
            </Badge>

            {/* Remote Platform Badge */}
            {hearing.remotePlatform && (
              <Badge bg={isRemote ? 'info' : 'light'} text={isRemote ? 'white' : 'dark'} className="border">
                {isRemote ? <FaVideo className="me-1" size={10} /> : <FaMapMarkerAlt className="me-1 text-danger" size={10} />}
                {hearing.remotePlatform}
              </Badge>
            )}

            {/* Special Measures Flag */}
            {hearing.specialMeasures && (
              <Badge bg="light" text="dark" className="border d-flex align-items-center gap-1 text-danger">
                <FaShieldAlt size={10} />
                <span>Special Measures</span>
              </Badge>
            )}
          </div>

          {/* Location & Judge */}
          <div className="small text-secondary mt-1 d-flex flex-wrap align-items-center gap-3">
            <span>
              <FaMapMarkerAlt className="me-1 text-danger" />
              {hearing.location || 'Location TBC'}
            </span>
            {hearing.judge && (
              <span>
                <strong>Judge:</strong> {hearing.judge}
              </span>
            )}
          </div>

          {/* Remote Link CTA */}
          {hearing.remoteLink && (
            <div className="mt-2">
              <a
                href={hearing.remoteLink}
                target="_blank"
                rel="noreferrer"
                className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1.5 py-1 px-2.5"
                style={{ fontSize: '0.78rem' }}
              >
                <FaVideo size={12} className="text-primary" />
                <span>Join Remote Courtroom ({hearing.remotePlatform || 'Video Link'})</span>
                <FaExternalLinkAlt size={10} />
              </a>
            </div>
          )}

          {/* Special Measures Detail */}
          {hearing.specialMeasures && (
            <div className="small mt-2 p-2 rounded bg-danger-subtle border border-danger-subtle text-danger-emphasis d-flex align-items-center gap-1.5">
              <FaShieldAlt size={12} className="flex-shrink-0" />
              <span>
                <strong>FPR Part 3A Measures:</strong> {hearing.specialMeasures}
              </span>
            </div>
          )}

          {/* Preparation Notes */}
          {hearing.notes && (
            <div className="small text-muted mt-2 p-2 bg-light rounded border-start border-3 border-warning">
              <strong>Preparation Notes:</strong> {hearing.notes}
            </div>
          )}

          {/* Outcome Summary Section */}
          {hearing.outcomeSummary && (
            <div className="small mt-2 p-2 bg-success-subtle rounded border-start border-3 border-success text-success-emphasis">
              <strong>Hearing Outcome & Directions Given:</strong> {hearing.outcomeSummary}
            </div>
          )}
        </div>

        {!readOnly && (
          <div className="d-flex align-items-center gap-1 flex-shrink-0">
            {/* Quick outcome change dropdown */}
            {onSave && (
              <Dropdown align="end">
                <Dropdown.Toggle
                  variant="outline-secondary"
                  size="sm"
                  className="py-1 px-2 d-flex align-items-center gap-1"
                  style={{ fontSize: '0.78rem' }}
                >
                  <FaCheckCircle
                    size={11}
                    className={outcome !== 'Pending' ? 'text-success' : 'text-muted'}
                  />
                  <span>Outcome</span>
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => handleQuickOutcome('Order Made')}>
                    Order Made
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => handleQuickOutcome('Directions Given')}>
                    Directions Given
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => handleQuickOutcome('Consent Order Agreed')}>
                    Consent Order Agreed
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => handleQuickOutcome('Adjourned')}>
                    Adjourned
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => handleQuickOutcome('Dismissed')}>
                    Dismissed
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={() => handleQuickOutcome('Pending')}>
                    Reset to Pending
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )}

            {onSave && (
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => setEditing(true)}
                className="d-flex align-items-center gap-1 py-1 px-2"
                style={{ fontSize: '0.78rem' }}
              >
                <FaEdit size={11} />
                <span>Edit</span>
              </Button>
            )}

            {onDelete && (
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => onDelete(hearing.id)}
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
