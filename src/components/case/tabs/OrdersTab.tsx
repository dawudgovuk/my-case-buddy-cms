import { useState } from 'react'
import { Card, Form, Row, Col, Button, Badge } from 'react-bootstrap'
import { useCasesStore } from '../../../store/casesStore'
import { generateId } from '../../../services/storage'
import { toast } from '../../../store/toastStore'
import type { FamilyCase, OrderRecord, ComplianceDeadline } from '../../../types/domain'
import OrderCard from '../OrderCard'
import { FaBalanceScale, FaExclamationTriangle, FaCalendarCheck, FaTasks } from 'react-icons/fa'

export interface OrdersTabProps {
  caseId: string
}

export default function OrdersTab({ caseId }: OrdersTabProps) {
  const store = useCasesStore()
  const [type, setType] = useState<OrderRecord['type']>('Child Arrangements Order')
  const [dateMade, setDateMade] = useState<string>(new Date().toISOString().slice(0, 10))
  const [summary, setSummary] = useState<string>('')
  const [expiresOn, setExpiresOn] = useState<string>('')
  const [hasPenalNotice, setHasPenalNotice] = useState<boolean>(false)

  // Optional initial compliance direction
  const [initialDeadlineTitle, setInitialDeadlineTitle] = useState('')
  const [initialDeadlineDate, setInitialDeadlineDate] = useState('')
  const [initialDeadlineParty, setInitialDeadlineParty] = useState('Applicant')

  const fc = store.getById(caseId)
  if (!fc) return null
  const current = fc as FamilyCase

  const handleTypeChange = (selectedType: OrderRecord['type']) => {
    setType(selectedType)
    // Non-Molestation and Prohibited Steps orders standardly carry Penal Notices
    if (selectedType === 'Non-Molestation Order' || selectedType === 'Prohibited Steps Order') {
      setHasPenalNotice(true)
    }
  }

  function addOrder() {
    if (!dateMade || !summary.trim()) return

    const initialDeadlines: ComplianceDeadline[] = []
    if (initialDeadlineTitle.trim() && initialDeadlineDate) {
      initialDeadlines.push({
        id: generateId('DDL'),
        title: initialDeadlineTitle.trim(),
        dueDate: initialDeadlineDate,
        responsibleParty: initialDeadlineParty,
        isCompleted: false,
      })
    }

    const newOrder: OrderRecord = {
      id: generateId('ORD'),
      type,
      dateMade,
      summary: summary.trim(),
      expiresOn: expiresOn || undefined,
      hasPenalNotice,
      complianceDeadlines: initialDeadlines.length > 0 ? initialDeadlines : undefined,
    }

    const updated: FamilyCase = {
      ...current,
      orders: [...(current.orders || []), newOrder],
    }

    store.addOrUpdate(updated)
    toast.success(`Recorded court order: "${type}".`, 'Order Recorded')

    // Reset form
    setSummary('')
    setExpiresOn('')
    setHasPenalNotice(false)
    setInitialDeadlineTitle('')
    setInitialDeadlineDate('')
  }

  const allOrders = current.orders || []
  const penalNoticeOrdersCount = allOrders.filter((o) => o.hasPenalNotice).length
  const totalDeadlinesCount = allOrders.reduce(
    (acc, o) => acc + (o.complianceDeadlines?.length || 0),
    0
  )
  const completedDeadlinesCount = allOrders.reduce(
    (acc, o) => acc + (o.complianceDeadlines?.filter((d) => d.isCompleted).length || 0),
    0
  )

  return (
    <div className="d-flex flex-column gap-3">
      {/* Top Stats Banner */}
      <Card className="border shadow-sm bg-white p-3 rounded-3">
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="p-2 rounded-circle bg-primary-subtle text-primary">
                <FaBalanceScale size={16} />
              </span>
              <div>
                <h6 className="fw-bold mb-0 text-dark">Court Orders & Compliance Directions</h6>
                <div className="small text-muted">
                  Log formal court orders, track penal notice contempt warnings, and audit party compliance deadlines.
                </div>
              </div>
            </div>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <Badge bg="primary" className="py-1 px-2 font-monospace">
              {allOrders.length} Orders
            </Badge>
            {penalNoticeOrdersCount > 0 && (
              <Badge bg="danger" className="py-1 px-2 font-monospace d-flex align-items-center gap-1">
                <FaExclamationTriangle size={10} />
                <span>{penalNoticeOrdersCount} Penal Notices</span>
              </Badge>
            )}
            <Badge bg="info" className="py-1 px-2 font-monospace d-flex align-items-center gap-1 text-white">
              <FaTasks size={10} />
              <span>{completedDeadlinesCount}/{totalDeadlinesCount} Directions Met</span>
            </Badge>
          </div>
        </div>
      </Card>

      {/* Record Court Order Form */}
      <Card className="p-3 shadow-sm border bg-white rounded-3">
        <Card.Title className="h6 fw-bold mb-3 d-flex align-items-center gap-2 text-dark">
          <FaCalendarCheck className="text-primary" />
          <span>Record New Court Order</span>
        </Card.Title>

        <Form as={Row} className="g-2 align-items-end">
          <Col md={4}>
            <Form.Group>
              <Form.Label className="small fw-semibold">Order Type</Form.Label>
              <Form.Select
                value={type}
                onChange={(e) => handleTypeChange(e.target.value as OrderRecord['type'])}
                size="sm"
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
              <Form.Label className="small fw-semibold">Date Made</Form.Label>
              <Form.Control type="date" value={dateMade} onChange={(e) => setDateMade(e.target.value)} size="sm" />
            </Form.Group>
          </Col>

          <Col md={3}>
            <Form.Group>
              <Form.Label className="small fw-semibold">Expires On (optional)</Form.Label>
              <Form.Control type="date" value={expiresOn} onChange={(e) => setExpiresOn(e.target.value)} size="sm" />
            </Form.Group>
          </Col>

          <Col md={2} className="text-end">
            <Button
              variant="primary"
              size="sm"
              onClick={addOrder}
              disabled={!summary.trim() || !dateMade}
              className="w-100 fw-semibold"
            >
              + Record Order
            </Button>
          </Col>

          {/* Penal Notice Checkbox */}
          <Col xs={12} className="mt-1">
            <Form.Check
              type="checkbox"
              id="new-order-penal-notice"
              label="Attach Penal Notice Warning (Criminal Contempt under s.42A Family Law Act 1996)"
              checked={hasPenalNotice}
              onChange={(e) => setHasPenalNotice(e.target.checked)}
              className="small fw-semibold text-danger"
            />
          </Col>

          <Col xs={12} className="mt-1">
            <Form.Group>
              <Form.Label className="small fw-semibold">Order Summary & Key Directions</Form.Label>
              <Form.Control
                size="sm"
                as="textarea"
                rows={2}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Directions imposed by the court (e.g. prohibited steps, contact schedules, statement filing timelines)"
              />
            </Form.Group>
          </Col>

          {/* Optional First Compliance Direction */}
          <Col xs={12} className="mt-2 pt-2 border-top">
            <div className="small fw-bold text-secondary mb-1">
              Add Initial Compliance Direction (Optional):
            </div>
            <Row className="g-2">
              <Col md={6}>
                <Form.Control
                  size="sm"
                  value={initialDeadlineTitle}
                  onChange={(e) => setInitialDeadlineTitle(e.target.value)}
                  placeholder="e.g. Applicant to file and serve witness statement by 4pm"
                />
              </Col>
              <Col md={3}>
                <Form.Control
                  size="sm"
                  type="date"
                  value={initialDeadlineDate}
                  onChange={(e) => setInitialDeadlineDate(e.target.value)}
                />
              </Col>
              <Col md={3}>
                <Form.Select
                  size="sm"
                  value={initialDeadlineParty}
                  onChange={(e) => setInitialDeadlineParty(e.target.value)}
                >
                  <option value="Applicant">Applicant</option>
                  <option value="Respondent">Respondent</option>
                  <option value="CAFCASS">CAFCASS</option>
                  <option value="Local Authority">Local Authority</option>
                  <option value="Both Parties">Both Parties</option>
                </Form.Select>
              </Col>
            </Row>
          </Col>
        </Form>
      </Card>

      {/* Orders List */}
      {allOrders.length === 0 ? (
        <div className="text-muted p-4 bg-light rounded text-center border">
          No court orders recorded for this case yet.
        </div>
      ) : (
        <div className="d-flex flex-column gap-2">
          {allOrders.map((o) => (
            <OrderCard
              key={o.id}
              order={o}
              onSave={(updatedOrder) => {
                const updated: FamilyCase = {
                  ...current,
                  orders: (current.orders || []).map((orig) => (orig.id === o.id ? updatedOrder : orig)),
                }
                store.addOrUpdate(updated)
                toast.success(`Court order "${updatedOrder.type}" updated.`, 'Order Updated')
              }}
              onDelete={() => {
                const updated: FamilyCase = {
                  ...current,
                  orders: (current.orders || []).filter((orig) => orig.id !== o.id),
                }
                store.addOrUpdate(updated)
                toast.info(`Court order removed from case.`, 'Order Removed')
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
