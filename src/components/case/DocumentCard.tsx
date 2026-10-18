import { useState } from 'react'
import { Card, Form, Row, Col, Button, Badge, Dropdown } from 'react-bootstrap'
import type { DocumentRecord, DocumentFilingStatus } from '../../types/domain'
import {
  FaFileAlt,
  FaExternalLinkAlt,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaFilePdf,
  FaPaperclip,
} from 'react-icons/fa'

export interface DocumentCardProps {
  document: DocumentRecord
  onSave?: (updatedDocument: DocumentRecord) => void
  onDelete?: (documentId: string) => void
  readOnly?: boolean
  className?: string
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
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

  const handleQuickStatusChange = (newStatus: DocumentFilingStatus) => {
    if (!onSave) return
    onSave({
      ...document,
      status: newStatus,
    })
  }

  if (editing && !readOnly) {
    return (
      <Card className={`mb-2 p-3 shadow-sm border bg-white ${className}`}>
        <Form as={Row} className="g-2">
          <Col md={5}>
            <Form.Group>
              <Form.Label className="small fw-semibold">Title</Form.Label>
              <Form.Control
                size="sm"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. C100 Application"
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

          <Col md={2}>
            <Form.Group>
              <Form.Label className="small fw-semibold">Filing Status</Form.Label>
              <Form.Select
                size="sm"
                value={form.status || 'Draft'}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as DocumentFilingStatus }))}
              >
                <option value="Draft">Draft</option>
                <option value="Filed">Filed</option>
                <option value="Served">Served</option>
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={2}>
            <Form.Group>
              <Form.Label className="small fw-semibold">Exhibit Ref</Form.Label>
              <Form.Control
                size="sm"
                value={form.exhibitRef || ''}
                onChange={(e) => setForm((f) => ({ ...f, exhibitRef: e.target.value }))}
                placeholder="e.g. JS1"
              />
            </Form.Group>
          </Col>

          <Col md={3}>
            <Form.Group>
              <Form.Label className="small fw-semibold">Page Count</Form.Label>
              <Form.Control
                size="sm"
                type="number"
                min={1}
                value={form.pageCount || 1}
                onChange={(e) => setForm((f) => ({ ...f, pageCount: Number(e.target.value) || 1 }))}
              />
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group>
              <Form.Label className="small fw-semibold">File Name</Form.Label>
              <Form.Control
                size="sm"
                value={form.fileName || ''}
                onChange={(e) => setForm((f) => ({ ...f, fileName: e.target.value }))}
                placeholder="e.g. statement_signed.pdf"
              />
            </Form.Group>
          </Col>

          <Col md={5}>
            <Form.Group>
              <Form.Label className="small fw-semibold">URL / Storage Link</Form.Label>
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
              <Form.Label className="small fw-semibold">Notes / Evidence Summary</Form.Label>
              <Form.Control
                size="sm"
                as="textarea"
                rows={2}
                value={form.notes || ''}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Summary, witness details, or exhibit annotations"
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

  const status = document.status || 'Draft'
  const statusBadgeVariant = status === 'Served' ? 'success' : status === 'Filed' ? 'primary' : 'warning'

  return (
    <Card className={`mb-2 p-3 border shadow-sm bg-white ${className}`}>
      <div className="d-flex justify-content-between align-items-start gap-2">
        <div className="min-width-0 flex-grow-1">
          <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
            {/* Exhibit badge */}
            {document.exhibitRef && (
              <Badge bg="dark" className="font-monospace">
                [{document.exhibitRef}]
              </Badge>
            )}

            {/* Document Type Badge */}
            <Badge bg="info" className="fw-semibold">
              <FaFileAlt className="me-1" size={10} />
              {document.type}
            </Badge>

            {/* Status Badge */}
            <Badge bg={statusBadgeVariant} className="font-monospace">
              {status}
            </Badge>

            {/* Page Count */}
            <Badge bg="light" text="dark" className="border font-monospace">
              {document.pageCount || 1} {document.pageCount === 1 ? 'page' : 'pages'}
            </Badge>

            <h6 className="mb-0 fw-bold text-dark text-truncate">{document.title}</h6>
          </div>

          {/* File details & Link */}
          <div className="small text-muted mt-1 d-flex flex-wrap align-items-center gap-2">
            {document.fileName && (
              <span className="d-inline-flex align-items-center gap-1 text-secondary font-monospace">
                <FaPaperclip size={10} />
                <span>{document.fileName}</span>
                {document.fileSize ? `(${formatFileSize(document.fileSize)})` : ''}
              </span>
            )}

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
              <span className="text-secondary d-inline-flex align-items-center gap-1">
                <FaFilePdf size={11} className="text-danger" />
                <span>Encrypted local file</span>
              </span>
            )}

            {document.uploadedAt && (
              <span className="text-muted">• Uploaded {document.uploadedAt.slice(0, 10)}</span>
            )}
          </div>

          {document.notes && (
            <div className="small text-muted mt-2 p-2 bg-light rounded border-start border-3 border-info">
              {document.notes}
            </div>
          )}
        </div>

        {!readOnly && (
          <div className="d-flex align-items-center gap-1 flex-shrink-0">
            {/* Quick status selector */}
            {onSave && (
              <Dropdown align="end">
                <Dropdown.Toggle
                  variant="outline-secondary"
                  size="sm"
                  className="py-1 px-2 d-flex align-items-center gap-1"
                  style={{ fontSize: '0.78rem' }}
                >
                  <FaCheckCircle size={11} className={status === 'Served' ? 'text-success' : 'text-muted'} />
                  <span>{status}</span>
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => handleQuickStatusChange('Draft')}>
                    Set to Draft
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => handleQuickStatusChange('Filed')}>
                    Set to Filed (Court Submitted)
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => handleQuickStatusChange('Served')}>
                    Set to Served (Disclosed to Parties)
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )}

            {onSave && (
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => setEditing(true)}
                className="d-flex align-items-center gap-1 py-1 px-2"
                style={{ fontSize: '0.78rem' }}
              >
                <FaEdit size={11} />
                <span>Edit</span>
              </Button>
            )}

            {onDelete && (
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => onDelete(document.id)}
                className="d-flex align-items-center gap-1 py-1 px-2"
                style={{ fontSize: '0.78rem' }}
              >
                <FaTrash size={11} />
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
