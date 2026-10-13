import { useState } from 'react'
import { Card, Form, Row, Col, Button } from 'react-bootstrap'
import { useCasesStore } from '../../../store/casesStore'
import { generateId } from '../../../services/storage'
import type { FamilyCase, OrderRecord } from '../../../types/domain'
import OrderCard from '../OrderCard'

export interface OrdersTabProps {
  caseId: string
}

export default function OrdersTab({ caseId }: OrdersTabProps) {
  const store = useCasesStore()
  const [type, setType] = useState<OrderRecord['type']>('Child Arrangements Order')
  const [dateMade, setDateMade] = useState<string>(new Date().toISOString().slice(0, 10))
  const [summary, setSummary] = useState<string>('')
  const [expiresOn, setExpiresOn] = useState<string>('')

  const fc = store.getById(caseId)
  if (!fc) return null
  const current = fc as FamilyCase

  function addOrder() {
    if (!dateMade || !summary.trim()) return
    const updated: FamilyCase = {
      ...current,
      orders: [
        ...current.orders,
        {
          id: generateId('ORD'),
          type,
          dateMade,
          summary: summary.trim(),
          expiresOn: expiresOn || undefined,
        },
      ],
    }
    store.addOrUpdate(updated)
    setSummary('')
    setExpiresOn('')
  }

  return (
    <div className="mb-3">
      <Card className="mb-3 p-3 shadow-sm border bg-white">
        <Card.Title className="h5 fw-bold mb-3">Record Court Order</Card.Title>
        <Form as={Row} className="g-2 align-items-end">
          <Col md={4}>
            <Form.Group>
              <Form.Label className="small fw-semibold">Order Type</Form.Label>
              <Form.Select value={type} onChange={(e) => setType(e.target.value as OrderRecord['type'])} size="sm">
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
              <Form.Control type="date" value={dateMade} onChange={(e) => setDateMade(e.target.value)} size="sm" />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label className="small fw-semibold">Expires on (optional)</Form.Label>
              <Form.Control type="date" value={expiresOn} onChange={(e) => setExpiresOn(e.target.value)} size="sm" />
            </Form.Group>
          </Col>
          <Col md={2} className="text-end">
            <Button
              variant="primary"
              size="sm"
              onClick={addOrder}
              disabled={!summary.trim() || !dateMade}
              className="w-100"
            >
              + Record Order
            </Button>
          </Col>
          <Col xs={12} className="mt-2">
            <Form.Group>
              <Form.Label className="small fw-semibold">Order Summary / Key Directions</Form.Label>
              <Form.Control
                size="sm"
                as="textarea"
                rows={2}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Key directions and prohibitions imposed by the court"
              />
            </Form.Group>
          </Col>
        </Form>
      </Card>

      {fc.orders.length === 0 && <div className="text-muted p-3 bg-light rounded">No court orders recorded yet.</div>}

      {fc.orders.map((o) => (
        <OrderCard
          key={o.id}
          order={o}
          onSave={(updatedOrder) => {
            const updated: FamilyCase = {
              ...current,
              orders: current.orders.map((ord) => (ord.id === o.id ? updatedOrder : ord)),
            }
            store.addOrUpdate(updated)
          }}
          onDelete={() => {
            const updated: FamilyCase = {
              ...current,
              orders: current.orders.filter((ord) => ord.id !== o.id),
            }
            store.addOrUpdate(updated)
          }}
        />
      ))}
    </div>
  )
}
