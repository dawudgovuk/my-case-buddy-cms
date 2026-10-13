import { useMemo, useState } from 'react'
import { useCasesStore } from '../store/casesStore'
import { Button, Card, Form } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import CaseListItemCard from '../components/case/CaseListItemCard'

export default function CasesList() {
  const { cases, remove } = useCasesStore()
  const { user } = useAuthStore()
  const [q, setQ] = useState('')
  const navigate = useNavigate()

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    const visible = user
      ? cases.filter((c) => {
          const members = c.members || []
          return members.some((m) => m.userId === user.id)
        })
      : []
    if (!term) return visible
    return visible.filter((c) =>
      [c.id, c.title, c.caseType, c.status, c.allocatedJudge]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term))
    )
  }, [cases, q, user])

  return (
    <div className="container-fluid p-0">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1>Cases</h1>
        <Button variant="primary" href="/cases/new">
          + New Case
        </Button>
      </div>
      <Form.Group className="mb-3">
        <Form.Control
          type="text"
          placeholder="Case number, title, judge, status..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </Form.Group>
      {filtered.length === 0 && (
        <Card className="mb-2 p-3 text-center border-0 shadow-sm">
          No cases found. Create your first case.
        </Card>
      )}
      {filtered.map((c) => (
        <CaseListItemCard
          key={c.id}
          caseData={c}
          onViewCase={(id) => navigate(`/cases/${id}`)}
          onDeleteCase={(id) => remove(id)}
        />
      ))}
    </div>
  )
}
