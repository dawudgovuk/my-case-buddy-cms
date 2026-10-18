import { useState, useRef, type ChangeEvent, type DragEvent } from 'react'
import { Card, Form, Row, Col, Button, Badge, ProgressBar } from 'react-bootstrap'
import {
  FaFileUpload,
  FaFileAlt,
  FaBalanceScale,
  FaPaperclip,
  FaTimes,
  FaSearch,
  FaFilter,
} from 'react-icons/fa'
import { useCasesStore } from '../../../store/casesStore'
import { generateId } from '../../../services/storage'
import { toast } from '../../../store/toastStore'
import type { FamilyCase, DocumentRecord, DocumentFilingStatus } from '../../../types/domain'
import DocumentCard from '../DocumentCard'
import BundleComplianceModal from './BundleComplianceModal'
import { evaluateBundleCompliance, PD27A_MAX_PAGES } from '../../../utils/bundleCompliance'

export interface DocumentsTabProps {
  caseId: string
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function guessDocumentType(name: string): DocumentRecord['type'] {
  const lower = name.toLowerCase()
  if (lower.includes('c100') || lower.includes('application') || lower.includes('c1a') || lower.includes('c2')) {
    return 'Application'
  }
  if (lower.includes('statement') || lower.includes('position') || lower.includes('affidavit')) {
    return 'Statement'
  }
  if (lower.includes('medical') || lower.includes('gp') || lower.includes('hospital')) {
    return 'Medical'
  }
  if (lower.includes('report') || lower.includes('cafcass') || lower.includes('section 7') || lower.includes('expert')) {
    return 'Expert Report'
  }
  if (lower.includes('order') || lower.includes('injunction') || lower.includes('fhdra')) {
    return 'Order'
  }
  if (lower.includes('bundle')) {
    return 'Bundle'
  }
  return 'Other'
}

export default function DocumentsTab({ caseId }: DocumentsTabProps) {
  const store = useCasesStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form state
  const [title, setTitle] = useState('')
  const [type, setType] = useState<DocumentRecord['type']>('Application')
  const [status, setStatus] = useState<DocumentFilingStatus>('Draft')
  const [exhibitRef, setExhibitRef] = useState('')
  const [pageCount, setPageCount] = useState<number>(1)
  const [url, setUrl] = useState('')
  const [notes, setNotes] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  // Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('ALL')

  // Modal state
  const [showBundleModal, setShowBundleModal] = useState(false)

  const fc = store.getById(caseId)
  if (!fc) return null
  const current = fc as FamilyCase

  const bundleSummary = evaluateBundleCompliance(current.documents || [])
  const bundlePercent = Math.min(100, Math.round((bundleSummary.totalPages / PD27A_MAX_PAGES) * 100))

  const handleFileChosen = (file: File) => {
    setSelectedFile(file)
    const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
    if (!title.trim()) {
      setTitle(baseName.charAt(0).toUpperCase() + baseName.slice(1))
    }
    setType(guessDocumentType(file.name))

    // Estimate pages based on size if PDF (typical ~50-80KB per text page)
    if (file.type === 'application/pdf') {
      const estimatedPages = Math.max(1, Math.min(200, Math.round(file.size / 70000)))
      setPageCount(estimatedPages)
    } else {
      setPageCount(1)
    }
  }

  const onFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileChosen(file)
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFileChosen(file)
  }

  const clearSelectedFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function addDocument() {
    if (!title.trim()) return
    const newDocTitle = title.trim()

    let fileUrl = url.trim()
    if (!fileUrl && selectedFile) {
      // In local mode or mock environment, generate object URL or simulated path
      fileUrl = URL.createObjectURL(selectedFile)
    } else if (!fileUrl) {
      fileUrl = '#'
    }

    const newDoc: DocumentRecord = {
      id: generateId('DOC'),
      title: newDocTitle,
      type,
      uploadedAt: new Date().toISOString(),
      url: fileUrl,
      notes: notes.trim() || undefined,
      status,
      exhibitRef: exhibitRef.trim() || undefined,
      pageCount: Math.max(1, Number(pageCount) || 1),
      fileName: selectedFile ? selectedFile.name : undefined,
      fileSize: selectedFile ? selectedFile.size : undefined,
      mimeType: selectedFile ? selectedFile.type : undefined,
    }

    const updated: FamilyCase = {
      ...current,
      documents: [...(current.documents || []), newDoc],
    }

    store.addOrUpdate(updated)
    toast.success(`Document "${newDocTitle}" (${type}) added.`, 'Document Added')

    // Reset form
    setTitle('')
    setType('Application')
    setStatus('Draft')
    setExhibitRef('')
    setPageCount(1)
    setUrl('')
    setNotes('')
    clearSelectedFile()
  }

  // Filtered documents list
  const filteredDocs = (current.documents || []).filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.exhibitRef && doc.exhibitRef.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (doc.fileName && doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesType = filterType === 'ALL' || doc.type === filterType
    return matchesSearch && matchesType
  })

  return (
    <div className="d-flex flex-column gap-3">
      {/* Top Banner: PD 27A Bundle Compliance Bar */}
      <Card className="border shadow-sm bg-white p-3 rounded-3">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="p-2 rounded-circle bg-primary-subtle text-primary">
                <FaBalanceScale size={16} />
              </span>
              <div>
                <h6 className="fw-bold mb-0 text-dark">FPR Practice Direction 27A Court Bundle</h6>
                <div className="small text-muted">
                  Family Court bundles are limited to 350 pages and require sectioned pagination (Sections A–E).
                </div>
              </div>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2 w-100 w-md-auto justify-content-md-end flex-wrap">
            <div className="text-end me-2 d-none d-sm-block">
              <div className="small fw-semibold text-secondary">
                {bundleSummary.totalPages} / {PD27A_MAX_PAGES} pages ({bundlePercent}%)
              </div>
              <div style={{ width: '130px' }}>
                <ProgressBar
                  now={bundlePercent}
                  variant={bundleSummary.isCompliant ? (bundlePercent > 85 ? 'warning' : 'success') : 'danger'}
                  style={{ height: '6px' }}
                />
              </div>
            </div>

            <Button
              variant={bundleSummary.isCompliant ? 'outline-primary' : 'outline-danger'}
              size="sm"
              onClick={() => setShowBundleModal(true)}
              className="d-flex align-items-center gap-1 shadow-xs"
            >
              <FaBalanceScale size={12} />
              <span>PD 27A Bundle Auditor</span>
              <Badge
                bg={bundleSummary.isCompliant ? 'success' : 'danger'}
                pill
                className="ms-1 font-monospace"
                style={{ fontSize: '0.7rem' }}
              >
                {bundleSummary.totalPages} pp
              </Badge>
            </Button>
          </div>
        </div>
      </Card>

      {/* Add Document / Evidence Form */}
      <Card className="p-3 shadow-sm border bg-white rounded-3">
        <Card.Title className="h6 fw-bold mb-3 d-flex align-items-center gap-2 text-dark">
          <FaFileUpload className="text-primary" />
          <span>Upload Document & Register Evidence</span>
        </Card.Title>

        {/* Drag and Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-3 p-3 text-center mb-3 cursor-pointer transition-all ${
            isDragging ? 'border-primary bg-primary-subtle' : 'border-secondary-subtle bg-light'
          }`}
          style={{ cursor: 'pointer' }}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={onFileInputChange}
            className="d-none"
            accept=".pdf,.docx,.doc,.jpg,.jpeg,.png,.txt"
          />
          {selectedFile ? (
            <div className="d-flex align-items-center justify-content-center gap-2 py-1">
              <FaPaperclip className="text-success" />
              <span className="fw-semibold text-dark">{selectedFile.name}</span>
              <Badge bg="secondary" className="font-monospace">
                {formatFileSize(selectedFile.size)}
              </Badge>
              <Button
                variant="link"
                size="sm"
                className="text-danger p-0 ms-2"
                onClick={(e) => {
                  e.stopPropagation()
                  clearSelectedFile()
                }}
              >
                <FaTimes size={12} />
              </Button>
            </div>
          ) : (
            <div className="text-muted small py-1">
              <FaFileUpload className="mb-1 d-block mx-auto text-secondary" size={20} />
              <span className="fw-medium text-primary">Click to select file</span> or drag & drop here (PDF, DOCX, scans)
            </div>
          )}
        </div>

        <Form as={Row} className="g-2 align-items-end">
          <Col md={4}>
            <Form.Group>
              <Form.Label className="small fw-semibold">Title</Form.Label>
              <Form.Control
                size="sm"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. C100 Child Arrangements Application"
              />
            </Form.Group>
          </Col>

          <Col md={3}>
            <Form.Group>
              <Form.Label className="small fw-semibold">Type</Form.Label>
              <Form.Select
                value={type}
                onChange={(e) => setType(e.target.value as DocumentRecord['type'])}
                size="sm"
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
                value={status}
                onChange={(e) => setStatus(e.target.value as DocumentFilingStatus)}
                size="sm"
              >
                <option value="Draft">Draft</option>
                <option value="Filed">Filed</option>
                <option value="Served">Served</option>
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={1}>
            <Form.Group>
              <Form.Label className="small fw-semibold">Exhibit</Form.Label>
              <Form.Control
                size="sm"
                value={exhibitRef}
                onChange={(e) => setExhibitRef(e.target.value)}
                placeholder="JS1"
              />
            </Form.Group>
          </Col>

          <Col md={2}>
            <Form.Group>
              <Form.Label className="small fw-semibold">Pages</Form.Label>
              <Form.Control
                size="sm"
                type="number"
                min={1}
                value={pageCount}
                onChange={(e) => setPageCount(Math.max(1, Number(e.target.value) || 1))}
              />
            </Form.Group>
          </Col>

          <Col md={8}>
            <Form.Group>
              <Form.Label className="small fw-semibold">Document Notes / Exhibit Description</Form.Label>
              <Form.Control
                size="sm"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Summary, exhibit references, or court service instructions"
              />
            </Form.Group>
          </Col>

          <Col md={4} className="text-end">
            <Button
              variant="primary"
              size="sm"
              onClick={addDocument}
              disabled={!title.trim()}
              className="w-100 fw-semibold"
            >
              + Register Document
            </Button>
          </Col>
        </Form>
      </Card>

      {/* Filter and Search Bar */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2">
        <div className="d-flex align-items-center gap-2 w-100 w-sm-auto flex-grow-1">
          <div className="input-group input-group-sm">
            <span className="input-group-text bg-white border-end-0">
              <FaSearch size={11} className="text-muted" />
            </span>
            <Form.Control
              size="sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, exhibit ref (e.g. JS1), or filename..."
              className="border-start-0"
            />
          </div>
        </div>

        <div className="d-flex align-items-center gap-2 w-100 w-sm-auto">
          <span className="small text-muted d-flex align-items-center gap-1">
            <FaFilter size={10} />
            <span>Type:</span>
          </span>
          <Form.Select
            size="sm"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{ width: '150px' }}
          >
            <option value="ALL">All Types</option>
            {['Application', 'Statement', 'Medical', 'Expert Report', 'Bundle', 'Order', 'Other'].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Form.Select>
        </div>
      </div>

      {/* Documents List */}
      {filteredDocs.length === 0 ? (
        <Card className="border-dashed bg-light p-4 text-center text-muted">
          <FaFileAlt size={28} className="mb-2 text-secondary opacity-50 mx-auto" />
          <div className="fw-semibold">No case documents found</div>
          <div className="small">Upload applications, statements, exhibits, or expert reports above.</div>
        </Card>
      ) : (
        <div className="d-flex flex-column gap-2">
          {filteredDocs.map((d) => (
            <DocumentCard
              key={d.id}
              document={d}
              onSave={(updatedDoc) => {
                const updated: FamilyCase = {
                  ...current,
                  documents: (current.documents || []).map((doc) => (doc.id === d.id ? updatedDoc : doc)),
                }
                store.addOrUpdate(updated)
                toast.success(`Document "${updatedDoc.title}" details updated.`, 'Document Updated')
              }}
              onDelete={() => {
                const updated: FamilyCase = {
                  ...current,
                  documents: (current.documents || []).filter((doc) => doc.id !== d.id),
                }
                store.addOrUpdate(updated)
                toast.info(`Document "${d.title}" removed from case.`, 'Document Removed')
              }}
            />
          ))}
        </div>
      )}

      {/* PD 27A Bundle Auditor Modal */}
      <BundleComplianceModal
        show={showBundleModal}
        onHide={() => setShowBundleModal(false)}
        caseData={current}
      />
    </div>
  )
}
