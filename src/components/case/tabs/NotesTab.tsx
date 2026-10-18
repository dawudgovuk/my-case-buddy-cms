import { useState, useMemo } from 'react'
import { Card, Form, Row, Col, Button, Badge } from 'react-bootstrap'
import { useCasesStore } from '../../../store/casesStore'
import { useAuthStore } from '../../../store/authStore'
import { generateId } from '../../../services/storage'
import { toast } from '../../../store/toastStore'
import type { FamilyCase, CaseNote } from '../../../types/domain'
import CaseNoteCard from '../CaseNoteCard'
import { FaStickyNote, FaSearch, FaFilter } from 'react-icons/fa'

export interface NotesTabProps {
  caseId: string
}

const NOTE_CATEGORIES = [
  'Legal Strategy',
  'Hearing Attendance',
  'Telephone Attendance',
  'Client Conference',
  'CAFCASS Consultation',
  'Drafting Review',
  'General Note',
] as const

export default function NotesTab({ caseId }: NotesTabProps) {
  const store = useCasesStore()
  const { user } = useAuthStore()
  const defaultAuthor =
    user?.name || (user as { username?: string })?.username || (user?.email ? user.email.split('@')[0] : '')

  const [author, setAuthor] = useState(defaultAuthor)
  const [category, setCategory] = useState<string>('Legal Strategy')
  const [text, setText] = useState('')

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('ALL')

  const fc = store.getById(caseId)
  const current = fc as FamilyCase | undefined

  function addNote() {
    if (!text.trim() || !current) return
    const authorName = author.trim() || defaultAuthor || 'User'
    const newNote: CaseNote = {
      id: generateId('NOTE'),
      createdAt: new Date().toISOString(),
      author: authorName,
      text: text.trim(),
      category,
    }

    const updated: FamilyCase = {
      ...current,
      notes: [...(current.notes || []), newNote],
    }

    store.addOrUpdate(updated)
    toast.success(`Case note [${category}] recorded.`, 'Note Saved')
    setText('')
  }

  // Filtered notes
  const filteredNotes = useMemo(() => {
    return [...(current?.notes || [])]
      .filter((n) => {
        const q = searchQuery.toLowerCase().trim()
        const matchesQuery =
          !q ||
          n.text.toLowerCase().includes(q) ||
          n.author.toLowerCase().includes(q) ||
          (n.category && n.category.toLowerCase().includes(q))

        const matchesCat =
          categoryFilter === 'ALL' ||
          n.category === categoryFilter ||
          n.text.toLowerCase().includes(`[${categoryFilter.toLowerCase()}]`)

        return matchesQuery && matchesCat
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [current?.notes, searchQuery, categoryFilter])

  if (!current) return null

  return (
    <div className="d-flex flex-column gap-3">
      {/* Top Banner */}
      <Card className="border shadow-sm bg-white p-3 rounded-3">
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="p-2 rounded-circle bg-warning-subtle text-warning">
                <FaStickyNote size={16} />
              </span>
              <div>
                <h6 className="fw-bold mb-0 text-dark">Case Strategy & Attendance Notes</h6>
                <div className="small text-muted">
                  Record contemporaneous hearing notes, telephone attendance, client instructions, and CAFCASS meetings.
                </div>
              </div>
            </div>
          </div>
          <Badge bg="secondary" className="py-1.5 px-2.5 font-monospace">
            {current.notes?.length || 0} Total Notes
          </Badge>
        </div>
      </Card>

      {/* Add Note Form */}
      <Card className="p-3 shadow-sm border bg-white rounded-3">
        <Card.Title className="h6 fw-bold mb-3 d-flex align-items-center gap-2 text-dark">
          <FaStickyNote className="text-warning" />
          <span>Record Contemporaneous Case Note</span>
        </Card.Title>

        <Form>
          <Row className="g-2 mb-2">
            <Col md={4}>
              <Form.Group>
                <Form.Label className="small fw-semibold">Note Author</Form.Label>
                <Form.Control
                  size="sm"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Your name or initials"
                />
              </Form.Group>
            </Col>

            <Col md={5}>
              <Form.Group>
                <Form.Label className="small fw-semibold">Note Category</Form.Label>
                <Form.Select
                  size="sm"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {NOTE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={3} className="d-flex align-items-end">
              <Button
                variant="primary"
                size="sm"
                onClick={addNote}
                disabled={!text.trim()}
                className="w-100 fw-semibold"
              >
                + Record Note
              </Button>
            </Col>
          </Row>

          <Form.Group>
            <Form.Label className="small fw-semibold">Note Content / Attendance Summary</Form.Label>
            <Form.Control
              size="sm"
              as="textarea"
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Record contemporaneous hearing notes, submissions made, client instructions, or strategic thoughts..."
            />
          </Form.Group>
        </Form>
      </Card>

      {/* Filter and Search Bar */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2">
        <div className="input-group input-group-sm flex-grow-1" style={{ maxWidth: '380px' }}>
          <span className="input-group-text bg-white border-end-0">
            <FaSearch size={11} className="text-muted" />
          </span>
          <Form.Control
            size="sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes by keyword or author..."
            className="border-start-0"
          />
        </div>

        <div className="d-flex align-items-center gap-2">
          <span className="small text-muted d-flex align-items-center gap-1">
            <FaFilter size={10} />
            <span>Category:</span>
          </span>
          <Form.Select
            size="sm"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ width: '180px' }}
          >
            <option value="ALL">All Categories</option>
            {NOTE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </Form.Select>
        </div>
      </div>

      {/* Notes List */}
      {filteredNotes.length === 0 ? (
        <div className="text-muted p-4 bg-light rounded text-center border">
          No case notes found matching filter criteria.
        </div>
      ) : (
        <div className="d-flex flex-column gap-2">
          {filteredNotes.map((n) => (
            <CaseNoteCard key={n.id} note={n} />
          ))}
        </div>
      )}
    </div>
  )
}
