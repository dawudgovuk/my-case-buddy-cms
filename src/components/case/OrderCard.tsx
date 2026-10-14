import { useState } from 'react'
import { Card, Form, Row, Col, Button, Badge } from 'react-bootstrap'
import type { OrderRecord } from '../../types/domain'
import { FaBalanceScale, FaCalendarCheck, FaClock, FaEdit, FaTrash } from 'react-icons/fa'

export interface OrderCardProps {
  order: OrderRecord
  onSave?: (updatedOrder: OrderRecord) => void
  onDelete?: (orderId: string) => void
  readOnly?: boolean
  className?: string
}

export default function OrderCard({
  order,
  onSave,
  onDelete,
  readOnly = false,
  className = '',
}: OrderCardProps) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<OrderRecord>({ ...order })

  if (editing && !readOnly) {
    return (
      <Card className={`mb-2 p-3 shadow-sm border bg-white ${className}`}>
        <Form as={Row} className="g-2 align-items-end">
          <Col md={5}>
            <Form.Group>
              <Form.Label className="small fw-semibold">Order Type</Form.Label>
              <Form.Select
                size="sm"
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as OrderRecord['type'] }))}
              >
                {[
                  'Child Arrangements Order',
                  'Care Order',
                  'Supervision Order',
                  'Non-Molestation Order',
                  'Prohibited Steps Order',
                  'Specific Issue Order',
                  'Financial Remedies Order',
                  'Other',
                ].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label className="small fw-semibold">Date made</Form.Label>
              <Form.Control
                size="sm"
                type="date"
                value={form.dateMade}
                onChange={(e) => setForm((f) => ({ ...f, dateMade: e.target.value }))}
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label className="small fw-semibold">Expires on (optional)</Form.Label>
              <Form.Control
                size="sm"
                type="date"
                value={form.expiresOn || ''}
                onChange={(e) => setForm((f) => ({ ...f, expiresOn: e.target.value }))}
              />
            </Form.Group>
          </Col>
          <Col xs={12}>
            <Form.Group>
              <Form.Label className="small fw-semibold">Summary & Key Directions</Form.Label>
              <Form.Control
                size="sm"
                as="textarea"
                rows={2}
                value={form.summary || ''}
                onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
                placeholder="Key directions and prohibitions imposed by the court"
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
              disabled={!form.summary.trim() || !form.dateMade}
            >
              Save
            </Button>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => {
                setForm({ ...order })
                setEditing(false)
              }}
            >
              Cancel
            </Button>
            {onDelete && (
              <Button variant="danger" size="sm" onClick={() => onDelete(order.id)}>
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
        <div className="min-width-0">
          <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
            <Badge bg="primary" className="fw-semibold">
              <FaBalanceScale className="me-1" size={10} />
              {order.type}
            </Badge>
            <span className="small text-muted d-flex align-items-center gap-1">
              <FaCalendarCheck className="text-success" />
              <span>Made on {order.dateMade}</span>
            </span>
            {order.expiresOn ? (
              <span className="small text-danger d-flex align-items-center gap-1">
                <FaClock />
                <span>Expires: {order.expiresOn}</span>
              </span>
            ) : (
              <span className="small text-secondary">• No expiry set</span>
            )}
          </div>

          {order.summary && (
            <p className="small text-dark mb-0 mt-2 p-2 bg-light rounded border-start border-3 border-primary">
              {order.summary}
            </p>
          )}
        </div>

        {!readOnly && (
          <div className="d-flex gap-1 flex-shrink-0">
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
                onClick={() => onDelete(order.id)}
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
