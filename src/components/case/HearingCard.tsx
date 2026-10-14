import { useState } from 'react'
import { Card, Form, Row, Col, Button, Badge } from 'react-bootstrap'
import type { Hearing } from '../../types/domain'
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaGavel, FaEdit, FaTrash } from 'react-icons/fa'

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

  if (editing && !readOnly) {
    return (
      <Card className={`mb-2 p-3 shadow-sm border bg-white ${className}`}>
        <Form as={Row} className="g-2 align-items-end">
          <Col md={3}>
            <Form.Group>
              <Form.Label className="small fw-semibold">Type</Form.Label>
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
              <Form.Label className="small fw-semibold">Location</Form.Label>
              <Form.Control
                size="sm"
                value={form.location || ''}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                list={`courts-list-${hearing.id}`}
                placeholder="Court venue"
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
          <Col md={6}>
            <Form.Group>
              <Form.Label className="small fw-semibold">Judge</Form.Label>
              <Form.Control
                size="sm"
                value={form.judge || ''}
                onChange={(e) => setForm((f) => ({ ...f, judge: e.target.value }))}
                placeholder="Presiding Judge / Magistrate"
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label className="small fw-semibold">Notes (optional)</Form.Label>
              <Form.Control
                size="sm"
                value={form.notes || ''}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Directions or preparation notes"
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

  return (
    <Card className={`mb-2 p-3 border shadow-sm bg-white ${className}`}>
      <div className="d-flex justify-content-between align-items-start gap-2">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
            <Badge bg="warning" className="text-dark fw-semibold">
              <FaGavel className="me-1" size={10} />
              {hearing.type}
            </Badge>
            <span className="fw-bold text-dark d-flex align-items-center gap-1">
              <FaCalendarAlt className="text-primary me-1" />
              {hearing.date}
            </span>
            {hearing.time && (
              <span className="small text-secondary d-flex align-items-center gap-1">
                <FaClock className="text-muted" />
                {hearing.time}
              </span>
            )}
          </div>

          <div className="small text-secondary mt-1">
            <span className="me-3">
              <FaMapMarkerAlt className="me-1 text-danger" />
              {hearing.location || 'Location TBC'}
            </span>
            {hearing.judge && (
              <span>
                <strong>Judge:</strong> {hearing.judge}
              </span>
            )}
          </div>

          {hearing.notes && (
            <div className="small text-muted mt-2 p-2 bg-light rounded border-start border-3 border-warning">
              {hearing.notes}
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
                onClick={() => onDelete(hearing.id)}
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
