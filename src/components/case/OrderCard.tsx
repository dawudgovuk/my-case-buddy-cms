import { useState } from 'react'
import { displayDate } from '../../utils/displayDate'
import { Card, Form, Row, Col, Button, Badge, Alert } from 'react-bootstrap'
import { useTranslation } from '../../hooks/useTranslation'
import type { OrderRecord, ComplianceDeadline } from '../../types/domain'
import {
  FaBalanceScale,
  FaCalendarCheck,
  FaClock,
  FaEdit,
  FaTrash,
  FaExclamationTriangle,
  FaCheckSquare,
  FaSquare,
  FaPlus,
  FaUserCheck,
} from 'react-icons/fa'
import { generateId } from '../../services/storage'

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
  const { t } = useTranslation()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<OrderRecord>({ ...order })

  // New deadline inline input state
  const [showAddDeadline, setShowAddDeadline] = useState(false)
  const [newDeadlineTitle, setNewDeadlineTitle] = useState('')
  const [newDeadlineDate, setNewDeadlineDate] = useState('')
  const [newDeadlineParty, setNewDeadlineParty] = useState('Applicant')

  const isExpired = order.expiresOn && new Date(order.expiresOn) < new Date()
  const deadlines = order.complianceDeadlines || []

  const handleToggleDeadline = (deadlineId: string) => {
    if (!onSave) return
    const updatedDeadlines = deadlines.map((d) => {
      if (d.id === deadlineId) {
        const nextCompleted = !d.isCompleted
        return {
          ...d,
          isCompleted: nextCompleted,
          completedAt: nextCompleted ? new Date().toISOString() : undefined,
        }
      }
      return d
    })
    onSave({
      ...order,
      complianceDeadlines: updatedDeadlines,
    })
  }

  const handleAddDeadline = () => {
    if (!newDeadlineTitle.trim() || !newDeadlineDate || !onSave) return
    const newDeadline: ComplianceDeadline = {
      id: generateId('DDL'),
      title: newDeadlineTitle.trim(),
      dueDate: newDeadlineDate,
      responsibleParty: newDeadlineParty,
      isCompleted: false,
    }
    onSave({
      ...order,
      complianceDeadlines: [...deadlines, newDeadline],
    })
    setNewDeadlineTitle('')
    setNewDeadlineDate('')
    setShowAddDeadline(false)
  }

  if (editing && !readOnly) {
    return (
      <Card className={`mb-2 p-3 shadow-sm border bg-white ${className}`}>
        <Form as={Row} className="g-2 align-items-end">
          <Col md={5}>
            <Form.Group>
              <Form.Label className="small fw-semibold">{t.caseTabs.orderType}</Form.Label>
              <Form.Select
                size="sm"
                value={form.type}
                onChange={(e) => {
                  const val = e.target.value as OrderRecord['type']
                  const autoPenal = val === 'Non-Molestation Order' || val === 'Prohibited Steps Order'
                  setForm((f) => ({
                    ...f,
                    type: val,
                    hasPenalNotice: autoPenal ? true : f.hasPenalNotice,
                  }))
                }}
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
                ].map((tVal) => (
                  <option key={tVal} value={tVal}>
                    {tVal}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={3}>
            <Form.Group>
              <Form.Label className="small fw-semibold">{t.caseTabs.orderDate}</Form.Label>
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
              <Form.Label className="small fw-semibold">{t.caseTabs.expiresOn}</Form.Label>
              <Form.Control
                size="sm"
                type="date"
                value={form.expiresOn || ''}
                onChange={(e) => setForm((f) => ({ ...f, expiresOn: e.target.value }))}
              />
            </Form.Group>
          </Col>

          <Col xs={12}>
            <Form.Check
              type="checkbox"
              id={`edit-penal-${order.id}`}
              label={t.caseTabs.penalNoticeFullWarning}
              checked={Boolean(form.hasPenalNotice)}
              onChange={(e) => setForm((f) => ({ ...f, hasPenalNotice: e.target.checked }))}
              className="small fw-semibold text-danger"
            />
          </Col>

          <Col xs={12}>
            <Form.Group>
              <Form.Label className="small fw-semibold">{t.caseTabs.orderSummaryDirections}</Form.Label>
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
              {t.common.save}
            </Button>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => {
                setForm({ ...order })
                setEditing(false)
              }}
            >
              {t.common.cancel}
            </Button>
            {onDelete && (
              <Button variant="danger" size="sm" onClick={() => onDelete(order.id)}>
                {t.common.delete}
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
        <div className="min-width-0 flex-grow-1">
          {/* Header Badges */}
          <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
            <Badge bg="primary" className="fw-semibold">
              <FaBalanceScale className="me-1" size={10} />
              {order.type}
            </Badge>

            {order.hasPenalNotice && (
              <Badge bg="danger" className="d-flex align-items-center gap-1 font-monospace">
                <FaExclamationTriangle size={10} />
                <span>{t.caseTabs.penalNoticeWarning}</span>
              </Badge>
            )}

            <span className="small text-secondary d-flex align-items-center gap-1">
              <FaCalendarCheck className="text-success" />
              <span>{t.caseTabs.orderDate}: {displayDate(order.dateMade)}</span>
            </span>

            {order.expiresOn && (
              <span className={`small d-flex align-items-center gap-1 ${isExpired ? 'text-danger fw-semibold' : 'text-muted'}`}>
                <FaClock />
                <span>{t.caseTabs.expiresOn}: {displayDate(order.expiresOn)} {isExpired ? `(${t.inviteAccept.hasExpired})` : ''}</span>
              </span>
            )}
          </div>

          {/* Penal Notice Warning Alert Banner */}
          {order.hasPenalNotice && (
            <Alert variant="danger" className="d-flex gap-2 align-items-start small py-2 px-3 my-2 border border-danger">
              <FaExclamationTriangle className="mt-1 flex-shrink-0 text-danger" size={14} />
              <div>
                <strong>{t.caseTabs.penalNoticeWarning}:</strong> Take notice that if you fail to comply with the terms and
                directions set out in this order, you may be held in contempt of court and may be imprisoned, fined, or
                have your assets seized (s.42A Family Law Act 1996).
              </div>
            </Alert>
          )}

          {/* Summary & Directions */}
          <div className="text-dark small my-2 p-2 bg-light rounded border-start border-3 border-primary">
            {order.summary}
          </div>

          {/* Compliance Deadlines Section */}
          <div className="mt-2 pt-2 border-top">
            <div className="d-flex justify-content-between align-items-center mb-1.5">
              <div className="small fw-bold text-dark d-flex align-items-center gap-1.5">
                <FaUserCheck className="text-primary" size={12} />
                <span>{t.caseTabs.filingDeadlines} ({deadlines.filter((d) => d.isCompleted).length}/{deadlines.length})</span>
              </div>
              {!readOnly && (
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 text-decoration-none small text-primary d-inline-flex align-items-center gap-1"
                  onClick={() => setShowAddDeadline(!showAddDeadline)}
                >
                  <FaPlus size={10} />
                  <span>{t.caseTabs.addDeadline}</span>
                </Button>
              )}
            </div>

            {/* List of deadlines */}
            {deadlines.length > 0 ? (
              <div className="d-flex flex-column gap-1 mb-2">
                {deadlines.map((d) => (
                  <div
                    key={d.id}
                    className={`d-flex align-items-center justify-content-between p-1.5 rounded border small ${
                      d.isCompleted ? 'bg-light text-muted' : 'bg-white text-dark'
                    }`}
                  >
                    <div
                      className="d-flex align-items-center gap-2 cursor-pointer flex-grow-1"
                      onClick={() => !readOnly && handleToggleDeadline(d.id)}
                      style={{ cursor: readOnly ? 'default' : 'pointer' }}
                    >
                      {d.isCompleted ? (
                        <FaCheckSquare className="text-success flex-shrink-0" size={14} />
                      ) : (
                        <FaSquare className="text-secondary flex-shrink-0" size={14} />
                      )}
                      <span className={d.isCompleted ? 'text-decoration-line-through text-muted' : 'fw-medium'}>
                        {d.title}
                      </span>
                    </div>

                    <div className="d-flex align-items-center gap-2 flex-shrink-0 ms-2">
                      {d.responsibleParty && (
                        <Badge bg="light" text="dark" className="border font-monospace" style={{ fontSize: '0.68rem' }}>
                          {d.responsibleParty}
                        </Badge>
                      )}
                      <Badge
                        bg={d.isCompleted ? 'light' : 'warning'}
                        text={d.isCompleted ? 'muted' : 'dark'}
                        className="font-monospace"
                        style={{ fontSize: '0.68rem' }}
                      >
                        {t.caseTabs.duePrefix} {d.dueDate}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-muted small py-1 fst-italic">
                {t.caseTabs.noDeadlinesRecorded}
              </div>
            )}

            {/* Inline Add Deadline Form */}
            {showAddDeadline && !readOnly && (
              <div className="p-2 border rounded bg-light mb-2">
                <Row className="g-1.5 align-items-end">
                  <Col md={5}>
                    <Form.Group>
                      <Form.Label className="small fw-semibold mb-0" style={{ fontSize: '0.72rem' }}>
                        {t.caseTabs.initialDirectionOptional}
                      </Form.Label>
                      <Form.Control
                        size="sm"
                        value={newDeadlineTitle}
                        onChange={(e) => setNewDeadlineTitle(e.target.value)}
                        placeholder="e.g. File & serve witness statement"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={3}>
                    <Form.Group>
                      <Form.Label className="small fw-semibold mb-0" style={{ fontSize: '0.72rem' }}>
                        {t.caseTabs.hearingDate}
                      </Form.Label>
                      <Form.Control
                        size="sm"
                        type="date"
                        value={newDeadlineDate}
                        onChange={(e) => setNewDeadlineDate(e.target.value)}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={2}>
                    <Form.Group>
                      <Form.Label className="small fw-semibold mb-0" style={{ fontSize: '0.72rem' }}>
                        {t.caseTabs.partyRole}
                      </Form.Label>
                      <Form.Select
                        size="sm"
                        value={newDeadlineParty}
                        onChange={(e) => setNewDeadlineParty(e.target.value)}
                      >
                        <option value="Applicant">Applicant</option>
                        <option value="Respondent">Respondent</option>
                        <option value="CAFCASS">CAFCASS</option>
                        <option value="Local Authority">Local Authority</option>
                        <option value="Both Parties">Both Parties</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={2} className="d-flex gap-1">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleAddDeadline}
                      disabled={!newDeadlineTitle.trim() || !newDeadlineDate}
                      className="w-100 py-1"
                      style={{ fontSize: '0.75rem' }}
                    >
                      {t.common.save}
                    </Button>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => setShowAddDeadline(false)}
                      className="py-1"
                      style={{ fontSize: '0.75rem' }}
                    >
                      ✕
                    </Button>
                  </Col>
                </Row>
              </div>
            )}
          </div>
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
                onClick={() => onDelete(order.id)}
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
