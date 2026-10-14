import { useState } from 'react'
import { Card, Form, Row, Col, Button, Badge } from 'react-bootstrap'
import type { DocumentRecord } from '../../types/domain'
import { FaFileAlt, FaExternalLinkAlt, FaEdit, FaTrash } from 'react-icons/fa'

export interface DocumentCardProps {
  document: DocumentRecord
  onSave?: (updatedDocument: DocumentRecord) => void
  onDelete?: (documentId: string) => void
  readOnly?: boolean
  className?: string
}

export default function DocumentCard({
  document,
  onSave,
  onDelete,
  readOnly = false,
  className = '',
}: DocumentCardProps) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<DocumentRecord>({ ...document })

  if (editing && !readOnly) {
    return (
      <Card className={`mb-2 p-3 shadow-sm border bg-white ${className}`}>
        <Form as={Row} className="g-2 align-items-end">
          <Col md={5}>
            <Form.Group>
              <Form.Label className="small fw-semibold">Title</Form.Label>
              <Form.Control
                size="sm"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label className="small fw-semibold">Type</Form.Label>
              <Form.Select
                size="sm"
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as DocumentRecord['type'] }))}
              >
                {['Application', 'Statement', 'Medical', 'Expert Report', 'Bundle', 'Order', 'Other'].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label className="small fw-semibold">URL / File Link</Form.Label>
              <Form.Control
                size="sm"
                value={form.url}
                onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                placeholder="https://..."
              />
            </Form.Group>
          </Col>
          <Col xs={12}>
            <Form.Group>
              <Form.Label className="small fw-semibold">Notes (optional)</Form.Label>
              <Form.Control
                size="sm"
                as="textarea"
                rows={2}
                value={form.notes || ''}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </Form.Group>
          </Col>
          <Col xs={12} className="d-flex gap-2 justify-content-end mt-2">
            <Button
              variant="success"
              size="sm"
              onClick={() => {
                onSave?.(form)
                setEditing(false)
              }}
              disabled={!form.title.trim()}
            >
              Save
            </Button>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => {
                setForm({ ...document })
                setEditing(false)
              }}
            >
              Cancel
            </Button>
            {onDelete && (
              <Button variant="danger" size="sm" onClick={() => onDelete(document.id)}>
                Delete
              </Button>
            )}
          </Col>
        </Form>
      </Card>
    )
  }

  return (
    <Card className={`mb-2 p-3 border shadow-sm bg-white ${className}`}>
      <div className="d-flex justify-content-between align-items-start gap-2">
        <div className="min-width-0">
          <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
            <Badge bg="info" className="fw-semibold">
              <FaFileAlt className="me-1" size={10} />
              {document.type}
            </Badge>
            <h6 className="mb-0 fw-bold text-dark text-truncate">{document.title}</h6>
          </div>

          <div className="small text-muted mt-1 text-truncate">
            {document.url && document.url !== '#' ? (
              <a
                href={document.url}
                target="_blank"
                rel="noreferrer"
                className="text-primary text-decoration-none d-inline-flex align-items-center gap-1"
              >
                <span>{document.url}</span>
                <FaExternalLinkAlt size={10} />
              </a>
            ) : (
              <span className="text-secondary">File stored in secure repository</span>
            )}
            {document.uploadedAt && (
              <span className="ms-2 text-muted">• Uploaded {document.uploadedAt.slice(0, 10)}</span>
            )}
          </div>

          {document.notes && (
            <div className="small text-muted mt-2 p-2 bg-light rounded border-start border-3 border-info">
              {document.notes}
            </div>
          )}
        </div>

        {!readOnly && (
          <div className="d-flex gap-1 flex-shrink-0">
            {onSave && (
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => setEditing(true)}
                className="d-flex align-items-center gap-1"
              >
                <FaEdit size={12} />
                <span>Edit</span>
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => onDelete(document.id)}
                className="d-flex align-items-center gap-1"
              >
                <FaTrash size={12} />
                <span>Delete</span>
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
