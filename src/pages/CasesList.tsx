import { useMemo, useState } from 'react'
import { useCasesStore } from '../store/casesStore'
import { Button, Card, Form, Badge } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function CasesList() {
  const { cases, remove } = useCasesStore()
  const { user } = useAuthStore()
  const [q, setQ] = useState('')
  const navigate = useNavigate()

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    const visible = user ? cases.filter(c => {
      const members = c.members || []
      return members.some(m => m.userId === user.id)
    }) : []
    if (!term) return visible
    return visible.filter((c) =>
      [c.id, c.title, c.caseType, c.status, c.allocatedJudge]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term)),
    )
  }, [cases, q, user])

  return (
    <div className="container-fluid p-0">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Cases</h4>
        <Button variant="primary" href="/cases/new">+ New Case</Button>
      </div>
      <Form.Group className="mb-3">
        <Form.Control
          type="text"
          placeholder="Case number, title, judge, status..."
          value={q}
          onChange={e => setQ(e.target.value)}
        />
      </Form.Group>
      {filtered.length === 0 && (
        <Card className="mb-2 p-3 text-center text-muted">No cases found. Create your first case.</Card>
      )}
      {filtered.map((c) => (
        <Card key={c.id} className="mb-2 p-3 d-flex flex-row align-items-center gap-3">
          <div className="flex-grow-1 min-width-0" style={{ cursor: 'pointer' }} onClick={() => navigate(`/cases/${c.id}`)}>
            <div className="fw-bold text-truncate">{c.id} — {c.title}</div>
            <div className="text-muted small text-truncate">
              {c.court} • {c.caseType} • Judge: {c.allocatedJudge || 'Unassigned'}
            </div>
            <div className="d-flex gap-2 mt-1 flex-wrap">
              <Badge bg={c.status === 'Open' ? 'success' : c.status === 'Concluded' ? 'secondary' : 'warning'}>{c.status}</Badge>
              {typeof c.childrenInvolved === 'number' && (
                <Badge bg="info" text="dark">{c.childrenInvolved} child{c.childrenInvolved === 1 ? '' : 'ren'}</Badge>
              )}
              <Badge bg="info" text="dark">Parties: {c.parties.length}</Badge>
              <Badge bg="info" text="dark">Hearings: {c.hearings.length}</Badge>
            </div>
          </div>
          <div className="d-flex gap-2">
            <Button variant="outline-primary" onClick={() => navigate(`/cases/${c.id}/edit`)}>Edit</Button>
            <Button variant="outline-danger" onClick={() => remove(c.id)}>Delete</Button>
          </div>
        </Card>
      ))}
    </div>
  )
}


