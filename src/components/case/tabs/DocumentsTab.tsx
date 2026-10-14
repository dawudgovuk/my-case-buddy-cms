import { useState } from 'react'
import { Card, Form, Row, Col, Button } from 'react-bootstrap'
import { useCasesStore } from '../../../store/casesStore'
import { generateId } from '../../../services/storage'
import type { FamilyCase, DocumentRecord } from '../../../types/domain'
import DocumentCard from '../DocumentCard'

export interface DocumentsTabProps {
  caseId: string
}

export default function DocumentsTab({ caseId }: DocumentsTabProps) {
  const store = useCasesStore()
  const [title, setTitle] = useState('')
  const [type, setType] = useState<DocumentRecord['type']>('Application')
  const [url, setUrl] = useState('')
  const [notes, setNotes] = useState('')

  const fc = store.getById(caseId)
  if (!fc) return null
  const current = fc as FamilyCase

  function addDocument() {
    if (!title.trim()) return
    const updated: FamilyCase = {
      ...current,
      documents: [
        ...current.documents,
        {
          id: generateId('DOC'),
          title: title.trim(),
          type,
          uploadedAt: new Date().toISOString(),
          url: url.trim() || '#',
          notes: notes.trim() || undefined,
        },
      ],
    }
    store.addOrUpdate(updated)
    setTitle('')
    setUrl('')
    setNotes('')
  }

  return (
    <div className="mb-3">
      <Card className="mb-3 p-3 shadow-sm border bg-white">
        <Card.Title className="h5 fw-bold mb-3">Add Case Document / Evidence</Card.Title>
        <Form as={Row} className="g-2 align-items-end">
          <Col md={4}>
            <Form.Group>
              <Form.Label className="small fw-semibold">Title</Form.Label>
              <Form.Control
                size="sm"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. C100 Application"
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label className="small fw-semibold">Type</Form.Label>
              <Form.Select value={type} onChange={(e) => setType(e.target.value as DocumentRecord['type'])} size="sm">
                {['Application', 'Statement', 'Medical', 'Expert Report', 'Bundle', 'Order', 'Other'].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label className="small fw-semibold">URL / File Storage Link</Form.Label>
              <Form.Control
                size="sm"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
              />
            </Form.Group>
          </Col>
          <Col md={2} className="text-end">
            <Button variant="primary" size="sm" onClick={addDocument} disabled={!title.trim()} className="w-100">
              + Add Document
            </Button>
          </Col>
          <Col xs={12} className="mt-2">
            <Form.Group>
              <Form.Label className="small fw-semibold">Notes (optional)</Form.Label>
              <Form.Control
                size="sm"
                as="textarea"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Document summary, exhibits, or filing instructions"
              />
            </Form.Group>
          </Col>
        </Form>
      </Card>

      {fc.documents.length === 0 && <div className="text-muted p-3 bg-light rounded">No documents uploaded yet.</div>}

      {fc.documents.map((d) => (
        <DocumentCard
          key={d.id}
          document={d}
          onSave={(updatedDoc) => {
            const updated: FamilyCase = {
              ...current,
              documents: current.documents.map((doc) => (doc.id === d.id ? updatedDoc : doc)),
            }
            store.addOrUpdate(updated)
          }}
          onDelete={() => {
            const updated: FamilyCase = {
              ...current,
              documents: current.documents.filter((doc) => doc.id !== d.id),
            }
            store.addOrUpdate(updated)
          }}
        />
      ))}
    </div>
  )
}
