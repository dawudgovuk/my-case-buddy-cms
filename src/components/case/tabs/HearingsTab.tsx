import { useState, useEffect } from 'react'
import { Card, Form, Row, Col, Button } from 'react-bootstrap'
import { useCasesStore } from '../../../store/casesStore'
import { generateId } from '../../../services/storage'
import type { FamilyCase, Hearing } from '../../../types/domain'
import HearingCard from '../HearingCard'

export interface HearingsTabProps {
  caseId: string
}

export default function HearingsTab({ caseId }: HearingsTabProps) {
  const store = useCasesStore()
  const [type, setType] = useState<Hearing['type']>('Case Management')
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10))
  const [time, setTime] = useState<string>('10:00')
  const [location, setLocation] = useState<string>('')
  const [judge, setJudge] = useState<string>('')
  const [notes, setNotes] = useState<string>('')
  const [courtNames, setCourtNames] = useState<string[]>([])

  useEffect(() => {
    import('../../../utils/courtLocations').then((mod) => {
      mod.getCourtNames().then((names) => setCourtNames(names))
    })
  }, [])

  const fc = store.getById(caseId)
  if (!fc) return null
  const current = fc as FamilyCase

  function addHearing() {
    if (!date) return
    const updated: FamilyCase = {
      ...current,
      hearings: [
        ...current.hearings,
        {
          id: generateId('HRG'),
          type,
          date,
          time: time || undefined,
          location: location || undefined,
          judge: judge || undefined,
          notes: notes || undefined,
        },
      ],
    }
    store.addOrUpdate(updated)
    setLocation('')
    setJudge('')
    setNotes('')
  }

  return (
    <div className="mb-3">
      <Card className="mb-3 p-3 shadow-sm border bg-white">
        <Card.Title className="h5 fw-bold mb-3">Schedule Hearing</Card.Title>
        <Form as={Row} className="g-2 align-items-end">
          <Col md={3}>
            <Form.Group>
              <Form.Label className="small fw-semibold">Type</Form.Label>
              <Form.Select value={type} onChange={(e) => setType(e.target.value as Hearing['type'])} size="sm">
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
              <Form.Control type="date" value={date} onChange={(e) => setDate(e.target.value)} size="sm" />
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group>
              <Form.Label className="small fw-semibold">Time</Form.Label>
              <Form.Control type="time" value={time} onChange={(e) => setTime(e.target.value)} size="sm" />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label className="small fw-semibold">Location</Form.Label>
              <Form.Control
                type="text"
                size="sm"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                list="court-locations-datalist"
                placeholder="Type or select venue"
                autoComplete="off"
              />
              <datalist id="court-locations-datalist">
                {courtNames.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label className="small fw-semibold">Judge / Magistrate</Form.Label>
              <Form.Control
                size="sm"
                value={judge}
                onChange={(e) => setJudge(e.target.value)}
                placeholder="Judge's name"
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label className="small fw-semibold">Notes (optional)</Form.Label>
              <Form.Control
                size="sm"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Preparation notes"
              />
            </Form.Group>
          </Col>
          <Col md={2} className="text-end">
            <Button variant="primary" size="sm" onClick={addHearing} disabled={!date} className="w-100">
              + Schedule
            </Button>
          </Col>
        </Form>
      </Card>

      {fc.hearings.length === 0 && <div className="text-muted p-3 bg-light rounded">No hearings scheduled yet.</div>}

      {fc.hearings.map((h) => (
        <HearingCard
          key={h.id}
          hearing={h}
          courtLocations={courtNames}
          onSave={(updatedHearing) => {
            const updated: FamilyCase = {
              ...current,
              hearings: current.hearings.map((hrg) => (hrg.id === h.id ? updatedHearing : hrg)),
            }
            store.addOrUpdate(updated)
          }}
          onDelete={() => {
            const updated: FamilyCase = {
              ...current,
              hearings: current.hearings.filter((hrg) => hrg.id !== h.id),
            }
            store.addOrUpdate(updated)
          }}
        />
      ))}
    </div>
  )
}
