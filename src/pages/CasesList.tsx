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
        <h4 className="mb-0" style={{ fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 800, color: 'var(--airbnb-coral)', letterSpacing: '-0.01em' }}>Cases</h4>
        <Button variant="primary" style={{ background: 'var(--airbnb-coral)', border: 'none', fontWeight: 700, fontSize: '1.05rem', padding: '0.5em 1.2em' }} href="/cases/new">+ New Case</Button>
      </div>
      <Form.Group className="mb-3">
        <Form.Control
          type="text"
          placeholder="Case number, title, judge, status..."
          value={q}
          onChange={e => setQ(e.target.value)}
          style={{ border: '1.5px solid var(--airbnb-border)', fontSize: '1.05rem', padding: '0.6em 1em' }}
        />
      </Form.Group>
      {filtered.length === 0 && (
        <Card className="mb-2 p-3 text-center" style={{ color: 'var(--airbnb-gray)', background: 'var(--airbnb-light)'}}>No cases found. Create your first case.</Card>
      )}
      {filtered.map((c) => (
        <Card key={c.id} className="mb-2 p-3 d-flex flex-row align-items-center gap-3" style={{ background: 'var(--airbnb-light)', boxShadow: '0 2px 8px rgba(72,72,72,0.04)' }}>
          <div className="flex-grow-1 min-width-0" style={{ cursor: 'pointer' }} onClick={() => navigate(`/cases/${c.id}`)}>
            <div className="fw-bold text-truncate" style={{ color: 'var(--airbnb-coral)', fontWeight: 700 }}>{c.id} — {c.title}</div>
            <div className="small text-truncate" style={{ color: 'var(--airbnb-gray)' }}>
              {c.court} • {c.caseType} • Judge: {c.allocatedJudge || 'Unassigned'}
            </div>
            <div className="d-flex gap-2 mt-1 flex-wrap">
              <Badge style={{ background: c.status === 'Open' ? 'var(--airbnb-green)' : c.status === 'Concluded' ? 'var(--airbnb-gray)' : 'var(--airbnb-yellow)', color: c.status === 'Concluded' ? '#fff' : '#222', fontWeight: 600, fontSize: '0.95em', padding: '0.3em 0.9em' }}>{c.status}</Badge>
              {typeof c.childrenInvolved === 'number' && (
                <Badge style={{ background: 'var(--airbnb-yellow)', color: 'var(--airbnb-dark)', fontWeight: 600, fontSize: '0.95em', padding: '0.3em 0.9em' }}>{c.childrenInvolved} child{c.childrenInvolved === 1 ? '' : 'ren'}</Badge>
              )}
              <Badge style={{ background: 'var(--airbnb-coral)', color: '#fff', fontWeight: 600, fontSize: '0.95em', padding: '0.3em 0.9em' }}>Parties: {c.parties.length}</Badge>
              <Badge style={{ background: 'var(--airbnb-yellow)', color: 'var(--airbnb-dark)', fontWeight: 600, fontSize: '0.95em', padding: '0.3em 0.9em' }}>Hearings: {c.hearings.length}</Badge>
            </div>
          </div>
          <div className="d-flex gap-2">
                <Button variant="outline-primary" style={{fontWeight: 700, fontSize: '0.98rem' }} onClick={() => navigate(`/cases/${c.id}/edit`)}>Edit</Button>
                <Button variant="outline-danger" style={{fontWeight: 700, fontSize: '0.98rem', color: 'var(--airbnb-coral)' }} onClick={() => remove(c.id)}>Delete</Button>
          </div>
        </Card>
      ))}
    </div>
  )
}


