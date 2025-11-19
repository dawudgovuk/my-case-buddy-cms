import { useEffect, useMemo, useState } from 'react'
import { Button, Card, Form, Row, Col } from 'react-bootstrap'
import type { FamilyCase } from '../types/domain'
import { generateId } from '../services/storage'
import { useCasesStore } from '../store/casesStore'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

const courts = ['Family Court', 'High Court Family Division'] as const
const types = [
  'Public Law (Care Proceedings)',
  'Private Law (Child Arrangements)',
  'Domestic Abuse (Non-Molestation)',
  'Financial Remedies',
  'Adoption',
  'Other',
] as const
const statuses = ['Open', 'Stayed', 'Concluded'] as const

export default function CaseForm() {
  const navigate = useNavigate()
  const { caseId } = useParams()
  const { getById, addOrUpdate } = useCasesStore()
  const { user } = useAuthStore()

  const existing = useMemo(() => (caseId ? getById(caseId) : undefined), [caseId, getById])

  const [form, setForm] = useState<FamilyCase>(() =>
    existing ?? {
      id: '',
      title: '',
      court: 'Family Court',
      caseType: 'Private Law (Child Arrangements)',
      status: 'Open',
      startedAt: new Date().toISOString().slice(0, 10),
      allocatedJudge: '',
      childrenInvolved: undefined,
      parties: [],
      hearings: [],
      orders: [],
      documents: [],
      notes: [],
      lastUpdatedAt: new Date().toISOString(),
      currentStage: 'application',
    },
  )

  useEffect(() => {
    if (existing) setForm(existing)
  }, [existing])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmedTitle = form.title.trim()
    const trimmedJudge = form.allocatedJudge?.trim() || undefined
    const id = existing?.id || form.id || generateId('CASE')
    const payload: FamilyCase = {
      ...form,
      id,
      title: trimmedTitle,
      allocatedJudge: trimmedJudge,
      startedAt: form.startedAt,
      members: existing?.members ?? (user ? [{ userId: user.id, role: 'Owner' }] : []),
      currentStage: existing?.currentStage || 'application',
    }
    addOrUpdate(payload)
    navigate(`/cases/${id}`)
  }

  return (
    <Card className="p-4 mx-auto" style={{ maxWidth: 600 }}>
      <Form onSubmit={handleSubmit}>
        <h4 className="mb-3">{existing ? 'Edit Case' : 'Create New Case'}</h4>
        <Form.Group className="mb-3">
          <Form.Label>Case title</Form.Label>
          <Form.Control
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Case number (auto if left blank)</Form.Label>
          <Form.Control
            value={form.id}
            onChange={e => setForm(f => ({ ...f, id: e.target.value }))}
            placeholder="e.g., FC-23-001234"
          />
        </Form.Group>
        <Row className="mb-3">
          <Col>
            <Form.Group>
              <Form.Label>Court</Form.Label>
              <Form.Select value={form.court} onChange={e => setForm(f => ({ ...f, court: e.target.value as any }))}>
                {courts.map(c => <option key={c} value={c}>{c}</option>)}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col>
            <Form.Group>
              <Form.Label>Case Type</Form.Label>
              <Form.Select value={form.caseType} onChange={e => setForm(f => ({ ...f, caseType: e.target.value as any }))}>
                {types.map(t => <option key={t} value={t}>{t}</option>)}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col>
            <Form.Group>
              <Form.Label>Status</Form.Label>
              <Form.Select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as any }))}>
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col>
            <Form.Group>
              <Form.Label>Started on</Form.Label>
              <Form.Control
                type="date"
                value={form.startedAt}
                onChange={e => setForm(f => ({ ...f, startedAt: e.target.value }))}
              />
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col>
            <Form.Group>
              <Form.Label>Allocated judge</Form.Label>
              <Form.Control
                value={form.allocatedJudge || ''}
                onChange={e => setForm(f => ({ ...f, allocatedJudge: e.target.value }))}
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group>
              <Form.Label>Children involved</Form.Label>
              <Form.Control
                type="number"
                value={form.childrenInvolved ?? ''}
                onChange={e => setForm(f => ({ ...f, childrenInvolved: e.target.value === '' ? undefined : Number(e.target.value) }))}
              />
            </Form.Group>
          </Col>
        </Row>
        <div className="d-flex gap-2">
          <Button type="submit" variant="primary">Save</Button>
          <Button variant="outline-secondary" onClick={() => navigate(existing ? `/cases/${existing.id}` : '/')}>Cancel</Button>
        </div>
      </Form>
    </Card>
  )
}


