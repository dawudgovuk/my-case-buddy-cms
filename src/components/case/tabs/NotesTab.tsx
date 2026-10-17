import { useState } from 'react'
import { Card, Form, Button } from 'react-bootstrap'
import { useCasesStore } from '../../../store/casesStore'
import { useAuthStore } from '../../../store/authStore'
import { generateId } from '../../../services/storage'
import { toast } from '../../../store/toastStore'
import type { FamilyCase } from '../../../types/domain'
import CaseNoteCard from '../CaseNoteCard'

export interface NotesTabProps {
  caseId: string
}

export default function NotesTab({ caseId }: NotesTabProps) {
  const store = useCasesStore()
  const { user } = useAuthStore()
  const [author, setAuthor] = useState(user?.name || '')
  const [text, setText] = useState('')

  const fc = store.getById(caseId)
  if (!fc) return null
  const current = fc as FamilyCase

  function addNote() {
    if (!text.trim()) return
    const updated: FamilyCase = {
      ...current,
      notes: [
        ...current.notes,
        {
          id: generateId('NOTE'),
          createdAt: new Date().toISOString(),
          author: author.trim() || 'User',
          text: text.trim(),
        },
      ],
    }
    store.addOrUpdate(updated)
    toast.success('Case strategy note recorded.', 'Note Saved')
    setText('')
  }

  return (
    <div className="mb-3">
      <Card className="mb-3 p-3 shadow-sm border bg-white">
        <Card.Title className="h5 fw-bold mb-3">Add Case Note / Strategy Update</Card.Title>
        <Form>
          <Form.Group className="mb-2">
            <Form.Label className="small fw-semibold">Author (optional)</Form.Label>
            <Form.Control
              size="sm"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Your name"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="small fw-semibold">Note Content</Form.Label>
            <Form.Control
              size="sm"
              as="textarea"
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Record telephone attendance, discussions, or personal notes..."
            />
          </Form.Group>
          <Button variant="primary" size="sm" onClick={addNote} disabled={!text.trim()}>
            + Add Note
          </Button>
        </Form>
      </Card>

      {fc.notes.length === 0 && <div className="text-muted p-3 bg-light rounded">No notes recorded yet.</div>}

      {fc.notes.map((n) => (
        <CaseNoteCard key={n.id} note={n} />
      ))}
    </div>
  )
}
